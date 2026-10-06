import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderPageDocument } from "../routes/pages/[slug].server.ts";
import { renderPostDocument } from "../routes/posts/AI-Waste.server.ts";
import { loadAllPages, loadAllPosts } from "../lib/content.ts";
import { render as renderIndex } from "../routes/index.server.ts";
import { renderAutocompleteText, renderSearchJson } from "../lib/search.ts";
import { outputPathForUrlPath } from "../lib/output-compat.ts";

const outputDir = "generated";

await rm(outputDir, { recursive: true, force: true });
await mkdir(join(outputDir, "posts"), { recursive: true });
await cp("assets", join(outputDir, "assets"), { recursive: true, force: true });
await cp("node_modules/microlighter/dist", join(outputDir, "assets", "vendor", "microlighter"), { recursive: true, force: true });
await writeFile(join(outputDir, "index.html"), `${await renderIndex()}\n`, "utf8");

const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });
const pages = await loadAllPages();
await writeFile(join(outputDir, "search.json"), await renderSearchJson(posts), "utf8");
await writeFile(join(outputDir, "autocomplete.txt"), renderAutocompleteText(posts), "utf8");
for (const post of posts) {
  const outputPath = outputPathForUrlPath(post.urlPath);
  await mkdir(join(outputDir, ...outputPath.slice(0, -1)), { recursive: true });
  await writeFile(join(outputDir, ...outputPath), `${renderPostDocument(post)}\n`, "utf8");
}
for (const page of pages) {
  const outputPath = outputPathForUrlPath(page.urlPath);
  await mkdir(join(outputDir, ...outputPath.slice(0, -1)), { recursive: true });
  await writeFile(join(outputDir, ...outputPath), `${renderPageDocument(page)}\n`, "utf8");
}

console.log(`Generated ${join(outputDir, "index.html")}`);
console.log(`Generated ${posts.length} posts in ${join(outputDir, "posts")}`);
console.log(`Generated ${pages.length} pages`);
console.log(`Generated ${join(outputDir, "search.json")}`);
console.log(`Generated ${join(outputDir, "autocomplete.txt")}`);
console.log(`Generated ${join(outputDir, "assets")}`);

