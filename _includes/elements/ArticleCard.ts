import { escapeHtml } from "../../lib/html.ts";

export interface ArticleCardBanner {
  thumbnail?: string;
  tags?: string[];
  linkUrl?: string;
  linkLabel?: string;
}

export interface ArticleCardOptions {
  id: string;
  title: string;
  banner?: ArticleCardBanner;
  actionsHtml?: string;
  childrenHtml: string;
}

export function renderArticleCard({ id, title, banner, actionsHtml = "", childrenHtml }: ArticleCardOptions): string {
  return `<section class="talk-card" id="${escapeHtml(id)}">
${renderBanner(title, banner)}
<div class="talk-card-body">
<div class="talk-card-heading">
<h2><a class="talk-title-anchor" href="#${escapeHtml(id)}">${escapeHtml(title)}</a></h2>
${actionsHtml ? `<div class="talk-card-actions">${actionsHtml}</div>` : ""}
</div>
${childrenHtml}
</div>
</section>`;
}

function renderBanner(title: string, banner: ArticleCardBanner = {}): string {
  const tags = banner.tags && banner.tags.length > 0 ? banner.tags : [title];
  const style = banner.thumbnail ? ` style="background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.08)), url('${escapeHtml(banner.thumbnail)}');"` : "";
  const titleHtml = banner.thumbnail ? "" : `<div class="talk-banner-title">${escapeHtml(title)}</div>`;
  const content = `<div class="talk-banner-content">${titleHtml}<div class="talk-banner-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></div>`;
  if (banner.linkUrl) return `<a class="talk-banner talk-banner-link"${style} href="${escapeHtml(banner.linkUrl)}" aria-label="${escapeHtml(banner.linkLabel ?? `Open ${title}`)}">${content}</a>`;
  return `<div class="talk-banner"${style}>${content}</div>`;
}
