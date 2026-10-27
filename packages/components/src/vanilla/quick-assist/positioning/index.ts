import type { QuickAssistPlacement, SelectionSnapshot } from '../types'

const VIEWPORT_MARGIN = 8

export interface PositionElementOptions {
  element: HTMLElement
  anchor: DOMRectReadOnly
  lineAnchors?: SelectionLineAnchors
  placement: QuickAssistPlacement
  offset: number
  viewport?: { width: number; height: number }
}

export interface SelectionLineAnchors {
  top: DOMRectReadOnly
  bottom: DOMRectReadOnly
}

function unionRect(root: Document, rects: DOMRectReadOnly[]): DOMRectReadOnly {
  const left = Math.min(...rects.map((rect) => rect.left))
  const top = Math.min(...rects.map((rect) => rect.top))
  const right = Math.max(...rects.map((rect) => rect.right))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))
  const width = right - left
  const height = bottom - top
  if (root.defaultView?.DOMRect) return new root.defaultView.DOMRect(left, top, width, height)
  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width,
    height,
    toJSON: () => ({ left, top, right, bottom, width, height }),
  }
}

/** Merge text fragments on each visual line, excluding enclosing element boxes. */
export function getSelectionLineAnchors(snapshot: SelectionSnapshot): SelectionLineAnchors | undefined {
  const { range, root } = snapshot
  const common = range.commonAncestorContainer
  const walker = root.createTreeWalker(common, 4 /* SHOW_TEXT */)
  const rects: DOMRectReadOnly[] = []
  for (let node: Node | null = common.nodeType === 3 ? common : walker.nextNode(); node; node = walker.nextNode()) {
    if (!range.intersectsNode(node)) continue
    const fragment = root.createRange()
    fragment.setStart(node, node === range.startContainer ? range.startOffset : 0)
    fragment.setEnd(node, node === range.endContainer ? range.endOffset : node.textContent!.length)
    rects.push(...Array.from(fragment.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0))
  }
  if (!rects.length) return undefined
  rects.sort((a, b) => a.top - b.top || a.left - b.left)
  const lines: DOMRectReadOnly[][] = []
  for (const rect of rects) {
    const line = lines.find((items) =>
      items.some(
        (item) =>
          Math.min(item.bottom, rect.bottom) - Math.max(item.top, rect.top) > Math.min(item.height, rect.height) / 2,
      ),
    )
    if (line) line.push(rect)
    else lines.push([rect])
  }
  return { top: unionRect(root, lines[0]), bottom: unionRect(root, lines[lines.length - 1]) }
}

export interface ObserveAnchorOptions {
  element: HTMLElement
  snapshot: SelectionSnapshot
  onChange: () => void
  onInvalid: () => void
}

/**
 * Return the currently usable rectangle for a retained selection range.
 * The union rectangle is used for visibility and movement checks; placement
 * uses the first/last line anchors. Only the captured Range is read.
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

  return unionRect(snapshot.root, rects)
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

/** Shared by real and virtual triggers so opening/repositioning a popover cannot drift. */
export function computePosition(options: {
  anchor: DOMRectReadOnly
  lineAnchors?: SelectionLineAnchors
  placement: QuickAssistPlacement
  offset: number
  width: number
  height: number
  viewport: { width: number; height: number }
}): { left: number; top: number; placement: QuickAssistPlacement } {
  const { offset, width, height, viewport } = options
  const requested = options.placement.startsWith('top') ? 'top' : 'bottom'
  const alignment = options.placement.endsWith('-start')
    ? 'start'
    : options.placement.endsWith('-end')
      ? 'end'
      : 'center'
  const topAnchor = options.lineAnchors?.top ?? options.anchor
  const bottomAnchor = options.lineAnchors?.bottom ?? options.anchor
  const roomBelow = viewport.height - bottomAnchor.bottom - offset - VIEWPORT_MARGIN
  const roomAbove = topAnchor.top - offset - VIEWPORT_MARGIN
  const shouldFlip =
    requested === 'bottom' ? roomBelow < height && roomAbove > roomBelow : roomAbove < height && roomBelow > roomAbove
  const side = shouldFlip ? (requested === 'bottom' ? 'top' : 'bottom') : requested
  const anchor = side === 'top' ? topAnchor : bottomAnchor
  const rawLeft =
    alignment === 'start'
      ? anchor.left - width
      : alignment === 'end'
        ? anchor.right
        : anchor.left + anchor.width / 2 - width / 2
  const left = Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, viewport.width - width - VIEWPORT_MARGIN))
  const rawTop = side === 'top' ? anchor.top - height - offset : anchor.bottom + offset
  const top = Math.max(VIEWPORT_MARGIN, Math.min(rawTop, viewport.height - height - VIEWPORT_MARGIN))
  return {
    left: Math.round(left),
    top: Math.round(top),
    placement: alignment === 'center' ? side : `${side}-${alignment}`,
  }
}

/** Position a fixed element below/above an anchor, flipping and shifting it into view. */
export function positionElement(options: PositionElementOptions): void {
  const { element } = options
  const position = computePosition({
    ...options,
    viewport: getViewport(element, options.viewport),
    width: element.getBoundingClientRect().width || element.offsetWidth || 1,
    height: element.getBoundingClientRect().height || element.offsetHeight || 1,
  })
  element.style.position = 'fixed'
  element.style.left = `${position.left}px`
  element.style.top = `${position.top}px`
  element.dataset.placement = position.placement
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
