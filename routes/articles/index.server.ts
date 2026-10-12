import { renderArticlesDocument } from "../../_ui/pages/Articles/Articles.ts";
import { loadArticles } from "../../lib/articles.ts";
import { loadRelatedGroups } from "../../lib/cross-links.ts";
import { loadInterviews } from "../../lib/interviews.ts";
import { loadTalks } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  const [articles, talks, interviews, relatedGroups] = await Promise.all([loadArticles(), loadTalks(), loadInterviews(), loadRelatedGroups()]);
  return renderArticlesDocument(articles, talks, interviews, relatedGroups);
}
