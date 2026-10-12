import { renderFeedList } from "../../blocks/FeedList/FeedList.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import type { Post } from "../../../lib/content.ts";

export function renderBlogPageDocument(posts: Post[]): string {
  return renderLayout({
    title: "Blog",
    urlPath: "/posts/",
    type: "website",
    content: renderFeedList(posts),
  });
}
