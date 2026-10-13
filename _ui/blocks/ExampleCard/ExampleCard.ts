import { escapeHtml } from "../../../lib/html.ts";

export interface ExampleCardOptions {
  title?: string;
  description: string;
  language: string;
  code: string;
}

export function renderExampleCard(options: ExampleCardOptions): string {
  const title = options.title ?? "Example";
  const language = escapeHtml(options.language);

  return `<section class="example-card">
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(options.description)}</p>
    <pre class="highlight"><code class="language-${language}" data-lang="${language}">${escapeHtml(options.code)}</code></pre>
  </section>`;
}
