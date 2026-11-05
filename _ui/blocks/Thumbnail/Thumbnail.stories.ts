import { renderThumbnail, type ThumbnailOptions } from "./Thumbnail.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

export default {
  title: "Blocks/Thumbnail",
  render: renderThumbnail,
  args: { src: "/assets/img/thumbnails/bee-arc-2023-09-29-875223690.avif", alt: "Beehive architecture" },
} satisfies StyleMeta<ThumbnailOptions>;

export const Static = {} satisfies StyleStory<ThumbnailOptions>;
export const Playable = {
  args: { href: "https://example.com/recording", label: "Watch recording", playable: true },
} satisfies StyleStory<ThumbnailOptions>;
export const Versioned = {
  args: { href: "https://example.com/recording", label: "Watch recording v2", playable: true, playLabel: "v2" },
} satisfies StyleStory<ThumbnailOptions>;
