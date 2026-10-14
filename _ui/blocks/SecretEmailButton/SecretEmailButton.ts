import { escapeHtml } from "../../../lib/html.ts";
import { renderButton, type ButtonUtility } from "../Button/Button.ts";

export interface SecretEmailButtonOptions {
  label?: string;
  subject?: string;
  utilities?: ButtonUtility[];
}

export function renderSecretEmailButton({ label = "Send email", subject = "Business inquiry", utilities }: SecretEmailButtonOptions = {}): string {
  return `<secret-email-button subject="${escapeHtml(subject)}">
${renderButton({ label, utilities, className: "secret-email-button" })}
</secret-email-button>`;
}
