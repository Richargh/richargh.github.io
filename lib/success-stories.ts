import { readFile } from "node:fs/promises";
import { parse } from "@std/yaml";

export interface SuccessStory {
  sourcePath: string;
  id: string;
  title: string;
  assignmentKind: AssignmentKind;
  published: boolean;
  dateFrom: string;
  dateTo: string;
  industry: string;
  role: string;
  codebaseSize: string;
  teamSize: string;
  keyMethods: string[];
  keyArchitecture: string[];
  keyTechnologies: string[];
  accomplished: string;
}

export type AssignmentKind = "modernization" | "modernisation" | "health-check" | "sw-health-check" | "sw-due-diligence" | "green-field" | "development";

const assignmentKinds = new Set<AssignmentKind>(["modernization", "modernisation", "health-check", "sw-health-check", "sw-due-diligence", "green-field", "development"]);
const successStoryFields = new Set(["id", "title", "assignmentKind", "published", "dateFrom", "dateTo", "industry", "role", "codebaseSize", "teamSize", "keyMethods", "keyArchitecture", "keyTechnologies", "accomplished"]);

export async function loadSuccessStories(sourcePath = "_data/success-stories.yaml"): Promise<SuccessStory[]> {
  const source = await readFile(sourcePath, "utf8");
  return parseSuccessStories(source, sourcePath);
}

export function parseSuccessStories(source: string, sourcePath = "_data/success-stories.yaml"): SuccessStory[] {
  const parsed = parse(source, { schema: "json" });
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} must contain a YAML sequence of success stories`);

  const stories = parsed.map((entry, index) => normalizeSuccessStory(entry, sourcePath, index));
  assertUnique(stories, (story) => story.id, "duplicate success story id");
  return stories.filter((story) => story.published).toSorted((left, right) => right.dateTo.localeCompare(left.dateTo) || left.title.localeCompare(right.title));
}

function normalizeSuccessStory(entry: unknown, sourcePath: string, index: number): SuccessStory {
  const location = `${sourcePath}[${index}]`;
  const object = requireObject(entry, location);
  assertKnownFields(object, successStoryFields, location);

  const story: SuccessStory = {
    sourcePath,
    id: requiredId(object.id, `${location}.id`),
    title: requiredString(object.title, `${location}.title`),
    assignmentKind: requiredAssignmentKind(object.assignmentKind, `${location}.assignmentKind`),
    published: requiredBoolean(object.published, `${location}.published`),
    dateFrom: requiredIsoDate(object.dateFrom, `${location}.dateFrom`),
    dateTo: requiredIsoDate(object.dateTo, `${location}.dateTo`),
    industry: requiredString(object.industry, `${location}.industry`),
    role: requiredString(object.role, `${location}.role`),
    codebaseSize: requiredString(object.codebaseSize, `${location}.codebaseSize`),
    teamSize: requiredString(object.teamSize, `${location}.teamSize`),
    keyMethods: optionalStringList(object.keyMethods, `${location}.keyMethods`),
    keyArchitecture: optionalStringList(object.keyArchitecture, `${location}.keyArchitecture`),
    keyTechnologies: requiredStringList(object.keyTechnologies, `${location}.keyTechnologies`),
    accomplished: optionalString(object.accomplished, `${location}.accomplished`) ?? "",
  };
  if (story.published && story.accomplished === "") throw new Error(`${location}.accomplished is required for published success stories`);
  if (story.dateFrom > story.dateTo) throw new Error(`${location}.dateFrom must be before or equal to dateTo`);
  return story;
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

function requiredId(value: unknown, location: string): string {
  const id = requiredString(value, location);
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(id)) throw new Error(`${location} must be a short lowercase ASCII id`);
  return id;
}

function requiredString(value: unknown, location: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${location} is required and must be a non-empty string`);
  return value.trim();
}

function requiredAssignmentKind(value: unknown, location: string): AssignmentKind {
  const assignmentKind = requiredString(value, location) as AssignmentKind;
  if (!assignmentKinds.has(assignmentKind)) throw new Error(`${location} must be one of: ${[...assignmentKinds].join(", ")}`);
  return assignmentKind;
}

function optionalString(value: unknown, location: string): string | undefined {
  if (value == null) return undefined;
  return requiredString(value, location);
}

function requiredBoolean(value: unknown, location: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${location} is required and must be a boolean`);
  return value;
}

function requiredStringList(value: unknown, location: string): string[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${location} must be a non-empty sequence`);
  return value.map((item, index) => requiredString(item, `${location}[${index}]`));
}

function optionalStringList(value: unknown, location: string): string[] {
  if (value == null) return [];
  return requiredStringList(value, location);
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

function assertUnique<T>(items: T[], keyFor: (item: T) => string, label: string): void {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = keyFor(item);
    if (seen.has(key)) throw new Error(`${label}: ${key}`);
    seen.set(key, item);
  }
}
