import { site } from "../lib/config.ts";
import { escapeHtml } from "../lib/html.ts";

export function renderFooter(): string {
  return `<div id="copyright">
    <p id="copyright-notice">© ${escapeHtml(site.name)}
         - generated with <a href="https://mastrojs.github.io/">Mastro</a>
        and based on the <a href="https://github.com/raghuveerdotnet/simply-jekyll">Simply Jekyll Theme</a></p>
</div>`;
}
