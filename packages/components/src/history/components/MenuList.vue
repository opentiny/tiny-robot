<script setup lang="ts">
import { IconDelete, IconEditPen } from '@opentiny/tiny-robot-svgs'

const emit = defineEmits<{
  'item-click': [item: { id: string; text: string }]
}>()

const items = [
  {
    id: 'rename',
    text: '重命名',
    icon: IconEditPen,
  },
  {
    id: 'delete',
    text: '删除',
    icon: IconDelete,
  },
]

const handleItemClick = (item: { id: string; text: string }) => {
  emit('item-click', item)
}
</script>

<template>
  <ul class="tr-history__menu-list">
    <li class="tr-history__menu-list__item" v-for="item in items" :key="item.id" @click="handleItemClick(item)">
      <component :is="item.icon" />
      <span>{{ item.text }}</span>
    </li>
  </ul>
</template>

<style lang="less">
:root {
  --tr-history-menu-list-bg: var(--tr-container-bg-default);
  --tr-history-menu-list-bg-hover: var(--tr-container-bg-hover);
  --tr-history-menu-list-box-shadow: var(--tr-shadow-sm);

  --tr-history-menu-item-color: var(--tr-text-primary);
  --tr-history-menu-item-text-color-hover: var(--tr-color-primary);
}
</style>

<style lang="less" scoped>
.tr-history__menu-list {
  position: fixed;
  z-index: var(--tr-z-index-dropdown);
  list-style: none;
  padding: 8px 0;
  border-radius: 8px;
  background: var(--tr-history-menu-list-bg);
  box-shadow: var(--tr-history-menu-list-box-shadow);

  .tr-history__menu-list__item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--tr-history-menu-item-color);
    white-space: nowrap;

    & > svg {
      font-size: 16px;
    }

    & > span {
      font-size: 12px;
      line-height: 18px;
    }

    &:hover {
      background: var(--tr-history-menu-list-bg-hover);

      & > span {
        color: var(--tr-history-menu-item-text-color-hover);
      }
    }
  }
}
</style>
