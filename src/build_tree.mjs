import fs from "fs";
import path from "path";
import util from "util";

console.log("build_tree.js");

const txtFile = path.resolve("./tree_raw.txt");
const jsonFile = path.resolve("./tree.json");

const txt = fs.readFileSync(txtFile, "utf8");

const lines = txt.split("\n");

const json = {
  tree: {
    _id: 0,
    type: "menu",
    html: "root.html",
    more: "root-more.html",
    items: [],
  },
};

let parents = [json.tree];
let level = 0;
let id = 0;

for (let line of lines) {
  const match = line.match(/^(\s*)-\s(.*)/);
  if (match) {
    const indent = match[1].length / 2;
    const title = match[2];
    // console.log({ indent, title });
    addMenu(title, indent);
  }
}

function addMenu(title, indent) {
  if (indent > level) {
    const parent = parents[parents.length - 1];
    parents.push(parent.items[parent.items.length - 1]);
    level = indent;
  } else if (indent < level) {
    for (let i = 0; i < level - indent; i++) {
      parents.pop();
    }
    level = indent;
  }

  const parent = parents[parents.length - 1];
  if (parent.items === undefined) {
    parent.type = "menu";
    parent.items = [];
    delete parent.article;
  }

  const id = parent.items.length + 1;

  const item = {
    _id: id,
    type: "link",
    name: title,
  };

  if (level === 0) {
    if (id === 1) {
      item.class = "wind wind-img";
    }
    if (id === 2) {
      item.class = "solar solar-img";
    }
  } else {
    if (parents[1]._id === 1) {
      item.class = "wind";
    }
    if (parents[1]._id === 2) {
      item.class = "solar";
    }
  }

  const parentIds = parents.slice(1).map((p) => p._id);
  const ids = parentIds.concat([id]);

  item.article = `${ids.join("_")}.html`;
  item.help = `${ids.join("_")}_help.html`;

  parent.items.push(item);
}

// console.log(util.inspect(json, { depth: null, colors: true }));

fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
