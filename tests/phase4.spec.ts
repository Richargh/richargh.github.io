import { expect, test, type Page } from "@playwright/test";
import { renderPostDocument } from "../routes/posts/AI-Waste.server.ts";
import { convertAsciiDocFragment } from "../lib/asciidoc.ts";

async function openCodeFixture(page: Page): Promise<void> {
  const html = renderPostDocument({
    sourcePath: "fixture.adoc", title: "Code fixture", date: "2025-01-01",
    slug: "fixture", urlPath: "/posts/test-code", tags: [], comments: false, excerpt: "Code",
    html: convertAsciiDocFragment('[source,kotlin]\n----\nval greeting = "hello" // <1>\n----\n<1> Explanation'),
  });
  await page.route("**/posts/test-code", (route) => route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("/posts/test-code");
}

test("MicroLighter highlights AsciiDoc callout code without token span markup", async ({ page }) => {
  await openCodeFixture(page);
  const code = page.locator("pre > code.language-kotlin").first();
  await expect(code).toBeVisible();
  await expect.poll(() => page.evaluate(() => CSS.highlights.size)).toBeGreaterThan(0);
  await expect(code.locator("span")).toHaveCount(0);

  const firstCodeHasHighlightRanges = await code.evaluate((element) => {
    const node = element.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return false;

    for (const highlight of CSS.highlights.values()) {
      for (const range of highlight) {
        if (range.startContainer === node || range.endContainer === node) return true;
      }
    }
    return false;
  });

  expect(firstCodeHasHighlightRanges).toBe(true);
});

test("MicroLighter code blocks follow dark color scheme and fill the pre", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await openCodeFixture(page);
  const code = page.locator("pre > code[class*='language-']").first();
  await expect(code).toBeVisible();

  const styles = await code.evaluate((element) => {
    const pre = element.parentElement;
    if (!pre) throw new Error("code block is missing its pre parent");
    return {
      preBackground: getComputedStyle(pre).backgroundColor,
      codeBackground: getComputedStyle(element).backgroundColor,
      preWidth: Math.round(pre.getBoundingClientRect().width),
      codeWidth: Math.round(element.getBoundingClientRect().width),
    };
  });

  expect(styles.preBackground).toBe("rgb(26, 26, 26)");
  expect(styles.codeBackground).toBe("rgb(26, 26, 26)");
  expect(styles.codeWidth).toBeGreaterThanOrEqual(styles.preWidth);
});
