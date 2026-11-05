export interface BentoOptions {
  /** Trusted HTML rendered by child blocks, not raw metadata. */
  media?: string[];
  supporting?: string[];
}

function renderSupporting(items: string[], maxColumns: number): string {
  const rowCount = Math.ceil(items.length / maxColumns);
  const rows: string[][] = [];
  let offset = 0;
  for (let row = 0; row < rowCount; row++) {
    const count = Math.ceil((items.length - offset) / (rowCount - row));
    rows.push(items.slice(offset, offset + count));
    offset += count;
  }
  // Proportional row heights give every supporting item the same area.
  return `<div class="bento-supporting" style="--bento-rows: ${rowCount}; grid-template-rows: ${rows.map((row) => `minmax(0, ${row.length}fr)`).join(" ")};">${rows.map((row) => `<div class="bento-row" style="grid-template-columns: repeat(${row.length}, minmax(0, 1fr));">${row.map((html) => `<div class="bento-supporting-item">${html}</div>`).join("\n")}</div>`).join("\n")}</div>`;
}

export function renderBento({ media = [], supporting = [] }: BentoOptions): string {
  if (media.length === 0 && supporting.length === 0) return "";
  const mixed = media.length > 0 && supporting.length > 0;
  const layout = media.length > 1 ? " bento-multiple-media" : mixed ? " bento-one-media" : "";
  const quadrant = media.length === 3 && supporting.length > 0;
  return `<div class="bento${layout}${quadrant ? " bento-three-media" : ""}">
${media.map((html) => `<div class="bento-media">${html}</div>`).join("\n")}
${supporting.length ? renderSupporting(supporting, quadrant ? 3 : mixed && media.length === 1 ? 2 : 4) : ""}
</div>`;
}
