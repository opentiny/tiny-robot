<script setup lang="ts">
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { TrLayout, useTheme } from '@opentiny/tiny-robot'
import type { HistoryMenuItem, PromptProps } from '@opentiny/tiny-robot'
import ScrollToBottom from './components/ScrollToBottom.vue'
import { useControllableComposer } from './composables/useControllableComposer'
import ChatAside from './ui/ChatAside.vue'
import ChatComposer from './ui/ChatComposer.vue'
import ChatHeader from './ui/ChatHeader.vue'
import ChatMessages from './ui/ChatMessages.vue'
import ChatRightAsidePanel from './ui/ChatRightAsidePanel.vue'
import { resolveChatUIOptions } from './ui/resolveOptions'
import { resolveChatViewState } from './ui/resolveState'
import type {
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatConversationInfo,
  ChatSubmitPayload,
  ChatUIEmits,
  ChatUIProps,
  ChatUISlots,
} from './types'

const props = defineProps<ChatUIProps>()
const emit = defineEmits<ChatUIEmits>()
const slots = defineSlots<ChatUISlots>()

const leftAsideOpen = shallowRef(false)
const rightAsideOpen = shallowRef(false)
const scrollTarget = shallowRef<HTMLElement | null>(null)
const breakpoints = useBreakpoints({
  mobile: 0,
  desktop: 960,
})
const isMobileViewport = breakpoints.smaller('desktop')
const { width: viewportWidth } = useWindowSize()
const { resolvedColorMode, toggleColorMode } = useTheme()

const resolvedOptions = computed(() => resolveChatUIOptions(props.ui, { hasRightAside: Boolean(slots['right-aside']) }))
const resolvedState = computed(() => resolveChatViewState(props.state, resolvedOptions.value.labels))
const composer = useControllableComposer({
  value: () => props.composerValue,
  defaultValue: () => props.defaultComposerValue,
  onUpdate: (value) => emit('update:composerValue', value),
})

const hasTheme = computed(() => Boolean(resolvedColorMode))
const currentColorMode = computed(() => resolvedColorMode?.value ?? 'light')
const isHeaderVisible = computed(() => resolvedOptions.value.header !== false)
const isComposerVisible = computed(() => resolvedOptions.value.composer !== false)
const isLeftAsideVisible = computed(() => resolvedOptions.value.leftAside !== false)
const isRightAsideVisible = computed(() => resolvedOptions.value.rightAside !== false)
const leftAsideLayout = computed(() =>
  resolvedOptions.value.leftAside === false ? undefined : resolvedOptions.value.leftAside,
)
const rightAsideLayout = computed(() =>
  resolvedOptions.value.rightAside === false ? undefined : resolvedOptions.value.rightAside,
)
const leftAsideMode = computed(() => (isMobileViewport.value ? 'drawer' : (leftAsideLayout.value?.mode ?? 'dock')))
const rightAsideMode = computed(() => (isMobileViewport.value ? 'drawer' : (rightAsideLayout.value?.mode ?? 'dock')))
const isLeftAsideDock = computed(() => leftAsideMode.value === 'dock')
const isLeftAsideDrawer = computed(() => leftAsideMode.value === 'drawer')
const bubbleRoleConfigs = computed(
  () => resolvedOptions.value.messages.bubbleList?.roleConfigs ?? { system: { hidden: true } },
)
const visibleMessages = computed(() => resolvedState.value.messages.filter((message) => !isMessageHidden(message.role)))
const isEmpty = computed(() => visibleMessages.value.length === 0)
const composerState = computed(() => ({
  ...resolvedState.value.composer,
  value: composer.value.value,
  submitDisabled:
    resolvedState.value.composer.disabled ||
    resolvedState.value.composer.submitDisabled ||
    composer.value.value.trim().length === 0,
}))
const layoutStyle = computed(() => ({
  '--tr-chat-ui-content-max-width': toCssSize(resolvedOptions.value.layout.contentMaxWidth ?? 980),
  '--tr-chat-ui-panel-padding': toCssSize(resolvedOptions.value.layout.panelPadding ?? 12),
  '--tr-chat-ui-panel-gap': toCssSize(resolvedOptions.value.layout.panelGap ?? 12),
}))
const leftAsideOptions = computed(() => ({
  mode: leftAsideMode.value,
  open: leftAsideOpen.value,
  expandedWidth: toResponsiveAsideWidth(leftAsideLayout.value?.width, 300),
  collapsedWidth: isMobileViewport.value ? 0 : toLayoutSize(leftAsideLayout.value?.collapsedWidth, 56),
  collapseEffect: 'overlay' as const,
}))
const mobileRightAsideWidth = computed(() =>
  isMobileViewport.value && viewportWidth.value > 0 ? viewportWidth.value : undefined,
)
const isRightAsideControlled = computed(() => typeof rightAsideLayout.value?.open === 'boolean')
const resolvedRightAsideOpen = computed(() => rightAsideLayout.value?.open ?? rightAsideOpen.value)

const rightAsideOptions = computed(() => ({
  mode: rightAsideMode.value,
  open: resolvedRightAsideOpen.value,
  expandedWidth: mobileRightAsideWidth.value ?? toLayoutSize(rightAsideLayout.value?.width, 320),
  minExpandedWidth: mobileRightAsideWidth.value,
  maxExpandedWidth: mobileRightAsideWidth.value,
  collapsedWidth: isMobileViewport.value ? 0 : toLayoutSize(rightAsideLayout.value?.collapsedWidth, 0),
  collapseEffect: 'overlay' as const,
}))
const historyOptions = computed(() =>
  resolvedOptions.value.history === false ? { menuItems: [] } : resolvedOptions.value.history,
)
const composerOptions = computed(() =>
  resolvedOptions.value.composer === false ? undefined : resolvedOptions.value.composer,
)

