import { readFile } from "node:fs/promises";
import { parse } from "@std/yaml";

export interface Article {
  sourcePath: string;
  id: string;
  title: string;
  tags: string[];
  thumbnail?: string;
  articles: ArticlePart[];
}

export interface ArticlePart {
  sourcePath: string;
  articleId: string;
  articleTitle: string;
  part?: string;
  subtitle?: string;
  upcoming?: boolean;
  publications: ArticlePublication[];
}

export interface ArticlePublication {
  sourcePath: string;
  articleId: string;
  articleTitle: string;
  part?: string;
  subtitle?: string;
  publisher: string;
  issue?: string;
  date: string;
  language?: string;
  upcoming?: boolean;
  upcomingSince?: string;
  url?: string;
}

const articleFields = new Set(["id", "title", "tags", "thumbnail", "articles"]);
const partFields = new Set(["part", "subtitle", "upcoming", "publications"]);
const publicationFields = new Set(["publisher", "issue", "date", "language", "upcoming", "upcomingSince", "url"]);

export async function loadArticles(sourcePath = "_data/articles.yaml"): Promise<Article[]> {
  const source = await readFile(sourcePath, "utf8");
  return parseArticles(source, sourcePath);
}

export async function loadArticlePublications(sourcePath = "_data/articles.yaml"): Promise<ArticlePublication[]> {
  return flattenArticlePublications(await loadArticles(sourcePath));
}

export function parseArticles(source: string, sourcePath = "_data/articles.yaml"): Article[] {
  const parsed = parse(source, { schema: "json" });
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} must contain a YAML sequence of articles`);

  const articles = parsed.map((entry, index) => normalizeArticle(entry, sourcePath, index));
  assertUnique(articles, (article) => article.id, "duplicate article id");
  assertNoDuplicatePublications(flattenArticlePublications(articles));
  return articles;
}

export function flattenArticlePublications(articles: Article[]): ArticlePublication[] {
  return articles.flatMap((article) => article.articles.flatMap((part) => part.publications));
}

function normalizeArticle(entry: unknown, sourcePath: string, index: number): Article {
  const location = `${sourcePath}[${index}]`;
  const object = requireObject(entry, location);
  assertKnownFields(object, articleFields, location);

  const id = requiredString(object.id, `${location}.id`);
  if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(id)) throw new Error(`${location}.id must be a short lowercase ASCII id`);
  const title = requiredString(object.title, `${location}.title`);
  const tags = normalizeTags(object.tags, `${location}.tags`);
  const thumbnail = optionalThumbnail(object.thumbnail, `${location}.thumbnail`);
  if (!Array.isArray(object.articles) || object.articles.length === 0) throw new Error(`${location}.articles must be a non-empty sequence`);

  const article: Article = { sourcePath, id, title, tags, articles: [] };
  if (thumbnail !== undefined) article.thumbnail = thumbnail;
  article.articles = object.articles.map((part, partIndex) => normalizePart(part, sourcePath, `${location}.articles[${partIndex}]`, article));
  return article;
}

function normalizePart(entry: unknown, sourcePath: string, location: string, article: Pick<Article, "id" | "title">): ArticlePart {
  const object = requireObject(entry, location);
  assertKnownFields(object, partFields, location);
  if (!Array.isArray(object.publications) || object.publications.length === 0) throw new Error(`${location}.publications must be a non-empty sequence`);

  const part: ArticlePart = {
    sourcePath,
    articleId: article.id,
    articleTitle: article.title,
    publications: [],
  };
  assignOptionalString(part, "part", object.part, `${location}.part`);
  assignOptionalString(part, "subtitle", object.subtitle, `${location}.subtitle`);
  assignOptionalBoolean(part, "upcoming", object.upcoming, `${location}.upcoming`);
  part.publications = object.publications.map((publication, publicationIndex) => normalizePublication(publication, sourcePath, `${location}.publications[${publicationIndex}]`, article, part));
  return part;
}

function normalizePublication(entry: unknown, sourcePath: string, location: string, article: Pick<Article, "id" | "title">, part: Pick<ArticlePart, "part" | "subtitle">): ArticlePublication {
  const object = requireObject(entry, location);
  assertKnownFields(object, publicationFields, location);

  const publication: ArticlePublication = {
    sourcePath,
    articleId: article.id,
    articleTitle: article.title,
    publisher: requiredString(object.publisher, `${location}.publisher`),
    date: requiredIsoDate(object.date, `${location}.date`),
  };
  if (part.part !== undefined) publication.part = part.part;
  if (part.subtitle !== undefined) publication.subtitle = part.subtitle;
  assignOptionalString(publication, "issue", object.issue, `${location}.issue`);
  assignOptionalString(publication, "language", object.language, `${location}.language`);
  assignOptionalBoolean(publication, "upcoming", object.upcoming, `${location}.upcoming`);
  assignOptionalIsoDate(publication, "upcomingSince", object.upcomingSince, `${location}.upcomingSince`);
  if (publication.upcomingSince !== undefined) publication.upcoming = true;
  assignOptionalUrl(publication, "url", object.url, `${location}.url`);
  if (publication.url === undefined && !publication.upcoming) throw new Error(`${location}.url is required unless upcoming is true`);
  return publication;
}

function optionalThumbnail(value: unknown, location: string): string | undefined {
  const thumbnail = optionalString(value, location);
  if (thumbnail === undefined) return undefined;
  if (!/^\/assets\/img\/thumbnails\/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp|avif)$/.test(thumbnail)) {
    throw new Error(`${location} must be an /assets/img/thumbnails/ path ending in jpg, jpeg, png, webp, or avif`);
  }
  return thumbnail;
}

function normalizeTags(value: unknown, location: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${location} must be a sequence`);
  return value.map((tag, index) => {
    if (typeof tag !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(tag)) throw new Error(`${location}[${index}] must be a lowercase kebab-case tag`);
    return tag;
  });
}

