import { readFile } from "node:fs/promises";
import { parse } from "@std/yaml";

export interface TalkLink {
  label: string;
  url: string;
}

export interface Talk {
  sourcePath: string;
  id: string;
  title: string;
  abstract?: string;
  appearances: TalkAppearance[];
}

export type TalkLocation = "in-person" | "remote" | "hybrid";

export interface TalkAppearance {
  sourcePath: string;
  talkId: string;
  talkTitle: string;
  title: string;
  conference: string;
  location: TalkLocation;
  city?: string;
  country?: string;
  date: string;
  talkVersion?: number;
  variant?: string;
  language?: string;
  durationMinutes?: number;
  eventUrl?: string;
  slideUrl?: string;
  videoUrl?: string;
  codeUrl?: string;
  links: TalkLink[];
}

export interface TalkYearGroup {
  year: string;
  appearances: TalkAppearance[];
}

const talkFields = new Set(["id", "title", "abstract", "appearances"]);
const appearanceFields = new Set([
  "title",
  "conference",
  "location",
  "city",
  "country",
  "date",
  "talkVersion",
  "variant",
  "language",
  "durationMinutes",
  "eventUrl",
  "slideUrl",
  "videoUrl",
  "codeUrl",
  "links",
]);
const linkFields = new Set(["label", "url"]);

export async function loadTalks(sourcePath = "_data/talks.yaml"): Promise<Talk[]> {
  const source = await readFile(sourcePath, "utf8");
  return parseTalks(source, sourcePath);
}

export async function loadTalkAppearances(sourcePath = "_data/talks.yaml"): Promise<TalkAppearance[]> {
  return flattenTalkAppearances(await loadTalks(sourcePath));
}

export function parseTalks(source: string, sourcePath = "_data/talks.yaml"): Talk[] {
  const parsed = parse(source, { schema: "json" });
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} must contain a YAML sequence of talks`);

  const talks = parsed.map((entry, index) => normalizeTalk(entry, sourcePath, index));
  assertUnique(talks, (talk) => talk.id, "duplicate talk id");
  assertNoDuplicateAppearances(flattenTalkAppearances(talks));
  return talks;
}

export function parseTalkAppearances(source: string, sourcePath = "_data/talks.yaml"): TalkAppearance[] {
  return flattenTalkAppearances(parseTalks(source, sourcePath));
}

export function flattenTalkAppearances(talks: Talk[]): TalkAppearance[] {
  return talks.flatMap((talk) => talk.appearances);
}

export function groupTalkAppearancesByYear(appearances: TalkAppearance[]): TalkYearGroup[] {
  const groups = new Map<string, TalkAppearance[]>();
  for (const appearance of appearances) {
    const year = appearance.date.slice(0, 4);
    const group = groups.get(year) ?? [];
    group.push(appearance);
    groups.set(year, group);
  }

  return [...groups.entries()]
    .map(([year, group]) => ({
      year,
      appearances: group.toSorted(compareTalksDescending),
    }))
    .toSorted((left, right) => right.year.localeCompare(left.year));
}

export function displayTalkDate(appearance: Pick<TalkAppearance, "date">): string {
  return appearance.date;
}

function normalizeTalk(entry: unknown, sourcePath: string, index: number): Talk {
  const location = `${sourcePath}[${index}]`;
  const object = requireObject(entry, location);
  assertKnownFields(object, talkFields, location);

  const id = requiredString(object.id, `${location}.id`);
  if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(id)) throw new Error(`${location}.id must be a short lowercase ASCII id`);
  const title = requiredString(object.title, `${location}.title`);
  const abstract = optionalString(object.abstract, `${location}.abstract`);
  if (!Array.isArray(object.appearances) || object.appearances.length === 0) throw new Error(`${location}.appearances must be a non-empty sequence`);

  const talk: Talk = { sourcePath, id, title, appearances: [] };
  if (abstract !== undefined) talk.abstract = abstract;
  talk.appearances = object.appearances.map((appearance, appearanceIndex) => normalizeAppearance(appearance, sourcePath, `${location}.appearances[${appearanceIndex}]`, talk));
  return talk;
}

function normalizeAppearance(entry: unknown, sourcePath: string, location: string, talk: Pick<Talk, "id" | "title">): TalkAppearance {
  const object = requireObject(entry, location);
  assertKnownFields(object, appearanceFields, location);

  const title = optionalString(object.title, `${location}.title`) ?? talk.title;
  const conference = requiredString(object.conference, `${location}.conference`);
  const appearanceLocation = requiredLocation(object.location, `${location}.location`);
  const city = optionalString(object.city, `${location}.city`);
  const country = optionalString(object.country, `${location}.country`);
  validateCityCountry(appearanceLocation, city, country, location);
  const date = requiredIsoDate(object.date, `${location}.date`);

  const appearance: TalkAppearance = {
    sourcePath,
    talkId: talk.id,
    talkTitle: talk.title,
    title,
    conference,
    location: appearanceLocation,
    date,
    links: normalizeLinks(object.links, `${location}.links`),
  };
  if (city !== undefined) appearance.city = city;
  if (country !== undefined) appearance.country = country;

  assignOptionalNumber(appearance, "talkVersion", object.talkVersion, `${location}.talkVersion`);
  assignOptionalString(appearance, "variant", object.variant, `${location}.variant`);
  assignOptionalString(appearance, "language", object.language, `${location}.language`);
  assignOptionalNumber(appearance, "durationMinutes", object.durationMinutes, `${location}.durationMinutes`);
  assignOptionalUrl(appearance, "eventUrl", object.eventUrl, `${location}.eventUrl`);
  assignOptionalUrl(appearance, "slideUrl", object.slideUrl, `${location}.slideUrl`);
  assignOptionalUrl(appearance, "videoUrl", object.videoUrl, `${location}.videoUrl`);
  assignOptionalUrl(appearance, "codeUrl", object.codeUrl, `${location}.codeUrl`);
  return appearance;
}

function normalizeLinks(value: unknown, location: string): TalkLink[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${location} must be a sequence`);
  return value.map((entry, index) => {
    const linkLocation = `${location}[${index}]`;
    const object = requireObject(entry, linkLocation);
    assertKnownFields(object, linkFields, linkLocation);
    return {
      label: requiredString(object.label, `${linkLocation}.label`),
      url: requiredUrl(object.url, `${linkLocation}.url`),
    };
  });
}

