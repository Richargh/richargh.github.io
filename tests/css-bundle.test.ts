import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildCssBundle } from "../scripts/build-css.ts";

class CssBundleBuilder {
  readonly root: string;

  private constructor(root: string) {
    this.root = root;
  }

  static async create(): Promise<CssBundleBuilder> {
    return new CssBundleBuilder(await mkdtemp(join(tmpdir(), "css-bundle-")));
  }

  async withCss(path: string, css: string): Promise<string> {
    const fullPath = join(this.root, path);
    await mkdir(join(fullPath, ".."), { recursive: true });
    await writeFile(fullPath, css, "utf8");
    return fullPath;
  }
}

test("buildCssBundle concatenates global, layout, block, and page CSS sources in bundle order", async () => {
  const fixture = await CssBundleBuilder.create();
  const base = await fixture.withCss("_styles/20-base.css", ".base-order { order: 1; }");
  const home = await fixture.withCss("_ui/pages/Home/Home.css", ".home-order { order: 4; }");
  const header = await fixture.withCss("_ui/blocks/Header/Header.css", ".header-order { order: 3; }");
  const siteLayout = await fixture.withCss("_ui/layouts/SiteLayout/SiteLayout.css", ".layout-order { order: 2; }");

  const bundle = await buildCssBundle([base, home, header, siteLayout]);

  assert.ok(bundle.indexOf(".base-order") < bundle.indexOf(".layout-order"));
  assert.ok(bundle.indexOf(".layout-order") < bundle.indexOf(".header-order"));
  assert.ok(bundle.indexOf(".header-order") < bundle.indexOf(".home-order"));
});

test("semantic properties use light-dark colors and avoid numbered raw gray tokens", async () => {
  const bundle = await buildCssBundle(["_styles/01-properties.css"]);

  assert.match(bundle, /--color-background:\s*light-dark\(/);
  assert.doesNotMatch(bundle, /--gray-0\b/);
});

test("base element styles are bundled before global layout styles", async () => {
  const bundle = await buildCssBundle(["_styles/20-base.css", "_styles/30-global-layout.css"]);

  for (const selector of ["h1", "p", "a", "img", "code", "table"]) {
    assert.ok(bundle.includes(`${selector} {`) || bundle.includes(`${selector},`), `missing ${selector} selector`);
  }
  assert.ok(bundle.indexOf("h1") < bundle.indexOf(".container"));
});

test("global layout styles are bundled after base element styles", async () => {
  const bundle = await buildCssBundle(["_styles/20-base.css", "_styles/30-global-layout.css"]);

  for (const selector of [".container", ".box", "main"] as const) {
    assert.ok(bundle.includes(`${selector} {`), `missing ${selector} selector`);
  }
  assert.ok(bundle.indexOf(".container") > bundle.indexOf("h1"));
});

test("utility styles are bundled after global layout styles", async () => {
  const bundle = await buildCssBundle(["_styles/30-global-layout.css", "_styles/40-utilities.css"]);

  for (const selector of [".serif", ".regular-sans", ".disable-select", ".very-small"] as const) {
    assert.ok(bundle.includes(`${selector} {`), `missing ${selector} selector`);
  }
  assert.ok(bundle.indexOf(".serif") > bundle.indexOf(".container"));
});

test("block CSS is bundled after global layout styles", async () => {
  const bundle = await buildCssBundle(["_styles/30-global-layout.css", "_ui/blocks/Header/Header.css", "_ui/blocks/Footer/Footer.css"]);

  for (const selector of ["header", ".site-heading", "#copyright"] as const) {
    assert.ok(bundle.includes(`${selector} {`), `missing ${selector} selector`);
  }
  assert.ok(bundle.indexOf(".site-heading") > bundle.indexOf(".container"));
});

test("reusable block CSS includes phase 2 block selectors", async () => {
  const bundle = await buildCssBundle([
    "_ui/blocks/ArticleCard/ArticleCard.css",
    "_ui/blocks/CollectionBanners/CollectionBanners.css",
    "_ui/blocks/CollectionStats/CollectionStats.css",
    "_ui/blocks/ContentMeta/ContentMeta.css",
    "_ui/blocks/ContextMenu/ContextMenu.css",
    "_ui/blocks/FeedList/FeedList.css",
    "_ui/blocks/NavItem/NavItem.css",
    "_ui/blocks/UpcomingCollection/UpcomingCollection.css",
  ]);

  for (const selector of [".talk-card", ".collection-banner", ".collection-metric", ".tag", ".context-menu", ".feed-title", ".nav-item-link", ".upcoming-items"] as const) {
    assert.ok(bundle.includes(`${selector} {`), `missing ${selector} selector`);
  }
});
