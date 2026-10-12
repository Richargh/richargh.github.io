import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import type { Post } from "../../../lib/content.ts";
import { groupPostsByTag, renderGroupedPostIndex } from "../../../lib/indexes.ts";

export function renderTagsPageDocument(posts: Post[]): string {
  return renderLayout({
    title: "By Tags",
    urlPath: "/tags/",
    type: "website",
    showBackToHome: true,
    content: `<h1>By Tags</h1>
${renderGroupedPostIndex(groupPostsByTag(posts), { contentClass: "category-content" })}`,
  });
}
