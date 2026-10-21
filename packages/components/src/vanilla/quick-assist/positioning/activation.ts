import type { QuickAssistActivationInput, QuickAssistAnchorShortcut } from '../types'

/** Observe the anchor and its ancestors, including removal of an ancestor or CSS hiding. */
export function observeElementLiveness(element: Element, callback: () => void): () => void {
  const view = element.ownerDocument.defaultView
  let frame: number | undefined
  let disposed = false
  let ancestors: Element[] = []
  const schedule = () => {
    if (disposed || frame !== undefined) return
    if (view)
      frame = view.requestAnimationFrame(() => {
        frame = undefined
        if (!disposed) {
          watchAncestors()
          callback()
        }
      })
    else callback()
  }
  const mutation = view?.MutationObserver ? new view.MutationObserver(schedule) : undefined
  const resize = view?.ResizeObserver ? new view.ResizeObserver(schedule) : undefined
  function watchAncestors() {
    const next: Element[] = []
    for (let current: Element | null = element; current; current = current.parentElement) next.push(current)
    if (next.length === ancestors.length && next.every((item, index) => item === ancestors[index])) return
    ancestors = next
    mutation?.disconnect()
    resize?.disconnect()
    for (const current of ancestors) {
      mutation?.observe(current, { childList: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] })
      resize?.observe(current)
    }
  }
  watchAncestors()
  return () => {
    disposed = true
    if (frame !== undefined) view?.cancelAnimationFrame(frame)
    mutation?.disconnect()
    resize?.disconnect()
  }
}

export function expandShortcut(input: QuickAssistAnchorShortcut, root: Document): QuickAssistActivationInput {
  const element = input.anchor
  if (!element || element.nodeType !== 1 || element.ownerDocument !== root) {
    throw new Error('QuickAssist anchor must be an Element in the instance document')
  }
  return {
    source: input.source ?? 'manual',
    text: input.text,
    meta: input.meta,
    open: input.open,
    suggestions: input.suggestions,
    getSuggestions: input.getSuggestions,
    anchorElement: element,
    getRect: () => {
      if (!element.isConnected) return null
      for (let current: Element | null = element; current; current = current.parentElement) {
        const style = root.defaultView?.getComputedStyle(current)
        if (current.hasAttribute('hidden') || style?.display === 'none' || style?.visibility === 'hidden') return null
      }
      const rect = element.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 ? rect : null
    },
    onInvalidate: (callback) => observeElementLiveness(element, callback),
  }
}

/** External providers own editor clipping; the runtime validates viewport geometry. May throw. */
export function getActivationRect(input: QuickAssistActivationInput, root: Document): DOMRectReadOnly | null {
  if (input.anchorElement && (!input.anchorElement.isConnected || input.anchorElement.ownerDocument !== root))
    return null
  if (input.verify && !input.verify()) return null
  const rect = input.getRect()
  if (
    !rect ||
    ![rect.left, rect.top, rect.right, rect.bottom, rect.width, rect.height].every(Number.isFinite) ||
    rect.width < 0 ||
    rect.height < 0 ||
    (rect.width === 0 && rect.height === 0)
  )
    return null
  const width = root.defaultView?.innerWidth ?? root.documentElement.clientWidth
  const height = root.defaultView?.innerHeight ?? root.documentElement.clientHeight
  return rect.right >= 0 && rect.left <= width && rect.bottom > 0 && rect.top < height ? rect : null
}

/** No global DOM observer: external sources signal model/layout invalidation explicitly. */
export function observeActivationPosition(root: Document, callback: () => void): () => void {
  const view = root.defaultView
  let frame: number | undefined
  let disposed = false
  const schedule = () => {
    if (disposed || frame !== undefined) return
    if (view)
      frame = view.requestAnimationFrame(() => {
        frame = undefined
        if (!disposed) callback()
      })
    else callback()
  }
  root.addEventListener('scroll', schedule, true)
  view?.addEventListener('resize', schedule)
  return () => {
    disposed = true
    root.removeEventListener('scroll', schedule, true)
    view?.removeEventListener('resize', schedule)
    if (frame !== undefined) view?.cancelAnimationFrame(frame)
  }
}
