import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { convertAsciiDocFragment } from "./asciidoc.ts";
import { splitFrontMatter } from "./frontmatter.ts";

export interface Post {
  sourcePath: string;
  title: string;
  date: string;
  slug: string;
  urlPath: string;
  tags: string[];
  comments: boolean;
  html: string;
}

export const selectedPostPath = "_posts/2025-01-25-AI-Waste.adoc";

export async function loadSelectedPost(): Promise<Post> {
  return loadPost(selectedPostPath);
}

export async function loadPost(sourcePath: string): Promise<Post> {
  const source = await readFile(sourcePath, "utf8");
  const { attributes, body } = splitFrontMatter(source);
  const inferred = inferPostMetadata(sourcePath);
  const title = stringAttribute(attributes.title) ?? inferred.title;
  const slug = inferred.title;

  return {
    sourcePath,
    title,
    date: inferred.date,
    slug,
    urlPath: `/posts/${slug}`,
    tags: normalizeTags(attributes.tags),
    comments: booleanAttribute(attributes.comments) ?? true,
    html: convertAsciiDocFragment(body),
  };
}

export function inferPostMetadata(sourcePath: string): { date: string; title: string } {
  const match = basename(sourcePath).match(/^(\d{4}-\d{2}-\d{2})-(.+)\.adoc$/);
  if (!match) throw new Error(`Post path does not follow Jekyll naming convention: ${sourcePath}`);
  return { date: match[1], title: match[2] };
}

function stringAttribute(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function booleanAttribute(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string");
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
}
