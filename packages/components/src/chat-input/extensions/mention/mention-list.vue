<script setup lang="ts">
/**
 * MentionList 组件
 *
 * 提及建议列表
 * - 显示过滤后的提及项列表
 * - 支持键盘和鼠标交互
 * - 简洁的 UI，只显示图标和标签
 */

import { ref, watch } from 'vue'
import type { MentionItem } from './types'

interface Props {
  items: MentionItem[]
  command: (props: { id?: string; label: string; preset?: string }) => void
}

const props = defineProps<Props>()

// 内部管理选中索引
const selectedIndex = ref(0)

// 监听提及项列表变化，重置索引
watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
)

// 键盘导航处理（暴露给插件调用）
function onKeyDown({ event }: { event: KeyboardEvent }): boolean {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    return true
  }

  if (event.key === 'ArrowDown') {
    selectedIndex.value = Math.min(props.items.length - 1, selectedIndex.value + 1)
    return true
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    selectItem(selectedIndex.value)
    return true
  }

  return false
}

// 选择提及项
function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    props.command({
      id: item.id,
      label: item.label,
      preset: item.preset,
    })
  }
}

// 鼠标悬停更新索引
function onHover(index: number) {
  selectedIndex.value = index
}

// 暴露方法给插件
defineExpose({
  onKeyDown,
})
</script>

<template>
  <div class="mention-list">
    <!-- 提及项列表 -->
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      :class="['mention-item', { 'is-selected': index === selectedIndex }]"
      @click="selectItem(index)"
      @mouseenter="onHover(index)"
    >
      <span v-if="item.icon" class="mention-icon">{{ item.icon }}</span>
      <span class="mention-label">{{ item.label }}</span>
    </button>

    <!-- 空状态 -->
    <div v-if="items.length === 0" class="mention-empty">
      <span>未找到匹配的提及项</span>
    </div>
  </div>
</template>

<style scoped>
.mention-list {
  background: var(--tr-chat-input-mention-list-bg);
  border-radius: 12px;
  box-shadow: var(--tr-chat-input-mention-list-shadow);
  padding: 6px;
  max-height: 320px;
  overflow-y: auto;
  max-width: 320px;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;

  /* Button reset */
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
}

.mention-item:hover {
  background: var(--tr-chat-input-mention-item-hover-bg);
}

.mention-item.is-selected {
  background: var(--tr-chat-input-mention-item-selected-bg);
}

.mention-icon {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mention-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--tr-chat-input-mention-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.mention-empty {
  padding: 20px 12px;
  text-align: center;
  color: var(--tr-chat-input-mention-text-tertiary);
  font-size: 14px;
}

/* 滚动条样式 */
.mention-list::-webkit-scrollbar {
  width: 8px;
}

.mention-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 6px 0;
}

.mention-list::-webkit-scrollbar-thumb {
  background: var(--tr-chat-input-mention-scrollbar-thumb);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.mention-list::-webkit-scrollbar-thumb:hover {
  background: var(--tr-chat-input-mention-scrollbar-thumb-hover);
  background-clip: padding-box;
}
</style>
