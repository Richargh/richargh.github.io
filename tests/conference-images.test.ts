import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { loadTalks, parseTalks } from "../lib/talks.ts";
import { renderLogoWithTitle } from "../_ui/blocks/LogoWithTitle/LogoWithTitle.ts";
import { renderTalkCard } from "../_ui/pages/Talks/Talks.ts";

test("conference raster logos use AVIF with derived dimensions and lazy loading", async () => {
  const files = readdirSync("assets/img/conferences");
  assert.ok(!files.some((file) => /\.(png|jpe?g)$/i.test(file)));
  const appearances = (await loadTalks()).flatMap((talk) => talk.appearances);
  for (const file of files.filter((file) => file.endsWith(".avif"))) {
    const src = `/assets/img/conferences/${file}`;
    assert.ok(appearances.some((appearance) => appearance.logoUrl === src), `No appearance uses ${src}`);
    const image = readFileSync(`.${src}`);
    const ispe = image.indexOf(Buffer.from("ispe"));
    assert.ok(ispe > 0, `Missing AVIF image dimensions for ${src}`);
    const width = image.readUInt32BE(ispe + 8);
    const height = image.readUInt32BE(ispe + 12);
    assert.ok(width <= 352 && height <= 256);
    const html = renderLogoWithTitle({ src, alt: file });
    assert.ok(html.includes('loading="lazy"'));
    assert.ok(html.includes(`width="${width}" height="${height}"`));
  }
});

test("talk logos render intrinsic dimensions without YAML metadata", () => {
  const talk = parseTalks(`- id: example
  title: Example
  appearances:
    - date: '2025-01-01'
      conference: Conference
      location: remote
      logoUrl: /assets/img/conferences/build-stuff-26.avif
`)[0];
  assert.match(renderTalkCard(talk), /loading="lazy" width="352" height="187"/);
});
