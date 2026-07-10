<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { TrLayout, type LayoutProps } from '@opentiny/tiny-robot'
import { chatContextKey } from '@/context'
import { Conversations, Header, Messages, ScrollToBottom, Sender } from '@/components'
import { useChatComposer } from '@/composables/useChatComposer'
import type {
  ChatFooterSlotProps,
  ChatHeaderSlotProps,
  ChatHistorySlotProps,
  ChatMainSlotProps,
  ChatRuntime,
  ChatUi,
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

const composer = useChatComposer(props.runtime)

provide(chatContextKey, {
  runtime: props.runtime,
  composer,
  ui: props.ui,
})

const messagesRef = ref<InstanceType<typeof Messages> | null>(null)
const isEmpty = computed(() => props.runtime.messages.items.value.length === 0)
const messagesScrollTarget = computed(() => messagesRef.value?.scrollTarget ?? null)
const layoutProps = computed<LayoutProps>(() => {
  if (props.ui.layout?.mode === 'floating') {
    return props.ui.layout
  }

  return {
    mode: 'normal' as const,
    ...props.ui.layout,
  }
})
const currentConversation = computed(() =>
  props.runtime.conversations?.items.value.find((item) => item.id === props.runtime.conversations?.currentId.value),
)
const currentTitle = computed(() => props.title || currentConversation.value?.title || '新对话')
const lastError = computed(() => props.runtime.messages.lastError?.value ?? null)

const headerSlotProps = computed<ChatHeaderSlotProps>(() => ({
  title: currentTitle.value,
  requestState: props.runtime.messages.requestState.value,
  processingState: props.runtime.messages.processingState.value,
  lastError: lastError.value,
  createConversation: props.runtime.actions.createConversation,
}))

const historySlotProps = computed<ChatHistorySlotProps>(() => ({
  items: props.runtime.conversations?.items.value ?? [],
  currentId: props.runtime.conversations?.currentId.value ?? null,
  switchConversation: props.runtime.actions.switchConversation,
  renameConversation: props.runtime.actions.renameConversation,
  deleteConversation: props.runtime.actions.deleteConversation,
  createConversation: props.runtime.actions.createConversation,
}))

const mainSlotProps = computed<ChatMainSlotProps>(() => ({
  messages: props.runtime.messages.items.value,
  requestState: props.runtime.messages.requestState.value,
  processingState: props.runtime.messages.processingState.value,
  lastError: lastError.value,
}))

const footerSlotProps = computed<ChatFooterSlotProps>(() => ({
  inputValue: composer.inputValue.value,
  setInputValue: composer.setInputValue,
  send: composer.send,
  abort: composer.abort,
  disabled: props.runtime.sender.disabled.value,
  loading: props.runtime.sender.loading.value,
  submitDisabled: composer.submitDisabled.value,
}))
</script>

<template>
  <TrLayout v-bind="layoutProps">
    <template #left-aside>
      <slot name="left-aside" v-bind="historySlotProps">
        <Conversations />
      </slot>
    </template>

    <template #header>
      <slot name="header" v-bind="headerSlotProps">
        <Header :title="currentTitle" />
      </slot>
    </template>

    <template #main>
      <div class="tr-chat__thread" :class="{ 'tr-chat__thread--empty': isEmpty }">
        <div class="tr-chat__content-shell">
          <div class="tr-chat__main-inner">
            <slot name="main" v-bind="mainSlotProps">
              <Messages ref="messagesRef" :is-empty="isEmpty" />
            </slot>
          </div>

          <div class="tr-chat__footer-inner">
            <ScrollToBottom :target="messagesScrollTarget" />
            <slot name="footer" v-bind="footerSlotProps">
              <Sender />
            </slot>
          </div>
        </div>

        <TrLayout.ProxyScrollbar :scroll-target="messagesScrollTarget" />
      </div>
    </template>
  </TrLayout>
</template>

<style lang="less" scoped>
.tr-chat__thread {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.tr-chat__content-shell {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding-inline: var(--tr-chat-content-gutter, clamp(12px, 3vw, 24px));
  box-sizing: border-box;
}

.tr-chat__thread--empty .tr-chat__content-shell {
  justify-content: center;
}

.tr-chat__main-inner,
.tr-chat__footer-inner {
  width: 100%;
  max-width: var(--tr-chat-content-max-width, 760px);
  margin-top: var(--tr-chat-empty-footer-gap, 24px);
  margin-inline: auto;
}

.tr-chat__footer-inner {
  position: relative;
}

.tr-chat__main-inner {
  min-height: 0;
}

.tr-chat__thread:not(.tr-chat__thread--empty) .tr-chat__main-inner {
  flex: 1;
}

.tr-chat__thread:not(.tr-chat__thread--empty) .tr-chat__footer-inner {
  flex-shrink: 0;
}
</style>
