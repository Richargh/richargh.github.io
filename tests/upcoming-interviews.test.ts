import assert from "node:assert/strict";
import test from "node:test";
import { parseInterviews } from "../lib/interviews.ts";
import { upcomingFeedEntries } from "../lib/upcoming-feed.ts";
import { renderUpcomingInterviews } from "../_ui/blocks/UpcomingCollection/UpcomingCollection.ts";

const source = `- id: example
  show: Show
  title: Episode
  type: podcast
  date: '2000-01-01'
  language: en
  url: https://example.com/episode
`;

test("upcomingSince accepts quoted and unquoted ISO dates and rejects invalid dates", () => {
  for (const date of ["2025-01-01", "'2025-01-01'"]) {
    assert.equal(parseInterviews(`${source}  upcomingSince: ${date}\n`)[0].upcomingSince, "2025-01-01");
  }
  for (const date of ["2025-02-30", "2025-13-01", "tomorrow", "null", "123"]) {
    assert.throws(() => parseInterviews(`${source}  upcomingSince: ${date}\n`), /upcomingSince.*ISO date/);
  }
  assert.equal(parseInterviews(source)[0].upcomingSince, undefined);
});

test("upcoming interviews display a New badge for recent announcements and create dated feed entries", () => {
  const today = new Date().toISOString().slice(0, 10);
  const interviews = parseInterviews(`${source}  upcomingSince: '${today}'\n`);
  const html = renderUpcomingInterviews(interviews);
  assert.match(html, /Episode/);
  assert.match(html, /class="upcoming-new">New/);
  assert.deepEqual(upcomingFeedEntries([], [], interviews), [{
    title: "Upcoming interview: Episode",
    idPath: "/interviews/#upcoming-example",
    linkPath: "/interviews/#example",
    date: today,
    summary: "New upcoming interview: Episode on Show on 2000-01-01 in English.",
  }]);
  interviews[0].upcomingSince = "2000-01-01";
  assert.doesNotMatch(renderUpcomingInterviews(interviews), /class="upcoming-new"/);
  assert.deepEqual(upcomingFeedEntries([], [], parseInterviews(source)), []);
  assert.equal(renderUpcomingInterviews(parseInterviews(source)), "");
});
