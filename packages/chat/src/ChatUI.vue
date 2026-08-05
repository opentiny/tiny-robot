<script setup lang="ts">
import { computed, h, nextTick, shallowRef, watch } from 'vue'
import {
  BubbleRenderers,
  TrBubbleList,
  TrBubbleProvider,
  TrHistory,
  TrIconButton,
  TrLayout,
  TrPrompts,
  TrSender,
  TrWelcome,
  useAutoScroll,
  useTheme,
  type BubbleRoleConfig,
  type HistoryMenuItem,
  type PromptProps,
} from '@opentiny/tiny-robot'
import {
  IconAi,
  IconCollapseLeft,
  IconCollapseRight,
  IconMoon,
  IconNewSession,
  IconSun,
  IconUser,
} from '@opentiny/tiny-robot-svgs'
import MCPSelector from './components/MCPSelector.vue'
import ModelFeatures from './components/ModelFeatures.vue'
import ModelSelector from './components/ModelSelector.vue'
import ScrollToBottom from './components/ScrollToBottom.vue'
import type {
  ChatBubbleEventPayload,
  ChatBubbleListUi,
  ChatBubbleStateChangePayload,
  ChatConversationInfo,
  ChatHistoryUi,
  ChatSubmitPayload,
  ChatUi,
  ChatUILayout,
  ChatUIState,
} from './types'

type HistoryDisplayItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

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
const { resolvedColorMode, toggleColorMode } = useTheme()
const hasTheme = computed(() => Boolean(resolvedColorMode))
const currentColorMode = computed(() => resolvedColorMode?.value ?? 'light')
const fallbackAiAvatar = h(IconAi, { style: { fontSize: '28px' } }) as never
const fallbackUserAvatar = h(IconUser, { style: { fontSize: '28px' } }) as never
const fallbackWelcomeIcon = h(IconAi, { style: { fontSize: '40px' } }) as never

const defaultHistoryMenuItems: HistoryMenuItem[] = [
  { id: 'rename', text: '重命名' },
  { id: 'delete', text: '删除' },
]

const defaultRoleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: fallbackAiAvatar,
  },
  user: {
    placement: 'end',
    avatar: fallbackUserAvatar,
  },
  system: {
    hidden: true,
  },
}

