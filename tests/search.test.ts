import assert from "node:assert/strict";
import { rename, stat } from "node:fs/promises";
import test from "node:test";
import { loadAllPosts } from "../lib/content.ts";
import { buildSearchIndex, parseAutocompleteText, renderAutocompleteText, renderSearchJson } from "../lib/search.ts";

const buildDate = "2026-10-06";

test("search.json is valid JSON generated directly from posts", async () => {
  const posts = await loadAllPosts({ buildDate, warn: () => undefined });
  const json = await renderSearchJson(posts);
  const parsed = JSON.parse(json);

  assert.deepEqual(parsed, buildSearchIndex(posts));
  assert.ok(parsed.some((entry: { title: string; url: string; content: string }) =>
    entry.title === "GenAI is a waste of our time" && entry.url === "/posts/AI-Waste" && entry.content.includes("Generative AI is a waste"),
  ));
  assert.doesNotMatch(json.trimEnd(), /,\s*]$/);
});

test("autocomplete.txt is semicolon-delimited without a trailing empty suggestion", async () => {
  const posts = await loadAllPosts({ buildDate, warn: () => undefined });
  const autocomplete = renderAutocompleteText(posts);
  const suggestions = parseAutocompleteText(autocomplete);

  assert.equal(autocomplete.endsWith(";\n"), false);
  assert.ok(suggestions.includes("GenAI is a waste of our time"));
  assert.ok(!suggestions.includes(""));
  assert.deepEqual(suggestions, suggestions.toSorted((left, right) => left.localeCompare(right, "en", { sensitivity: "base" })));
});

test("editor-style wiki-link completion can find a known post title", async () => {
  const posts = await loadAllPosts({ buildDate, warn: () => undefined });
  const suggestions = parseAutocompleteText(renderAutocompleteText(posts));
  const typedText = "[[GenAI";
  const query = typedText.slice(typedText.lastIndexOf("[[") + 2).toLowerCase();

  assert.ok(suggestions.filter((title) => title.toLowerCase().includes(query)).includes("GenAI is a waste of our time"));
});

test("search and autocomplete generation do not read the placeholder notes collection", async () => {
  if (!(await exists("_notes"))) return;

  await rename("_notes", "_notes.phase5-temp");
  try {
    const posts = await loadAllPosts({ buildDate, warn: () => undefined });
    const search = JSON.parse(await renderSearchJson(posts));
    const autocomplete = parseAutocompleteText(renderAutocompleteText(posts));

    assert.ok(search.some((entry: { title: string }) => entry.title === "GenAI is a waste of our time"));
    assert.ok(autocomplete.includes("GenAI is a waste of our time"));
  } finally {
    await rename("_notes.phase5-temp", "_notes");
  }
});

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
