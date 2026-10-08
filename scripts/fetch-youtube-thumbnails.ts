import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadTalks } from "../lib/talks.ts";

const outputDir = join("assets", "img", "thumbnails");
const thumbnailNames = ["maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"];

await mkdir(outputDir, { recursive: true });

const talks = await loadTalks();
const thumbnails = talks.flatMap((talk) =>
  talk.appearances.flatMap((appearance) => {
    const videoId = appearance.videoUrl ? youtubeVideoId(appearance.videoUrl) : undefined;
    if (!videoId) return [];
    return [{ appearance, videoId, outputPath: join(outputDir, `${talk.id}-${appearance.date}-${videoId}.jpg`) }];
  }),
);

if (thumbnails.length === 0) {
  console.log("No YouTube videos found in _data/talks.yaml");
  process.exit(0);
}

let fetched = 0;
for (const thumbnail of thumbnails) {
  const bytes = await fetchBestThumbnail(thumbnail.videoId);
  if (!bytes) {
    console.warn(`No thumbnail found for ${thumbnail.appearance.title} (${thumbnail.appearance.videoUrl})`);
    continue;
  }

  await writeFile(thumbnail.outputPath, bytes);
  fetched += 1;
  console.log(`Fetched ${thumbnail.outputPath}`);
}

console.log(`Fetched ${fetched}/${thumbnails.length} YouTube thumbnails`);

function youtubeVideoId(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be") return cleanVideoId(parsed.pathname.slice(1));
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (parsed.pathname === "/watch") return cleanVideoId(parsed.searchParams.get("v") ?? "");
    if (parsed.pathname.startsWith("/embed/")) return cleanVideoId(parsed.pathname.split("/")[2] ?? "");
    if (parsed.pathname.startsWith("/shorts/")) return cleanVideoId(parsed.pathname.split("/")[2] ?? "");
  }

  return undefined;
}

function cleanVideoId(value: string): string | undefined {
  const id = value.trim();
  return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : undefined;
}

async function fetchBestThumbnail(videoId: string): Promise<Buffer | undefined> {
  for (const thumbnailName of thumbnailNames) {
    const url = `https://img.youtube.com/vi/${videoId}/${thumbnailName}`;
    const response = await fetch(url);
    if (!response.ok) continue;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) continue;

    const bytes = Buffer.from(await response.arrayBuffer());
    if (isMissingThumbnail(bytes)) continue;
    return bytes;
  }

  return undefined;
}

function isMissingThumbnail(bytes: Buffer): boolean {
  // YouTube can return a tiny placeholder image for unavailable maxresdefault thumbnails.
  return bytes.byteLength < 1_000;
}
