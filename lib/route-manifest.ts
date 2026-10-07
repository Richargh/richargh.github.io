import type {Page, Post} from "./content.ts";
import {outputKeyForUrlPath} from "./output-compat.ts";

export interface RouteManifestEntry {
    urlPath: string;
    outputKey: string;
    kind: "home" | "post" | "page" | "index" | "resource" | "error";
    title?: string;
    updated?: string;
}

export function buildRouteManifest(posts: Post[], pages: Page[]): RouteManifestEntry[] {
    const entries: RouteManifestEntry[] = [
        {
            urlPath: "/",
            outputKey: outputKeyForUrlPath("/"),
            kind: "home" as const,
            title: "Richard's Blog",
            updated: newestDate(posts)
        },
        ...posts.map((post) => ({
            urlPath: post.urlPath,
            outputKey: outputKeyForUrlPath(post.urlPath),
            kind: "post" as const,
            title: post.title,
            updated: post.date
        })),
        ...pages.map((page) => ({
            urlPath: page.urlPath,
            outputKey: outputKeyForUrlPath(page.urlPath),
            kind: "page" as const,
            title: page.title
        })),
        {
            urlPath: "/tags/",
            outputKey: outputKeyForUrlPath("/tags/"),
            kind: "index" as const,
            title: "By Tags",
            updated: newestDate(posts)
        },
        {
            urlPath: "/dates/",
            outputKey: outputKeyForUrlPath("/dates/"),
            kind: "index" as const,
            title: "By Date",
            updated: newestDate(posts)
        },
        {
            urlPath: "/feed.xml",
            outputKey: outputKeyForUrlPath("/feed.xml"),
            kind: "resource" as const,
            title: "Atom Feed",
            updated: newestDate(posts)
        },
        {
            urlPath: "/sitemap.xml",
            outputKey: outputKeyForUrlPath("/sitemap.xml"),
            kind: "resource" as const,
            title: "Sitemap",
            updated: newestDate(posts)
        },
        {
            urlPath: "/robots.txt",
            outputKey: outputKeyForUrlPath("/robots.txt"),
            kind: "resource" as const,
            title: "Robots"
        },
        {
            urlPath: "/404.html",
            outputKey: outputKeyForUrlPath("/404.html"),
            kind: "error" as const,
            title: "404"
        },
    ];

    assertUnique(entries, (entry) => entry.urlPath, "duplicate route URL");
    assertUnique(entries, (entry) => entry.urlPath.toLocaleLowerCase("en-US"), "case-folded duplicate route URL");
    assertUnique(entries, (entry) => entry.outputKey, "duplicate route output path");
    assertUnique(entries, (entry) => entry.outputKey.toLocaleLowerCase("en-US"), "case-folded duplicate route output path");
    return entries;
}

export function sitemapRoutes(entries: RouteManifestEntry[]): RouteManifestEntry[] {
    return entries.filter((entry) => entry.kind === "home" || entry.kind === "post" || entry.kind === "page" || entry.kind === "index");
}

function newestDate(posts: Post[]): string | undefined {
    return posts[0]?.date;
}

function assertUnique<T>(items: T[], keyFor: (item: T) => string, label: string): void {
    const seen = new Map<string, T>();
    for (const item of items) {
        const key = keyFor(item);
        const previous = seen.get(key);
        if (previous) throw new Error(`${label}: ${key}`);
        seen.set(key, item);
    }
}
