import { loadAllPosts } from "../lib/content.ts";
import { renderAtomFeed } from "../lib/site-resources.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });
  return renderAtomFeed(posts);
}
