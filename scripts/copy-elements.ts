import { cp, mkdir, readdir } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

export async function discoverElementModules(sourceDir = "_ui"): Promise<string[]> {
  return (await findFiles(sourceDir)).sort();
}

export async function copyElementModules(outputDir = "generated/assets/elements", sourceDir = "_ui"): Promise<void> {
  const elementModules = await discoverElementModules(sourceDir);
  await mkdir(outputDir, { recursive: true });
  assertUniqueBasenames(elementModules);

  await Promise.all(elementModules.map((source) => cp(source, join(outputDir, basename(source)))));
}

function assertUniqueBasenames(files: string[]): void {
  const seen = new Map<string, string>();
  for (const file of files) {
    const name = basename(file);
    const existing = seen.get(name);
    if (existing) throw new Error(`Duplicate element module basename ${name}: ${existing} and ${file}`);
    seen.set(name, file);
  }
}

async function findFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return findFiles(path);
    return entry.isFile() && extname(entry.name) === ".mjs" ? [path] : [];
  }));

  return files.flat().sort();
}
