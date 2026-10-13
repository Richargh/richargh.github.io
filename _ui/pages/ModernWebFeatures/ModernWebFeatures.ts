import { renderExampleCard } from "../../blocks/ExampleCard/ExampleCard.ts";
import { renderLayout } from "../../layouts/SiteLayout/SiteLayout.ts";
import { escapeHtml } from "../../../lib/html.ts";
import { loadModernWebFeatures, type ModernWebFeature, type ModernWebFeatureExample } from "../../../lib/modern-web-features.ts";

export const modernWebFeaturesTitle = "Made with modern web features";
export const modernWebFeaturesUrlPath = "/modern-web-features/";
export const modernWebFeaturesDescription = "This site intentionally uses a few modern web platform features instead of framework-specific replacements.";

export function renderModernWebFeaturesPageDocument(): string {
  const features = loadModernWebFeatures();

  return renderLayout({
    title: modernWebFeaturesTitle,
    urlPath: modernWebFeaturesUrlPath,
    description: modernWebFeaturesDescription,
    type: "website",
    showBackToHome: true,
    content: `<main>
                <article data-source="_data/modern-web-features.yaml">
                  <h1>${escapeHtml(modernWebFeaturesTitle)}</h1>
                  <div class="content">
                    <p>${escapeHtml(modernWebFeaturesDescription)}</p>
                    <p>Baseline dates summarize when the feature became available across the major browser engines according to the <a href="https://web-platform-dx.github.io/web-features/">Web Platform DX Web Features</a> data and MDN Baseline summaries.</p>
                    ${renderFeatureList(features)}
                  </div>
                </article>
            </main>`,
  });
}

function renderFeatureList(features: ModernWebFeature[]): string {
  return `<dl class="modern-web-features">
${features.map(renderFeature).join("\n")}
</dl>`;
}

function renderFeature(feature: ModernWebFeature): string {
  const fallbackCategory = fallbackCategoryDetails(feature.fallback.category);
  const fallbackNotes = feature.fallback.url ? ` <a href="${escapeHtml(feature.fallback.url)}">See also</a>.` : "";

  return `  <dt><a href="${escapeHtml(feature.url)}">${escapeHtml(feature.name)}</a></dt>
  <dd>
    <p class="modern-web-feature-baseline"><strong>Baseline since:</strong> <time datetime="${escapeHtml(feature.baselineSince)}">${escapeHtml(feature.baselineSince)}</time></p>
    <p class="modern-web-feature-fallback"><strong>Fallback:</strong> <a href="${escapeHtml(fallbackCategory.url)}">${escapeHtml(fallbackCategory.label)}</a> — ${escapeHtml(feature.fallback.explanation)}${fallbackNotes}</p>
    <div class="modern-web-feature-examples">
      ${feature.examples.map(renderExample).join("\n      ")}
    </div>
  </dd>`;
}

function fallbackCategoryDetails(category: string): { label: string; url: string } {
  const details: Record<string, { label: string; url: string }> = {
    "progressive-enhancement": {
      label: "Progressive enhancement",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement",
    },
    "graceful-degradation": {
      label: "Graceful degradation",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation",
    },
    polyfillable: {
      label: "Polyfillable",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Polyfill",
    },
    "build-time-transform": {
      label: "Build-time transform",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Compile",
    },
    "author-provided": {
      label: "Author-provided",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection",
    },
    "hard-dependency": {
      label: "Hard dependency",
      url: "https://web-platform-dx.github.io/baseline/",
    },
  };

  const detail = details[category];
  if (detail === undefined) throw new Error(`Unknown fallback category: ${category}`);
  return detail;
}

function renderExample(example: ModernWebFeatureExample): string {
  return renderExampleCard({
    description: example.description,
    language: example.language,
    code: example.code,
  });
}
