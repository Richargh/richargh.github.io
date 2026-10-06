import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { convertAsciiDocFragment } from "./asciidoc.ts";
import { splitFrontMatter } from "./frontmatter.ts";

export interface Post {
  sourcePath: string;
  title: string;
  date: string;
  slug: string;
  urlPath: string;
  tags: string[];
  status?: string;
  comments: boolean;
  html: string;
  excerpt: string;
}

export interface LoadPostsOptions {
  postsDir?: string;
  buildDate?: Date | string;
  warn?: (message: string) => void;
}

export const selectedPostPath = "_posts/2025-01-25-AI-Waste.adoc";

export async function loadSelectedPost(): Promise<Post> {
  return loadPost(selectedPostPath);
}

export async function loadAllPosts(options: LoadPostsOptions = {}): Promise<Post[]> {
  const postsDir = options.postsDir ?? "_posts";
  const buildDate = dateOnly(options.buildDate ?? new Date());
  const warn = options.warn ?? console.warn;
  const names = await readdir(postsDir);
  const posts: Post[] = [];

  for (const name of names.toSorted()) {
    if (!isDatedPostFile(name)) continue;

    const sourcePath = join(postsDir, name);
    const inferred = inferPostMetadata(sourcePath);
    if (inferred.date > buildDate) {
      warn(`Excluding future post ${sourcePath} dated ${inferred.date}`);
      continue;
    }

    posts.push(await loadPost(sourcePath));
  }

  return posts.sort((left, right) => right.date.localeCompare(left.date) || right.slug.localeCompare(left.slug));
}

export async function loadPost(sourcePath: string): Promise<Post> {
  const source = await readFile(sourcePath, "utf8");
  const { attributes, body } = splitFrontMatter(source);
  const inferred = inferPostMetadata(sourcePath);
  const title = stringAttribute(attributes.title) ?? inferred.title;
  const slug = inferred.title;
  const permalink = stringAttribute(attributes.permalink);
  const html = convertAsciiDocFragment(body);

  return {
    sourcePath,
    title,
    date: inferred.date,
    slug,
    urlPath: permalink ?? `/posts/${slug}`,
    tags: normalizeTags(attributes.tags),
    status: stringAttribute(attributes.status),
    comments: booleanAttribute(attributes.comments) ?? true,
    html,
    excerpt: excerptFromHtml(html),
  };
}

export function inferPostMetadata(sourcePath: string): { date: string; title: string } {
  const match = basename(sourcePath).match(/^(\d{4}-\d{2}-\d{2})-(.+)\.adoc$/);
  if (!match) throw new Error(`Post path does not follow Jekyll naming convention: ${sourcePath}`);
  return { date: match[1], title: match[2] };
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string");
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
}

export function excerptFromHtml(html: string, length = 200): string {
  const text = html
    .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();

  return truncate(text, length);
}

function truncate(value: string, length: number): string {
  if (value.length <= length) return value;
  if (length <= 3) return ".".repeat(length);
  return `${value.slice(0, length - 3)}...`;
}

function isDatedPostFile(name: string): boolean {
  return /^\d{4}-\d{2}-\d{2}-.+\.adoc$/.test(name);
}

function dateOnly(value: Date | string): string {
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) throw new Error(`Build date must start with YYYY-MM-DD: ${value}`);
    return match[0];
  }
  return value.toISOString().slice(0, 10);
}

function stringAttribute(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function booleanAttribute(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}
