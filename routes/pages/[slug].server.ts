import { renderLayout } from "../../_layouts/Layout.ts";
import type { Page } from "../../lib/content.ts";
import { loadAllPages } from "../../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../../lib/html.ts";

export async function render(slug: string): Promise<string> {
  const page = (await loadAllPages()).find((candidate) => candidate.slug === slug || candidate.urlPath === `/${slug}/`);
  if (!page) throw new Error(`Unknown page slug: ${slug}`);
  return renderPageDocument(page);
}

export function renderPageDocument(page: Page): string {
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
