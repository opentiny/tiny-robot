<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import GeminiComposer from './GeminiComposer.vue'
import GeminiHeader from './GeminiHeader.vue'
import GeminiRail from './GeminiRail.vue'
import GeminiSidebar from './GeminiSidebar.vue'
import geminiMask from './icons/gemini-mask.svg'
import { geminiConversationStorageKey, geminiMockConversations, geminiWelcome } from './config'
import { useChatCaseRuntime } from '../../shared/runtime/createChatRuntime'

const GeminiLogo = defineComponent({
  name: 'GeminiLogo',
  setup() {
    return () => h('img', { src: geminiMask, alt: 'Gemini' })
  },
})

const EmptyWelcomeIcon = defineComponent({
  name: 'GeminiEmptyWelcomeIcon',
  render: () => null,
})

const runtime = useChatCaseRuntime({
  storageKey: geminiConversationStorageKey,
  initialConversations: geminiMockConversations,
})

const chatUi = {
  brand: { name: 'Gemini', logo: GeminiLogo },
  layout: {
    composer: {
      welcome: 'center' as const,
    },
    contentMaxWidth: 760,
    panelPadding: 12,
    panelGap: 16,
    leftAside: {
      mode: 'dock' as const,
      width: 288,
      collapsedWidth: 56,
      defaultOpen: false,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  welcome: { ...geminiWelcome, icon: h(EmptyWelcomeIcon) as any },
  history: false as const,
  prompts: false as const,
  model: false as const,
  mcp: false as const,
}

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
  <div class="gemini-case">
    <main class="gemini-case__chat">
      <TrChat :runtime="runtime" :ui="chatUi">
        <template #layout-header="{ isEmpty }">
          <GeminiHeader :is-empty="isEmpty" />
        </template>

        <template #layout-footer="slotProps">
          <GeminiComposer v-bind="slotProps" :model="runtime.composer.model!" />
        </template>

        <template #layout-left-aside="slotProps">
          <Teleport to="body">
            <GeminiRail
              v-if="!slotProps.isOpen"
              @open="slotProps.openLeftAside"
              @create="slotProps.createConversation"
            />
          </Teleport>
          <GeminiSidebar
            v-if="slotProps.isOpen"
            :conversation="slotProps.conversation"
            @create-conversation="slotProps.createConversation"
            @close="slotProps.closeLeftAside"
            @conversation-select="handleConversationSelect($event, slotProps.switchConversation)"
            @conversation-title-change="
              (title, id) => handleConversationTitleChange(title, id, slotProps.renameConversation)
            "
            @conversation-action="(action, id) => handleConversationAction(action, id, slotProps.deleteConversation)"
          />
        </template>
      </TrChat>
    </main>
  </div>
</template>

<style scoped>
.gemini-case {
  min-height: 100vh;
  overflow: hidden;
  color: #1f1f1f;
  background: #fff;
  --tr-chat-ui-left-aside-bg: #fff;
  --tr-chat-ui-header-bg: #fff;
  --tr-chat-ui-main-bg: #fff;
  --tr-chat-ui-footer-bg: #fff;
}

.gemini-case__chat {
  min-width: 0;
  min-height: 100vh;
}

.gemini-case__chat :deep(.tr-chat-ui) {
  min-height: 100vh;
}

.gemini-case__chat :deep(.chat-panel-content--header) {
  position: relative;
  z-index: 20;
  height: auto;
  min-height: 0;
  padding: 0;
  overflow: visible;
}

.gemini-case__chat :deep(.chat-left-aside-logo),
.gemini-case__chat :deep(.chat-left-aside-rail) {
  display: none;
}

.gemini-case__chat :deep(.chat-left-aside-panel) {
  padding: 0;
}

.gemini-case__chat :deep(.chat-panel) {
  background: radial-gradient(ellipse at center, #d9efff 0, #f5faff 36%, #fff 70%);
}

.gemini-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
}

.gemini-case__chat :deep(.tr-welcome__title) {
  color: #1f1f1f;
  font-size: 40px;
  font-weight: 400;
  line-height: 56px;
}

.gemini-case__chat :deep(.tr-welcome__description) {
  display: none;
}

.gemini-case__chat :deep(.chat-welcome-composer) {
  box-sizing: border-box;
  width: 100%;
  max-width: 660px;
  margin: 24px auto 0;
}

.gemini-case__chat :deep(.chat-panel-content--footer) {
  max-width: 660px;
}

.gemini-case__chat :deep(.chat-panel-content--main.is-message-state) {
  padding-top: 8px;
}

.gemini-case__chat :deep(.chat-panel-content--main.is-message-state .tr-chat-messages__bubble-list) {
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 0 32px;
}

@media (max-width: 959px) {
  .gemini-case__chat :deep(.chat-welcome-composer),
  .gemini-case__chat :deep(.chat-panel-content--footer) {
    max-width: none;
  }

  .gemini-case__chat :deep(.chat-welcome-composer) {
    padding: 0 8px;
  }

  .gemini-case__chat :deep(.tr-welcome__title) {
    font-size: 30px;
    line-height: 42px;
  }
}
</style>
