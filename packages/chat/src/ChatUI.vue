<script setup lang="ts">
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { TrLayout, useTheme } from '@opentiny/tiny-robot'
import type { HistoryMenuItem, PromptProps } from '@opentiny/tiny-robot'
import ChatAside from './ui/ChatAside.vue'
import ChatComposer from './ui/ChatComposer.vue'
import ChatHeader from './ui/ChatHeader.vue'
import ChatMessages from './ui/ChatMessages.vue'
import ScrollToBottom from './components/ScrollToBottom.vue'
import type {
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatHistoryUi,
  ChatConversationInfo,
  ChatSubmitPayload,
  ChatUILayout,
  ChatUIState,
  ChatUi,
} from './types'

const props = withDefaults(
  defineProps<{
    state: ChatUIState
    ui?: ChatUi
  }>(),
  {
    ui: () => ({}),
  },
)

const emit = defineEmits<{
  createConversation: []
  switchConversation: [id: string]
  renameConversation: [id: string, title: string]
  deleteConversation: [id: string]
  updateComposerValue: [value: string]
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
}>()

const leftAsideOpen = shallowRef(false)
const scrollTarget = shallowRef<HTMLElement | null>(null)
const composerDraft = shallowRef(props.state.composer.value ?? '')
const breakpoints = useBreakpoints({
  mobile: 0,
  desktop: 960,
})
const isMobileViewport = breakpoints.smaller('desktop')
const { width: viewportWidth } = useWindowSize()
const { resolvedColorMode, toggleColorMode } = useTheme()

const hasTheme = computed(() => Boolean(resolvedColorMode))
const currentColorMode = computed(() => resolvedColorMode?.value ?? 'light')
const historyUi = computed<ChatHistoryUi>(() => props.ui.history ?? {})
const layoutUi = computed<ChatUILayout | undefined>(() => props.ui.layout)
const leftAsideLayout = computed(() => layoutUi.value?.leftAside)
const rightAsideLayout = computed(() => layoutUi.value?.rightAside)
const isLeftAsideVisible = computed(() => leftAsideLayout.value?.visible !== false)
const isRightAsideVisible = computed(() => rightAsideLayout.value?.visible !== false)
const leftAsideMode = computed(() => (isMobileViewport.value ? 'drawer' : (leftAsideLayout.value?.mode ?? 'dock')))
const isLeftAsideDock = computed(() => leftAsideMode.value === 'dock')
const isLeftAsideDrawer = computed(() => leftAsideMode.value === 'drawer')
const bubbleRoleConfigs = computed(() => props.ui.bubbleList?.roleConfigs ?? { system: { hidden: true } })
const visibleMessages = computed(() => props.state.messages.filter((message) => !isMessageHidden(message.role)))
const isEmpty = computed(() => visibleMessages.value.length === 0)
const composerState = computed(() => ({
  ...props.state.composer,
  value: composerDraft.value,
  submitDisabled: props.state.composer.submitDisabled ?? composerDraft.value.trim().length === 0,
}))
const layoutStyle = computed(() => ({
  '--tr-chat-ui-content-max-width': toCssSize(layoutUi.value?.contentMaxWidth ?? 980),
  '--tr-chat-ui-panel-padding': toCssSize(layoutUi.value?.panelPadding ?? 12),
  '--tr-chat-ui-panel-gap': toCssSize(layoutUi.value?.panelGap ?? 12),
}))
const leftAsideOptions = computed(() => ({
  mode: leftAsideMode.value,
  open: leftAsideOpen.value,
  expandedWidth: toResponsiveAsideWidth(leftAsideLayout.value?.width, 300),
  collapsedWidth: isMobileViewport.value ? 0 : toLayoutSize(leftAsideLayout.value?.collapsedWidth, 56),
  collapseEffect: 'overlay' as const,
}))
const rightAsideOptions = computed(() => ({
  mode: rightAsideLayout.value?.mode ?? 'dock',
  defaultOpen: rightAsideLayout.value?.defaultOpen ?? true,
  expandedWidth: toLayoutSize(rightAsideLayout.value?.width, 320),
  collapsedWidth: toLayoutSize(rightAsideLayout.value?.collapsedWidth, 0),
  collapseEffect: 'overlay' as const,
}))

watch(
  () => props.state.composer.value,
  (value) => {
    composerDraft.value = value ?? ''
  },
)

watch(isMobileViewport, (isMobile) => {
  if (isMobile) {
    closeLeftAside()
  }
})

