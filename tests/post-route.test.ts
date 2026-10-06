import assert from "node:assert/strict";
import test from "node:test";
import type { Post } from "../lib/content.ts";
import { loadPost } from "../lib/content.ts";
import { renderPostDocument } from "../routes/posts/AI-Waste.server.ts";

test("metadata is escaped by the route instead of inserted as raw HTML", () => {
  const html = renderPostDocument({
    sourcePath: "_posts/2025-01-25-AI-Waste.adoc",
    title: "<script>alert('xss')</script>",
    date: "2025-01-25",
    slug: "AI-Waste",
    urlPath: "/posts/AI-Waste",
    tags: ["<b>tag</b>"],
    comments: false,
    html: "<p>converted AsciiDoc is the only raw insertion point</p>",
    excerpt: "converted AsciiDoc is the only raw insertion point",
  } satisfies Post);

  assert.match(html, /&lt;script&gt;alert\(&#39;xss&#39;\)&lt;\/script&gt;/);
  assert.match(html, /&lt;b&gt;tag&lt;\/b&gt;/);
  assert.match(html, /<p>converted AsciiDoc is the only raw insertion point<\/p>/);
  assert.doesNotMatch(html, /<script>alert/);
});

test("explicit post permalinks are used for canonical URLs", async () => {
  const post = await loadPost("_posts/2026-09-09-Upcoming-2026-v12.adoc");
  assert.equal(post.urlPath, "/posts/upcoming/");
  assert.match(renderPostDocument(post), /<link rel="canonical" href="https:\/\/richargh\.de\/posts\/upcoming\/"\/>/);
});
