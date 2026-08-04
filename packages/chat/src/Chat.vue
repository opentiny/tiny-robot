<script setup lang="ts">
import { computed, toRef } from 'vue'
import ChatUI from './ChatUI.vue'
import { useChatInput } from '@/composables/useChatInput'
import type {
  ChatFooterSlotProps,
  ChatHeaderSlotProps,
  ChatHistorySlotProps,
  ChatMainSlotProps,
  ChatMessageItem,
  ChatRuntime,
  ChatSubmitPayload,
  ChatUi,
  ChatUILayout,
  ChatUIState,
} from '@/types'

const props = withDefaults(
  defineProps<{
    runtime: ChatRuntime
    ui?: ChatUi
    title?: string
  }>(),
  {
    ui: () => ({}),
  },
)

const runtimeRef = toRef(() => props.runtime)
const uiRef = toRef(() => props.ui)
const input = useChatInput(runtimeRef)

const activeConversation = computed(() => runtimeRef.value.activeConversation.value)
const conversationItems = computed(() => runtimeRef.value.conversations.value)
const activeMessages = computed(() => activeConversation.value?.messages ?? [])
const visibleMessages = computed(() => activeMessages.value.filter((message) => !isMessageHidden(message)))
const requestState = computed(() => activeConversation.value?.requestState ?? 'idle')
const processingState = computed(() => activeConversation.value?.processingState)
const lastError = computed(() => activeConversation.value?.lastError ?? null)
const senderDisabled = computed(() => runtimeRef.value.composer.disabled.value)
const currentTitle = computed(() => props.title || activeConversation.value?.title || '新对话')

const state = computed<ChatUIState>(() => ({
  conversation: {
    items: conversationItems.value,
    activeId: activeConversation.value?.id ?? null,
    title: currentTitle.value,
  },
  messages: visibleMessages.value,
  composer: {
    value: input.inputValue.value,
    loading: requestState.value === 'processing',
    disabled: senderDisabled.value,
    submitDisabled: input.submitDisabled.value,
  },
}))

const resolvedUi = computed<ChatUi>(() => ({
  ...uiRef.value,
  layout: resolveChatUILayout(uiRef.value.layout),
  composer: {
    model: runtimeRef.value.composer.model,
    mcp: runtimeRef.value.composer.mcp,
    ...uiRef.value.composer,
  },
}))

const headerSlotProps = computed<ChatHeaderSlotProps>(() => ({
  title: currentTitle.value,
  requestState: requestState.value,
  processingState: processingState.value,
  lastError: lastError.value,
  createConversation: runtimeRef.value.actions.createConversation,
}))

const historySlotProps = computed<ChatHistorySlotProps>(() => ({
  items: conversationItems.value,
  activeId: activeConversation.value?.id ?? null,
  switchConversation: runtimeRef.value.actions.switchConversation,
  renameConversation: runtimeRef.value.actions.renameConversation,
  deleteConversation: runtimeRef.value.actions.deleteConversation,
  createConversation: runtimeRef.value.actions.createConversation,
}))

const mainSlotProps = computed<ChatMainSlotProps>(() => ({
  messages: activeMessages.value,
  requestState: requestState.value,
  processingState: processingState.value,
  lastError: lastError.value,
}))

const footerSlotProps = computed<ChatFooterSlotProps>(() => ({
  inputValue: input.inputValue.value,
  setInputValue: input.setInputValue,
  send: input.send,
  abort: input.abort,
  disabled: senderDisabled.value,
  loading: requestState.value === 'processing',
  submitDisabled: input.submitDisabled.value,
}))

function isMessageHidden(message: ChatMessageItem) {
  const role = message.role

  if (!role) {
    return false
  }

  return Boolean(uiRef.value.bubbleList?.roleConfigs?.[role]?.hidden)
}

function resolveChatUILayout(layout: ChatUi['layout']): ChatUILayout | undefined {
  if (!layout) {
    return undefined
  }

  const nextLayout = layout as ChatUILayout & {
    leftAside?: ChatUILayout['leftAside'] & {
      open?: boolean
      expandedWidth?: string | number
    }
    rightAside?: ChatUILayout['rightAside'] & {
      open?: boolean
      expandedWidth?: string | number
    }
  }

  return {
    contentMaxWidth: nextLayout.contentMaxWidth,
    panelPadding: nextLayout.panelPadding,
    panelGap: nextLayout.panelGap,
    leftAside: nextLayout.leftAside
      ? {
          visible: nextLayout.leftAside.visible,
          mode: nextLayout.leftAside.mode,
          width: nextLayout.leftAside.width ?? nextLayout.leftAside.expandedWidth,
          collapsedWidth: nextLayout.leftAside.collapsedWidth,
          defaultOpen: nextLayout.leftAside.defaultOpen ?? nextLayout.leftAside.open,
        }
      : undefined,
    rightAside: nextLayout.rightAside
      ? {
          visible: nextLayout.rightAside.visible,
          mode: nextLayout.rightAside.mode,
          width: nextLayout.rightAside.width ?? nextLayout.rightAside.expandedWidth,
          collapsedWidth: nextLayout.rightAside.collapsedWidth,
          defaultOpen: nextLayout.rightAside.defaultOpen ?? nextLayout.rightAside.open,
        }
      : undefined,
  }
}

function handleCreateConversation() {
  runtimeRef.value.actions.createConversation()
}

function handleSwitchConversation(id: string) {
  runtimeRef.value.actions.switchConversation(id)
}

function handleRenameConversation(id: string, title: string) {
  runtimeRef.value.actions.renameConversation(id, title)
}

function handleDeleteConversation(id: string) {
  runtimeRef.value.actions.deleteConversation(id)
}

function handleSubmit(payload: ChatSubmitPayload) {
  input.send(payload)
}

function handleCancel() {
  input.abort?.()
}

function handleClear() {
  input.setInputValue('')
}
</script>

<template>
  <ChatUI
    :state="state"
    :ui="resolvedUi"
    @create-conversation="handleCreateConversation"
    @switch-conversation="handleSwitchConversation"
    @rename-conversation="handleRenameConversation"
    @delete-conversation="handleDeleteConversation"
    @update-composer-value="input.setInputValue"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @clear="handleClear"
  >
    <template v-if="$slots['left-aside']" #left-aside>
      <slot name="left-aside" v-bind="historySlotProps" />
    </template>

    <template v-if="$slots.header" #header>
      <slot name="header" v-bind="headerSlotProps" />
    </template>

    <template v-if="$slots.main" #main>
      <slot name="main" v-bind="mainSlotProps" />
    </template>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" v-bind="footerSlotProps" />
    </template>

    <template v-if="$slots['sender-footer']" #sender-footer="slotProps">
      <slot name="sender-footer" v-bind="slotProps" />
    </template>

    <template v-if="$slots['sender-footer-right']" #sender-footer-right="slotProps">
      <slot name="sender-footer-right" v-bind="slotProps" />
    </template>
  </ChatUI>
</template>
