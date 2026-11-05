import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadTalks, parseTalks } from "../lib/talks.ts";
import { renderTalkCard } from "../_ui/pages/Talks/Talks.ts";

const source = `- id: example
  title: Talk
  appearances:
    - date: '2025-01-01'
      conference: Older
      location: remote
      talkVersion: 2
      videoUrl: https://example.com/older
      thumbnail: /assets/img/thumbnails/older.jpg
    - date: '2025-02-01'
      conference: Selected
      location: remote
      talkVersion: 2
      videoUrl: https://example.com/selected
      thumbnail: /assets/img/thumbnails/selected.jpg
    - date: '2025-03-01'
      conference: Newer date but older version
      location: remote
      talkVersion: 1
      videoUrl: https://example.com/newer
      thumbnail: /assets/img/thumbnails/newer.jpg
    - date: '2025-04-01'
      conference: No video
      location: remote
      talkVersion: 3
`;

test("talk banner uses the selected video appearance's thumbnail, ordered by version then date", () => {
  const talk = parseTalks(source)[0];
  assert.equal(talk.appearances[1].thumbnail, "/assets/img/thumbnails/selected.jpg");
  const banner = renderTalkCard(talk).split('<div class="article-card-body">')[0];
  assert.match(banner, /href="https:\/\/example.com\/selected"/);
  assert.match(banner, /url\('\/assets\/img\/thumbnails\/selected.jpg'\)/);
  assert.doesNotMatch(banner, /older.jpg|newer.jpg/);

  delete talk.appearances[1].thumbnail;
  const withoutThumbnail = renderTalkCard(talk).split('<div class="article-card-body">')[0];
  assert.match(withoutThumbnail, /href="https:\/\/example.com\/selected"/);
  assert.doesNotMatch(withoutThumbnail, /background-image/);

  talk.appearances = [talk.appearances[3]];
  assert.doesNotMatch(renderTalkCard(talk), /article-card-banner-link|background-image/);
});

test("thumbnail validation applies to appearances, not talk families", () => {
  assert.throws(() => parseTalks(source.replace("  title: Talk", "  title: Talk\n  thumbnail: /assets/img/thumbnails/old.jpg")), /unknown field: thumbnail/);
  assert.throws(() => parseTalks(source.replace("/assets/img/thumbnails/older.jpg", "https://example.com/image.jpg")), /must be an \/assets\/img\/thumbnails\//);
});

test("configured recording thumbnails exist and match their appearance's video", async () => {
  for (const talk of await loadTalks()) {
    for (const appearance of talk.appearances) {
      if (!appearance.thumbnail) continue;
      await access(appearance.thumbnail.slice(1));
      assert.ok(appearance.videoUrl);
      const url = new URL(appearance.videoUrl);
      const videoId = url.searchParams.get("v") ?? url.pathname.split("/").at(-1);
      assert.ok(videoId && appearance.thumbnail.includes(videoId), appearance.thumbnail);
    }
  }
});
