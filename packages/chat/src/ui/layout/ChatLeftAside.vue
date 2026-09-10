<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { TrHistory, TrIconButton } from '@opentiny/tiny-robot'
import { IconAi, IconCollapseLeft, IconCollapseRight, IconNewSession } from '@opentiny/tiny-robot-svgs'
import type { HistoryGroup, HistoryMenuItem } from '@opentiny/tiny-robot'
import {
  useChatHistoryData,
  type ChatHistoryDisplayData,
  type ChatHistoryItem,
} from '../../composables/useChatHistoryItems'
import type {
  ChatBrandOptions,
  ChatConversationInfo,
  ChatConversationView,
  ChatHistoryOptions,
  ChatLabels,
} from '../../types'

const props = defineProps<{
  conversation: Required<Omit<ChatConversationView, 'history'>> & Pick<ChatConversationView, 'history'>
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

const slots = useSlots()
const hasCustomRail = computed(() => Boolean(slots.rail))
const historyData = useChatHistoryData({
  conversations: () => props.conversation.items,
  history: () => props.conversation.history,
  defaultTitle: () => props.labels.newConversationTitle,
})

const historyProps = computed(() => {
  const { menuItems: _menuItems, ...nextHistoryProps } = props.history
  return nextHistoryProps
})
const historyMenuItems = computed<HistoryMenuItem[]>(() => props.history.menuItems ?? [])
const displayedHistoryItems = computed(() => {
  const data = historyData.value
  return isHistoryGroupData(data) ? data.flatMap((group) => group.items) : data
})

function handleCreateConversation() {
  emit('createConversation')
}

function handleHistoryItemClick(item: ChatHistoryItem) {
  emit('switchConversation', item.raw)
}

function handleHistoryTitleChange(title: string, item: ChatHistoryItem) {
  emit('renameConversation', item.raw, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatHistoryItem) {
  emit('historyAction', action, item.raw)
}

function findConversation(id: string) {
  return (
    displayedHistoryItems.value.find((item) => item.id === id)?.raw ?? {
      id,
      title: props.labels.newConversationTitle,
    }
  )
}

function isHistoryGroupData(data: ChatHistoryDisplayData): data is HistoryGroup<ChatHistoryItem>[] {
  return data.length > 0 && typeof (data[0] as HistoryGroup<ChatHistoryItem>).group !== 'undefined'
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
    <span v-if="!hasCustomRail" class="chat-left-aside-logo" :aria-label="brand.name || labels.newConversationTitle">
      <component :is="brand.logo || IconAi" />
    </span>

    <div class="chat-left-aside-rail" :class="{ 'is-hidden': !isDock || isOpen }">
      <slot
        name="rail"
        :conversation="conversation"
        :is-open="isOpen"
        :is-dock="isDock"
        :create-conversation="handleCreateConversation"
        :switch-conversation="switchConversation"
        :rename-conversation="renameConversation"
        :delete-conversation="deleteConversation"
        :open-left-aside="openAside"
        :close-left-aside="closeAside"
        :toggle-left-aside="toggleAside"
      >
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
      </slot>
    </div>

    <div class="chat-left-aside-panel" :class="{ 'is-hidden': !isOpen }">
      <slot
        v-if="$slots.default"
        :conversation="conversation"
        :is-open="isOpen"
        :is-dock="isDock"
        :create-conversation="handleCreateConversation"
        :switch-conversation="switchConversation"
        :rename-conversation="renameConversation"
        :delete-conversation="deleteConversation"
        :open-left-aside="openAside"
        :close-left-aside="closeAside"
        :toggle-left-aside="toggleAside"
      />

      <template v-else>
        <div class="chat-left-aside-brand">
          <slot
            name="brand"
            :conversation="conversation"
            :is-open="isOpen"
            :is-dock="isDock"
            :create-conversation="handleCreateConversation"
            :switch-conversation="switchConversation"
            :rename-conversation="renameConversation"
            :delete-conversation="deleteConversation"
            :open-left-aside="openAside"
            :close-left-aside="closeAside"
            :toggle-left-aside="toggleAside"
          >
            <span class="chat-left-aside-brand__title">{{ brand.name }}</span>
            <TrIconButton
              :icon="IconCollapseRight"
              size="32"
              svg-size="20"
              type="button"
              :aria-label="labels.collapseConversationList"
              @click="closeAside"
            />
          </slot>
        </div>

        <div class="chat-left-aside-actions">
          <slot
            name="actions"
            :conversation="conversation"
            :is-open="isOpen"
            :is-dock="isDock"
            :create-conversation="handleCreateConversation"
            :switch-conversation="switchConversation"
            :rename-conversation="renameConversation"
            :delete-conversation="deleteConversation"
            :open-left-aside="openAside"
            :close-left-aside="closeAside"
            :toggle-left-aside="toggleAside"
          >
            <button class="chat-left-aside-action" type="button" @click="handleCreateConversation">
              <span class="chat-left-aside-action__label">
                <IconNewSession font-size="20" />
                {{ labels.createConversation }}
              </span>
            </button>
          </slot>
        </div>

        <div class="chat-left-aside-content">
          <slot
            name="content"
            :conversation="conversation"
            :history="conversation.history"
            :is-open="isOpen"
            :is-dock="isDock"
            :create-conversation="handleCreateConversation"
            :switch-conversation="switchConversation"
            :rename-conversation="renameConversation"
            :delete-conversation="deleteConversation"
            :open-left-aside="openAside"
            :close-left-aside="closeAside"
            :toggle-left-aside="toggleAside"
          >
            <TrHistory
              v-if="showHistory"
              v-bind="historyProps"
              class="chat-left-aside-history"
              :data="historyData"
              :selected="conversation.activeId ?? undefined"
              :menu-items="historyMenuItems"
              @item-click="handleHistoryItemClick"
              @item-title-change="handleHistoryTitleChange"
              @item-action="handleHistoryAction"
            >
              <template v-if="$slots['history-item-prefix']" #item-prefix="{ item }">
                <slot name="history-item-prefix" :item="item.raw" />
              </template>
            </TrHistory>
          </slot>
        </div>

        <div v-if="$slots.footer" class="chat-left-aside-footer">
          <slot
            name="footer"
            :conversation="conversation"
            :is-open="isOpen"
            :is-dock="isDock"
            :create-conversation="handleCreateConversation"
            :switch-conversation="switchConversation"
            :rename-conversation="renameConversation"
            :delete-conversation="deleteConversation"
            :open-left-aside="openAside"
            :close-left-aside="closeAside"
            :toggle-left-aside="toggleAside"
          />
        </div>
      </template>
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

.chat-left-aside-actions {
  flex-shrink: 0;
  margin-top: 24px;
}

.chat-left-aside-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
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

.chat-left-aside-content {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  padding: 24px 0 0;
  overflow: auto;
}

.chat-left-aside-history {
  min-height: 100%;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-space-y: 4px;
}

.chat-left-aside-footer {
  flex-shrink: 0;
  margin-top: 12px;
}
</style>
