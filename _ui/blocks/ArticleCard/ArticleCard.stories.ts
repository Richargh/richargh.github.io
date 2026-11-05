import { renderArticleCard, type ArticleCardOptions } from "./ArticleCard.ts";
import { renderBento } from "../Bento/Bento.ts";
import { renderLogoWithTitle } from "../LogoWithTitle/LogoWithTitle.ts";
import { renderThumbnail } from "../Thumbnail/Thumbnail.ts";
import { renderCalloutLink } from "../CalloutLink/CalloutLink.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

export default {
  title: "Blocks/ArticleCard",
  render: renderArticleCard,
  args: {
    id: "preview-article-card-default",
    title: "Article card",
    childrenHtml: "<p>A reusable card for articles, talks, and interviews.</p>",
  },
} satisfies StyleMeta<ArticleCardOptions>;

export const Default = {} satisfies StyleStory<ArticleCardOptions>;
export const TaggedBanner = {
  args: {
    id: "preview-article-card-tagged",
    bannerHtml: renderLogoWithTitle({ alt: "Card with tags", tags: ["architecture", "modernisation", "delivery"] }),
  },
} satisfies StyleStory<ArticleCardOptions>;
export const Thumbnail = {
  args: {
    id: "preview-article-card-thumbnail",
    bannerHtml: renderThumbnail({ src: "/assets/img/thumbnails/article-kvj.png", alt: "Java and Kotlin", tags: ["java", "kotlin"] }),
  },
} satisfies StyleStory<ArticleCardOptions>;
export const BentoBanner = {
  args: {
    id: "preview-article-card-bento",
    bannerHtml: renderBento({
      media: [renderThumbnail({ href: "https://example.com/recording", label: "Watch recording", playable: true, playLabel: "v2" })],
      supporting: [
        renderLogoWithTitle({ src: "/assets/img/conferences/javaland-26.png", alt: "JavaLand", title: "2026" }),
        renderLogoWithTitle({ alt: "Local meetup", title: "2024" }),
      ],
    }),
  },
} satisfies StyleStory<ArticleCardOptions>;
export const LinkedBanner = {
  args: {
    id: "preview-article-card-linked-banner",
    bannerHtml: renderLogoWithTitle({ alt: "Read articles", href: "/articles/", tags: ["articles", "publications"] }),
  },
} satisfies StyleStory<ArticleCardOptions>;
export const WithActions = {
  name: "With actions",
  args: {
    id: "preview-article-card-actions",
    actionsHtml: renderCalloutLink({ href: "/hire/", label: "Learn more", utilities: ["button-compact", "button-primary"] }),
  },
} satisfies StyleStory<ArticleCardOptions>;
