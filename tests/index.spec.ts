import { expect, test } from "@playwright/test";

test("index feed is generated from posts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 4, name: "Richard's Blog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GenAI is a waste of our time/ })).toHaveAttribute("href", "/posts/AI-Waste");
});

test("explicit permalink post renders at its public URL", async ({ page }) => {
  await page.goto("/posts/upcoming/");

  await expect(page).toHaveURL(/\/posts\/upcoming\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Upcoming" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Upcoming Talks" })).toBeVisible();
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://richargh.de/posts/upcoming/");
});

test("main navigation opens ordinary content pages", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();

  await page.goto("/talks/");
  await expect(page.getByRole("heading", { level: 1, name: "Talks" })).toBeVisible();
  await expect(page.getByText("These are all past talks")).toBeVisible();
});

test("home-page browser search uses the generated post search index", async ({ page }) => {
  const searchJson = page.waitForResponse((response) => response.url().endsWith("/search.json") && response.ok());
  await page.goto("/");
  await searchJson;
  await page.getByPlaceholder("Search the Blog...").pressSequentially("waste");

  const result = page.locator("#results-container .search_res").filter({ hasText: "GenAI is a waste of our time" });
  await expect(result).toBeVisible();
  await expect(result.getByRole("link")).toHaveAttribute("href", "https://richargh.de/posts/AI-Waste");
});

test("tag and date compatibility anchors are served from generated indexes", async ({ page }) => {
  await page.goto("/tags/#java");
  await expect(page).toHaveURL(/\/tags\/#java$/);
  await expect(page.locator("h3#java")).toHaveText("Java");
  await expect(page.locator("h3#java")).toBeVisible();

  await page.goto("/dates/#26-May-2026");
  await expect(page).toHaveURL(/\/dates\/#26-May-2026$/);
  await expect(page.locator('h3[id="26-May-2026"]')).toHaveText("26-May-2026");
  await expect(page.locator('h3[id="26-May-2026"]')).toBeVisible();
});

test("generated autocomplete.txt is served without trailing empty suggestions", async ({ page }) => {
  const response = await page.goto("/autocomplete.txt");
  expect(response?.ok()).toBeTruthy();
  const body = await page.locator("body").innerText();

  expect(body).toContain("GenAI is a waste of our time");
  expect(body.trimEnd().endsWith(";")).toBeFalsy();
});

test("selected AsciiDoc post renders end to end", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /GenAI is a waste of our time/ }).click();

  await expect(page).toHaveURL(/\/posts\/AI-Waste$/);
  await expect(page.getByRole("heading", { level: 1, name: "GenAI is a waste of our time" })).toBeVisible();
  const aiWasteImage = page.getByRole("img", { name: "AI Written" });
  await expect(aiWasteImage).toBeVisible();
  await expect.poll(() => aiWasteImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText("Try to keep E-Mails to")).toBeVisible();
  await expect(page.getByRole("link", { name: "AI Written, AI Read" })).toHaveAttribute("href", "https://marketoonist.com/2023/03/ai-written-ai-read.html");
});
