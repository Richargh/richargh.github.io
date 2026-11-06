import assert from "node:assert/strict";
import test from "node:test";
import { loadAllPages } from "../lib/content.ts";
import { renderPageDocument } from "../routes/pages/[slug].server.ts";

test("tools page lists personal tools separately from contributions", async () => {
  const pages = await loadAllPages();
  const page = pages.find((page) => page.slug === "tools");
  assert.ok(page);
  assert.equal(page.title, "Tools");
  assert.equal(page.urlPath, "/tools/");
  assert.ok(!pages.some((page) => page.urlPath === "/built/"));

  const html = renderPageDocument(page);
  for (const repo of ["clamp", "workdown", "flowminer", "swan-hourglass", "web-native"]) {
    assert.ok(html.includes(`https://github.com/Richargh/${repo}`));
  }
  assert.match(html, /Tools I helped build/);
  assert.match(html, /MaibornWolff/);
  assert.match(html, /I helped build it as part of the team/);
  assert.ok(html.indexOf("Tools I helped build") < html.indexOf(">CodeCharta</a>"));
  const collections = html.indexOf("Collections &amp; references");
  const webNative = html.indexOf(">web-native</a>");
  assert.ok(collections > html.indexOf(">CodeCharta</a>"));
  assert.ok(webNative > collections);
  assert.ok(webNative < html.indexOf('<h2 id="sandboxes">'));
  assert.doesNotMatch(html, /Closed Source/);
  assert.match(html, /Sandboxes/);
});
