import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

const files = [
  "index.html",
  "styles.css",
  "script.js",
  ".nojekyll"
];

const directories = [
  "assets",
  "data"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of files) {
  await cp(resolve(root, file), resolve(dist, file));
}

for (const directory of directories) {
  await cp(resolve(root, directory), resolve(dist, directory), { recursive: true });
}

await writeFile(
  resolve(dist, "_headers"),
  [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "",
    "/index.html",
    "  Cache-Control: no-store",
    "",
    "/data/articles.js",
    "  Cache-Control: no-store",
    "",
    "/assets/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    ""
  ].join("\n"),
  "utf8"
);

console.log("Built static site assets in dist/");
