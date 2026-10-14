import { renderSuccessStoriesPageDocument } from "../../_ui/pages/SuccessStories/SuccessStories.ts";
import { loadSuccessStories } from "../../lib/success-stories.ts";

export async function render(): Promise<string> {
  return renderSuccessStoriesPageDocument(await loadSuccessStories());
}
