import { renderArticleCard } from "../../_includes/ArticleCard.ts";
import { appCounters, renderInterviewStats } from "../../_includes/CollectionStats.ts";
import { renderLayout } from "../../_layouts/Layout.ts";
import { loadArticles, type Article } from "../../lib/articles.ts";
import { assertRelatedReferencesExist, loadRelatedGroups, type CrossLink, type CrossLinkItem, type RelatedGroup, relatedContentLinks } from "../../lib/cross-links.ts";
import { escapeHtml } from "../../lib/html.ts";
import { loadInterviews, type InterviewAppearance, type InterviewLink } from "../../lib/interviews.ts";
import { loadTalks, type Talk } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  const [interviews, talks, articles, relatedGroups] = await Promise.all([loadInterviews(), loadTalks(), loadArticles(), loadRelatedGroups()]);
  return renderInterviewsDocument(interviews, talks, articles, relatedGroups);
}

export function renderInterviewsDocument(interviews: InterviewAppearance[], talks: Talk[] = [], articles: Article[] = [], relatedGroups: RelatedGroup[] = []): string {
  assertRelatedReferencesExist(relatedGroups, relatedItems(talks, articles, interviews));
  return renderLayout({
    title: "Interviews",
    urlPath: "/interviews/",
    description: "Podcasts, interviews, and streams with Richard Groß",
    type: "website",
    showBackToHome: true,
    appCounters: appCounters({ talks, articles, interviews }),
    content: `<main>
                <article data-source="_data/interviews.yaml">
                  <h1>Interviews</h1>
                  ${renderInterviewStats(interviews)}
                  <div class="content talks-cards">
                    <p>Podcasts, interviews, and streams.</p>
                    ${interviews.toSorted(compareInterviewsDescending).map((interview) => renderInterviewCard(interview, relatedGroups)).join("\n")}
                  </div>
                </article>
            </main>`,
  });
}

function renderInterviewCard(interview: InterviewAppearance, relatedGroups: RelatedGroup[]): string {
  const video = interview.links.find((link) => link.label.includes("Video"));
  return renderArticleCard({
    id: interview.id,
    title: interview.title,
    banner: {
      thumbnail: interview.thumbnail,
      tags: interview.tags,
      linkUrl: video?.url,
      linkLabel: `Open video for ${interview.title}`,
    },
    actionsHtml: renderCrossLinks(relatedContentLinks({ id: interview.id, kind: "interview" }, relatedGroups)),
    childrenHtml: `<ul class="talk-appearances-list">
<li class="talk-appearance-line"><span class="talk-line-main">${renderMainLink(interview)} <span class="talk-duration">${escapeHtml(interview.date)}</span> ${renderLanguageFlag(interview.language)} <span class="talk-duration">${escapeHtml(interview.type)}</span></span><span class="talk-line-links">${renderLinks(interview.links)}</span></li>
</ul>
${interview.note ? `<p>${escapeHtml(interview.note)}</p>` : ""}`,
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

function renderMainLink(interview: InterviewAppearance): string {
  const label = interview.episode ? `${interview.show} #${interview.episode}` : interview.show;
  return `<a href="${escapeHtml(interview.url)}">${escapeHtml(label)}</a>`;
}

function renderLinks(links: InterviewLink[]): string {
  return links.map((link) => `<a class="talk-resource-button${link.label.includes("Video") ? " talk-video-button" : ""}" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(" ");
}

function renderLanguageFlag(language: string | undefined): string {
  if (language === "de") return "🇩🇪";
  if (language === "en") return "🇬🇧";
  return "";
}

function compareInterviewsDescending(left: InterviewAppearance, right: InterviewAppearance): number {
  return right.date.localeCompare(left.date) || left.show.localeCompare(right.show);
}
