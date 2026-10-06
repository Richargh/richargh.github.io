import { renderFooter } from "../_includes/Footer.ts";
import { renderHeader } from "../_includes/Header.ts";
import { absoluteUrl, site } from "../lib/config.ts";
import { escapeHtml } from "../lib/html.ts";

export interface LayoutOptions {
  title?: string;
  urlPath: string;
  description?: string;
  type?: "website" | "article";
  showBackToHome?: boolean;
  content: string;
}

export function renderLayout(options: LayoutOptions): string {
  const pageTitle = options.title ?? site.title;
  const description = options.description ?? site.userDescription;
  const canonical = absoluteUrl(options.urlPath);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta charset="utf-8">
    <meta property="og:site_name" content="Knowledge Continuum"/>
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="article:author" content="${site.url}/about/">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:type" content="${options.type ?? "website"}">
    <meta property="og:url" content="${canonical}">

    <title>${escapeHtml(site.title)}</title>

    <link rel="canonical" href="${canonical}"/>
    <link rel="apple-touch-icon" href="${site.profilePic}">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css"/>
    <link rel="icon" href="${site.favicon}" type="image/png" sizes="16x16"/>
    <link href="/assets/css/style.css" rel="stylesheet" media="all" class="default"/>
    <link href="/assets/css/microlighter.css" rel="stylesheet" media="all"/>
    <!--[if IE]><link href="/assets/css/ie-target.css" rel="stylesheet" type="text/css"/><![endif]-->
    <link rel="alternate" type="application/rss+xml" href="${site.feedUrl}">
</head>

<body data-syntax-theme="github">
    <div class="container">
        <div class="box">
            ${renderHeader({ showBackToHome: options.showBackToHome })}
            ${options.content}
            ${renderFooter()}
        </div>
        <button class="scroll-to-top" id="scroll-to-top"><i class="fa fa-chevron-up"></i></button>
    </div>
    <script type="text/javascript" async src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML"></script>
    <script type="module" src="/assets/vendor/microlighter/microlighter.js"></script>
    <script>
        document.getElementById("scroll-to-top").addEventListener("click", function() {
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
        });
    </script>
</body>
</html>`;
}
