import assert from "node:assert/strict";
import test from "node:test";
import { renderCalloutLink } from "../_ui/blocks/CalloutLink/CalloutLink.ts";
import { renderTalkCard, renderTalksDocument } from "../_ui/pages/Talks/Talks.ts";
import { renderTalkDocument } from "../_ui/pages/Talk/Talk.ts";
import { render } from "../routes/t/[talkId]/[appearanceId].server.ts";
import { buildRouteManifest } from "../lib/route-manifest.ts";
import { site } from "../lib/config.ts";
import { escapeHtml } from "../lib/html.ts";
import { loadTalks, parseTalks, talkAppearanceUrl } from "../lib/talks.ts";

const source = `- id: demo
  title: Demo <talk>
  abstract: A useful talk.
  codeUrl: https://example.com/code
  links:
    - label: Further reading
      url: https://example.com/read
  appearances:
    - id: new-conf
      conference: New conference
      date: 2026-01-01
      location: remote
      slideUrl: https://example.com/new-slides
    - id: old-conf
      title: Original talk
      conference: Old conference
      date: 2025-01-01
      location: remote
      slideUrl: https://example.com/old-slides
      videoUrl: https://example.com/video
      links:
        - label: Workshop
          url: https://example.com/workshop
`;

test("doorway renders only the selected appearance with no Resource self-link", () => {
  const talk = parseTalks(source)[0];
  const appearance = talk.appearances[1];
  const html = renderTalkDocument(talk, appearance);
  assert.ok(html.includes(renderTalkCard({ ...talk, appearances: [appearance] }, [], "Original talk", false)));
  assert.equal((html.match(/class="article-card"/g) ?? []).length, 1);
  assert.match(html, /<h1>2025-01-01 - Old conference<\/h1>/);
  assert.ok(html.includes(`<title>${escapeHtml(site.title)}</title>`));
  assert.match(html, /rel="canonical" href="https:\/\/richargh.de\/t\/demo\/old-conf\/"/);
  for (const url of ["old-slides", "video", "code", "read", "workshop"]) {
    assert.ok(html.includes(`href="https://example.com/${url}"`));
  }
  assert.doesNotMatch(html, /new-slides|New conference|>Resources<|Talk resources/);
  assert.match(html, /subject="Talk feedback: Original talk at Old conference \(2025-01-01\)"/);
  assert.match(html, /Search the Blog/);
});

test("listing links each appearance to its own doorway", () => {
  const talks = parseTalks(source);
  const html = renderTalksDocument(talks);
  for (const appearance of talks[0].appearances) assert.ok(html.includes(renderCalloutLink({ label: "Resources", href: talkAppearanceUrl(appearance) })));
  assert.equal((html.match(/>Resources</g) ?? []).length, 2);
  assert.doesNotMatch(html, /href="\/t\/demo\/"/);
});

test("feedback and coffee ExampleCards follow the card without empty references", () => {
  const talk = parseTalks(source)[0];
  const html = renderTalkDocument(talk, talk.appearances[0]);
  assert.equal((html.match(/class="example-card"/g) ?? []).length, 2);
  assert.match(html, /class="example-card-grid example-card-grid-pair space-before"/);
  assert.ok(html.indexOf('id="demo"') < html.indexOf("<h2>Give Feedback</h2>"));
  assert.ok(html.indexOf("<h2>Give Feedback</h2>") < html.indexOf("<h2>Grab a coffee</h2>"));
  assert.ok(html.includes(escapeHtml(site.noObligationCoffeeUrl)));
  assert.doesNotMatch(html, /id="references"/);
});

