import assert from "node:assert/strict";
import test from "node:test";
import { convertAsciiDocFragment } from "../lib/asciidoc.ts";
import { loadSelectedPost } from "../lib/content.ts";

test("AsciiDoc conversion renders links, images, admonitions, Unicode, and paragraphs", async () => {
  const post = await loadSelectedPost();
  assert.equal(post.urlPath, "/posts/AI-Waste");
  assert.equal(post.title, "GenAI is a waste of our time");
  assert.deepEqual(post.tags, ["GenAI", "LLM"]);
  assert.match(post.html, /<div class="paragraph">\n<p>Generative AI is a waste\./);
  assert.match(post.html, /<img src="\/assets\/img\/posts\/ai-waste\/tom-fishburne-AI-Written-AI-Read\.png" alt="AI Written" width="AI Read">/);
  assert.match(post.html, /<div class="admonitionblock tip">/);
  assert.match(post.html, /<a href="https:\/\/marketoonist\.com\/2023\/03\/ai-written-ai-read\.html">AI Written, AI Read<\/a>/);
  assert.match(post.html, /E-Mails/);
});

test("AsciiDoc include directives are rejected", () => {
  assert.throws(() => convertAsciiDocFragment("include::/etc/passwd[]"), /include directives are disabled/);
});
