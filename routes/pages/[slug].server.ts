import { renderBuiltPageDocument } from "../../_ui/pages/Built/Built.ts";
import { renderCredentialsPageDocument } from "../../_ui/pages/Credentials/Credentials.ts";
import { renderPublishedPageDocument } from "../../_ui/pages/Published/Published.ts";
import type { Page } from "../../lib/content.ts";
import { loadAllPages } from "../../lib/content.ts";

export async function render(slug: string): Promise<string> {
  const page = (await loadAllPages()).find((candidate) => candidate.slug === slug || candidate.urlPath === `/${slug}/`);
  if (!page) throw new Error(`Unknown page slug: ${slug}`);
  return renderPageDocument(page);
}

export function renderPageDocument(page: Page): string {
  if (page.slug === "built") return renderBuiltPageDocument(page);
  if (page.slug === "credentials") return renderCredentialsPageDocument(page);
  if (page.slug === "published") return renderPublishedPageDocument(page);
  throw new Error(`No page renderer registered for ${page.sourcePath}`);
}
