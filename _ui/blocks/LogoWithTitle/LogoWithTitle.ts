import { escapeHtml } from "../../../lib/html.ts";
import { renderAssetImage } from "../AssetImage/AssetImage.ts";

export interface LogoWithTitleOptions {
  src?: string;
  alt: string;
  title?: string;
  fallback?: string;
  href?: string;
  label?: string;
  tags?: string[];
  compact?: boolean;
}

export function renderLogoWithTitle({ src, alt, title, fallback = alt, href, label, tags = [], compact = false }: LogoWithTitleOptions): string {
  const content = `${src ? renderAssetImage({ src, alt, className: "logo-with-title-image", lazy: true }) : `<span class="logo-with-title-fallback">${escapeHtml(fallback)}</span>`}
${title ? `<span class="logo-with-title-caption">${escapeHtml(title)}</span>` : ""}
${tags.length ? `<div class="logo-with-title-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}`;
  const className = `logo-with-title${tags.length ? " logo-with-title-tagged" : ""}${compact ? " logo-with-title-compact" : ""}`;
  if (href) return `<a class="${className}" href="${escapeHtml(href)}" aria-label="${escapeHtml(label ?? alt)}">${content}</a>`;
  return `<div class="${className}">${content}</div>`;
}
