import type { Ref } from 'vue'
import type {
  ContentNavExpandTrigger,
  ContentNavHighlightSegment,
  ContentNavItem,
  ContentNavPlacement,
  ContentNavSearchOptions,
} from './index.type'

export interface ContentNavFilteredItem {
  item: ContentNavItem
  segments: ContentNavHighlightSegment[]
}

export interface ContentNavItemSlotProps {
  item: ContentNavItem
  segments: ContentNavFilteredItem['segments']
  active: boolean
  expanded: boolean
  highlighted: boolean
}

export interface ContentNavMarkerSlotProps {
  item: ContentNavItem
  active: boolean
}

export interface ContentNavSearchProps {
  searchQuery: string
  searchOptions?: ContentNavSearchOptions
}

export interface ContentNavSearchEmits {
  'update:searchQuery': [value: string]
}

export interface ContentNavOverlayProps {
  expanded: boolean
  placement: ContentNavPlacement
  floatingOffset?: number
}

export interface ContentNavOverlayExpose {
  hostEl: HTMLElement | null
  overlayEl: HTMLElement | null
  navEl: HTMLElement | null
}

export interface ContentNavListProps {
  items: ContentNavFilteredItem[]
  activeId?: string
  expanded: boolean
  highlightedIndex: number
  placement: ContentNavPlacement
  tooltipDelay: number
  emptyText: string
}

export interface ContentNavListEmits {
  select: [item: ContentNavItem]
}

export interface ContentNavListSlots {
  item?: (slotProps: ContentNavItemSlotProps) => unknown
  marker?: (slotProps: ContentNavMarkerSlotProps) => unknown
  empty?: () => unknown
}

export interface ContentNavItemProps {
  entry: ContentNavFilteredItem
  activeId?: string
  expanded: boolean
  highlighted: boolean
  placement: ContentNavPlacement
  tooltipDelay: number
}

export interface ContentNavItemEmits {
  select: [item: ContentNavItem]
}

export interface ContentNavItemSlots {
  item?: (slotProps: ContentNavItemSlotProps) => unknown
  marker?: (slotProps: ContentNavMarkerSlotProps) => unknown
}

export interface ContentNavActiveSyncOptions {
  items: Ref<ContentNavItem[]>
  resolveTarget: (id: string) => HTMLElement | null
  container: Ref<HTMLElement | null | undefined>
  host?: Ref<HTMLElement | null | undefined>
  activeId?: Ref<string | undefined>
  activeOffset?: Ref<number | undefined>
  onUpdateActiveId?: (value: string | undefined) => void
}

export interface ContentNavFloatingOffsetOptions {
  container: Ref<HTMLElement | null | undefined>
  host: Ref<HTMLElement | null | undefined>
}

export interface ContentNavOverlayInteractionsOptions {
  overlay: Ref<ContentNavOverlayExpose | null>
  highlightedId: Ref<string | undefined>
  shouldAutoCollapse: Ref<boolean>
  handleNavigationKeydown: (event: KeyboardEvent) => boolean
  getHighlightedItem: () => ContentNavItem | undefined
  onSelectItem: (itemId: string) => void
  setExpanded: (value: boolean) => void
}

export interface ContentNavControllerOptions {
  items: Ref<ContentNavItem[]>
  activeId: Ref<string | undefined>
  expanded: Ref<boolean | undefined>
  expandTrigger: Ref<ContentNavExpandTrigger>
  searchQuery?: Ref<string | undefined>
  searchOptions?: Ref<ContentNavSearchOptions | undefined>
  onUpdateExpanded?: (value: boolean) => void
  onUpdateSearchQuery?: (value: string) => void
}

export interface ContentNavTargetFeedbackOptions {
  resolveTarget: (id: string) => HTMLElement | null
  feedbackClass: Ref<string | undefined>
  feedbackDuration: Ref<number | undefined>
}
