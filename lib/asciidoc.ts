import asciidoctorFactory from "asciidoctor";

const asciidoctor = asciidoctorFactory();

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

export function convertAsciiDocFragment(source: string, options: AsciiDocOptions = defaultAsciiDocOptions): string {
  if (options.safeMode !== "safe" && options.safeMode !== "secure") {
    throw new Error("AsciiDoc conversion must run in a constrained safe mode");
  }
  assertIncludesAreAllowed(source, options.allowIncludesFrom);

  return String(asciidoctor.convert(source, {
    backend: "html5",
    safe: options.safeMode,
    standalone: false,
    attributes: {
      icons: options.attributes.icons ? "font" : undefined,
      sectlinks: options.attributes.sectlinks,
      sectanchors: options.attributes.sectanchors,
    },
  }));
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
