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
  query: string
  options?: ContentNavSearchOptions
}

export interface ContentNavSearchEmits {
  'update:query': [value: string]
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
  activeId?: Ref<string | undefined>
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

export interface ContentNavStateOptions {
  items: Ref<ContentNavItem[]>
  activeId: Ref<string | undefined>
  expanded: Ref<boolean | undefined>
  expandTrigger: Ref<ContentNavExpandTrigger>
  query?: Ref<string | undefined>
  search?: Ref<ContentNavSearchOptions | false | undefined>
  onUpdateExpanded?: (value: boolean) => void
  onUpdateQuery?: (value: string) => void
}
