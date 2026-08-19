<script setup lang="ts">
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { computed, shallowRef, useSlots, type Slots } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { HistoryMenuItem, LayoutProps, PromptProps } from '@opentiny/tiny-robot'
import ScrollToBottom from './ui/messages/ScrollToBottom.vue'
import ChatLeftAside from './ui/layout/ChatLeftAside.vue'
import ChatComposerHost from './ui/composer/ChatComposerHost.vue'
import ChatHeader from './ui/layout/ChatHeader.vue'
import ChatMessages from './ui/messages/ChatMessages.vue'
import ChatRightAside from './ui/layout/ChatRightAside.vue'
import { useChatAsideState } from './composables/useChatAsideState'
import { resolveChatUIData } from './ui/resolveData'
import { resolveChatUIOptions } from './ui/resolveOptions'
import { formatRequestError } from './ui/formatRequestError'
import type {
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatConversationInfo,
  ChatSendPayload,
  ChatUIEmits,
  ChatUIProps,
} from './types'

const props = defineProps<ChatUIProps>()
const emit = defineEmits<ChatUIEmits>()
const slots: Slots = useSlots()

const isControlledInput = props.inputValue !== undefined
const draftValue = shallowRef(props.inputValue ?? props.defaultInputValue ?? '')
const scrollTarget = shallowRef<HTMLElement | null>(null)
const breakpoints = useBreakpoints({
  mobile: 0,
  desktop: 960,
})
const isMobileViewport = breakpoints.smaller('desktop')
const { width: viewportWidth } = useWindowSize()

const resolvedOptions = computed(() => resolveChatUIOptions(props.ui))
const resolvedData = computed(() => resolveChatUIData(props.data, resolvedOptions.value.labels))
const inputValue = computed(() => (isControlledInput ? (props.inputValue ?? '') : draftValue.value))

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
const asideState = useChatAsideState({
  leftAside: leftAsideLayout,
  rightAside: rightAsideLayout,
  isMobileViewport,
  viewportWidth,
  onLeftOpenChange: (payload) => emit('left-aside-open-change', payload),
  onRightOpenChange: (payload) => emit('right-aside-open-change', payload),
})
const bubbleRoleConfigs = computed(
  () => resolvedOptions.value.bubble.bubbleList.roleConfigs ?? { system: { hidden: true } },
)
const visibleMessages = computed(() =>
  resolvedData.value.bubble.messages.filter((message) => !isMessageHidden(message.role)),
)
const isEmpty = computed(() => visibleMessages.value.length === 0)
const hasLayoutMainSlot = Boolean(slots['layout-main'])
const isEmptyStateCentered = computed(() => isEmpty.value && resolvedOptions.value.layout.emptyState === 'center')

const isWelcomeComposerCentered = computed(
  () =>
    isEmpty.value &&
    senderOptions.value !== undefined &&
    resolvedOptions.value.welcome !== false &&
    resolvedOptions.value.layout.composer.welcome === 'center' &&
    !hasLayoutMainSlot,
)
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

const layoutProps = computed<LayoutProps>(() => {
  const layout = resolvedOptions.value.layout
  const asideProps = {
    leftAside: isLeftAsideVisible.value ? asideState.leftAsideOptions.value : undefined,
    rightAside: isRightAsideVisible.value ? asideState.rightAsideOptions.value : undefined,
  }

  if (layout.surface.mode === 'floating') {
    return {
      ...asideProps,
      mode: 'floating',
      floatingState: props.floatingState,
      floatingOptions: layout.surface.floatingOptions,
    }
  }

  return {
    ...asideProps,
    mode: 'normal',
  }
})

