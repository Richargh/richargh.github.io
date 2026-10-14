import { escapeHtml } from "../../../lib/html.ts";
import { buttonClassName, type ButtonUtility } from "../Button/Button.ts";

export interface CalloutLinkOptions {
  href: string;
  label: string;
  utilities?: ButtonUtility[];
  className?: string;
}

export function renderCalloutLink({ href, label, utilities = ["button-compact", "button-muted"], className = "" }: CalloutLinkOptions): string {
  return `<a class="${buttonClassName("callout-link", utilities, className)}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}
