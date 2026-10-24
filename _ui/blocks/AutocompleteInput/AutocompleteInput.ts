import { escapeHtml } from "../../../lib/html.ts";

export interface AutocompleteInputOptions {
  id: string;
  name: string;
  label: string;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
}

export function renderAutocompleteInput({ id, name, label, suggestions, placeholder = "", required = false }: AutocompleteInputOptions): string {
  return `<div class="autocomplete-input">
<label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
<input id="${escapeHtml(id)}" name="${escapeHtml(name)}" type="text" list="${escapeHtml(id)}-suggestions" placeholder="${escapeHtml(placeholder)}"${required ? " required" : ""}>
<datalist id="${escapeHtml(id)}-suggestions">
${suggestions.map((value) => `<option value="${escapeHtml(value)}"></option>`).join("\n")}
</datalist>
</div>`;
}
