import assert from "node:assert/strict";
import test from "node:test";
import { socialShareUrls } from "../lib/social-sharing.ts";

test("social compose links preserve Unicode, punctuation, and URL query parameters", () => {
  const url = "https://richargh.de/t/demo/conf/?a=1&b=two#slides";
  const text = 'Feedback: “Größe & Qualität?” #talk + 100%';
  const links = socialShareUrls(url, text);
  for (const link of [links.blueSky]) {
    assert.equal(new URL(link).searchParams.get("text"), `${text}\n${url}`);
  }
  assert.equal(new URL(links.linkedIn).searchParams.get("url"), url);
});
