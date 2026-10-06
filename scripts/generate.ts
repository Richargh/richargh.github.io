import { cp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { render as renderIndex } from "../routes/index.server.ts";
import { render as renderAiWaste } from "../routes/posts/AI-Waste.server.ts";

const outputDir = "generated";

await mkdir(join(outputDir, "posts"), { recursive: true });
await cp("assets", join(outputDir, "assets"), { recursive: true, force: true });
await writeFile(join(outputDir, "index.html"), `${renderIndex()}\n`, "utf8");
await writeFile(join(outputDir, "posts", "AI-Waste.html"), `${await renderAiWaste()}\n`, "utf8");

console.log(`Generated ${join(outputDir, "index.html")}`);
console.log(`Generated ${join(outputDir, "posts", "AI-Waste.html")}`);
console.log(`Generated ${join(outputDir, "assets")}`);