function requireObject(value: unknown, location: string): Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location} must be a mapping/object`);
  return value as Record<string, unknown>;
}

function assertKnownFields(object: Record<string, unknown>, allowedFields: Set<string>, location: string): void {
  for (const field of Object.keys(object)) {
    if (!allowedFields.has(field)) throw new Error(`${location} contains unknown field: ${field}`);
  }
}

function requiredString(value: unknown, location: string): string {
  const string = optionalString(value, location);
  if (string === undefined) throw new Error(`${location} is required and must be a non-empty string`);
  return string;
}

function optionalString(value: unknown, location: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${location} must be a non-empty string`);
  return value;
}

function assignOptionalString<T extends keyof Pick<ArticlePart & ArticlePublication, "part" | "subtitle" | "issue" | "language">>(
  target: ArticlePart | ArticlePublication,
  field: T,
  value: unknown,
  location: string,
): void {
  const string = optionalString(value, location);
  if (string !== undefined) (target as unknown as Record<string, string>)[field] = string;
}

function assignOptionalBoolean<T extends keyof Pick<ArticlePart & ArticlePublication, "upcoming">>(
  target: ArticlePart | ArticlePublication,
  field: T,
  value: unknown,
  location: string,
): void {
  if (value === undefined) return;
  if (typeof value !== "boolean") throw new Error(`${location} must be a boolean`);
  target[field] = value;
}

function assignOptionalIsoDate<T extends keyof Pick<ArticlePublication, "upcomingSince">>(
  target: ArticlePublication,
  field: T,
  value: unknown,
  location: string,
): void {
  if (value === undefined) return;
  const date = normalizeYamlDate(value);
  if (!date || !isValidIsoDate(date)) throw new Error(`${location} must be an ISO date (YYYY-MM-DD)`);
  target[field] = date;
}

function requiredIsoDate(value: unknown, location: string): string {
  const date = normalizeYamlDate(value);
  if (!date || !isValidIsoDate(date)) throw new Error(`${location} is required and must be an ISO date (YYYY-MM-DD)`);
  return date;
}

function normalizeYamlDate(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  return undefined;
}

function isValidIsoDate(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function assignOptionalUrl<T extends keyof Pick<ArticlePublication, "url">>(publication: ArticlePublication, field: T, value: unknown, location: string): void {
  if (value === undefined) return;
  publication[field] = requiredUrl(value, location);
}

function requiredUrl(value: unknown, location: string): string {
  const url = requiredString(value, location);
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("unsupported protocol");
  } catch (error) {
    throw new Error(`${location} must be an absolute http(s) URL`, { cause: error });
  }
  return url;
}

function assertNoDuplicatePublications(publications: ArticlePublication[]): void {
  const seen = new Map<string, ArticlePublication>();
  for (const publication of publications) {
    const key = [publication.articleTitle, publication.part ?? "", publication.publisher, publication.date, publication.language ?? "", publication.url ?? ""].join("\u0000");
    const previous = seen.get(key);
    if (previous) throw new Error(`duplicate article publication: ${publication.articleTitle} / ${publication.part ?? ""} / ${publication.publisher} / ${publication.date} in ${previous.sourcePath} and ${publication.sourcePath}`);
    seen.set(key, publication);
  }
}

function assertUnique<T>(items: T[], keyFor: (item: T) => string, label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    const key = keyFor(item);
    if (seen.has(key)) throw new Error(`${label}: ${key}`);
    seen.add(key);
  }
}
