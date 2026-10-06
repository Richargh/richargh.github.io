import { expect, test } from "@playwright/test";

test("MicroLighter highlights AsciiDoc callout code without token span markup", async ({ page }) => {
  await page.goto("/posts/Contract-Tests-in-Kotlin");
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

test("MicroLighter code blocks stay light and fill the pre in dark color scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/posts/java-version-history/");
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

  expect(styles.preBackground).toBe("rgb(247, 247, 247)");
  expect(styles.codeBackground).toBe("rgb(247, 247, 247)");
  expect(styles.codeWidth).toBeGreaterThanOrEqual(styles.preWidth);
});
