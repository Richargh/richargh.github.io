import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import test from "node:test";
import { renderAssetImage } from "../_ui/blocks/AssetImage/AssetImage.ts";

test("AssetImage derives AVIF, SVG, PNG, and JPEG dimensions", () => {
  for (const [src, width, height] of [
    ["/assets/img/profile.avif", 160, 160],
    ["/assets/img/conferences/it-tage-25.svg", 2330, 1021],
    ["/assets/img/backlinks.png", 1260, 636],
    ["/assets/img/thumbnails/agentsec-2026-09-03-3U4YDNbLOiI.jpg", 1280, 720],
  ] as const) {
    const html = renderAssetImage({ src, alt: "Image" });
    assert.ok(html.includes(`width="${width}" height="${height}"`));
    assert.doesNotMatch(html, /loading=|class=/);
  }
});

test("AssetImage supports opt-in lazy loading and escapes attributes", () => {
  const options = { src: "/assets/img/profile.avif", alt: 'A < B & "C"', className: 'avatar "test"' };
  const html = renderAssetImage({ ...options, lazy: true });
  assert.match(html, /loading="lazy" width="160" height="160"/);
  assert.match(html, /alt="A &lt; B &amp; &quot;C&quot;"/);
  assert.match(html, /class="avatar &quot;test&quot;"/);
  assert.doesNotMatch(renderAssetImage({ ...options, lazy: false }), /loading=/);
  const versioned = renderAssetImage({ src: "/assets/img/profile.avif?v=1&theme=dark", alt: "Profile" });
  assert.match(versioned, /profile.avif\?v=1&amp;theme=dark/);
  assert.match(versioned, /width="160" height="160"/);
});

test("AssetImage rejects remote, missing, and out-of-assets images", () => {
  for (const src of ["https://example.com/image.avif", "//example.com/image.avif", "/image.avif"]) {
    assert.throws(() => renderAssetImage({ src, alt: "" }), /requires a local/);
  }
  for (const src of ["/assets/../package.json", "/assets/%2e%2e/package.json", "/assets/%2fetc/passwd"]) {
    assert.throws(() => renderAssetImage({ src, alt: "" }), /must stay inside assets/);
  }
  assert.throws(() => renderAssetImage({ src: "/assets/img/missing-image.avif", alt: "" }), /ENOENT/);
});

test("AssetImage caches dimensions, refreshes changed files, and checks existence even when cached", () => {
  const directory = mkdtempSync("assets/asset-image-test-");
  const path = `${directory}/image.svg`;
  const options = { src: `/${path}`, alt: "Fixture" };
  try {
    writeFileSync(path, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"></svg>');
    const first = renderAssetImage(options);
    assert.match(first, /width="10" height="20"/);
    assert.equal(renderAssetImage(options), first);
    writeFileSync(path, '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"></svg>');
    assert.match(renderAssetImage(options), /width="300" height="400"/);
    writeFileSync(path, "not an image");
    assert.throws(() => renderAssetImage(options));
    rmSync(path);
    assert.throws(() => renderAssetImage(options), /ENOENT/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
