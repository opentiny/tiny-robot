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

const isControlledInput = props.inputValue !== undefined
const draftValue = shallowRef(props.inputValue ?? props.defaultInputValue ?? '')
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
const inputValue = computed(() => (isControlledInput ? (props.inputValue ?? '') : draftValue.value))

const isHeaderVisible = computed(() => resolvedOptions.value.header !== false)
const leftAsideLayout = computed(() => resolvedOptions.value.layout.leftAside)
const rightAsideLayout = computed(() => resolvedOptions.value.layout.rightAside)
const leftAsideOpen = shallowRef(
  leftAsideLayout.value !== false ? (leftAsideLayout.value.open ?? leftAsideLayout.value.defaultOpen) : false,
)
const rightAsideOpen = shallowRef(
  rightAsideLayout.value !== false ? (rightAsideLayout.value.open ?? rightAsideLayout.value.defaultOpen) : false,
)
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
const resolvedLeftAsideOpen = computed(() =>
  leftAsideLayout.value !== false ? (leftAsideLayout.value.open ?? leftAsideOpen.value) : false,
)
const bubbleRoleConfigs = computed(
  () => resolvedOptions.value.bubble.bubbleList.roleConfigs ?? { system: { hidden: true } },
)
const visibleMessages = computed(() =>
  resolvedData.value.bubble.messages.filter((message) => !isMessageHidden(message.role)),
)
const isEmpty = computed(() => visibleMessages.value.length === 0)
const requestError = computed(() => resolvedData.value.request?.error)
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
  open: resolvedLeftAsideOpen.value,
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
    requestLeftAsideOpen(false, 'viewport')
    requestRightAsideOpen(false, 'viewport')
  }
})

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
  emit('create-conversation')

  if (isLeftAsideDrawer.value) {
    requestLeftAsideOpen(false, 'user')
  }
}

function handleSwitchConversation(item: { id: string }) {
  emit('switch-conversation', { id: item.id })

  if (isLeftAsideDrawer.value) {
    requestLeftAsideOpen(false, 'user')
  }
}

function handleRenameConversation(item: { id: string }, title: string) {
  emit('rename-conversation', { id: item.id, title })
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatConversationInfo) {
  emit('history-action', { action, conversation: item })
}

function handleDeleteConversation(item: ChatConversationInfo) {
  emit('delete-conversation', { id: item.id })
}

function requestLeftAsideOpen(open: boolean, source: 'user' | 'viewport') {
  if (resolvedLeftAsideOpen.value === open) {
    return
  }

  if (leftAsideLayout.value !== false && leftAsideLayout.value.open === undefined) {
    leftAsideOpen.value = open
  }

  emit('left-aside-open-change', { open, source })
}

function openLeftAside() {
  requestLeftAsideOpen(true, 'user')
}

function closeLeftAside() {
  requestLeftAsideOpen(false, 'user')
}

function toggleLeftAside() {
  requestLeftAsideOpen(!resolvedLeftAsideOpen.value, 'user')
}

function handleLeftAsideOpenChange(detail: { open: boolean }) {
  requestLeftAsideOpen(detail.open, 'user')
}

function requestRightAsideOpen(open: boolean, source: 'user' | 'viewport' = 'user') {
  if (resolvedRightAsideOpen.value === open) {
    return
  }

  if (!isRightAsideControlled.value) {
    rightAsideOpen.value = open
  }

  emit('right-aside-open-change', { open, source })
}

function closeRightAside() {
  requestRightAsideOpen(false)
}

function handleRightAsideOpenChange(detail: { open: boolean }) {
  requestRightAsideOpen(detail.open, 'user')
}

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  handleInputValue(item.label)
  emit('prompt-click', { event, item })
}

function handleSubmit(payload: ChatSubmitPayload) {
  emit('submit', payload)
}

function handleCancel() {
  emit('cancel')
}

function handleClear() {
  handleInputValue('')
  emit('clear')
}

function handleInputValue(value: string) {
  if (!isControlledInput) {
    draftValue.value = value
  }

  emit('update:inputValue', value)
}

