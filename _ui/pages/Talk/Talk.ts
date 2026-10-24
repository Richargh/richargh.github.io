import { renderButton } from "../../blocks/Button/Button.ts";
import { renderDialog } from "../../blocks/Dialog/Dialog.ts";
import { renderFederatedPostPicker } from "../../blocks/FederatedPostPicker/FederatedPostPicker.ts";
import { renderCalloutLink } from "../../blocks/CalloutLink/CalloutLink.ts";
import { renderExampleCard } from "../../blocks/ExampleCard/ExampleCard.ts";
import { renderSecretEmailButton } from "../../blocks/SecretEmailButton/SecretEmailButton.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import { renderTalkCard } from "../Talks/Talks.ts";
import { absoluteUrl, site } from "../../../lib/config.ts";
import { socialShareUrls } from "../../../lib/social-sharing.ts";
import { escapeHtml } from "../../../lib/html.ts";
import { talkAppearanceUrl, type Talk, type TalkAppearance } from "../../../lib/talks.ts";

export function renderTalkDocument(talk: Talk, appearance: TalkAppearance): string {
  const references = talk.references ?? [];
  const title = `${appearance.date} - ${appearance.conference}`;
  const feedbackUrl = appearance.feedbackUrl ?? talk.feedbackUrl;
  const url = absoluteUrl(talkAppearanceUrl(appearance));
  const postText = `Feedback on “${appearance.title}” at ${appearance.conference} (${appearance.date}):`;
  const shareUrls = socialShareUrls(url, postText);
  const pickerId = `post-picker-${talk.id}-${appearance.id}`;
  return renderLayout({
    title,
    urlPath: talkAppearanceUrl(appearance),
    description: `Slides, recordings and resources for ${talk.title} by ${site.name}.`,
    type: "website",
    backLink: { href: `/talks/#${talk.id}`, label: "Talks" },
    content: `<main>
<article data-source="${escapeHtml(talk.sourcePath)}">
<h1>${escapeHtml(title)}</h1>
<div class="content article-cards">
${renderTalkCard({ ...talk, appearances: [appearance] }, [], appearance.title, false)}
</div>
<section class="example-card-grid example-card-grid-pair space-before" aria-label="Feedback and coffee">
${renderExampleCard({
  title: "Give Feedback",
  description: "What worked for you? What could be better? I’d love to hear your thoughts.",
  ...(feedbackUrl ? { href: feedbackUrl, linkLabel: "Give Feedback" } : {
    actionsHtml: `<p>Give feedback via</p>
<div class="button-group">
${renderCalloutLink({ label: "BlueSky", href: shareUrls.blueSky, newTab: true })}
${renderButton({ label: "Mastodon", command: "show-modal", commandFor: pickerId })}
${renderCalloutLink({ label: "LinkedIn", href: shareUrls.linkedIn, newTab: true })}
${renderSecretEmailButton({ label: "E-Mail", subject: `Talk feedback: ${appearance.title} at ${appearance.conference} (${appearance.date})`, utilities: ["button-compact", "button-muted"] })}
</div>`,
  }),
})}
${renderExampleCard({
  title: "Grab a coffee",
  description: "Questions or ideas after the talk? Book a virtual coffee with me.",
  href: site.noObligationCoffeeUrl,
  linkLabel: "Grab a coffee",
})}
</section>
${references.length ? `<section aria-labelledby="references">
<h2 id="references">Additional links</h2>
<ul>
${references.map((reference) => `<li>${reference.comment ? `${escapeHtml(reference.comment)} ` : ""}<a href="${escapeHtml(reference.url)}">${escapeHtml(reference.label)}</a></li>`).join("\n")}
</ul>
</section>` : ""}
${!feedbackUrl ? renderDialog({ id: pickerId, title: "Post on Mastodon", contentHtml: renderFederatedPostPicker({ id: pickerId, text: `${postText}\n${url}` }) }) : ""}
</article>
</main>`,
  });
}
