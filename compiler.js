const types = {
  HTML_TAG: "ht",
  CONTENT: "content",
  IF: "if",
  FOR: "for",
};
const SOURCE_WORD = "data";
const DATA_TO_REPLACE = {
  t: true,
};
const handlers = {
  /**
   *
   * @param {ReturnType<createTagTree>} node
   */
  if: (node) => {
    const parts = node.attrebuts.condition.split(" ");
    parts.forEach((part, i) => {
      if (
        part.includes(SOURCE_WORD + ".") &&
        DATA_TO_REPLACE[part.split(".")[1]]
      ) {
        parts[i] = DATA_TO_REPLACE[part.split(".")[1]];
      }
    });
    if (!eval(parts.join(" "))) return;
    node.childrens.forEach(constructHtml);
  },
  ignore: (node) => {},
};

const domRendered = [];
/**
 *
 * @param {ReturnType<createTagTree>} root
 */
function constructHtml(root) {
  if (typeof root == "string") return domRendered.push(root);
  if (handlers[root.name]) return handlers[root.name](root);
  domRendered.push(
    "<" +
      root.name +
      Object.entries(root.attrebuts)
        .map((e) => ` ${e[0]}="${e[1]}" `)
        .join(" ") +
      ">"
  );
  for (let i = 0; i < root.childrens.length; i++) {
    if (typeof root.childrens[i] != "string") {
      constructHtml(root.childrens[i]);
      continue;
    }
    domRendered.push(root.childrens[i]);
  }
  domRendered.push("</" + root.name + ">");
}
function createTagTree(tag) {
  let parts = tag.split(/^<(\w+)(.*)>$/).filter((e) => e.length != 0);
  let attrebuts = {};
  parts
    .filter((e, i) => i != 0)
    .forEach((e) => {
      const parts = e.split(/="([^"]+)"/);
      attrebuts[parts[0].trim()] = parts[1];
    });
  const tags = {
    name: parts[0],
    type: types.HTML_TAG,
    childrens: [],
    attrebuts: attrebuts,
  };
  return tags;
}
function HTMLCompile({ code = "" }) {
  const root = createTagTree("root");

  const openTagRegex = new RegExp(/<[^<>/]+>/);
  const closeTagRegex = new RegExp(/<\/[^<>]+>/);
  code = code
    .split(/(<\/?[^<>]+\/?>)/)
    .map((e) => e.trim())
    .filter((e) => e.length != 0);

  const stack = [root];
  for (let i = 0; i < code.length; i++) {
    if (openTagRegex.test(code[i])) {
      const node = createTagTree(code[i]);
      if (stack.length > 0) stack[stack.length - 1].childrens.push(node);
      stack.push(node);
      continue;
    }
    if (closeTagRegex.test(code[i])) {
      stack.pop();
      continue;
    }
    stack[stack.length - 1].childrens.push(code[i]);
  }
  root.childrens.forEach(constructHtml);
  return domRendered.join(" ");
  return code;
}
module.exports = HTMLCompile;
