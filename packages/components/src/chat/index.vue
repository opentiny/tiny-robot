<script setup lang="ts">
import { IconClose, IconHistory, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { computed, ref, watch } from 'vue'
import Container from '../container'
import History from '../history'
import IconButton from '../icon-button'
import type { HistoryItem, HistoryMenuItem } from '../history/index.type'
import type { PluginInfo } from '../mcp-server-picker/index.type'
import type { ChatEmits, ChatProps, ChatSlots } from './index.type'
import ChatConversation from './components/ChatConversation.vue'
import ChatLauncherButton from './components/ChatLauncherButton.vue'
import ChatThemeToggleButton from './components/ChatThemeToggleButton.vue'
import { CHAT_BUILTIN_LOCALES } from './locale'
import { CHAT_BUILTIN_MARKET_MCP_SERVER_IDS, CHAT_BUILTIN_MCP_SERVERS } from './mcpServers'
import { useChatConversation } from './composables/useChatConversation'
import { useChatMcp } from './composables/useChatMcp'
import { useChatModel } from './composables/useChatModel'

const props = withDefaults(defineProps<ChatProps>(), {
  show: false,
  fullscreen: false,
  lang: 'zh-CN',
  storageKey: 'tiny-robot-chat-conversations',
  activeConversationStorageKey: 'tiny-robot-chat-active-conversation',
  mcpStorageKey: 'tiny-robot-chat-mcp',
  launcher: true,
  defaultInstalledMcpServerIds: () => [],
  promptItems: () => [],
  locale: () => ({}),
})

const emit = defineEmits<ChatEmits>()
defineSlots<ChatSlots>()

const show = defineModel<boolean>('show', { default: false })
const fullscreen = defineModel<boolean>('fullscreen', { default: false })
const selectedModelId = defineModel<string>('selectedModelId', { default: '' })

const builtinLocale = computed(() => CHAT_BUILTIN_LOCALES[props.lang])

const localeText = computed(() => ({
  ...builtinLocale.value.messages,
  ...props.locale,
  selectModel: props.modelPlaceholder || props.locale?.selectModel || builtinLocale.value.modelPlaceholder,
}))

const resolvedTitle = computed(() => props.title || builtinLocale.value.title)
const resolvedLauncherAriaLabel = computed(() => props.launcherAriaLabel || builtinLocale.value.launcherAriaLabel)
const resolvedWelcomeTitle = computed(() => props.welcomeTitle || builtinLocale.value.welcomeTitle)
const resolvedWelcomeDescription = computed(() => props.welcomeDescription || builtinLocale.value.welcomeDescription)
const resolvedMcpServers = computed(() => ({
  ...CHAT_BUILTIN_MCP_SERVERS,
  ...(props.mcpServers || {}),
}))
const resolvedMarketMcpServerIds = computed(() => props.marketMcpServerIds || CHAT_BUILTIN_MARKET_MCP_SERVER_IDS)

const { modelOptions, selectedModel, hasApiConfig, availableModelCount } = useChatModel(
  () => props.modelOptions,
  selectedModelId,
)
const mcpStore = useChatMcp({
  storageKey: props.mcpStorageKey,
  mcpServers: resolvedMcpServers.value,
  defaultInstalledServerIds: props.defaultInstalledMcpServerIds,
  marketServerIds: resolvedMarketMcpServerIds.value,
})
const chatStore = useChatConversation({
  storageKey: props.storageKey,
  activeConversationStorageKey: props.activeConversationStorageKey,
  systemPrompt: props.systemPrompt || builtinLocale.value.systemPrompt,
  selectedModel: () => selectedModel.value,
  hasApiConfig: () => hasApiConfig.value,
  getEnabledTools: mcpStore.getEnabledTools,
  callTool: mcpStore.callTool,
})

const historyDrawerOpen = ref(false)

const panelTitle = computed(() => chatStore.currentConversationTitle.value || resolvedTitle.value)
const historyData = computed(() =>
  chatStore.conversations.value.map((item) => ({
    id: item.id,
    title: item.title || localeText.value.fallbackConversationTitle,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    metadata: item.metadata,
  })),
)

watch(show, (value) => {
  if (!value) {
    mcpStore.closePicker()
    historyDrawerOpen.value = false
    emit('close')
  } else {
    emit('open')
  }
})

watch(chatStore.activeConversationId, (value) => {
  emit('conversation-change', value)
})

function handleHistorySelect(item: HistoryItem) {
  if (!item.id) {
    return
  }

  void chatStore.switchConversation(item.id)
  historyDrawerOpen.value = false
}

function handleHistoryTitleChange(newTitle: string, item: HistoryItem) {
  if (!item.id) {
    return
  }

  chatStore.updateConversationTitle(item.id, newTitle)
}

function handleHistoryAction(action: HistoryMenuItem, item: HistoryItem) {
  if (action.id === 'delete' && item.id) {
    void chatStore.deleteConversation(item.id)
  }
}

async function handleStartNewConversation() {
  await chatStore.startNewConversation()
  historyDrawerOpen.value = false
}

function handlePickerVisibleChange(value: boolean) {
  mcpStore.pickerVisible.value = value
}

function handleSelectedModelIdChange(value: string) {
  selectedModelId.value = value
}

async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  await mcpStore.handlePluginToggle(plugin, enabled)
}

