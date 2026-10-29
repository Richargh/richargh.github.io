import assert from "node:assert/strict";
import test from "node:test";
import { assertRelatedReferencesExist, parseRelatedGroups, relatedContentLinks, type CrossLinkItem } from "../lib/cross-links.ts";

const groups = parseRelatedGroups(`- id: example
  items:
    - kind: talk
      id: demo-talk
    - kind: article
      id: demo-article
`);
const inventory: CrossLinkItem[] = [{ kind: "talk", id: "demo-talk" }, { kind: "article", id: "demo-article" }];

test("related-content groups render bidirectional links", () => {
  assert.deepEqual(relatedContentLinks(inventory[0], groups), [{ label: "Article", url: "/articles/#demo-article" }]);
  assert.deepEqual(relatedContentLinks(inventory[1], groups), [{ label: "Talk", url: "/talks/#demo-talk" }]);
});

test("validates related-content references against known items", () => {
  assert.doesNotThrow(() => assertRelatedReferencesExist(groups, inventory));
  assert.throws(() => assertRelatedReferencesExist(groups, inventory.slice(1)), /references unknown talk id "demo-talk"/);
});
