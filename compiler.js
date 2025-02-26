const types = {
  HTML_TAG: "ht",
  CONTENT: "content",
  IF: "if",
  FOR: "for",
};
function createTagTree(tag, state) {
  const tags = {
    name: tag,
    type: types.HTML_TAG,
    state,
    childrens: [],
    attrebuts: [],
  };
  return tags;
}
/**
 *
 * @param {ReturnType<createTagTree>[]} tags
 */
function reconstruct(tags) {
  let i = 0;
  let j = tags.length - 1;
  while (i < j) {
    tags[i].name;
  }
}
function HTMLCompile({ code = "" }) {
  const openTagRegex = new RegExp(/<[^<>/]+>/);
  const closeTagRegex = new RegExp(/<\/[^<>]+>/);
  code = code
    .split(/(<\/?[^<>]+\/?>)/)
    .map((e) => e.trim())
    .filter((e) => e.length != 0);

  const stack = [];
  for (let i = 0; i < code.length; i++) {
    if (openTagRegex.test(code[i])) {
      const node = createTagTree(code[i], "open");
      if (stack.length > 0) stack[stack.length - 1].childrens.push(node);
      stack.push(node);
      continue;
    }
    if (closeTagRegex.test(code[i]) && stack.length != 1) {
      stack.pop();
      continue;
    }
    stack[stack.length - 1].childrens.push(code[i]);
  }

  return stack[0].childrens;
  return code;
}
module.exports = HTMLCompile;
