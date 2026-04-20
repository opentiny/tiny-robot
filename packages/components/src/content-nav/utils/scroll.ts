export type ContentNavScrollRoot = HTMLElement | Window

function isHTMLElement(value: ContentNavScrollRoot | null): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement
}

function getScrollingElement() {
  if (typeof document === 'undefined') {
    return null
  }

  return document.scrollingElement ?? document.documentElement ?? document.body ?? null
}

export function resolveContentNavScrollRoot(container: HTMLElement | null | undefined): ContentNavScrollRoot | null {
  if (container) {
    return container
  }

  return typeof window !== 'undefined' ? window : null
}

export function getContentNavScrollTop(root: ContentNavScrollRoot | null) {
  if (!root) {
    return 0
  }

  if (isHTMLElement(root)) {
    return root.scrollTop
  }

  const scrollingElement = getScrollingElement()
  return root.scrollY || root.pageYOffset || scrollingElement?.scrollTop || 0
}

export function getContentNavClientHeight(root: ContentNavScrollRoot | null) {
  if (!root) {
    return 0
  }

  return isHTMLElement(root) ? root.clientHeight : root.innerHeight
}

export function getContentNavScrollHeight(root: ContentNavScrollRoot | null) {
  if (!root) {
    return 0
  }

  if (isHTMLElement(root)) {
    return root.scrollHeight
  }

  const scrollingElement = getScrollingElement()
  const documentElement = typeof document !== 'undefined' ? document.documentElement : null
  const body = typeof document !== 'undefined' ? document.body : null

  return Math.max(scrollingElement?.scrollHeight || 0, documentElement?.scrollHeight || 0, body?.scrollHeight || 0)
}

export function getContentNavViewportTop(root: ContentNavScrollRoot | null) {
  if (!root) {
    return 0
  }

  return isHTMLElement(root) ? root.getBoundingClientRect().top : 0
}

export function scrollContentNavTo(root: ContentNavScrollRoot | null, top: number, behavior: ScrollBehavior) {
  if (!root) {
    return
  }

  root.scrollTo({
    top,
    behavior,
  })
}
