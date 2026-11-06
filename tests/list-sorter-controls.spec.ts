import { expect, test } from "@playwright/test";
import { renderListSorter } from "../_ui/blocks/ListSorter/ListSorter.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/talks/");
  await page.evaluate((html) => { document.body.innerHTML = html; }, renderListSorter({
    id: "sorter",
    childrenHtml: `<section data-name="Zulu" data-date-first="2020-01-01" data-date-last="2026-01-01">Z</section>
      <section data-name="Alpha" data-date-first="2024-01-01" data-date-last="2025-01-01">A</section>`,
  }));
});

test("sorter highlights the active field using compact Button styles", async ({ page }) => {
  const title = page.getByRole("button", { name: /^Title/ });
  const date = page.getByRole("button", { name: /^Date/ });
  await expect(title).toHaveAttribute("aria-pressed", "true");
  await expect(title).toHaveClass(/button button-compact .*button-cross-link/);
  await expect(date).toHaveClass(/button button-compact button-muted/);
  await expect(title).toHaveCSS("border-radius", "0px");
  await expect(date).toHaveCSS("border-radius", "0px");
  await expect(date).toHaveAttribute("command", "--sort");
  await expect(date).toHaveAttribute("commandfor", "sorter");
  await date.click();
  await expect(date).toHaveAttribute("aria-pressed", "true");
  await expect(title).toHaveAttribute("aria-pressed", "false");
  await expect(date).toHaveClass(/button button-compact .*button-cross-link/);
  await expect(title).toHaveClass(/button button-compact .*button-muted/);
});

test("sorter uses the first date ascending and last date descending", async ({ page }) => {
  const date = page.getByRole("button", { name: /^Date/ });
  const items = page.locator("list-sorter > section");
  await date.click();
  await expect(date).toHaveText("Date ↑ Asc");
  await expect(date).toHaveAttribute("data-order", "desc");
  await expect(items).toHaveText(["Z", "A"]);
  await date.click();
  await expect(date).toHaveText("Date ↓ Desc");
  await expect(date).toHaveAttribute("data-order", "asc");
  await expect(items).toHaveText(["Z", "A"]);
});

test("sorter direction can be toggled with the keyboard", async ({ page }) => {
  const title = page.getByRole("button", { name: /^Title/ });
  const items = page.locator("list-sorter > section");
  await expect(items).toHaveText(["A", "Z"]);
  await title.press("Enter");
  await expect(title).toHaveText("Title ↓ Desc");
  await expect(items).toHaveText(["Z", "A"]);
  await title.press("Space");
  await expect(title).toHaveText("Title ↑ Asc");
  await expect(items).toHaveText(["A", "Z"]);
});
