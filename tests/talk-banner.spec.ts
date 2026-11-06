import { expect, test } from "@playwright/test";
import { parseTalks } from "../lib/talks.ts";
import { renderTalkCard } from "../_ui/pages/Talks/Talks.ts";
import { renderLayout } from "../_ui/layouts/SiteLayout/SiteLayout.ts";

const talks = parseTalks([1, 3].map((count) => `- id: logos-${count}
  title: ${count} logo banner
  appearances:
${Array.from({ length: count }, (_, index) => `    - conference: Conference ${index + 1}
      date: 2025-01-0${index + 1}
      location: remote
      logoUrl: /assets/img/conferences/it-tage-25.svg`).join("\n")}`).join("\n"));

for (const width of [320, 1100]) {
  test(`single-logo banners match the compact three-logo banner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route("**/assets/img/conferences/it-tage-25.svg", (route) => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="28" fill="#4183c4"/></svg>',
    }));
    await page.route("**/talk-banner-fixture/", (route) => route.fulfill({
      contentType: "text/html",
      body: renderLayout({
        title: "Logo banners", urlPath: "/talk-banner-fixture/", description: "Fixture", type: "website",
        content: talks.map((talk) => renderTalkCard(talk)).join("\n"),
      }),
    }));
    await page.goto("/talk-banner-fixture/");
    const single = page.locator("#logos-1 .article-card-banner");
    const multiple = page.locator("#logos-3 .article-card-banner");
    const singleBounds = (await single.boundingBox())!;
    const multipleBounds = (await multiple.boundingBox())!;
    expect(singleBounds.height).toBeCloseTo(multipleBounds.height, 1);
    expect(singleBounds.height).toBeLessThan(width > 620 ? 220 : 90);
    await expect(single.locator(".logo-with-title-image")).toBeVisible();
    await expect(single.locator(".logo-with-title-caption")).toHaveText("2025");
    await expect(single.locator(".thumbnail-play")).toHaveCount(0);
  });
}
