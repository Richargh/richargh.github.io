import { loadAllPosts } from "../lib/content.ts";
import { renderSearchJson } from "../lib/search.ts";

export async function render(): Promise<string> {
  return renderSearchJson(await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE }));
}