function toCssSize(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function isMessageHidden(role: string | undefined) {
  return role ? Boolean(bubbleRoleConfigs.value[role]?.hidden) : false
}

function handleCreateConversation() {
  emit('create-conversation')

  if (asideState.isLeftAsideDrawer.value) {
    asideState.closeLeftAside()
  }
}

function handleSwitchConversation(item: { id: string }) {
  emit('switch-conversation', { id: item.id })

  if (asideState.isLeftAsideDrawer.value) {
    asideState.closeLeftAside()
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

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  handleInputValue(item.label)
  emit('prompt-click', { event, item })
}

function handleSubmit(payload: ChatSendPayload) {
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
    v-bind="layoutProps"
    class="tr-chat-ui"
    :style="layoutStyle"
    @left-aside-open-change="asideState.handleLeftAsideOpenChange"
    @right-aside-open-change="asideState.handleRightAsideOpenChange"
    @update:floating-state="(value) => emit('update:floating-state', value)"
    @floating-drag-start="(detail) => emit('floating-drag-start', detail)"
    @floating-drag="(detail) => emit('floating-drag', detail)"
    @floating-drag-end="(detail) => emit('floating-drag-end', detail)"
    @floating-resize-start="(detail) => emit('floating-resize-start', detail)"
    @floating-resize="(detail) => emit('floating-resize', detail)"
    @floating-resize-end="(detail) => emit('floating-resize-end', detail)"
  >
    <template v-if="isLeftAsideVisible" #left-aside>
      <ChatLeftAside
        :conversation="resolvedData.conversation"
        :history="historyOptions"
        :brand="resolvedOptions.brand"
        :labels="resolvedOptions.labels"
        :is-open="asideState.resolvedLeftAsideOpen.value"
        :is-dock="asideState.isLeftAsideDock.value"
        :show-history="resolvedOptions.history !== false"
        @create-conversation="handleCreateConversation"
        @switch-conversation="handleSwitchConversation"
        @rename-conversation="handleRenameConversation"
        @delete-conversation="handleDeleteConversation"
        @history-action="handleHistoryAction"
        @open="asideState.openLeftAside"
        @close="asideState.closeLeftAside"
        @toggle="asideState.toggleLeftAside"
      >
        <template v-if="$slots['layout-left-aside']" #default>
          <slot
            name="layout-left-aside"
            :conversation="resolvedData.conversation"
            :is-open="asideState.resolvedLeftAsideOpen.value"
            :create-conversation="handleCreateConversation"
            :switch-conversation="(id: string) => handleSwitchConversation({ id })"
            :rename-conversation="(id: string, title: string) => handleRenameConversation({ id }, title)"
            :delete-conversation="(id: string) => emit('delete-conversation', { id })"
            :open-left-aside="asideState.openLeftAside"
            :close-left-aside="asideState.closeLeftAside"
            :toggle-left-aside="asideState.toggleLeftAside"
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
          :is-left-aside-drawer="asideState.isLeftAsideDrawer.value"
          :is-left-aside-open="asideState.resolvedLeftAsideOpen.value"
          :is-right-aside-visible="isRightAsideVisible"
          :is-right-aside-open="asideState.resolvedRightAsideOpen.value"
          :labels="resolvedOptions.labels"
          @create-conversation="handleCreateConversation"
          @open-left-aside="asideState.openLeftAside"
          @close-left-aside="asideState.closeLeftAside"
          @toggle-left-aside="asideState.toggleLeftAside"
          @open-right-aside="asideState.openRightAside"
        >
          <template v-if="$slots['header-notice']" #notice>
            <slot name="header-notice" />
          </template>
          <template v-if="$slots['layout-header']" #default>
            <slot
              name="layout-header"
              :title="resolvedData.conversation.title"
              :is-empty="isEmpty"
              :conversation="resolvedData.conversation"
              :create-conversation="handleCreateConversation"
              :is-left-aside-open="asideState.resolvedLeftAsideOpen.value"
              :open-left-aside="asideState.openLeftAside"
              :close-left-aside="asideState.closeLeftAside"
              :toggle-left-aside="asideState.toggleLeftAside"
              :open-right-aside="asideState.openRightAside"
              :close-right-aside="asideState.closeRightAside"
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
              {{ formatRequestError(requestError) }}
            </slot>
          </div>
          <ChatMessages
            :messages="visibleMessages"
            :scroll-target="scrollTarget"
            :options="resolvedOptions.bubble"
            :welcome="resolvedOptions.welcome"
            :prompts="resolvedOptions.prompts"
            :labels="resolvedOptions.labels"
            :center-empty-state="isEmptyStateCentered"
            :center-welcome-composer="isWelcomeComposerCentered"
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
            <template v-if="isWelcomeComposerCentered && senderOptions" #welcome-composer>
              <ChatComposerHost
                class="chat-welcome-composer"
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
                <template v-if="$slots['composer-before']" #composer-before="slotProps">
                  <slot name="composer-before" v-bind="slotProps" />
                </template>
                <template v-if="$slots['layout-footer']" #layout-footer="slotProps">
                  <slot name="layout-footer" v-bind="slotProps" />
                </template>
                <template v-if="$slots['sender-footer']" #sender-footer>
                  <slot name="sender-footer" />
                </template>
                <template v-if="$slots['sender-footer-right']" #sender-footer-right>
                  <slot name="sender-footer-right" />
                </template>
              </ChatComposerHost>
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
      <div v-if="!isWelcomeComposerCentered" class="chat-panel-content chat-panel-content--footer">
        <ChatComposerHost
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
          <template v-if="$slots['composer-before']" #composer-before="slotProps">
            <slot name="composer-before" v-bind="slotProps" />
          </template>
          <template v-if="$slots['layout-footer']" #layout-footer="slotProps">
            <slot name="layout-footer" v-bind="slotProps" />
          </template>
          <template v-if="$slots['sender-footer']" #sender-footer>
            <slot name="sender-footer" />
          </template>
          <template v-if="$slots['sender-footer-right']" #sender-footer-right>
            <slot name="sender-footer-right" />
          </template>
        </ChatComposerHost>
      </div>
    </template>

    <template v-if="isRightAsideVisible" #right-aside>
      <ChatRightAside
        :show-close="rightAsideLayout !== false ? rightAsideLayout.showClose : true"
        :labels="resolvedOptions.labels"
        @close="asideState.closeRightAside"
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
.tr-chat-ui {
  container-type: inline-size;
}

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

.chat-welcome-composer {
  text-align: left;
}

.chat-panel-content--header {
  padding: 24px 24px 0;
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
