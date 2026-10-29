import assert from "node:assert/strict";
import test from "node:test";
import { displayTalkDate, groupTalkAppearancesByYear, loadTalkAppearances, loadTalks, parseTalkAppearances } from "../lib/talks.ts";

const minimalAppearance = "conference: Conf\n      location: in-person\n      city: City\n      country: Country\n";

test("loads talk families and every structured appearance from talks.yaml", async () => {
  const talks = await loadTalks();
  const appearances = await loadTalkAppearances();

  for (const talk of talks) assert.ok(talk.title.trim());
  for (const appearance of appearances) {
    assert.ok(appearance.title.trim());
    assert.ok(appearance.conference.trim());
    assert.match(appearance.date, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("groups by year descending and sorts each year by date descending", async () => {
  const groups = groupTalkAppearancesByYear(await loadTalkAppearances());

  assert.deepEqual(groups.map((group) => group.year), groups.map((group) => group.year).toSorted().reverse());
  for (const group of groups) {
    assert.ok(group.appearances.every((appearance) => appearance.date.startsWith(group.year)));
    assert.deepEqual(group.appearances.map((appearance) => appearance.date), group.appearances.map((appearance) => appearance.date).toSorted().reverse());
  }
});

test("displays the ISO appearance date", async () => {
  const appearance = parseTalkAppearances(`
- id: renovation
  title: The Surprising Similarities Between Renovating your House and your Code Base
  appearances:
    - conference: CTO Craft Con Berlin
      location: in-person
      city: Berlin
      country: Germany
      date: 2025-09-23
`)[0];

  assert.equal(displayTalkDate(appearance), "2025-09-23");
});

test("validates required fields, ISO dates, location, numbers, URLs, unknown fields, and duplicates", () => {
  assert.throws(() => parseTalkAppearances("- id: x1\n  appearances: []\n"), /title is required/);
  assert.throws(() => parseTalkAppearances(`- id: x1\n  title: Talk\n  appearances:\n    - ${minimalAppearance}      date: 2025-02-30\n`), /ISO date/);
  assert.throws(() => parseTalkAppearances("- id: x1\n  title: Talk\n  appearances:\n    - conference: Conf\n      location: local\n      date: 2025-01-01\n"), /in-person, remote, hybrid/);
  assert.throws(() => parseTalkAppearances("- id: x1\n  title: Talk\n  appearances:\n    - conference: Conf\n      location: in-person\n      date: 2025-01-01\n"), /city and country/);
  assert.throws(() => parseTalkAppearances(`- id: x1\n  title: Talk\n  appearances:\n    - ${minimalAppearance}      date: 2025-01-01\n      talkVersion: v1\n`), /talkVersion must be a number/);
  assert.throws(() => parseTalkAppearances(`- id: x1\n  title: Talk\n  appearances:\n    - ${minimalAppearance}      date: 2025-01-01\n      room: Main\n`), /unknown field: room/);
  assert.throws(() => parseTalkAppearances(`- id: x1\n  title: Talk\n  appearances:\n    - ${minimalAppearance}      date: 2025-01-01\n      eventUrl: /relative\n`), /absolute http\(s\) URL/);
  assert.throws(() => parseTalkAppearances(`- id: x1\n  title: Talk\n  appearances:\n    - ${minimalAppearance}      date: 2025-01-01\n- id: x2\n  title: Talk\n  appearances:\n    - ${minimalAppearance}      date: 2025-01-01\n`), /duplicate talk appearance/);
});
