import type { ContentNavHighlightSegment, ContentNavItem, ContentNavSearchMatcher } from './index.type'

export const defaultContentNavSearchMatcher: ContentNavSearchMatcher = (item, rawQuery) => {
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

export function defaultContentNavActiveResolver(options: {
  viewport: {
    top: number
    scrollTop: number
    clientHeight: number
    scrollHeight: number
  }
  anchors: Array<{ id: string; el: HTMLElement }>
  items: ContentNavItem[]
}) {
  const { viewport, anchors, items } = options

  if (!anchors.length || !items.length) {
    return items[0]?.id
  }

  const isAtBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2
  if (isAtBottom) {
    return items[items.length - 1]?.id
  }

  const threshold = viewport.top + 120
  let activeId = items[0]?.id

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

export function ensureContentNavSegments(item: ContentNavItem, segments: false | ContentNavHighlightSegment[]) {
  if (!segments || segments.length === 0) {
    return [{ text: item.label, highlighted: false }]
  }

  return segments
}
