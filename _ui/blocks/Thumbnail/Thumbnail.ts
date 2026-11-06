import { escapeHtml } from "../../../lib/html.ts";
import { renderAssetImage } from "../AssetImage/AssetImage.ts";

export interface ThumbnailOptions {
  src?: string;
  alt?: string;
  href?: string;
  label?: string;
  playable?: boolean;
  playLabel?: string;
  tags?: string[];
}

export function renderThumbnail({ src, alt = "", href, label, playable = false, playLabel, tags = [] }: ThumbnailOptions): string {
  const content = `${src ? renderAssetImage({ src, alt, className: "thumbnail-image", lazy: true }) : ""}
${href && playable ? `<span class="thumbnail-play" aria-hidden="true"><span class="thumbnail-play-icon">▶</span>${playLabel ? `<span class="thumbnail-play-label">${escapeHtml(playLabel)}</span>` : ""}</span>` : ""}
${tags.length ? `<div class="thumbnail-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}`;
  if (href) return `<a class="thumbnail${playable ? " thumbnail-playable" : ""}" href="${escapeHtml(href)}" aria-label="${escapeHtml(label ?? (alt || (playable ? "Play video" : "Open image")))}">${content}</a>`;
  return `<div class="thumbnail">${content}</div>`;
}
