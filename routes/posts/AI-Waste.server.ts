import { renderPostDocument } from "../../_ui/pages/Post/Post.ts";
import { loadSelectedPost } from "../../lib/content.ts";

export { renderPostDocument } from "../../_ui/pages/Post/Post.ts";

export async function render(): Promise<string> {
  return renderPostDocument(await loadSelectedPost());
}