function compareTalksDescending(left: TalkAppearance, right: TalkAppearance): number {
  return right.date.localeCompare(left.date)
    || left.title.localeCompare(right.title)
    || left.conference.localeCompare(right.conference);
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

function requiredLocation(value: unknown, location: string): TalkLocation {
  const string = requiredString(value, location);
  if (string === "in-person" || string === "remote" || string === "hybrid") return string;
  throw new Error(`${location} must be one of: in-person, remote, hybrid`);
}

function validateCityCountry(location: TalkLocation, city: string | undefined, country: string | undefined, appearanceLocation: string): void {
  if (location === "in-person" && (city === undefined || country === undefined)) {
    throw new Error(`${appearanceLocation} must include city and country for in-person appearances`);
  }
  if (city !== undefined && country === undefined) throw new Error(`${appearanceLocation}.country is required when city is present`);
  if (country !== undefined && city === undefined) throw new Error(`${appearanceLocation}.city is required when country is present`);
}

function optionalString(value: unknown, location: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${location} must be a non-empty string`);
  return value;
}

function assignOptionalString<T extends keyof Pick<TalkAppearance, "variant" | "language">>(
  appearance: TalkAppearance,
  field: T,
  value: unknown,
  location: string,
): void {
  const string = optionalString(value, location);
  if (string !== undefined) appearance[field] = string;
}

function assignOptionalNumber<T extends keyof Pick<TalkAppearance, "talkVersion" | "durationMinutes">>(
  appearance: TalkAppearance,
  field: T,
  value: unknown,
  location: string,
): void {
  if (value === undefined) return;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${location} must be a number`);
  appearance[field] = value;
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

function assignOptionalUrl<T extends keyof Pick<TalkAppearance, "eventUrl" | "slideUrl" | "videoUrl" | "codeUrl">>(
  appearance: TalkAppearance,
  field: T,
  value: unknown,
  location: string,
): void {
  if (value === undefined) return;
  appearance[field] = requiredUrl(value, location);
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

function assertNoDuplicateAppearances(appearances: TalkAppearance[]): void {
  const seen = new Map<string, TalkAppearance>();
  for (const appearance of appearances) {
    const key = [appearance.title, appearance.conference, appearance.date].join("\u0000");
    const previous = seen.get(key);
    if (previous) throw new Error(`duplicate talk appearance: ${appearance.title} / ${appearance.conference} / ${displayTalkDate(appearance)} in ${previous.sourcePath} and ${appearance.sourcePath}`);
    seen.set(key, appearance);
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
