import { escapeHtml } from "../../../lib/html.ts";
import { renderButton } from "../Button/Button.ts";

export function renderDialog({ id, title, contentHtml }: { id: string; title: string; contentHtml: string }): string {
  return `<light-dismiss-dialog>
<dialog class="dialog" id="${escapeHtml(id)}" aria-labelledby="${escapeHtml(id)}-title" closedby="any">
<h2 id="${escapeHtml(id)}-title">${escapeHtml(title)}</h2>
${contentHtml}
${renderButton({ label: "Cancel", command: "close", commandFor: id })}
</dialog>
</light-dismiss-dialog>`;
}
