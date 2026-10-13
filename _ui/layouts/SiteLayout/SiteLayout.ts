import { renderFooter } from "../../blocks/Footer/Footer.ts";
import type { AppCounters } from "../../blocks/CollectionStats/CollectionStats.ts";
import { renderHeader } from "../../blocks/Header/Header.ts";
import { renderScrollToTop } from "../../blocks/ScrollToTop/ScrollToTop.ts";
import { absoluteUrl, site } from "../../../lib/config.ts";
import { escapeHtml } from "../../../lib/html.ts";

export interface LayoutOptions {
  title?: string;
  urlPath: string;
  description?: string;
  type?: "website" | "article";
  showBackToHome?: boolean;
  appCounters?: AppCounters;
  content: string;
}

export function renderLayout(options: LayoutOptions): string {
  const pageTitle = options.title ?? site.title;
  const description = options.description ?? site.tagLine;
  const canonical = absoluteUrl(options.urlPath);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta charset="utf-8">
    <meta name="color-scheme" content="light dark">
    <meta property="og:site_name" content="Knowledge Continuum"/>
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="article:author" content="${site.url}/">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:type" content="${options.type ?? "website"}">
    <meta property="og:url" content="${canonical}">

    <title>${escapeHtml(site.title)}</title>

    <link rel="canonical" href="${canonical}"/>
    <link rel="apple-touch-icon" href="${site.profilePic}">
    <link rel="icon" href="${site.favicon}" type="image/png" sizes="16x16"/>
    <link href="/assets/css/style.css" rel="stylesheet" media="all" class="default"/>
    <link href="/assets/css/microlighter.css" rel="stylesheet" media="all"/>
    <script type="module" src="/assets/vendor/microlighter/microlighter.js"></script>
    <script type="module" src="/assets/elements/ScrollToTopElement.mjs"></script>
    <link rel="alternate" type="application/rss+xml" href="${site.feedUrl}">
</head>

<body data-syntax-theme="github">
    <div class="container">
        <div class="box">
            ${renderHeader({ showBackToHome: options.showBackToHome, appCounters: options.appCounters })}
            ${options.content}
            ${renderFooter()}
        </div>
        ${renderScrollToTop()}
    </div>
</body>
</html>`;
}
