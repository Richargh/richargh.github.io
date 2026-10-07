import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderPageDocument } from "../routes/pages/[slug].server.ts";
import { renderPostDocument } from "../routes/posts/AI-Waste.server.ts";
import { render as render404 } from "../routes/404.html.server.ts";
import { render as renderFeed } from "../routes/feed.xml.server.ts";
import { render as renderRobots } from "../routes/robots.txt.server.ts";
import { render as renderSitemap } from "../routes/sitemap.xml.server.ts";
import { loadAllPages, loadAllPosts } from "../lib/content.ts";
import { render as renderIndex } from "../routes/index.server.ts";
import { render as renderDatesIndex } from "../routes/dates/index.server.ts";
import { render as renderTagsIndex } from "../routes/tags/index.server.ts";
import { renderAutocompleteText, renderSearchJson } from "../lib/search.ts";
import { outputPathForUrlPath } from "../lib/output-compat.ts";
import { assertGeneratedLinksResolve } from "../lib/generated-link-check.ts";

const outputDir = "generated";

await rm(outputDir, { recursive: true, force: true });
await mkdir(join(outputDir, "posts"), { recursive: true });
await cp("assets", join(outputDir, "assets"), { recursive: true, force: true });
await cp("node_modules/microlighter/dist", join(outputDir, "assets", "vendor", "microlighter"), { recursive: true, force: true });
await writeFile(join(outputDir, "index.html"), `${await renderIndex()}\n`, "utf8");
await mkdir(join(outputDir, "tags"), { recursive: true });
await writeFile(join(outputDir, "tags", "index.html"), `${await renderTagsIndex()}\n`, "utf8");
await mkdir(join(outputDir, "dates"), { recursive: true });
await writeFile(join(outputDir, "dates", "index.html"), `${await renderDatesIndex()}\n`, "utf8");

const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });
const pages = await loadAllPages();
await writeFile(join(outputDir, "search.json"), await renderSearchJson(posts), "utf8");
await writeFile(join(outputDir, "autocomplete.txt"), renderAutocompleteText(posts), "utf8");
await writeFile(join(outputDir, "feed.xml"), await renderFeed(), "utf8");
await writeFile(join(outputDir, "sitemap.xml"), await renderSitemap(), "utf8");
await writeFile(join(outputDir, "robots.txt"), renderRobots(), "utf8");
await writeFile(join(outputDir, "404.html"), `${render404()}\n`, "utf8");
await writeFile(join(outputDir, "CNAME"), await readFile(join("routes", "CNAME"), "utf8"), "utf8");
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

await assertGeneratedLinksResolve(outputDir);

console.log(`Generated ${join(outputDir, "index.html")}`);
console.log(`Generated ${posts.length} posts in ${join(outputDir, "posts")}`);
console.log(`Generated ${pages.length} pages`);
console.log(`Generated ${join(outputDir, "tags", "index.html")}`);
console.log(`Generated ${join(outputDir, "dates", "index.html")}`);
console.log(`Generated ${join(outputDir, "search.json")}`);
console.log(`Generated ${join(outputDir, "autocomplete.txt")}`);
console.log(`Generated ${join(outputDir, "feed.xml")}`);
console.log(`Generated ${join(outputDir, "sitemap.xml")}`);
console.log(`Generated ${join(outputDir, "robots.txt")}`);
console.log(`Generated ${join(outputDir, "404.html")}`);
console.log(`Generated ${join(outputDir, "CNAME")}`);
console.log(`Generated ${join(outputDir, "assets")}`);