async function handlePluginAdd(plugin: PluginInfo) {
  await mcpStore.handlePluginAdd(plugin)
}

function handlePluginDelete(plugin: PluginInfo) {
  mcpStore.handlePluginDelete(plugin)
}

function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  mcpStore.handleToolToggle(plugin, toolId, enabled)
}
</script>

<template>
  <ChatLauncherButton
    v-if="launcher"
    :show="show"
    :icon="launcherIcon"
    :ariaLabel="resolvedLauncherAriaLabel"
    @open="show = true"
  />

  <Container v-model:show="show" v-model:fullscreen="fullscreen" :title="panelTitle" class="tr-chat">
    <template #operations>
      <IconButton
        :icon="IconNewSession"
        size="28"
        svg-size="20"
        :title="localeText.newConversation"
        :aria-label="localeText.newConversation"
        @click="handleStartNewConversation"
      />

      <div class="tr-chat__history-anchor">
        <IconButton
          :icon="IconHistory"
          size="28"
          svg-size="20"
          :title="localeText.openHistory"
          :aria-label="localeText.openHistory"
          @click="historyDrawerOpen = true"
        />

        <Transition name="tr-chat-history-popover">
          <div
            v-if="historyDrawerOpen"
            class="tr-chat__history-popover"
            role="dialog"
            aria-modal="true"
            :aria-label="localeText.historyTitle"
          >
            <button
              class="tr-chat__history-popover-backdrop"
              type="button"
              :aria-label="localeText.closeHistory"
              @click="historyDrawerOpen = false"
            />
            <aside class="tr-chat__history-popover-panel">
              <div class="tr-chat__history-popover-head">
                <span class="tr-chat__history-popover-title">{{ localeText.historyTitle }}</span>
                <IconButton
                  :icon="IconClose"
                  size="28"
                  svg-size="20"
                  :title="localeText.closeHistory"
                  :aria-label="localeText.closeHistory"
                  @click="historyDrawerOpen = false"
                />
              </div>
              <History
                class="tr-chat__history-popover-list"
                :data="historyData"
                :selected="chatStore.activeConversationId.value || undefined"
                :search-bar="true"
                @item-click="handleHistorySelect"
                @item-title-change="handleHistoryTitleChange"
                @item-action="handleHistoryAction"
              />
            </aside>
          </div>
        </Transition>
      </div>

      <ChatThemeToggleButton :light-label="localeText.themeLightMode" :dark-label="localeText.themeDarkMode" />
    </template>

    <ChatConversation
      :lang="lang"
      :fullscreen="fullscreen"
      :input-message="chatStore.inputMessage.value"
      :messages="chatStore.messages.value"
      :visible-messages="chatStore.visibleMessages.value"
      :is-processing="chatStore.isProcessing.value"
      :has-api-config="hasApiConfig"
      :available-model-count="availableModelCount"
      :model-options="modelOptions"
      :selected-model="selectedModel"
      :title="resolvedWelcomeTitle"
      :description="resolvedWelcomeDescription"
      :welcome-icon="welcomeIcon"
      :prompt-items="promptItems"
      :model-placeholder="localeText.selectModel"
      :mcp-title="localeText.mcpTitle"
      :installed-tab-title="localeText.installedTabTitle"
      :market-tab-title="localeText.marketTabTitle"
      :search-plugins-placeholder="localeText.searchPluginsPlaceholder"
      :market-category-placeholder="localeText.marketCategoryPlaceholder"
      :unavailable-model-config="localeText.unavailableModelConfig"
      :missing-provider-config="localeText.missingProviderConfig"
      :unavailable-model-prompt="localeText.unavailableModelPrompt"
      :missing-provider-prompt="localeText.missingProviderPrompt"
      :thinking-prompt="localeText.thinkingPrompt"
      :default-prompt="localeText.defaultPrompt"
      :active-plugin-count="mcpStore.activePluginCount.value"
      :picker-visible="mcpStore.pickerVisible.value"
      :installed-plugins="mcpStore.installedPlugins.value"
      :market-plugins="mcpStore.marketPlugins.value"
      @update:input-message="chatStore.inputMessage.value = $event"
      @submit="chatStore.sendMessage"
      @cancel="chatStore.abortRequest"
      @update:selected-model-id="handleSelectedModelIdChange"
      @update:picker-visible="handlePickerVisibleChange"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
    >
      <template v-if="$slots.welcome" #welcome>
        <slot name="welcome" />
      </template>
    </ChatConversation>
  </Container>
