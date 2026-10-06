import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assetResponse, getStaticPaths, mediaType } from "../routes/assets/[...slug].server.ts";

test("asset route exposes static asset paths and media types", async () => {
  const paths = await getStaticPaths();
  assert.ok(paths.some((path) => path.params.slug === "css/style.css"));
  assert.equal(mediaType("assets/css/style.css"), "text/css; charset=utf-8");
  assert.equal(mediaType("assets/img/favicon.ico"), "image/x-icon");
});

test("asset route rejects path traversal", async () => {
  const response = await assetResponse("../package.json");
  assert.equal(response.status, 403);
});

test("asset route serves byte-for-byte responses", async () => {
  const response = await assetResponse("css/style.css");
  assert.equal(response.status, 200);
  const actual = Buffer.from(await response.arrayBuffer());
  const expected = await readFile("assets/css/style.css");
  assert.deepEqual(actual, expected);
});
