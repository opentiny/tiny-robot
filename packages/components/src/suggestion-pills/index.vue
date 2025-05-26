<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import { SuggestionPillProps } from './index.type'

const props = defineProps<SuggestionPillProps>()

const containerRef = useTemplateRef('container')

const { arrivedState } = useScroll(containerRef)

const maskImage = computed(() => {
  if (arrivedState.left) {
    return 'linear-gradient(to right, black 95%, transparent)'
  }

  if (arrivedState.right) {
    return 'linear-gradient(to left, black 95%, transparent)'
  }

  return 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
})
</script>

<template>
  <div class="tr-suggestion-pills__container" ref="container">
    <button
      v-for="item in props.items"
      :key="item.id"
      :class="['tr-suggestion-pills__item', { 'only-icon': !item.text }]"
    >
      <component :is="item.icon" class="tr-suggestion-pills__item_icon" />
      <span v-if="item.text" class="tr-suggestion-pills__item_text">
        {{ item.text }}
      </span>
    </button>
  </div>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__container {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  mask-image: v-bind('maskImage');
  mask-repeat: no-repeat;

  .tr-suggestion-pills__item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 16px;
    border-radius: 999px;
    background-color: rgb(255, 255, 255);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
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
}
</style>
