import { readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "image-size";
import { escapeHtml } from "../../../lib/html.ts";

export interface AssetImageOptions {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
}

const assetsDirectory = fileURLToPath(new URL("../../../assets/", import.meta.url));
const dimensionsCache = new Map<string, { width: number; height: number; mtimeMs: number; size: number }>();

export function renderAssetImage({ src, alt, className, lazy = false }: AssetImageOptions): string {
  if (!src.startsWith("/assets/")) throw new Error(`AssetImage requires a local /assets/ image: ${src}`);
  const pathname = decodeURIComponent(src.split(/[?#]/)[0]);
  const path = resolve(assetsDirectory, pathname.slice("/assets/".length));
  const assetPath = relative(assetsDirectory, path);
  if (assetPath === ".." || assetPath.startsWith("../") || isAbsolute(assetPath)) {
    throw new Error(`AssetImage path must stay inside assets: ${src}`);
  }

  // Check existence on every render; reuse dimensions until the source changes.
  const { mtimeMs, size } = statSync(path);
  let dimensions = dimensionsCache.get(path);
  if (!dimensions || dimensions.mtimeMs !== mtimeMs || dimensions.size !== size) {
    const { width, height } = imageSize(readFileSync(path));
    if (!(width > 0 && height > 0)) throw new Error(`AssetImage cannot determine dimensions: ${src}`);
    dimensions = { width, height, mtimeMs, size };
    dimensionsCache.set(path, dimensions);
  }

  const classAttribute = className === undefined ? "" : ` class="${escapeHtml(className)}"`;
  const loadingAttribute = lazy ? ' loading="lazy"' : "";
  return `<img${classAttribute} src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${loadingAttribute} width="${dimensions.width}" height="${dimensions.height}">`;
}
