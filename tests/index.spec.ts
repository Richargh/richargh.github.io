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
