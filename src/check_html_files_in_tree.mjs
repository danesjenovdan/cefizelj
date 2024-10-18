import fs from "fs";
import path from "path";

console.log("check html files in tree");

const jsonFile = path.resolve("../public/tree.json");
const json = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

const tree = json.tree;

const allFiles = new Set(fs.readdirSync(path.resolve("../public/pages")));
allFiles.delete("Slike");

const foundFiles = new Set();

function checkIfFilesExist(node) {
  const keys = ["html", "more", "article", "help"];

  for (let key of keys) {
    if (node[key]) {
      if (!foundFiles.has(node[key])) {
        foundFiles.add(node[key]);
      } else {
        console.error(`Duplicate file: ${node[key]}`);
      }

      if (!allFiles.has(node[key])) {
        let fileToRename = node[key].replace(".html", ".HTML");
        if (allFiles.has(fileToRename)) {
          console.log("Rename", fileToRename, "to", node[key]);
          // fs.renameSync(
          //   path.resolve("../public/pages", fileToRename),
          //   path.resolve("../public/pages", node[key])
          // );
        } else if (key === "help" && node["article"]) {
          console.error(`Help not found but has article defined: ${node[key]}`);
          // node[`__${key}`] = node[key];
          // node[key] = undefined;
        } else {
          console.error(`File not found (${key}): ${node[key]}`);
        }
      }
    }
  }
}

function checkNode(node) {
  checkIfFilesExist(node);

  if (node.items) {
    for (let item of node.items) {
      checkNode(item);
    }
  }
}

checkNode(tree);

fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));

// for (let file of allFiles) {
//   if (!foundFiles.has(file)) {
//     console.error(`Extra file: ${file}`);
//   }
// }

// for (let file of foundFiles) {
//   if (!allFiles.has(file)) {
//     console.error(`Missing file: ${file}`);
//   }
// }
