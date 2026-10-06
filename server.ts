import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";
const generatedDir = resolve("generated");

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
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
  ".svg": "image/svg+xml"
};

function contentType(path: string): string {
  return contentTypes[extname(path).toLowerCase()] ?? "application/octet-stream";
}

function insideGenerated(path: string): boolean {
  return path === generatedDir || path.startsWith(`${generatedDir}${sep}`);
}

function candidatePaths(pathname: string): string[] {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\/+/, "");
  const basePath = resolve(generatedDir, relativePath || "index.html");

  if (!insideGenerated(basePath)) return [];
  if (extname(basePath)) return [basePath];

  return [
    join(basePath, "index.html"),
    `${basePath}.html`
  ];
}

async function readFirstExisting(paths: string[]): Promise<{ path: string; bytes: Buffer } | undefined> {
  for (const path of paths) {
    try {
      return { path, bytes: await readFile(path) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);

  try {
    const file = await readFirstExisting(candidatePaths(url.pathname));

    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not Found. Run `npm run generate` first if generated/ is missing.");
      return;
    }

    response.writeHead(200, { "content-type": contentType(file.path) });
    response.end(file.bytes);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.stack : String(error));
  }
});

server.listen(port, host, () => {
  console.log(`Serving generated/ at http://${host}:${port}/`);
});
