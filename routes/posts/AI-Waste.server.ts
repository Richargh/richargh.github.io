import type { Post } from "../../lib/content.ts";
import { loadSelectedPost } from "../../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../../lib/html.ts";

export async function render(): Promise<string> {
  return renderPostDocument(await loadSelectedPost());
}

export function renderPostDocument(post: Post): string {
  const tagList = post.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)}</title>
</head>
<body>
  <main>
    <article data-source="${escapeHtml(post.sourcePath)}">
      <header>
        <h1>${escapeHtml(post.title)}</h1>
        <p><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time></p>
        <ul aria-label="tags">${tagList}</ul>
      </header>
      ${unsafeAsciiDocHtml(post.html)}
    </article>
  </main>
</body>
</html>`;
}
