export function outputPathForUrlPath(urlPath: string): string[] {
  const normalized = normalizeUrlPath(urlPath);
  const relative = normalized.replace(/^\/+/, "");
  if (relative === "") return ["index.html"];
  if (normalized.endsWith("/")) return [...relative.slice(0, -1).split("/"), "index.html"];
  return [`${relative}.html`];
}

export function outputKeyForUrlPath(urlPath: string): string {
  return outputPathForUrlPath(urlPath).join("/");
}

function normalizeUrlPath(urlPath: string): string {
  if (!urlPath.startsWith("/")) throw new Error(`URL path must be absolute: ${urlPath}`);
  if (urlPath.startsWith("//")) throw new Error(`URL path must not start with //: ${urlPath}`);
  if (urlPath.includes("?")) throw new Error(`URL path must not contain a query string: ${urlPath}`);
  if (urlPath.includes("#")) throw new Error(`URL path must not contain a fragment: ${urlPath}`);
  if (urlPath.split("/").some((segment) => segment === "." || segment === "..")) {
    throw new Error(`URL path must not contain dot segments: ${urlPath}`);
  }
  return urlPath;
}
