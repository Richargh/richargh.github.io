import { customCommands } from "#custom-commands";
import { renderButton } from "../Button/Button.ts";
import { escapeHtml } from "../../../lib/html.ts";

export interface ListSorterOptions {
  id: string;
  childrenHtml: string;
  sort?: "name" | "date";
  order?: "asc" | "desc";
  items?: string;
  nameSelector?: string;
  dateSelector?: string;
  dateFirstSelector?: string;
  dateLastSelector?: string;
}

export function renderListSorter({ id, childrenHtml, sort = "name", order = "asc", items, nameSelector, dateSelector, dateFirstSelector, dateLastSelector }: ListSorterOptions): string {
  const selectors = Object.entries({ items, "name-selector": nameSelector, "date-selector": dateSelector, "date-first-selector": dateFirstSelector, "date-last-selector": dateLastSelector })
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ` ${key}="${escapeHtml(value!)}"`).join("");
  return `<list-sorter id="${escapeHtml(id)}" sort="${sort}" order="${order}"${selectors}>
<div class="list-sorter-control" role="group" aria-label="Sort by" hidden>
<span class="list-sorter-caption">Sort by</span>
${renderButton({ label: "Title", command: customCommands.sort, commandFor: id, dataAttributes: { sort: "name", order } })}
${renderButton({ label: "Date", command: customCommands.sort, commandFor: id, dataAttributes: { sort: "date", order } })}
</div>
${childrenHtml}
</list-sorter>`;
}
