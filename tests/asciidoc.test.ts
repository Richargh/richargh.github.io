import assert from "node:assert/strict";
import test from "node:test";
import { convertAsciiDocFragment } from "../lib/asciidoc.ts";

test("AsciiDoc conversion renders links, images, admonitions, Unicode, and paragraphs", async () => {
  const html = await convertAsciiDocFragment(`A paragraph with Größe ⚠ and https://example.com[Example].

image::/example.png[Example image]

TIP: Helpful advice.
`);
  assert.match(html, /<div class="paragraph">/);
  assert.match(html, /Größe ⚠/u);
  assert.match(html, /<a href="https:\/\/example.com">Example<\/a>/);
  assert.match(html, /<img src="\/example.png" alt="Example image"/);
  assert.match(html, /<div class="admonitionblock tip">/);
});

test("AsciiDoc table column widths use CSS instead of deprecated attributes", async () => {
  const html = await convertAsciiDocFragment(`[cols="1,3"]
|===
|Narrow |Wide
|===
`);
  assert.match(html, /<col style="width: 25%;">/);
  assert.match(html, /<col style="width: 75%;">/);
  assert.doesNotMatch(html, /<col\b[^>]*\swidth=/);
});

test("AsciiDoc include directives are rejected", async () => {
  await assert.rejects(() => convertAsciiDocFragment("include::/etc/passwd[]"), /include directives are disabled/);
});

test("AsciiDoc renders code callouts as text for highlighting, tables, anchors, and passthrough", async () => {
  const html = await convertAsciiDocFragment(`[[example-anchor]]
== Example

See <<example-anchor>>.

[source,java]
----
System.out.println("hello"); // <1>
----
<1> Explanation

|===
|One |Two
|===

++++
<details><summary>Details</summary>Body</details>
++++
`);
  assert.match(html, /<pre class="highlight"><code class="language-java"/);
  assert.match(html, /\(1\)/);
  const code = html.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/)?.[1];
  assert.ok(code);
  assert.doesNotMatch(code, /<i class="conum"/);
  assert.match(html, /<div class="colist arabic">/);
  assert.match(html, /<table>/);
  assert.match(html, /id="example-anchor"/);
  assert.match(html, /href="#example-anchor"/);
  assert.match(html, /<details><summary>Details<\/summary>Body<\/details>/);
});
