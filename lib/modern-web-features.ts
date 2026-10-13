import { readFileSync } from "node:fs";
import { parse } from "@std/yaml";

export interface ModernWebFeature {
  sourcePath: string;
  name: string;
  url: string;
  baselineSince: string;
  fallback: ModernWebFeatureFallback;
  examples: ModernWebFeatureExample[];
}

export interface ModernWebFeatureFallback {
  category: string;
  url?: string;
  explanation: string;
}

export interface ModernWebFeatureExample {
  description: string;
  language: string;
  code: string;
}

const fallbackCategories = new Set(["progressive-enhancement", "graceful-degradation", "polyfillable", "build-time-transform", "author-provided", "hard-dependency"]);
const featureFields = new Set(["name", "url", "baselineSince", "fallback", "examples"]);
const fallbackFields = new Set(["category", "url", "explanation"]);
const exampleFields = new Set(["description", "language", "code"]);

export function loadModernWebFeatures(sourcePath = "_data/modern-web-features.yaml"): ModernWebFeature[] {
  const source = readFileSync(sourcePath, "utf8");
  return parseModernWebFeatures(source, sourcePath);
}

export function parseModernWebFeatures(source: string, sourcePath = "_data/modern-web-features.yaml"): ModernWebFeature[] {
  const parsed = parse(source, { schema: "json" });
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} must contain a YAML sequence of modern web features`);

  const features = parsed.map((entry, index) => normalizeFeature(entry, sourcePath, index));
  assertUnique(features, (feature) => feature.name, "duplicate modern web feature name");
  assertUnique(features, (feature) => feature.url, "duplicate modern web feature URL");
  return features.sort((left, right) => right.baselineSince.localeCompare(left.baselineSince) || left.name.localeCompare(right.name));
}

function normalizeFeature(entry: unknown, sourcePath: string, index: number): ModernWebFeature {
  const location = `${sourcePath}[${index}]`;
  const object = requireObject(entry, location);
  assertKnownFields(object, featureFields, location);

  if (!Array.isArray(object.examples) || object.examples.length === 0) throw new Error(`${location}.examples must be a non-empty sequence`);

  return {
    sourcePath,
    name: requiredString(object.name, `${location}.name`),
    url: requiredUrl(object.url, `${location}.url`),
    baselineSince: requiredIsoDate(object.baselineSince, `${location}.baselineSince`),
    fallback: normalizeFallback(object.fallback, `${location}.fallback`),
    examples: object.examples.map((example, exampleIndex) => normalizeExample(example, `${location}.examples[${exampleIndex}]`)),
  };
}

function normalizeFallback(entry: unknown, location: string): ModernWebFeatureFallback {
  const object = requireObject(entry, location);
  assertKnownFields(object, fallbackFields, location);
  const category = requiredString(object.category, `${location}.category`);
  if (!fallbackCategories.has(category)) throw new Error(`${location}.category must be a known fallback category`);

  return {
    category,
    url: optionalUrl(object.url, `${location}.url`),
    explanation: requiredString(object.explanation, `${location}.explanation`),
  };
}

function normalizeExample(entry: unknown, location: string): ModernWebFeatureExample {
  const object = requireObject(entry, location);
  assertKnownFields(object, exampleFields, location);

  return {
    description: requiredString(object.description, `${location}.description`),
    language: requiredLanguage(object.language, `${location}.language`),
    code: requiredString(object.code, `${location}.code`),
  };
}

function requireObject(value: unknown, location: string): Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location} must be an object`);
  return value as Record<string, unknown>;
}

function assertKnownFields(object: Record<string, unknown>, allowed: Set<string>, location: string): void {
  for (const field of Object.keys(object)) {
    if (!allowed.has(field)) throw new Error(`${location}.${field} is not a supported field`);
  }
}

function requiredString(value: unknown, location: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${location} must be a non-empty string`);
  return value.trim();
}

function requiredLanguage(value: unknown, location: string): string {
  const language = requiredString(value, location).toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(language)) throw new Error(`${location} must be a lowercase syntax language id`);
  return language;
}

function requiredUrl(value: unknown, location: string): string {
  const url = requiredString(value, location);
  validateUrl(url, location);
  return url;
}

function optionalUrl(value: unknown, location: string): string | undefined {
  if (value === undefined) return undefined;
  const url = requiredString(value, location);
  validateUrl(url, location);
  return url;
}

function validateUrl(url: string, location: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("unsupported protocol");
  } catch (error) {
    throw new Error(`${location} must be an http(s) URL`, { cause: error });
  }
}

function requiredIsoDate(value: unknown, location: string): string {
  const date = requiredString(value, location);
  if (!isValidIsoDate(date)) throw new Error(`${location} must be a valid ISO date in YYYY-MM-DD format`);
  return date;
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
