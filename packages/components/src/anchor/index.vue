<script setup lang="ts">
import { useEventListener, useResizeObserver, useTimeoutFn } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, toRefs, useAttrs, watch } from 'vue'
import AnchorList from './components/AnchorList.vue'
import AnchorOverlay from './components/AnchorOverlay.vue'
import AnchorSearch from './components/AnchorSearch.vue'
import type { AnchorOverlayExpose } from './internal.type'
import {
  useActiveSync,
  useFloatingOffset,
  useNavController,
  useOverlayInteractions,
  useTargetFeedback,
} from './composables/index'
import type { AnchorEmits, AnchorProps, AnchorSearchOptions, AnchorSlots } from './index.type'
import { resolveAnchorScrollRoot } from './utils/scroll'
import { queryAnchorItemById, queryAnchorTargetById } from './utils/target'
import { revealAnchorItem } from './utils/reveal'

defineOptions({
  name: 'TrAnchor',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AnchorProps>(), {
  placement: 'right',
  expandTrigger: 'hover',
  hoverExpandDelay: 300,
  activeOffset: 120,
  tooltipDelay: 260,
  targetFeedbackDuration: 700,
  emptyText: 'No matching items',
})

const emit = defineEmits<AnchorEmits>()
defineSlots<AnchorSlots>()
const attrs = useAttrs()
const {
  activeId,
  activeOffset,
  emptyText,
  expandTrigger,
  expanded,
  items,
  placement,
  searchOptions,
  searchQuery,
  scrollContainer,
  targetFeedbackClass,
  targetFeedbackDuration,
  tooltipDelay,
} = toRefs(props)

const overlayShellRef = ref<AnchorOverlayExpose | null>(null)

const hostRef = computed(() => overlayShellRef.value?.hostEl ?? null)
const resolvedSearchOptions = computed<AnchorSearchOptions | undefined>(() => searchOptions.value)
const searchSlotOptions = computed<AnchorSearchOptions>(() => resolvedSearchOptions.value ?? {})

function resolveTargetFromItems(id: string) {
  const container = scrollContainer.value
  if (container) {
    return queryAnchorTargetById(container, id) ?? null
  }

  return queryAnchorTargetById(document, id) ?? null
}

const itemsRef = computed(() => items.value)

const active = useActiveSync({
  items: itemsRef,
  resolveTarget: resolveTargetFromItems,
  container: scrollContainer,
  host: hostRef,
  activeId,
  activeOffset,
  onUpdateActiveId: (value) => emit('update:activeId', value),
})

const controller = useNavController({
  items: itemsRef,
  activeId: active.activeId,
  expanded,
  expandTrigger,
  searchQuery,
  searchOptions,
  onUpdateExpanded: (value) => emit('update:expanded', value),
  onUpdateSearchQuery: (value) => emit('update:searchQuery', value),
})

const shouldRender = computed(() => itemsRef.value.length > 0)
const hasSearchSection = computed(() => Boolean(resolvedSearchOptions.value) && controller.expanded.value)
const shouldAutoToggleExpanded = computed(() => expandTrigger.value === 'hover')
const scrollEventTarget = computed(() => resolveAnchorScrollRoot(scrollContainer.value))
const floating = useFloatingOffset({
  expanded: controller.expanded,
  container: scrollContainer,
  host: hostRef,
})
const targetFeedback = useTargetFeedback({
  resolveTarget: resolveTargetFromItems,
  feedbackClass: targetFeedbackClass,
  feedbackDuration: targetFeedbackDuration,
})

function setExpanded(value: boolean) {
  controller.setExpanded(value)
}

function setSearchQuery(value: string) {
  controller.setSearchQuery(value)
}

function handleSelect(itemId: string) {
  const target = itemsRef.value.find((item) => item.id === itemId)
  if (!target) {
    return
  }

  active.scrollTo(itemId)
  targetFeedback.activate(itemId)
  scheduleMeasure()
  emit('select', target)
}

const interactions = useOverlayInteractions({
  overlay: overlayShellRef,
  highlightedId: controller.highlightedId,
  shouldAutoCollapse: shouldAutoToggleExpanded,
  handleNavigationKeydown: controller.handleNavigationKeydown,
  getHighlightedItem: controller.getHighlightedItem,
  onSelectItem: handleSelect,
  setExpanded,
})

const navRef = computed(() => overlayShellRef.value?.navEl ?? null)
const retainedHover = shallowRef<{ item: HTMLElement; x: number; y: number }>()
const retainedHoverId = computed(() => {
  const id = retainedHover.value?.item.dataset.itemId
  return id !== undefined && controller.filteredItems.value.some((entry) => entry.item.id === id) ? id : undefined
})

useEventListener(
  navRef,
  ['wheel', 'touchmove'],
  () => {
    retainedHover.value = undefined
    interactions.isBrowsing.value = true
    floating.finishTransition()
  },
  { passive: true },
)

function revealCurrentItem() {
  nextTick(() => {
    const nav = navRef.value
    const item = nav && active.activeId.value ? queryAnchorItemById(nav, active.activeId.value) : null
    if (nav && item && !interactions.isBrowsing.value) revealAnchorItem(nav, item)
  })
}

watch([active.activeId, navRef], revealCurrentItem, { immediate: true })

let hoverEvent: MouseEvent | undefined
const { start: startHoverExpansion, stop: stopHoverExpansion } = useTimeoutFn(
  expandFromHover,
  () => props.hoverExpandDelay,
  { immediate: false },
)

function expandFromHover() {
  const item = floating.pinItem(hoverEvent)
  // A centered panel can change which row is under a stationary pointer as the rows grow.
  if (hoverEvent && item?.contains(document.elementFromPoint(hoverEvent.clientX, hoverEvent.clientY))) {
    retainedHover.value = { item, x: hoverEvent.clientX, y: hoverEvent.clientY }
  }
  hoverEvent = undefined
  setExpanded(true)
}

function cancelHoverExpansion() {
  stopHoverExpansion()
  hoverEvent = undefined
}

watch([hostRef, expandTrigger], () => {
  cancelHoverExpansion()
  retainedHover.value = undefined
})
watch(controller.expanded, (isExpanded) => {
  if (!isExpanded) retainedHover.value = undefined
})

function handleMouseEnter(event: MouseEvent) {
  interactions.isBrowsing.value = true
  if (!shouldAutoToggleExpanded.value || controller.expanded.value) return

  hoverEvent = event
  if (props.hoverExpandDelay <= 0) expandFromHover()
  else startHoverExpansion()
}

function handleMouseMove(event: MouseEvent) {
  if (hoverEvent) hoverEvent = event
  const retained = retainedHover.value
  if (retained && (event.clientX !== retained.x || event.clientY !== retained.y)) {
    retainedHover.value = undefined
  }
}

function handleMouseLeave() {
  cancelHoverExpansion()
  retainedHover.value = undefined
  interactions.handleMouseLeave()
}

function handleRetainedHoverPress(event: MouseEvent) {
  const retained = retainedHover.value
  const id = retainedHoverId.value
  if (
    !retained ||
    id === undefined ||
    event.button !== 0 ||
    event.detail === 0 ||
    event.clientX !== retained.x ||
    event.clientY !== retained.y ||
    !navRef.value?.contains(retained.item) ||
    retained.item.contains(event.target as Node)
  ) {
    return
  }

  // Prevent focus and activation from going to the row that moved under the pointer.
  event.preventDefault()
  if (event.type === 'click') {
    event.stopPropagation()
    retained.item.focus({ preventScroll: true })
    handleSelect(id)
  }
}

function handleKeydown(event: KeyboardEvent) {
  retainedHover.value = undefined
  interactions.handleKeydown(event)
}

function handleFocusIn(event: FocusEvent) {
  cancelHoverExpansion()
  interactions.isBrowsing.value = true
  if (shouldAutoToggleExpanded.value) {
    if (!controller.expanded.value) floating.pinItem(event)
    setExpanded(true)
  }
}

let scheduledFrame: number | null = null
let shouldRevealFocus = false

function scheduleResizeMeasure() {
  shouldRevealFocus = true
  scheduleMeasure()
}

function scheduleMeasure() {
  if (scheduledFrame !== null) {
    cancelAnimationFrame(scheduledFrame)
  }

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = null
    active.sync()
    floating.sync()
    revealCurrentItem()
    if (shouldRevealFocus) {
      shouldRevealFocus = false
      nextTick(() => {
        const nav = navRef.value
        const focused = nav?.querySelector<HTMLElement>('.tr-anchor__item:focus')
        if (nav && focused) revealAnchorItem(nav, focused)
      })
    }
  })
}

