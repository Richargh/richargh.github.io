import { atomResponse } from "@mastrojs/feed";
import type { Post } from "./content.ts";
import { absoluteUrl, site } from "./config.ts";
import type { RouteManifestEntry } from "./route-manifest.ts";
import { sitemapRoutes } from "./route-manifest.ts";

export async function renderAtomFeed(posts: Post[]): Promise<string> {
  const response = await atomResponse({
    title: site.title,
    id: new URL(absoluteUrl("/")),
    linkSelf: new URL(absoluteUrl("/feed.xml")),
    linkWebsite: new URL(absoluteUrl("/")),
    updated: dateAtUtcMidnight(posts[0]?.date ?? new Date().toISOString().slice(0, 10)),
    author: { name: site.name },
    entries: posts.map((post) => ({
      title: post.title,
      id: new URL(absoluteUrl(post.urlPath)),
      link: new URL(absoluteUrl(post.urlPath)),
      updated: dateAtUtcMidnight(post.date),
      summary: post.excerpt,
    })),
  });

  return response.text();
}

export function renderSitemapXml(entries: RouteManifestEntry[]): string {
  const urls = sitemapRoutes(entries)
    .map((entry) => {
      const lastmod = entry.updated ? `\n    <lastmod>${xmlEscape(entry.updated)}</lastmod>` : "";
      return `  <url>\n    <loc>${xmlEscape(absoluteUrl(entry.urlPath))}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function renderRobotsTxt(): string {
  return `User-agent: *
Allow: /
Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}

function dateAtUtcMidnight(date: string): Date {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`);
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
