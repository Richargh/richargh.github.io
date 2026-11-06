import { customCommands } from "#custom-commands";

export class ListSorterElement extends HTMLElement {
  #key = "name";
  #order = "asc";
  #control = null;
  #buttons = new Map();

  connectedCallback() {
    if (this.#control) return;

    const control = this.querySelector(":scope > .list-sorter-control");
    if (!control) return;
    this.#control = control;
    this.#key = this.getAttribute("sort") === "date" ? "date" : "name";
    this.#order = this.getAttribute("order") === "desc" ? "desc" : "asc";
    for (const [field, title] of [["name", "Title"], ["date", "Date"]]) {
      const button = control.querySelector(`[command="${customCommands.sort}"][data-sort="${field}"]`);
      if (button) this.#buttons.set(field, { button, title });
    }
    this.addEventListener("command", (event) => this.#handleCommand(event));
    this.#sort();
    control.hidden = false;
  }

  #handleCommand(event) {
    if (event.target !== this || event.command !== customCommands.sort) return;
    const { sort: field, order: direction } = event.source?.dataset ?? {};
    if (field !== "name" && field !== "date") return;
    if (direction !== "asc" && direction !== "desc") return;

    this.#key = field;
    this.#order = direction;
    this.#sort();
  }

  #updateControls() {
    for (const [field, { button, title }] of this.#buttons) {
      const active = this.#key === field;
      const ascending = this.#order === "asc";

      button.dataset.order = active ? (ascending ? "desc" : "asc") : this.#order;
      button.classList.toggle("button-cross-link", active);
      button.classList.toggle("button-muted", !active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? `${title}, ${ascending ? "ascending" : "descending"}` : title);
      button.title = active ? `Sort ${ascending ? "descending" : "ascending"}` : `Sort by ${title.toLowerCase()}`;
      button.textContent = active ? `${title} ${ascending ? "↑ Asc" : "↓ Desc"}` : `${title} ↕`;
    }
  }

  #sort() {
    this.#updateControls();
    const direction = this.#order === "desc" ? -1 : 1;
    const dataKey = this.#key === "date" ? `date-${this.#order === "asc" ? "first" : "last"}` : this.#key;
    const elementSelector = this.getAttribute(`${dataKey}-selector`) ?? this.getAttribute(`${this.#key}-selector`);
    const valueSelector = (item) => elementValue(item, dataKey, elementSelector, this.#key);
    const compare = comparator(valueSelector, direction);
    for (const [parent, siblings] of this.#itemGroups()) {
      reorderElements(parent, siblings, siblings.toSorted(compare));
    }
  }

  #itemGroups() {
    const selector = this.getAttribute("items");
    const items = selector ? [...this.querySelectorAll(selector)] : [...this.children];
    const groups = new Map();
    for (const item of items) {
      if (item === this.#control || this.#control.contains(item)) continue;
      const parent = item.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(item);
    }
    return groups;
  }
}

function comparator(valueSelector, direction) {
  return (left, right) => direction * valueSelector(left).localeCompare(valueSelector(right));
}

function reorderElements(parent, original, sorted) {
  const slots = original.map((item) => {
    const slot = document.createComment("sort slot");
    parent.replaceChild(slot, item);
    return slot;
  });
  slots.forEach((slot, index) => parent.replaceChild(sorted[index], slot));
}

function elementValue(item, key, elementSelector, fallbackKey = key) {
  const element = elementSelector ? item.querySelector(elementSelector) : item;
  return (element?.getAttribute(`data-${key}`)
    ?? element?.getAttribute(`data-${fallbackKey}`) ?? element?.textContent ?? "").trim();
}

customElements.define("list-sorter", ListSorterElement);
