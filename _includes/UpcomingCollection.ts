import { flattenArticlePublications, type Article, type ArticlePublication } from "../lib/articles.ts";
import { escapeHtml } from "../lib/html.ts";
import { type InterviewAppearance } from "../lib/interviews.ts";
import { flattenTalkAppearances, type Talk, type TalkAppearance } from "../lib/talks.ts";

export interface UpcomingCollectionOptions {
  talks: Talk[];
  articles: Article[];
  interviews: InterviewAppearance[];
}

export function renderUpcomingCollection({ talks, articles, interviews }: UpcomingCollectionOptions): string {
  const today = new Date().toISOString().slice(0, 10);
  const cards = [
    ...flattenTalkAppearances(talks).filter((appearance) => appearance.upcoming).map((appearance) => ({ date: appearance.date, html: renderUpcomingTalk(appearance) })),
    ...flattenArticlePublications(articles).filter((publication) => publication.upcoming).map((publication) => ({ date: publication.date, html: renderUpcomingArticle(publication) })),
    ...interviews.filter((interview) => interview.date >= today).map((interview) => ({ date: interview.date, html: renderUpcomingInterview(interview) })),
  ]
    .toSorted(compareByDateAscending)
    .map((item) => item.html)
    .join("\n");

  if (!cards) return "";
  return `<section class="upcoming-collection" aria-labelledby="upcoming-collection-heading">
<div class="upcoming-collection-heading">
<h2 id="upcoming-collection-heading">Upcoming</h2>
<p>Next chances to catch new talks, articles, and interviews.</p>
</div>
<div class="upcoming-card-grid">
${cards}
</div>
</section>`;
}

function renderUpcomingTalk(appearance: TalkAppearance): string {
  return renderUpcomingCard({
    kind: "Talk",
    title: appearance.title,
    meta: `${appearance.conference} · ${appearance.date}`,
    detail: [appearance.city, appearance.country].filter(Boolean).join(", ") || appearance.location,
    url: appearance.eventUrl,
  });
}

function renderUpcomingArticle(publication: ArticlePublication): string {
  const part = [publication.part ? `Part ${publication.part}` : undefined, publication.subtitle].filter(Boolean).join(" · ");
  return renderUpcomingCard({
    kind: "Article",
    title: publication.articleTitle,
    meta: `${publication.publisher} · ${publication.date}`,
    detail: part,
    url: publication.url,
  });
}

function renderUpcomingInterview(interview: InterviewAppearance): string {
  return renderUpcomingCard({
    kind: "Interview",
    title: interview.title,
    meta: `${interview.show} · ${interview.date}`,
    detail: interview.type,
    url: interview.url,
  });
}

interface UpcomingCardOptions {
  kind: string;
  title: string;
  meta: string;
  detail?: string;
  url?: string;
}

function renderUpcomingCard({ kind, title, meta, detail, url }: UpcomingCardOptions): string {
  const content = `<span class="upcoming-card-kind">${escapeHtml(kind)}</span>
<span class="upcoming-card-title">${escapeHtml(title)}</span>
<span class="upcoming-card-meta">${escapeHtml(meta)}</span>
${detail ? `<span class="upcoming-card-detail">${escapeHtml(detail)}</span>` : ""}`;
  if (url) return `<a class="upcoming-card" href="${escapeHtml(url)}">${content}</a>`;
  return `<div class="upcoming-card">${content}</div>`;
}

function compareByDateAscending(left: { date: string }, right: { date: string }): number {
  return left.date.localeCompare(right.date);
}
