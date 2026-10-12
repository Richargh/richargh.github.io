import { renderBlogPageDocument } from "../../_ui/pages/Blog/Blog.ts";
import { loadAllPosts } from "../../lib/content.ts";

export const title = "Blog";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderBlogPageDocument(posts);
}
