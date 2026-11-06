import { escapeHtml } from "../../../lib/html.ts";

export interface ArticleCardOptions {
  id: string;
  title: string;
  dataAttributes?: Record<string, string>;
  /** Trusted HTML rendered by the caller's banner block. */
  bannerHtml?: string;
  actionsHtml?: string;
  childrenHtml: string;
}

export function renderArticleCard({ id, title, dataAttributes = {}, bannerHtml = "", actionsHtml = "", childrenHtml }: ArticleCardOptions): string {
  const attributes = Object.entries(dataAttributes).map(([key, value]) => ` data-${escapeHtml(key)}="${escapeHtml(value)}"`).join("");
  return `<section class="article-card" id="${escapeHtml(id)}"${attributes}>
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
