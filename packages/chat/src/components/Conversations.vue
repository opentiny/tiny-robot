<script setup lang="ts">
import { computed } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { useChatContext } from '../composables/useChatContext'
import type { ChatConversationItem } from '../types'
import type { HistoryMenuItem } from '@opentiny/tiny-robot'

const { runtime, parts } = useChatContext()

const conversations = computed(() => runtime.conversations)
const historyParts = computed(() => parts.conversations?.history ?? {})
const data = computed(() => [...(conversations.value?.items.value ?? [])])
const selected = computed(() => conversations.value?.currentId.value ?? undefined)
const menuItems = computed(() => {
  if (historyParts.value.menuItems) {
    return historyParts.value.menuItems
  }

  const items: HistoryMenuItem[] = []

  if (runtime.actions.renameConversation) {
    items.push({ id: 'rename', text: '重命名' })
  }

  if (runtime.actions.deleteConversation) {
    items.push({ id: 'delete', text: '删除' })
  }

  return items
})

function handleItemClick(item: ChatConversationItem) {
  runtime.actions.switchConversation?.(item.id)
}

function handleTitleChange(title: string, item: ChatConversationItem) {
  runtime.actions.renameConversation?.(item.id, title)
}

function handleItemAction(action: HistoryMenuItem, item: ChatConversationItem) {
  if (action.id === 'delete') {
    runtime.actions.deleteConversation?.(item.id)
  }
}

function handleCreateConversation() {
  runtime.actions.createConversation?.()
}
</script>

<template>
  <div v-if="conversations" class="tr-chat-conversations">
    <div class="tr-chat-conversations__toolbar">
      <button
        v-if="runtime.actions.createConversation"
        class="tr-chat-conversations__new"
        type="button"
        @click="handleCreateConversation"
      >
        <IconNewSession class="tr-chat-conversations__new-icon" />
        <span class="tr-chat-conversations__new-text">新建对话</span>
      </button>
    </div>

    <TrHistory
      v-bind="historyParts"
      class="tr-chat-conversations__history"
      :data="data"
      :selected="selected"
      :menu-items="menuItems"
      @item-click="handleItemClick"
      @item-title-change="handleTitleChange"
      @item-action="handleItemAction"
    >
      <template v-if="$slots['item-prefix']" #item-prefix="slotProps">
        <slot name="item-prefix" v-bind="slotProps" />
      </template>
      <template v-if="$slots['item-title']" #item-title="slotProps">
        <slot name="item-title" v-bind="slotProps" />
      </template>
    </TrHistory>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-conversations {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.tr-chat-conversations__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px;
}

.tr-chat-conversations__new {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  height: 32px;
  flex: 1;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-primary);
  cursor: pointer;
}

.tr-chat-conversations__new-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tr-chat-conversations__new-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-chat-conversations__history {
  min-height: 0;
  flex: 1;
}
</style>
