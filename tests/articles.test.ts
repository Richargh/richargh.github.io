import assert from "node:assert/strict";
import test from "node:test";
import { parseArticles } from "../lib/articles.ts";

test("validates required fields, dates, URLs, unknown fields, and duplicates", () => {
  assert.throws(() => parseArticles("- id: x1\n  articles: []\n"), /title is required/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles: []\n"), /articles must be a non-empty sequence/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles:\n    - publications: []\n"), /publications must be a non-empty sequence/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles:\n    - publications:\n        - publisher: Pub\n          date: 2025-02-30\n          url: https://example.com\n"), /ISO date/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles:\n    - publications:\n        - publisher: Pub\n          date: 2025-01-01\n          url: /relative\n"), /absolute http\(s\) URL/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles:\n    - publications:\n        - publisher: Pub\n          date: 2025-01-01\n          url: https://example.com\n          pages: 3\n"), /unknown field: pages/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles:\n    - publications:\n        - publisher: Pub\n          date: 2025-01-01\n"), /url is required unless upcoming is true/);
  assert.throws(() => parseArticles("- id: x1\n  title: Article\n  articles:\n    - publications:\n        - publisher: Pub\n          date: 2025-01-01\n          url: https://example.com\n- id: x2\n  title: Article\n  articles:\n    - publications:\n        - publisher: Pub\n          date: 2025-01-01\n          url: https://example.com\n"), /duplicate article publication/);
});
