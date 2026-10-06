import { renderFeedList } from "../_includes/FeedList.ts";
import { loadAllPosts } from "../lib/content.ts";

export const title = "Richard's Blog";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body>
  <main>
    <h1>${title}</h1>
    ${renderFeedList(posts)}
  </main>
</body>
</html>`;
}
