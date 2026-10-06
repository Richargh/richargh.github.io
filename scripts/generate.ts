import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Post } from "../lib/content.ts";
import { renderPostDocument } from "../routes/posts/AI-Waste.server.ts";
import { loadAllPosts } from "../lib/content.ts";
import { render as renderIndex } from "../routes/index.server.ts";
import { renderAutocompleteText, renderSearchJson } from "../lib/search.ts";

const outputDir = "generated";

await rm(outputDir, { recursive: true, force: true });
await mkdir(join(outputDir, "posts"), { recursive: true });
await cp("assets", join(outputDir, "assets"), { recursive: true, force: true });
await cp("node_modules/microlighter/dist", join(outputDir, "assets", "vendor", "microlighter"), { recursive: true, force: true });
await writeFile(join(outputDir, "index.html"), `${await renderIndex()}\n`, "utf8");

const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });
await writeFile(join(outputDir, "search.json"), await renderSearchJson(posts), "utf8");
await writeFile(join(outputDir, "autocomplete.txt"), renderAutocompleteText(posts), "utf8");
for (const post of posts) {
  const outputPath = outputPathForPost(post);
  await mkdir(join(outputDir, ...outputPath.slice(0, -1)), { recursive: true });
  await writeFile(join(outputDir, ...outputPath), `${renderPostDocument(post)}\n`, "utf8");
}

console.log(`Generated ${join(outputDir, "index.html")}`);
console.log(`Generated ${posts.length} posts in ${join(outputDir, "posts")}`);
console.log(`Generated ${join(outputDir, "search.json")}`);
console.log(`Generated ${join(outputDir, "autocomplete.txt")}`);
console.log(`Generated ${join(outputDir, "assets")}`);

function outputPathForPost(post: Post): string[] {
  const urlPath = post.urlPath.replace(/^\/+/, "");
  if (urlPath.endsWith("/")) return [...urlPath.slice(0, -1).split("/"), "index.html"];
  return [`${urlPath}.html`];
}
