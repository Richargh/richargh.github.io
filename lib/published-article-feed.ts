import { articlePartAnchor, type Article, type ArticlePublication } from "./articles.ts";
import type { FeedEntry } from "./site-resources.ts";

export function publishedArticleFeedEntries(articles: Article[], buildDate = new Date().toISOString().slice(0, 10)): FeedEntry[] {
  return articles.flatMap((article) => article.articles
    .filter((part) => !part.upcoming)
    .flatMap((part) => part.publications)
    .filter((publication) => !publication.upcoming && !publication.upcomingSince && publication.date <= buildDate && publication.url)
    .map(publicationFeedEntry));
}

function publicationFeedEntry(publication: ArticlePublication): FeedEntry {
  const title = [publication.articleTitle, publication.part ? `Part ${publication.part}` : undefined, publication.subtitle].filter(Boolean).join(" — ");
  const publisher = [publication.publisher, publication.issue].filter(Boolean).join(" ");
  const id = [publication.articleId, publication.part ?? "", publication.publisher, publication.date, publication.language ?? ""].map(encodeURIComponent).join("/");
  return {
    title: `Published article: ${title}`,
    idPath: `/articles/#published-${id}`,
    linkPath: `/articles/#${articlePartAnchor(publication)}`,
    date: publication.date,
    summary: `${title}, published by ${publisher} on ${publication.date}${publication.language ? ` (${publication.language})` : ""}.`,
  };
}
