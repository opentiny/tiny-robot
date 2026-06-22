const LAYOUT_ROOT_SELECTOR = '.tr-layout'
const LAYOUT_ASIDE_SELECTOR = '.tr-layout__aside'

export function isHTMLElement(element: unknown): element is HTMLElement {
  const ownerDocument = (element as { ownerDocument?: Document } | null)?.ownerDocument
  const view = ownerDocument?.defaultView

  return !!view && element instanceof view.HTMLElement
}

function closestHTMLElement(element: Element | null | undefined, selector: string): HTMLElement | null {
  const candidate = element?.closest(selector)

  return isHTMLElement(candidate) ? candidate : null
}

export function getLayoutRootElement(element: Element | null | undefined): HTMLElement | null {
  return closestHTMLElement(element, LAYOUT_ROOT_SELECTOR)
}

export function getLayoutAsideElement(element: Element | null | undefined): HTMLElement | null {
  return closestHTMLElement(element, LAYOUT_ASIDE_SELECTOR)
}
