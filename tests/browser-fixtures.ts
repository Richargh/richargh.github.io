import type { Page } from "@playwright/test";
import { parseTalks } from "../lib/talks.ts";
import { parseRelatedGroups } from "../lib/cross-links.ts";
import { renderTalkDocument } from "../_ui/pages/Talk/Talk.ts";

// Feature tests own their data; published talks may change or disappear freely.
export const talk = parseTalks(`- id: demo
  title: Example talk
  abstract: Example abstract.
  appearances:
    - id: example-conf
      conference: Example conference
      date: 2025-01-01
      location: remote
      slideUrl: https://example.com/slides
      videoUrl: https://example.com/video
`)[0];
export const talkPath = "/t/demo/example-conf/";
const relatedGroups = parseRelatedGroups(`- id: demo-related
  items:
    - kind: talk
      id: demo
    - kind: article
      id: demo-article
    - kind: interview
      id: demo-interview
`);

export async function openTalkFixture(page: Page): Promise<void> {
  await page.route(/\/t\/demo\/example-conf\/?$/, (route) => route.fulfill({
    contentType: "text/html", body: renderTalkDocument(talk, talk.appearances[0], relatedGroups),
  }));
  await page.goto(talkPath);
}
