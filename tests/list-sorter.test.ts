import { customCommands } from "#custom-commands";
import assert from "node:assert/strict";
import test from "node:test";
import { renderListSorter } from "../_ui/blocks/ListSorter/ListSorter.ts";
import { renderButton } from "../_ui/blocks/Button/Button.ts";

test("ListSorter renders its controls using the Button block", () => {
  const html = renderListSorter({ id: "test-sorter", childrenHtml: "<section>Item</section>", items: 'section[data-name="example"]' });
  assert.ok(html.includes(renderButton({ label: "Title", command: customCommands.sort, commandFor: "test-sorter", dataAttributes: { sort: "name", order: "asc" } })));
  assert.ok(html.includes(renderButton({ label: "Date", command: customCommands.sort, commandFor: "test-sorter", dataAttributes: { sort: "date", order: "asc" } })));
  assert.ok(html.includes('sort="name" order="asc"'));
  assert.ok(html.includes('items="section[data-name=&quot;example&quot;]"'));
  assert.ok(html.includes("<section>Item</section>"));
});
