import { loadAllPages, loadAllPosts } from "../lib/content.ts";
import { buildRouteManifest } from "../lib/route-manifest.ts";
import { renderSitemapXml } from "../lib/site-resources.ts";
import { loadTalks } from "../lib/talks.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });
  const pages = await loadAllPages();
  const talks = await loadTalks();
  return renderSitemapXml(buildRouteManifest(posts, pages, talks));
}
