import type { QuickAssistPlacement, SelectionSnapshot } from '../types'

const VIEWPORT_MARGIN = 8

export interface PositionElementOptions {
  element: HTMLElement
  anchor: DOMRectReadOnly
  placement: QuickAssistPlacement
  offset: number
  viewport?: { width: number; height: number }
}

export interface ObserveAnchorOptions {
  element: HTMLElement
  snapshot: SelectionSnapshot
  onChange: () => void
  onInvalid: () => void
}

/**
 * Return the currently usable rectangle for a retained selection range.
 * A selection can span several lines; the union rectangle is the most stable
 * anchor for the compact trigger/popover.  The function deliberately uses
 * only the captured range and never reads the live document selection.
 */
export function getSnapshotRect(snapshot: SelectionSnapshot): DOMRectReadOnly | null {
  const range = snapshot.range
  if (!range || !range.startContainer.isConnected || !range.endContainer.isConnected) {
    return null
  }

  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 || rect.height > 0)
  const rangeRect = range.getBoundingClientRect()
  if (!rects.length && rangeRect.width <= 0 && rangeRect.height <= 0) {
    return null
  }
  if (!rects.length) return rangeRect

  const left = Math.min(...rects.map((rect) => rect.left))
  const top = Math.min(...rects.map((rect) => rect.top))
  const right = Math.max(...rects.map((rect) => rect.right))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))

  // Keep the browser's DOMRectReadOnly contract while avoiding a dependency
  // on a particular window implementation (important for SSR/test documents).
  const view = snapshot.root.defaultView
  if (view?.DOMRect) return new view.DOMRect(left, top, right - left, bottom - top)
  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({ left, top, right, bottom, width: right - left, height: bottom - top }),
  } as DOMRectReadOnly
}

function getViewport(
  element: HTMLElement,
  viewport?: { width: number; height: number },
): { width: number; height: number } {
  if (viewport) return viewport
  const view = element.ownerDocument.defaultView
  return {
    width: view?.innerWidth ?? element.ownerDocument.documentElement.clientWidth,
    height: view?.innerHeight ?? element.ownerDocument.documentElement.clientHeight,
  }
}

/** Position a fixed element below/above an anchor, flipping and shifting it into view. */
export function positionElement(options: PositionElementOptions): void {
  const { element, anchor, offset } = options
  const viewport = getViewport(element, options.viewport)
  const width = element.getBoundingClientRect().width || element.offsetWidth || 1
  const height = element.getBoundingClientRect().height || element.offsetHeight || 1
  const requested = options.placement === 'auto' ? 'bottom' : options.placement
  const roomBelow = viewport.height - anchor.bottom - offset - VIEWPORT_MARGIN
  const roomAbove = anchor.top - offset - VIEWPORT_MARGIN
  const shouldFlip =
    requested === 'bottom' ? roomBelow < height && roomAbove > roomBelow : roomAbove < height && roomBelow > roomAbove
  const side = shouldFlip ? (requested === 'bottom' ? 'top' : 'bottom') : requested

  const rawLeft = anchor.left + anchor.width / 2 - width / 2
  const left = Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, viewport.width - width - VIEWPORT_MARGIN))
  const rawTop = side === 'top' ? anchor.top - height - offset : anchor.bottom + offset
  const top = Math.max(VIEWPORT_MARGIN, Math.min(rawTop, viewport.height - height - VIEWPORT_MARGIN))

  element.style.position = 'fixed'
  element.style.left = `${Math.round(left)}px`
  element.style.top = `${Math.round(top)}px`
  element.dataset.placement = side
}

function isVisibleAnchor(rect: DOMRectReadOnly, viewport: { width: number; height: number }): boolean {
  return (
    rect.right > 0 &&
    rect.bottom > 0 &&
    rect.left < viewport.width &&
    rect.top < viewport.height &&
    (rect.width > 0 || rect.height > 0)
  )
}

/**
 * Reposition a visible element as the page moves.  Scroll is captured so
 * nested scrolling containers are covered; all listeners/observers are
 * removed by the returned cleanup function.
 */
export function observeAnchor(options: ObserveAnchorOptions): () => void {
  const { element, snapshot, onChange, onInvalid } = options
  const root = snapshot.root
  const view = root.defaultView
  let disposed = false
  let frame: number | undefined

  const check = () => {
    if (disposed) return
    const rect = getSnapshotRect(snapshot)
    const viewport = {
      width: view?.innerWidth ?? root.documentElement.clientWidth,
      height: view?.innerHeight ?? root.documentElement.clientHeight,
    }
    if (
      !element.isConnected ||
      !rect ||
      !isVisibleAnchor(rect, viewport) ||
      !root.documentElement.contains(snapshot.range.commonAncestorContainer)
    ) {
      onInvalid()
      return
    }
    onChange()
  }

  const schedule = () => {
    if (disposed || frame !== undefined) return
    if (view?.requestAnimationFrame) {
      frame = view.requestAnimationFrame(() => {
        frame = undefined
        check()
      })
    } else {
      check()
    }
  }

  const onScroll = () => schedule()
  const onResize = () => schedule()
  view?.addEventListener('resize', onResize)
  // Capture catches scrolling elements without needing to discover every
  // ancestor; it does not treat scrolling inside the popover itself as a
  // host scroll because the popover is mounted outside that subtree.
  root.addEventListener('scroll', onScroll, true)

  const Observer = view?.MutationObserver
  const observer = Observer ? new Observer(() => schedule()) : undefined
  if (observer) observer.observe(root.documentElement, { childList: true, subtree: true })

  schedule()
  return () => {
    disposed = true
    if (frame !== undefined && view?.cancelAnimationFrame) view.cancelAnimationFrame(frame)
    view?.removeEventListener('resize', onResize)
    root.removeEventListener('scroll', onScroll, true)
    observer?.disconnect()
  }
}