</template>

<style scoped lang="less">
.tr-chat {
  --tr-chat-surface-bg: var(--tr-container-bg-default);
  --tr-chat-surface-bg-elevated: var(--tr-container-bg-default);
  --tr-chat-surface-border: color-mix(in srgb, var(--tr-border-color-default) 72%, transparent);
  --tr-chat-surface-border-strong: color-mix(in srgb, var(--tr-border-color-default) 88%, transparent);
  --tr-chat-assistant-bubble-bg: color-mix(in srgb, var(--tr-container-bg-default) 88%, #ffffff 12%);
  --tr-chat-assistant-bubble-border: color-mix(in srgb, var(--tr-border-color-default) 22%, transparent);
  --tr-chat-user-bubble-bg: color-mix(in srgb, var(--tr-color-primary-light) 92%, var(--tr-container-bg-default) 8%);
  --tr-chat-scrollbar-size: 10px;
  --tr-chat-scrollbar-track: transparent;
  --tr-chat-scrollbar-thumb: color-mix(in srgb, var(--tr-text-secondary) 30%, transparent);
  --tr-chat-scrollbar-thumb-hover: color-mix(in srgb, var(--tr-text-primary) 42%, transparent);
  background: var(--tr-chat-surface-bg);
  border: none;
  box-shadow:
    -18px 0 52px rgba(15, 23, 42, 0.12),
    0 6px 18px rgba(15, 23, 42, 0.06);
}

.tr-chat :deep(.tr-container__dragging-bar-wrapper) {
  padding-bottom: 4px;
}

.tr-chat :deep(.tr-container__dragging-bar) {
  background: color-mix(in srgb, var(--tr-text-tertiary) 28%, transparent);
}

.tr-chat :deep(.tr-container__header) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: 12px;
  padding-bottom: 14px;
}

.tr-chat :deep(.tr-container__title) {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tr-chat :deep(.tr-container__header-operations) {
  flex-shrink: 0;
}

.tr-chat :deep(.tr-container__header + .tr-chat-conversation) {
  overflow: hidden !important;
}

.tr-chat__history-anchor {
  position: relative;
  display: inline-flex;
}

.tr-chat__history-popover {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: var(--tr-z-index-drawer);
}

.tr-chat__history-popover-backdrop {
  display: none;
}

.tr-chat__history-popover-panel {
  width: min(300px, calc(100vw - 40px));
  max-height: min(560px, calc(100vh - 140px));
  padding: 18px 16px 16px;
  background: var(--tr-chat-surface-bg-elevated);
  border: 1px solid var(--tr-chat-surface-border-strong);
  border-radius: 24px;
  box-shadow:
    0 20px 44px rgba(15, 23, 42, 0.16),
    0 2px 10px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.tr-chat__history-popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--tr-chat-surface-border);
}

.tr-chat__history-popover-title {
  font-size: 18px;
  font-weight: 700;
}

.tr-chat__history-popover-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  --tr-history-group-title-padding: 4px 12px 6px;
  --tr-history-item-padding: 10px 12px;
  --tr-history-item-padding-editing: 10px 12px;
  --tr-history-item-border-radius: 16px;
  --tr-history-item-hover-bg: var(--tr-container-bg-hover);
  --tr-history-item-selected-bg: var(--tr-container-bg-default-2);
  --tr-history-item-selected-color: var(--tr-text-primary);
  --tr-history-item-space-y: 4px;
  --tr-history-item-action-bg-hover: var(--tr-container-bg-hover);
  --tr-history-menu-list-bg: var(--tr-chat-surface-bg-elevated);
  --tr-history-menu-list-bg-hover: var(--tr-container-bg-hover);
  --tr-history-menu-list-box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16), 0 2px 10px rgba(15, 23, 42, 0.08);
}

