import { expect, test } from "@playwright/test";

for (const path of ["/", "/posts/", "/talks/", "/articles/", "/interviews/", "/schedule/"]) {
  test(`${path} renders a non-empty page heading`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\S/);
    for (const heading of await page.locator(".article-card h2").all()) {
      await expect(heading).toHaveText(/\S/);
    }
  });
}

test("main navigation opens content pages", async ({ page }) => {
  for (const path of ["/posts", "/articles", "/interviews"]) {
    await page.goto("/");
    await page.locator(`header a[href='${path}'], header a[href='${path}/']`).first().click();
    expect(new URL(page.url()).pathname.replace(/\/$/, "")).toBe(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\S/);
  }
});

test("browser search uses the generated post search index", async ({ page }) => {
  const entries = [{ title: "Unique searchable fixture", url: "/posts/test-fixture", content: "Browser search fixture" }];
  await page.route("**/search.json", (route) => route.fulfill({ json: entries }));
  const searchJson = page.waitForResponse((response) => response.url().endsWith("/search.json") && response.ok());
  await page.goto("/");
  await searchJson;
  await page.getByPlaceholder("Search the Blog...").pressSequentially("Unique searchable");
  const result = page.locator("#results-container .search_res");
  await expect(result).toBeVisible();
  await expect(result.getByRole("link")).toHaveAttribute("href", /\/posts\/test-fixture$/);
});

test("generated tag and date anchors can be followed", async ({ page }) => {
  for (const path of ["/tags/", "/dates/"]) {
    await page.goto(path);
    const headings = page.locator("h3[id]");
    for (const heading of await headings.all()) {
      await expect(heading).toHaveText(/\S/);
    }
    if (await headings.count()) {
      const id = await headings.first().getAttribute("id");
      await page.goto(`${path}#${encodeURIComponent(id!)}`);
      await expect(headings.first()).toBeVisible();
    }
  }
});

test("generated autocomplete has no empty suggestions", async ({ request }) => {
  const response = await request.get("/autocomplete.txt");
  expect(response.ok()).toBeTruthy();
  const body = (await response.text()).trim();
  if (body) {
    expect(body.endsWith(";")).toBeFalsy();
    expect(body.split(";").every((suggestion) => suggestion.trim().length > 0)).toBeTruthy();
  }
});

test("published post links render headings and canonical URLs", async ({ page }) => {
  await page.goto("/posts/");
  const links = page.locator(".feed-title-excerpt-block > a");
  if (!(await links.count())) return; // An empty collection is valid.
  const href = await links.first().getAttribute("href");
  expect(href).toBeTruthy();
  const response = await page.goto(href!);
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\S/);
  const canonical = await page.locator("link[rel='canonical']").getAttribute("href");
  expect(new URL(canonical!).pathname).toBe(new URL(page.url()).pathname);
});
