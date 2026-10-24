import { expect, test } from "@playwright/test";

test("short talk URL works without a trailing slash and offers audience actions", async ({ page }) => {
  await page.goto("/t/bee-arc/2023-09-29");
  await expect(page.locator(".article-card")).toHaveCount(1);
  await expect(page.locator(".article-card").getByRole("link", { name: "Resources", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("2023-09-29 - JUG Saxony Day");
  await expect(page.locator("#bee-arc").getByRole("heading", { level: 2 })).toHaveText("Bienenstock Architektur");
  await expect(page).toHaveTitle("Richard's Blog");
  await expect(page.getByPlaceholder("Search the Blog...")).toBeVisible();
  await expect(page.locator("#bee-arc").getByRole("link", { name: "Slides", exact: true })).toHaveAttribute("href", "https://speakerdeck.com/richargh/bienenstock-architektur");
  await expect(page.locator("#bee-arc").getByRole("link", { name: "Video", exact: true })).toHaveAttribute("href", "https://vimeo.com/875223690");
  await expect(page.locator(".example-card")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Grab a coffee", exact: true })).toHaveAttribute("href", /bookings.cloud.microsoft/);
  await expect(page.getByRole("link", { name: "systemsthinking.dev", exact: true })).toHaveAttribute("href", "https://systemsthinking.dev");
  await expect(page.getByRole("button", { name: "E-Mail" })).toBeVisible();
  const feedback = page.locator(".example-card-actions");
  await expect(feedback.getByRole("link", { name: "BlueSky", exact: true })).toHaveAttribute("href", /bsky\.app\/intent\/compose\?text=/);
  await expect(feedback.getByRole("button", { name: "Mastodon", exact: true })).toHaveAttribute("command", "show-modal");
  await expect(feedback.getByRole("link", { name: "LinkedIn", exact: true })).toHaveAttribute("href", /linkedin\.com\/sharing\/share-offsite\/\?url=/);
  await expect(page.locator("#scroll-head")).toHaveAttribute("href", "/talks/#bee-arc");
  await expect(page.locator("#scroll-head")).toHaveText("Talks");
});

test("talk list links to the doorway and unknown IDs return 404", async ({ page, request }) => {
  await page.goto("/talks/");
  await page.locator("#bee-arc").getByRole("link", { name: "Resources", exact: true }).click();
  await expect(page).toHaveURL(/\/t\/bee-arc\/2023-09-29\/$/);
  const response = await request.get("/t/bee-arc/not-an-appearance");
  expect(response.status()).toBe(404);
});
