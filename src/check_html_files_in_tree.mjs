import fs from "fs";
import path from "path";

console.log("check html files in tree");

const jsonFile = path.resolve("../public/tree.json");
const json = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

const tree = json.tree;

function checkIfFilesExist(node) {
  const keys = ["html", "more", "article", "help"];

  for (let key of keys) {
    if (node[key]) {
      const file = path.resolve(`../public/pages/${node[key]}`);
      if (!fs.existsSync(file)) {
        let fileToRename = path.resolve(
          `../public/pages/${node[key].replace(".html", ".HTML")}`
        );
        if (fs.existsSync(fileToRename)) {
          console.log("rename", fileToRename, "to", file);
          // fs.renameSync(fileToRename, file);
        } else {
          console.error(`File not found (${key}): ${file}`);
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
