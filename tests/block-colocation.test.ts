import assert from "node:assert/strict";
import test from "node:test";
import { renderPostMeta } from "../_ui/blocks/ContentMeta/ContentMeta.ts";
import { renderFeedList } from "../_ui/blocks/FeedList/FeedList.ts";
import { renderFooter } from "../_ui/blocks/Footer/Footer.ts";
import { renderHeader } from "../_ui/blocks/Header/Header.ts";
import { renderArticleCard } from "../_ui/blocks/ArticleCard/ArticleCard.ts";
import { renderCollectionBanners } from "../_ui/blocks/CollectionBanners/CollectionBanners.ts";
import { appCounters, renderArticleStats } from "../_ui/blocks/CollectionStats/CollectionStats.ts";
import { renderNavItem } from "../_ui/blocks/NavItem/NavItem.ts";
import { renderUpcomingCollection } from "../_ui/blocks/UpcomingCollection/UpcomingCollection.ts";
import { renderLayout as renderSiteLayout } from "../_ui/layouts/SiteLayout/SiteLayout.ts";
import { renderBuiltPageDocument } from "../_ui/pages/Built/Built.ts";
import { renderCredentialsPageDocument } from "../_ui/pages/Credentials/Credentials.ts";
import { renderHomePageDocument } from "../_ui/pages/Home/Home.ts";
import { renderPublishedPageDocument } from "../_ui/pages/Published/Published.ts";
import type { Page } from "../lib/content.ts";

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
  assert.match(renderArticleStats([]), /class="collection-stats"/);
  assert.equal(renderUpcomingCollection(empty), "");
});

test("ArticleCard block renders banner, actions, and children", () => {
  const html = renderArticleCard({ id: "card", title: "Title", banner: { tags: ["one"], linkUrl: "/watch", linkLabel: "Watch" }, actionsHtml: "<a>Action</a>", childrenHtml: "<p>Body</p>" });

  assert.match(html, /<section class="article-card" id="card">/);
  assert.match(html, /class="article-card-actions"/);
  assert.match(html, /<p>Body<\/p>/);
});

test("SiteLayout renders the site shell", () => {
  const options = { title: "Page <Title>", urlPath: "/posts/page/", content: "<main><h1>Body</h1></main>" };
  const html = renderSiteLayout(options);

  assert.match(html, /<div class="container">/);
  assert.match(html, /<main><h1>Body<\/h1><\/main>/);
  assert.match(html, /id="scroll-to-top"/);
});

test("page renderers own page presentation markup", () => {
  const page = (slug: string, title: string): Page => ({
    sourcePath: `_pages/${slug}.adoc`,
    title,
    slug,
    urlPath: slug === "home" ? "/" : `/${slug}/`,
    comments: false,
    html: "<p>Body</p>",
    excerpt: "Body",
  });

  assert.match(renderHomePageDocument({ page: page("home", "About"), talks: [], articles: [], interviews: [] }), /data-source="_pages\/home.adoc"/);
  assert.match(renderPublishedPageDocument(page("published", "Published")), /data-source="_pages\/published.adoc"/);
  assert.match(renderBuiltPageDocument(page("built", "Built")), /data-source="_pages\/built.adoc"/);
  assert.match(renderCredentialsPageDocument(page("credentials", "Credentials")), /data-source="_pages\/credentials.adoc"/);
});
