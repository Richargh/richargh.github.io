export interface StyleMeta<TArgs extends object> {
  title: string;
  render: (args: TArgs) => string;
  args: TArgs;
}

export interface StyleStory<TArgs extends object> {
  name?: string;
  args?: Partial<TArgs>;
}

export interface StyleVariant {
  id: string;
  name: string;
  html: string;
}

export interface StyleBlock {
  id: string;
  name: string;
  variants: StyleVariant[];
}

/** Converts a CSF-inspired module's default metadata and named stories into previews. */
export function styleBlock<TArgs extends object>(storyModule: { default: StyleMeta<TArgs> } & Record<string, unknown>): StyleBlock {
  const meta = storyModule.default;
  const name = meta.title.split("/").at(-1) ?? meta.title;
  const id = slug(name);
  const variants = Object.entries(storyModule)
    .filter(([exportName]) => exportName !== "default")
    .sort(([left], [right]) => left === "Default" ? -1 : right === "Default" ? 1 : left.localeCompare(right))
    .map(([exportName, exported]) => renderVariant(meta, exportName, exported, id));

  if (variants.length === 0) throw new Error(`${meta.title} must export at least one style variant`);
  return { id, name, variants };
}

function renderVariant<TArgs extends object>(meta: StyleMeta<TArgs>, exportName: string, exported: unknown, blockId: string): StyleVariant {
  if (exported == null || typeof exported !== "object" || Array.isArray(exported)) {
    throw new Error(`${meta.title}/${exportName} must export a story object`);
  }

  const story = exported as StyleStory<TArgs>;
  const args = { ...meta.args, ...story.args };
  return {
    id: `${blockId}-${slug(exportName)}`,
    name: story.name ?? humanize(exportName),
    html: meta.render(args),
  };
}

function humanize(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("_", " ");
}

function slug(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
