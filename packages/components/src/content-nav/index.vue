<script setup lang="ts">
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, toRefs, useAttrs, watch } from 'vue'
import ContentNavList from './components/ContentNavList.vue'
import ContentNavOverlay from './components/ContentNavOverlay.vue'
import ContentNavSearch from './components/ContentNavSearch.vue'
import { queryContentNavTargetById } from './target'
import type { ContentNavOverlayExpose } from './internal.type'
import { useActiveSync, useFloatingOffset, useNavState, useOverlayInteractions } from './composables/index'
import type { ContentNavEmits, ContentNavProps, ContentNavSearchOptions, ContentNavSlots } from './index.type'

defineOptions({
  name: 'TrContentNav',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ContentNavProps>(), {
  placement: 'right',
  expandTrigger: 'hover',
  search: false,
  emptyText: 'No matching items',
})

const emit = defineEmits<ContentNavEmits>()
defineSlots<ContentNavSlots>()
const attrs = useAttrs()
const { activeId, emptyText, expandTrigger, expanded, items, placement, query, scrollContainer, search } = toRefs(props)

const overlayShellRef = ref<ContentNavOverlayExpose | null>(null)

const hostRef = computed(() => overlayShellRef.value?.hostEl ?? null)
const resolvedSearchOptions = computed(() => (search.value ? search.value : undefined))
const searchSlotOptions = computed<ContentNavSearchOptions>(() => resolvedSearchOptions.value ?? {})

function resolveTargetFromItems(id: string) {
  const container = scrollContainer.value
  if (container) {
    return queryContentNavTargetById(container, id) ?? null
  }

  return queryContentNavTargetById(document, id) ?? null
}

const itemsRef = computed(() => items.value)

const active = useActiveSync({
  items: itemsRef,
  resolveTarget: resolveTargetFromItems,
  container: scrollContainer,
  activeId,
  onUpdateActiveId: (value) => emit('update:activeId', value),
})

const state = useNavState({
  items: itemsRef,
  activeId: active.activeId,
  expanded,
  expandTrigger,
  query,
  search,
  onUpdateExpanded: (value) => emit('update:expanded', value),
  onUpdateQuery: (value) => emit('update:query', value),
})

const shouldRender = computed(() => itemsRef.value.length > 0)
const hasSearchSection = computed(() => Boolean(resolvedSearchOptions.value) && state.expanded.value)
const shouldAutoToggleExpanded = computed(() => expandTrigger.value === 'hover')
const floating = useFloatingOffset({
  container: scrollContainer,
  host: hostRef,
})

function setExpanded(value: boolean) {
  state.setExpanded(value)
}

function setQuery(value: string) {
  state.setQuery(value)
}

function handleSelect(itemId: string) {
  const target = itemsRef.value.find((item) => item.id === itemId)
  if (!target) {
    return
  }

  active.scrollTo(itemId)
  scheduleMeasure()
  emit('select', target)
  emit('activate', target)
}

const interactions = useOverlayInteractions({
  overlay: overlayShellRef,
  highlightedId: state.highlightedId,
  shouldAutoCollapse: shouldAutoToggleExpanded,
  handleNavigationKeydown: state.handleNavigationKeydown,
  getHighlightedItem: state.getHighlightedItem,
  onSelectItem: handleSelect,
  setExpanded,
})

let scheduledFrame: number | null = null

function scheduleMeasure() {
  if (scheduledFrame !== null) {
    cancelAnimationFrame(scheduledFrame)
  }

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = null
    active.sync()
    floating.sync()
  })
}

useEventListener(scrollContainer, 'scroll', scheduleMeasure, { passive: true })
useEventListener('resize', scheduleMeasure, { passive: true })
useResizeObserver(scrollContainer, () => {
  scheduleMeasure()
})
useResizeObserver(floating.resizeTargets, () => {
  scheduleMeasure()
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
  <ContentNavOverlay
    v-if="shouldRender"
    ref="overlayShellRef"
    v-bind="attrs"
    :expanded="state.expanded.value"
    :placement="placement"
    :floating-offset="floating.offset.value"
    @mouseenter="shouldAutoToggleExpanded && setExpanded(true)"
    @mouseleave="interactions.handleMouseLeave"
    @focusin="shouldAutoToggleExpanded && setExpanded(true)"
    @focusout="interactions.handleFocusOut"
    @keydown="interactions.handleKeydown"
  >
    <template v-if="hasSearchSection" #search>
      <slot name="search" :query="state.query.value" :setQuery="setQuery" :options="searchSlotOptions">
        <ContentNavSearch :query="state.query.value" :options="searchSlotOptions" @update:query="setQuery" />
      </slot>
    </template>

    <ContentNavList
      :items="state.filteredItems.value"
      :active-id="active.activeId.value"
      :expanded="state.expanded.value"
      :highlighted-index="state.highlightedIndex.value"
      :placement="placement"
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
    </ContentNavList>
  </ContentNavOverlay>
</template>
