<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { TrHistory, TrIconButton } from '@opentiny/tiny-robot'
import { IconAi, IconCollapseLeft, IconCollapseRight, IconNewSession } from '@opentiny/tiny-robot-svgs'
import type { HistoryMenuItem } from '@opentiny/tiny-robot'
import type {
  ChatBrandOptions,
  ChatConversationInfo,
  ChatConversationView,
  ChatHistoryOptions,
  ChatLabels,
} from '../../types'

type HistoryDisplayItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

const props = defineProps<{
  conversation: Required<ChatConversationView>
  history: ChatHistoryOptions
  brand: ChatBrandOptions
  labels: ChatLabels
  isOpen: boolean
  isDock: boolean
  showHistory: boolean
}>()

const emit = defineEmits<{
  createConversation: []
  switchConversation: [item: ChatConversationInfo]
  renameConversation: [item: ChatConversationInfo, title: string]
  deleteConversation: [item: ChatConversationInfo]
  historyAction: [action: HistoryMenuItem, item: ChatConversationInfo]
  open: []
  close: []
  toggle: []
}>()

const historyItemCache = new Map<string, HistoryDisplayItem>()
const historyItems = shallowRef<HistoryDisplayItem[]>([])

watch(
  () => props.conversation.items,
  (conversationItems) => {
    const activeIds = new Set<string>()
    const items = conversationItems.map((item) => {
      activeIds.add(item.id)
      return syncHistoryItem(item)
    })

    for (const id of historyItemCache.keys()) {
      if (!activeIds.has(id)) {
        historyItemCache.delete(id)
      }
    }

    historyItems.value = items
  },
  { immediate: true, deep: true },
)

const historyProps = computed(() => {
  const { menuItems: _menuItems, ...nextHistoryProps } = props.history

  return nextHistoryProps
})

const historyMenuItems = computed<HistoryMenuItem[]>(() => props.history.menuItems ?? [])

function syncHistoryItem(item: ChatConversationInfo) {
  const cached = historyItemCache.get(item.id)
  const nextItem =
    cached ?? ({ id: item.id, title: item.title || props.labels.newConversationTitle, raw: item } as HistoryDisplayItem)

  for (const key of Object.keys(nextItem)) {
    if (key !== 'raw' && !(key in item)) {
      delete nextItem[key]
    }
  }

  Object.assign(nextItem, item, {
    id: item.id,
    title: item.title || props.labels.newConversationTitle,
    raw: item,
  })
  historyItemCache.set(item.id, nextItem)

  return nextItem
}

function handleCreateConversation() {
  emit('createConversation')
}

function handleHistoryItemClick(item: HistoryDisplayItem) {
  emit('switchConversation', item.raw)
}

function handleHistoryTitleChange(title: string, item: HistoryDisplayItem) {
  emit('renameConversation', item.raw, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: HistoryDisplayItem) {
  emit('historyAction', action, item.raw)
}

function findConversation(id: string) {
  return props.conversation.items.find((item) => item.id === id) ?? { id, title: props.labels.newConversationTitle }
}

function switchConversation(id: string) {
  emit('switchConversation', findConversation(id))
}

function renameConversation(id: string, title: string) {
  emit('renameConversation', findConversation(id), title)
}

function deleteConversation(id: string) {
  emit('deleteConversation', findConversation(id))
}

function openAside() {
  emit('open')
}

function closeAside() {
  emit('close')
}

function toggleAside() {
  emit('toggle')
}
</script>

<template>
  <aside class="chat-left-aside">
    <span class="chat-left-aside-logo" :aria-label="brand.name || labels.newConversationTitle">
      <component :is="brand.logo || IconAi" />
    </span>

    <div class="chat-left-aside-rail" :class="{ 'is-hidden': !isDock || isOpen }">
      <TrIconButton
        class="chat-left-aside-rail__button"
        :icon="IconCollapseLeft"
        size="32"
        svg-size="20"
        :aria-label="labels.expandConversationList"
        @click="openAside"
      />
      <TrIconButton
        class="chat-left-aside-rail__button"
        :icon="IconNewSession"
        size="32"
        svg-size="20"
        :aria-label="labels.createConversation"
        @click="handleCreateConversation"
      />
    </div>

    <div class="chat-left-aside-panel" :class="{ 'is-hidden': !isOpen }">
      <slot
        :conversation="conversation"
        :is-open="isOpen"
        :create-conversation="handleCreateConversation"
        :switch-conversation="switchConversation"
        :rename-conversation="renameConversation"
        :delete-conversation="deleteConversation"
        :open-left-aside="openAside"
        :close-left-aside="closeAside"
        :toggle-left-aside="toggleAside"
      >
        <div class="chat-left-aside-brand">
          <span class="chat-left-aside-brand__title">{{ brand.name }}</span>
          <TrIconButton
            :icon="IconCollapseRight"
            size="32"
            svg-size="20"
            type="button"
            :aria-label="labels.collapseConversationList"
            @click="closeAside"
          />
        </div>
        <button class="chat-left-aside-action" type="button" @click="handleCreateConversation">
          <span class="chat-left-aside-action__label">
            <IconNewSession font-size="20" />
            {{ labels.createConversation }}
          </span>
        </button>
        <TrHistory
          v-if="showHistory"
          v-bind="historyProps"
          class="chat-left-aside-content"
          :data="historyItems"
          :selected="conversation.activeId ?? undefined"
          :menu-items="historyMenuItems"
          @item-click="handleHistoryItemClick"
          @item-title-change="handleHistoryTitleChange"
          @item-action="handleHistoryAction"
        />
      </slot>
    </div>
  </aside>
</template>

<style scoped>
.chat-left-aside {
  position: relative;
  height: 100%;
}

.chat-left-aside-logo {
  position: absolute;
  z-index: 2;
  left: 12px;
  top: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--tr-color-primary);
}

.chat-left-aside-logo :deep(svg) {
  width: 28px;
  height: 28px;
}

.chat-left-aside-rail,
.chat-left-aside-panel {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  transition: opacity var(--transition-duration) var(--transition-easing);
}

.chat-left-aside-rail.is-hidden,
.chat-left-aside-panel.is-hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.chat-left-aside-panel {
  display: flex;
  flex-direction: column;
  padding: 24px 12px;
  overflow: hidden;
}

.chat-left-aside-rail {
  display: flex;
  width: var(--tr-layout-aside-collapsed-width, 56px);
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 72px 12px 24px;
}

.chat-left-aside-rail__button {
  color: var(--tr-icon-color-default);
}

.chat-left-aside-rail__button:hover {
  color: var(--tr-icon-color-hover);
}

.chat-left-aside-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  padding-left: 40px;
}

.chat-left-aside-brand__title {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  color: var(--tr-text-primary);
  font-weight: 600;
}

.chat-left-aside-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.chat-left-aside-action:hover {
  background: var(--tr-container-bg-hover);
}

.chat-left-aside-action__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chat-left-aside-action kbd {
  border-radius: 6px;
  padding: 2px 6px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-secondary);
  font: inherit;
  font-size: 12px;
}

.chat-left-aside-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px 0 0;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-space-y: 4px;
}
</style>
