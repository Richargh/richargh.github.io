import { renderBento, type BentoOptions } from "./Bento.ts";
import { renderThumbnail } from "../Thumbnail/Thumbnail.ts";
import { renderLogoWithTitle } from "../LogoWithTitle/LogoWithTitle.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

const supporting = [
  { src: "/assets/img/conferences/java-forum-stuttgart.svg", alt: "Java Forum Stuttgart", title: "2026" },
  { src: "/assets/img/conferences/it-tage-25.svg", alt: "IT Tage", title: "2025" },
  { src: "/assets/img/conferences/javaland-26.avif", alt: "JavaLand", title: "2025" },
  { alt: "Local meetup", title: "2024" },
  { src: "/assets/img/conferences/build-stuff-26.avif", alt: "Build Stuff", title: "2024" },
].map(renderLogoWithTitle);
const media = [
  "/assets/img/thumbnails/cd4lc-2024-02-01-djl2hJkzmGQ.avif",
  "/assets/img/thumbnails/cd4lc-2019-11-13-AaexmSPQVpU.avif",
  "/assets/img/thumbnails/bee-arc-2023-09-29-875223690.avif",
].map((src, index) => renderThumbnail({ src, href: `https://example.com/recording-${index}`, label: `Watch recording ${index}`, playable: true, playLabel: `v${index + 1}` }));

export default {
  title: "Blocks/Bento",
  render: renderBento,
  args: { supporting },
} satisfies StyleMeta<BentoOptions>;

export const SupportingOnly = {} satisfies StyleStory<BentoOptions>;
export const OneMedia = { args: { media: media.slice(0, 1) } } satisfies StyleStory<BentoOptions>;
export const TwoMediaFiveSupporting = { args: { media: media.slice(0, 2) } } satisfies StyleStory<BentoOptions>;
export const TwoMediaOneSupporting = { args: { media: media.slice(0, 2), supporting: supporting.slice(0, 1) } } satisfies StyleStory<BentoOptions>;
export const ThreeMedia = { args: { media } } satisfies StyleStory<BentoOptions>;
