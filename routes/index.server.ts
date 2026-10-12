import { renderLayout } from "../_layouts/Layout.ts";
import { loadPage } from "../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../lib/html.ts";

export const title = "About";

export async function render(): Promise<string> {
  const page = await loadPage("_pages/home.adoc");

  return renderLayout({
    title: page.title,
    urlPath: "/",
    description: page.excerpt,
    type: "website",
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
