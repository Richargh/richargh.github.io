import assert from "node:assert/strict";
import test from "node:test";
import { parseArticles } from "../lib/articles.ts";
import { renderArticlesDocument } from "../_ui/pages/Articles/Articles.ts";
import { publishedArticleFeedEntries } from "../lib/published-article-feed.ts";
import { renderAtomFeed } from "../lib/site-resources.ts";

const source = `- id: example
  title: Code & Design
  articles:
    - part: 1/2
      subtitle: Getting started
      publications:
        - publisher: Magazine
          issue: '42'
          date: '2025-01-01'
          language: en
          url: https://example.com/article
        - publisher: Magazin
          date: '2025-02-01'
          language: de
          url: https://example.com/artikel
        - publisher: Future
          date: '2026-01-01'
          url: https://example.com/future
        - publisher: Upcoming
          date: '2025-01-01'
          upcoming: true
        - publisher: Announced
          date: '2025-01-01'
          upcomingSince: '2024-12-01'
    - upcoming: true
      publications:
        - publisher: Upcoming part
          date: '2025-01-01'
          url: https://example.com/upcoming-part
`;

test("published article feed includes each released publication, but not future or upcoming articles", () => {
  const articles = parseArticles(source);
  const entries = publishedArticleFeedEntries(articles, "2025-02-01");
  assert.equal(entries.length, 2);
  assert.equal(entries[0].title, "Published article: Code & Design — Part 1/2 — Getting started");
  assert.equal(entries[0].date, "2025-01-01");
  assert.equal(entries[0].linkPath, "/articles/#example-part-1-2");
  const html = renderArticlesDocument(articles);
  assert.match(html, /<h3 id="example-part-1-2"><a href="#example-part-1-2">Part 1\/2 - Getting started<\/a><\/h3>/);
  assert.match(entries[0].summary!, /Magazine 42 on 2025-01-01/);
  assert.notEqual(entries[0].idPath, entries[1].idPath);
  articles[0].articles[0].publications[0].url = "https://example.com/new-url";
  assert.equal(publishedArticleFeedEntries(articles, "2025-02-01")[0].idPath, entries[0].idPath);
  assert.deepEqual(publishedArticleFeedEntries([], "2025-02-01"), []);
});

test("Atom feed renders publication dates, article part links, escaped titles, and newest publications first", async () => {
  const xml = await renderAtomFeed([], publishedArticleFeedEntries(parseArticles(source), "2025-02-01"));
  assert.match(xml, /Code &amp; Design/);
  assert.match(xml, /https:\/\/richargh.de\/articles\/#example-part-1-2/);
  assert.match(xml, /<updated>2025-01-01T00:00:00/);
  const entries = xml.split("<entry>").slice(1);
  assert.match(entries[0], /<updated>2025-02-01T00:00:00/);
  assert.match(entries[1], /<updated>2025-01-01T00:00:00/);
});
