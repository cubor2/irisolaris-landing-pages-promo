const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
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

function rewriteIndexToRelative(indexPath) {
  let html = fs.readFileSync(indexPath, "utf8");
  html = html
    .replace(/href="\/css\//g, 'href="css/')
    .replace(/href="\/assets\//g, 'href="assets/')
    .replace(/src="\/js\//g, 'src="js/')
    .replace(/src="\/assets\//g, 'src="assets/');
  fs.writeFileSync(indexPath, html, "utf8");
}

rimraf(dist);
copyDir(path.join(root, "pac-climatisation"), dist);

for (const slug of ["pac-piscine", "centrale-pv"]) {
  const dest = path.join(dist, slug);
  copyDir(path.join(root, slug), dest);
  rewriteIndexToRelative(path.join(dest, "index.html"));
}

const redirects = [
  "/pac-climatisation      /               301",
  "/pac-climatisation/     /               301",
  "/pac-piscine            /pac-piscine/   301",
  "/centrale-pv            /centrale-pv/   301",
  "",
].join("\n");

fs.writeFileSync(path.join(dist, "_redirects"), redirects, "utf8");
console.log("Build OK ? dist/");
