import type { Post } from "../../../lib/content.ts";
import { escapeHtml } from "../../../lib/html.ts";

export function renderPostMeta(post: Post): string {
  const status = post.status ? `<li><a href="javascript:void(0)" class="content-meta-tag"><b>Status:</b> <i>${escapeHtml(capitalize(post.status))}</i></a></li>` : "";
  const dateLabel = formatDateLabel(post.date);
  const dateAnchor = formatDateAnchor(post.date);
  const metaTags = post.tags.map((tag) => `<li><a href="/tags/#${encodeURIComponent(tag)}" class="content-meta-tag">${escapeHtml(tag)}</a></li>`).join("");
  return `<ul class="content-meta">${status}<li><a href="/dates/#${dateAnchor}" class="content-meta-tag">${dateLabel}</a></li>${metaTags}</ul>`;
}

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(date);
  return `${month}-${isoDate.slice(8, 10)}-${isoDate.slice(0, 4)}`;
}

function formatDateAnchor(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(date);
  return `${isoDate.slice(8, 10)}-${month}-${isoDate.slice(0, 4)}`;
}
