import type { AnchorHighlightSegment, AnchorItem, AnchorSearchMatcher } from './index.type'

export const defaultAnchorSearchMatcher: AnchorSearchMatcher = (item, rawQuery) => {
  const query = rawQuery.trim().toLowerCase()
  const source = (item.searchText || item.label).trim()

  if (!query) {
    return [{ text: item.label, highlighted: false }]
  }

  const normalizedLabel = item.label.toLowerCase()
  const labelIndex = normalizedLabel.indexOf(query)

  if (labelIndex !== -1) {
    return [
      { text: item.label.slice(0, labelIndex), highlighted: false },
      { text: item.label.slice(labelIndex, labelIndex + query.length), highlighted: true },
      { text: item.label.slice(labelIndex + query.length), highlighted: false },
    ].filter((segment) => segment.text.length > 0)
  }

  if (source.toLowerCase().includes(query)) {
    return [{ text: item.label, highlighted: false }]
  }

  return false
}

export function defaultAnchorActiveResolver(options: {
  viewport: {
    top: number
    scrollTop: number
    clientHeight: number
    scrollHeight: number
  }
  anchors: Array<{ id: string; el: HTMLElement }>
  activeOffset?: number
}) {
  const { viewport, anchors } = options

  if (!anchors.length) {
    return
  }

  const canScroll = viewport.scrollHeight - viewport.clientHeight > 2
  const isAtBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2
  if (canScroll && isAtBottom) {
    return anchors[anchors.length - 1]?.id
  }

  const threshold = viewport.top + Math.max(0, options.activeOffset ?? 120)
  let activeId = anchors[0]?.id

  for (const anchor of anchors) {
    const rect = anchor.el.getBoundingClientRect()
    if (rect.top <= threshold) {
      activeId = anchor.id
    } else {
      break
    }
  }

  return activeId
}

export function ensureAnchorSegments(item: AnchorItem, segments: false | AnchorHighlightSegment[]) {
  if (!segments || segments.length === 0) {
    return [{ text: item.label, highlighted: false }]
  }

  return segments
}
