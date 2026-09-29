// Static packaging only: no bundler or framework is required.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
fs.mkdirSync(output, { recursive: true });
for (const file of ["index.html", "style.css", "script.js"]) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
fs.cpSync(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
console.log("Build estático pronto em dist/.");
