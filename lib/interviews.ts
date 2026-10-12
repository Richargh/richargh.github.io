import { readFile } from "node:fs/promises";
import { parse } from "@std/yaml";

export interface InterviewLink {
  label: string;
  url: string;
}

export type InterviewType = "podcast" | "stream" | "video" | "interview";

export interface InterviewAppearance {
  sourcePath: string;
  id: string;
  show: string;
  title: string;
  type: InterviewType;
  tags: string[];
  episode?: string;
  date: string;
  language?: string;
  note?: string;
  thumbnail?: string;
  url: string;
  links: InterviewLink[];
}

const interviewFields = new Set(["id", "show", "title", "type", "tags", "episode", "date", "language", "note", "thumbnail", "url", "links"]);
const linkFields = new Set(["label", "url"]);

export async function loadInterviews(sourcePath = "_data/interviews.yaml"): Promise<InterviewAppearance[]> {
  const source = await readFile(sourcePath, "utf8");
  return parseInterviews(source, sourcePath);
}

export function parseInterviews(source: string, sourcePath = "_data/interviews.yaml"): InterviewAppearance[] {
  const parsed = parse(source, { schema: "json" });
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} must contain a YAML sequence of interviews`);
  const interviews = parsed.map((entry, index) => normalizeInterview(entry, sourcePath, index));
  assertUnique(interviews, (item) => item.id, "duplicate interview id");
  return interviews;
}

function normalizeInterview(entry: unknown, sourcePath: string, index: number): InterviewAppearance {
  const location = `${sourcePath}[${index}]`;
  const object = requireObject(entry, location);
  assertKnownFields(object, interviewFields, location);
  const interview: InterviewAppearance = {
    sourcePath,
    id: requiredId(object.id, `${location}.id`),
    show: requiredString(object.show, `${location}.show`),
    title: requiredString(object.title, `${location}.title`),
    type: requiredType(object.type, `${location}.type`),
    tags: normalizeTags(object.tags, `${location}.tags`),
    date: requiredIsoDate(object.date, `${location}.date`),
    url: requiredUrl(object.url, `${location}.url`),
    links: normalizeLinks(object.links, `${location}.links`),
  };
  assignOptionalString(interview, "episode", object.episode, `${location}.episode`);
  assignOptionalString(interview, "language", object.language, `${location}.language`);
  assignOptionalString(interview, "note", object.note, `${location}.note`);
  const thumbnail = optionalThumbnail(object.thumbnail, `${location}.thumbnail`);
  if (thumbnail !== undefined) interview.thumbnail = thumbnail;
  return interview;
}

function normalizeTags(value: unknown, location: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${location} must be a sequence`);
  return value.map((tag, index) => {
    if (typeof tag !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(tag)) throw new Error(`${location}[${index}] must be a lowercase kebab-case tag`);
    return tag;
  });
}

function normalizeLinks(value: unknown, location: string): InterviewLink[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${location} must be a sequence`);
  return value.map((entry, index) => {
    const linkLocation = `${location}[${index}]`;
    const object = requireObject(entry, linkLocation);
    assertKnownFields(object, linkFields, linkLocation);
    return { label: requiredString(object.label, `${linkLocation}.label`), url: requiredUrl(object.url, `${linkLocation}.url`) };
  });
}

function optionalThumbnail(value: unknown, location: string): string | undefined {
  const thumbnail = optionalString(value, location);
  if (thumbnail === undefined) return undefined;
  if (!/^\/assets\/img\/thumbnails\/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp|avif)$/.test(thumbnail)) {
    throw new Error(`${location} must be an /assets/img/thumbnails/ path ending in jpg, jpeg, png, webp, or avif`);
  }
  return thumbnail;
}

function requireObject(value: unknown, location: string): Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location} must be a mapping/object`);
  return value as Record<string, unknown>;
}

function assertKnownFields(object: Record<string, unknown>, allowedFields: Set<string>, location: string): void {
  for (const field of Object.keys(object)) if (!allowedFields.has(field)) throw new Error(`${location} contains unknown field: ${field}`);
}

function requiredId(value: unknown, location: string): string {
  const id = requiredString(value, location);
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(id)) throw new Error(`${location} must be a short lowercase ASCII id`);
  return id;
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

function assignOptionalString<T extends keyof Pick<InterviewAppearance, "episode" | "language" | "note">>(interview: InterviewAppearance, field: T, value: unknown, location: string): void {
  const string = optionalString(value, location);
  if (string !== undefined) interview[field] = string;
}

function requiredType(value: unknown, location: string): InterviewType {
  const type = requiredString(value, location);
  if (type === "podcast" || type === "stream" || type === "video" || type === "interview") return type;
  throw new Error(`${location} must be one of: podcast, stream, video, interview`);
}

function requiredIsoDate(value: unknown, location: string): string {
  const date = typeof value === "string" ? value : value instanceof Date && !Number.isNaN(value.valueOf()) ? value.toISOString().slice(0, 10) : undefined;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${location} is required and must be an ISO date (YYYY-MM-DD)`);
  return date;
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

function assertUnique<T>(items: T[], keyFor: (item: T) => string, label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    const key = keyFor(item);
    if (seen.has(key)) throw new Error(`${label}: ${key}`);
    seen.add(key);
  }
}
