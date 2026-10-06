import type { Post } from "./content.ts";
import { escapeHtml } from "./html.ts";

export interface PostGroup {
  key: string;
  label: string;
  posts: Post[];
}

export function groupPostsByTag(posts: Post[]): PostGroup[] {
  const groups = new Map<string, Post[]>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const existing = groups.get(tag) ?? [];
      existing.push(post);
      groups.set(tag, existing);
    }
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "en", { sensitivity: "variant" }))
    .map(([tag, taggedPosts]) => ({
      key: tag,
      label: capitalize(tag),
      posts: sortPostsDescending(taggedPosts),
    }));
}

export function groupPostsByDate(posts: Post[]): PostGroup[] {
  const groups = new Map<string, Post[]>();

  for (const post of posts) {
    const key = formatDateAnchor(post.date);
    const existing = groups.get(key) ?? [];
    existing.push(post);
    groups.set(key, existing);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => dateFromAnchor(right).localeCompare(dateFromAnchor(left)))
    .map(([key, datedPosts]) => ({
      key,
      label: key,
      posts: sortPostsDescending(datedPosts),
    }));
}

export function renderGroupedPostIndex(groups: PostGroup[], options: { contentClass: string }): string {
  return `<main>
${groups.map((group) => renderGroup(group, options.contentClass)).join("\n")}
    <br/>
    <br/>
</main>`;
}

export function formatDateAnchor(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(date);
  return `${isoDate.slice(8, 10)}-${month}-${isoDate.slice(0, 4)}`;
}

function renderGroup(group: PostGroup, contentClass: string): string {
  return `    <h3 id="${escapeHtml(group.key)}">${escapeHtml(group.label)}</h3>
${group.posts.map((post) => `        <li class="${contentClass}" style="padding-bottom: 0.6em; list-style: none;"><a href="${escapeHtml(post.urlPath)}">${escapeHtml(post.title)}</a></li>`).join("\n")}`;
}

function sortPostsDescending(posts: Post[]): Post[] {
  return [...posts].sort((left, right) => right.date.localeCompare(left.date) || right.slug.localeCompare(left.slug));
}

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function dateFromAnchor(anchor: string): string {
  const match = anchor.match(/^(\d{2})-([A-Za-z]+)-(\d{4})$/);
  if (!match) return anchor;
  const month = new Date(`${match[2]} 1, 2000`).getMonth() + 1;
  return `${match[3]}-${String(month).padStart(2, "0")}-${match[1]}`;
}
