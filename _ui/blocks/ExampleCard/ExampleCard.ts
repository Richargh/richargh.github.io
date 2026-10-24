import { escapeHtml } from "../../../lib/html.ts";

export interface ExampleCardMetaItem {
  label: string;
  value: string;
}

export interface ExampleCardOptions {
  title?: string;
  description: string;
  language?: string;
  code?: string;
  href?: string;
  linkLabel?: string;
  actionsHtml?: string;
  meta?: ExampleCardMetaItem[];
  tags?: string[];
}

export function renderExampleCard(options: ExampleCardOptions): string {
  const title = options.title ?? "Example";
  const metaHtml = options.meta && options.meta.length > 0 ? renderMeta(options.meta) : "";
  const tagsHtml = options.tags && options.tags.length > 0 ? renderTags(options.tags) : "";
  const codeHtml = options.code && options.language ? renderCode(options.language, options.code) : "";
  const linkHtml = options.href && options.linkLabel ? `<a class="example-card-link" href="${escapeHtml(options.href)}">${escapeHtml(options.linkLabel)}</a>` : "";

  return `<section class="example-card">
    <h2>${escapeHtml(title)}</h2>
    ${metaHtml}
    <p>${escapeHtml(options.description)}</p>
    ${tagsHtml}
    ${codeHtml}
    ${linkHtml}
    ${options.actionsHtml ? `<div class="example-card-actions">${options.actionsHtml}</div>` : ""}
  </section>`;
}

function renderMeta(items: ExampleCardMetaItem[]): string {
  return `<dl class="example-card-meta">
${items.map((item) => `      <div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("\n")}
    </dl>`;
}

function renderTags(tags: string[]): string {
  return `<ul class="example-card-tags">
${tags.map((tag) => `      <li>${escapeHtml(tag)}</li>`).join("\n")}
    </ul>`;
}

function renderCode(languageValue: string, code: string): string {
  const language = escapeHtml(languageValue);
  return `<pre class="highlight"><code class="language-${language}" data-lang="${language}">${escapeHtml(code)}</code></pre>`;
}
