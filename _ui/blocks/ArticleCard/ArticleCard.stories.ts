import { renderArticleCard, type ArticleCardOptions } from "./ArticleCard.ts";
import { renderCalloutLink } from "../CalloutLink/CalloutLink.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

const meta = {
  title: "Blocks/ArticleCard",
  render: renderArticleCard,
  args: {
    id: "preview-article-card-default",
    title: "Article card",
    childrenHtml: "<p>A reusable card for articles, talks, and interviews.</p>",
  },
} satisfies StyleMeta<ArticleCardOptions>;

export default meta;

export const Default = {} satisfies StyleStory<ArticleCardOptions>;

export const TaggedBanner = {
  name: "Tagged banner",
  args: {
    id: "preview-article-card-tagged",
    title: "Card with tags",
    banner: { tags: ["architecture", "modernisation", "delivery"] },
  },
} satisfies StyleStory<ArticleCardOptions>;

export const Thumbnail = {
  args: {
    id: "preview-article-card-thumbnail",
    title: "Card with thumbnail",
    banner: {
      thumbnail: "/assets/img/thumbnails/article-kvj.png",
      tags: ["java", "kotlin"],
    },
  },
} satisfies StyleStory<ArticleCardOptions>;

export const LinkedBanner = {
  name: "Linked banner",
  args: {
    id: "preview-article-card-linked-banner",
    title: "Card with linked banner",
    banner: {
      linkUrl: "/articles/",
      linkLabel: "Read articles",
      tags: ["articles", "publications"],
    },
  },
} satisfies StyleStory<ArticleCardOptions>;

export const WithActions = {
  name: "With actions",
  args: {
    id: "preview-article-card-actions",
    title: "Card with actions",
    actionsHtml: renderCalloutLink({ href: "/hire/", label: "Learn more", utilities: ["button-compact", "button-primary"] }),
    childrenHtml: "<p>The action area composes other blocks without changing the card renderer.</p>",
  },
} satisfies StyleStory<ArticleCardOptions>;
