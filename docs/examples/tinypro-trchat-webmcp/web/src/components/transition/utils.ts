export function findIdx(el: Element) {
  let idx = 0
  let cur = el
  while (cur) {
    idx += 1
    cur = cur.previousElementSibling
  }
  return idx
}
