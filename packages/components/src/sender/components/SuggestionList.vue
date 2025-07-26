<script setup lang="ts">
import { ref } from 'vue'
import { IconAssociate } from '@opentiny/tiny-robot-svgs'
import type { SuggestionTextPart } from '../index.type'

export interface Props {
  show: boolean
  suggestions: string[]
  popupStyle: Record<string, string | number>
  isItemHighlighted: (index: number) => boolean
  highlightSuggestionText: (item: string, inputValue: string) => SuggestionTextPart[]
  inputValue: string
}

const props = defineProps<Props>()

interface Emits {
  (e: 'item-hover', index: number): void
  (e: 'item-leave'): void
  (e: 'select', item: string): void
}

const emit = defineEmits<Emits>()

const suggestionsListRef = ref<HTMLElement | null>(null)

const handleItemHover = (index: number) => {
  emit('item-hover', index)
}

const handleItemLeave = () => {
  emit('item-leave')
}

const handleSelect = (item: string) => {
  emit('select', item)
}
</script>

<template>
  <Transition name="tiny-sender-slide-up">
    <div
      v-if="props.show && props.suggestions.length"
      ref="suggestionsListRef"
      class="suggestion-list"
      :style="props.popupStyle"
    >
      <div
        v-for="(item, index) in props.suggestions"
        :key="index"
        class="suggestion-list__item"
        :class="{ highlighted: props.isItemHighlighted(index) }"
        @mouseenter="handleItemHover(index)"
        @mouseleave="handleItemLeave"
        @mousedown.prevent="handleSelect(item)"
      >
        <IconAssociate class="suggestion-list__icon" />
        <span class="suggestion-list__text">
          <span
            v-for="(part, partIndex) in props.highlightSuggestionText(item, props.inputValue)"
            :key="partIndex"
            :class="{
              'suggestion-list__text--match': part.isMatch,
              'suggestion-list__text--normal': !part.isMatch,
            }"
            >{{ part.text }}</span
          >
        </span>
      </div>
    </div>
  </Transition>
</template>

<style lang="less">
:root {
  --tr-sender-suggestion-bg-color: #fff;
  --tr-sender-suggestion-box-shadow-color: rgba(0, 0, 0, 0.1);
  --tr-sender-suggestion-hover-bg-color: rgba(0, 0, 0, 0.04);
  --tr-sender-suggestion-item-font-size: 14px;
  --tr-sender-suggestion-item-icon-size: 16px;
  --tr-sender-suggestion-scrollbar-thumb-color: rgba(0, 0, 0, 0.2);
  --tr-sender-suggestion-scrollbar-thumb-hover-color: rgba(0, 0, 0, 0.3);
}
</style>

<style lang="less" scoped>
.suggestion-list {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 400px;
  background: var(--tr-sender-suggestion-bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--tr-sender-suggestion-box-shadow-color);
  z-index: 2000;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 12px;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--tr-sender-suggestion-scrollbar-thumb-color);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--tr-sender-suggestion-scrollbar-thumb-hover-color);
  }

  scrollbar-color: var(--tr-sender-suggestion-scrollbar-thumb-color) transparent;

  &__item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    font-size: var(--tr-sender-suggestion-item-font-size);
    gap: 8px;

    &.highlighted {
      background-color: var(--tr-sender-suggestion-hover-bg-color);
      border-radius: 8px;
    }
  }

  &__icon {
    font-size: var(--tr-sender-suggestion-item-icon-size);
    text-align: center;
  }

  &__text {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--match {
      font-weight: 600;
    }

    &--normal {
      font-weight: 400;
    }
  }
}
</style>
