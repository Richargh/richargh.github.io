import { appCounters } from "../_includes/elements/CollectionStats.ts";
import { renderUpcomingCollection } from "../_includes/elements/UpcomingCollection.ts";
import { renderLayout } from "../_layouts/Layout.ts";
import { loadArticles } from "../lib/articles.ts";
import { loadPage } from "../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../lib/html.ts";
import { loadInterviews } from "../lib/interviews.ts";
import { loadTalks } from "../lib/talks.ts";

export const title = "About";

export async function render(): Promise<string> {
  const [page, talks, articles, interviews] = await Promise.all([loadPage("_pages/home.adoc"), loadTalks(), loadArticles(), loadInterviews()]);

  return renderLayout({
    title: page.title,
    urlPath: "/",
    description: page.excerpt,
    type: "website",
    appCounters: appCounters({ talks, articles, interviews }),
    content: `<main>
                <article data-source="${escapeHtml(page.sourcePath)}">
                  <h1>${escapeHtml(page.title)}</h1>
                  ${renderUpcomingCollection({ talks, articles, interviews })}
                  <div class="content">
                    ${unsafeAsciiDocHtml(page.html)}
                  </div>
                </article>
            </main>`,
  });
}
