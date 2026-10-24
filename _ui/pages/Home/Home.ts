import {renderCalloutLink} from "../../blocks/CalloutLink/CalloutLink.ts";
import {renderSummaryStats} from "../../blocks/CollectionStats/CollectionStats.ts";
import {renderSecretEmailButton} from "../../blocks/SecretEmailButton/SecretEmailButton.ts";
import {renderExampleCard} from "../../blocks/ExampleCard/ExampleCard.ts";
import {renderUpcomingCollection} from "../../blocks/UpcomingCollection/UpcomingCollection.ts";
import {renderLayout} from "../../layouts/SiteLayout/SiteLayout.ts";
import type {Article} from "../../../lib/articles.ts";
import {convertTaggedAsciiDocFragment} from "../../../lib/asciidoc.ts";
import { site } from "../../../lib/config.ts";
import type {Page} from "../../../lib/content.ts";
import {escapeHtml, unsafeAsciiDocHtml} from "../../../lib/html.ts";
import type {InterviewAppearance} from "../../../lib/interviews.ts";
import type {Talk} from "../../../lib/talks.ts";

export interface HomePageData {
  page: Page;
  talks: Talk[];
  articles: Article[];
  interviews: InterviewAppearance[];
}

export function renderHomePageDocument({ page, talks, articles, interviews }: HomePageData): string {
  const blurbHtml = convertTaggedAsciiDocFragment(page.sourcePath, "blurb");
  const languagesHtml = convertTaggedAsciiDocFragment(page.sourcePath, "languages");

  return renderLayout({
    title: page.title,
    urlPath: "/",
    description: page.excerpt,
    type: "website",
    content: `<main>
                <article class="home-page" data-source="${escapeHtml(page.sourcePath)}">
                  <section class="home-hero">
                    <h1>${escapeHtml(page.title)}</h1>
                    <div class="home-about-intro content">
                      ${unsafeAsciiDocHtml(blurbHtml)}
                    </div>
                    <div class="home-actions" role="group" aria-label="Start here">
                      ${renderSecretEmailButton({ label: "Contact me", subject: "Business inquiry", utilities: ["button-compact", "button-primary"] })}
                      ${renderCalloutLink({ href: site.noObligationCoffeeUrl, label: "Intro coffee", utilities: ["button-compact", "button-cross-link"] })}
                      ${renderCalloutLink({ href: "/success-stories/", label: "See outcomes", utilities: ["button-compact", "button-muted"] })}
                      ${renderCalloutLink({ href: "/talks/", label: "Watch talks", utilities: ["button-compact", "button-muted"] })}
                    </div>
                  </section>
                  ${renderServiceCards()}
                  <section class="home-languages" aria-labelledby="home-languages-title">
                    <h2 id="home-languages-title">Languages</h2>
                    <div class="content">
                      ${unsafeAsciiDocHtml(languagesHtml)}
                    </div>
                  </section>
                  <section class="home-collections" aria-labelledby="home-collections-title">
                    <div>
                      <h2 id="home-collections-title">Track record</h2>
                      ${renderCalloutLink({ href: "/success-stories/", label: "Read customer success stories", utilities: ["button-compact", "button-muted"] })}
                    </div>
                    ${renderSummaryStats({ talks, articles, interviews })}
                  </section>
                  ${renderUpcomingCollection({ talks, articles, interviews })}
                </article>
            </main>`,
  });
}

function renderServiceCards(): string {
  const services = [
    {
      title: "Software Health Check",
      href: "/hire/#software-health-check",
      text: "Assess your software system, uncover risks and identify the next safe improvements.",
      linkLabel: "Check software health",
    },
    {
      title: "Modernisation",
      href: "/hire/#modernisation",
      text: "Slice risky transformations into options that can pay back early and continuously.",
      linkLabel: "Plan the next slice",
    },
    {
      title: "AI safety",
      href: "/hire/#ai-safety",
      text: "Secure coding agents and AI-assisted delivery with working sandboxes and guardrails.",
      linkLabel: "Secure coding agents",
    },
  ];

  return `<section class="home-services example-card-grid" aria-label="Services">
${services.map(({ title, href, text, linkLabel }) => renderExampleCard({ title, description: text, href, linkLabel })).join("\n")}
</section>`;
}