const historyUi = computed<ChatHistoryUi>(() => props.ui.history ?? {})
const layoutUi = computed(() => props.ui.layout as ChatUILayout | undefined)
const leftAsideLayout = computed(() => layoutUi.value?.leftAside)
const rightAsideLayout = computed(() => layoutUi.value?.rightAside)
const isLeftAsideVisible = computed(() => leftAsideLayout.value?.visible !== false)
const isRightAsideVisible = computed(() => rightAsideLayout.value?.visible !== false)
const leftAsideMode = computed(() => leftAsideLayout.value?.mode ?? 'dock')
const isLeftAsideDock = computed(() => leftAsideMode.value === 'dock')
const isLeftAsideDrawer = computed(() => leftAsideMode.value === 'drawer')
const visibleMessages = computed(() => props.state.messages.filter((message) => !isMessageHidden(message.role)))
const lastVisibleMessage = computed(() => visibleMessages.value.at(-1))
const isEmpty = computed(() => visibleMessages.value.length === 0)
const historyItems = computed<HistoryDisplayItem[]>(() =>
  props.state.conversation.items.map((item) => ({
    ...item,
    id: item.id,
    title: item.title || '新对话',
    raw: item,
  })),
)
const historyProps = computed(() => {
  const {
    onItemClick: _onItemClick,
    onItemTitleChange: _onItemTitleChange,
    onItemAction: _onItemAction,
    menuItems: _menuItems,
    ...historyProps
  } = historyUi.value

  return historyProps
})
const historyMenuItems = computed(() => historyUi.value.menuItems ?? defaultHistoryMenuItems)
const promptUi = computed(() => props.ui.prompts ?? {})
const promptProps = computed(() => {
  const { onItemClick: _onItemClick, ...promptProps } = promptUi.value

  return {
    ...promptProps,
    items: promptUi.value.items ?? [],
  }
})
const hasPrompts = computed(() => promptProps.value.items.length > 0)
const bubbleProviderProps = computed(() => ({
  fallbackContentRenderer: BubbleRenderers.Markdown,
  ...props.ui.bubbleProvider,
}))
type BubbleListViewProps = Omit<ChatBubbleListUi, 'onStateChange' | 'onBubbleEvent'>
const shouldAutoScroll = computed(() => props.ui.bubbleList?.autoScroll ?? true)
const bubbleListProps = computed<BubbleListViewProps>(() => {
  const bubbleList = props.ui.bubbleList

  if (!bubbleList) {
    return {
      autoScroll: false,
      roleConfigs: defaultRoleConfigs,
    }
  }

  const { onStateChange: _onStateChange, onBubbleEvent: _onBubbleEvent, ...nextBubbleListProps } = bubbleList

  return {
    roleConfigs: defaultRoleConfigs,
    ...nextBubbleListProps,
    autoScroll: false,
  }
})
const welcomeProps = computed(() => ({
  title: 'TinyRobot AI 助手',
  description: '您好，我是TinyRobot，您专属的 AI 智能专家',
  icon: fallbackWelcomeIcon,
  ...props.ui.welcome,
}))
const senderUi = computed(() => props.ui.sender ?? {})
const senderProps = computed(() => {
  const {
    onInput: _onInput,
    onSubmit: _onSubmit,
    onCancel: _onCancel,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    'onUpdate:modelValue': _onUpdateModelValue,
    ...sender
  } = senderUi.value as typeof senderUi.value & {
    'onUpdate:modelValue'?: (value: string) => unknown
  }

  return {
    mode: 'multiple' as const,
    clearable: true,
    placeholder: props.state.composer.loading ? '思考中...' : '请输入你的问题...',
    showWordLimit: true,
    maxLength: 1000,
    ...sender,
    defaultActions: {
      ...sender.defaultActions,
      submit: {
        ...sender.defaultActions?.submit,
        disabled: props.state.composer.submitDisabled,
      },
    },
    modelValue: props.state.composer.value,
    loading: props.state.composer.loading,
    disabled: props.state.composer.disabled,
  }
})
const composerControls = computed(() => props.ui.composer)
const layoutStyle = computed(() => ({
  '--tr-chat-ui-content-max-width': toCssSize(layoutUi.value?.contentMaxWidth ?? 980),
  '--tr-chat-ui-panel-padding': toCssSize(layoutUi.value?.panelPadding ?? 12),
  '--tr-chat-ui-panel-gap': toCssSize(layoutUi.value?.panelGap ?? 12),
}))
const leftAsideOptions = computed(() => ({
  mode: leftAsideLayout.value?.mode ?? 'dock',
  open: leftAsideOpen.value,
  expandedWidth: toLayoutSize(leftAsideLayout.value?.width, 300),
  collapsedWidth: toLayoutSize(leftAsideLayout.value?.collapsedWidth, 56),
  collapseEffect: 'overlay' as const,
}))
const rightAsideOptions = computed(() => {
  return {
    mode: rightAsideLayout.value?.mode ?? 'dock',
    defaultOpen: rightAsideLayout.value?.defaultOpen ?? true,
    expandedWidth: toLayoutSize(rightAsideLayout.value?.width, 320),
    collapsedWidth: toLayoutSize(rightAsideLayout.value?.collapsedWidth, 0),
    collapseEffect: 'overlay' as const,
  }
})

watch(
  () => leftAsideLayout.value?.defaultOpen,
  (defaultOpen) => {
    if (typeof defaultOpen === 'boolean') {
      leftAsideOpen.value = defaultOpen
    } else {
      leftAsideOpen.value = false
    }
  },
  { immediate: true },
)

const { scrollToBottom } = useAutoScroll(
  () => scrollTarget.value,
  () =>
    shouldAutoScroll.value
      ? [visibleMessages.value.length, lastVisibleMessage.value?.content, lastVisibleMessage.value?.reasoning_content]
      : null,
)

