export function getIdByLabel(tree, targetLabel) {
  const stack = [...tree];

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.label === targetLabel) {
      return node.id;
    }

    if (node.children) {
      stack.push(...node.children);
    }
  }

  return null;
}
