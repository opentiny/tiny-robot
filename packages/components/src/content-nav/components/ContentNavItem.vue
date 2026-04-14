<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ContentNavItemEmits, ContentNavItemProps, ContentNavItemSlots } from '../internal.type'

defineOptions({ name: 'ContentNavItem' })

const props = defineProps<ContentNavItemProps>()
const emit = defineEmits<ContentNavItemEmits>()
defineSlots<ContentNavItemSlots>()

const isHovered = ref(false)
const isFocused = ref(false)
const tooltipVisible = ref(false)

const active = computed(() => props.entry.item.id === props.activeId)
const itemClass = computed(() => [
  'tr-content-nav__list-item',
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

function updateTooltipState(event: MouseEvent | FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const labelEl = currentTarget?.querySelector<HTMLElement>('.tr-content-nav__item-label')
  tooltipVisible.value = isTextTruncated(labelEl)
}

function clearTooltipState() {
  tooltipVisible.value = false
}
</script>

<template>
  <li :class="itemClass" :data-tooltip="entry.item.tooltipText || entry.item.label">
    <button
      type="button"
      class="tr-content-nav__item"
      :data-item-id="entry.item.id"
      :aria-current="active ? 'location' : undefined"
      :tabindex="highlighted ? 0 : -1"
      @mouseenter="
        (event) => {
          isHovered = true
          updateTooltipState(event)
        }
      "
      @mouseleave="
        () => {
          isHovered = false
          clearTooltipState()
        }
      "
      @focus="
        (event) => {
          isFocused = true
          updateTooltipState(event)
        }
      "
      @blur="
        () => {
          isFocused = false
          clearTooltipState()
        }
      "
      @click="emit('select', entry.item)"
    >
      <span class="tr-content-nav__marker-slot">
        <slot name="marker" :item="entry.item" :active="active">
          <span class="tr-content-nav__marker" />
        </slot>
      </span>

      <span class="tr-content-nav__item-content">
        <slot
          name="item"
          :item="entry.item"
          :segments="entry.segments"
          :active="active"
          :expanded="expanded"
          :highlighted="props.highlighted || isHovered || isFocused"
        >
          <span class="tr-content-nav__item-label">
            <template v-for="(segment, segmentIndex) in entry.segments" :key="`${entry.item.id}-${segmentIndex}`">
              <mark v-if="segment.highlighted" class="tr-content-nav__highlight">{{ segment.text }}</mark>
              <template v-else>{{ segment.text }}</template>
            </template>
          </span>
        </slot>
      </span>
    </button>
  </li>
</template>

<style lang="less" scoped>
.tr-content-nav {
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
      background: var(--tr-content-nav-tooltip-bg);
      color: var(--tr-content-nav-tooltip-color);
      box-shadow: var(--tr-content-nav-tooltip-shadow);
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

    &.is-active .tr-content-nav__marker {
      background: var(--tr-content-nav-marker-color-active);
      transform: scale(1.25);
    }

    &.is-active .tr-content-nav__item-label {
      color: var(--tr-content-nav-item-color-active);
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
    border-radius: var(--tr-content-nav-item-radius);
    background: transparent;
    color: var(--tr-content-nav-item-color);
    cursor: pointer;
    text-align: left;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:focus-visible {
      background: var(--tr-content-nav-item-bg-hover);
      outline: 2px solid var(--tr-content-nav-focus-ring);
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
    background: var(--tr-content-nav-item-bg-hover);
  }

  &__list-item.is-expanded &__item {
    column-gap: 8px;
  }

  &__marker-slot {
    grid-area: marker;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--tr-content-nav-marker-track-size);
    min-inline-size: var(--tr-content-nav-marker-track-size);
    block-size: var(--tr-content-nav-marker-track-size);
  }

  &__list-item.is-right &__marker-slot {
    justify-self: end;
  }

  &__list-item.is-left &__marker-slot {
    justify-self: start;
  }

  &__marker {
    width: var(--tr-content-nav-marker-width);
    height: var(--tr-content-nav-marker-height);
    border-radius: var(--tr-content-nav-marker-radius);
    background: var(--tr-content-nav-marker-color);
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
    max-width: calc(var(--tr-content-nav-width-expanded) - 48px);
    opacity: 1;
  }

  &__highlight {
    color: var(--tr-content-nav-highlight-color);
    background: transparent;
    font-weight: var(--tr-font-weight-semibold);
  }
}
</style>
