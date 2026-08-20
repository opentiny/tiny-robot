<script setup lang="ts">
import { computed, defineComponent, onBeforeUnmount, shallowRef } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import DoubaoHeader from './DoubaoHeader.vue'
import DoubaoSidebar from './DoubaoSidebar.vue'
import { useChatCaseRuntime } from '../../shared/runtime/createChatRuntime'
import {
  doubaoConversationPrompts,
  doubaoConversationStorageKey,
  doubaoConversationWelcome,
  doubaoMockConversations,
  doubaoNavigation,
  doubaoWorkPrompts,
  doubaoWorkWelcome,
} from './config'

type DoubaoNavigation = (typeof doubaoNavigation)[keyof typeof doubaoNavigation]

const runtime = useChatCaseRuntime({
  storageKey: doubaoConversationStorageKey,
  initialConversations: doubaoMockConversations,
})
// Avoid rendering the default IconAi twice; its fixed SVG IDs collide with the welcome icon.
const emptyBrandLogo = defineComponent({
  name: 'DoubaoEmptyBrandLogo',
  render: () => null,
})
const isFloatingSidebarVisible = shallowRef(false)
const activeNavigation = shallowRef<DoubaoNavigation>(doubaoNavigation.chat)
let floatingHideTimer: ReturnType<typeof setTimeout> | undefined

const chatUi = computed(() => ({
  brand: { name: '豆包', logo: emptyBrandLogo },
  layout: {
    contentMaxWidth: 840,
    panelPadding: 12,
    panelGap: 16,
    leftAside: {
      mode: 'dock' as const,
      width: 280,
      collapsedWidth: 0,
      defaultOpen: true,
    },
  },
  welcome: activeNavigation.value === doubaoNavigation.work ? doubaoWorkWelcome : doubaoConversationWelcome,
  prompts: activeNavigation.value === doubaoNavigation.work ? doubaoWorkPrompts : doubaoConversationPrompts,
  sender: {
    placeholder: '发消息或输入 / 选择技能',
  },
}))

function showFloatingSidebar(isSidebarOpen: boolean) {
  if (isSidebarOpen) return
  clearFloatingHideTimer()
  isFloatingSidebarVisible.value = true
}

function scheduleHideFloatingSidebar() {
  clearFloatingHideTimer()
  floatingHideTimer = setTimeout(() => {
    isFloatingSidebarVisible.value = false
  }, 120)
}

function clearFloatingHideTimer() {
  if (floatingHideTimer !== undefined) {
    clearTimeout(floatingHideTimer)
    floatingHideTimer = undefined
  }
}

function toggleSidebar(toggleLeftAside: () => void) {
  clearFloatingHideTimer()
  isFloatingSidebarVisible.value = false
  toggleLeftAside()
}

function handleNavigationChange(item: string) {
  if (item === doubaoNavigation.work || item === doubaoNavigation.chat) {
    activeNavigation.value = item
  }
}

function handleConversationSelect(id: string, switchConversation: (id: string) => void) {
  switchConversation(id)
  activeNavigation.value = doubaoNavigation.chat
}

function handleCreateConversation(createConversation: () => void) {
  createConversation()
  activeNavigation.value = doubaoNavigation.chat
}

function handleConversationTitleChange(
  title: string,
  id: string,
  renameConversation: (id: string, title: string) => void,
) {
  renameConversation(id, title)
}

function handleConversationAction(action: { id: string }, id: string, deleteConversation: (id: string) => void) {
  if (action.id === 'delete') {
    deleteConversation(id)
  }
}

onBeforeUnmount(() => {
  clearFloatingHideTimer()
})
</script>

