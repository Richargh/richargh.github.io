import assert from "node:assert/strict";
import test from "node:test";
import * as buttonStories from "../_ui/blocks/Button/Button.stories.ts";
import * as calloutLinkStories from "../_ui/blocks/CalloutLink/CalloutLink.stories.ts";
import { renderStylesPageDocument } from "../_ui/pages/Styles/Styles.ts";
import { styleBlock } from "../_ui/StyleStory.ts";

test("CSF-inspired Button stories become named style variants", () => {
  const block = styleBlock(buttonStories);

  assert.equal(block.name, "Button");
  assert.deepEqual(block.variants.map((variant) => variant.name), ["Default", "Control", "Cross-link", "Primary", "Video"]);
  assert.match(block.variants.find((variant) => variant.name === "Primary")?.html ?? "", /button-primary/);
  assert.match(block.variants.find((variant) => variant.name === "Control")?.html ?? "", /button-control/);
});

test("CSF-inspired CalloutLink stories become named style variants", () => {
  const block = styleBlock(calloutLinkStories);

  assert.equal(block.name, "CalloutLink");
  assert.deepEqual(block.variants.map((variant) => variant.name), ["Default", "Control", "Cross-link", "Primary", "Video"]);
  assert.match(block.variants.find((variant) => variant.name === "Primary")?.html ?? "", /callout-link button-compact button-primary/);
});

test("styles page uses SiteLayout and provides an expandable variant sidebar", () => {
  const html = renderStylesPageDocument();

  assert.match(html, /<header>/);
  assert.match(html, /<nav class="styles-sidebar styles-sidebar-wide"/);
  assert.match(html, /class="styles-menu-trigger"[^>]+popovertarget="styles-menu"/);
  assert.match(html, /<nav class="styles-sidebar styles-sidebar-popover"[^>]+id="styles-menu" popover/);
  assert.ok(html.indexOf('<nav class="styles-sidebar styles-sidebar-wide"') < html.indexOf('<div class="container">'));
  assert.match(html, /<details open>/);
  assert.match(html, /<summary>Button<\/summary>/);
  assert.match(html, /<summary>CalloutLink<\/summary>/);
  assert.match(html, /href="#button-primary" data-style-link/);
  assert.match(html, /data-style-preview/);
  assert.match(html, /Primary button/);
  assert.match(html, /<scroll-to-top><\/scroll-to-top>/);
});
