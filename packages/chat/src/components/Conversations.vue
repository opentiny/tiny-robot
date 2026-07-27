<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TrHistory, TrLayout } from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { useChatContext } from '../composables/useChatContext'
import type { ChatConversationInfo, ChatHistoryUi } from '../types'
import type { HistoryMenuItem } from '@opentiny/tiny-robot'

type HistoryDisplayItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

const { runtime, ui } = useChatContext()

const conversations = computed(() => runtime.value.conversations.value)
const historyUi = computed<ChatHistoryUi>(() => ui.value.history ?? {})
const historyProps = computed(() => {
  const {
    onItemClick: _onItemClick,
    onItemTitleChange: _onItemTitleChange,
    onItemAction: _onItemAction,
    ...props
  } = historyUi.value

  return props
})
const selected = computed(() => runtime.value.activeConversation.value?.id ?? undefined)
const historyScrollRef = ref<HTMLElement | null>(null)
const data = ref<HistoryDisplayItem[]>([])

watch(
  conversations,
  (nextItems) => {
    const cache = new Map(data.value.map((item) => [item.id, item]))

    data.value = nextItems.map((item) => {
      const current =
        cache.get(item.id) ?? ({ id: item.id, title: item.title || '新对话', raw: item } as HistoryDisplayItem)

      Object.assign(current, item, {
        id: item.id,
        title: item.title || '新对话',
        raw: item,
      })

      return current
    })
  },
  { immediate: true, deep: true },
)

const menuItems = computed(() => {
  if (historyProps.value.menuItems) {
    return historyProps.value.menuItems
  }

  const items: HistoryMenuItem[] = []
  items.push({ id: 'rename', text: '重命名' })
  items.push({ id: 'delete', text: '删除' })

  return items
})

function handleItemClick(item: HistoryDisplayItem) {
  const result = runtime.value.actions.switchConversation(item.id)

  historyUi.value.onItemClick?.(item.raw)

  return result
}

function handleTitleChange(title: string, item: HistoryDisplayItem) {
  const result = runtime.value.actions.renameConversation(item.id, title)

  item.title = title
  historyUi.value.onItemTitleChange?.(title, item.raw)

  return result
}

function handleItemAction(action: HistoryMenuItem, item: HistoryDisplayItem) {
  let result: Promise<void> | void | undefined

  if (action.id === 'delete') {
    result = runtime.value.actions.deleteConversation(item.id)
  }

  historyUi.value.onItemAction?.(action, item.raw)

  return result
}

function handleCreateConversation() {
  runtime.value.actions.createConversation()
}
</script>

<template>
  <div class="tr-chat-conversations">
    <div class="tr-chat-conversations__top">
      <div class="tr-chat-conversations__toolbar">
        <button class="tr-chat-conversations__new" @click="handleCreateConversation">
          <IconNewSession class="tr-chat-conversations__new-icon" />
          <span class="tr-chat-conversations__new-text">新建对话</span>
        </button>
      </div>
    </div>

    <div class="tr-chat-conversations__list-shell">
      <div ref="historyScrollRef" class="tr-chat-conversations__list">
        <TrHistory
          v-bind="historyProps"
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

      <TrLayout.ProxyScrollbar :scroll-target="historyScrollRef" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-conversations {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f5f5f5;
  box-sizing: border-box;
}

.tr-chat-conversations__top {
  flex-shrink: 0;
}

.tr-chat-conversations__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px;
}

.tr-chat-conversations__new {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  height: 32px;
  border: 1px solid #dbdbdb;
  padding: 8px;
  border-radius: 8px;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.tr-chat-conversations__new-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
}

.tr-chat-conversations__new-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-chat-conversations__list-shell {
  position: relative;
  min-height: 0;
  flex: 1;
  --tr-layout-main-scrollbar-width: 12px;
  --tr-layout-main-scrollbar-thumb-bg: color-mix(in srgb, var(--tr-text-primary, #111827) 18%, transparent);
  --tr-layout-main-scrollbar-thumb-bg-hover: color-mix(in srgb, var(--tr-text-primary, #111827) 28%, transparent);
  --tr-layout-main-scrollbar-thumb-bg-active: color-mix(in srgb, var(--tr-text-primary, #111827) 36%, transparent);
  --scrollbar-block-inset: 4px;
  --scrollbar-inline-end: 4px;
  --scrollbar-thumb-inset: 2px;
}

.tr-chat-conversations__list {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

.tr-chat-conversations__history {
  min-width: 0;
}

.tr-chat-conversations__list:deep(.tr-history) {
  min-width: 0;
}
</style>
