import { flattenArticlePublications, type Article, type ArticlePublication } from "./articles.ts";
import type { FeedEntry } from "./site-resources.ts";
import { flattenTalkAppearances, type Talk, type TalkAppearance } from "./talks.ts";

export function upcomingFeedEntries(talks: Talk[], articles: Article[]): FeedEntry[] {
  return [
    ...flattenTalkAppearances(talks).filter(hasUpcomingSince).map(talkUpcomingFeedEntry),
    ...flattenArticlePublications(articles).filter(hasUpcomingSince).map(articleUpcomingFeedEntry),
  ];
}

function talkUpcomingFeedEntry(appearance: TalkAppearance & { upcomingSince: string }): FeedEntry {
  return {
    title: `Upcoming talk: ${appearance.title}`,
    idPath: `/talks/#upcoming-${encodeId([appearance.talkId, appearance.conference, appearance.date])}`,
    linkPath: "/talks/#upcoming",
    date: appearance.upcomingSince,
    summary: `New upcoming talk: ${appearance.title} at ${appearance.conference} on ${appearance.date}${formatLanguage(appearance.language)}${formatTalkLocation(appearance)}.`,
  };
}

function articleUpcomingFeedEntry(publication: ArticlePublication & { upcomingSince: string }): FeedEntry {
  return {
    title: `Upcoming article: ${publication.articleTitle}`,
    idPath: `/articles/#upcoming-${encodeId([publication.articleId, publication.part ?? "", publication.publisher, publication.date, publication.language ?? ""])}`,
    linkPath: "/articles/#upcoming",
    date: publication.upcomingSince,
    summary: `New upcoming article: ${publication.articleTitle} at ${publication.publisher} on ${publication.date}${formatLanguage(publication.language)}.`,
  };
}

function hasUpcomingSince<T extends { upcomingSince?: string }>(item: T): item is T & { upcomingSince: string } {
  return item.upcomingSince !== undefined;
}

function formatLanguage(language: string | undefined): string {
  if (!language) return "";
  if (language === "de") return " in German";
  if (language === "en") return " in English";
  return ` in ${language}`;
}

function formatTalkLocation(appearance: TalkAppearance): string {
  if (appearance.location === "remote") return " (remote)";
  const place = [appearance.city, appearance.country].filter(Boolean).join(", ");
  return place ? ` (${place})` : ` (${appearance.location})`;
}

function encodeId(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}
