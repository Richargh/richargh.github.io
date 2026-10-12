import { expect, test } from "@playwright/test";

test("index is the about page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 4, name: "Richard's Blog" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
});

test("blog feed is generated from posts", async ({ page }) => {
  await page.goto("/posts/");
  await expect(page.getByRole("link", { name: /GenAI is a waste of our time/ })).toHaveAttribute("href", "/posts/AI-Waste");
});

test("explicit permalink post renders at its public URL", async ({ page }) => {
  await page.goto("/posts/gen-ai-track-record/");

  await expect(page).toHaveURL(/\/posts\/gen-ai-track-record\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Generative AI Track record" })).toBeVisible();
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://richargh.de/posts/gen-ai-track-record/");
});

test("main navigation opens ordinary content pages", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/?$/);
  await expect(page.getByRole("link", { name: /GenAI is a waste of our time/ })).toHaveAttribute("href", "/posts/AI-Waste");

  await page.goto("/talks/");

  await expect(page.getByRole("heading", { level: 1, name: "Talks" })).toBeVisible();
  await expect(page.locator(".talk-card", { hasText: "Domain Re-discovery Patterns for Legacy Code" })).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: /Articles/ }).click();
  await expect(page).toHaveURL(/\/articles\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Articles" })).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: /Interviews/ }).click();
  await expect(page).toHaveURL(/\/interviews\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "Interviews" })).toBeVisible();
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

test("talks page is generated as grouped cards from structured talk data", async ({ page }) => {
  await page.goto("/talks/");

  const talkCard = page.locator(".talk-card#drp4lc");
  await expect(talkCard.getByRole("heading", { level: 2, name: "Domain Re-discovery Patterns for Legacy Code" })).toBeVisible();
  await expect(talkCard.locator(".talk-banner-content")).toContainText("legacy-code");
  await expect(talkCard.locator(".talk-banner-content")).not.toContainText("drp4lc");
  await expect(talkCard.locator(".talk-appearance-line").filter({ hasText: "TechCamp Hamburg 2026" }).filter({ hasText: "v3.4" })).toBeVisible();
  await expect(talkCard.getByRole("link", { name: "TechCamp Hamburg 2026" })).toHaveAttribute("href", /techcamp\.hamburg/);

  const videoCard = page.locator(".talk-card#agentsec");
  await expect(videoCard.locator(".talk-banner-link")).toHaveAttribute("href", "https://www.youtube.com/watch?v=GLJGhkxMdgU");
  await expect(videoCard.locator(".talk-video-button", { hasText: "Video" }).first()).toBeVisible();

  const articleBackedTalk = page.locator(".talk-card#kvj");
  await expect(articleBackedTalk.locator(".talk-card-actions").getByRole("link", { name: "Article" })).toHaveAttribute("href", "/articles/#kvj");
});

test("articles page is generated from structured article data", async ({ page }) => {
  await page.goto("/articles/");

  const articleCard = page.locator(".talk-card#kvj");
  await expect(articleCard.getByRole("heading", { level: 2, name: "Kotlin kontra Java" })).toBeVisible();
  await expect(articleCard).toContainText("Part 1/5 - Ecosystem");
  await expect(articleCard).toContainText("Part 4/5 - Language for Safety");
  await expect(articleCard).toContainText("2026-04-16");
  await expect(articleCard).toContainText("Upcoming");
  await expect(articleCard.locator(".talk-card-actions").getByRole("link", { name: "Talk" })).toHaveAttribute("href", "/talks/#kvj");
});

test("interviews page is generated from structured interview data with visible show names", async ({ page }) => {
  await page.goto("/interviews/");

  const interviewCard = page.locator(".talk-card#dnr-gcq");
  await expect(interviewCard.getByRole("heading", { level: 2, name: "Grasping Code Quality with Richard Gross" })).toBeVisible();
  await expect(interviewCard).toContainText(".NET Rocks!");
  await expect(interviewCard.getByRole("link", { name: ".NET Rocks! #1927" })).toHaveAttribute("href", "https://www.dotnetrocks.com/details/1927");
  await expect(interviewCard.locator(".talk-line-links").getByRole("link", { name: "Apple Podcasts" })).toBeVisible();
  const streamCard = page.locator(".talk-card#swaist-cc");
  await expect(streamCard.locator(".talk-banner-link")).toHaveAttribute("style", /ccstream-2025-01-24-rDHtNNBoP6Y\.jpg/);
  await expect(streamCard.locator(".talk-banner-link")).toHaveAttribute("href", "https://tube.tchncs.de/w/a55879a2-5c3c-4d1f-bc1c-51e1c7a71cbd");
  await expect(streamCard.locator(".talk-video-button", { hasText: "Video" })).toBeVisible();

  const talkInterviewCard = page.locator(".talk-card#csq-rstbd");
  await expect(talkInterviewCard.locator(".talk-card-actions").getByRole("link", { name: "Talk" })).toHaveAttribute("href", "/talks/#rstbd");
});

test("schedule is generated from structured talk appearances", async ({ page }) => {
  await page.goto("/schedule/");

  await expect(page.getByRole("heading", { level: 1, name: "Schedule" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "2025" })).toBeVisible();
  const representativeRow = page.locator("tr").filter({ hasText: "The Surprising Similarities Between Renovating your House and your Code Base" }).filter({ hasText: "CTO Craft Con Berlin" }).filter({ hasText: "2025-09-23" });
  await expect(representativeRow).toBeVisible();
  await expect(representativeRow.getByRole("link", { name: "The Surprising Similarities Between Renovating your House and your Code Base" })).toHaveAttribute("href", "https://conference.ctocraft.com/berlin-2025/agenda/");
  await expect(representativeRow.getByRole("link", { name: "CTO Craft Con Berlin" })).toHaveCount(0);
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
  await page.goto("/posts/");
  await page.getByRole("link", { name: /GenAI is a waste of our time/ }).click();

  await expect(page).toHaveURL(/\/posts\/AI-Waste$/);
  await expect(page.getByRole("heading", { level: 1, name: "GenAI is a waste of our time" })).toBeVisible();
  const aiWasteImage = page.getByRole("img", { name: "AI Written" });
  await expect(aiWasteImage).toBeVisible();
  await expect.poll(() => aiWasteImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText("Try to keep E-Mails to")).toBeVisible();
  await expect(page.getByRole("link", { name: "AI Written, AI Read" })).toHaveAttribute("href", "https://marketoonist.com/2023/03/ai-written-ai-read.html");
});
