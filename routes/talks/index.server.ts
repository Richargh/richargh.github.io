import { renderArticleCard } from "../../_includes/ArticleCard.ts";
import { appCounters, renderTalkStats } from "../../_includes/CollectionStats.ts";
import { renderLayout } from "../../_layouts/Layout.ts";
import { loadArticles, type Article } from "../../lib/articles.ts";
import { assertRelatedReferencesExist, loadRelatedGroups, type CrossLinkItem, type RelatedGroup, relatedContentLinks } from "../../lib/cross-links.ts";
import { escapeHtml } from "../../lib/html.ts";
import { loadInterviews, type InterviewAppearance } from "../../lib/interviews.ts";
import { loadTalks, type Talk, type TalkAppearance, type TalkLink } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  const [talks, articles, interviews, relatedGroups] = await Promise.all([loadTalks(), loadArticles(), loadInterviews(), loadRelatedGroups()]);
  return renderTalksDocument(talks, articles, interviews, relatedGroups);
}

export function renderTalksDocument(talks: Talk[], articles: Article[] = [], interviews: InterviewAppearance[] = [], relatedGroups: RelatedGroup[] = []): string {
  const sortedTalks = talks.toSorted((left, right) => left.title.localeCompare(right.title));
  assertRelatedReferencesExist(relatedGroups, relatedItems(talks, articles, interviews));
  return renderLayout({
    title: "Talks",
    urlPath: "/talks/",
    description: "Talks by Richard Groß",
    type: "website",
    showBackToHome: true,
    appCounters: appCounters({ talks, articles, interviews }),
    content: `<main>
                <article data-source="_data/talks.yaml">
                  <h1>Talks</h1>
                  ${renderTalkStats(talks)}
                  <div class="content talks-cards">
                    <p>For upcoming talks see <a href="/posts/upcoming/">upcoming</a>.</p>
                    ${sortedTalks.map((talk) => renderTalkCard(talk, relatedGroups)).join("\n")}
                  </div>
                </article>
            </main>`,
  });
}

function renderTalkCard(talk: Talk, relatedGroups: RelatedGroup[]): string {
  const video = newestVersionVideo(talk.appearances);
  return renderArticleCard({
    id: talk.id,
    title: talk.title,
    banner: {
      thumbnail: talk.thumbnail,
      tags: talk.tags,
      linkUrl: video?.videoUrl,
      linkLabel: `Open newest video for ${talk.title}`,
    },
    actionsHtml: renderTalkActions(talk, relatedGroups),
    childrenHtml: `${talk.abstract ? renderAbstract(talk.abstract) : ""}
<ul class="talk-appearances-list">
${talk.appearances.toSorted(compareAppearancesDescending).map(renderAppearanceLine).join("\n")}
</ul>`,
  });
}

function relatedItems(talks: Talk[], articles: Article[], interviews: InterviewAppearance[]): CrossLinkItem[] {
  return [
    ...talks.map((talk) => ({ id: talk.id, kind: "talk" as const })),
    ...articles.map((article) => ({ id: article.id, kind: "article" as const })),
    ...interviews.map((interview) => ({ id: interview.id, kind: "interview" as const })),
  ];
}

function renderAbstract(abstract: string): string {
  return `<details class="talk-abstract">
<summary><span class="talk-abstract-long">${escapeHtml(excerpt(abstract, 70))}</span><span class="talk-abstract-short">${escapeHtml(excerpt(abstract, 45))}</span></summary>
${abstractParagraphs(abstract).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
</details>`;
}

function abstractParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replaceAll(/\s+/g, " ").trim())
    .filter(Boolean);
}

function excerpt(value: string, length: number): string {
  const normalized = value.replaceAll(/\s+/g, " ").trim();
  if (normalized.length <= length) return normalized;
  return normalized.slice(0, length).trimEnd();
}

function renderTalkActions(talk: Talk, relatedGroups: RelatedGroup[]): string {
  const links: TalkLink[] = [];
  if (talk.codeUrl) links.push({ label: "Code", url: talk.codeUrl });
  links.push(...talk.links);
  links.push(...relatedContentLinks({ id: talk.id, kind: "talk" }, relatedGroups));
  return links.map((link) => `<a class="talk-resource-button talk-card-code${link.url.startsWith("/") ? " talk-cross-link-button" : ""}" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(" ");
}

function newestVersionVideo(appearances: TalkAppearance[]): TalkAppearance | undefined {
  return appearances
    .filter((appearance) => appearance.videoUrl)
    .toSorted((left, right) => (right.talkVersion ?? -1) - (left.talkVersion ?? -1) || right.date.localeCompare(left.date))[0];
}

function renderAppearanceLine(appearance: TalkAppearance): string {
  return `<li class="talk-appearance-line${appearance.videoUrl ? " has-video" : ""}">
<span class="talk-line-main">${renderVersion(appearance)}${renderEventLink(appearance)}${renderUpcoming(appearance)}${renderVariant(appearance)} ${renderLanguageFlag(appearance.language)}${renderDuration(appearance)}</span>
<span class="talk-line-links">${renderResourceLinks(appearance)}</span>
</li>`;
}

function renderEventLink(appearance: TalkAppearance): string {
  const label = `${appearance.conference} ${appearance.date.slice(0, 4)}`;
  if (!appearance.eventUrl) return escapeHtml(label);
  return `<a href="${escapeHtml(appearance.eventUrl)}">${escapeHtml(label)}</a>`;
}

function renderLanguageFlag(language: string | undefined): string {
  if (language === "de") return "🇩🇪";
  if (language === "en") return "🇬🇧";
  return "";
}

function renderDuration(appearance: TalkAppearance): string {
  if (appearance.durationMinutes === undefined) return "";
  return ` <span class="talk-duration">(${appearance.durationMinutes}min)</span>`;
}

function renderResourceLinks(appearance: TalkAppearance): string {
  const links: TalkLink[] = [...appearance.links];
  if (appearance.videoUrl) links.push({ label: "Video", url: appearance.videoUrl });
  if (appearance.slideUrl) links.push({ label: "Slides", url: appearance.slideUrl });
  return links.map((link) => `<a class="talk-resource-button${link.label.includes("Video") ? " talk-video-button" : ""}" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(" ");
}

function renderVersion(appearance: TalkAppearance): string {
  return appearance.talkVersion === undefined ? "" : `${escapeHtml(`v${appearance.talkVersion}`)}: `;
}

function renderUpcoming(appearance: TalkAppearance): string {
  return appearance.upcoming ? ` <span class="talk-upcoming">Upcoming ${escapeHtml(appearance.date)}</span>` : "";
}

function renderVariant(appearance: TalkAppearance): string {
  return appearance.variant ? ` <span class="talk-duration">${escapeHtml(appearance.variant)}</span>` : "";
}

function compareAppearancesDescending(left: TalkAppearance, right: TalkAppearance): number {
  return right.date.localeCompare(left.date) || left.conference.localeCompare(right.conference);
}
