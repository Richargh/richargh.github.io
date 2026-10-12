import assert from "node:assert/strict";
import test from "node:test";
import { loadInterviews, parseInterviews } from "../lib/interviews.ts";

test("loads interviews with visible show names", async () => {
  const interviews = await loadInterviews();

  assert.equal(interviews.length, 4);
  assert.ok(interviews.some((item) => item.show === ".NET Rocks!" && item.episode === "1927" && item.tags.includes("software-quality") && item.title === "Grasping Code Quality with Richard Gross" && item.thumbnail === "/assets/img/thumbnails/interview-dotnet-rocks.jpg"));
  assert.ok(interviews.some((item) => item.id === "swaist-cc" && item.episode === "248" && item.show === "Software Architektur im Stream" && item.type === "stream" && item.thumbnail === "/assets/img/thumbnails/ccstream-2025-01-24-rDHtNNBoP6Y.jpg"));
});

test("validates interviews", () => {
  assert.throws(() => parseInterviews("- id: x1\n  title: Episode\n"), /show is required/);
  assert.throws(() => parseInterviews("- id: x1\n  show: Show\n  title: Episode\n  type: audio\n  date: 2025-01-01\n  url: https://example.com\n"), /podcast, stream, video, interview/);
  assert.throws(() => parseInterviews("- id: x1\n  show: Show\n  title: Episode\n  type: podcast\n  date: 2025-01-01\n  url: /relative\n"), /absolute http\(s\) URL/);
});
