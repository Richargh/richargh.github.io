import { renderInterviewsDocument } from "../../_ui/pages/Interviews/Interviews.ts";
import { loadArticles } from "../../lib/articles.ts";
import { loadRelatedGroups } from "../../lib/cross-links.ts";
import { loadInterviews } from "../../lib/interviews.ts";
import { loadTalks } from "../../lib/talks.ts";

export async function render(): Promise<string> {
  const [interviews, talks, articles, relatedGroups] = await Promise.all([loadInterviews(), loadTalks(), loadArticles(), loadRelatedGroups()]);
  return renderInterviewsDocument(interviews, talks, articles, relatedGroups);
}
