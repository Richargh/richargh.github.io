import assert from "node:assert/strict";
import test from "node:test";
import { renderArticleCard } from "../_ui/blocks/ArticleCard/ArticleCard.ts";
import { renderBento } from "../_ui/blocks/Bento/Bento.ts";
import { renderLogoWithTitle } from "../_ui/blocks/LogoWithTitle/LogoWithTitle.ts";
import { renderThumbnail } from "../_ui/blocks/Thumbnail/Thumbnail.ts";

test("ArticleCard accepts opaque banner HTML without choosing a content renderer", () => {
  const bannerHtml = '<aside data-custom="true">Any content</aside>';
  const html = renderArticleCard({ id: "a", title: "A < B", bannerHtml, childrenHtml: "<p>Body</p>" });
  assert.ok(html.includes(`<div class="article-card-banner">${bannerHtml}</div>`));
  assert.match(html, /A &lt; B/);
  assert.doesNotMatch(html, /thumbnail|logo-with-title|bento/);
  assert.doesNotMatch(renderArticleCard({ id: "b", title: "B", childrenHtml: "" }), /article-card-banner/);
});

test("Thumbnail can be static, linked, or playable, independently of ArticleCard and Bento", () => {
  const staticImage = renderThumbnail({ src: "/assets/img/thumbnails/article-kvj.avif", alt: "A < B", tags: ["<tag>"] });
  assert.match(staticImage, /alt="A &lt; B"/);
  assert.match(staticImage, /&lt;tag&gt;/);
  assert.doesNotMatch(staticImage, /thumbnail-play|<a/);
  const link = renderThumbnail({ src: "/assets/img/thumbnails/article-kvj.avif", href: "/read", label: "Read" });
  assert.match(link, /href="\/read"/);
  assert.doesNotMatch(link, /thumbnail-play/);
  const video = renderThumbnail({ href: "/watch", label: "Watch version 2", playable: true, playLabel: "v2" });
  assert.match(video, /aria-label="Watch version 2"/);
  assert.match(video, /class="thumbnail-play-label">v2<\/span>/);
  assert.match(video, /aria-hidden="true"/);
  assert.doesNotMatch(renderThumbnail({ href: "/watch", playable: true }), /thumbnail-play-label/);
  assert.doesNotMatch(renderThumbnail({ playable: true }), /thumbnail-play/);
  assert.match(renderThumbnail({ href: "/watch", playable: true, playLabel: "<v2>" }), /&lt;v2&gt;/);
});

test("LogoWithTitle renders only an image and caption when a logo exists, otherwise a text fallback", () => {
  const logo = renderLogoWithTitle({ src: "/assets/img/conferences/jug-saxony.svg", alt: "Conference <Name>", title: "2026" });
  assert.match(logo, /alt="Conference &lt;Name&gt;"/);
  assert.match(logo, /class="logo-with-title-caption">2026/);
  assert.doesNotMatch(logo, /logo-with-title-fallback/);
  const fallback = renderLogoWithTitle({ alt: "Local <meetup>", title: "2025" });
  assert.match(fallback, /class="logo-with-title-fallback">Local &lt;meetup&gt;/);
  assert.doesNotMatch(fallback, /<img/);
});

test("Bento arranges opaque child HTML, not conference or video data", () => {
  assert.equal(renderBento({}), "");
  const media = ["<p>First</p>", "<p>Second</p>", "<p>Third</p>"];
  const supporting = ["<aside>One</aside>", "<aside>Two</aside>"];
  const html = renderBento({ media, supporting });
  assert.match(html, /bento-three-media/);
  for (const child of [...media, ...supporting]) assert.ok(html.includes(child));
  assert.equal((html.match(/class="bento-media"/g) ?? []).length, 3);
  assert.equal((html.match(/class="bento-supporting-item"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /thumbnail|logo-with-title|<img|href=|conference/);
});

test("the same child blocks render directly in a banner or inside Bento", () => {
  for (const child of [renderThumbnail({ src: "/assets/img/thumbnails/article-kvj.avif", alt: "Image" }), renderLogoWithTitle({ alt: "Logo", title: "Caption" })]) {
    assert.ok(renderArticleCard({ id: "direct", title: "Direct", bannerHtml: child, childrenHtml: "" }).includes(child));
    assert.ok(renderArticleCard({ id: "nested", title: "Nested", bannerHtml: renderBento({ supporting: [child] }), childrenHtml: "" }).includes(child));
  }
});
