<script setup lang="ts">
import { computed, defineComponent, h, shallowRef } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import { IconImageUpload, IconSparkles, IconThink } from '@opentiny/tiny-robot-svgs'
import DeepseekHeader from './DeepseekHeader.vue'
import DeepseekSidebar from './DeepseekSidebar.vue'
import deepseekMark from './icons/deepseek-mark.svg'
import {
  deepseekConversationStorageKey,
  deepseekMockConversations,
  deepseekModelProviders,
  deepseekWelcome,
} from './config'
import { useChatCaseRuntime } from '../../shared/runtime/createChatRuntime'

const DeepseekLogo = defineComponent({
  name: 'DeepseekLogo',
  setup() {
    return () => h('img', { src: deepseekMark, alt: 'DeepSeek' })
  },
})

const runtime = useChatCaseRuntime({
  storageKey: deepseekConversationStorageKey,
  initialConversations: deepseekMockConversations,
  modelProviders: deepseekModelProviders,
  mcpServers: [],
})

const deepseekWelcomeModes = [
  { id: 'fast', label: '快速模式', icon: IconSparkles },
  { id: 'expert', label: '专家模式', icon: IconThink },
  { id: 'vision', label: '识图模式', icon: IconImageUpload },
] as const
type DeepseekWelcomeMode = (typeof deepseekWelcomeModes)[number]['id']
const activeWelcomeMode = shallowRef<DeepseekWelcomeMode>('fast')
const activeWelcomeModeLabel = computed(
  () => deepseekWelcomeModes.find((mode) => mode.id === activeWelcomeMode.value)?.label ?? '',
)

const chatUi = computed(() => ({
  brand: { name: 'DeepSeek', logo: DeepseekLogo },
  layout: {
    composer: {
      welcome: 'center' as const,
    },
    contentMaxWidth: 920,
    panelPadding: 12,
    panelGap: 16,
    leftAside: {
      mode: 'dock' as const,
      width: 260,
      collapsedWidth: 0,
      defaultOpen: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  welcome: { ...deepseekWelcome, icon: h(DeepseekLogo) as any },
  prompts: false as const,
  mcp: false as const,
  sender: {
    placeholder: '给 DeepSeek 发送消息',
  },
}))

function handleConversationSelect(id: string, switchConversation: (id: string) => void) {
  switchConversation(id)
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
</script>

<template>
  <div class="deepseek-case">
    <main class="deepseek-case__chat">
      <TrChat :runtime="runtime" :ui="chatUi">
        <template #layout-header="{ title, isEmpty, isLeftAsideOpen, toggleLeftAside, createConversation }">
          <DeepseekHeader
            :title="title"
            :is-empty="isEmpty"
            :mode-label="activeWelcomeModeLabel"
            :is-sidebar-open="isLeftAsideOpen"
            @toggle="toggleLeftAside"
            @create-conversation="createConversation"
          />
        </template>

        <template #welcome-footer>
          <div class="deepseek-welcome-modes" role="tablist" aria-label="DeepSeek 模式">
            <button
              v-for="mode in deepseekWelcomeModes"
              :key="mode.id"
              class="deepseek-welcome-modes__item"
              :class="{ 'is-active': activeWelcomeMode === mode.id }"
              type="button"
              role="tab"
              :aria-selected="activeWelcomeMode === mode.id"
              @click="activeWelcomeMode = mode.id"
            >
              <component :is="mode.icon" class="deepseek-welcome-modes__icon" />
              <span>{{ mode.label }}</span>
            </button>
          </div>
        </template>

        <template
          #layout-left-aside="{
            conversation,
            isOpen,
            createConversation,
            switchConversation,
            renameConversation,
            deleteConversation,
            closeLeftAside,
          }"
        >
          <DeepseekSidebar
            v-if="isOpen"
            :conversation="conversation"
            @create-conversation="createConversation"
            @close="closeLeftAside"
            @conversation-select="handleConversationSelect($event, switchConversation)"
            @conversation-title-change="(title, id) => handleConversationTitleChange(title, id, renameConversation)"
            @conversation-action="(action, id) => handleConversationAction(action, id, deleteConversation)"
          />
        </template>
      </TrChat>
    </main>
  </div>
</template>

<style scoped>
.deepseek-case {
  min-height: 100vh;
  overflow: hidden;
  color: #262626;
  background: #fff;
  --tr-chat-ui-left-aside-bg: #f7f8fa;
  --tr-chat-ui-header-bg: #fff;
  --tr-chat-ui-main-bg: #fff;
  --tr-chat-ui-footer-bg: #fff;
}

.deepseek-case__chat {
  min-width: 0;
  min-height: 100vh;
}

.deepseek-case__chat :deep(.tr-chat-ui) {
  min-height: 100vh;
}

.deepseek-case__chat :deep(.chat-panel-content--header) {
  position: relative;
  z-index: 10;
  max-width: none;
  height: auto;
  min-height: 0;
  padding: 0;
  overflow: visible;
}

.deepseek-case__chat :deep(.chat-left-aside-logo),
.deepseek-case__chat :deep(.chat-left-aside-rail) {
  display: none;
}

.deepseek-case__chat :deep(.chat-left-aside-panel) {
  padding: 0;
}

.deepseek-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
}

.deepseek-case__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.deepseek-case__chat :deep(.tr-welcome__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.deepseek-case__chat :deep(.tr-welcome__icon img) {
  width: 32px;
  height: 32px;
}

.deepseek-case__chat :deep(.tr-welcome__title) {
  color: #262626;
  font-size: 24px;
  font-weight: 600;
  line-height: 34px;
}

.deepseek-case__chat :deep(.tr-welcome__description) {
  display: none;
}

.deepseek-welcome-modes {
  display: flex;
  align-items: center;
  align-self: center;
  box-sizing: border-box;
  width: min(370px, calc(100vw - 48px));
  height: 42px;
  margin-block: 22px;
  padding: 2px;
  border: 1px solid #e1e4e8;
  border-radius: 22px;
  background: #fff;
}

.deepseek-welcome-modes__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 33.333%;
  height: 36px;
  padding: 0 8px;
  border: 0;
  border-radius: 19px;
  color: #262626;
  background: transparent;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.deepseek-welcome-modes__item.is-active {
  color: #4772ff;
  background: #eff4ff;
  box-shadow: inset 0 0 0 1px #b8ccff;
}

.deepseek-welcome-modes__icon {
  width: 14px;
  height: 14px;
  flex: none;
}

.deepseek-case__chat :deep(.chat-welcome-composer) {
  box-sizing: border-box;
  width: 100%;
  max-width: 776px;
  margin: 0 auto;
}

.deepseek-case__chat :deep(.chat-panel-content--main.is-message-state) {
  padding-top: 8px;
}

.deepseek-case__chat :deep(.chat-panel-content--main.is-message-state .tr-chat-messages__bubble-list) {
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 0 32px;
}

.deepseek-case__chat :deep(.chat-panel-content--main.is-message-state [data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: #f2f3f5;
}

.deepseek-case__chat :deep(.chat-panel-content--main.is-message-state [data-box-type='box']:not([data-role='user'])) {
  --tr-bubble-box-bg: transparent;
}

@media (max-width: 959px) {
  .deepseek-case__chat :deep(.chat-welcome-composer) {
    max-width: none;
    padding: 0 16px;
  }
}
</style>
