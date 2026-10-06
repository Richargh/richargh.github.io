import { renderFeedList } from "../_includes/FeedList.ts";
import { renderLayout } from "../_layouts/Layout.ts";
import { loadAllPosts } from "../lib/content.ts";

export const title = "Richard's Blog";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderLayout({
    title,
    urlPath: "/",
    type: "website",
    content: renderFeedList(posts),
  });
}
