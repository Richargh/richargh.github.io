import assert from "node:assert/strict";
import test from "node:test";
import { loadInterviews, parseInterviews } from "../lib/interviews.ts";

test("loads interviews with visible show names", async () => {
  const interviews = await loadInterviews();

  for (const interview of interviews) {
    assert.ok(interview.title.trim());
    assert.ok(interview.show.trim());
    assert.match(interview.url, /^https?:\/\//);
  }
});

test("validates interviews", () => {
  assert.throws(() => parseInterviews("- id: x1\n  title: Episode\n"), /show is required/);
  assert.throws(() => parseInterviews("- id: x1\n  show: Show\n  title: Episode\n  type: audio\n  date: 2025-01-01\n  url: https://example.com\n"), /podcast, stream, video, interview/);
  assert.throws(() => parseInterviews("- id: x1\n  show: Show\n  title: Episode\n  type: podcast\n  date: 2025-01-01\n  url: /relative\n"), /absolute http\(s\) URL/);
});
