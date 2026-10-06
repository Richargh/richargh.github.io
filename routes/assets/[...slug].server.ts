import { readdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const assetsDir = resolve("assets");

const mediaTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
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
  return (await listAssetFiles(assetsDir)).map((slug) => ({ params: { slug } }));
}

export async function render({ params }: { params: { slug: string } }): Promise<Response> {
  return assetResponse(params.slug);
}

export async function assetResponse(slug: string): Promise<Response> {
  if (slug.includes("\0")) return new Response("Bad Request", { status: 400 });
  const file = resolve(assetsDir, slug);
  if (!isInsideAssets(file)) return new Response("Forbidden", { status: 403 });

  try {
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

function isInsideAssets(path: string): boolean {
  return path === assetsDir || path.startsWith(`${assetsDir}${sep}`);
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