function handleBubbleStateChange(payload: ChatBubbleStateChangePayload) {
  emit('bubble-state-change', payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  emit('bubble-event', payload)
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
        :is-open="resolvedLeftAsideOpen"
        :is-dock="isLeftAsideDock"
        :show-history="resolvedOptions.history !== false"
        @create-conversation="handleCreateConversation"
        @switch-conversation="handleSwitchConversation"
        @rename-conversation="handleRenameConversation"
        @delete-conversation="handleDeleteConversation"
        @history-action="handleHistoryAction"
        @open="openLeftAside"
        @close="closeLeftAside"
        @toggle="toggleLeftAside"
      >
        <template v-if="$slots['layout-left-aside']" #default>
          <slot
            name="layout-left-aside"
            :conversation="resolvedData.conversation"
            :is-open="resolvedLeftAsideOpen"
            :create-conversation="handleCreateConversation"
            :switch-conversation="(id: string) => handleSwitchConversation({ id })"
            :rename-conversation="(id: string, title: string) => handleRenameConversation({ id }, title)"
            :delete-conversation="(id: string) => emit('delete-conversation', { id })"
            :open-left-aside="openLeftAside"
            :close-left-aside="closeLeftAside"
            :toggle-left-aside="toggleLeftAside"
          />
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
          :is-left-aside-open="resolvedLeftAsideOpen"
          :is-right-aside-visible="isRightAsideVisible"
          :is-right-aside-open="resolvedRightAsideOpen"
          :labels="resolvedOptions.labels"
          @create-conversation="handleCreateConversation"
          @open-left-aside="openLeftAside"
          @close-left-aside="closeLeftAside"
          @toggle-left-aside="toggleLeftAside"
          @open-right-aside="() => requestRightAsideOpen(true)"
        >
          <template v-if="$slots['header-notice']" #notice>
            <slot name="header-notice" />
          </template>
          <template v-if="$slots['layout-header']" #default>
            <slot
              name="layout-header"
              :title="resolvedData.conversation.title"
              :conversation="resolvedData.conversation"
              :create-conversation="handleCreateConversation"
              :is-left-aside-open="resolvedLeftAsideOpen"
              :open-left-aside="openLeftAside"
              :close-left-aside="closeLeftAside"
              :toggle-left-aside="toggleLeftAside"
              :open-right-aside="() => requestRightAsideOpen(true)"
              :close-right-aside="closeRightAside"
            />
          </template>
        </ChatHeader>
      </div>
    </template>

    <template #main>
      <section class="chat-panel">
        <div ref="scrollTarget" class="chat-main-scroll-host">
          <div v-if="requestError !== undefined && requestError !== null" class="chat-request-error" role="alert">
            <slot name="request-error" :error="requestError">
              {{ String(requestError) }}
            </slot>
          </div>
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
              <slot
                name="layout-main"
                :messages="visibleMessages"
                :request="resolvedData.request"
                :conversation="resolvedData.conversation"
              />
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
          :value="inputValue"
          :sender-options="senderOptions"
          :labels="resolvedOptions.labels"
          :model="visibleModel"
          :mcp="visibleMcp"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @clear="handleClear"
          @update:value="handleInputValue"
          @model-select="(payload) => emit('model-select', payload)"
          @model-feature-change="(payload) => emit('model-feature-change', payload)"
          @mcp-add-server="(payload) => emit('mcp-add-server', payload)"
          @mcp-remove-server="(payload) => emit('mcp-remove-server', payload)"
          @mcp-server-enabled-change="(payload) => emit('mcp-server-enabled-change', payload)"
          @mcp-tool-enabled-change="(payload) => emit('mcp-tool-enabled-change', payload)"
        >
          <template v-if="$slots['layout-footer']" #default>
            <slot
              name="layout-footer"
              :value="inputValue"
              :loading="resolvedData.sender.loading"
              :disabled="resolvedData.sender.disabled"
              :submit-disabled="resolvedData.sender.submitDisabled"
              :set-input-value="handleInputValue"
              :submit="handleSubmit"
              :cancel="handleCancel"
              :clear="handleClear"
            />
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

.chat-request-error {
  box-sizing: border-box;
  margin: 0 auto 12px;
  max-width: var(--tr-chat-ui-content-max-width);
  padding: 8px 12px;
  border: 1px solid var(--tr-color-error);
  border-radius: 8px;
  color: var(--tr-color-error);
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
