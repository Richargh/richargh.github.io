import { renderTalksDocument } from "../../_ui/pages/Talks/Talks.ts";
import { loadArticles } from "../../lib/articles.ts";
import { loadRelatedGroups } from "../../lib/cross-links.ts";
import { loadInterviews } from "../../lib/interviews.ts";
import { loadTalks } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  const [talks, articles, interviews, relatedGroups] = await Promise.all([loadTalks(), loadArticles(), loadInterviews(), loadRelatedGroups()]);
  return renderTalksDocument(talks, articles, interviews, relatedGroups);
}
