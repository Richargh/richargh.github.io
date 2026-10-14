import { renderCalloutLink, type CalloutLinkOptions } from "./CalloutLink.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

const meta = {
  title: "Blocks/CalloutLink",
  render: renderCalloutLink,
  args: {
    href: "/hire/",
    label: "Callout link",
    utilities: ["button-compact", "button-muted"],
  },
} satisfies StyleMeta<CalloutLinkOptions>;

export default meta;

export const Default = {} satisfies StyleStory<CalloutLinkOptions>;

export const Primary = {
  args: { label: "Primary link", utilities: ["button-compact", "button-primary"] },
} satisfies StyleStory<CalloutLinkOptions>;

export const CrossLink = {
  name: "Cross-link",
  args: { label: "Cross-link", utilities: ["button-compact", "button-cross-link"] },
} satisfies StyleStory<CalloutLinkOptions>;

export const Video = {
  args: { label: "Watch video", utilities: ["button-compact", "button-video"] },
} satisfies StyleStory<CalloutLinkOptions>;

export const Control = {
  args: { label: "Control link", utilities: ["button-control", "button-muted"] },
} satisfies StyleStory<CalloutLinkOptions>;
