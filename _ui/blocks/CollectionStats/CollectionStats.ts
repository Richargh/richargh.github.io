import { flattenArticlePublications, type Article, type ArticlePublication } from "../../../lib/articles.ts";
import { escapeHtml } from "../../../lib/html.ts";
import { renderCalloutLink } from "../CalloutLink/CalloutLink.ts";
import { type InterviewAppearance } from "../../../lib/interviews.ts";
import { flattenTalkAppearances, type Talk, type TalkAppearance } from "../../../lib/talks.ts";

export interface AppCounters {
  appearances: number;
  publications: number;
  interviews: number;
}

export interface CollectionStatsData {
  talks: Talk[];
  articles: Article[];
  interviews: InterviewAppearance[];
}

export function appCounters({ talks, articles, interviews }: CollectionStatsData): AppCounters {
  return {
    appearances: flattenTalkAppearances(talks).length,
    publications: flattenArticlePublications(articles).length,
    interviews: interviews.length,
  };
}

export function renderSummaryStats(data: CollectionStatsData): string {
  const counters = appCounters(data);
  return renderLinkedStatsSummary([
    linkedStat("/talks/", counters.appearances, "talks"),
    linkedStat("/articles/", counters.publications, "articles"),
    linkedStat("/interviews/", counters.interviews, "interviews"),
  ]);
}

export function renderTalkStats(talks: Talk[]): string {
  const appearances = flattenTalkAppearances(talks);
  const topics = countValues(appearances, (appearance) => appearance.talkTitle);
  const conferences = countValues(appearances, (appearance) => appearance.conference);
  const cities = countValues(appearances, formatCityCountry);
  const countries = countValues(appearances, (appearance) => appearance.country);
  return renderStatsSummary("talks", [
    stat("talks", appearances.length, "talks", appearances.toSorted(compareTalkAppearancesByName).map(formatTalkAppearance)),
    stat("topics", topics.length, "topics", topics.map(formatCountedEntry)),
    stat("conferences", conferences.length, "conferences", conferences.map(formatCountedEntry)),
    stat("cities", cities.length, "cities", cities.map(formatCountedEntry)),
    stat("countries", countries.length, "countries", countries.map(formatCountedEntry)),
  ]);
}

export function renderArticleStats(articles: Article[]): string {
  const publications = flattenArticlePublications(articles);
  const topics = countValues(publications, (publication) => publication.articleTitle);
  const publishers = countValues(publications, (publication) => publication.publisher);
  return renderStatsSummary("articles", [
    stat("articles", publications.length, "articles", publications.map(formatArticlePublication)),
    stat("topics", topics.length, "topics", topics.map(formatCountedEntry)),
    stat("publishers", publishers.length, "publishers", publishers.map(formatCountedEntry)),
  ]);
}

export function renderInterviewStats(interviews: InterviewAppearance[]): string {
  return renderStatsSummary("interviews", [
    stat("interviews", interviews.length, "interviews", interviews.map(formatInterview)),
  ]);
}

interface StatItem {
  id: string;
  value: number;
  label: string;
  entries: string[];
}

interface LinkedStatItem {
  href: string;
  value: number;
  label: string;
}

function stat(id: string, value: number, label: string, entries: string[]): StatItem {
  return { id, value, label, entries };
}

function linkedStat(href: string, value: number, label: string): LinkedStatItem {
  return { href, value, label };
}

function renderLinkedStatsSummary(items: LinkedStatItem[]): string {
  return `<section class="collection-stats" aria-label="Content collections">
${items.map(renderLinkedMetric).join("\n")}
</section>`;
}

function renderLinkedMetric(item: LinkedStatItem): string {
  return `<span class="collection-stats-item">${renderCalloutLink({ href: item.href, label: `${item.value.toLocaleString("en")} ${item.label}`, utilities: ["button-compact", "button-muted"] })}</span>`;
}

function renderStatsSummary(scope: string, items: StatItem[]): string {
  return `<section class="collection-stats" aria-label="Collection stats">
${items.map((item) => renderMetric(scope, item)).join("\n")}
</section>`;
}

function renderMetric(scope: string, item: StatItem): string {
  const popoverId = `collection-stats-${scope}-${item.id}`;
  return `<span class="collection-stats-item">
<button class="collection-stat" type="button" popovertarget="${escapeHtml(popoverId)}" aria-label="Show counted ${escapeHtml(item.label)}"><strong>${escapeHtml(item.value.toLocaleString("en"))}</strong> ${escapeHtml(item.label)}</button>
<div class="collection-stats-popover" id="${escapeHtml(popoverId)}" popover>
<h2>${escapeHtml(item.value.toLocaleString("en"))} ${escapeHtml(item.label)}</h2>
<ol>
${item.entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("\n")}
</ol>
</div>
</span>`;
}

function formatTalkAppearance(appearance: TalkAppearance): string {
  return `${appearance.title} — ${appearance.conference}, ${appearance.date}`;
}

function compareTalkAppearancesByName(left: TalkAppearance, right: TalkAppearance): number {
  return left.title.localeCompare(right.title) || left.conference.localeCompare(right.conference) || left.date.localeCompare(right.date);
}

function formatArticlePublication(publication: ArticlePublication): string {
  const part = [publication.part ? `Part ${publication.part}` : undefined, publication.subtitle].filter(Boolean).join(" — ");
  return `${publication.articleTitle}${part ? ` (${part})` : ""} — ${publication.publisher}, ${publication.date}`;
}

function formatInterview(interview: InterviewAppearance): string {
  return `${interview.title} — ${interview.show}, ${interview.date}`;
}

interface CountedEntry {
  label: string;
  count: number;
}

function formatCityCountry(appearance: TalkAppearance): string | undefined {
  if (!appearance.city || !appearance.country) return undefined;
  return `${appearance.city}, ${appearance.country}`;
}

function formatCountedEntry(entry: CountedEntry): string {
  return `${entry.label} — ${entry.count}×`;
}

function countValues<T>(items: T[], valueFor: (item: T) => string | undefined): CountedEntry[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = valueFor(item);
    if (value === undefined || value.trim() === "") continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .toSorted((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}
