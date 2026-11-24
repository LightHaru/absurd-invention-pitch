import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

export const ENTRY =
  "Meet the MugCollie, a border-collie coaster that detects your coffee going cold, stalks the mug in a low crouch, and herds it across the desk until it's penned against your hand.";

export const DEFAULT_OUTPUT_DIR = "/output";

export function outputPath(dir?: string): string {
  return join(dir ?? DEFAULT_OUTPUT_DIR, "entry.txt");
}

export function main(argv: readonly string[] = process.argv): string {
  if ([...ENTRY].length > 220 || /[\r\n]/.test(ENTRY) || !ENTRY.trim()) {
    throw new Error("entry violates the gate: must be 1-220 characters on a single line");
  }
  const file = outputPath(argv[2]);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, ENTRY, "utf8");
  return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
