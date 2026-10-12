import { renderHomePageDocument } from "../_ui/pages/Home/Home.ts";
import { loadArticles } from "../lib/articles.ts";
import { loadPage } from "../lib/content.ts";
import { loadInterviews } from "../lib/interviews.ts";
import { loadTalks } from "../lib/talks.ts";

export const title = "About";

export async function render(): Promise<string> {
  const [page, talks, articles, interviews] = await Promise.all([loadPage("_pages/home.adoc"), loadTalks(), loadArticles(), loadInterviews()]);

  return renderHomePageDocument({ page, talks, articles, interviews });
}
