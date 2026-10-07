import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { extname, join, posix, relative, sep } from "node:path";
import { site } from "./config.ts";

interface GeneratedFile {
  filePath: string;
  urlPath: string;
  isHtml: boolean;
}

interface InternalTarget {
  path: string;
  fragment?: string;
}

interface GeneratedSiteIndex {
  files: GeneratedFile[];
  existingUrlPaths: Set<string>;
  htmlFileByUrlPath: Map<string, string>;
}

const linkAttributePattern = /\b(?:href|src)="([^"]+)"/g;
const idAttributePattern = /\bid="([^"]+)"/g;
const ignoredSchemes = /^(?:https?:|mailto:|tel:|data:|javascript:)/i;

// This article is linked from a published post but remains an unpublished draft.
// Keep the exception explicit so newly broken internal links fail generation.
const intentionallyUnresolvedLinks = new Set(["/posts/Getting-Started-with-Hypermedia"]);

export async function assertGeneratedLinksResolve(outputDir: string): Promise<void> {
  const siteIndex = await buildGeneratedSiteIndex(outputDir);
  const failures = siteIndex.files
    .filter((file) => file.isHtml)
    .flatMap((file) => checkHtmlFileLinks(file, siteIndex));

  if (failures.length > 0) {
    throw new Error(`Generated internal link check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }
}

async function buildGeneratedSiteIndex(outputDir: string): Promise<GeneratedSiteIndex> {
  const filePaths = await collectFiles(outputDir);
  const files = filePaths.map((filePath) => toGeneratedFile(outputDir, filePath));

  return {
    files,
    existingUrlPaths: new Set(files.flatMap((file) => urlAliases(file.urlPath))),
    htmlFileByUrlPath: new Map(htmlFiles(files).flatMap((file) => urlAliases(file.urlPath).map((urlPath) => [urlPath, file.filePath]))),
  };
}

function checkHtmlFileLinks(file: GeneratedFile, siteIndex: GeneratedSiteIndex): string[] {
  const html = readFileSync(file.filePath, "utf8");
  const currentDirectory = directoryForUrlPath(file.urlPath);
  const failures: string[] = [];

  for (const rawTarget of extractLinkTargets(html)) {
    const target = parseInternalTarget(rawTarget, file.urlPath, currentDirectory);
    if (target === undefined) continue;
    if (isAllowedMissingLink(target.path)) continue;

    if (!siteIndex.existingUrlPaths.has(target.path)) {
      failures.push(`${file.filePath}: unresolved internal link ${rawTarget}`);
      continue;
    }

    if (target.fragment !== undefined && target.fragment !== "") {
      failures.push(...checkAnchorTarget(file.filePath, rawTarget, target, siteIndex));
    }
  }

  return failures;
}

function checkAnchorTarget(sourceFilePath: string, rawTarget: string, target: InternalTarget, siteIndex: GeneratedSiteIndex): string[] {
  const targetHtmlPath = siteIndex.htmlFileByUrlPath.get(target.path);
  if (targetHtmlPath === undefined) return [`${sourceFilePath}: anchor target is not an HTML page: ${rawTarget}`];
  if (!htmlContainsId(targetHtmlPath, target.fragment ?? "")) return [`${sourceFilePath}: unresolved anchor ${rawTarget}`];
  return [];
}

async function collectFiles(directory: string): Promise<string[]> {
  if (!existsSync(directory)) return [];

  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    if (entry.isFile()) return [path];
    return [];
  }));

  return nestedFiles.flat().sort();
}

function toGeneratedFile(outputDir: string, filePath: string): GeneratedFile {
  return {
    filePath,
    urlPath: urlPathForGeneratedFile(outputDir, filePath),
    isHtml: extname(filePath) === ".html",
  };
}

function urlPathForGeneratedFile(outputDir: string, filePath: string): string {
  const generatedPath = relative(outputDir, filePath).split(sep).join("/");

  if (generatedPath === "index.html") return "/";
  if (generatedPath === "404.html") return "/404.html";
  if (generatedPath.endsWith("/index.html")) return `/${generatedPath.slice(0, -"index.html".length)}`;
  if (generatedPath.endsWith(".html")) return `/${generatedPath.slice(0, -".html".length)}`;

  return `/${generatedPath}`;
}

function extractLinkTargets(html: string): string[] {
  return [...html.matchAll(linkAttributePattern)].map((match) => decodeHtml(match[1]));
}

function parseInternalTarget(rawTarget: string, currentUrlPath: string, currentDirectory: string): InternalTarget | undefined {
  if (shouldIgnoreTarget(rawTarget)) return undefined;

  const target = rawTarget.startsWith(site.url) ? rawTarget.slice(site.url.length) : rawTarget;
  if (ignoredSchemes.test(target)) return undefined;

  const [pathAndQuery, fragment] = target.split("#", 2);
  const [pathWithoutQuery] = pathAndQuery.split("?", 1);
  const path = resolvePath(pathWithoutQuery, currentUrlPath, currentDirectory);

  return { path, fragment };
}

function shouldIgnoreTarget(rawTarget: string): boolean {
  return rawTarget === "" || rawTarget === "#" || rawTarget.includes("{url}");
}

function resolvePath(path: string, currentUrlPath: string, currentDirectory: string): string {
  if (path === "") return currentUrlPath;
  if (path.startsWith("/")) return normalizeUrlPath(path);
  return normalizeUrlPath(posix.join(currentDirectory, path));
}

function directoryForUrlPath(urlPath: string): string {
  return urlPath.endsWith("/") ? urlPath : posix.dirname(urlPath);
}

function htmlFiles(files: GeneratedFile[]): GeneratedFile[] {
  return files.filter((file) => file.isHtml);
}

function urlAliases(urlPath: string): string[] {
  if (urlPath !== "/" && urlPath.endsWith("/")) return [urlPath, urlPath.slice(0, -1)];
  return [urlPath];
}

function isAllowedMissingLink(urlPath: string): boolean {
  return intentionallyUnresolvedLinks.has(urlPath);
}

function normalizeUrlPath(path: string): string {
  const normalized = posix.normalize(path);
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function htmlContainsId(filePath: string, id: string): boolean {
  const html = readFileSync(filePath, "utf8");
  return [...html.matchAll(idAttributePattern)].some((match) => decodeHtml(match[1]) === id);
}

function decodeHtml(value: string): string {
  return value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
}