watch(
  () => lastVisibleMessage.value?.role,
  async (role) => {
    if (shouldAutoScroll.value && role === 'user') {
      await nextTick()
      scrollToBottom('smooth')
    }
  },
)

function toCssSize(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function toLayoutSize(value: string | number | undefined, fallback: number) {
  return typeof value === 'number' ? value : fallback
}

function isMessageHidden(role: string | undefined) {
  if (!role) {
    return false
  }

  return Boolean(bubbleListProps.value.roleConfigs?.[role]?.hidden)
}

function handleCreateConversation() {
  emit('createConversation')

  if (isLeftAsideDrawer.value) {
    closeLeftAside()
  }
}

function handleHistoryItemClick(item: HistoryDisplayItem) {
  emit('switchConversation', item.id)
  historyUi.value.onItemClick?.(item.raw)

  if (isLeftAsideDrawer.value) {
    closeLeftAside()
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

function handleHistoryTitleChange(title: string, item: HistoryDisplayItem) {
  emit('renameConversation', item.id, title)
  historyUi.value.onItemTitleChange?.(title, item.raw)
}

function handleHistoryAction(action: HistoryMenuItem, item: HistoryDisplayItem) {
  if (action.id === 'delete') {
    emit('deleteConversation', item.id)
  }

  historyUi.value.onItemAction?.(action, item.raw)
}

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  if (item.disabled) {
    return
  }

  emit('updateComposerValue', item.label)
  promptUi.value.onItemClick?.(event, item)
}

function handleUpdateComposerValue(value: string) {
  emit('updateComposerValue', value)
  senderUi.value.onInput?.(value)
}

function handleSubmit(text: string, structuredData?: ChatSubmitPayload['structuredData']) {
  const payload = { text, structuredData }

  emit('submit', payload)
  senderUi.value.onSubmit?.(payload)
}

function handleCancel() {
  emit('cancel')
  senderUi.value.onCancel?.()
}

function handleClear() {
  emit('clear')
  senderUi.value.onClear?.()
}

function handleFocus(event: FocusEvent) {
  senderUi.value.onFocus?.(event)
}

function handleBlur(event: FocusEvent) {
  senderUi.value.onBlur?.(event)
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
      <aside class="chat-aside">
        <button class="chat-aside-logo" type="button" aria-label="TinyRobot">
          <IconAi style="font-size: 28px" />
        </button>

        <div class="chat-aside-rail" :class="{ 'is-hidden': !isLeftAsideDock || leftAsideOpen }">
          <TrIconButton
            class="chat-aside-rail__button"
            :icon="IconCollapseLeft"
            size="32"
            svg-size="20"
            aria-label="展开会话列表"
            @click="toggleLeftAside"
          />
          <TrIconButton
            class="chat-aside-rail__button"
            :icon="IconNewSession"
            size="32"
            svg-size="20"
            aria-label="新建会话"
            @click="handleCreateConversation"
          />
        </div>

        <div class="chat-aside-panel" :class="{ 'is-hidden': !leftAsideOpen }">
          <slot
            name="left-aside"
            :conversation="state.conversation"
            :is-open="leftAsideOpen"
            :create-conversation="handleCreateConversation"
            :open-left-aside="openLeftAside"
            :close-left-aside="closeLeftAside"
            :toggle-left-aside="toggleLeftAside"
          >
            <div class="chat-aside-brand">
              <span class="chat-aside-brand__title">TinyRobot</span>
              <TrIconButton
                :icon="IconCollapseRight"
                size="32"
                svg-size="20"
                type="button"
                aria-label="收起会话列表"
                @click="toggleLeftAside"
              />
            </div>
            <button class="chat-aside-action" type="button" @click="handleCreateConversation">
              <span class="chat-aside-action__label">
                <IconNewSession font-size="20" />
                新建任务
              </span>
              <kbd>Ctrl K</kbd>
            </button>
            <TrHistory
              v-bind="historyProps"
              class="chat-aside-content"
              :data="historyItems"
              :selected="state.conversation.activeId ?? undefined"
              :menu-items="historyMenuItems"
              @item-click="handleHistoryItemClick"
              @item-title-change="handleHistoryTitleChange"
              @item-action="handleHistoryAction"
            />
          </slot>
        </div>
      </aside>
    </template>

    <template #header>
      <div class="chat-panel-content chat-panel-content--header">
        <div v-if="$slots.notice" class="chat-notice">
          <slot name="notice"></slot>
        </div>

        <slot
          name="header"
          :title="state.conversation.title"
          :is-empty="isEmpty"
          :create-conversation="handleCreateConversation"
          :is-left-aside-open="leftAsideOpen"
          :open-left-aside="openLeftAside"
          :close-left-aside="closeLeftAside"
          :toggle-left-aside="toggleLeftAside"
        >
          <header class="chat-header">
            <div class="chat-header__start">
              <TrLayout.AsideToggle v-if="isLeftAsideVisible && isLeftAsideDrawer" side="left">
                <template #default="{ isOpen }">
                  <span class="chat-header__aside-toggle" :aria-label="isOpen ? '收起会话列表' : '展开会话列表'">
                    <component :is="isOpen ? IconCollapseRight : IconCollapseLeft" :size="20" />
                  </span>
                </template>
              </TrLayout.AsideToggle>
              <h3 class="chat-header__title">{{ state.conversation.title }}</h3>
            </div>
            <button
              v-if="isEmpty && hasTheme"
              class="theme-toggle-btn"
              type="button"
              aria-label="切换主题"
              @click="toggleColorMode"
            >
              <IconMoon v-if="currentColorMode === 'light'" :size="32" />
              <IconSun v-else :size="32" />
            </button>
          </header>
        </slot>
      </div>
    </template>

    <template #main>
      <section class="chat-panel">
        <div ref="scrollTarget" class="chat-main-scroll-host">
          <div class="chat-panel-content chat-panel-content--main">
            <slot name="main" :messages="visibleMessages" :is-empty="isEmpty">
              <template v-if="isEmpty">
                <TrWelcome v-if="welcomeProps" v-bind="welcomeProps">
                  <template v-if="$slots['welcome-footer']" #footer>
                    <slot name="welcome-footer" />
                  </template>
                </TrWelcome>
                <TrPrompts v-if="hasPrompts" v-bind="promptProps" @item-click="handlePromptClick">
                  <template v-if="$slots['prompts-footer']" #footer>
                    <slot name="prompts-footer" />
                  </template>
                </TrPrompts>
              </template>

              <TrBubbleProvider v-else v-bind="bubbleProviderProps">
                <TrBubbleList
                  v-bind="bubbleListProps"
                  class="tr-chat-messages__bubble-list"
                  :messages="visibleMessages"
                  @state-change="handleBubbleStateChange"
                  @bubble-event="handleBubbleEvent"
                >
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
                </TrBubbleList>
              </TrBubbleProvider>
            </slot>
          </div>
        </div>

        <div class="chat-scroll-actions">
          <ScrollToBottom :target="scrollTarget" />
        </div>
      </section>

      <TrLayout.ProxyScrollbar :scroll-target="scrollTarget" />
    </template>

    <template #footer>
      <div class="chat-panel-content chat-panel-content--footer">
        <div class="chat-footer">
          <slot
            name="footer"
            :input-value="state.composer.value"
            :loading="state.composer.loading"
            :disabled="state.composer.disabled"
            :submit-disabled="state.composer.submitDisabled"
          >
            <TrSender
              v-bind="senderProps"
              @update:model-value="handleUpdateComposerValue"
              @submit="handleSubmit"
              @cancel="handleCancel"
              @clear="handleClear"
              @focus="handleFocus"
              @blur="handleBlur"
            >
              <template
                v-if="$slots['sender-footer'] || composerControls?.model || composerControls?.mcp"
                #footer="slotProps"
              >
                <slot v-if="$slots['sender-footer']" name="sender-footer" v-bind="slotProps" />
                <div v-else class="model-actions">
                  <MCPSelector v-if="composerControls?.mcp" :mcp="composerControls.mcp" />
                  <ModelSelector v-if="composerControls?.model" :model="composerControls.model" />
                  <ModelFeatures v-if="composerControls?.model" :model="composerControls.model" />
                </div>
              </template>
              <template v-if="$slots['sender-footer-right']" #footer-right="slotProps">
                <slot name="sender-footer-right" v-bind="slotProps" />
              </template>
            </TrSender>
          </slot>
        </div>
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

.chat-aside {
  position: relative;
  height: 100%;
}

.chat-aside-logo {
  position: absolute;
  z-index: 2;
  left: 12px;
  top: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--tr-color-primary);
  cursor: pointer;
}

.chat-aside-rail,
.chat-aside-panel {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  transition: opacity var(--transition-duration) var(--transition-easing);
}

.chat-aside-rail.is-hidden,
.chat-aside-panel.is-hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.chat-aside-panel {
  display: flex;
  flex-direction: column;
  padding: 24px 12px;
  overflow: hidden;
}

.chat-aside-rail {
  display: flex;
  width: var(--tr-layout-aside-collapsed-width, 56px);
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 72px 12px 24px;
}

.chat-aside-rail__button {
  color: var(--tr-icon-color-default);
}

.chat-aside-logo:hover {
  background: var(--tr-container-bg-hover);
  color: var(--tr-icon-color-hover);
}

.chat-aside-rail__button:hover {
  color: var(--tr-icon-color-hover);
}

.chat-aside-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  padding-left: 40px;
}

.chat-aside-brand__title {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  color: var(--tr-text-primary);
  font-weight: 600;
}

.chat-aside-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.chat-aside-action:hover {
  background: var(--tr-container-bg-hover);
}

.chat-aside-action__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chat-aside-action kbd {
  border-radius: 6px;
  padding: 2px 6px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-secondary);
  font: inherit;
  font-size: 12px;
}