<template>
  <div class="doubao-case">
    <main class="doubao-case__chat">
      <TrChat :runtime="runtime" :ui="chatUi">
        <template #layout-header="{ isLeftAsideOpen, toggleLeftAside }">
          <DoubaoHeader
            :is-sidebar-open="isLeftAsideOpen"
            @toggle="toggleSidebar(toggleLeftAside)"
            @menu-enter="showFloatingSidebar"
            @menu-leave="scheduleHideFloatingSidebar"
          />
        </template>

        <template
          #layout-left-aside="{
            conversation,
            isOpen,
            createConversation,
            switchConversation,
            renameConversation,
            deleteConversation,
          }"
        >
          <DoubaoSidebar
            v-if="isOpen"
            variant="fixed"
            :conversation="conversation"
            @create-conversation="handleCreateConversation(createConversation)"
            @navigation-change="handleNavigationChange"
            @conversation-select="handleConversationSelect($event, switchConversation)"
            @conversation-title-change="(title, id) => handleConversationTitleChange(title, id, renameConversation)"
            @conversation-action="(action, id) => handleConversationAction(action, id, deleteConversation)"
          />

          <Teleport to="body">
            <Transition name="doubao-sidebar-slide" :css="!isOpen">
              <div
                v-if="!isOpen && isFloatingSidebarVisible"
                class="doubao-case__floating-sidebar"
                @mouseenter="clearFloatingHideTimer"
                @mouseleave="scheduleHideFloatingSidebar"
              >
                <DoubaoSidebar
                  variant="floating"
                  :conversation="conversation"
                  @create-conversation="handleCreateConversation(createConversation)"
                  @navigation-change="handleNavigationChange"
                  @conversation-select="handleConversationSelect($event, switchConversation)"
                  @conversation-title-change="
                    (title, id) => handleConversationTitleChange(title, id, renameConversation)
                  "
                  @conversation-action="(action, id) => handleConversationAction(action, id, deleteConversation)"
                />
              </div>
            </Transition>
          </Teleport>
        </template>

        <template #welcome-footer>
          <div class="doubao-mode-switch" role="tablist" aria-label="模式切换">
            <button
              class="doubao-mode-switch__item"
              :class="{ 'is-active': activeNavigation === doubaoNavigation.chat }"
              type="button"
              role="tab"
              :aria-selected="activeNavigation === doubaoNavigation.chat"
              @click="activeNavigation = doubaoNavigation.chat"
            >
              对话
            </button>
            <button
              class="doubao-mode-switch__item"
              :class="{ 'is-active': activeNavigation === doubaoNavigation.work }"
              type="button"
              role="tab"
              :aria-selected="activeNavigation === doubaoNavigation.work"
              @click="activeNavigation = doubaoNavigation.work"
            >
              工作
            </button>
          </div>
          <div class="doubao-prompts-title">为你推荐</div>
        </template>
      </TrChat>
    </main>
  </div>
</template>

<style scoped>
.doubao-case {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #1f2329;
  background: #fff;
  --tr-chat-ui-left-aside-bg: #fafafa;
  --tr-chat-ui-header-bg: #fff;
  --tr-chat-ui-main-bg: #fff;
  --tr-chat-ui-footer-bg: #fff;
}

.doubao-case__floating-sidebar {
  position: fixed;
  top: 46px;
  left: 8px;
  z-index: 30;
}

.doubao-sidebar-slide-enter-active,
.doubao-sidebar-slide-leave-active {
  transition: transform 180ms ease;
  will-change: transform;
}

.doubao-sidebar-slide-enter-from,
.doubao-sidebar-slide-leave-to {
  transform: translateX(calc(-100% - 8px));
}

.doubao-case__chat {
  min-width: 0;
  min-height: 100vh;
}

.doubao-case__chat :deep(.tr-chat-ui) {
  min-height: 100vh;
}

.doubao-case__chat :deep(.chat-panel-content--header) {
  max-width: none;
  padding: 0;
}

.doubao-case__chat :deep(.chat-panel-content--footer) {
  padding-bottom: 28px;
}

.doubao-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
  padding: 28vh 0 0;
}

.doubao-case__chat :deep(.tr-welcome__title) {
  color: #1f2329;
  font-size: 30px;
  font-weight: 650;
}

.doubao-case__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.doubao-case__chat :deep(.tr-welcome__icon) {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.doubao-case__chat :deep(.tr-welcome__icon svg) {
  display: block;
  width: 40px;
  height: 40px;
}

.doubao-case__chat :deep(.tr-welcome__description) {
  display: none;
}

.doubao-case__chat :deep(.chat-left-aside-logo),
.doubao-case__chat :deep(.chat-left-aside-rail) {
  display: none;
}

.doubao-case__chat :deep(.chat-left-aside-panel) {
  padding: 0;
}

.doubao-case__chat :deep(.tr-prompts__list-container) {
  justify-content: flex-start;
  max-width: none;
  gap: 10px;
}

.doubao-case__chat :deep(.tr-prompts) {
  box-sizing: border-box;
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 0 24px;
}

.doubao-case__chat :deep(.tr-prompt) {
  border-color: #e5e6eb;
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  box-shadow: none;
  background: #fff;
}

.doubao-case__chat :deep(.tr-prompt:hover) {
  border-color: #c8d6ff;
  background: #f5f8ff;
}

.doubao-mode-switch {
  display: inline-flex;
  align-self: center;
  margin-top: 24px;
  padding: 3px;
  border-radius: 8px;
  background: #f2f3f5;
}

.doubao-prompts-title {
  align-self: flex-start;
  box-sizing: border-box;
  width: 100%;
  max-width: 840px;
  margin-top: 112px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 24px;
  color: #8f959e;
  font-size: 12px;
  line-height: 18px;
  text-align: left;
}

.doubao-mode-switch__item {
  min-width: 76px;
  padding: 7px 16px;
  border: 0;
  border-radius: 6px;
  color: #646a73;
  background: transparent;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.doubao-mode-switch__item.is-active {
  color: #1f2329;
  background: #fff;
  box-shadow: 0 1px 3px rgb(31 35 41 / 10%);
}
</style>
