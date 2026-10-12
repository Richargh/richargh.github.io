import { escapeHtml } from "../../../lib/html.ts";

export interface NavItemOptions {
  className: string;
  href: string;
  label: string;
  iconHtml: string;
  labelClassName: string;
  counter?: number;
}

export function renderNavItem({ className, href, label, iconHtml, labelClassName, counter }: NavItemOptions): string {
  return `<div class="${escapeHtml(className)} nav-item">
            <a class="nav-item-link" href="${escapeHtml(href)}">
                ${iconHtml}
                ${renderCounter(counter)}
                <p class="${escapeHtml(labelClassName)}">${escapeHtml(label)}</p>
            </a>
        </div>`;
}

function renderCounter(value: number | undefined): string {
  if (value === undefined) return "";
  return `<span class="app-counter">${escapeHtml(value.toLocaleString("en"))}</span>`;
}