.chat-aside-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px 0 0;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-space-y: 4px;
}

.chat-panel {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  padding: var(--tr-chat-ui-panel-padding);
}

.chat-main-scroll-host {
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

.chat-notice {
  margin-bottom: 16px;
}

.chat-notice :deep(> *) {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.chat-header__start {
  display: inline-flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 8px;
}

.chat-header__aside-toggle {
  flex-shrink: 0;
}

.chat-header__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--tr-radius-full);
  background: transparent;
  color: var(--tr-icon-color-default);
  cursor: pointer;
}

.theme-toggle-btn {
  margin-left: auto;
}

.theme-toggle-btn:hover,
.chat-header__aside-toggle:hover {
  color: var(--tr-icon-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-messages__bubble-list {
  overflow: visible;
  padding: 8px;
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

.chat-footer {
  position: relative;
  flex-shrink: 0;
}

.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

:deep([data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

:deep([data-box-type='box']:not([data-role='user'])) {
  --tr-bubble-box-bg: transparent;
}

:deep([data-type='markdown'] p) {
  margin: 0;
}

@media (max-width: 959px) {
  .chat-panel-content--header {
    padding: 16px 16px 0;
  }

  .chat-panel-content--footer {
    padding: 0 16px 16px;
  }

  .chat-header {
    position: relative;
    justify-content: center;
    min-height: 32px;
  }

  .chat-header__start {
    width: 100%;
    flex: none;
    justify-content: center;
  }

  .chat-header__title {
    padding: 0 48px;
    text-align: center;
  }

  .chat-header__aside-toggle {
    position: absolute;
    left: 0;
    top: 50%;
    display: inline-flex;
    transform: translateY(-50%);
    background: var(--tr-container-bg-default);
    color: var(--tr-text-secondary);
  }

  .theme-toggle-btn {
    position: absolute;
    right: 0;
    top: 50%;
    margin-left: 0;
    transform: translateY(-50%);
  }
}
</style>
