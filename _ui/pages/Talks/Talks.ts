import { renderArticleCard } from "../../blocks/ArticleCard/ArticleCard.ts";
import type { ButtonUtility } from "../../blocks/Button/Button.ts";
import { renderCalloutLink } from "../../blocks/CalloutLink/CalloutLink.ts";
import { renderTalkStats } from "../../blocks/CollectionStats/CollectionStats.ts";
import { renderUpcomingTalks } from "../../blocks/UpcomingCollection/UpcomingCollection.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import type { Article } from "../../../lib/articles.ts";
import { assertRelatedReferencesExist, type CrossLinkItem, type RelatedGroup, relatedContentLinks } from "../../../lib/cross-links.ts";
import { escapeHtml } from "../../../lib/html.ts";
import type { InterviewAppearance } from "../../../lib/interviews.ts";
import { talkAppearanceUrl, type Talk, type TalkAppearance, type TalkLink } from "../../../lib/talks.ts";

export function renderTalksDocument(talks: Talk[], articles: Article[] = [], interviews: InterviewAppearance[] = [], relatedGroups: RelatedGroup[] = []): string {
  const sortedTalks = talks.toSorted((left, right) => left.title.localeCompare(right.title));
  assertRelatedReferencesExist(relatedGroups, relatedItems(talks, articles, interviews));
  return renderLayout({
    title: "Talks",
    urlPath: "/talks/",
    description: "Talks by Richard Groß",
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article data-source="_data/talks.yaml">
                  <h1>Talks</h1>
                  ${renderTalkStats(talks)}
                  ${renderUpcomingTalks(talks)}
                  <div class="content article-cards">
                    ${sortedTalks.map((talk) => renderTalkCard(talk, relatedGroups)).join("\n")}
                  </div>
                </article>
            </main>`,
  });
}

export function renderTalkCard(talk: Talk, relatedGroups: RelatedGroup[] = [], title = talk.title, showResourceLinks = true): string {
  const video = newestVersionVideo(talk.appearances);
  return renderArticleCard({
    id: talk.id,
    title,
    banner: {
      thumbnail: talk.thumbnail,
      tags: talk.tags,
      linkUrl: video?.videoUrl,
      linkLabel: `Open newest video for ${talk.title}`,
    },
    actionsHtml: renderTalkActions(talk, relatedGroups),
    childrenHtml: `${talk.abstract ? renderAbstract(talk.abstract) : ""}
<ul class="article-card-appearances-list">
${talk.appearances.toSorted(compareAppearancesDescending).map((appearance) => renderAppearanceLine(appearance, showResourceLinks)).join("\n")}
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
  return `<details class="article-card-abstract">
<summary><span class="article-card-abstract-long">${escapeHtml(excerpt(abstract, 70))}</span><span class="article-card-abstract-short">${escapeHtml(excerpt(abstract, 45))}</span></summary>
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
  return links.map((link) => renderArticleCardLink(link, link.url.startsWith("/") ? ["button-compact", "button-cross-link"] : ["button-compact", "button-muted"], `article-card-code${link.url.startsWith("/") ? " article-card-cross-link-button" : ""}`)).join(" ");
}

function newestVersionVideo(appearances: TalkAppearance[]): TalkAppearance | undefined {
  return appearances
    .filter((appearance) => appearance.videoUrl)
    .toSorted((left, right) => (right.talkVersion ?? -1) - (left.talkVersion ?? -1) || right.date.localeCompare(left.date))[0];
}

function renderAppearanceLine(appearance: TalkAppearance, showResourceLink: boolean): string {
  return `<li class="article-card-appearance-line${appearance.videoUrl ? " has-video" : ""}">
<span class="article-card-line-main">${renderVersion(appearance)}${renderEventLink(appearance)}${renderUpcoming(appearance)}${renderVariant(appearance)} ${renderLanguageFlag(appearance.language)}${renderDuration(appearance)}</span>
<span class="article-card-line-links">${renderResourceLinks(appearance)}${showResourceLink ? ` ${renderCalloutLink({ label: "Resources", href: talkAppearanceUrl(appearance) })}` : ""}</span>
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
  return ` <span class="article-card-duration">(${appearance.durationMinutes}min)</span>`;
}

function renderResourceLinks(appearance: TalkAppearance): string {
  const links: TalkLink[] = [...appearance.links];
  if (appearance.videoUrl) links.push({ label: "Video", url: appearance.videoUrl });
  if (appearance.slideUrl) links.push({ label: "Slides", url: appearance.slideUrl });
  return links.map((link) => renderArticleCardLink(link, link.label.includes("Video") ? ["button-compact", "button-video"] : ["button-compact", "button-muted"], link.label.includes("Video") ? "article-card-video-button" : "")).join(" ");
}

function renderArticleCardLink(link: TalkLink, utilities: ButtonUtility[], className = ""): string {
  return renderCalloutLink({
    href: link.url,
    label: link.label,
    utilities,
    className: ["article-card-resource-button", className].filter(Boolean).join(" "),
  });
}

function renderVersion(appearance: TalkAppearance): string {
  return appearance.talkVersion === undefined ? "" : `${escapeHtml(`v${appearance.talkVersion}`)}: `;
}

function renderUpcoming(appearance: TalkAppearance): string {
  return appearance.upcoming || appearance.upcomingSince ? ` <span class="article-card-upcoming">Upcoming ${escapeHtml(appearance.date)}</span>` : "";
}

function renderVariant(appearance: TalkAppearance): string {
  return appearance.variant ? ` <span class="article-card-duration">${escapeHtml(appearance.variant)}</span>` : "";
}

function compareAppearancesDescending(left: TalkAppearance, right: TalkAppearance): number {
  return right.date.localeCompare(left.date) || left.conference.localeCompare(right.conference);
}
