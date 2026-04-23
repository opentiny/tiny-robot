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

export type ContentNavSearchMatcher = (
  item: ContentNavItem,
  searchQuery: string,
) => false | ContentNavHighlightSegment[]

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
  activeOffset?: number
  expanded?: boolean
  searchQuery?: string
  placement?: ContentNavPlacement
  expandTrigger?: ContentNavExpandTrigger
  searchOptions?: ContentNavSearchOptions
  tooltipDelay?: number
  targetFeedbackClass?: string
  targetFeedbackDuration?: number
  emptyText?: string
}

export interface ContentNavEmits {
  'update:activeId': [value: string | undefined]
  'update:expanded': [value: boolean]
  'update:searchQuery': [value: string]
  select: [item: ContentNavItem]
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
    searchQuery: string
    setSearchQuery: (value: string) => void
    searchOptions: ContentNavSearchOptions
  }) => VNode | VNode[]
  empty?: () => VNode | VNode[]
}
