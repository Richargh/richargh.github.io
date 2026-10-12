import { renderTagsPageDocument } from "../../_ui/pages/Tags/Tags.ts";
import { loadAllPosts } from "../../lib/content.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderTagsPageDocument(posts);
}
