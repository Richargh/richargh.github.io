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
  command?: "show-modal" | "close";
  commandFor?: string;
}

export function renderButton({ label, type = "button", utilities = ["button-compact", "button-muted"], className = "", command, commandFor }: ButtonOptions): string {
  return `<button class="${buttonClassName("button", utilities, className)}" type="${escapeHtml(type)}"${command ? ` command="${escapeHtml(command)}"` : ""}${commandFor ? ` commandfor="${escapeHtml(commandFor)}"` : ""}>${escapeHtml(label)}</button>`;
}

export function buttonClassName(blockClassName: string, utilities: ButtonUtility[], className: string): string {
  return [blockClassName, ...utilities, className].filter(Boolean).join(" ");
}
