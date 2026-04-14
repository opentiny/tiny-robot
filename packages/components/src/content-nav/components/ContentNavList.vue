<script setup lang="ts">
import ContentNavItem from './ContentNavItem.vue'
import type { ContentNavListEmits, ContentNavListProps, ContentNavListSlots } from '../internal.type'

defineOptions({ name: 'ContentNavList' })

defineProps<ContentNavListProps>()
const emit = defineEmits<ContentNavListEmits>()
defineSlots<ContentNavListSlots>()
</script>

<template>
  <ul class="tr-content-nav__list" role="list">
    <li v-if="expanded && items.length === 0" class="tr-content-nav__empty" aria-live="polite">
      <slot name="empty">{{ emptyText }}</slot>
    </li>

    <ContentNavItem
      v-for="(entry, index) in items"
      :key="entry.item.id"
      :entry="entry"
      :active-id="activeId"
      :expanded="expanded"
      :highlighted="index === highlightedIndex"
      :placement="placement"
      @select="emit('select', $event)"
    >
      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>

      <template v-if="$slots.marker" #marker="slotProps">
        <slot name="marker" v-bind="slotProps" />
      </template>
    </ContentNavItem>
  </ul>
</template>

<style lang="less" scoped>
.tr-content-nav {
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
    color: var(--tr-content-nav-empty-color);
    font-size: var(--tr-font-size-sm);
    text-align: center;
  }
}
</style>