.tr-chat__history-popover-list :deep(.tr-history) {
  padding-right: 2px;
}

.tr-chat__history-popover-list :deep(.tr-history__search) {
  margin-bottom: 8px;
}

.tr-chat__history-popover-list :deep(.tr-history__item) {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.tr-chat__history-popover-list :deep(.tr-history__item.selected) {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tr-border-color-hover) 22%, transparent);
}

.tr-chat__history-popover-list :deep(.tr-history__item-actions > button) {
  color: var(--tr-text-secondary);
}

.tr-chat__history-popover-list::-webkit-scrollbar,
.tr-chat :deep(.tr-chat-conversation__list)::-webkit-scrollbar,
.tr-chat :deep(.mcp-server-picker__content-list)::-webkit-scrollbar,
.tr-chat :deep(.tr-sender-editor-content .ProseMirror)::-webkit-scrollbar {
  width: var(--tr-chat-scrollbar-size);
  height: var(--tr-chat-scrollbar-size);
}

.tr-chat__history-popover-list::-webkit-scrollbar-track,
.tr-chat :deep(.tr-chat-conversation__list)::-webkit-scrollbar-track,
.tr-chat :deep(.mcp-server-picker__content-list)::-webkit-scrollbar-track,
.tr-chat :deep(.tr-sender-editor-content .ProseMirror)::-webkit-scrollbar-track {
  background: var(--tr-chat-scrollbar-track);
}

.tr-chat__history-popover-list::-webkit-scrollbar-button,
.tr-chat :deep(.tr-chat-conversation__list)::-webkit-scrollbar-button,
.tr-chat :deep(.mcp-server-picker__content-list)::-webkit-scrollbar-button,
.tr-chat :deep(.tr-sender-editor-content .ProseMirror)::-webkit-scrollbar-button {
  width: 0;
  height: 0;
  display: none;
}

.tr-chat__history-popover-list::-webkit-scrollbar-thumb,
.tr-chat :deep(.tr-chat-conversation__list)::-webkit-scrollbar-thumb,
.tr-chat :deep(.mcp-server-picker__content-list)::-webkit-scrollbar-thumb,
.tr-chat :deep(.tr-sender-editor-content .ProseMirror)::-webkit-scrollbar-thumb {
  background: var(--tr-chat-scrollbar-thumb);
  border: 2px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
}

.tr-chat__history-popover-list::-webkit-scrollbar-thumb:hover,
.tr-chat :deep(.tr-chat-conversation__list)::-webkit-scrollbar-thumb:hover,
.tr-chat :deep(.mcp-server-picker__content-list)::-webkit-scrollbar-thumb:hover,
.tr-chat :deep(.tr-sender-editor-content .ProseMirror)::-webkit-scrollbar-thumb:hover {
  background: var(--tr-chat-scrollbar-thumb-hover);
  background-clip: padding-box;
}

@supports not selector(::-webkit-scrollbar) {
  .tr-chat__history-popover-list,
  .tr-chat :deep(.tr-chat-conversation__list),
  .tr-chat :deep(.mcp-server-picker__content-list),
  .tr-chat :deep(.tr-sender-editor-content .ProseMirror) {
    scrollbar-width: thin;
    scrollbar-color: var(--tr-chat-scrollbar-thumb) var(--tr-chat-scrollbar-track);
  }
}

.tr-chat-history-popover-enter-active,
.tr-chat-history-popover-leave-active {
  transition: opacity 0.2s ease;
}

.tr-chat-history-popover-enter-active .tr-chat__history-popover-panel,
.tr-chat-history-popover-leave-active .tr-chat__history-popover-panel {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.tr-chat-history-popover-enter-from,
.tr-chat-history-popover-leave-to {
  opacity: 0;
}

.tr-chat-history-popover-enter-from .tr-chat__history-popover-panel,
.tr-chat-history-popover-leave-to .tr-chat__history-popover-panel {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@media (max-width: 767px) {
  .tr-chat__history-popover {
    position: fixed;
    top: 56px;
    left: 12px;
    right: 12px;
    transform: none;
    z-index: var(--tr-z-index-drawer);
  }

  .tr-chat__history-popover-backdrop {
    position: fixed;
    inset: 0;
    display: block;
    border: none;
    background: rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(8px);
    cursor: pointer;
  }

  .tr-chat__history-popover-panel {
    width: auto;
    max-height: calc(100vh - 120px);
    padding: 16px 14px 14px;
    border-radius: 20px;
  }
}
</style>
