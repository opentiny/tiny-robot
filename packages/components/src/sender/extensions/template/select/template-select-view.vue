<script setup lang="ts">
import { Editor } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { TemplateSelectDropdownPluginKey } from './plugins'
import type { SelectOption } from '../types'
import { closeAllDropdowns, setupClickOutside } from './dropdown-manager'

interface NodeAttrs {
  id: string
  placeholder: string
  options: SelectOption[]
  value?: string
}

interface Props {
  node: {
    attrs: NodeAttrs
  }
  updateAttributes: (attrs: Record<string, unknown>) => void
  editor: Editor
}

const props = defineProps<Props>()

// 状态管理
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
let cleanupClickOutside: (() => void) | null = null
let cleanupAutoUpdate: (() => void) | null = null

// 计算属性
const selectedOption = computed(() => {
  return props.node.attrs.options.find((opt) => opt.value === props.node.attrs.value)
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.node.attrs.placeholder
})

const isPlaceholder = computed(() => {
  return !props.node.attrs.value
})

// 方法
const toggleDropdown = () => {
  if (showDropdown.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  // 关闭其他下拉菜单（单例模式）
  closeAllDropdowns()

  showDropdown.value = true

  // 更新 ProseMirror 插件状态
  if (props.editor?.view) {
    const view = props.editor.view
    const tr = view.state.tr
    tr.setMeta(TemplateSelectDropdownPluginKey, {
      type: 'open',
      selectId: props.node.attrs.id,
    })
    view.dispatch(tr)
  }

  // 设置高亮索引：如果有选中值，高亮对应选项；否则不高亮任何选项
  if (props.node.attrs.value) {
    highlightedIndex.value = props.node.attrs.options.findIndex((opt) => opt.value === props.node.attrs.value)
  } else {
    highlightedIndex.value = -1 // 没有选中值时，不高亮任何选项
  }

  // 等待 DOM 更新后计算位置
  await nextTick()
  updatePosition()

  // 添加点击外部关闭监听
  if (triggerRef.value && dropdownRef.value) {
    cleanupClickOutside = setupClickOutside(triggerRef.value, dropdownRef.value, closeDropdown)
  }
}

const closeDropdown = async () => {
  showDropdown.value = false
  highlightedIndex.value = -1

  // 更新 ProseMirror 插件状态
  if (props.editor?.view) {
    const view = props.editor.view
    const tr = view.state.tr
    tr.setMeta(TemplateSelectDropdownPluginKey, {
      type: 'close',
    })
    view.dispatch(tr)
  }

  // 清理点击外部监听
  if (cleanupClickOutside) {
    cleanupClickOutside()
    cleanupClickOutside = null
  }

  // 清理自动更新
  if (cleanupAutoUpdate) {
    cleanupAutoUpdate()
    cleanupAutoUpdate = null
  }
}

const selectOption = (option: SelectOption) => {
  props.updateAttributes({ value: option.value })
  closeDropdown()
}

const updatePosition = () => {
  if (!triggerRef.value || !dropdownRef.value) return

  // 清理旧的自动更新
  if (cleanupAutoUpdate) {
    cleanupAutoUpdate()
    cleanupAutoUpdate = null
  }

  // 使用 autoUpdate 自动处理滚动和调整大小
  cleanupAutoUpdate = autoUpdate(triggerRef.value, dropdownRef.value, () => {
    if (!triggerRef.value || !dropdownRef.value) return

    computePosition(triggerRef.value, dropdownRef.value, {
      placement: 'bottom-start',
      strategy: 'fixed', // 使用 fixed 定位策略，相对于视口
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      if (dropdownRef.value) {
        Object.assign(dropdownRef.value.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      }
    })
  })
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      navigateUp()
      break
    case 'ArrowDown':
      event.preventDefault()
      navigateDown()
      break
    case 'Enter':
      event.preventDefault()
      selectHighlightedOption()
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

const navigateUp = () => {
  if (highlightedIndex.value === -1) {
    // 如果没有高亮，从最后一个开始
    highlightedIndex.value = props.node.attrs.options.length - 1
  } else if (highlightedIndex.value <= 0) {
    // 循环到最后一个
    highlightedIndex.value = props.node.attrs.options.length - 1
  } else {
    highlightedIndex.value -= 1
  }
  scrollToHighlighted()
}

const navigateDown = () => {
  if (highlightedIndex.value === -1) {
    // 如果没有高亮，从第一个开始
    highlightedIndex.value = 0
  } else if (highlightedIndex.value >= props.node.attrs.options.length - 1) {
    // 循环到第一个
    highlightedIndex.value = 0
  } else {
    highlightedIndex.value += 1
  }
  scrollToHighlighted()
}

const scrollToHighlighted = () => {
  nextTick(() => {
    if (!dropdownRef.value) return

    const highlightedElement = dropdownRef.value.querySelector('.template-select__option.is-highlighted')
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  })
}

const selectHighlightedOption = () => {
  // 只有当有高亮选项时才选择
  if (highlightedIndex.value >= 0 && highlightedIndex.value < props.node.attrs.options.length) {
    selectOption(props.node.attrs.options[highlightedIndex.value])
  } else {
    // 如果没有高亮选项，关闭下拉菜单
    closeDropdown()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (cleanupClickOutside) {
    cleanupClickOutside()
  }
  if (cleanupAutoUpdate) {
    cleanupAutoUpdate()
  }
})
</script>

<template>
  <NodeViewWrapper as="span" class="template-select">
    <span contenteditable="false" class="template-select__prefix">&#8203;</span>
    <span
      ref="triggerRef"
      class="template-select__trigger"
      :class="{ 'is-open': showDropdown }"
      @mousedown.prevent="toggleDropdown"
    >
      <span class="template-select__text" :class="{ 'is-placeholder': isPlaceholder }">{{ displayText }}</span>
      <span class="template-select__icon"><IconArrowDown /></span>
    </span>
    <span contenteditable="false" class="template-select__suffix">&#8203;</span>

    <Teleport to="body">
      <div v-if="showDropdown" ref="dropdownRef" class="template-select__dropdown">
        <div
          v-for="(option, index) in node.attrs.options"
          :key="option.value"
          class="template-select__option"
          :class="{
            'is-highlighted': index === highlightedIndex,
            'is-selected': option.value === node.attrs.value,
          }"
          @mousedown.prevent="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          {{ option.label }}
        </div>
      </div>
    </Teleport>
  </NodeViewWrapper>
</template>

<style lang="less" scoped>
.template-select {
  display: inline;
  position: relative;

  &__prefix,
  &__suffix {
    user-select: none;
  }

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 4px;
    padding: 0 6px;
    background: var(--tr-sender-template-select-bg);
    color: var(--tr-sender-template-select-color);
    border-radius: 6px;
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;

    &:hover {
      background: var(--tr-sender-template-select-bg-hover);
    }

    &.is-open {
      background: var(--tr-sender-template-select-bg-active);
    }
  }

  &__text {
    white-space: nowrap;

    &.is-placeholder {
      color: var(--tr-sender-template-select-placeholder-color);
    }
  }

  &__icon {
    font-size: 12px;
    transition: transform 0.2s;

    .is-open & {
      transform: rotate(180deg);
    }
  }
}
</style>

<!-- 全局样式，用于 Teleport 的下拉菜单 -->
<style lang="less">
.template-select__dropdown {
  position: fixed;
  z-index: 1000;
  min-width: 160px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--tr-sender-template-select-dropdown-bg);
  border-radius: 12px;
  box-shadow: var(--tr-sender-template-select-dropdown-shadow);
  padding: 6px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 6px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--tr-sender-template-select-scrollbar-thumb);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: padding-box;

    &:hover {
      background: var(--tr-sender-template-select-scrollbar-thumb-hover);
      background-clip: padding-box;
    }
  }
}

.template-select__option {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--tr-sender-template-select-text-primary);
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: var(--tr-sender-template-select-option-hover-bg);
  }

  &.is-highlighted {
    background: var(--tr-sender-template-select-option-selected-bg);
  }

  &.is-selected {
    color: var(--tr-sender-template-select-color);
    font-weight: 600;
  }
}
</style>
