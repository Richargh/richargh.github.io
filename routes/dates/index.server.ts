import { renderLayout } from "../../_layouts/Layout.ts";
import { loadAllPosts } from "../../lib/content.ts";
import { groupPostsByDate, renderGroupedPostIndex } from "../../lib/indexes.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderLayout({
    title: "By Date",
    urlPath: "/dates/",
    type: "website",
    showBackToHome: true,
    content: `<style>
.date-content a {
    text-decoration: none;
    color: #4183c4;
}

.date-content a:hover {
    text-decoration: underline;
    color: #4183c4;
}
</style>
<h1>By Date</h1>
${renderGroupedPostIndex(groupPostsByDate(posts), { contentClass: "date-content" })}`,
  });
}
