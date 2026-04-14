import type { VNode } from 'vue'

export interface ContentNavItem {
  id: string
  label: string
  searchText?: string
  tooltipText?: string
  meta?: Record<string, unknown>
}

export interface ContentNavHighlightSegment {
  text: string
  highlighted: boolean
}

export type ContentNavSearchMatcher = (item: ContentNavItem, query: string) => false | ContentNavHighlightSegment[]

export type ContentNavPlacement = 'left' | 'right'
export type ContentNavExpandTrigger = 'hover' | 'manual'

export interface ContentNavSearchOptions {
  placeholder?: string
  matcher?: ContentNavSearchMatcher
  clearOnCollapse?: boolean
}

export interface ContentNavProps {
  items: ContentNavItem[]
  scrollContainer?: HTMLElement | null
  activeId?: string
  expanded?: boolean
  query?: string
  placement?: ContentNavPlacement
  expandTrigger?: ContentNavExpandTrigger
  search?: false | ContentNavSearchOptions
  emptyText?: string
}

export interface ContentNavEmits {
  'update:activeId': [value: string | undefined]
  'update:expanded': [value: boolean]
  'update:query': [value: string]
  select: [item: ContentNavItem]
  activate: [item: ContentNavItem]
}

export interface ContentNavSlots {
  item?: (slotProps: {
    item: ContentNavItem
    segments: ContentNavHighlightSegment[]
    active: boolean
    expanded: boolean
    highlighted: boolean
  }) => VNode | VNode[]
  marker?: (slotProps: { item: ContentNavItem; active: boolean }) => VNode | VNode[]
  search?: (slotProps: {
    query: string
    setQuery: (value: string) => void
    options: ContentNavSearchOptions
  }) => VNode | VNode[]
  empty?: () => VNode | VNode[]
}
