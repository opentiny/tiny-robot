<script setup lang="ts">
import { computed, provide, ref, toRef } from 'vue'
import {
  TrLayout,
  type LayoutAsideOpenDetail,
  type LayoutAsideOpenValue,
  type LayoutAsideResizeDetail,
  type LayoutAsideResizeValue,
  type LayoutFloatingDragDetail,
  type LayoutFloatingProps,
  type LayoutFloatingResizeDetail,
  type LayoutFloatingState,
  type LayoutProps,
} from '@opentiny/tiny-robot'
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

const runtime = toRef(() => props.runtime)
const ui = toRef(() => props.ui)
const composer = useChatComposer(runtime)

provide(chatContextKey, {
  runtime,
  composer,
  ui,
})

const messagesRef = ref<InstanceType<typeof Messages> | null>(null)
const isEmpty = computed(() => props.runtime.messages.items.value.length === 0)
const messagesScrollTarget = computed(() => messagesRef.value?.scrollTarget ?? null)

const layoutUi = computed(() => props.ui.layout)
const layoutProps = computed<LayoutProps>(() => {
  if (!layoutUi.value) {
    return {
      mode: 'normal' as const,
    }
  }

  const {
    'onUpdate:floatingState': _onUpdateFloatingState,
    onFloatingDragStart: _onFloatingDragStart,
    onFloatingDrag: _onFloatingDrag,
    onFloatingDragEnd: _onFloatingDragEnd,
    onFloatingResizeStart: _onFloatingResizeStart,
    onFloatingResize: _onFloatingResize,
    onFloatingResizeEnd: _onFloatingResizeEnd,
    onAsideOpenChange: _onAsideOpenChange,
    onAsideResizeStart: _onAsideResizeStart,
    onAsideResize: _onAsideResize,
    onAsideResizeEnd: _onAsideResizeEnd,
    onLeftAsideOpenChange: _onLeftAsideOpenChange,
    onLeftAsideResizeStart: _onLeftAsideResizeStart,
    onLeftAsideResize: _onLeftAsideResize,
    onLeftAsideResizeEnd: _onLeftAsideResizeEnd,
    onRightAsideOpenChange: _onRightAsideOpenChange,
    onRightAsideResizeStart: _onRightAsideResizeStart,
    onRightAsideResize: _onRightAsideResize,
    onRightAsideResizeEnd: _onRightAsideResizeEnd,
    ...nextLayoutProps
  } = layoutUi.value

  if (nextLayoutProps.mode === 'floating') {
    return nextLayoutProps as LayoutFloatingProps
  }

  return {
    mode: 'normal' as const,
    ...nextLayoutProps,
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
  loading: props.runtime.messages.requestState.value === 'processing',
  submitDisabled: composer.submitDisabled.value,
}))

function handleFloatingStateChange(value: LayoutFloatingState) {
  layoutUi.value?.['onUpdate:floatingState']?.(value)
}

function handleFloatingDragStart(detail: LayoutFloatingDragDetail) {
  layoutUi.value?.onFloatingDragStart?.(detail)
}

function handleFloatingDrag(detail: LayoutFloatingDragDetail) {
  layoutUi.value?.onFloatingDrag?.(detail)
}

function handleFloatingDragEnd(detail: LayoutFloatingDragDetail) {
  layoutUi.value?.onFloatingDragEnd?.(detail)
}

function handleFloatingResizeStart(detail: LayoutFloatingResizeDetail) {
  layoutUi.value?.onFloatingResizeStart?.(detail)
}

function handleFloatingResize(detail: LayoutFloatingResizeDetail) {
  layoutUi.value?.onFloatingResize?.(detail)
}

function handleFloatingResizeEnd(detail: LayoutFloatingResizeDetail) {
  layoutUi.value?.onFloatingResizeEnd?.(detail)
}

function handleAsideOpenChange(detail: LayoutAsideOpenDetail) {
  layoutUi.value?.onAsideOpenChange?.(detail)
}

function handleAsideResizeStart(detail: LayoutAsideResizeDetail) {
  layoutUi.value?.onAsideResizeStart?.(detail)
}

function handleAsideResize(detail: LayoutAsideResizeDetail) {
  layoutUi.value?.onAsideResize?.(detail)
}

function handleAsideResizeEnd(detail: LayoutAsideResizeDetail) {
  layoutUi.value?.onAsideResizeEnd?.(detail)
}

function handleLeftAsideOpenChange(detail: LayoutAsideOpenValue) {
  layoutUi.value?.onLeftAsideOpenChange?.(detail)
}

function handleLeftAsideResizeStart(detail: LayoutAsideResizeValue) {
  layoutUi.value?.onLeftAsideResizeStart?.(detail)
}

function handleLeftAsideResize(detail: LayoutAsideResizeValue) {
  layoutUi.value?.onLeftAsideResize?.(detail)
}

function handleLeftAsideResizeEnd(detail: LayoutAsideResizeValue) {
  layoutUi.value?.onLeftAsideResizeEnd?.(detail)
}

function handleRightAsideOpenChange(detail: LayoutAsideOpenValue) {
  layoutUi.value?.onRightAsideOpenChange?.(detail)
}

function handleRightAsideResizeStart(detail: LayoutAsideResizeValue) {
  layoutUi.value?.onRightAsideResizeStart?.(detail)
}

function handleRightAsideResize(detail: LayoutAsideResizeValue) {
  layoutUi.value?.onRightAsideResize?.(detail)
}

function handleRightAsideResizeEnd(detail: LayoutAsideResizeValue) {
  layoutUi.value?.onRightAsideResizeEnd?.(detail)
}
</script>

<template>
  <TrLayout
    v-bind="layoutProps"
    @update:floating-state="handleFloatingStateChange"
    @floating-drag-start="handleFloatingDragStart"
    @floating-drag="handleFloatingDrag"
    @floating-drag-end="handleFloatingDragEnd"
    @floating-resize-start="handleFloatingResizeStart"
    @floating-resize="handleFloatingResize"
    @floating-resize-end="handleFloatingResizeEnd"
    @aside-open-change="handleAsideOpenChange"
    @aside-resize-start="handleAsideResizeStart"
    @aside-resize="handleAsideResize"
    @aside-resize-end="handleAsideResizeEnd"
    @left-aside-open-change="handleLeftAsideOpenChange"
    @left-aside-resize-start="handleLeftAsideResizeStart"
    @left-aside-resize="handleLeftAsideResize"
    @left-aside-resize-end="handleLeftAsideResizeEnd"
    @right-aside-open-change="handleRightAsideOpenChange"
    @right-aside-resize-start="handleRightAsideResizeStart"
    @right-aside-resize="handleRightAsideResize"
    @right-aside-resize-end="handleRightAsideResizeEnd"
  >
    <template v-if="props.runtime.conversations || $slots['left-aside']" #left-aside>
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
