import { escapeHtml } from "../../../lib/html.ts";
import { renderAutocompleteInput } from "../AutocompleteInput/AutocompleteInput.ts";
import { renderButton } from "../Button/Button.ts";

export const mastodonInstances = ["mastodon.social", "mastodon.online", "fosstodon.org", "hachyderm.io", "mas.to", "chaos.social"];

export function renderFederatedPostPicker({ id, text }: { id: string; text: string }): string {
  return `<federated-post-picker platform="mastodon">
<form target="_blank" rel="noopener noreferrer">
<p>Choose your Mastodon instance or type its domain. Your post will open in a new tab.</p>
${renderAutocompleteInput({ id: `${id}-instance`, name: "instance", label: "Mastodon instance", suggestions: mastodonInstances, placeholder: "mastodon.social", required: true })}
<input type="hidden" name="text" value="${escapeHtml(text)}">
<div class="button-group">
${renderButton({ label: "Create post", type: "submit" })}
</div>
</form>
</federated-post-picker>`;
}
