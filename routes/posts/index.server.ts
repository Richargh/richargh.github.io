import { renderFeedList } from "../../_ui/blocks/FeedList/FeedList.ts";
import { renderLayout } from "../../_ui/layouts/SiteLayout/SiteLayout.ts";
import { loadAllPosts } from "../../lib/content.ts";

export const title = "Blog";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderLayout({
    title,
    urlPath: "/posts/",
    type: "website",
    content: renderFeedList(posts),
  });
}
