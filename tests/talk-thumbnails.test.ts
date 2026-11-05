import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { loadTalks, parseTalks, type Talk } from "../lib/talks.ts";
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

function banner(talk: Talk): string {
  return renderTalkCard(talk).split('<div class="article-card-body">')[0];
}

test("talk page composes all recordings into bento, ordered by version then date", () => {
  const talk = parseTalks(source)[0];
  const html = banner(talk);
  assert.match(html, /bento-multiple-media/);
  for (const name of ["selected", "older", "newer"]) {
    assert.match(html, new RegExp(`href="https://example.com/${name}"`));
    assert.match(html, new RegExp(`src="/assets/img/thumbnails/${name}.jpg"`));
  }
  assert.ok(html.indexOf('href="https://example.com/selected"') < html.indexOf('href="https://example.com/older"'));
  delete talk.appearances[1].thumbnail;
  assert.match(banner(talk), /href="https:\/\/example.com\/selected"/);
});

test("non-video appearances compose logo blocks deduplicated by conference/year", () => {
  const talk = parseTalks(source)[0];
  for (const appearance of talk.appearances) {
    delete appearance.videoUrl;
    delete appearance.thumbnail;
  }
  talk.appearances[0].conference = "JavaLand";
  talk.appearances[1].conference = "JavaLand";
  talk.appearances[2].conference = "JavaLand";
  talk.appearances[2].date = "2024-03-01";
  talk.appearances[3].conference = "c't <webdev>";
  const html = banner(talk);
  assert.equal((html.match(/class="bento-supporting-item"/g) ?? []).length, 3);
  assert.equal((html.match(/class="logo-with-title-fallback">JavaLand/g) ?? []).length, 2);
  assert.match(html, /c&#39;t &lt;webdev&gt;/);
  assert.match(html, /class="logo-with-title-caption">2024/);
  assert.ok(html.indexOf("c&#39;t") < html.indexOf(">JavaLand"));
  assert.doesNotMatch(html, /thumbnail|src="https?:/);
});

test("a single resource appearance uses LogoWithTitle directly, with a name fallback", () => {
  const talk = parseTalks(source)[0];
  talk.appearances = [talk.appearances[3]];
  const html = banner(talk);
  assert.match(html, /class="logo-with-title-fallback">No video/);
  assert.match(html, /class="logo-with-title-caption">2025/);
  assert.doesNotMatch(html, /class="bento|thumbnail|<img/);
});

test("a single recording uses Thumbnail directly, with its version in the play button", () => {
  const talk = parseTalks(source)[0];
  talk.appearances = [talk.appearances[0]];
  assert.match(banner(talk), /class="thumbnail-play-label">v2<\/span>/);
  assert.doesNotMatch(banner(talk), /class="bento/);
  delete talk.appearances[0].talkVersion;
  assert.doesNotMatch(banner(talk), /thumbnail-play-label/);
  talk.appearances[0].talkVersion = 0;
  assert.match(banner(talk), /class="thumbnail-play-label">v0<\/span>/);
});

test("every video replaces its logo while non-video appearance logos remain", () => {
  const talk = parseTalks(source)[0];
  talk.appearances[1].logoUrl = "/assets/img/conferences/selected.svg";
  talk.appearances[0].logoUrl = "/assets/img/conferences/older.svg";
  talk.appearances[3].logoUrl = "/assets/img/conferences/no-video.svg";
  const html = banner(talk);
  assert.equal((html.match(/class="thumbnail-play"/g) ?? []).length, 3);
  assert.match(html, /src="\/assets\/img\/conferences\/no-video.svg"/);
  assert.doesNotMatch(html, /src="\/assets\/img\/conferences\/(?:selected|older).svg"/);
});

test("a recording suppresses duplicate conference/year logos", () => {
  const talk = parseTalks(source)[0];
  talk.appearances[0].conference = "Shared";
  talk.appearances[1].conference = "Shared";
  delete talk.appearances[1].videoUrl;
  const html = banner(talk);
  assert.equal((html.match(/class="thumbnail-play"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /logo-with-title-fallback">Shared/);
});

test("appearance logoUrl is parsed and used directly, including year-specific artwork", () => {
  const talk = parseTalks(source
    .replace("conference: Older", "conference: Same conference\n      logoUrl: /assets/img/conferences/2024.svg")
    .replace("'2025-01-01'", "'2024-01-01'")
    .replace("conference: Selected", "conference: Same conference\n      logoUrl: /assets/img/conferences/2025.png"))[0];
  assert.equal(talk.appearances[0].logoUrl, "/assets/img/conferences/2024.svg");
  for (const appearance of talk.appearances) delete appearance.videoUrl;
  const html = banner(talk);
  assert.match(html, /src="\/assets\/img\/conferences\/2024.svg"/);
  assert.match(html, /src="\/assets\/img\/conferences\/2025.png"/);
  assert.doesNotMatch(html, /src="https?:/);
});

test("logoUrl validation accepts local artwork only and belongs to appearances", () => {
  for (const logoUrl of ["/assets/img/jax24.svg", "/assets/img/conferences/build-stuff.png", "/assets/img/logo.webp"]) {
    assert.equal(parseTalks(source.replace("conference: Older", `conference: Older\n      logoUrl: ${logoUrl}`))[0].appearances[0].logoUrl, logoUrl);
  }
  for (const logoUrl of ["https://example.com/logo.png", "/assets/img/../logo.png", "/assets/img/logo.html", "not-a-path"]) {
    assert.throws(() => parseTalks(source.replace("conference: Older", `conference: Older\n      logoUrl: ${logoUrl}`)), /must be a local \/assets\/img\/ image path/);
  }
  assert.throws(() => parseTalks(source.replace("  title: Talk", "  title: Talk\n  logoUrl: /assets/img/logo.svg")), /unknown field: logoUrl/);
  assert.throws(() => parseTalks(source.replace("conference: Older", "conference: Older\n      logoUrl: 123")), /logoUrl must be a non-empty string/);
});

test("thumbnail validation applies to appearances, not talk families", () => {
  assert.throws(() => parseTalks(source.replace("  title: Talk", "  title: Talk\n  thumbnail: /assets/img/thumbnails/old.jpg")), /unknown field: thumbnail/);
  assert.throws(() => parseTalks(source.replace("/assets/img/thumbnails/older.jpg", "https://example.com/image.jpg")), /must be an \/assets\/img\/thumbnails\//);
});

test("appearance thumbnails do not require a recording or a video ID in their filename", () => {
  const talk = parseTalks(source
    .replace("      videoUrl: https://example.com/older\n", "")
    .replace("/assets/img/thumbnails/selected.jpg", "/assets/img/thumbnails/custom-cover.jpg"))[0];
  assert.equal(talk.appearances[0].videoUrl, undefined);
  assert.equal(talk.appearances[0].thumbnail, "/assets/img/thumbnails/older.jpg");
  assert.equal(talk.appearances[1].videoUrl, "https://example.com/selected");
  assert.equal(talk.appearances[1].thumbnail, "/assets/img/thumbnails/custom-cover.jpg");
});

test("configured appearance thumbnails exist, with or without a recording", async () => {
  for (const talk of await loadTalks()) {
    for (const appearance of talk.appearances) {
      if (!appearance.thumbnail) continue;
      await access(appearance.thumbnail.slice(1));
    }
  }
});
