<script setup lang="ts">
import { useSlots, watch } from 'vue'
import type {
  ExtensionCardActionEvent,
  ExtensionCardGridEmits,
  ExtensionCardGridItem,
  ExtensionCardGridProps,
  ExtensionCardGridSlots,
} from '../index.type'
import ExtensionCard from './ExtensionCard.vue'

const props = withDefaults(defineProps<ExtensionCardGridProps>(), {
  emptyText: '暂无内容',
  nameClickable: undefined,
  overflowMenuShowIcons: undefined,
})

const slots = useSlots()
defineSlots<ExtensionCardGridSlots>()

const emit = defineEmits<ExtensionCardGridEmits>()

const getCardProps = (item: ExtensionCardGridItem) => {
  const { id, ...cardProps } = item

  void id
  return {
    ...cardProps,
    primaryActionsLimit: item.primaryActionsLimit ?? props.primaryActionsLimit,
    nameClickable: item.nameClickable ?? props.nameClickable,
    overflowMenuLabel: item.overflowMenuLabel ?? props.overflowMenuLabel,
    overflowMenuPlacement: item.overflowMenuPlacement ?? props.overflowMenuPlacement,
    overflowMenuShowIcons: item.overflowMenuShowIcons ?? props.overflowMenuShowIcons,
  }
}

if (import.meta.env.DEV) {
  let lastDuplicateIdSet: string | undefined

  const getDuplicateIdSet = () => {
    const seenIds = new Set<string>()
    const duplicateIds = new Set<string>()

    for (const item of props.items) {
      if (seenIds.has(item.id)) duplicateIds.add(item.id)
      seenIds.add(item.id)
    }

    const duplicateIdList = [...duplicateIds].sort()

    return duplicateIdList.length ? duplicateIdList.join('\u0000') : undefined
  }

  watch(
    getDuplicateIdSet,
    (duplicateIdSet) => {
      if (duplicateIdSet === lastDuplicateIdSet) return

      lastDuplicateIdSet = duplicateIdSet
      if (duplicateIdSet === undefined) return

      console.warn('[ExtensionManager.CardGrid] Item ids must be unique:', duplicateIdSet.split('\u0000'))
    },
    { immediate: true },
  )
}

const handleCardAction = (itemId: string, action: ExtensionCardActionEvent) => {
  emit('action', { itemId, action })
}

const handleCardNameClick = (itemId: string, event: MouseEvent | KeyboardEvent) => {
  emit('name-click', { itemId, event })
}
</script>

<template>
  <ul class="tr-extension-card-grid">
    <li v-if="items.length === 0" class="tr-extension-card-grid__empty">
      <slot name="empty">{{ emptyText }}</slot>
    </li>

    <template v-else>
      <li v-for="(item, index) in items" :key="item.id" class="tr-extension-card-grid__item" :data-card-id="item.id">
        <slot v-if="slots.item" name="item" :item="item" :index="index" />
        <ExtensionCard
          v-else
          v-bind="getCardProps(item)"
          @action="handleCardAction(item.id, $event)"
          @name-click="handleCardNameClick(item.id, $event)"
        />
      </li>
    </template>
  </ul>
</template>

<style lang="less" scoped>
.tr-extension-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--tr-extension-card-grid-card-min-width, 320px), 1fr));
  gap: 12px 16px;
  margin: 0;
  padding: 12px 0 4px;
  list-style: none;
}

.tr-extension-card-grid__item {
  min-width: 0;
}

.tr-extension-card-grid__empty {
  grid-column: 1 / -1;
  padding: 28px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
