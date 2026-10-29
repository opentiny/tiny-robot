export const ANCHOR_TARGET_ATTRIBUTE = 'data-anchor-id'
export const ANCHOR_TARGET_SELECTOR = `[${ANCHOR_TARGET_ATTRIBUTE}]`
export const ANCHOR_ITEM_ATTRIBUTE = 'data-item-id'
export const ANCHOR_ITEM_SELECTOR = `[${ANCHOR_ITEM_ATTRIBUTE}]`

function queryByDataAttribute(root: ParentNode, selector: string, datasetKey: string, id: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).find((entry) => entry.dataset[datasetKey] === id)
}

export function queryAnchorTargetById(root: ParentNode, id: string) {
  return queryByDataAttribute(root, ANCHOR_TARGET_SELECTOR, 'anchorId', id)
}

export function queryAnchorItemById(root: ParentNode, id: string) {
  return queryByDataAttribute(root, ANCHOR_ITEM_SELECTOR, 'itemId', id)
}
