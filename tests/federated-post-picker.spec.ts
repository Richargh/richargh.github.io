import { expect, test } from "@playwright/test";

test("Mastodon picker supports custom domains, a new-tab composer, and remembers the choice", async ({ page, context }) => {
  await page.goto("/t/bee-arc/2023-09-29/");
  await page.getByRole("button", { name: "Mastodon", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Post on Mastodon" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("closedby", "any");
  const input = dialog.getByLabel("Mastodon instance");
  await expect(dialog.locator('option[value="chaos.social"]')).toHaveCount(1);
  await input.fill("javascript:alert(1)");
  await dialog.getByRole("button", { name: "Create post" }).click();
  expect(await input.evaluate((element: HTMLInputElement) => element.validity.valid)).toBe(false);
  await input.fill("https://custom.example/");
  await context.route("https://custom.example/share?**", (route) => route.fulfill({ body: "Composer" }));
  const popupPromise = context.waitForEvent("page");
  await dialog.getByRole("button", { name: "Create post" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  const destination = new URL(popup.url());
  expect(destination.origin + destination.pathname).toBe("https://custom.example/share");
  expect(destination.searchParams.get("text")).toContain("https://richargh.de/t/bee-arc/2023-09-29/");
  expect(destination.searchParams.has("instance")).toBe(false);
  await popup.close();
  await page.reload();
  await page.getByRole("button", { name: "Mastodon", exact: true }).click();
  await expect(input).toHaveValue("custom.example");
});

test("picker supports cancel, Escape, and native light dismiss", async ({ page }) => {
  await page.goto("/t/bee-arc/2023-09-29/");
  const open = page.getByRole("button", { name: "Mastodon", exact: true });
  const dialog = page.getByRole("dialog");
  await open.click();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
  await open.click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await open.click();
  await page.mouse.click(1, 1);
  await expect(dialog).not.toBeVisible();
});
