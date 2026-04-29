<script setup lang="ts">
import AnchorItem from './AnchorItem.vue'
import type { AnchorListEmits, AnchorListProps, AnchorListSlots } from '../internal.type'

defineOptions({ name: 'AnchorList' })

defineProps<AnchorListProps>()
const emit = defineEmits<AnchorListEmits>()
defineSlots<AnchorListSlots>()
</script>

<template>
  <ul class="tr-anchor__list" role="list">
    <li v-if="expanded && items.length === 0" class="tr-anchor__empty" aria-live="polite">
      <slot name="empty">{{ emptyText }}</slot>
    </li>

    <AnchorItem
      v-for="(entry, index) in items"
      :key="entry.item.id"
      :entry="entry"
      :active-id="activeId"
      :expanded="expanded"
      :highlighted="index === highlightedIndex"
      :placement="placement"
      :tooltip-delay="tooltipDelay"
      @select="emit('select', $event)"
    >
      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>

      <template v-if="$slots.marker" #marker="slotProps">
        <slot name="marker" v-bind="slotProps" />
      </template>
    </AnchorItem>
  </ul>
</template>

<style lang="less" scoped>
.tr-anchor {
  &__list {
    position: relative;
    z-index: 1;
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 6px 0;
  }

  &__empty {
    padding: 20px 12px;
    color: var(--tr-anchor-empty-color);
    font-size: var(--tr-font-size-sm);
    text-align: center;
  }
}
</style>
