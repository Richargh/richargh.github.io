import { expect, test } from "@playwright/test";
import { openTalkFixture } from "./browser-fixtures.ts";

test("talk doorway offers audience actions without a Resource self-link", async ({ page }) => {
  await openTalkFixture(page);
  const card = page.locator(".article-card");
  await expect(card).toHaveCount(1);
  await expect(card.locator(".article-card-banner")).toHaveCSS("border-bottom-style", "solid");
  await expect(card.locator(".article-card-banner")).toHaveCSS("border-bottom-width", "1px");
  await expect(card.getByRole("link", { name: "Resources", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\S/);
  await expect(card.getByRole("heading", { level: 2 })).toHaveText(/\S/);
  await expect(page.getByPlaceholder("Search the Blog...")).toBeVisible();
  await expect(card.getByRole("link", { name: "Slides", exact: true })).toHaveAttribute("href", "https://example.com/slides");
  await expect(card.getByRole("link", { name: "Video", exact: true })).toHaveAttribute("href", "https://example.com/video");
  await expect(page.locator(".example-card")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "E-Mail" })).toBeVisible();
  const feedback = page.locator(".example-card-actions");
  await expect(feedback.getByRole("link", { name: "BlueSky", exact: true })).toHaveAttribute("href", /bsky\.app\/intent\/compose\?text=/);
  await expect(feedback.getByRole("button", { name: "Mastodon", exact: true })).toHaveAttribute("command", "show-modal");
  await expect(feedback.getByRole("link", { name: "LinkedIn", exact: true })).toHaveAttribute("href", /linkedin\.com\/sharing\/share-offsite\/\?url=/);
  await expect(page.locator("#scroll-head")).toHaveAttribute("href", "/talks/#demo");
});

test("unknown talk IDs return 404", async ({ request }) => {
  const response = await request.get("/t/nonexistent-test-talk/nonexistent-appearance");
  expect(response.status()).toBe(404);
});
