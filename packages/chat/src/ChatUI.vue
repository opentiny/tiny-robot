<script setup lang="ts">
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { computed, h, shallowRef } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { HistoryMenuItem, LayoutAsideResizeValue, LayoutProps, PromptProps } from '@opentiny/tiny-robot'
import ScrollToBottom from './ui/messages/ScrollToBottom.vue'
import ChatLeftAside from './ui/layout/ChatLeftAside.vue'
import ChatInputRegion from './ui/composer/ChatInputRegion.vue'
import ChatHeader from './ui/layout/ChatHeader.vue'
import ChatMessages from './ui/messages/ChatMessages.vue'
import ChatRightAside from './ui/layout/ChatRightAside.vue'
import ChatMcpPanel from './ui/layout/ChatMcpPanel.vue'
import { useChatAsideState } from './composables/useChatAsideState'
import { createDefaultChatUIOptions } from './ui/defaults'
import { resolveChatUIData } from './ui/resolveData'
import { resolveChatUIOptions, type ResolvedChatSenderOptions } from './ui/resolveOptions'
import { formatRequestError } from './ui/formatRequestError'
import type {
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatConversationInfo,
  ChatHistoryActionPayload,
  ChatHistoryGroup,
  LayoutFloatingDragDetail,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
  ChatMcpCreateServerPayload,
  ChatMcpToolEnabledChangePayload,
  ChatModelFeatureChangePayload,
  ChatModelReasoningEffortChangePayload,
  ChatRightAsidePanelOptions,
  ChatSendPayload,
  ChatUIEmits,
  ChatUIProps,
  ChatUISlots,
} from './types'
import { CHAT_MCP_RIGHT_ASIDE_PANEL_ID } from './types'

const props = withDefaults(defineProps<ChatUIProps>(), {
  rightAsideOpen: undefined,
})

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

const resolvedOptions = computed(() => resolveChatUIOptions(props.ui))
const resolvedData = computed(() => resolveChatUIData(props.data, resolvedOptions.value.labels))
const inputValue = computed(() => (isControlledInput ? (props.inputValue ?? '') : draftValue.value))

const isHeaderVisible = computed(() => resolvedOptions.value.header !== false)
const leftAsideLayout = computed(() => resolvedOptions.value.layout.leftAside)
const rightAsideLayout = computed(() => resolvedOptions.value.layout.rightAside)
const hasRightAsidePanelSlot = Boolean(slots['layout-right-aside'] || slots['layout-right-aside-panel'])

const hasLegacyLeftAsideSlot = Boolean(slots['layout-left-aside'])
const hasLayoutEmptyStateSlot = Boolean(slots['layout-empty-state'])
const historyOptions = computed(() =>
  resolvedOptions.value.history === false ? { menuItems: [] } : resolvedOptions.value.history,
)
const fallbackSenderOptions = createDefaultChatUIOptions().sender
const senderOptions = computed<ResolvedChatSenderOptions>(() => {
  const options = resolvedOptions.value.sender

  return options === false ? fallbackSenderOptions : options
})
const visibleModel = computed(() => (resolvedOptions.value.model === false ? undefined : resolvedData.value.model))
const modelOptions = computed(() => (resolvedOptions.value.model === false ? undefined : resolvedOptions.value.model))
const visibleMcp = computed(() =>
  resolvedOptions.value.mcp === false || rightAsideLayout.value === false ? undefined : resolvedData.value.mcp,
)
const effectiveRightAsideLayout = computed(() => rightAsideLayout.value)
const availableRightAsidePanels = computed<readonly ChatRightAsidePanelOptions[]>(() => {
  const panels =
    hasRightAsidePanelSlot && effectiveRightAsideLayout.value !== false ? effectiveRightAsideLayout.value.panels : []

  if (!visibleMcp.value) {
    return panels
  }

  return [
    ...panels,
    {
      id: CHAT_MCP_RIGHT_ASIDE_PANEL_ID,
      title: resolvedOptions.value.labels.mcp,
    },
  ]
})
const hasRightAsideContent = computed(() => availableRightAsidePanels.value.length > 0)
const isSenderVisible = computed(() => resolvedOptions.value.sender !== false)
const isLeftAsideVisible = computed(() => leftAsideLayout.value !== false)
const isRightAsideVisible = computed(() => hasRightAsideContent.value && effectiveRightAsideLayout.value !== false)
const asideState = useChatAsideState({
  leftAside: leftAsideLayout,
  rightAside: effectiveRightAsideLayout,
  rightAsideOpen: () => props.rightAsideOpen,
  defaultRightAsideOpen: () => props.defaultRightAsideOpen ?? false,
  activeRightAsidePanelId: () => props.activeRightAsidePanelId,
  defaultActiveRightAsidePanelId: () => props.defaultActiveRightAsidePanelId,
  rightAsidePanels: availableRightAsidePanels,
  isMobileViewport,
  viewportWidth,
  onLeftOpenChange: (payload) => emit('left-aside-open-change', payload),
  onRightOpenChange: (payload) => emit('right-aside-open-change', payload),
  onRightAsideOpenUpdate: (open) => emit('update:right-aside-open', open),
  onRightAsidePanelUpdate: (panel) => emit('update:active-right-aside-panel-id', panel),
})

