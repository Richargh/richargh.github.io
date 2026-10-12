import { renderArticleCard as renderSharedArticleCard } from "../../_includes/elements/ArticleCard.ts";
import { appCounters, renderArticleStats } from "../../_includes/elements/CollectionStats.ts";
import { renderUpcomingArticles } from "../../_includes/elements/UpcomingCollection.ts";
import { renderLayout } from "../../_layouts/Layout.ts";
import { loadArticles, type Article, type ArticlePart, type ArticlePublication } from "../../lib/articles.ts";
import { assertRelatedReferencesExist, loadRelatedGroups, type CrossLink, type CrossLinkItem, type RelatedGroup, relatedContentLinks } from "../../lib/cross-links.ts";
import { escapeHtml } from "../../lib/html.ts";
import { loadInterviews, type InterviewAppearance } from "../../lib/interviews.ts";
import { loadTalks, type Talk } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  const [articles, talks, interviews, relatedGroups] = await Promise.all([loadArticles(), loadTalks(), loadInterviews(), loadRelatedGroups()]);
  return renderArticlesDocument(articles, talks, interviews, relatedGroups);
}

export function renderArticlesDocument(articles: Article[], talks: Talk[] = [], interviews: InterviewAppearance[] = [], relatedGroups: RelatedGroup[] = []): string {
  const sortedArticles = articles.toSorted(compareArticlesDescending);
  assertRelatedReferencesExist(relatedGroups, relatedItems(talks, articles, interviews));
  return renderLayout({
    title: "Articles",
    urlPath: "/articles/",
    description: "Articles by Richard Groß",
    type: "website",
    showBackToHome: true,
    appCounters: appCounters({ talks, articles, interviews }),
    content: `<main>
                <article data-source="_data/articles.yaml">
                  <h1>Articles</h1>
                  ${renderArticleStats(articles)}
                  ${renderUpcomingArticles(articles)}
                  <div class="content talks-cards">
                    ${sortedArticles.map((article) => renderArticleCard(article, relatedGroups)).join("\n")}
                  </div>
                </article>
            </main>`,
  });
}

function renderArticleCard(article: Article, relatedGroups: RelatedGroup[]): string {
  return renderSharedArticleCard({
    id: article.id,
    title: article.title,
    banner: {
      thumbnail: article.thumbnail,
      tags: article.tags,
    },
    actionsHtml: renderCrossLinks(relatedContentLinks({ id: article.id, kind: "article" }, relatedGroups)),
    childrenHtml: article.articles.toSorted(comparePartsAscending).map(renderArticlePart).join("\n"),
  });
}

function relatedItems(talks: Talk[], articles: Article[], interviews: InterviewAppearance[]): CrossLinkItem[] {
  return [
    ...talks.map((talk) => ({ id: talk.id, kind: "talk" as const })),
    ...articles.map((article) => ({ id: article.id, kind: "article" as const })),
    ...interviews.map((interview) => ({ id: interview.id, kind: "interview" as const })),
  ];
}

function renderCrossLinks(links: CrossLink[]): string {
  return links.map((link) => `<a class="talk-resource-button talk-card-code talk-cross-link-button" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(" ");
}

function renderArticlePart(part: ArticlePart): string {
  const heading = [part.part ? `Part ${part.part}` : undefined, part.subtitle].filter(Boolean).join(" - ");
  return `<div class="article-part">
${heading ? `<h3>${escapeHtml(heading)}</h3>` : ""}
<ul class="talk-appearances-list">
${part.publications.toSorted(comparePublicationsDescending).map(renderPublicationLine).join("\n")}
</ul>
</div>`;
}

function renderPublicationLine(publication: ArticlePublication): string {
  const label = publication.issue ? `${publication.publisher} ${publication.issue}` : publication.publisher;
  const linkedLabel = publication.url ? `<a href="${escapeHtml(publication.url)}">${escapeHtml(label)}</a>` : escapeHtml(label);
  return `<li class="talk-appearance-line">
<span class="talk-line-main">${linkedLabel} <span class="talk-duration">${escapeHtml(publication.date)}</span>${publication.upcoming || publication.upcomingSince ? ` <span class="talk-upcoming">Upcoming ${escapeHtml(publication.date)}</span>` : ""} ${renderLanguageFlag(publication.language)}</span>
</li>`;
}

function renderLanguageFlag(language: string | undefined): string {
  if (language === "de") return "🇩🇪";
  if (language === "en") return "🇬🇧";
  return "";
}

function compareArticlesDescending(left: Article, right: Article): number {
  return newestPublicationDate(right).localeCompare(newestPublicationDate(left)) || left.title.localeCompare(right.title);
}

function newestPublicationDate(article: Article): string {
  return article.articles.flatMap((part) => part.publications).toSorted(comparePublicationsDescending)[0]?.date ?? "";
}

function comparePartsAscending(left: ArticlePart, right: ArticlePart): number {
  return oldestPublicationDate(left).localeCompare(oldestPublicationDate(right));
}

function oldestPublicationDate(part: ArticlePart): string {
  return part.publications.toSorted((left, right) => left.date.localeCompare(right.date))[0]?.date ?? "";
}

function comparePublicationsDescending(left: ArticlePublication, right: ArticlePublication): number {
  return right.date.localeCompare(left.date) || left.publisher.localeCompare(right.publisher);
}
