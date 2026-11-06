import assert from "node:assert/strict";
import test from "node:test";
import { renderTalkCard } from "../_ui/pages/Talks/Talks.ts";
import { talk } from "./browser-fixtures.ts";

test("talk sort dates include non-video appearances and exclude upcoming appearances", () => {
  const appearance = talk.appearances[0];
  const html = renderTalkCard({
    ...talk,
    appearances: [
      { ...appearance, date: "2020-01-01" },
      { ...appearance, date: "2026-01-01", videoUrl: undefined },
      { ...appearance, date: "2027-01-01", upcoming: true },
      { ...appearance, date: "2028-01-01", upcomingSince: "2026-01-01" },
    ],
  });
  assert.ok(html.includes('data-date-first="2020-01-01"'));
  assert.ok(html.includes('data-date-last="2026-01-01"'));
});