defineExpose({
  openRightAside: asideState.openRightAside,
  closeRightAside: asideState.closeRightAside,
  toggleRightAside: asideState.toggleRightAside,
  activateRightAsidePanel: asideState.activateRightAsidePanel,
})
const activeRightAsidePanel = computed(() => asideState.resolvedRightAsidePanel.value)
const activeRightAsidePanelOptions = computed(() =>
  availableRightAsidePanels.value.find((panel) => panel.id === activeRightAsidePanel.value),
)
const bubbleRoleConfigs = computed(
  () => resolvedOptions.value.bubble.bubbleList.roleConfigs ?? { system: { hidden: true } },
)
const visibleMessages = computed(() =>
  resolvedData.value.bubble.messages.filter((message) => !isMessageHidden(message.role)),
)
const isEmpty = computed(() => visibleMessages.value.length === 0)
const hasLayoutMainSlot = Boolean(slots['layout-main'])
const isCustomEmptyStateActive = computed(() => isEmpty.value && hasLayoutEmptyStateSlot && !hasLayoutMainSlot)
const isEmptyStateCentered = computed(() => isEmpty.value && resolvedOptions.value.layout.emptyState === 'center')

const isDefaultComposerVisible = computed(() => isSenderVisible.value && !isCustomEmptyStateActive.value)

