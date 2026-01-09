<script setup lang="ts">
import { ref, watch } from 'vue'
import { IconAssociate } from '@opentiny/tiny-robot-svgs'
import { processHighlights } from './utils/highlight'
import type { SenderSuggestionItem } from './types'

/**
 * 建议列表组件 Props
 */
export interface Props {
  /**
   * 是否显示
   */
  show: boolean

  /**
   * 建议项列表
   */
  suggestions: SenderSuggestionItem[]

  /**
   * 弹窗样式
   */
  popupStyle: Record<string, string | number>

  /**
   * 键盘选中的索引
   */
  activeKeyboardIndex: number

  /**
   * 鼠标悬停的索引
   */
  activeMouseIndex: number

  /**
   * 用户输入的文本
   */
  inputValue: string

  /**
   * 选择回调函数
   */
  onSelect?: (content: string) => void

  /**
   * 鼠标进入回调函数
   */
  onMouseEnter?: (index: number) => void

  /**
   * 鼠标离开回调函数
   */
  onMouseLeave?: () => void
}

const props = defineProps<Props>()

const suggestionsListRef = ref<HTMLElement | null>(null)

/**
 * 检查项是否高亮
 */
const isItemHighlighted = (index: number): boolean => {
  return index === props.activeKeyboardIndex || index === props.activeMouseIndex
}

/**
 * 处理项鼠标进入
 */
const handleItemHover = (index: number) => {
  props.onMouseEnter?.(index)
}

/**
 * 处理项鼠标离开
 */
const handleItemLeave = () => {
  props.onMouseLeave?.()
}

/**
 * 处理项选择
 */
const handleSelect = (content: string) => {
  props.onSelect?.(content)
}

/**
 * 监听键盘选中索引变化，自动滚动到视图
 */
watch(
  () => props.activeKeyboardIndex,
  (newIndex) => {
    if (newIndex !== -1 && suggestionsListRef.value) {
      const itemElement = suggestionsListRef.value.children[newIndex] as HTMLElement | undefined
      if (itemElement) {
        itemElement.scrollIntoView({ block: 'nearest' })
      }
    }
  },
)
</script>

<template>
  <Transition name="suggestion-slide-up">
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
        :class="{ highlighted: isItemHighlighted(index) }"
        @mouseenter="handleItemHover(index)"
        @mouseleave="handleItemLeave"
        @click="handleSelect(item.content)"
      >
        <IconAssociate class="suggestion-list__icon" />
        <span class="suggestion-list__text">
          <span
            v-for="(part, partIndex) in processHighlights(item, props.inputValue)"
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

<style lang="less" scoped>
.suggestion-list {
  background: var(--tr-suggestion-bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--tr-suggestion-box-shadow-color);
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
    background-color: var(--tr-suggestion-scrollbar-thumb-color);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--tr-suggestion-scrollbar-thumb-hover-color);
  }

  scrollbar-color: var(--tr-suggestion-scrollbar-thumb-color) transparent;

  &__item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    font-size: var(--tr-suggestion-item-font-size);
    gap: 8px;

    &.highlighted {
      background-color: var(--tr-suggestion-hover-bg-color);
      border-radius: 4px;
    }
  }

  &__icon {
    font-size: var(--tr-suggestion-item-icon-size);
    text-align: center;
    color: var(--tr-suggestion-text-color);
  }

  &__text {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--tr-suggestion-text-color);

    &--match {
      font-weight: 600;
    }

    &--normal {
      font-weight: 400;
    }
  }
}

.suggestion-slide-up-enter-active,
.suggestion-slide-up-leave-active {
  transition: all 0.2s ease;
}

.suggestion-slide-up-enter-from,
.suggestion-slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
