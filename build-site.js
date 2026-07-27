const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const campaigns = ["climatisation", "piscine", "photovoltaique"];
const exclude = new Set(["node_modules", "_redirects", ".git"]);

function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.has(entry.name)) {
      continue;
    }
    const sourcePath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

rimraf(dist);
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));

for (const slug of campaigns) {
  copyDir(path.join(root, slug), path.join(dist, slug));
}

console.log("Build OK → dist/ (" + campaigns.join(", ") + ")");
