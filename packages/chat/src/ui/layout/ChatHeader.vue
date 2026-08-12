<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
import { IconCollapseLeft, IconCollapseRight, IconNewSession } from '@opentiny/tiny-robot-svgs'
import type { ChatConversationView, ChatLabels } from '../../types'

defineProps<{
  title: string
  isEmpty: boolean
  conversation: Required<ChatConversationView>
  isLeftAsideVisible: boolean
  isLeftAsideDrawer: boolean
  isLeftAsideOpen: boolean
  isRightAsideVisible: boolean
  isRightAsideOpen: boolean
  labels: ChatLabels
}>()

const emit = defineEmits<{
  createConversation: []
  openLeftAside: []
  closeLeftAside: []
  toggleLeftAside: []
  openRightAside: []
}>()

function createConversation() {
  emit('createConversation')
}

function openLeftAside() {
  emit('openLeftAside')
}

function closeLeftAside() {
  emit('closeLeftAside')
}

function toggleLeftAside() {
  emit('toggleLeftAside')
}

function openRightAside() {
  emit('openRightAside')
}
</script>

<template>
  <div v-if="$slots.notice" class="chat-notice">
    <slot name="notice"></slot>
  </div>

  <slot
    :title="title"
    :is-empty="isEmpty"
    :conversation="conversation"
    :create-conversation="createConversation"
    :is-left-aside-open="isLeftAsideOpen"
    :open-left-aside="openLeftAside"
    :close-left-aside="closeLeftAside"
    :toggle-left-aside="toggleLeftAside"
    :open-right-aside="openRightAside"
  >
    <header class="chat-header">
      <div class="chat-header__aside-cell">
        <TrLayout.AsideToggle v-if="isLeftAsideVisible && isLeftAsideDrawer" side="left">
          <template #default="{ isOpen }">
            <span
              class="chat-header__aside-toggle"
              :aria-label="isOpen ? labels.collapseConversationList : labels.expandConversationList"
            >
              <component :is="isOpen ? IconCollapseRight : IconCollapseLeft" :size="20" />
            </span>
          </template>
        </TrLayout.AsideToggle>
      </div>
      <h3 class="chat-header__title">{{ title }}</h3>
      <div class="chat-header__actions">
        <button
          v-if="isRightAsideVisible && !isRightAsideOpen"
          class="chat-header__aside-action"
          type="button"
          aria-label="打开详情"
          title="打开详情"
          @click="openRightAside"
        >
          <IconCollapseLeft :size="18" />
        </button>
        <button
          v-if="!isEmpty || !isLeftAsideVisible"
          class="chat-header__new"
          :class="{ 'chat-header__new--visible': !isLeftAsideVisible }"
          type="button"
          :aria-label="labels.createConversation"
          @click="createConversation"
        >
          <IconNewSession :size="20" />
        </button>
      </div>
    </header>
  </slot>
</template>

<style scoped>
.chat-notice {
  margin-bottom: 16px;
}

.chat-notice :deep(> *) {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.chat-header__aside-cell,
.chat-header__actions {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.chat-header__aside-toggle {
  flex-shrink: 0;
}

.chat-header__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-header__new {
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  padding: 0;
  border: none;
  border-radius: var(--tr-radius-full);
  background: transparent;
  color: var(--tr-icon-color-default);
  cursor: pointer;
}

.chat-header__new {
  display: none;
}

.chat-header__new--visible {
  display: inline-flex;
}

.chat-header__aside-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--tr-radius-full);
  color: var(--tr-icon-color-default);
  background: transparent;
  cursor: pointer;
}

.chat-header__aside-action:hover {
  color: var(--tr-icon-color-hover);
  background: var(--tr-container-bg-hover);
}

.chat-header__new:hover,
.chat-header__aside-toggle:hover,
.chat-header__aside-action:hover {
  color: var(--tr-icon-color-hover);
  background: var(--tr-container-bg-hover);
}

@media (max-width: 959px) {
  .chat-header {
    position: relative;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 32px;
    justify-content: stretch;
    min-height: 32px;
  }

  .chat-header__aside-cell,
  .chat-header__actions {
    width: 32px;
    justify-content: center;
  }

  .chat-header__title {
    text-align: center;
  }

  .chat-header__aside-toggle {
    display: inline-flex;
    background: var(--tr-container-bg-default);
    color: var(--tr-text-secondary);
  }

  .chat-header__new {
    display: inline-flex;
    color: var(--tr-text-secondary);
  }
}
</style>
