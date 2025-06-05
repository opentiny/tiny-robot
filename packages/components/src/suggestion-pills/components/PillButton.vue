<script lang="ts" setup>
import { computed } from 'vue'
import { SuggestionPillButtonProps, SuggestionPillButtonSlots } from '../index.type'

const props = defineProps<SuggestionPillButtonProps>()

const slots = defineSlots<SuggestionPillButtonSlots>()

const hasIcon = computed(() => Boolean(slots.icon || props.item?.icon))
const hasText = computed(() => Boolean(slots.default || props.item?.text))
const onlyIcon = computed(() => hasIcon.value && !hasText.value)
</script>

<template>
  <button :class="['tr-suggestion-pills__item', { 'only-icon': onlyIcon }]">
    <slot name="icon">
      <component :is="item?.icon" class="tr-suggestion-pills__item_icon" />
    </slot>
    <slot>
      <span v-if="item?.text">
        {{ item.text }}
      </span>
    </slot>
  </button>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 16px;
  border-radius: 999px;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: background-color 0.3s ease;
  font-size: 14px;
  line-height: 22px;
  color: rgb(25, 25, 25);

  &:hover {
    background-color: rgb(235, 235, 235);
  }

  &.only-icon {
    padding: 8px;
  }

  .tr-suggestion-pills__item_icon {
    width: 16px;
    height: 16px;
  }
}
</style>
