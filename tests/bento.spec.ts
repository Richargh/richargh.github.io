import { expect, test } from "@playwright/test";
import { renderBento } from "../_ui/blocks/Bento/Bento.ts";
import { renderThumbnail } from "../_ui/blocks/Thumbnail/Thumbnail.ts";
import { renderLogoWithTitle } from "../_ui/blocks/LogoWithTitle/LogoWithTitle.ts";
import { renderLayout } from "../_ui/layouts/SiteLayout/SiteLayout.ts";

const fixturePath = "/bento-fixture/";

test.beforeEach(async ({ page }) => {
  await page.route("**/assets/img/conferences/it-tage-25.svg", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#4183c4"/></svg>',
  }));
  await page.route(`**${fixturePath}*`, (route) => {
    const url = new URL(route.request().url());
    const count = Number(url.searchParams.get("count") ?? 5);
    return route.fulfill({
      contentType: "text/html",
      body: renderLayout({
        title: "Bento fixture", urlPath: fixturePath, description: "Test", type: "website",
        content: renderBento({
          supporting: Array.from({ length: count }, (_, index) => renderLogoWithTitle({
            alt: index === 0 ? "Local meetup" : `Conference ${index}`, title: "2026",
            src: index === 0 ? undefined : "/assets/img/conferences/it-tage-25.svg",
          })),
          media: url.searchParams.has("noVideo") ? [] : Array.from({ length: Number(url.searchParams.get("videos") ?? 1) }, (_, index) => renderThumbnail({
            href: `https://example.com/recording-${index}`, label: `Watch recording ${index}`,
            src: "/assets/img/conferences/it-tage-25.svg", playable: true, playLabel: index === 0 ? "v2" : undefined,
          })),
        }),
      }),
    });
  });
});

for (const width of [320, 1100]) {
  for (const video of [true, false]) {
    test(`equal, flush bento areas at ${width}px, media=${video}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${fixturePath}?count=7${video ? "" : "&noVideo"}`);
      const bento = page.locator(".bento");
      const bounds = (await bento.boundingBox())!;
      for (const row of await page.locator(".bento-row").all()) expect(await row.locator(".bento-supporting-item").count()).toBeLessThanOrEqual(video ? 2 : 4);
      const areas = await page.locator(".bento-supporting-item").evaluateAll((elements) => elements.map((element) => {
        const box = element.getBoundingClientRect();
        return box.width * box.height;
      }));
      expect(Math.max(...areas) / Math.min(...areas)).toBeLessThan(1.03);
      const panel = (await page.locator(".bento-supporting").boundingBox())!;
      expect(areas.reduce((sum, area) => sum + area, 0) / (panel.width * panel.height)).toBeGreaterThan(0.98);
      if (video) {
        const link = page.getByRole("link", { name: "Watch recording 0", exact: true });
        const box = (await page.locator(".bento-media").boundingBox())!;
        expect(box.width / box.height).toBeCloseTo(16 / 9, 2);
        if (width > 620) expect(box.width / bounds.width).toBeCloseTo(2 / 3, 2);
        const play = link.locator(".thumbnail-play");
        const playBox = (await play.boundingBox())!;
        expect(playBox.width).toBeCloseTo(playBox.height, 1);
        await expect(play).toHaveCSS("border-radius", "0px");
        await expect(play.locator(".thumbnail-play-label")).toHaveText("v2");
        await link.focus();
        await expect(link).toHaveCSS("outline-style", "solid");
      }
      await expect(bento).toHaveCSS("background-image", "none");
      await expect(page.locator(".logo-with-title-fallback")).toHaveText("Local meetup");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}

for (const width of [320, 1100]) {
  for (const [videos, logos] of [[2, 1], [2, 5], [3, 5]]) {
    test(`${videos} media + ${logos} supporting at ${width}px keep media 16:9`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1200 });
      await page.goto(`${fixturePath}?videos=${videos}&count=${logos}`);
      const boxes = [];
      for (const item of await page.locator(".bento-media").all()) {
        const box = (await item.boundingBox())!;
        expect(box.width / box.height).toBeCloseTo(16 / 9, 2);
        boxes.push(box);
      }
      expect(boxes).toHaveLength(videos);
      const panel = (await page.locator(".bento-supporting").boundingBox())!;
      const banner = (await page.locator(".bento").boundingBox())!;
      if (width > 620) {
        expect(boxes[0].width / banner.width).toBeCloseTo(0.5, 2);
        expect(boxes[0].y).toBeCloseTo(boxes[1].y, 1);
        if (videos === 3) {
          expect(panel.y).toBeCloseTo(boxes[2].y, 1);
          expect(panel.x).toBeCloseTo(boxes[1].x, 1);
          expect(panel.height).toBeCloseTo(boxes[2].height, 1);
        } else {
          expect(panel.y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height - 1);
          expect(panel.width).toBeCloseTo(banner.width, 1);
        }
      } else {
        expect(panel.y).toBeGreaterThanOrEqual(boxes.at(-1)!.y + boxes.at(-1)!.height - 1);
        expect(boxes[0].width).toBeCloseTo(banner.width, 1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}

test("each composed thumbnail has its own play button and link", async ({ page }) => {
  await page.goto(`${fixturePath}?videos=3`);
  const links = page.locator(".bento-media .thumbnail");
  await expect(links).toHaveCount(3);
  for (let index = 0; index < 3; index++) {
    const link = links.nth(index);
    await expect(link).toHaveAttribute("href", `https://example.com/recording-${index}`);
    await expect(link.locator(".thumbnail-image")).toHaveCount(1);
    await expect(link.locator(".thumbnail-play")).toBeVisible();
    await expect(link.locator(".logo-with-title-image")).toHaveCount(0);
  }
  await expect(links.nth(1).locator(".thumbnail-play-label")).toHaveCount(0);
});

test("logo and title are centered together, with theme-aware glow", async ({ page }) => {
  await page.goto(fixturePath);
  const logo = page.locator(".logo-with-title-image").first();
  await expect(logo).toHaveJSProperty("naturalWidth", 64);
  const image = (await logo.boundingBox())!;
  const tile = (await logo.locator("..").boundingBox())!;
  const title = (await logo.locator("..").locator(".logo-with-title-caption").boundingBox())!;
  expect(title.y - (image.y + image.height)).toBeCloseTo(6, 0);
  expect((image.y + title.y + title.height) / 2).toBeCloseTo(tile.y + tile.height / 2, 0);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(logo).toHaveCSS("filter", /rgba?\(0, 0, 0/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(logo).toHaveCSS("filter", /rgba?\(255, 255, 255/);
});
