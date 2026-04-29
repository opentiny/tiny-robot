export const CONTENT_NAV_TARGET_ATTRIBUTE = 'data-content-nav-id'
export const CONTENT_NAV_TARGET_SELECTOR = `[${CONTENT_NAV_TARGET_ATTRIBUTE}]`
export const CONTENT_NAV_ITEM_ATTRIBUTE = 'data-item-id'
export const CONTENT_NAV_ITEM_SELECTOR = `[${CONTENT_NAV_ITEM_ATTRIBUTE}]`

function queryByDataAttribute(root: ParentNode, selector: string, datasetKey: string, id: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).find((entry) => entry.dataset[datasetKey] === id)
}

export function queryContentNavTargetById(root: ParentNode, id: string) {
  return queryByDataAttribute(root, CONTENT_NAV_TARGET_SELECTOR, 'contentNavId', id)
}

export function queryContentNavItemById(root: ParentNode, id: string) {
  return queryByDataAttribute(root, CONTENT_NAV_ITEM_SELECTOR, 'itemId', id)
}