watch(
  () => leftAsideLayout.value?.defaultOpen,
  (defaultOpen) => {
    leftAsideOpen.value = typeof defaultOpen === 'boolean' ? defaultOpen : false
  },
  { immediate: true },
)

function toCssSize(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function toLayoutSize(value: string | number | undefined, fallback: number) {
  return typeof value === 'number' ? value : fallback
}

function toResponsiveAsideWidth(value: string | number | undefined, fallback: number) {
  const width = toLayoutSize(value, fallback)

  return isMobileViewport.value && viewportWidth.value > 0
    ? Math.min(width, Math.floor(viewportWidth.value * 0.86))
    : width
}

function isMessageHidden(role: string | undefined) {
  return role ? Boolean(bubbleRoleConfigs.value[role]?.hidden) : false
}

function handleCreateConversation() {
  emit('createConversation')

  if (isLeftAsideDrawer.value) {
    closeLeftAside()
  }
}

function handleSwitchConversation(item: ChatConversationInfo) {
  emit('switchConversation', item.id)

  if (isLeftAsideDrawer.value) {
    closeLeftAside()
  }
}

function handleRenameConversation(item: ChatConversationInfo, title: string) {
  emit('renameConversation', item.id, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatConversationInfo) {
  if (action.id === 'delete') {
    emit('deleteConversation', item.id)
  }
}

function openLeftAside() {
  leftAsideOpen.value = true
}

function closeLeftAside() {
  leftAsideOpen.value = false
}

function toggleLeftAside() {
  leftAsideOpen.value = !leftAsideOpen.value
}

function handleLeftAsideOpenChange(detail: { open: boolean }) {
  leftAsideOpen.value = detail.open
}

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  composerDraft.value = item.label
  emit('updateComposerValue', item.label)
  props.ui.prompts?.onItemClick?.(event, item)
}

function handleUpdateComposerValue(value: string) {
  composerDraft.value = value
  emit('updateComposerValue', value)
  props.ui.sender?.onInput?.(value)
}

function handleSubmit(payload: ChatSubmitPayload) {
  emit('submit', payload)
  composerDraft.value = ''
  emit('updateComposerValue', '')
  props.ui.sender?.onSubmit?.(payload)
}

function handleCancel() {
  emit('cancel')
  props.ui.sender?.onCancel?.()
}

function handleClear() {
  composerDraft.value = ''
  emit('updateComposerValue', '')
  emit('clear')
  props.ui.sender?.onClear?.()
}

function handleFocus(event: FocusEvent) {
  props.ui.sender?.onFocus?.(event)
}

function handleBlur(event: FocusEvent) {
  props.ui.sender?.onBlur?.(event)
}

function handleBubbleStateChange(payload: ChatBubbleStateChangePayload) {
  props.ui.bubbleList?.onStateChange?.(payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  props.ui.bubbleList?.onBubbleEvent?.(payload)
}
</script>

<template>
  <TrLayout
    class="tr-chat-ui"
    mode="normal"
    :style="layoutStyle"
    :left-aside="isLeftAsideVisible ? leftAsideOptions : undefined"
    :right-aside="$slots['right-aside'] && isRightAsideVisible ? rightAsideOptions : undefined"
    @left-aside-open-change="handleLeftAsideOpenChange"
  >
    <template v-if="isLeftAsideVisible" #left-aside>
      <ChatAside
        :conversation="state.conversation"
        :history="historyUi"
        :is-open="leftAsideOpen"
        :is-dock="isLeftAsideDock"
        @create-conversation="handleCreateConversation"
        @switch-conversation="handleSwitchConversation"
        @rename-conversation="handleRenameConversation"
        @history-action="handleHistoryAction"
        @open="openLeftAside"
        @close="closeLeftAside"
        @toggle="toggleLeftAside"
      >
        <template v-if="$slots['left-aside']" #default="slotProps">
          <slot name="left-aside" v-bind="slotProps" />
        </template>
      </ChatAside>
    </template>

    <template #header>
      <div class="chat-panel-content chat-panel-content--header">
        <ChatHeader
          :title="state.conversation.title"
          :is-empty="isEmpty"
          :is-left-aside-visible="isLeftAsideVisible"
          :is-left-aside-drawer="isLeftAsideDrawer"
          :is-left-aside-open="leftAsideOpen"
          :has-theme="hasTheme"
          :color-mode="currentColorMode"
          @create-conversation="handleCreateConversation"
          @open-left-aside="openLeftAside"
          @close-left-aside="closeLeftAside"
          @toggle-left-aside="toggleLeftAside"
          @toggle-color-mode="toggleColorMode"
        >
          <template v-if="$slots.notice" #notice>
            <slot name="notice" />
          </template>
          <template v-if="$slots.header" #default="slotProps">
            <slot name="header" v-bind="slotProps" />
          </template>
        </ChatHeader>
      </div>
    </template>

    <template #main>
      <section class="chat-panel">
        <div ref="scrollTarget" class="chat-main-scroll-host">
          <ChatMessages
            :messages="visibleMessages"
            :scroll-target="scrollTarget"
            :bubble-provider="props.ui.bubbleProvider"
            :bubble-list="props.ui.bubbleList"
            :welcome="props.ui.welcome"
            :prompts="props.ui.prompts"
            @prompt-click="handlePromptClick"
            @bubble-state-change="handleBubbleStateChange"
            @bubble-event="handleBubbleEvent"
          >
            <template v-if="$slots.main" #default="slotProps">
              <slot name="main" v-bind="slotProps" />
            </template>
            <template v-if="$slots['welcome-footer']" #welcome-footer>
              <slot name="welcome-footer" />
            </template>
            <template v-if="$slots['prompts-footer']" #prompts-footer>
              <slot name="prompts-footer" />
            </template>
            <template v-if="$slots.prefix" #prefix="slotProps">
              <slot name="prefix" v-bind="slotProps" />
            </template>
            <template v-if="$slots.suffix" #suffix="slotProps">
              <slot name="suffix" v-bind="slotProps" />
            </template>
            <template v-if="$slots.after" #after="slotProps">
              <slot name="after" v-bind="slotProps" />
            </template>
            <template v-if="$slots['content-footer']" #content-footer="slotProps">
              <slot name="content-footer" v-bind="slotProps" />
            </template>
          </ChatMessages>
          <div class="chat-scroll-actions">
            <ScrollToBottom :target="scrollTarget" />
          </div>
        </div>
      </section>
      <TrLayout.ProxyScrollbar :scroll-target="scrollTarget" />
    </template>

    <template #footer>
      <div class="chat-panel-content chat-panel-content--footer">
        <ChatComposer
          :composer="composerState"
          :sender="props.ui.sender ?? {}"
          :controls="props.ui.composer"
          @update-composer-value="handleUpdateComposerValue"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @clear="handleClear"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <template v-if="$slots.footer" #default="slotProps">
            <slot name="footer" v-bind="slotProps" />
          </template>
          <template v-if="$slots['sender-footer']" #sender-footer="slotProps">
            <slot name="sender-footer" v-bind="slotProps" />
          </template>
          <template v-if="$slots['sender-footer-right']" #sender-footer-right="slotProps">
            <slot name="sender-footer-right" v-bind="slotProps" />
          </template>
        </ChatComposer>
      </div>
    </template>

    <template v-if="$slots['right-aside'] && isRightAsideVisible" #right-aside>
      <slot name="right-aside"></slot>
    </template>
  </TrLayout>
</template>

<style scoped>
.tr-chat-ui {
  --tr-layout-height: 100%;
  --tr-layout-left-aside-bg: var(--tr-container-bg-default);
  --tr-layout-right-aside-bg: var(--tr-container-bg-default);
  --tr-layout-header-bg: var(--tr-container-bg-default);
  --tr-layout-main-bg: var(--tr-container-bg-default);
  --tr-layout-footer-bg: var(--tr-container-bg-default);
}

.chat-panel {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  padding: var(--tr-chat-ui-panel-padding);
}

.chat-main-scroll-host {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-panel-content {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  gap: var(--tr-chat-ui-panel-gap);
  width: 100%;
  max-width: var(--tr-chat-ui-content-max-width);
  min-height: 0;
  margin: 0 auto;
}

.chat-panel-content--header {
  padding: 24px 24px 0;
}

.chat-panel-content--main {
  min-height: 100%;
}

.chat-panel-content--footer {
  padding: 0 24px 24px;
}

.chat-scroll-actions {
  position: absolute;
  left: var(--tr-chat-ui-panel-padding);
  right: var(--tr-chat-ui-panel-padding);
  bottom: var(--tr-chat-ui-panel-padding);
  display: flex;
  justify-content: flex-end;
  max-width: var(--tr-chat-ui-content-max-width);
  margin: 0 auto;
  pointer-events: none;
}

.chat-scroll-actions :deep(.tr-chat-scroll-to-bottom) {
  pointer-events: auto;
}

@media (max-width: 959px) {
  .chat-panel-content--header {
    padding: 16px 16px 0;
  }

  .chat-panel-content--footer {
    padding: 0 16px 16px;
  }
}
</style>
