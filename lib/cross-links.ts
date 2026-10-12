import { readFile } from "node:fs/promises";
import { parse } from "@std/yaml";

export type ContentKind = "talk" | "article" | "interview";

export interface CrossLinkItem {
  id: string;
  kind: ContentKind;
}

export interface CrossLink {
  label: string;
  url: string;
}

export interface RelatedGroup {
  sourcePath: string;
  id: string;
  items: CrossLinkItem[];
}

const labels: Record<ContentKind, string> = {
  talk: "Talk",
  article: "Article",
  interview: "Interview",
};

const paths: Record<ContentKind, string> = {
  talk: "/talks/",
  article: "/articles/",
  interview: "/interviews/",
};

const groupFields = new Set(["id", "items"]);
const itemFields = new Set(["kind", "id"]);

export async function loadRelatedGroups(sourcePath = "_data/related.yaml"): Promise<RelatedGroup[]> {
  const source = await readFile(sourcePath, "utf8");
  return parseRelatedGroups(source, sourcePath);
}

export function parseRelatedGroups(source: string, sourcePath = "_data/related.yaml"): RelatedGroup[] {
  const parsed = parse(source, { schema: "json" });
  if (!Array.isArray(parsed)) throw new Error(`${sourcePath} must contain a YAML sequence of related-content groups`);
  const groups = parsed.map((entry, index) => normalizeGroup(entry, sourcePath, index));
  assertUnique(groups, (group) => group.id, "duplicate related group id");
  return groups;
}

export function assertRelatedReferencesExist(groups: RelatedGroup[], inventory: CrossLinkItem[]): void {
  const known = new Set(inventory.map((item) => key(item)));
  const knownByKind = groupIdsByKind(inventory);
  for (const group of groups) {
    for (const item of group.items) {
      if (known.has(key(item))) continue;
      const knownIds = knownByKind.get(item.kind) ?? [];
      const suggestion = closestId(item.id, knownIds);
      const groupItems = group.items.map((groupItem) => `${groupItem.kind}:${groupItem.id}`).join(", ");
      throw new Error(
        `${group.sourcePath} group "${group.id}" references unknown ${item.kind} id "${item.id}". `
          + `${suggestion ? `Did you mean "${suggestion}"? ` : ""}`
          + `Group items: ${groupItems}. Known ${item.kind} ids: ${knownIds.join(", ")}`,
      );
    }
  }
}

export function relatedContentLinks(current: CrossLinkItem, groups: RelatedGroup[]): CrossLink[] {
  const links = groups
    .filter((group) => group.items.some((item) => sameItem(item, current)))
    .flatMap((group) => group.items)
    .filter((item) => !sameItem(item, current))
    .map((item) => ({ label: labels[item.kind], url: `${paths[item.kind]}#${item.id}` }));

  return uniqueLinks(links).toSorted((left, right) => left.label.localeCompare(right.label));
}

function normalizeGroup(entry: unknown, sourcePath: string, index: number): RelatedGroup {
  const location = `${sourcePath}[${index}]`;
  const object = requireObject(entry, location);
  assertKnownFields(object, groupFields, location);
  if (!Array.isArray(object.items) || object.items.length < 2) throw new Error(`${location}.items must contain at least two related items`);
  return {
    sourcePath,
    id: requiredId(object.id, `${location}.id`),
    items: object.items.map((item, itemIndex) => normalizeItem(item, `${location}.items[${itemIndex}]`)),
  };
}

function normalizeItem(entry: unknown, location: string): CrossLinkItem {
  const object = requireObject(entry, location);
  assertKnownFields(object, itemFields, location);
  return {
    kind: requiredKind(object.kind, `${location}.kind`),
    id: requiredId(object.id, `${location}.id`),
  };
}

function requiredKind(value: unknown, location: string): ContentKind {
  const kind = requiredString(value, location);
  if (kind === "talk" || kind === "article" || kind === "interview") return kind;
  throw new Error(`${location} must be one of: talk, article, interview`);
}

function requiredId(value: unknown, location: string): string {
  const id = requiredString(value, location);
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(id)) throw new Error(`${location} must be a short lowercase ASCII id`);
  return id;
}

function requiredString(value: unknown, location: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${location} is required and must be a non-empty string`);
  return value;
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

function groupIdsByKind(items: CrossLinkItem[]): Map<ContentKind, string[]> {
  const groups = new Map<ContentKind, string[]>();
  for (const item of items) {
    const ids = groups.get(item.kind) ?? [];
    ids.push(item.id);
    groups.set(item.kind, ids);
  }
  for (const ids of groups.values()) ids.sort((left, right) => left.localeCompare(right));
  return groups;
}

function closestId(value: string, candidates: string[]): string | undefined {
  const prefixMatch = candidates.find((candidate) => value.startsWith(candidate) || candidate.startsWith(value));
  if (prefixMatch) return prefixMatch;
  const ranked = candidates
    .map((candidate) => ({ candidate, distance: levenshtein(value, candidate) }))
    .toSorted((left, right) => left.distance - right.distance || left.candidate.localeCompare(right.candidate));
  const best = ranked[0];
  if (!best) return undefined;
  return best.distance <= Math.max(2, Math.floor(value.length / 3)) ? best.candidate : undefined;
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 0; leftIndex < left.length; leftIndex++) {
    const current = [leftIndex + 1];
    for (let rightIndex = 0; rightIndex < right.length; rightIndex++) {
      current[rightIndex + 1] = Math.min(
        current[rightIndex] + 1,
        previous[rightIndex + 1] + 1,
        previous[rightIndex] + (left[leftIndex] === right[rightIndex] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function sameItem(left: CrossLinkItem, right: CrossLinkItem): boolean {
  return left.kind === right.kind && left.id === right.id;
}

function key(item: CrossLinkItem): string {
  return `${item.kind}\u0000${item.id}`;
}

function uniqueLinks(links: CrossLink[]): CrossLink[] {
  const seen = new Set<string>();
  const unique: CrossLink[] = [];
  for (const link of links) {
    const linkKey = `${link.label}\u0000${link.url}`;
    if (seen.has(linkKey)) continue;
    seen.add(linkKey);
    unique.push(link);
  }
  return unique;
}

function assertUnique<T>(items: T[], keyFor: (item: T) => string, label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    const itemKey = keyFor(item);
    if (seen.has(itemKey)) throw new Error(`${label}: ${itemKey}`);
    seen.add(itemKey);
  }
}
