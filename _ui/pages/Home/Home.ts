import { appCounters } from "../../blocks/CollectionStats/CollectionStats.ts";
import { renderUpcomingCollection } from "../../blocks/UpcomingCollection/UpcomingCollection.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import type { Article } from "../../../lib/articles.ts";
import type { Page } from "../../../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../../../lib/html.ts";
import type { InterviewAppearance } from "../../../lib/interviews.ts";
import type { Talk } from "../../../lib/talks.ts";

export interface HomePageData {
  page: Page;
  talks: Talk[];
  articles: Article[];
  interviews: InterviewAppearance[];
}

export function renderHomePageDocument({ page, talks, articles, interviews }: HomePageData): string {
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
