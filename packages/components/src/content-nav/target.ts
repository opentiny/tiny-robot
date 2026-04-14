export const CONTENT_NAV_TARGET_ATTRIBUTE = 'data-content-nav-id'
export const CONTENT_NAV_TARGET_SELECTOR = `[${CONTENT_NAV_TARGET_ATTRIBUTE}]`

export function queryContentNavTargetById(root: ParentNode, id: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return root.querySelector<HTMLElement>(`[${CONTENT_NAV_TARGET_ATTRIBUTE}="${CSS.escape(id)}"]`)
  }

  return Array.from(root.querySelectorAll<HTMLElement>(CONTENT_NAV_TARGET_SELECTOR)).find(
    (entry) => entry.dataset.contentNavId === id,
  )
}