useEventListener(scrollEventTarget, 'scroll', scheduleMeasure, { passive: true })
useEventListener(scrollEventTarget, 'wheel', active.handleUserScrollIntent, { passive: true })
useEventListener(scrollEventTarget, 'touchmove', active.handleUserScrollIntent, { passive: true })
useEventListener('keydown', active.handleScrollIntentKeydown)
useEventListener('scroll', scheduleMeasure, { passive: true, capture: true })
useEventListener('resize', scheduleResizeMeasure, { passive: true })
useResizeObserver(scrollContainer, () => {
  scheduleResizeMeasure()
})
useResizeObserver(floating.resizeTargets, () => {
  scheduleResizeMeasure()
})

watch(
  () => scrollContainer.value,
  () => {
    active.clearPendingScroll()
    scheduleMeasure()
  },
  { immediate: true },
)

watch(
  () => hostRef.value,
  () => {
    scheduleMeasure()
  },
)

watch(
  () => itemsRef.value.map((item) => item.id).join(','),
  () => {
    active.clearPendingScroll()
    scheduleMeasure()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (scheduledFrame !== null) {
    cancelAnimationFrame(scheduledFrame)
  }

  active.clearPendingScroll()
})
</script>

<template>
  <AnchorOverlay
    v-if="shouldRender"
    ref="overlayShellRef"
    v-bind="attrs"
    :expanded="controller.expanded.value"
    :placement="placement"
    :floating-offset="floating.offset.value"
    :available-height="floating.availableHeight.value"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @mousedown.capture="handleRetainedHoverPress"
    @click.capture="handleRetainedHoverPress"
    @focusin="handleFocusIn"
    @focusout="interactions.handleFocusOut"
    @keydown="handleKeydown"
  >
    <template v-if="hasSearchSection" #search>
      <slot
        name="search"
        :searchQuery="controller.searchQuery.value"
        :setSearchQuery="setSearchQuery"
        :searchOptions="searchSlotOptions"
      >
        <AnchorSearch
          :search-query="controller.searchQuery.value"
          :search-options="searchSlotOptions"
          @update:search-query="setSearchQuery"
        />
      </slot>
    </template>

    <AnchorList
      :items="controller.filteredItems.value"
      :active-id="active.activeId.value"
      :expanded="controller.expanded.value"
      :highlighted-index="controller.highlightedIndex.value"
      :retained-hover-id="retainedHoverId"
      :placement="placement"
      :tooltip-delay="tooltipDelay"
      :empty-text="emptyText"
      @select="handleSelect($event.id)"
    >
      <template v-if="$slots.marker" #marker="slotProps">
        <slot name="marker" v-bind="slotProps" />
      </template>

      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>

      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
    </AnchorList>
  </AnchorOverlay>
</template>