test("doorway goes back to Talks and provides contact feedback buttons in order", () => {
  const talk = parseTalks(source)[0];
  const html = renderTalkDocument(talk, talk.appearances[0]);
  assert.match(html, /id="scroll-head" href="\/talks\/#demo"/);
  assert.match(html, /<p class="back-p">Talks<\/p>/);
  const feedback = html.slice(html.indexOf('class="example-card-actions"'), html.indexOf("<h2>Grab a coffee</h2>"));
  assert.match(feedback, /Give feedback via/);
  assert.equal((feedback.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 2);
  assert.match(feedback, /class="button-group"/);
  assert.doesNotMatch(html, /talk-page|talk-feedback/);
  const contacts = ["BlueSky", "Mastodon", "LinkedIn", "E-Mail"];
  const positions = contacts.map((label) => feedback.indexOf(`>${label}<`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, positions.toSorted((a, b) => a - b));
  const links = [...feedback.matchAll(/href="([^"]+)"/g)].map((match) => new URL(match[1].replaceAll("&amp;", "&")));
  assert.equal(links[0].origin + links[0].pathname, "https://bsky.app/intent/compose");
  assert.equal(links[0].searchParams.get("text"), "Feedback on “Demo <talk>” at New conference (2026-01-01):\nhttps://richargh.de/t/demo/new-conf/");
  assert.equal(links[1].origin + links[1].pathname, "https://www.linkedin.com/sharing/share-offsite/");
  assert.equal(links[1].searchParams.get("url"), "https://richargh.de/t/demo/new-conf/");
  assert.match(feedback, /command="show-modal" commandfor="post-picker-demo-new-conf"/);
  assert.match(html, /<dialog[^>]+id="post-picker-demo-new-conf"[^>]+closedby="any"/);
  assert.match(html, /<datalist/);
  assert.match(html, /<option value="chaos.social">/);
  assert.match(html, /name="text" value="Feedback on/);
});

test("appearance feedback URL takes precedence over talk fallback and is validated", () => {
  const talk = parseTalks(source.replace("  abstract:", "  feedbackUrl: https://example.com/general-feedback\n  abstract:").replace("      conference: New", "      feedbackUrl: https://example.com/appearance-feedback\n      conference: New"))[0];
  const html = renderTalkDocument(talk, talk.appearances[0]);
  assert.match(html, /href="https:\/\/example.com\/appearance-feedback"/);
  assert.doesNotMatch(html, /general-feedback|<secret-email-button|<dialog|<federated-post-picker/);
  assert.match(renderTalkDocument(talk, talk.appearances[1]), /href="https:\/\/example.com\/general-feedback"/);
  assert.throws(() => parseTalks(source.replace("      conference: New", "      feedbackUrl: javascript:alert(1)\n      conference: New")), /absolute http\(s\) URL/);
});

test("talk references are annotated, escaped, validated, and below coffee", async () => {
  const talk = (await loadTalks()).find((talk) => talk.id === "bee-arc")!;
  assert.deepEqual(talk.references, [{ label: "systemsthinking.dev", url: "https://systemsthinking.dev", comment: "Systems Modelling Notation from" }]);
  const html = renderTalkDocument(talk, talk.appearances[0]);
  assert.ok(html.indexOf("<h2>Grab a coffee</h2>") < html.indexOf('id="references"'));
  assert.match(html, /Systems Modelling Notation from <a href="https:\/\/systemsthinking.dev">systemsthinking.dev<\/a>/);
  const withReference = (fields: string) => source.replace("  abstract:", `  references:\n    - ${fields}\n  abstract:`);
  assert.throws(() => parseTalks(withReference("label: Link\n      url: javascript:alert(1)")), /absolute http\(s\) URL/);
  assert.throws(() => parseTalks(withReference("label: Link\n      url: https://example.com\n      comment: 123")), /comment must be a non-empty string/);
  assert.throws(() => parseTalks(withReference("url: https://example.com")), /label is required/);
  const annotated = parseTalks(withReference('label: "<Link>"\n      url: https://example.com\n      comment: "<Comment>"'))[0];
  assert.match(renderTalkDocument(annotated, annotated.appearances[0]), /&lt;Comment&gt; <a href="https:\/\/example.com">&lt;Link&gt;<\/a>/);
});

test("appearance IDs are stable, unique within a talk, and URL-safe", () => {
  assert.throws(() => parseTalks(source.replace("id: old-conf", "id: new-conf")), /duplicate appearance id/);
  assert.throws(() => parseTalks(source.replace("id: old-conf", "id: ../bad")), /short lowercase ASCII id/);
  assert.equal(parseTalks(source.replace("    - id: new-conf\n      conference:", "    - conference:"))[0].appearances[0].id, "2026-01-01");
});

test("route resolves appearance IDs, rejects unknown IDs, and manifest covers each appearance", async () => {
  assert.match(await render("bee-arc", "2023-09-29"), /<h1>2023-09-29 - JUG Saxony Day<\/h1>/);
  await assert.rejects(render("unknown-talk", "2023-09-29"), /Unknown talk id/);
  await assert.rejects(render("bee-arc", "unknown-appearance"), /Unknown appearance id/);
  const talks = await loadTalks();
  const manifest = buildRouteManifest([], [], talks);
  for (const talk of talks) {
    assert.ok(!manifest.some((entry) => entry.urlPath === `/t/${talk.id}/`));
    for (const appearance of talk.appearances) {
      assert.ok(manifest.some((entry) => entry.urlPath === talkAppearanceUrl(appearance) && entry.outputKey === `t/${talk.id}/${appearance.id}/index.html`));
    }
  }
});
