import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { DEFAULT_OUTPUT_DIR, ENTRY, main, outputPath } from "../main.ts";

const MAIN = join(dirname(fileURLToPath(import.meta.url)), "..", "main.ts");

function tmpdirPath(t: test.TestContext): string {
  const dir = mkdtempSync(join(tmpdir(), "mugcollie-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("is deterministic: two runs write identical bytes", (t) => {
  const dir = tmpdirPath(t);
  const first = readFileSync(main(["node", "main.ts", join(dir, "a")]));
  const second = readFileSync(main(["node", "main.ts", join(dir, "b")]));
  assert.deepEqual(first, second);
  assert.equal(first.toString("utf8"), ENTRY);
});

test("writes exactly one line, no trailing newline", (t) => {
  const dir = tmpdirPath(t);
  const text = readFileSync(main(["node", "main.ts", dir]), "utf8");
  assert.equal(text, ENTRY);
  assert.ok(!/[\r\n]/.test(text));
  assert.ok(text.trim().length > 0);
});

test("stays within the 220 Unicode character limit", () => {
  assert.ok([...ENTRY].length <= 220);
});

test("writes entry.txt to the given directory, defaulting to /output", (t) => {
  const dir = tmpdirPath(t);
  const file = main(["node", "main.ts", dir]);
  assert.equal(file, join(dir, "entry.txt"));
  assert.deepEqual(readdirSync(dir), ["entry.txt"]);
  assert.equal(outputPath(), join(DEFAULT_OUTPUT_DIR, "entry.txt"));
  assert.equal(outputPath(), "/output/entry.txt");
});

test("runs as a CLI program end to end", (t) => {
  const dir = tmpdirPath(t);
  try {
    execFileSync(process.execPath, [MAIN, dir], { encoding: "utf8" });
    assert.equal(readFileSync(join(dir, "entry.txt"), "utf8"), ENTRY);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
