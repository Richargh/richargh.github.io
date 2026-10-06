import { loadAllPosts } from "../lib/content.ts";
import { renderAutocompleteText } from "../lib/search.ts";

export async function render(): Promise<string> {
  return renderAutocompleteText(await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE }));
}
