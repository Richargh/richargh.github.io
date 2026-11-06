import { renderLogoWithTitle, type LogoWithTitleOptions } from "./LogoWithTitle.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

export default {
  title: "Blocks/LogoWithTitle",
  render: renderLogoWithTitle,
  args: { src: "/assets/img/conferences/javaland-26.avif", alt: "JavaLand", title: "2026" },
} satisfies StyleMeta<LogoWithTitleOptions>;

export const Logo = {} satisfies StyleStory<LogoWithTitleOptions>;
export const Compact = { args: { compact: true } } satisfies StyleStory<LogoWithTitleOptions>;
export const TextFallback = {
  args: { src: undefined, alt: "Local meetup", title: "2025" },
} satisfies StyleStory<LogoWithTitleOptions>;
