import { loadArticles } from "../lib/articles.ts";
import { loadAllPosts } from "../lib/content.ts";
import { renderAtomFeed } from "../lib/site-resources.ts";
import { loadTalks } from "../lib/talks.ts";
import { upcomingFeedEntries } from "../lib/upcoming-feed.ts";

export async function render(): Promise<string> {
  const [posts, talks, articles] = await Promise.all([loadAllPosts({ buildDate: process.env.MASTRO_BUILD_DATE }), loadTalks(), loadArticles()]);
  return renderAtomFeed(posts, upcomingFeedEntries(talks, articles));
}
