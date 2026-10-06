import { readFileSync } from "node:fs";
import { site } from "../lib/config.ts";

const headerTemplate = readFileSync("_includes/header.html", "utf8");
const mainHeaderTemplate = extractMainHeader(headerTemplate);

export function renderHeader({ showBackToHome = false } = {}): string {
  const withoutLiquidBackBlock = mainHeaderTemplate.replace(
    /\{%- if page\.permalink != "\/" -%\}[\s\S]*?\{%- endif -%\}/,
    showBackToHome ? renderBackToHome() : "",
  );

  return withoutLiquidBackBlock
    .replaceAll("{{site.title}}", site.title)
    .replaceAll("{{site.name}}", site.name)
    .replaceAll("{{site.user_description}}", site.userDescription)
    .replaceAll("{{ site.url }}", site.url)
    .replaceAll("{{site.url}}", site.url)
    .replaceAll("{{site.profile_pic | relative_url}}", site.profilePic)
    .replaceAll("{{site.favicon | relative_url}}", site.favicon)
    .replaceAll("{{ '/assets/js/simple-jekyll-search.min.js' | relative_url }}", "/assets/js/simple-jekyll-search.min.js");
}

function extractMainHeader(template: string): string {
  const startMarker = "{%- else -%}";
  const start = template.lastIndexOf(startMarker);
  if (start === -1) throw new Error("Could not find main header branch in _includes/header.html");
  const end = template.lastIndexOf("{%- endif -%}");
  if (end === -1 || end <= start) throw new Error("Could not find end of main header branch in _includes/header.html");
  return template.slice(start + startMarker.length, end).trim();
}

function renderBackToHome(): string {
  return `<div class="main-site-subheader disable-select" id="scroll-head" onclick="window.location.assign('/');">
        <div class="back-icon">
            <svg class="ripple" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/>
            </svg>
        </div>
        <p class="back-p">Home</p>
    </div>`;
}
