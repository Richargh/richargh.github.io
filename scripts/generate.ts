import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { render } from "../routes/index.server.ts";

const outputDir = "generated";

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, "index.html"), `${render()}\n`, "utf8");

console.log(`Generated ${join(outputDir, "index.html")}`);
