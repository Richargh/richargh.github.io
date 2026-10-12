import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import type { Post } from "../../../lib/content.ts";
import { groupPostsByDate, renderGroupedPostIndex } from "../../../lib/indexes.ts";

export function renderDatesPageDocument(posts: Post[]): string {
  return renderLayout({
    title: "By Date",
    urlPath: "/dates/",
    type: "website",
    showBackToHome: true,
    content: `<h1>By Date</h1>
${renderGroupedPostIndex(groupPostsByDate(posts), { contentClass: "date-content" })}`,
  });
}
