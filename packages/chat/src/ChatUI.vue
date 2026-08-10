<script setup lang="ts">
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { HistoryMenuItem, PromptProps } from '@opentiny/tiny-robot'
import ScrollToBottom from './components/ScrollToBottom.vue'
import ChatLeftAside from './ui/ChatLeftAside.vue'
import ChatComposer from './ui/ChatComposer.vue'
import ChatHeader from './ui/ChatHeader.vue'
import ChatMessages from './ui/ChatMessages.vue'
import ChatRightAside from './ui/ChatRightAside.vue'
import { resolveChatUIData } from './ui/resolveData'
import { resolveChatUIOptions } from './ui/resolveOptions'
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

const composerRef = shallowRef<{ setInputValue: (value: string) => void } | null>(null)
const leftAsideOpen = shallowRef(false)
const rightAsideOpen = shallowRef(false)
const scrollTarget = shallowRef<HTMLElement | null>(null)
const breakpoints = useBreakpoints({
  mobile: 0,
  desktop: 960,
})
const isMobileViewport = breakpoints.smaller('desktop')
const { width: viewportWidth } = useWindowSize()

const resolvedOptions = computed(() =>
  resolveChatUIOptions(props.ui, { hasRightAside: Boolean(slots['layout-right-aside']) }),
)
const resolvedData = computed(() => resolveChatUIData(props.data, resolvedOptions.value.labels))

const isHeaderVisible = computed(() => resolvedOptions.value.header !== false)
const leftAsideLayout = computed(() => resolvedOptions.value.layout.leftAside)
const rightAsideLayout = computed(() => resolvedOptions.value.layout.rightAside)
const historyOptions = computed(() =>
  resolvedOptions.value.history === false ? { menuItems: [] } : resolvedOptions.value.history,
)
const senderOptions = computed(() =>
  resolvedOptions.value.sender === false ? undefined : resolvedOptions.value.sender,
)
const visibleModel = computed(() => (resolvedOptions.value.model === false ? undefined : resolvedData.value.model))
const visibleMcp = computed(() => (resolvedOptions.value.mcp === false ? undefined : resolvedData.value.mcp))
const isSenderVisible = computed(() => resolvedOptions.value.sender !== false)
const isLeftAsideVisible = computed(() => leftAsideLayout.value !== false)
const isRightAsideVisible = computed(() => rightAsideLayout.value !== false)
const leftAsideMode = computed(() =>
  isMobileViewport.value ? 'drawer' : leftAsideLayout.value !== false ? leftAsideLayout.value.mode : 'dock',
)
const rightAsideMode = computed(() =>
  isMobileViewport.value ? 'drawer' : rightAsideLayout.value !== false ? rightAsideLayout.value.mode : 'dock',
)
const isLeftAsideDock = computed(() => leftAsideMode.value === 'dock')
const isLeftAsideDrawer = computed(() => leftAsideMode.value === 'drawer')
const bubbleRoleConfigs = computed(
  () => resolvedOptions.value.bubble.bubbleList.roleConfigs ?? { system: { hidden: true } },
)
const visibleMessages = computed(() =>
  resolvedData.value.bubble.messages.filter((message) => !isMessageHidden(message.role)),
)
const isEmpty = computed(() => visibleMessages.value.length === 0)
const layoutStyle = computed(() => ({
  '--tr-layout-left-aside-bg': 'var(--tr-chat-ui-left-aside-bg, var(--tr-container-bg-default))',
  '--tr-layout-right-aside-bg': 'var(--tr-chat-ui-right-aside-bg, var(--tr-container-bg-default))',
  '--tr-layout-header-bg': 'var(--tr-chat-ui-header-bg, var(--tr-container-bg-default))',
  '--tr-layout-main-bg': 'var(--tr-chat-ui-main-bg, var(--tr-container-bg-default))',
  '--tr-layout-footer-bg': 'var(--tr-chat-ui-footer-bg, var(--tr-container-bg-default))',
  '--tr-chat-ui-content-max-width': toCssSize(resolvedOptions.value.layout.contentMaxWidth),
  '--tr-chat-ui-panel-padding': toCssSize(resolvedOptions.value.layout.panelPadding),
  '--tr-chat-ui-panel-gap': toCssSize(resolvedOptions.value.layout.panelGap),
}))
const leftAsideOptions = computed(() => ({
  mode: leftAsideMode.value,
  open: leftAsideOpen.value,
  expandedWidth: toResponsiveAsideWidth(leftAsideLayout.value !== false ? leftAsideLayout.value.width : undefined, 300),
  collapsedWidth:
    isMobileViewport.value || leftAsideLayout.value === false
      ? 0
      : toLayoutSize(leftAsideLayout.value.collapsedWidth, 56),
  collapseEffect: 'overlay' as const,
}))
const mobileRightAsideWidth = computed(() =>
  isMobileViewport.value && viewportWidth.value > 0 ? viewportWidth.value : undefined,
)
const isRightAsideControlled = computed(
  () => rightAsideLayout.value !== false && typeof rightAsideLayout.value.open === 'boolean',
)
const resolvedRightAsideOpen = computed(() =>
  rightAsideLayout.value !== false ? (rightAsideLayout.value.open ?? rightAsideOpen.value) : false,
)
const rightAsideOptions = computed(() => ({
  mode: rightAsideMode.value,
  open: resolvedRightAsideOpen.value,
  expandedWidth:
    mobileRightAsideWidth.value ??
    toLayoutSize(rightAsideLayout.value !== false ? rightAsideLayout.value.width : undefined, 320),
  minExpandedWidth: mobileRightAsideWidth.value,
  maxExpandedWidth: mobileRightAsideWidth.value,
  collapsedWidth:
    isMobileViewport.value || rightAsideLayout.value === false
      ? 0
      : toLayoutSize(rightAsideLayout.value.collapsedWidth, 0),
  collapseEffect: 'overlay' as const,
}))

