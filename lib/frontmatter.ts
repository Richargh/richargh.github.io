import { parse } from "@std/yaml";

export type FrontMatter = Record<string, unknown>;

export interface FrontMatterDocument {
  attributes: FrontMatter;
  body: string;
}

export class FrontMatterError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "FrontMatterError";
  }
}

export function splitFrontMatter(source: string): FrontMatterDocument {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    return { attributes: {}, body: source };
  }

  const newline = source.startsWith("---\r\n") ? "\r\n" : "\n";
  const endMarker = `${newline}---${newline}`;
  const end = source.indexOf(endMarker, 3);
  if (end === -1) {
    throw new FrontMatterError("YAML front matter starts with --- but has no closing --- marker");
  }

  const yaml = source.slice(3 + newline.length, end);
  const body = source.slice(end + endMarker.length);
  return { attributes: parseFrontMatterYaml(yaml), body };
}

export function parseFrontMatterYaml(yaml: string): FrontMatter {
  try {
    const parsed = parse(yaml, { schema: "json" });

    if (parsed == null) return {};
    if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed as FrontMatter;

    throw new FrontMatterError("YAML front matter must be a mapping/object");
  } catch (error) {
    if (error instanceof FrontMatterError) throw error;
    throw new FrontMatterError(`Malformed YAML front matter: ${error}`, error);
  }
}
