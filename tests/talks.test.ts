import assert from "node:assert/strict";
import test from "node:test";
import { displayTalkDate, groupTalkAppearancesByYear, loadTalkAppearances, loadTalks, parseTalkAppearances } from "../lib/talks.ts";

const firstRowsByYear: Record<string, string> = {
  "2026": "Destructoring ist die Zukunft von Javas Encapsulation|IT Tage|2026-12-08",
  "2025": "Kotlin kontra Java|IT Tage|2025-12-11",
  "2024": "Domain Re-discovery Patterns for Legacy Code|Build Stuff|2024-11-15",
  "2023": "Bienenstock Architektur|JUG Saxony Day|2023-09-29",
  "2022": "Continuous Delivery for Legacy Code|DevOpsCon|2022-12-06",
  "2021": "Fixing the Billion-Dollar Mistake in C#|Build Stuff|2021-11-19",
  "2020": "Spring Boot: The Good Parts|Entwicklertag Frankfurt|2020-02-20",
  "2019": "Continuous Delivery for Legacy Code|Build Stuff|2019-11-13",
  "2018": "Continuous Delivery for Legacy Code|Xp Days|2018-11-09",
};

const minimalAppearance = "conference: Conf\n      location: in-person\n      city: City\n      country: Country\n";

test("loads talk families and every structured appearance from talks.yaml", async () => {
  const talks = await loadTalks();
  const appearances = await loadTalkAppearances();

  assert.ok(talks.some((talk) => talk.id === "drp4lc" && talk.title === "Domain Re-discovery Patterns for Legacy Code"));
  assert.equal(appearances.length, 43);
  assert.ok(appearances.some((appearance) => appearance.title === "Making sense of frontend code with forensic techniques" && appearance.conference === "c't <webdev>" && appearance.eventUrl === "https://ct-webdev.com/agenda-2025/"));
  assert.ok(appearances.some((appearance) => appearance.conference === "betterCode(Agentic Ai)" && appearance.location === "remote" && appearance.city === undefined));
});

test("groups by year descending and sorts each year by date descending", async () => {
  const groups = groupTalkAppearancesByYear(await loadTalkAppearances());

  assert.deepEqual(groups.map((group) => group.year), ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"]);
  for (const group of groups) {
    const first = group.appearances[0];
    assert.equal(`${first.title}|${first.conference}|${first.date}`, firstRowsByYear[group.year]);
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
