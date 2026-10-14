import { renderExampleCard } from "../../blocks/ExampleCard/ExampleCard.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import { escapeHtml } from "../../../lib/html.ts";
import type { SuccessStory } from "../../../lib/success-stories.ts";

export const successStoriesTitle = "Success stories";
export const successStoriesUrlPath = "/success-stories/";
export const successStoriesDescription = "Anonymized customer success stories from consulting, modernisation, and delivery work.";

export function renderSuccessStoriesPageDocument(stories: SuccessStory[]): string {
  return renderLayout({
    title: successStoriesTitle,
    urlPath: successStoriesUrlPath,
    description: successStoriesDescription,
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article class="success-stories-page" data-source="_data/success-stories.yaml">
                  <h1>${escapeHtml(successStoriesTitle)}</h1>
                  <div class="content">
                    <p>${escapeHtml(successStoriesDescription)}</p>
                    <randomize-elements class="success-stories-list">
                      ${stories.map(renderSuccessStory).join("\n")}
                    </randomize-elements>
                  </div>
                </article>
            </main>`,
  });
}

function renderSuccessStory(story: SuccessStory): string {
  return `<div id="${escapeHtml(story.id)}">
${renderExampleCard({
  title: story.title,
  description: withoutTrailingPeriod(story.accomplished),
  meta: [
    { label: "Assignment", value: assignmentKindLabel(story.assignmentKind) },
    { label: "Industry", value: story.industry },
    { label: "My roles", value: story.roles.join(", ") },
    { label: "Codebase", value: story.codebaseSize },
    { label: "Team", value: story.teamSize },
  ],
  tags: [...story.keyMethods, ...story.keyArchitecture, ...story.keyTechnologies],
})}
</div>`;
}

function assignmentKindLabel(kind: SuccessStory["assignmentKind"]): string {
  const labels: Record<SuccessStory["assignmentKind"], string> = {
    modernization: "Modernization",
    modernisation: "Modernisation",
    "health-check": "Health check",
    "sw-health-check": "Software health check",
    "sw-due-diligence": "Software due diligence",
    "green-field": "Green-field development",
    development: "Development",
  };
  return labels[kind];
}

function withoutTrailingPeriod(value: string): string {
  return value.replace(/\.$/, "");
}