watch(isMobileViewport, (isMobile) => {
  if (isMobile) {
    closeLeftAside()
    closeRightAside()
  }
})

watch(
  () => (leftAsideLayout.value !== false ? leftAsideLayout.value.defaultOpen : false),
  (defaultOpen) => {
    leftAsideOpen.value = Boolean(defaultOpen)
  },
  { immediate: true },
)

watch(
  () => (rightAsideLayout.value !== false ? rightAsideLayout.value.defaultOpen : false),
  (defaultOpen) => {
    if (!isRightAsideControlled.value) {
      rightAsideOpen.value = Boolean(defaultOpen)
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

  if (action.id !== 'rename' && resolvedOptions.value.history !== false) {
    resolvedOptions.value.history.onItemAction?.(action, item)
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

function requestRightAsideOpen(open: boolean) {
  if (resolvedRightAsideOpen.value === open) {
    return
  }

  if (!isRightAsideControlled.value) {
    rightAsideOpen.value = open
  }

  if (rightAsideLayout.value !== false) {
    rightAsideLayout.value.onOpenChange?.({ open })
  }
}

function closeRightAside() {
  requestRightAsideOpen(false)
}

function handleRightAsideOpenChange(detail: { open: boolean }) {
  requestRightAsideOpen(detail.open)
}

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  composerRef.value?.setInputValue(item.label)

  if (resolvedOptions.value.prompts !== false) {
    resolvedOptions.value.prompts.onItemClick?.(event, item)
  }
}

function handleSubmit(payload: ChatSubmitPayload) {
  emit('submit', payload)

  if (senderOptions.value?.clearOnSubmit !== false) {
    composerRef.value?.setInputValue('')
  }
}

function handleCancel() {
  emit('cancel')
}

function handleClear() {
  emit('clear')
}

function handleBubbleStateChange(payload: ChatBubbleStateChangePayload) {
  resolvedOptions.value.bubble.bubbleList.onStateChange?.(payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  resolvedOptions.value.bubble.bubbleList.onBubbleEvent?.(payload)
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
      <ChatLeftAside
        :conversation="resolvedData.conversation"
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
        <template v-if="$slots['layout-left-aside']" #default>
          <slot name="layout-left-aside" />
        </template>
      </ChatLeftAside>
    </template>

    <template v-if="isHeaderVisible" #header>
      <div class="chat-panel-content chat-panel-content--header">
        <ChatHeader
          :title="resolvedData.conversation.title"
          :is-empty="isEmpty"
          :conversation="resolvedData.conversation"
          :is-left-aside-visible="isLeftAsideVisible"
          :is-left-aside-drawer="isLeftAsideDrawer"
          :is-left-aside-open="leftAsideOpen"
          :labels="resolvedOptions.labels"
          @create-conversation="handleCreateConversation"
          @open-left-aside="openLeftAside"
          @close-left-aside="closeLeftAside"
          @toggle-left-aside="toggleLeftAside"
        >
          <template v-if="$slots['header-notice']" #notice>
            <slot name="header-notice" />
          </template>
          <template v-if="$slots['layout-header']" #default>
            <slot name="layout-header" />
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
            :options="resolvedOptions.bubble"
            :welcome="resolvedOptions.welcome"
            :prompts="resolvedOptions.prompts"
            :labels="resolvedOptions.labels"
            @prompt-click="handlePromptClick"
            @bubble-state-change="handleBubbleStateChange"
            @bubble-event="handleBubbleEvent"
          >
            <template v-if="$slots['layout-main']" #default>
              <slot name="layout-main" />
            </template>
            <template v-if="$slots['welcome-footer']" #welcome-footer>
              <slot name="welcome-footer" />
            </template>
            <template v-if="$slots['prompts-footer']" #prompts-footer>
              <slot name="prompts-footer" />
            </template>
            <template v-if="$slots['bubble-prefix']" #bubble-prefix>
              <slot name="bubble-prefix" />
            </template>
            <template v-if="$slots['bubble-suffix']" #bubble-suffix>
              <slot name="bubble-suffix" />
            </template>
            <template v-if="$slots['bubble-after']" #bubble-after>
              <slot name="bubble-after" />
            </template>
            <template v-if="$slots['bubble-content-footer']" #bubble-content-footer>
              <slot name="bubble-content-footer" />
            </template>
          </ChatMessages>
        </div>
      </section>

      <div class="chat-scroll-actions">
        <ScrollToBottom :target="scrollTarget" />
      </div>
      <TrLayout.ProxyScrollbar :scroll-target="scrollTarget" />
    </template>

    <template v-if="isSenderVisible && senderOptions" #footer>
      <div class="chat-panel-content chat-panel-content--footer">
        <ChatComposer
          ref="composerRef"
          :sender="resolvedData.sender"
          :sender-options="senderOptions"
          :labels="resolvedOptions.labels"
          :model="visibleModel"
          :mcp="visibleMcp"
          :model-options="resolvedOptions.model"
          :mcp-options="resolvedOptions.mcp"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @clear="handleClear"
        >
          <template v-if="$slots['layout-footer']" #default>
            <slot name="layout-footer" />
          </template>
          <template v-if="$slots['sender-footer']" #sender-footer>
            <slot name="sender-footer" />
          </template>
          <template v-if="$slots['sender-footer-right']" #sender-footer-right>
            <slot name="sender-footer-right" />
          </template>
        </ChatComposer>
      </div>
    </template>

    <template v-if="isRightAsideVisible" #right-aside>
      <ChatRightAside
        :show-close="rightAsideLayout !== false ? rightAsideLayout.showClose : true"
        @close="closeRightAside"
      >
        <template #title>
          <slot name="layout-right-aside-title">
            <h2 class="chat-right-aside-title">{{ resolvedOptions.labels.rightAsideTitle }}</h2>
          </slot>
        </template>
        <slot name="layout-right-aside" />
      </ChatRightAside>
    </template>
  </TrLayout>
</template>

<style scoped>
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

.chat-right-aside-title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
