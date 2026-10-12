import assert from "node:assert/strict";
import test from "node:test";
import { renderPostMeta } from "../_ui/blocks/ContentMeta/ContentMeta.ts";
import { renderContextMenu } from "../_ui/blocks/ContextMenu/ContextMenu.ts";
import { renderFeedList } from "../_ui/blocks/FeedList/FeedList.ts";
import { renderFooter } from "../_ui/blocks/Footer/Footer.ts";
import { renderHeader } from "../_ui/blocks/Header/Header.ts";
import { renderArticleCard } from "../_ui/blocks/ArticleCard/ArticleCard.ts";
import { renderCollectionBanners } from "../_ui/blocks/CollectionBanners/CollectionBanners.ts";
import { appCounters, renderArticleStats } from "../_ui/blocks/CollectionStats/CollectionStats.ts";
import { renderNavItem } from "../_ui/blocks/NavItem/NavItem.ts";
import { renderUpcomingCollection } from "../_ui/blocks/UpcomingCollection/UpcomingCollection.ts";
import { renderLayout as renderSiteLayout } from "../_ui/layouts/SiteLayout/SiteLayout.ts";

function normalized(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

test("Header block renders navigation, counters, and optional back link", () => {
  const html = normalized(renderHeader({ showBackToHome: true, appCounters: { appearances: 1, publications: 2, interviews: 3 } }));

  assert.match(html, /<header>/);
  assert.match(html, /class="dashboard disable-select"/);
  assert.match(html, /class="app-counter">1<\/span>/);
  assert.match(html, /class="back-p">Home<\/p>/);
});

test("simple blocks render their expected root markup", () => {
  assert.match(renderFooter(), /id="copyright"/);
  assert.match(renderContextMenu({ enabled: true }), /class="context-menu"/);
  assert.equal(renderContextMenu({ enabled: false }), "");
  assert.match(renderNavItem({ className: "blog", href: "/posts", label: "Blog", iconHtml: "<svg></svg>", labelClassName: "blog-p", counter: 5 }), /class="blog nav-item"/);
});

test("content blocks render feed entries and metadata tags", () => {
  const post = { title: "A post", excerpt: "Excerpt", urlPath: "/posts/a/", date: "2024-01-02", tags: ["tag"], status: "ongoing" } as never;

  assert.match(renderFeedList([post]), /class="feed-title-excerpt-block/);
  assert.match(renderPostMeta(post), /href="\/tags\/#tag"/);
});

test("collection blocks render summaries", () => {
  const empty = { talks: [], articles: [], interviews: [] };

  assert.deepEqual(appCounters(empty), { appearances: 0, publications: 0, interviews: 0 });
  assert.match(renderCollectionBanners(empty), /class="collection-banners"/);
  assert.match(renderArticleStats([]), /class="collection-metrics"/);
  assert.equal(renderUpcomingCollection(empty), "");
});

test("ArticleCard block renders banner, actions, and children", () => {
  const html = renderArticleCard({ id: "card", title: "Title", banner: { tags: ["one"], linkUrl: "/watch", linkLabel: "Watch" }, actionsHtml: "<a>Action</a>", childrenHtml: "<p>Body</p>" });

  assert.match(html, /<section class="talk-card" id="card">/);
  assert.match(html, /class="talk-card-actions"/);
  assert.match(html, /<p>Body<\/p>/);
});

test("SiteLayout renders the site shell", () => {
  const options = { title: "Page <Title>", urlPath: "/posts/page/", content: "<main><h1>Body</h1></main>", showContextMenu: false };
  const html = renderSiteLayout(options);

  assert.match(html, /<div class="container">/);
  assert.match(html, /<main><h1>Body<\/h1><\/main>/);
  assert.match(html, /id="scroll-to-top"/);
});
