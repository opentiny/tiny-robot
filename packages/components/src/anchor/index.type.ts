import type { VNode } from 'vue'

export interface AnchorItem {
  id: string
  label: string
  searchText?: string
  tooltipText?: string
  meta?: Record<string, unknown>
}

export interface AnchorHighlightSegment {
  text: string
  highlighted: boolean
}

export type AnchorSearchMatcher = (item: AnchorItem, searchQuery: string) => false | AnchorHighlightSegment[]

export type AnchorPlacement = 'left' | 'right'
export type AnchorExpandTrigger = 'hover' | 'manual'

export interface AnchorSearchOptions {
  placeholder?: string
  matcher?: AnchorSearchMatcher
  clearOnCollapse?: boolean
}

export interface AnchorProps {
  items: AnchorItem[]
  scrollContainer?: HTMLElement | null
  activeId?: string
  activeOffset?: number
  expanded?: boolean
  searchQuery?: string
  placement?: AnchorPlacement
  expandTrigger?: AnchorExpandTrigger
  searchOptions?: AnchorSearchOptions
  tooltipDelay?: number
  targetFeedbackClass?: string
  targetFeedbackDuration?: number
  emptyText?: string
}

export interface AnchorEmits {
  'update:activeId': [value: string | undefined]
  'update:expanded': [value: boolean]
  'update:searchQuery': [value: string]
  select: [item: AnchorItem]
}

export interface AnchorSlots {
  item?: (slotProps: {
    item: AnchorItem
    segments: AnchorHighlightSegment[]
    active: boolean
    expanded: boolean
    highlighted: boolean
  }) => VNode | VNode[]
  marker?: (slotProps: { item: AnchorItem; active: boolean }) => VNode | VNode[]
  search?: (slotProps: {
    searchQuery: string
    setSearchQuery: (value: string) => void
    searchOptions: AnchorSearchOptions
  }) => VNode | VNode[]
  empty?: () => VNode | VNode[]
}
