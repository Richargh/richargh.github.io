import { expect, test } from "@playwright/test";

test("index title is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Richargh's Blog" })).toBeVisible();
});
