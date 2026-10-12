import { flattenArticlePublications, type Article, type ArticlePublication } from "../../lib/articles.ts";
import { escapeHtml } from "../../lib/html.ts";
import { type InterviewAppearance } from "../../lib/interviews.ts";
import { flattenTalkAppearances, type Talk, type TalkAppearance } from "../../lib/talks.ts";

export interface UpcomingCollectionOptions {
  talks: Talk[];
  articles: Article[];
  interviews: InterviewAppearance[];
}

export function renderUpcomingCollection({ talks, articles, interviews }: UpcomingCollectionOptions): string {
  return renderUpcomingSection({
    description: "Next chances to catch new talks, articles, and interviews.",
    items: [
      ...upcomingTalks(talks).map((appearance) => ({ date: appearance.date, html: renderUpcomingTalk(appearance) })),
      ...upcomingArticles(articles).map((publication) => ({ date: publication.date, html: renderUpcomingArticle(publication) })),
      ...upcomingInterviews(interviews).map((interview) => ({ date: interview.date, html: renderUpcomingInterview(interview) })),
    ],
  });
}

export function renderUpcomingTalks(talks: Talk[]): string {
  return renderUpcomingSection({
    description: "Upcoming talks.",
    items: upcomingTalks(talks).map((appearance) => ({ date: appearance.date, html: renderUpcomingTalk(appearance) })),
  });
}

export function renderUpcomingArticles(articles: Article[]): string {
  return renderUpcomingSection({
    description: "Upcoming articles.",
    items: upcomingArticles(articles).map((publication) => ({ date: publication.date, html: renderUpcomingArticle(publication) })),
  });
}

export function renderUpcomingInterviews(interviews: InterviewAppearance[]): string {
  return renderUpcomingSection({
    description: "Upcoming interviews.",
    items: upcomingInterviews(interviews).map((interview) => ({ date: interview.date, html: renderUpcomingInterview(interview) })),
  });
}

function renderUpcomingSection({ description, items }: { description: string; items: { date: string; html: string }[] }): string {
  const sortedItems = items.toSorted(compareByDateAscending).map((item) => item.html).join("\n");
  if (!sortedItems) return "";
  return `<section class="upcoming-items" id="upcoming" aria-labelledby="upcoming-heading">
<div class="upcoming-items-heading">
<h2 id="upcoming-heading">Upcoming</h2>
<p>${escapeHtml(description)}</p>
</div>
<ul class="upcoming-list">
${sortedItems}
</ul>
</section>`;
}

function upcomingTalks(talks: Talk[]): TalkAppearance[] {
  return flattenTalkAppearances(talks).filter(isUpcoming);
}

function upcomingArticles(articles: Article[]): ArticlePublication[] {
  return flattenArticlePublications(articles).filter(isUpcoming);
}

function upcomingInterviews(interviews: InterviewAppearance[]): InterviewAppearance[] {
  const today = new Date().toISOString().slice(0, 10);
  return interviews.filter((interview) => interview.date >= today);
}

function renderUpcomingTalk(appearance: TalkAppearance): string {
  return renderUpcomingItem({
    kind: "Talk",
    title: appearance.title,
    meta: `${appearance.conference} · ${appearance.date}${renderLanguageFlag(appearance.language)}`,
    detail: [appearance.city, appearance.country].filter(Boolean).join(", ") || appearance.location,
    url: appearance.eventUrl,
    isNew: isNew(appearance.upcomingSince),
  });
}

function renderUpcomingArticle(publication: ArticlePublication): string {
  const part = [publication.part ? `Part ${publication.part}` : undefined, publication.subtitle].filter(Boolean).join(" · ");
  return renderUpcomingItem({
    kind: "Article",
    title: publication.articleTitle,
    meta: `${publication.publisher} · ${publication.date}${renderLanguageFlag(publication.language)}`,
    detail: part,
    url: publication.url,
    isNew: isNew(publication.upcomingSince),
  });
}

function renderUpcomingInterview(interview: InterviewAppearance): string {
  return renderUpcomingItem({
    kind: "Interview",
    title: interview.title,
    meta: `${interview.show} · ${interview.date}${renderLanguageFlag(interview.language)}`,
    detail: interview.type,
    url: interview.url,
  });
}

interface UpcomingItemOptions {
  kind: string;
  title: string;
  meta: string;
  detail?: string;
  url?: string;
  isNew?: boolean;
}

function renderUpcomingItem({ kind, title, meta, detail, url, isNew = false }: UpcomingItemOptions): string {
  const content = `<span class="upcoming-item-kind">${escapeHtml(kind)}</span>
<span class="upcoming-item-main">
<span class="upcoming-item-title">${escapeHtml(title)}</span>
<span class="upcoming-item-meta">${escapeHtml([meta, detail].filter(Boolean).join(" · "))}</span>
</span>
${isNew ? `<span class="upcoming-new">New</span>` : ""}`;
  const item = url ? `<a class="upcoming-item" href="${escapeHtml(url)}">${content}</a>` : `<div class="upcoming-item">${content}</div>`;
  return `<li>${item}</li>`;
}

function renderLanguageFlag(language: string | undefined): string {
  if (language === "de") return " · 🇩🇪";
  if (language === "en") return " · 🇬🇧";
  return "";
}

function isUpcoming(item: { upcoming?: boolean; upcomingSince?: string }): boolean {
  return item.upcoming === true || item.upcomingSince !== undefined;
}

function isNew(upcomingSince: string | undefined): boolean {
  if (!upcomingSince) return false;
  const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  const announced = Date.parse(`${upcomingSince}T00:00:00Z`);
  const week = 7 * 24 * 60 * 60 * 1000;
  return announced <= today && today - announced < week;
}

function compareByDateAscending(left: { date: string }, right: { date: string }): number {
  return left.date.localeCompare(right.date);
}
