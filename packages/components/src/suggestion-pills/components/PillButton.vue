<script lang="ts" setup>
import { SuggestionPillItem } from '../index.type'

defineProps<{ item: SuggestionPillItem }>()
</script>

<template>
  <button :class="['tr-suggestion-pills__item', { 'only-icon': !item.text }]">
    <component :is="item.icon" class="tr-suggestion-pills__item_icon" />
    <span v-if="item.text" class="tr-suggestion-pills__item_text">
      {{ item.text }}
    </span>
  </button>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 16px;
  border-radius: 999px;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }

  &.only-icon {
    padding: 8px;
  }

  .tr-suggestion-pills__item_icon {
    width: 16px;
    height: 16px;
  }

  .tr-suggestion-pills__item_text {
    font-size: 14px;
    line-height: 22px;
    color: rgb(25, 25, 25);
  }
}
</style>
