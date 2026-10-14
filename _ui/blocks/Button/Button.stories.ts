import { renderButton, type ButtonOptions } from "./Button.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

const meta = {
  title: "Blocks/Button",
  render: renderButton,
  args: {
    label: "Button",
    type: "button",
    utilities: ["button-compact", "button-muted"],
  },
} satisfies StyleMeta<ButtonOptions>;

export default meta;

export const Default = {} satisfies StyleStory<ButtonOptions>;

export const Primary = {
  args: { label: "Primary button", utilities: ["button-compact", "button-primary"] },
} satisfies StyleStory<ButtonOptions>;

export const CrossLink = {
  name: "Cross-link",
  args: { label: "Cross-link button", utilities: ["button-compact", "button-cross-link"] },
} satisfies StyleStory<ButtonOptions>;

export const Video = {
  args: { label: "Video button", utilities: ["button-compact", "button-video"] },
} satisfies StyleStory<ButtonOptions>;

export const Control = {
  args: { label: "Control button", utilities: ["button-control", "button-muted"] },
} satisfies StyleStory<ButtonOptions>;
