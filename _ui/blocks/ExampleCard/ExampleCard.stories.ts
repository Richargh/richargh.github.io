import { renderExampleCard, type ExampleCardOptions } from "./ExampleCard.ts";
import type { StyleMeta, StyleStory } from "../../StyleStory.ts";

const meta = {
  title: "Blocks/ExampleCard",
  render: renderExampleCard,
  args: {
    description: "A concise example with supporting information.",
  },
} satisfies StyleMeta<ExampleCardOptions>;

export default meta;

export const Default = {} satisfies StyleStory<ExampleCardOptions>;

export const Titled = {
  args: {
    title: "Delivery example",
    description: "A card with an explicit title.",
  },
} satisfies StyleStory<ExampleCardOptions>;

export const WithMeta = {
  name: "With metadata",
  args: {
    title: "Modernisation outcome",
    description: "Metadata highlights structured facts about the example.",
    meta: [
      { label: "Industry", value: "Energy" },
      { label: "Team", value: "25 people" },
    ],
  },
} satisfies StyleStory<ExampleCardOptions>;

export const WithTags = {
  name: "With tags",
  args: {
    description: "Tags provide a compact list of related topics.",
    tags: ["Kotlin", "Architecture", "Continuous delivery"],
  },
} satisfies StyleStory<ExampleCardOptions>;

export const WithCode = {
  name: "With code",
  args: {
    title: "Code example",
    description: "Code is shown when both a language and source are provided.",
    language: "javascript",
    code: "const greeting = 'Hello, world!';\nconsole.log(greeting);",
  },
} satisfies StyleStory<ExampleCardOptions>;

export const Linked = {
  args: {
    title: "Linked example",
    description: "An optional link provides the next action.",
    href: "/modern-web-features/",
    linkLabel: "Explore modern web features",
  },
} satisfies StyleStory<ExampleCardOptions>;

export const Complete = {
  args: {
    title: "Complete example",
    description: "All optional content can be combined in one card.",
    meta: [{ label: "Status", value: "Published" }],
    tags: ["HTML", "CSS"],
    language: "html",
    code: "<article>Example</article>",
    href: "/articles/",
    linkLabel: "Read the articles",
  },
} satisfies StyleStory<ExampleCardOptions>;
