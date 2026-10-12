import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("site generation writes bundled CSS into generated assets", async () => {
  const generateScript = await readFile("scripts/generate.ts", "utf8");

  assert.match(generateScript, /import \{ writeCssBundle \} from "\.\/build-css\.ts";/);
  assert.match(generateScript, /await writeCssBundle\(join\(outputDir, "assets", "css", "style\.css"\)\);/);
  assert.ok(generateScript.indexOf("await cp(\"assets\"") < generateScript.indexOf("await writeCssBundle(join(outputDir"));
});