watch(isMobileViewport, (isMobile) => {
  if (isMobile) {
    closeLeftAside()
    closeRightAside()
  }
})

watch(
  () => leftAsideLayout.value?.defaultOpen,
  (defaultOpen) => {
    leftAsideOpen.value = typeof defaultOpen === 'boolean' ? defaultOpen : false
  },
  { immediate: true },
)

watch(
  () => rightAsideLayout.value?.defaultOpen,
  (defaultOpen) => {
    if (!isRightAsideControlled.value) {
      rightAsideOpen.value = typeof defaultOpen === 'boolean' ? defaultOpen : false
    }
  },
  { immediate: true },
)

function toCssSize(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function toLayoutSize(value: number | undefined, fallback: number) {
  return typeof value === 'number' ? value : fallback
}

function toResponsiveAsideWidth(value: number | undefined, fallback: number) {
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
  emit('switchConversation', { id: item.id })

  if (isLeftAsideDrawer.value) {
    closeLeftAside()
  }
}

function handleRenameConversation(item: ChatConversationInfo, title: string) {
  emit('renameConversation', { id: item.id, title })
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatConversationInfo) {
  if (action.id === 'delete') {
    emit('deleteConversation', { id: item.id })
    return
  }

  if (action.id !== 'rename') {
    emit('historyAction', { action, conversation: item })
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

function setRightAsideOpen(open: boolean) {
  if (rightAsideOpen.value === open) {
    return
  }

  rightAsideOpen.value = open
  emit('rightAsideOpenChange', { open })
}

function closeRightAside() {
  setRightAsideOpen(false)
}

function handleRightAsideOpenChange(detail: { open: boolean }) {
  setRightAsideOpen(detail.open)
}

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  composer.setValue(item.label)
  emit('promptClick', { event, item })
}

function handleUpdateComposerValue(value: string) {
  composer.setValue(value)
}

function handleSubmit(payload: ChatSubmitPayload) {
  emit('submit', payload)

  if (composerOptions.value?.clearOnSubmit !== false) {
    composer.setValue('')
  }
}

function handleCancel() {
  emit('cancel')
}

function handleClear() {
  composer.setValue('')
  emit('clear')
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleBubbleStateChange(payload: ChatBubbleStateChangePayload) {
  emit('bubbleStateChange', payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  emit('bubbleEvent', payload)
}
</script>

<template>
  <TrLayout
    class="tr-chat-ui"
    mode="normal"
    :style="layoutStyle"
    :left-aside="isLeftAsideVisible ? leftAsideOptions : undefined"
    :right-aside="isRightAsideVisible ? rightAsideOptions : undefined"
    @left-aside-open-change="handleLeftAsideOpenChange"
    @right-aside-open-change="handleRightAsideOpenChange"
  >
    <template v-if="isLeftAsideVisible" #left-aside>
      <ChatAside
        :conversation="resolvedState.conversation"
        :history="historyOptions"
        :brand="resolvedOptions.brand"
        :labels="resolvedOptions.labels"
        :is-open="leftAsideOpen"
        :is-dock="isLeftAsideDock"
        :show-history="resolvedOptions.history !== false"
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

    <template v-if="isHeaderVisible" #header>
      <div class="chat-panel-content chat-panel-content--header">
        <ChatHeader
          :title="resolvedState.conversation.title"
          :is-empty="isEmpty"
          :conversation="resolvedState.conversation"
          :is-left-aside-visible="isLeftAsideVisible"
          :is-left-aside-drawer="isLeftAsideDrawer"
          :is-left-aside-open="leftAsideOpen"
          :has-theme="hasTheme && resolvedOptions.header !== false && resolvedOptions.header.showThemeToggle !== false"
          :color-mode="currentColorMode"
          :labels="resolvedOptions.labels"
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
            :options="resolvedOptions.messages"
            :welcome="resolvedOptions.welcome"
            :prompts="resolvedOptions.prompts"
            :labels="resolvedOptions.labels"
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

    <template v-if="isComposerVisible && composerOptions" #footer>
      <div class="chat-panel-content chat-panel-content--footer">
        <ChatComposer
          :composer="composerState"
          :options="composerOptions"
          :labels="resolvedOptions.labels"
          :model="resolvedState.model"
          :mcp="resolvedState.mcp"
          @update-composer-value="handleUpdateComposerValue"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @clear="handleClear"
          @focus="handleFocus"
          @blur="handleBlur"
          @select-model="emit('selectModel', $event)"
          @update-model-feature="emit('updateModelFeature', $event)"
          @add-mcp-server="emit('addMcpServer', $event)"
          @remove-mcp-server="emit('removeMcpServer', $event)"
          @load-mcp-tools="emit('loadMcpTools', $event)"
          @update-mcp-server-enabled="emit('updateMcpServerEnabled', $event)"
          @update-mcp-tool-enabled="emit('updateMcpToolEnabled', $event)"
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

    <template v-if="isRightAsideVisible" #right-aside>
      <ChatRightAsidePanel
        :title="rightAsideLayout?.title"
        :show-close="rightAsideLayout?.showClose"
        @close="closeRightAside"
      >
        <slot name="right-aside"></slot>
      </ChatRightAsidePanel>
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
