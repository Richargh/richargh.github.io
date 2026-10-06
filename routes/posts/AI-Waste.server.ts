import { renderPostMeta } from "../../_includes/ContentMeta.ts";
import { renderLayout } from "../../_layouts/Layout.ts";
import type { Post } from "../../lib/content.ts";
import { loadSelectedPost } from "../../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../../lib/html.ts";

export async function render(): Promise<string> {
  return renderPostDocument(await loadSelectedPost());
}

export function renderPostDocument(post: Post): string {
  return renderLayout({
    title: post.title,
    urlPath: post.urlPath,
    description: post.excerpt,
    type: "article",
    showBackToHome: true,
    content: `<main>
                <article data-source="${escapeHtml(post.sourcePath)}">
                  <h1>${escapeHtml(post.title)}</h1>
                  ${renderPostMeta(post)}
                  <div class="content">
                    ${unsafeAsciiDocHtml(post.html)}
                  </div>
                </article>
            </main>`,
  });
}
