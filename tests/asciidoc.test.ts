import assert from "node:assert/strict";
import test from "node:test";
import { convertAsciiDocFragment } from "../lib/asciidoc.ts";
import { loadPost, loadSelectedPost } from "../lib/content.ts";

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

test("AsciiDoc conversion covers source blocks, callouts, tables, images, passthrough, details, anchors, xrefs, bibliography anchors, and Unicode", async () => {
  const structureTests = await loadPost("_posts/2024-11-09-Structure-Cementing-Tests-1.adoc");
  assert.match(structureTests.html, /<pre class="highlight"><code class="language-java" data-lang="java">/);
  assert.match(structureTests.html, /<div class="colist arabic">/);
  assert.match(structureTests.html, /<table>/);
  assert.match(structureTests.html, /<img src="\/assets\/img\/posts\/structure-cementing-tests\//);
  assert.match(structureTests.html, /<s>architects<\/s>/);
  assert.match(structureTests.html, /id="ports-and-adapters"/);
  assert.match(structureTests.html, /href="#ports-and-adapters"/);
  assert.match(structureTests.html, /class="bibliography"/);

  const javaHistory = await loadPost("_posts/2025-03-31-Java-Version-History-up-to-jdk-25-development.adoc");
  assert.match(javaHistory.html, /⚠/u);
  assert.match(javaHistory.html, /href="#jdk-24"/);
});
