import assert from "node:assert/strict";
import test from "node:test";
import { assertRelatedReferencesExist, loadRelatedGroups, parseRelatedGroups, relatedContentLinks, type CrossLinkItem } from "../lib/cross-links.ts";
import { loadArticles } from "../lib/articles.ts";
import { loadInterviews } from "../lib/interviews.ts";
import { loadTalks } from "../lib/talks.ts";

test("loads explicit related-content groups and renders bidirectional links", async () => {
  const groups = await loadRelatedGroups();

  assert.ok(groups.some((group) => group.id === "kvj"));
  assert.deepEqual(relatedContentLinks({ kind: "talk", id: "kvj" }, groups), [{ label: "Article", url: "/articles/#kvj" }]);
  assert.deepEqual(relatedContentLinks({ kind: "interview", id: "csq-rstbd" }, groups), [{ label: "Talk", url: "/talks/#rstbd" }]);
});

test("validates related-content references against known items", async () => {
  const talks = await loadTalks();
  const articles = await loadArticles();
  const interviews = await loadInterviews();
  const inventory: CrossLinkItem[] = [
    ...talks.map((talk) => ({ kind: "talk" as const, id: talk.id })),
    ...articles.map((article) => ({ kind: "article" as const, id: article.id })),
    ...interviews.map((interview) => ({ kind: "interview" as const, id: interview.id })),
  ];

  assert.doesNotThrow(() => assertRelatedReferencesExist(parseRelatedGroups("- id: ok\n  items:\n    - kind: talk\n      id: kvj\n    - kind: article\n      id: kvj\n"), inventory));
  assert.throws(
    () => assertRelatedReferencesExist(parseRelatedGroups("- id: bad\n  items:\n    - kind: talk\n      id: kvjasdas\n    - kind: article\n      id: kvj\n"), inventory),
    /group "bad" references unknown talk id "kvjasdas"\. Did you mean "kvj"\? Group items: talk:kvjasdas, article:kvj\. Known talk ids:/,
  );
});
