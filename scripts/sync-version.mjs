import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const packagePath = path.join(rootDir, "package.json");
const translationsPath = path.join(rootDir, "src", "i18n", "translations.js");

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const version = pkg.version;

const translationsSource = fs.readFileSync(translationsPath, "utf8");
const updated = translationsSource.replace(/TinyPush · v\d+\.\d+\.\d+/g, `TinyPush · v${version}`);

if (updated !== translationsSource) {
  fs.writeFileSync(translationsPath, updated, "utf8");
}

console.log(`Synced UI version to v${version}`);
