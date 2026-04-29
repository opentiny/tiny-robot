<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import type { AnchorItemEmits, AnchorItemProps, AnchorItemSlots } from '../internal.type'

defineOptions({ name: 'AnchorItem' })

const props = defineProps<AnchorItemProps>()
const emit = defineEmits<AnchorItemEmits>()
defineSlots<AnchorItemSlots>()

const itemButtonRef = ref<HTMLButtonElement | null>(null)
const isHovered = ref(false)
const tooltipVisible = ref(false)
const { start: startTooltipTimer, stop: stopTooltipTimer } = useTimeoutFn(
  () => {
    requestAnimationFrame(() => {
      measureTooltipVisibility()
    })
  },
  () => Math.max(0, props.tooltipDelay),
  { immediate: false },
)

const active = computed(() => props.entry.item.id === props.activeId)
const itemClass = computed(() => [
  'tr-anchor__list-item',
  `is-${props.placement}`,
  {
    'is-active': active.value,
    'is-expanded': props.expanded,
    'is-highlighted': props.highlighted,
    'is-tooltip-visible': tooltipVisible.value,
  },
])

function isTextTruncated(element: HTMLElement | null | undefined) {
  return Boolean(element && element.scrollWidth > element.clientWidth)
}

function getLabelElement() {
  return itemButtonRef.value?.querySelector<HTMLElement>('.tr-anchor__item-label') ?? null
}

function measureTooltipVisibility() {
  tooltipVisible.value = props.expanded && isHovered.value && isTextTruncated(getLabelElement())
}

function scheduleTooltipVisibility() {
  stopTooltipTimer()
  tooltipVisible.value = false

  if (!props.expanded || !isHovered.value) {
    return
  }

  startTooltipTimer()
}

function clearTooltipState() {
  stopTooltipTimer()
  tooltipVisible.value = false
}

function handleMouseEnter() {
  isHovered.value = true
  scheduleTooltipVisibility()
}

function handleMouseLeave() {
  isHovered.value = false
  clearTooltipState()
}

function handleLabelTransitionEnd(event: TransitionEvent) {
  if (event.propertyName !== 'max-width') {
    return
  }

  if (isHovered.value) {
    measureTooltipVisibility()
  }
}

watch(
  () => props.expanded,
  (expanded) => {
    if (!expanded) {
      clearTooltipState()
      return
    }

    if (isHovered.value) {
      scheduleTooltipVisibility()
    }
  },
)
</script>

<template>
  <li :class="itemClass" :data-tooltip="entry.item.tooltipText || entry.item.label">
    <button
      ref="itemButtonRef"
      type="button"
      class="tr-anchor__item"
      :data-item-id="entry.item.id"
      :aria-current="active ? 'location' : undefined"
      :tabindex="highlighted ? 0 : -1"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="emit('select', entry.item)"
    >
      <span class="tr-anchor__marker-slot">
        <slot name="marker" :item="entry.item" :active="active">
          <span class="tr-anchor__marker" />
        </slot>
      </span>

      <span class="tr-anchor__item-content">
        <slot
          name="item"
          :item="entry.item"
          :segments="entry.segments"
          :active="active"
          :expanded="expanded"
          :highlighted="props.highlighted || isHovered"
        >
          <span class="tr-anchor__item-label" @transitionend="handleLabelTransitionEnd">
            <template v-for="(segment, segmentIndex) in entry.segments" :key="`${entry.item.id}-${segmentIndex}`">
              <mark v-if="segment.highlighted" class="tr-anchor__highlight">{{ segment.text }}</mark>
              <template v-else>{{ segment.text }}</template>
            </template>
          </span>
        </slot>
      </span>
    </button>
  </li>
</template>

<style lang="less" scoped>
.tr-anchor {
  &__list-item {
    position: relative;

    &::after {
      content: attr(data-tooltip);
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: var(--tr-z-index-tooltip);
      width: min(280px, 55vw);
      opacity: 0;
      pointer-events: none;
      padding: 6px 12px;
      border-radius: var(--tr-radius-md);
      background: var(--tr-anchor-tooltip-bg);
      color: var(--tr-anchor-tooltip-color);
      box-shadow: var(--tr-anchor-tooltip-shadow);
      transition: opacity 0.15s ease;
      font-size: var(--tr-font-size-sm);
      line-height: 1.5;
      text-align: left;
      white-space: normal;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      word-break: break-word;
    }

    &.is-right::after {
      right: calc(100% + 8px);
    }

    &.is-left::after {
      left: calc(100% + 8px);
    }

    &.is-tooltip-visible::after {
      opacity: 1;
    }

    &.is-active .tr-anchor__marker {
      background: var(--tr-anchor-marker-color-active);
      transform: scale(1.25);
    }

    &.is-active .tr-anchor__item-label {
      color: var(--tr-anchor-item-color-active);
    }
  }

  &__item {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: grid;
    align-items: center;
    column-gap: 0;
    padding: 6px 11px;
    border: 0;
    border-radius: var(--tr-anchor-item-radius);
    background: transparent;
    color: var(--tr-anchor-item-color);
    cursor: pointer;
    text-align: left;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:focus-visible {
      background: var(--tr-anchor-item-bg-hover);
      outline: 2px solid var(--tr-anchor-focus-ring);
      outline-offset: 0;
    }
  }

  &__list-item.is-right &__item {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'content marker';
    text-align: left;
  }

  &__list-item.is-left &__item {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas: 'marker content';
    text-align: left;
  }

  &__list-item.is-expanded:hover &__item {
    background: var(--tr-anchor-item-bg-hover);
  }

  &__list-item.is-expanded &__item {
    column-gap: 8px;
  }

  &__marker-slot {
    grid-area: marker;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--tr-anchor-marker-track-size);
    min-inline-size: var(--tr-anchor-marker-track-size);
    block-size: var(--tr-anchor-marker-track-size);
  }

  &__list-item.is-right &__marker-slot {
    justify-self: end;
  }

  &__list-item.is-left &__marker-slot {
    justify-self: start;
  }

  &__marker {
    width: var(--tr-anchor-marker-width);
    height: var(--tr-anchor-marker-height);
    border-radius: var(--tr-anchor-marker-radius);
    background: var(--tr-anchor-marker-color);
    transition:
      background-color 0.18s ease,
      transform 0.18s ease;
  }

  &__item-content {
    grid-area: content;
    min-width: 0;
    display: flex;
    overflow: hidden;
  }

  &__list-item.is-right &__item-content,
  &__list-item.is-left &__item-content {
    justify-content: flex-start;
  }

  &__item-label {
    flex: 1;
    font-size: var(--tr-anchor-item-label-font-size);
    font-weight: var(--tr-anchor-item-label-font-weight);
    line-height: var(--tr-anchor-item-label-line-height);
    letter-spacing: var(--tr-anchor-item-label-letter-spacing);
    overflow: hidden;
    max-width: 0;
    opacity: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition:
      max-width 0.22s ease,
      opacity 0.18s ease,
      color 0.18s ease;
  }

  &__list-item.is-expanded &__item-label {
    max-width: calc(var(--tr-anchor-width-expanded) - 48px);
    opacity: 1;
  }

  &__highlight {
    color: var(--tr-anchor-highlight-color);
    background: transparent;
    font-weight: var(--tr-font-weight-semibold);
  }
}
</style>
