import { escapeHtml } from "../../../lib/html.ts";

export interface ArticleCardOptions {
  id: string;
  title: string;
  /** Trusted HTML rendered by the caller's banner block. */
  bannerHtml?: string;
  actionsHtml?: string;
  childrenHtml: string;
}

export function renderArticleCard({ id, title, bannerHtml = "", actionsHtml = "", childrenHtml }: ArticleCardOptions): string {
  return `<section class="article-card" id="${escapeHtml(id)}">
${bannerHtml ? `<div class="article-card-banner">${bannerHtml}</div>` : ""}
<div class="article-card-body">
<div class="article-card-heading">
<h2><a class="article-card-title-anchor" href="#${escapeHtml(id)}">${escapeHtml(title)}</a></h2>
${actionsHtml ? `<div class="article-card-actions">${actionsHtml}</div>` : ""}
</div>
${childrenHtml}
</div>
</section>`;
}
