import { renderLayout } from "../../_layouts/Layout.ts";
import { loadAllPosts } from "../../lib/content.ts";
import { groupPostsByTag, renderGroupedPostIndex } from "../../lib/indexes.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderLayout({
    title: "By Tags",
    urlPath: "/tags/",
    type: "website",
    showBackToHome: true,
    content: `<style>
.category-content a {
    text-decoration: none;
    color: #4183c4;
}

.category-content a:hover {
    text-decoration: underline;
    color: #4183c4;
}
</style>
<h1>By Tags</h1>
${renderGroupedPostIndex(groupPostsByTag(posts), { contentClass: "category-content" })}`,
  });
}
