import { convert } from "@asciidoctor/core";

export interface AsciiDocOptions {
  safeMode: "safe" | "server" | "secure";
  allowIncludesFrom: string[];
  attributes: {
    icons: boolean;
    sectlinks: boolean;
    sectanchors: boolean;
  };
}

export const defaultAsciiDocOptions: AsciiDocOptions = {
  safeMode: "safe",
  allowIncludesFrom: [],
  attributes: { icons: true, sectlinks: true, sectanchors: true },
};

export async function convertTaggedAsciiDocFragment(sourcePath: string, tag: string, options: AsciiDocOptions = defaultAsciiDocOptions): Promise<string> {
  const html = await convertAsciiDocFragment(`include::${sourcePath}[tag=${tag}]`, {
    ...options,
    allowIncludesFrom: [...options.allowIncludesFrom, sourcePath],
  });
  if (html.trim() === "") throw new Error(`${sourcePath} is missing required AsciiDoc tag: // tag::${tag}[]`);
  return html;
}

export async function convertAsciiDocFragment(source: string, options: AsciiDocOptions = defaultAsciiDocOptions): Promise<string> {
  if (options.safeMode !== "safe" && options.safeMode !== "secure") {
    throw new Error("AsciiDoc conversion must run in a constrained safe mode");
  }
  assertIncludesAreAllowed(source, options.allowIncludesFrom);

  const html = String(await convert(source, {
    backend: "html5",
    safe: options.safeMode,
    standalone: false,
    attributes: {
      icons: options.attributes.icons ? "font" : undefined,
      sectlinks: options.attributes.sectlinks,
      sectanchors: options.attributes.sectanchors,
      idprefix: "",
      idseparator: "-",
    },
  }));

  return normalizeCodeCalloutsForMicroLighter(normalizeTableColumnWidths(html));
}

function normalizeTableColumnWidths(html: string): string {
  // Asciidoctor 4 emits obsolete col width attributes; preserve sizing with CSS.
  return html.replaceAll(/<col width="(\d+(?:\.\d+)?%)"(\s*\/?)>/g, '<col style="width: $1;"$2>');
}

function normalizeCodeCalloutsForMicroLighter(html: string): string {
  return html.replaceAll(/<pre\b[^>]*><code\b[^>]*>[\s\S]*?<\/code><\/pre>/g, (block) =>
    block.replaceAll(
      /<i class="conum" data-value="(\d+)"><\/i><b>\(\1\)<\/b>/g,
      "($1)",
    ),
  );
}

function assertIncludesAreAllowed(source: string, allowIncludesFrom: string[]): void {
  const includeDirective = /^include::([^[]+)\[[^\]]*\]/m;
  const match = source.match(includeDirective);
  if (!match) return;

  const target = match[1].trim();
  if (allowIncludesFrom.some((allowedPrefix) => target.startsWith(allowedPrefix))) return;

  throw new Error("AsciiDoc include directives are disabled for this migration slice");
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
