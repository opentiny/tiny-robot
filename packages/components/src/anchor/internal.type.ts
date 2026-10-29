import type { Ref } from 'vue'
import type {
  AnchorExpandTrigger,
  AnchorHighlightSegment,
  AnchorItem,
  AnchorPlacement,
  AnchorSearchOptions,
} from './index.type'

export interface AnchorFilteredItem {
  item: AnchorItem
  segments: AnchorHighlightSegment[]
}

export interface AnchorItemSlotProps {
  item: AnchorItem
  segments: AnchorFilteredItem['segments']
  active: boolean
  expanded: boolean
  highlighted: boolean
}

export interface AnchorMarkerSlotProps {
  item: AnchorItem
  active: boolean
}

export interface AnchorSearchProps {
  searchQuery: string
  searchOptions?: AnchorSearchOptions
}

export interface AnchorSearchEmits {
  'update:searchQuery': [value: string]
}

export interface AnchorOverlayProps {
  expanded: boolean
  placement: AnchorPlacement
  floatingOffset?: number
}

export interface AnchorOverlayExpose {
  hostEl: HTMLElement | null
  overlayEl: HTMLElement | null
  navEl: HTMLElement | null
}

export interface AnchorListProps {
  items: AnchorFilteredItem[]
  activeId?: string
  expanded: boolean
  highlightedIndex: number
  placement: AnchorPlacement
  tooltipDelay: number
  emptyText: string
}

export interface AnchorListEmits {
  select: [item: AnchorItem]
}

export interface AnchorListSlots {
  item?: (slotProps: AnchorItemSlotProps) => unknown
  marker?: (slotProps: AnchorMarkerSlotProps) => unknown
  empty?: () => unknown
}

export interface AnchorItemProps {
  entry: AnchorFilteredItem
  activeId?: string
  expanded: boolean
  highlighted: boolean
  placement: AnchorPlacement
  tooltipDelay: number
}

export interface AnchorItemEmits {
  select: [item: AnchorItem]
}

export interface AnchorItemSlots {
  item?: (slotProps: AnchorItemSlotProps) => unknown
  marker?: (slotProps: AnchorMarkerSlotProps) => unknown
}

export interface AnchorActiveSyncOptions {
  items: Ref<AnchorItem[]>
  resolveTarget: (id: string) => HTMLElement | null
  container: Ref<HTMLElement | null | undefined>
  host?: Ref<HTMLElement | null | undefined>
  activeId?: Ref<string | undefined>
  activeOffset?: Ref<number | undefined>
  onUpdateActiveId?: (value: string | undefined) => void
}

export interface AnchorFloatingOffsetOptions {
  container: Ref<HTMLElement | null | undefined>
  host: Ref<HTMLElement | null | undefined>
}

export interface AnchorOverlayInteractionsOptions {
  overlay: Ref<AnchorOverlayExpose | null>
  highlightedId: Ref<string | undefined>
  shouldAutoCollapse: Ref<boolean>
  handleNavigationKeydown: (event: KeyboardEvent) => boolean
  getHighlightedItem: () => AnchorItem | undefined
  onSelectItem: (itemId: string) => void
  setExpanded: (value: boolean) => void
}

export interface AnchorControllerOptions {
  items: Ref<AnchorItem[]>
  activeId: Ref<string | undefined>
  expanded: Ref<boolean | undefined>
  expandTrigger: Ref<AnchorExpandTrigger>
  searchQuery?: Ref<string | undefined>
  searchOptions?: Ref<AnchorSearchOptions | undefined>
  onUpdateExpanded?: (value: boolean) => void
  onUpdateSearchQuery?: (value: string) => void
}

export interface AnchorTargetFeedbackOptions {
  resolveTarget: (id: string) => HTMLElement | null
  feedbackClass: Ref<string | undefined>
  feedbackDuration: Ref<number | undefined>
}
