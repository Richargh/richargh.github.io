import type { Post } from "./content.ts";

export interface SearchEntry {
  title: string;
  url: string;
  content: string;
}

export function buildSearchIndex(posts: Post[]): SearchEntry[] {
  return posts.map((post) => ({
    title: plainText(post.title),
    url: post.urlPath,
    content: plainText(post.html),
  }));
}

export function searchJsonResponse(posts: Post[]): Response {
  return Response.json(buildSearchIndex(posts));
}

export async function renderSearchJson(posts: Post[]): Promise<string> {
  return `${await searchJsonResponse(posts).text()}\n`;
}

export function renderAutocompleteText(posts: Post[]): string {
  const titles = posts
    .map((post) => plainText(post.title))
    .filter((title) => title.length > 0)
    .toSorted((left, right) => left.localeCompare(right, "en", { sensitivity: "base" }));

  return `${titles.map(escapeAutocompleteTitle).join(";")}\n`;
}

export function parseAutocompleteText(text: string): string[] {
  const trimmed = text.trimEnd();
  if (trimmed === "") return [];

  const suggestions: string[] = [];
  let current = "";
  let escaping = false;

  for (const character of trimmed) {
    if (escaping) {
      current += character;
      escaping = false;
      continue;
    }
    if (character === "\\") {
      escaping = true;
      continue;
    }
    if (character === ";") {
      suggestions.push(current);
      current = "";
      continue;
    }
    current += character;
  }

  if (escaping) current += "\\";
  suggestions.push(current);
  return suggestions;
}

function escapeAutocompleteTitle(title: string): string {
  return title.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(/\r?\n/g, " ");
}

function plainText(value: string): string {
  return value
    .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/&nbsp;/g, " ")
    .replaceAll(/&amp;/g, "&")
    .replaceAll(/&lt;/g, "<")
    .replaceAll(/&gt;/g, ">")
    .replaceAll(/&quot;/g, '"')
    .replaceAll(/&#39;/g, "'")
    .replaceAll(/&#(\d+);/g, (_, codePoint: string) => String.fromCodePoint(Number.parseInt(codePoint, 10)))
    .replaceAll(/&#x([\da-f]+);/gi, (_, codePoint: string) => String.fromCodePoint(Number.parseInt(codePoint, 16)))
    .replaceAll(/\s+/g, " ")
    .trim();
}
