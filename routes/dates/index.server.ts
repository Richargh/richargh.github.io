import { renderDatesPageDocument } from "../../_ui/pages/Dates/Dates.ts";
import { loadAllPosts } from "../../lib/content.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return renderDatesPageDocument(posts);
}
