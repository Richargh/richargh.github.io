import assert from "node:assert/strict";
import test from "node:test";
import { loadSuccessStories, parseSuccessStories } from "../lib/success-stories.ts";

const validStoryFields = "  assignmentKind: modernization\n  published: true\n  dateFrom: 2025-01-01\n  dateTo: 2025-02-01\n  industry: Test\n  roles: [Architect]\n  codebaseSize: Roughly 100k lines of code\n  teamSize: Around 1 team / 8 people\n  keyTechnologies: [Kotlin]\n  accomplished: Done\n";

test("loads anonymized success stories from YAML", async () => {
  const stories = await loadSuccessStories();

  for (const story of stories) {
    assert.ok(story.title.trim());
    assert.ok(story.published);
    assert.ok(story.industry.trim());
  }
});

test("only published success stories are visible", () => {
  const stories = parseSuccessStories(`- id: visible-story
  title: Visible
${validStoryFields}- id: hidden-story
  title: Hidden
  assignmentKind: health-check
  published: false
  dateFrom: 2025-01-01
  dateTo: 2025-02-01
  industry: Test
  roles: [Architect]
  codebaseSize: Roughly 100k lines of code
  teamSize: Around 1 team / 8 people
  keyTechnologies: [Kotlin]
  accomplished: Done
`);

  assert.deepEqual(stories.map((story) => story.id), ["visible-story"]);
});

test("validates success story fields", () => {
  assert.throws(() => parseSuccessStories("{}\n"), /YAML sequence/);
  assert.throws(() => parseSuccessStories("- id: x\n"), /id must be a short lowercase ASCII id/);
  assert.throws(() => parseSuccessStories(`- id: story
  title: Story
${validStoryFields.replace("dateFrom: 2025-01-01", "dateFrom: 2025-02-30")}`), /ISO date/);
  assert.throws(() => parseSuccessStories(`- id: story
  title: Story
${validStoryFields.replace("dateFrom: 2025-01-01", "dateFrom: 2025-03-01").replace("dateTo: 2025-02-01", "dateTo: 2025-02-01")}`), /before or equal/);
  assert.throws(() => parseSuccessStories(`- id: story
  title: Story
${validStoryFields.replace("keyTechnologies: [Kotlin]", "keyTechnologies: []")}`), /non-empty sequence/);
  assert.throws(() => parseSuccessStories(`- id: story
  title: Story
${validStoryFields}  customer: ACME
`), /unknown field: customer/);
  assert.throws(() => parseSuccessStories(`- id: story
  title: Story
${validStoryFields.replace("assignmentKind: modernization", "assignmentKind: rescue")}`), /must be one of/);
  assert.throws(() => parseSuccessStories(`- id: story
  title: Story
${validStoryFields.replace("published: true", "published: yes")}`), /published.*boolean/);
});
