import { loadAllPages, loadAllPosts } from "../lib/content.ts";
import { buildRouteManifest } from "../lib/route-manifest.ts";
import { renderSitemapXml } from "../lib/site-resources.ts";

export async function render(): Promise<string> {
  const posts = await loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE });
  const pages = await loadAllPages();
  return renderSitemapXml(buildRouteManifest(posts, pages));
}
