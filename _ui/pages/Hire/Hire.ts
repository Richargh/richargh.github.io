import { renderCalloutLink } from "../../blocks/CalloutLink/CalloutLink.ts";
import { renderSecretEmailButton } from "../../blocks/SecretEmailButton/SecretEmailButton.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import { site } from "../../../lib/config.ts";
import type { Page } from "../../../lib/content.ts";
import { escapeHtml, unsafeAsciiDocHtml } from "../../../lib/html.ts";

export function renderHirePageDocument(page: Page): string {
  const contentHtml = unsafeAsciiDocHtml(page.html)
    .replace(
      "book a slot",
      `<a href="${escapeHtml(site.noObligationCoffeeUrl)}">book a slot</a>`,
    )
    .replace(
      "<p>Of course, you are also very welcome to send me an email.</p>",
      `<p>Of course, you are also very welcome to ${renderSecretEmailButton({ label: "Send me an E-Mail", subject: "Business inquiry", utilities: ["button-compact", "button-primary"] })}</p>`,
    );

  return renderLayout({
    title: page.title,
    urlPath: page.urlPath,
    description: page.excerpt,
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article class="hire-page" data-source="${escapeHtml(page.sourcePath)}">
                  <h1>${escapeHtml(page.title)}</h1>
                  <div class="content">
                    ${contentHtml}
                    ${renderTrackRecordLinks()}
                  </div>
                </article>
            </main>`,
  });
}

function renderTrackRecordLinks(): string {
  return `<section class="hire-track-record" aria-labelledby="hire-track-record-title">
<h2 id="hire-track-record-title">Track record</h2>
<p>Browse examples and public material from past architecture, modernisation and delivery work.</p>
<div class="hire-track-record-actions">
${renderCalloutLink({ href: "/success-stories/", label: "Read customer success stories", utilities: ["button-compact", "button-muted"] })}
${renderCalloutLink({ href: "/talks/", label: "Watch talks", utilities: ["button-compact", "button-muted"] })}
${renderCalloutLink({ href: "/articles/", label: "Read articles", utilities: ["button-compact", "button-muted"] })}
${renderCalloutLink({ href: "/interviews/", label: "Hear interviews", utilities: ["button-compact", "button-muted"] })}
</div>
</section>`;
}
