import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadTalks } from "../lib/talks.ts";

const outputDir = join("assets", "img", "thumbnails");
const thumbnailExtensions = ["jpg", "jpeg", "png", "webp", "avif"];
const youtubeThumbnailNames = ["maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"];

type VideoProvider = "youtube" | "vimeo";

interface VideoReference {
  provider: VideoProvider;
  id: string;
  url: string;
}

interface ThumbnailImage {
  bytes: Buffer;
  extension: string;
}

await mkdir(outputDir, { recursive: true });

const talks = await loadTalks();
const unsupportedVideoUrls: string[] = [];
const thumbnails = talks.flatMap((talk) =>
  talk.appearances.flatMap((appearance) => {
    if (!appearance.videoUrl) return [];

    const video = videoReference(appearance.videoUrl);
    if (!video) {
      unsupportedVideoUrls.push(`${appearance.title} (${appearance.videoUrl})`);
      return [];
    }

    return [{ appearance, video, outputBasePath: join(outputDir, `${talk.id}-${appearance.date}-${video.id}`) }];
  }),
);

for (const unsupported of unsupportedVideoUrls) {
  console.warn(`Unsupported video URL, no thumbnail fetched: ${unsupported}`);
}

if (thumbnails.length === 0) {
  console.log("No YouTube or Vimeo videos found in _data/talks.yaml");
  process.exit(0);
}

let fetched = 0;
let skipped = 0;
for (const thumbnail of thumbnails) {
  const existingPath = existingThumbnailPath(thumbnail.outputBasePath);
  if (existingPath) {
    skipped += 1;
    console.log(`Skipped existing ${existingPath}`);
    continue;
  }

  const image = await fetchBestThumbnail(thumbnail.video);
  if (!image) {
    console.warn(`No thumbnail found for ${thumbnail.appearance.title} (${thumbnail.appearance.videoUrl})`);
    continue;
  }

  const outputPath = `${thumbnail.outputBasePath}.${image.extension}`;
  await writeFile(outputPath, image.bytes);
  fetched += 1;
  console.log(`Fetched ${outputPath}`);
}

console.log(`Fetched ${fetched}/${thumbnails.length} supported video thumbnails; skipped ${skipped} existing thumbnails; unsupported ${unsupportedVideoUrls.length}`);

function existingThumbnailPath(outputBasePath: string): string | undefined {
  return thumbnailExtensions.map((extension) => `${outputBasePath}.${extension}`).find((path) => existsSync(path));
}

function videoReference(url: string): VideoReference | undefined {
  return youtubeVideoReference(url) ?? vimeoVideoReference(url);
}

function youtubeVideoReference(url: string): VideoReference | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  let id: string | undefined;
  if (host === "youtu.be") id = cleanVideoId(parsed.pathname.slice(1));
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (parsed.pathname === "/watch") id = cleanVideoId(parsed.searchParams.get("v") ?? "");
    if (parsed.pathname.startsWith("/embed/")) id = cleanVideoId(parsed.pathname.split("/")[2] ?? "");
    if (parsed.pathname.startsWith("/shorts/")) id = cleanVideoId(parsed.pathname.split("/")[2] ?? "");
  }

  return id ? { provider: "youtube", id, url } : undefined;
}

function vimeoVideoReference(url: string): VideoReference | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return undefined;

  const id = parsed.pathname.split("/").find((part) => /^\d+$/.test(part));
  return id ? { provider: "vimeo", id, url } : undefined;
}

function cleanVideoId(value: string): string | undefined {
  const id = value.trim();
  return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : undefined;
}

async function fetchBestThumbnail(video: VideoReference): Promise<ThumbnailImage | undefined> {
  if (video.provider === "youtube") return fetchBestYoutubeThumbnail(video.id);
  return fetchVimeoThumbnail(video.url);
}

async function fetchBestYoutubeThumbnail(videoId: string): Promise<ThumbnailImage | undefined> {
  for (const thumbnailName of youtubeThumbnailNames) {
    const url = `https://img.youtube.com/vi/${videoId}/${thumbnailName}`;
    const image = await fetchImage(url, "jpg");
    if (!image) continue;
    if (isMissingThumbnail(image.bytes)) continue;
    return image;
  }

  return undefined;
}

async function fetchVimeoThumbnail(videoUrl: string): Promise<ThumbnailImage | undefined> {
  const video = vimeoVideoReference(videoUrl);
  const candidateUrls = [
    ...(await vimeoOembedThumbnailUrls(videoUrl)),
    ...(video ? await vimeoApiV2ThumbnailUrls(video.id) : []),
    ...(video ? [`https://vumbnail.com/${video.id}.jpg`] : []),
  ];

  for (const thumbnailUrl of candidateUrls) {
    const image = await fetchImage(thumbnailUrl);
    if (image) return image;
  }

  return undefined;
}

async function vimeoOembedThumbnailUrls(videoUrl: string): Promise<string[]> {
  const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`;
  let response: Response;
  try {
    response = await fetch(oembedUrl);
  } catch (error) {
    console.warn(`Could not fetch Vimeo oEmbed for ${videoUrl}: ${error}`);
    return [];
  }
  if (!response.ok) return [];

  const data = await response.json() as { thumbnail_url?: unknown; thumbnail_url_with_play_button?: unknown };
  return [data.thumbnail_url, data.thumbnail_url_with_play_button].filter((url): url is string => typeof url === "string");
}

async function vimeoApiV2ThumbnailUrls(videoId: string): Promise<string[]> {
  const apiUrl = `https://vimeo.com/api/v2/video/${videoId}.json`;
  let response: Response;
  try {
    response = await fetch(apiUrl);
  } catch (error) {
    console.warn(`Could not fetch Vimeo API v2 metadata for ${videoId}: ${error}`);
    return [];
  }
  if (!response.ok) return [];

  const data = await response.json() as Array<Record<string, unknown>>;
  const first = data[0];
  if (!first) return [];
  return [first.thumbnail_large, first.thumbnail_medium, first.thumbnail_small].filter((url): url is string => typeof url === "string");
}

async function fetchImage(url: string, fallbackExtension?: string): Promise<ThumbnailImage | undefined> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        // Prefer broadly supported static-site image formats. Vimeo may still return AVIF;
        // in that case we keep the real extension and the generated page can use it.
        Accept: "image/jpeg,image/png,image/webp,image/avif;q=0.8,*/*;q=0.5",
      },
    });
  } catch (error) {
    console.warn(`Could not fetch image ${url}: ${error}`);
    return undefined;
  }
  if (!response.ok) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) return undefined;

  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    extension: extensionForContentType(contentType) ?? fallbackExtension ?? extensionFromUrl(url) ?? "jpg",
  };
}

function extensionForContentType(contentType: string): string | undefined {
  const normalized = contentType.toLowerCase().split(";")[0]?.trim();
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "image/avif") return "avif";
  return undefined;
}

function extensionFromUrl(url: string): string | undefined {
  const pathname = new URL(url).pathname.toLowerCase();
  const match = pathname.match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];
  return extension === "jpeg" ? "jpg" : extension;
}

function isMissingThumbnail(bytes: Buffer): boolean {
  // YouTube can return a tiny placeholder image for unavailable maxresdefault thumbnails.
  return bytes.byteLength < 1_000;
}
