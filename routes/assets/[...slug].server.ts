import { readdir, readFile } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
import { buildCssBundle } from "../../scripts/build-css.ts";
import { discoverElementModules } from "../../scripts/copy-elements.ts";

const assetsDir = resolve("assets");
const uiDir = resolve("_ui");

const mediaTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function getStaticPaths(): Promise<Array<{ params: { slug: string } }>> {
  const paths = await listAssetFiles(assetsDir);
  paths.push(...(await discoverElementModules(uiDir)).map((path) => `elements/${path.split(/[\\/]/).at(-1)}`));
  if (!paths.includes("css/style.css")) paths.push("css/style.css");
  return paths.sort().map((slug) => ({ params: { slug } }));
}

export async function render({ params }: { params: { slug: string } }): Promise<Response> {
  return assetResponse(params.slug);
}

export async function assetResponse(slug: string): Promise<Response> {
  if (slug.includes("\0")) return new Response("Bad Request", { status: 400 });
  const file = await assetFileForSlug(slug);
  if (!file) return new Response("Forbidden", { status: 403 });

  try {
    if (slug === "css/style.css") {
      return new Response(await buildCssBundle(), { headers: { "content-type": mediaType(file) } });
    }

    const bytes = await readFile(file);
    return new Response(bytes, { headers: { "content-type": mediaType(file) } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Response("Not Found", { status: 404 });
    throw error;
  }
}

export function mediaType(path: string): string {
  return mediaTypes[extname(path).toLowerCase()] ?? "application/octet-stream";
}

async function assetFileForSlug(slug: string): Promise<string | undefined> {
  if (slug.startsWith("elements/")) {
    const elementName = slug.slice("elements/".length);
    if (elementName.includes("/")) return undefined;
    return (await discoverElementModules(uiDir)).find((file) => basename(file) === elementName);
  }

  const file = resolve(assetsDir, slug);
  return isInside(file, assetsDir) ? file : undefined;
}

function isInside(path: string, directory: string): boolean {
  return path === directory || path.startsWith(`${directory}${sep}`);
}

async function listAssetFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const slug = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listAssetFiles(resolve(dir, entry.name), slug));
    else if (entry.isFile()) files.push(slug);
  }
  return files.sort();
}
