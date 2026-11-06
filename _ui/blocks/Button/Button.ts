import type { CustomCommand } from "#custom-commands";
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
  command?: "show-modal" | "close" | CustomCommand;
  commandFor?: string;
  dataAttributes?: Record<string, string>;
}

export function renderButton({ label, type = "button", utilities = ["button-compact", "button-muted"], className = "", command, commandFor, dataAttributes = {} }: ButtonOptions): string {
  const attributes = Object.entries(dataAttributes)
    .map(([key, value]) => ` data-${escapeHtml(key)}="${escapeHtml(value)}"`).join("");
  return `<button class="${buttonClassName("button", utilities, className)}" type="${escapeHtml(type)}"${command ? ` command="${escapeHtml(command)}"` : ""}${commandFor ? ` commandfor="${escapeHtml(commandFor)}"` : ""}${attributes}>${escapeHtml(label)}</button>`;
}

export function buttonClassName(blockClassName: string, utilities: ButtonUtility[], className: string): string {
  return [blockClassName, ...utilities, className].filter(Boolean).join(" ");
}
