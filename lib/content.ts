import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { convertAsciiDocFragment } from "./asciidoc.ts";
import { splitFrontMatter } from "./frontmatter.ts";
import { outputKeyForUrlPath } from "./output-compat.ts";

export interface Post {
  sourcePath: string;
  title: string;
  date: string;
  slug: string;
  urlPath: string;
  tags: string[];
  status?: string;
  comments: boolean;
  html: string;
  excerpt: string;
}

export interface Page {
  sourcePath: string;
  title: string;
  slug: string;
  urlPath: string;
  comments: boolean;
  html: string;
  excerpt: string;
}

export interface LoadPostsOptions {
  postsDir?: string;
  buildDate?: Date | string;
  warn?: (message: string) => void;
  validate?: boolean;
}

export interface PostInventoryEntry {
  sourcePath: string;
  status: "published" | "future" | "invalid-name";
  date?: string;
  title?: string;
  urlPath?: string;
}

export const selectedPostPath = "_posts/2025-01-25-AI-Waste.adoc";

export async function loadSelectedPost(): Promise<Post> {
  return loadPost(selectedPostPath);
}

export async function loadAllPosts(options: LoadPostsOptions = {}): Promise<Post[]> {
  const postsDir = options.postsDir ?? "_posts";
  const buildDate = dateOnly(options.buildDate ?? new Date());
  const warn = options.warn ?? console.warn;
  const names = await readdir(postsDir);
  const posts: Post[] = [];

  for (const name of names.toSorted()) {
    if (!isDatedPostFile(name)) continue;

    const sourcePath = join(postsDir, name);
    const inferred = inferPostMetadata(sourcePath);
    if (inferred.date > buildDate) {
      warn(`Excluding future post ${sourcePath} dated ${inferred.date}`);
      continue;
    }

    posts.push(await loadPost(sourcePath));
  }

  const sorted = posts.sort((left, right) => right.date.localeCompare(left.date) || right.slug.localeCompare(left.slug));
  if (options.validate !== false) validatePosts(sorted);
  return sorted;
}

export async function loadAllPages(pagesDir = "_pages"): Promise<Page[]> {
  const names = await readdir(pagesDir);
  const pages: Page[] = [];

  for (const name of names.toSorted()) {
    if (!name.endsWith(".adoc")) continue;
    pages.push(await loadPage(join(pagesDir, name)));
  }

  validatePages(pages);
  return pages.sort((left, right) => left.title.localeCompare(right.title));
}

export async function loadPage(sourcePath: string): Promise<Page> {
  const source = await readFile(sourcePath, "utf8");
  const { attributes, body } = splitFrontMatter(source);
  const slug = basename(sourcePath, ".adoc");
  const title = stringAttribute(attributes.title) ?? titleFromSlug(slug);
  const permalink = stringAttribute(attributes.permalink);
  const html = convertAsciiDocFragment(body);

  return {
    sourcePath,
    title,
    slug,
    urlPath: permalink ?? `/${slug}/`,
    comments: booleanAttribute(attributes.comments) ?? false,
    html,
    excerpt: excerptFromHtml(html),
  };
}

export function validatePages(pages: Page[]): void {
  assertUnique(pages, (page) => page.title, "duplicate page title");
  assertUnique(pages, (page) => page.urlPath, "duplicate page URL");
  assertUnique(pages, (page) => page.urlPath.toLocaleLowerCase("en-US"), "case-folded duplicate page URL");
  assertUnique(pages, (page) => outputKeyForUrlPath(page.urlPath), "duplicate generated page output path");
  assertUnique(pages, (page) => outputKeyForUrlPath(page.urlPath).toLocaleLowerCase("en-US"), "case-folded duplicate generated page output path");
}

export async function inventoryPosts(options: LoadPostsOptions = {}): Promise<PostInventoryEntry[]> {
  const postsDir = options.postsDir ?? "_posts";
  const buildDate = dateOnly(options.buildDate ?? new Date());
  const names = await readdir(postsDir);
  const inventory: PostInventoryEntry[] = [];

  for (const name of names.toSorted()) {
    const sourcePath = join(postsDir, name);
    if (!isDatedPostFile(name)) {
      if (name.endsWith(".adoc")) inventory.push({ sourcePath, status: "invalid-name" });
      continue;
    }

    const inferred = inferPostMetadata(sourcePath);
    if (inferred.date > buildDate) {
      inventory.push({ sourcePath, status: "future", date: inferred.date, title: inferred.title, urlPath: `/posts/${inferred.title}` });
      continue;
    }

    const post = await loadPost(sourcePath);
    inventory.push({ sourcePath, status: "published", date: post.date, title: post.title, urlPath: post.urlPath });
  }

  return inventory;
}

export async function loadPost(sourcePath: string): Promise<Post> {
  const source = await readFile(sourcePath, "utf8");
  const { attributes, body } = splitFrontMatter(source);
  const inferred = inferPostMetadata(sourcePath);
  const title = stringAttribute(attributes.title) ?? inferred.title;
  const slug = inferred.title;
  const permalink = stringAttribute(attributes.permalink);
  const html = convertAsciiDocFragment(body);

  return {
    sourcePath,
    title,
    date: inferred.date,
    slug,
    urlPath: permalink ?? `/posts/${slug}`,
    tags: normalizeTags(attributes.tags),
    status: stringAttribute(attributes.status),
    comments: booleanAttribute(attributes.comments) ?? true,
    html,
    excerpt: excerptFromHtml(html),
  };
}

export function inferPostMetadata(sourcePath: string): { date: string; title: string } {
  const match = basename(sourcePath).match(/^(\d{4}-\d{2}-\d{2})-(.+)\.adoc$/);
  if (!match) throw new Error(`Post path does not follow dated post naming convention: ${sourcePath}`);
  if (!isValidIsoDate(match[1])) throw new Error(`Post path contains an invalid date: ${sourcePath}`);
  return { date: match[1], title: match[2] };
}

export function validatePosts(posts: Post[]): void {
  assertUnique(posts, (post) => post.title, "duplicate post title");
  assertUnique(posts, (post) => post.urlPath, "duplicate post URL");
  assertUnique(posts, (post) => post.urlPath.toLocaleLowerCase("en-US"), "case-folded duplicate post URL");
  assertUnique(posts, (post) => outputKeyForUrlPath(post.urlPath), "duplicate generated post output path");
  assertUnique(posts, (post) => outputKeyForUrlPath(post.urlPath).toLocaleLowerCase("en-US"), "case-folded duplicate generated post output path");
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string");
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
}

export function excerptFromHtml(html: string, length = 200): string {
  const text = html
    .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();

  return truncate(text, length);
}

function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  if (length <= 3) return ".".repeat(length);
  return `${value.slice(0, length - 3)}...`;
}

function isDatedPostFile(name: string): boolean {
  return /^\d{4}-\d{2}-\d{2}-.+\.adoc$/.test(name);
}

function isValidIsoDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function assertUnique<T extends { sourcePath: string }>(items: T[], keyFor: (item: T) => string, label: string): void {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = keyFor(item);
    const previous = seen.get(key);
    if (previous) throw new Error(`${label}: ${key} in ${previous.sourcePath} and ${item.sourcePath}`);
    seen.set(key, item);
  }
}

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function dateOnly(value: Date | string): string {
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) throw new Error(`Build date must start with YYYY-MM-DD: ${value}`);
    return match[0];
  }
  return value.toISOString().slice(0, 10);
}

function stringAttribute(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function booleanAttribute(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}
