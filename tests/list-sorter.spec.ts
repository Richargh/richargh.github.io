import { expect, test } from "@playwright/test";
import { renderTalksDocument } from "../_ui/pages/Talks/Talks.ts";
import { renderListSorter } from "../_ui/blocks/ListSorter/ListSorter.ts";
import { talk } from "./browser-fixtures.ts";

const talks = [
  { ...talk, id: "alpha", title: "Alpha", appearances: [{ ...talk.appearances[0], date: "2026-01-01" }] },
  { ...talk, id: "zulu", title: "Zulu", appearances: [{ ...talk.appearances[0], date: "2024-01-01" }] },
];

test("talk sort controls change the talk order", async ({ page }) => {
  await page.route(/\/talks\/?$/, (route) => route.fulfill({
    contentType: "text/html", body: renderTalksDocument(talks),
  }));
  await page.goto("/talks/");
  const titles = page.locator("list-sorter .article-card h2");
  await expect(titles).toHaveText(["Alpha", "Zulu"]);
  await page.getByRole("button", { name: "Title", exact: true }).click();
  await expect(titles).toHaveText(["Zulu", "Alpha"]);
});

test("generic sorter defaults to direct children and ascending names", async ({ page }) => {
  await page.goto("/talks/");
  await page.evaluate((html) => { document.body.innerHTML = html; }, renderListSorter({
    id: "direct-sorter",
    childrenHtml: `<section data-name="Zulu" data-date="2020-01-01">Z</section>
      <section data-name="Alpha" data-date="2025-01-01">A</section>`,
  }));
  const items = page.locator("list-sorter > section");
  await expect(items).toHaveText(["A", "Z"]);
  await page.getByRole("button", { name: "Date", exact: true }).click();
  await expect(items).toHaveText(["Z", "A"]);
});

test("selectors extract nested data and preserve unselected siblings and node state", async ({ page }) => {
  await page.goto("/talks/");
  await page.evaluate((html) => { document.body.innerHTML = html; }, renderListSorter({
    id: "nested-sorter",
    items: "li", nameSelector: "strong", dateSelector: "time", order: "desc",
    childrenHtml: `<ul><li><strong>Alpha</strong><time data-date="2025-01-01"></time><input value="kept"></li>
      <li><strong>Zulu</strong><time data-date="2020-01-01"></time></li></ul>
      <p>Untouched</p>`,
  }));
  const names = page.locator("list-sorter li strong");
  await expect(names).toHaveText(["Zulu", "Alpha"]);
  await page.locator("input").fill("edited");
  await page.getByRole("button", { name: "Date", exact: true }).click();
  await expect(names).toHaveText(["Alpha", "Zulu"]);
  await expect(page.locator("input")).toHaveValue("edited");
  await expect(page.locator("list-sorter > p")).toHaveText("Untouched");
});
