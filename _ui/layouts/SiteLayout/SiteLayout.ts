import { renderContextMenu } from "../../blocks/ContextMenu/ContextMenu.ts";
import { renderFooter } from "../../blocks/Footer/Footer.ts";
import type { AppCounters } from "../../blocks/CollectionStats/CollectionStats.ts";
import { renderHeader } from "../../blocks/Header/Header.ts";
import { absoluteUrl, site } from "../../../lib/config.ts";
import { escapeHtml } from "../../../lib/html.ts";

export interface LayoutOptions {
  title?: string;
  urlPath: string;
  description?: string;
  type?: "website" | "article";
  showBackToHome?: boolean;
  showContextMenu?: boolean;
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
    <link rel="alternate" type="application/rss+xml" href="${site.feedUrl}">
</head>

<body data-syntax-theme="github">
    <div class="container">
        <div class="box">
            ${renderHeader({ showBackToHome: options.showBackToHome, appCounters: options.appCounters })}
            ${options.content}
            ${renderContextMenu({ enabled: options.showContextMenu ?? options.urlPath === "/" })}
            ${renderFooter()}
        </div>
        <button class="scroll-to-top" id="scroll-to-top" aria-label="Scroll to top">
            <svg class="scroll-to-top-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                <path d="M6 15L12 9L18 15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>
    <script type="module" src="/assets/vendor/microlighter/microlighter.js"></script>
    <script>
        document.getElementById("scroll-to-top").addEventListener("click", function() {
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
        });
    </script>
</body>
</html>`;
}
