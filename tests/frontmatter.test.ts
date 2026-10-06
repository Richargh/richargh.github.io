import assert from "node:assert/strict";
import test from "node:test";
import { splitFrontMatter } from "../lib/frontmatter.ts";

test("malformed YAML front matter fails loudly", () => {
  assert.throws(
    () => splitFrontMatter("---\ntitle: [unterminated\n---\nBody"),
    /Malformed YAML/,
  );
});
