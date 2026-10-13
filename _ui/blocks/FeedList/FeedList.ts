import type { Post } from "../../../lib/content.ts";
import { escapeHtml } from "../../../lib/html.ts";

export function renderFeedList(posts: Post[]): string {
  return posts.map(renderFeedItem).join("\n");
}

function renderFeedItem(post: Post): string {
  const status = post.status?.toLowerCase() === "ongoing"
    ? `<ul style="padding-left: 20px; margin-top: 20px;" class="content-meta">\n            <li style="padding: 0 5px; border-radius: 10px;" class="content-meta-tag"><b>Status: </b>${capitalize(post.status)}</li>\n            </ul>\n            <p style="margin-top: 0px;" class="feed-title">${escapeHtml(post.title)}</p>`
    : `<p class="feed-title">${escapeHtml(post.title)}</p>`;

  return `<div class="feed-title-excerpt-block disable-select" data-url="https://richargh.de${escapeHtml(post.urlPath)}">
            <a href="${escapeHtml(post.urlPath)}" style="text-decoration: none; color: var(--color-text);">
            ${status}
            <p class="feed-excerpt">${escapeHtml(post.excerpt)}</p>
            </a>
        </div>`;
}

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}`;
}
