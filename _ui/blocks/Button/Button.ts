import { escapeHtml } from "../../../lib/html.ts";

export type ButtonUtility =
  | "button-compact"
  | "button-control"
  | "button-muted"
  | "button-primary"
  | "button-cross-link"
  | "button-video";

export interface ButtonOptions {
  label: string;
  type?: "button" | "submit" | "reset";
  utilities?: ButtonUtility[];
  className?: string;
}

export function renderButton({ label, type = "button", utilities = ["button-compact", "button-muted"], className = "" }: ButtonOptions): string {
  return `<button class="${buttonClassName("button", utilities, className)}" type="${escapeHtml(type)}">${escapeHtml(label)}</button>`;
}

export function buttonClassName(blockClassName: string, utilities: ButtonUtility[], className: string): string {
  return [blockClassName, ...utilities, className].filter(Boolean).join(" ");
}
