<script setup lang="ts">
import { TrIconButton, TrLayout } from '@opentiny/tiny-robot'
import { IconCollapseLeft, IconCollapseRight, IconNewSession } from '@opentiny/tiny-robot-svgs'
import type { ChatConversationView, ChatLabels } from '../../types'

defineProps<{
  title: string
  isEmpty: boolean
  conversation: Required<Omit<ChatConversationView, 'history'>> & Pick<ChatConversationView, 'history'>
  isLeftAsideVisible: boolean
  isLeftAsideDrawer: boolean
  isLeftAsideOpen: boolean
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
        <TrIconButton
          v-if="!isEmpty || !isLeftAsideVisible"
          class="chat-header__new"
          :class="{ 'chat-header__new--visible': !isLeftAsideVisible }"
          :icon="IconNewSession"
          size="32"
          svg-size="20"
          type="button"
          :aria-label="labels.createConversation"
          @click="createConversation"
        />
      </div>
    </header>
  </slot>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tr-chat-ui-header-gap, 8px);
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

.chat-header__new.tr-icon-button {
  display: none;
  margin-left: auto;
  color: var(--tr-icon-color-default);
}

.chat-header__new.tr-icon-button.chat-header__new--visible {
  display: inline-flex;
}

.chat-header__new:hover,
.chat-header__aside-toggle:hover {
  color: var(--tr-icon-color-hover);
}

.chat-header__aside-toggle:hover {
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

  .chat-header__new.tr-icon-button {
    display: inline-flex;
    color: var(--tr-text-secondary);
  }
}
</style>
