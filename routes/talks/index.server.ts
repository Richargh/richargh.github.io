import { renderLayout } from "../../_layouts/Layout.ts";
import { escapeHtml } from "../../lib/html.ts";
import { loadTalks, type Talk, type TalkAppearance, type TalkLink } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  return renderTalksDocument(await loadTalks());
}

export function renderTalksDocument(talks: Talk[]): string {
  const sortedTalks = talks.toSorted((left, right) => left.title.localeCompare(right.title));
  return renderLayout({
    title: "Talks",
    urlPath: "/talks/",
    description: "Talks by Richard Groß",
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article data-source="_data/talks.yaml">
                  <h1>Talks</h1>
                  <div class="content talks-cards">
                    <p>For upcoming talks see <a href="/posts/upcoming/">upcoming</a>.</p>
                    ${sortedTalks.map(renderTalkCard).join("\n")}
                  </div>
                </article>
            </main>`,
  });
}

function renderTalkCard(talk: Talk): string {
  const banner = renderBanner(talk);
  return `<section class="talk-card" id="${escapeHtml(talk.id)}">
${banner}
<div class="talk-card-body">
<h2><a class="talk-title-anchor" href="#${escapeHtml(talk.id)}">${escapeHtml(talk.title)}</a></h2>
${talk.abstract ? `<p class="talk-abstract">${escapeHtml(talk.abstract)}</p>` : ""}
<ul class="talk-appearances-list">
${talk.appearances.toSorted(compareAppearancesDescending).map(renderAppearanceLine).join("\n")}
</ul>
</div>
</section>`;
}

function renderBanner(talk: Talk): string {
  const video = newestVersionVideo(talk.appearances);
  const tags = talk.tags.length > 0 ? talk.tags : [talk.title];
  const style = video ? ` style="background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.08)), url('${escapeHtml(thumbnailPath(talk, video))}');"` : "";
  const content = `<div class="talk-banner-content">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
  if (video?.videoUrl) return `<a class="talk-banner talk-banner-link"${style} href="${escapeHtml(video.videoUrl)}" aria-label="Open newest video for ${escapeHtml(talk.title)}">${content}</a>`;
  return `<div class="talk-banner">${content}</div>`;
}

function newestVersionVideo(appearances: TalkAppearance[]): TalkAppearance | undefined {
  return appearances
    .filter((appearance) => appearance.videoUrl)
    .toSorted((left, right) => (right.talkVersion ?? -1) - (left.talkVersion ?? -1) || right.date.localeCompare(left.date))[0];
}

function thumbnailPath(talk: Talk, appearance: TalkAppearance): string {
  const videoId = appearance.videoUrl ? youtubeVideoId(appearance.videoUrl) : undefined;
  return videoId ? `/assets/img/thumbnails/${talk.id}-${appearance.date}-${videoId}.jpg` : "";
}

function youtubeVideoId(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") return cleanVideoId(parsed.pathname.slice(1));
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname === "/watch") return cleanVideoId(parsed.searchParams.get("v") ?? "");
      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) return cleanVideoId(parsed.pathname.split("/")[2] ?? "");
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function cleanVideoId(value: string): string | undefined {
  const id = value.trim();
  return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : undefined;
}

function renderAppearanceLine(appearance: TalkAppearance): string {
  const prefix = prefixFor(appearance);
  return `<li class="talk-appearance-line${appearance.videoUrl ? " has-video" : ""}">
<span class="talk-line-main">${prefix ? `${escapeHtml(prefix)}: ` : ""}${renderEventLink(appearance)} ${renderLanguageFlag(appearance.language)}${renderDuration(appearance)}</span>
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
  if (appearance.codeUrl) links.push({ label: "Code", url: appearance.codeUrl });
  if (appearance.slideUrl) links.push({ label: "Slides", url: appearance.slideUrl });
  return links.map((link) => `<a class="talk-resource-button${link.label.includes("Video") ? " talk-video-button" : ""}" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join(" ");
}

function prefixFor(appearance: TalkAppearance): string {
  const parts: string[] = [];
  if (appearance.talkVersion !== undefined) parts.push(`v${appearance.talkVersion}`);
  if (appearance.variant) parts.push(appearance.variant);
  return parts.join(", ");
}

function compareAppearancesDescending(left: TalkAppearance, right: TalkAppearance): number {
  return right.date.localeCompare(left.date) || left.conference.localeCompare(right.conference);
}
