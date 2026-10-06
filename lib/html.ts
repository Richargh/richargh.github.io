import { escapeHtml } from "./asciidoc.ts";

export function unsafeAsciiDocHtml(convertedAsciiDocFragment: string): string {
  // Audited unsafe insertion point: callers may only pass HTML returned by
  // lib/asciidoc.ts after front matter has been removed. Metadata must continue
  // through escaped interpolation.
  return convertedAsciiDocFragment;
}

export { escapeHtml };