const isWelcomeComposerCentered = computed(
  () =>
    isEmpty.value &&
    isSenderVisible.value &&
    resolvedOptions.value.welcome !== false &&
    resolvedOptions.value.layout.composer.welcome === 'center' &&
    !hasLayoutMainSlot,
)
const requestError = computed(() => resolvedData.value.request?.error)
const layoutStyle = computed(() => ({
  containerType: 'inline-size',
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
  emit('switch-conversation', { conversationId: item.id })

  if (asideState.isLeftAsideDrawer.value) {
    asideState.closeLeftAside()
  }
}

function handleRenameConversation(item: { id: string }, title: string) {
  emit('rename-conversation', { conversationId: item.id, title })
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatConversationInfo) {
  emit('history-action', createHistoryActionPayload(action, item))
}

function handleDeleteConversation(item: ChatConversationInfo | string) {
  handleHistoryAction(
    {
      id: 'delete',
      text: resolvedOptions.value.labels.deleteConversation,
    },
    typeof item === 'string' ? findConversation(item) : item,
  )
}

function findConversation(id: string): ChatConversationInfo {
  const item = resolvedData.value.conversation.items.find((conversation) => conversation.id === id)
  if (item) return item

  for (const entry of resolvedData.value.conversation.history ?? []) {
    if (isHistoryGroup(entry)) {
      const historyItem = entry.items.find((conversation) => conversation.id === id)
      if (historyItem) return historyItem
    } else if (entry.id === id) {
      return entry
    }
  }

  return {
    id,
    title: resolvedOptions.value.labels.newConversationTitle,
  }
}

function isHistoryGroup(entry: ChatConversationInfo | ChatHistoryGroup): entry is ChatHistoryGroup {
  return 'items' in entry && Array.isArray(entry.items)
}

function createHistoryActionPayload(
  action: HistoryMenuItem,
  conversation: ChatConversationInfo,
): ChatHistoryActionPayload {
  let defaultPrevented = false

  return {
    action,
    conversation,
    get defaultPrevented() {
      return defaultPrevented
    },
    preventDefault() {
      defaultPrevented = true
    },
  }
}

function handlePromptClick(event: MouseEvent, item: PromptProps) {
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

function handleOpenMcpPanel() {
  if (visibleMcp.value) asideState.toggleRightAside(CHAT_MCP_RIGHT_ASIDE_PANEL_ID)
}

function handleMcpCreateServer(payload: ChatMcpCreateServerPayload) {
  emit('mcp-create-server', payload)
}

function handleInputValue(value: string) {
  if (!isControlledInput) {
    draftValue.value = value
  }

  emit('update:inputValue', value)
}

function handleModelSelect(payload: { id: string | null }) {
  emit('model-select', { modelId: payload.id })
}

function handleModelFeatureChange(payload: { id: ChatModelFeatureChangePayload['featureId']; enabled: boolean }) {
  emit('model-feature-change', { featureId: payload.id, enabled: payload.enabled })
}

function handleModelReasoningEffortChange(payload: ChatModelReasoningEffortChangePayload) {
  emit('model-reasoning-effort-change', payload)
}

function handleMcpAddServer(payload: { id: string }) {
  emit('mcp-add-server', { serverId: payload.id })
}

function handleMcpRemoveServer(payload: { id: string }) {
  emit('mcp-remove-server', { serverId: payload.id })
}

function handleMcpServerEnabledChange(payload: { id: string; enabled: boolean }) {
  emit('mcp-server-enabled-change', { serverId: payload.id, enabled: payload.enabled })
}

function handleMcpToolEnabledChange(payload: ChatMcpToolEnabledChangePayload) {
  emit('mcp-tool-enabled-change', payload)
}

function handleBubbleStateChange(payload: ChatBubbleStateChangePayload) {
  emit('bubble-state-change', payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  emit('bubble-event', payload)
}

function handleFloatingStateUpdate(value: LayoutFloatingState) {
  emit('update:floating-state', value)
}

function handleFloatingDragStart(detail: LayoutFloatingDragDetail) {
  emit('floating-drag-start', detail)
}

function handleFloatingDrag(detail: LayoutFloatingDragDetail) {
  emit('floating-drag', detail)
}

function handleFloatingDragEnd(detail: LayoutFloatingDragDetail) {
  emit('floating-drag-end', detail)
}

function handleFloatingResizeStart(detail: LayoutFloatingResizeDetail) {
  emit('floating-resize-start', detail)
}

function handleFloatingResize(detail: LayoutFloatingResizeDetail) {
  emit('floating-resize', detail)
}

function handleFloatingResizeEnd(detail: LayoutFloatingResizeDetail) {
  emit('floating-resize-end', detail)
}

function handleRightAsideResize(detail: LayoutAsideResizeValue) {
  asideState.handleRightAsideResize(detail)
}

const composerProps = computed(() => ({
  sender: resolvedData.value.sender,
  value: inputValue.value,
  senderOptions: senderOptions.value,
  labels: resolvedOptions.value.labels,
  model: visibleModel.value,
  modelOptions: modelOptions.value,
  mcp: visibleMcp.value,
}))

const composerEvents = {
  onSubmit: handleSubmit,
  onCancel: handleCancel,
  onClear: handleClear,
  'onUpdate:value': handleInputValue,
  onModelSelect: handleModelSelect,
  onModelFeatureChange: handleModelFeatureChange,
  onModelReasoningEffortChange: handleModelReasoningEffortChange,
  onOpenMcpPanel: handleOpenMcpPanel,
  onMcpAddServer: handleMcpAddServer,
  onMcpRemoveServer: handleMcpRemoveServer,
  onMcpServerEnabledChange: handleMcpServerEnabledChange,
  onMcpToolEnabledChange: handleMcpToolEnabledChange,
}

const composerTemplateEvents = {
  submit: handleSubmit,
  cancel: handleCancel,
  clear: handleClear,
  'update:value': handleInputValue,
  modelSelect: handleModelSelect,
  modelFeatureChange: handleModelFeatureChange,
  modelReasoningEffortChange: handleModelReasoningEffortChange,
  openMcpPanel: handleOpenMcpPanel,
  mcpAddServer: handleMcpAddServer,
  mcpRemoveServer: handleMcpRemoveServer,
  mcpServerEnabledChange: handleMcpServerEnabledChange,
  mcpToolEnabledChange: handleMcpToolEnabledChange,
}

const composerSlots = {
  'composer-before': slots['composer-before'],
  'layout-footer': slots['layout-footer'],
  'sender-header': slots['sender-header'],
  'sender-footer': slots['sender-footer'],
  'sender-footer-right': slots['sender-footer-right'],
}

function renderEmptyStateComposer() {
  if (!isSenderVisible.value) {
    return null
  }

  return h(
    ChatInputRegion,
    {
      ...composerProps.value,
      ...composerEvents,
    },
    composerSlots,
  )
}
</script>

<template>
  <TrLayout
    v-bind="layoutProps"
    class="tr-chat-ui"
    :style="layoutStyle"
    @left-aside-open-change="asideState.handleLeftAsideOpenChange"
    @right-aside-open-change="asideState.handleRightAsideOpenChange"
    @right-aside-resize="handleRightAsideResize"
    @update:floating-state="handleFloatingStateUpdate"
    @floating-drag-start="handleFloatingDragStart"
    @floating-drag="handleFloatingDrag"
    @floating-drag-end="handleFloatingDragEnd"
    @floating-resize-start="handleFloatingResizeStart"
    @floating-resize="handleFloatingResize"
    @floating-resize-end="handleFloatingResizeEnd"
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
        <template v-if="hasLegacyLeftAsideSlot" #default>
          <slot
            name="layout-left-aside"
            :conversation="resolvedData.conversation"
            :is-open="asideState.resolvedLeftAsideOpen.value"
            :is-dock="asideState.isLeftAsideDock.value"
            :create-conversation="handleCreateConversation"
            :switch-conversation="(id: string) => handleSwitchConversation({ id })"
            :rename-conversation="(id: string, title: string) => handleRenameConversation({ id }, title)"
            :delete-conversation="handleDeleteConversation"
            :open-left-aside="asideState.openLeftAside"
            :close-left-aside="asideState.closeLeftAside"
            :toggle-left-aside="asideState.toggleLeftAside"
          />
        </template>
        <template v-if="!hasLegacyLeftAsideSlot && $slots['layout-left-aside-rail']" #rail="slotProps">
          <slot name="layout-left-aside-rail" v-bind="slotProps" />
        </template>
        <template v-if="!hasLegacyLeftAsideSlot && $slots['layout-left-aside-brand']" #brand="slotProps">
          <slot name="layout-left-aside-brand" v-bind="slotProps" />
        </template>
        <template v-if="!hasLegacyLeftAsideSlot && $slots['layout-left-aside-actions']" #actions="slotProps">
          <slot name="layout-left-aside-actions" v-bind="slotProps" />
        </template>
        <template v-if="!hasLegacyLeftAsideSlot && $slots['layout-left-aside-content']" #content="slotProps">
          <slot name="layout-left-aside-content" v-bind="slotProps" />
        </template>
        <template v-if="!hasLegacyLeftAsideSlot && $slots['layout-left-aside-footer']" #footer="slotProps">
          <slot name="layout-left-aside-footer" v-bind="slotProps" />
        </template>
        <template
          v-if="!hasLegacyLeftAsideSlot && $slots['layout-left-aside-history-item-prefix']"
          #history-item-prefix="slotProps"
        >
          <slot name="layout-left-aside-history-item-prefix" v-bind="slotProps" />
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
            :messages="resolvedData.bubble.messages"
            :scroll-target="scrollTarget"
            :options="resolvedOptions.bubble"
            :welcome="resolvedOptions.welcome"
            :prompts="resolvedOptions.prompts"
            :labels="resolvedOptions.labels"
            :is-empty="isEmpty"
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
            <template v-if="!hasLayoutMainSlot && $slots['layout-empty-state']" #empty-state>
              <slot
                name="layout-empty-state"
                :messages="visibleMessages"
                :request="resolvedData.request"
                :conversation="resolvedData.conversation"
                :is-empty="true"
                :render-composer="renderEmptyStateComposer"
              />
            </template>
            <template v-if="$slots['welcome-footer']" #welcome-footer>
              <slot name="welcome-footer" />
            </template>
            <template v-if="$slots['prompts-footer']" #prompts-footer>
              <slot name="prompts-footer" />
            </template>
            <template v-if="!isCustomEmptyStateActive && isWelcomeComposerCentered" #welcome-composer>
              <ChatInputRegion class="chat-welcome-composer" v-bind="composerProps" v-on="composerTemplateEvents">
                <template v-if="$slots['composer-before']" #composer-before="slotProps">
                  <slot name="composer-before" v-bind="slotProps" />
                </template>
                <template v-if="$slots['layout-footer']" #layout-footer="slotProps">
                  <slot name="layout-footer" v-bind="slotProps" />
                </template>
                <template v-if="$slots['sender-header']" #sender-header>
                  <slot name="sender-header" />
                </template>
                <template v-if="$slots['sender-footer']" #sender-footer>
                  <slot name="sender-footer" />
                </template>
                <template v-if="$slots['sender-footer-right']" #sender-footer-right>
                  <slot name="sender-footer-right" />
                </template>
              </ChatInputRegion>
            </template>
            <template v-if="$slots['bubble-prefix']" #bubble-prefix="slotProps">
              <slot name="bubble-prefix" v-bind="slotProps" />
            </template>
            <template v-if="$slots['bubble-suffix']" #bubble-suffix="slotProps">
              <slot name="bubble-suffix" v-bind="slotProps" />
            </template>
            <template v-if="$slots['bubble-after']" #bubble-after="slotProps">
              <slot name="bubble-after" v-bind="slotProps" />
            </template>
            <template v-if="$slots['bubble-content-footer']" #bubble-content-footer="slotProps">
              <slot name="bubble-content-footer" v-bind="slotProps" />
            </template>
          </ChatMessages>
        </div>
      </section>

      <div class="chat-scroll-actions">
        <ScrollToBottom :target="scrollTarget" :label="resolvedOptions.labels.scrollToBottom" />
      </div>
      <TrLayout.ProxyScrollbar :scroll-target="scrollTarget" />
    </template>

    <template #footer>
      <div
        v-if="isDefaultComposerVisible && (!isEmpty || !isWelcomeComposerCentered)"
        class="chat-panel-content chat-panel-content--footer"
      >
        <ChatInputRegion v-bind="composerProps" v-on="composerTemplateEvents">
          <template v-if="$slots['composer-before']" #composer-before="slotProps">
            <slot name="composer-before" v-bind="slotProps" />
          </template>
          <template v-if="$slots['layout-footer']" #layout-footer="slotProps">
            <slot name="layout-footer" v-bind="slotProps" />
          </template>
          <template v-if="$slots['sender-header']" #sender-header>
            <slot name="sender-header" />
          </template>
          <template v-if="$slots['sender-footer']" #sender-footer>
            <slot name="sender-footer" />
          </template>
          <template v-if="$slots['sender-footer-right']" #sender-footer-right>
            <slot name="sender-footer-right" />
          </template>
        </ChatInputRegion>
      </div>
    </template>

    <template v-if="isRightAsideVisible" #right-aside>
      <slot
        name="layout-right-aside"
        :panel-id="activeRightAsidePanel"
        :panel="activeRightAsidePanelOptions"
        :panels="availableRightAsidePanels"
        :open-right-aside="asideState.openRightAside"
        :close-right-aside="asideState.closeRightAside"
        :toggle-right-aside="asideState.toggleRightAside"
        :activate-right-aside-panel="asideState.activateRightAsidePanel"
        :is-right-aside-open="asideState.resolvedRightAsideOpen.value"
      >
        <ChatMcpPanel
          v-if="activeRightAsidePanel === CHAT_MCP_RIGHT_ASIDE_PANEL_ID && visibleMcp"
          :mcp="visibleMcp"
          :labels="resolvedOptions.labels"
          @close="asideState.closeRightAside"
          @add-server="handleMcpAddServer"
          @remove-server="handleMcpRemoveServer"
          @update-server-enabled="handleMcpServerEnabledChange"
          @update-tool-enabled="(payload) => emit('mcp-tool-enabled-change', payload)"
          @create-server="handleMcpCreateServer"
        />
        <ChatRightAside
          v-else
          :show-close="effectiveRightAsideLayout !== false ? effectiveRightAsideLayout.showClose : true"
          :labels="resolvedOptions.labels"
          @close="asideState.closeRightAside"
        >
          <template #title>
            <slot
              v-if="$slots['layout-right-aside-title']"
              name="layout-right-aside-title"
              :panel-id="activeRightAsidePanel"
              :panel="activeRightAsidePanelOptions"
            />
            <h2 v-else class="chat-right-aside-title">
              {{ activeRightAsidePanelOptions?.title ?? resolvedOptions.labels.rightAsideTitle }}
            </h2>
          </template>
          <slot
            v-if="activeRightAsidePanelOptions"
            name="layout-right-aside-panel"
            :panel-id="activeRightAsidePanel"
            :panel="activeRightAsidePanelOptions"
            :panels="availableRightAsidePanels"
            :open-right-aside="asideState.openRightAside"
            :close-right-aside="asideState.closeRightAside"
            :toggle-right-aside="asideState.toggleRightAside"
            :activate-right-aside-panel="asideState.activateRightAsidePanel"
            :is-right-aside-open="asideState.resolvedRightAsideOpen.value"
          />
        </ChatRightAside>
      </slot>
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

.chat-welcome-composer {
  width: 100%;
  margin-top: 16px;
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
