import assert from "node:assert/strict";
import test from "node:test";
import { renderDialog } from "../_ui/blocks/Dialog/Dialog.ts";
import { renderAutocompleteInput } from "../_ui/blocks/AutocompleteInput/AutocompleteInput.ts";
import { renderFederatedPostPicker, mastodonInstances } from "../_ui/blocks/FederatedPostPicker/FederatedPostPicker.ts";

const { mastodonInstanceOrigin } = await import(new URL("../_ui/blocks/FederatedPostPicker/FederatedPostUrl.mjs", import.meta.url).href);

test("generic dialog uses native light dismiss and invoker commands", () => {
  const html = renderDialog({ id: "example", title: "Choose <something>", contentHtml: "<p>Any content</p>" });
  assert.match(html, /closedby="any"/);
  assert.match(html, /aria-labelledby="example-title"/);
  assert.match(html, /Choose &lt;something&gt;/);
  assert.match(html, /command="close" commandfor="example"/);
  assert.match(html, /<p>Any content<\/p>/);
});

test("autocomplete provides a labeled free-text input and escaped suggestions", () => {
  const html = renderAutocompleteInput({ id: "choice", name: "choice", label: "Choose", suggestions: ['a"b', "example.org"], required: true });
  assert.match(html, /label for="choice"/);
  assert.match(html, /type="text" list="choice-suggestions"[^>]* required/);
  assert.match(html, /value="a&quot;b"/);
});

test("picker includes popular instances and escapes post text", () => {
  const html = renderFederatedPostPicker({ id: "picker", text: '<Feedback> & "link"' });
  assert.ok(mastodonInstances.includes("chaos.social"));
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /name="text" value="&lt;Feedback&gt; &amp; &quot;link&quot;"/);
});

test("instance domains normalize to HTTPS and reject unsafe or non-domain input", () => {
  assert.equal(mastodonInstanceOrigin(" chaos.social "), "https://chaos.social");
  assert.equal(mastodonInstanceOrigin("https://MASTODON.SOCIAL/"), "https://mastodon.social");
  assert.equal(mastodonInstanceOrigin("my.custom-instance.example"), "https://my.custom-instance.example");
  for (const value of ["", "localhost", "http://mas.to", "javascript:alert(1)", "https://user:password@mas.to", "mas.to/@user", "mas.to?query=x", "mas.to/#fragment", "mas.to:9999", "bad host.example", "-bad.example"]) {
    assert.throws(() => mastodonInstanceOrigin(value), value);
  }
});
