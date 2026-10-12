import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import type { Page } from "../../../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../../../lib/html.ts";

export function renderCredentialsPageDocument(page: Page): string {
  return renderLayout({
    title: page.title,
    urlPath: page.urlPath,
    description: page.excerpt,
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article data-source="${escapeHtml(page.sourcePath)}">
                  <h1>${escapeHtml(page.title)}</h1>
                  <div class="content">
                    ${unsafeAsciiDocHtml(page.html)}
                  </div>
                </article>
            </main>`,
  });
}
