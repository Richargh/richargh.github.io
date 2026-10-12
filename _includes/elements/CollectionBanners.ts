import { flattenArticlePublications, type Article } from "../../lib/articles.ts";
import { escapeHtml } from "../../lib/html.ts";
import { type InterviewAppearance } from "../../lib/interviews.ts";
import { flattenTalkAppearances, type Talk } from "../../lib/talks.ts";

export interface CollectionBannersOptions {
  talks: Talk[];
  articles: Article[];
  interviews: InterviewAppearance[];
}

export function renderCollectionBanners({ talks, articles, interviews }: CollectionBannersOptions): string {
  const talkAppearances = flattenTalkAppearances(talks).length;
  const articlePublications = flattenArticlePublications(articles).length;

  return `<section class="collection-banners" aria-label="Published collection">
${renderCollectionBanner({
  title: "Talks",
  href: "/talks/",
  total: talks.length,
  totalLabel: talks.length === 1 ? "talk" : "talks",
  detail: `${talkAppearances} ${talkAppearances === 1 ? "appearance" : "appearances"}`,
  topics: topicCounts(talks.map((talk) => talk.tags)),
})}
${renderCollectionBanner({
  title: "Articles",
  href: "/articles/",
  total: articles.length,
  totalLabel: articles.length === 1 ? "article" : "articles",
  detail: `${articlePublications} ${articlePublications === 1 ? "publication" : "publications"}`,
  topics: topicCounts(articles.map((article) => article.tags)),
})}
${renderCollectionBanner({
  title: "Interviews",
  href: "/interviews/",
  total: interviews.length,
  totalLabel: interviews.length === 1 ? "interview" : "interviews",
})}
</section>`;
}

interface CollectionBannerOptions {
  title: string;
  href: string;
  total: number;
  totalLabel: string;
  detail?: string;
  topics?: TopicCount[];
}

interface TopicCount {
  topic: string;
  count: number;
}

function renderCollectionBanner({ title, href, total, totalLabel, detail, topics = [] }: CollectionBannerOptions): string {
  return `<a class="collection-banner" href="${escapeHtml(href)}">
<span class="collection-banner-kicker">${escapeHtml(title)}</span>
<span class="collection-banner-total">${escapeHtml(total.toLocaleString("en"))}</span>
<span class="collection-banner-label">${escapeHtml(totalLabel)}${detail ? ` · ${escapeHtml(detail)}` : ""}</span>
${topics.length > 0 ? `<span class="collection-banner-topics">${topics.map(renderTopic).join("")}</span>` : ""}
</a>`;
}

function renderTopic({ topic, count }: TopicCount): string {
  return `<span>${escapeHtml(formatTopic(topic))} <strong>${escapeHtml(count.toLocaleString("en"))}</strong></span>`;
}

function topicCounts(tagGroups: string[][]): TopicCount[] {
  const counts = new Map<string, number>();
  for (const tags of tagGroups) {
    for (const tag of new Set(tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .toSorted((left, right) => right.count - left.count || left.topic.localeCompare(right.topic));
}

function formatTopic(topic: string): string {
  return topic.replaceAll("-", " ");
}
