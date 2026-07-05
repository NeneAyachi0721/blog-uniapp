const fs = require("fs");

const file = "package.json";
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));

const version = "3.22.5";

for (const group of ["dependencies", "devDependencies"]) {
  if (!pkg[group]) continue;
  for (const name of Object.keys(pkg[group])) {
    if (name.startsWith("@tiptap/")) {
      pkg[group][name] = version;
    }
  }
}

fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
