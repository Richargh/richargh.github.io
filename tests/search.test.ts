import assert from "node:assert/strict";
import test from "node:test";
import type { Post } from "../lib/content.ts";
import { buildSearchIndex, parseAutocompleteText, renderAutocompleteText, renderSearchJson } from "../lib/search.ts";

const posts: Post[] = ["Zebra", "Example title", "Alpha"].map((title, index) => ({
  sourcePath: `fixture-${index}.adoc`, title, date: "2025-01-01", slug: `fixture-${index}`,
  urlPath: `/posts/fixture-${index}`, tags: [], comments: false,
  html: "<p>Searchable body</p>", excerpt: "Searchable body",
}));

test("search.json is valid JSON generated directly from posts", async () => {
  const json = await renderSearchJson(posts);
  const parsed = JSON.parse(json);
  assert.deepEqual(parsed, buildSearchIndex(posts));
  assert.equal(parsed.length, posts.length);
  assert.equal(parsed[0].title, posts[0].title);
  assert.equal(parsed[0].url, posts[0].urlPath);
  assert.doesNotMatch(json.trimEnd(), /,\s*]$/);
});

test("autocomplete is sorted and semicolon-delimited without empty suggestions", () => {
  const autocomplete = renderAutocompleteText(posts);
  const suggestions = parseAutocompleteText(autocomplete);
  assert.equal(autocomplete.endsWith(";\n"), false);
  assert.ok(!suggestions.includes(""));
  assert.deepEqual(suggestions, posts.map((post) => post.title).toSorted((left, right) => left.localeCompare(right, "en", { sensitivity: "base" })));
});

test("empty collections produce empty search and autocomplete indexes", async () => {
  assert.deepEqual(JSON.parse(await renderSearchJson([])), []);
  assert.deepEqual(parseAutocompleteText(renderAutocompleteText([])), []);
});
