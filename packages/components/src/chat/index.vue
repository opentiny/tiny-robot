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
import { useChatConversation } from './composables/useChatConversation'
import { useChatMcp } from './composables/useChatMcp'
import { useChatModel } from './composables/useChatModel'

const props = withDefaults(defineProps<ChatProps>(), {
  show: false,
  fullscreen: false,
  title: 'AI Assistant',
  storageKey: 'tiny-robot-chat-conversations',
  activeConversationStorageKey: 'tiny-robot-chat-active-conversation',
  mcpStorageKey: 'tiny-robot-chat-mcp',
  systemPrompt: 'You are a helpful assistant.',
  launcher: true,
  launcherAriaLabel: 'Open chat panel',
  modelPlaceholder: 'Select model',
  mcpServers: () => ({}),
  defaultInstalledMcpServerIds: () => [],
  marketMcpServerIds: () => [],
  welcomeTitle: 'Assistant Panel',
  welcomeDescription: 'Chat first, then bring in MCP tools only when the task needs them.',
  promptItems: () => [],
  locale: () => ({}),
})

const emit = defineEmits<ChatEmits>()
defineSlots<ChatSlots>()

const show = defineModel<boolean>('show', { default: false })
const fullscreen = defineModel<boolean>('fullscreen', { default: false })
const selectedModelId = defineModel<string>('selectedModelId', { default: '' })

const localeText = computed(() => ({
  newConversation: props.locale?.newConversation || 'New conversation',
  historyTitle: props.locale?.historyTitle || 'History',
  closeHistory: props.locale?.closeHistory || 'Close history',
  openHistory: props.locale?.openHistory || 'Open history',
  openMcp: props.locale?.openMcp || 'Extensions',
  mcpTitle: props.locale?.mcpTitle || 'Extensions',
  installedTabTitle: props.locale?.installedTabTitle || 'Installed',
  marketTabTitle: props.locale?.marketTabTitle || 'Market',
  searchPluginsPlaceholder: props.locale?.searchPluginsPlaceholder || 'Search plugins',
  marketCategoryPlaceholder: props.locale?.marketCategoryPlaceholder || 'Filter by category',
  missingProviderConfig:
    props.locale?.missingProviderConfig || 'Missing provider keys. Update your model config before sending messages.',
  unavailableModelConfig:
    props.locale?.unavailableModelConfig || 'Current model has no API key. Switch to an available model.',
  unavailableModelPrompt: props.locale?.unavailableModelPrompt || 'Current model is unavailable.',
  missingProviderPrompt: props.locale?.missingProviderPrompt || 'Fill provider keys first.',
  thinkingPrompt: props.locale?.thinkingPrompt || 'Assistant is thinking...',
  defaultPrompt: props.locale?.defaultPrompt || 'Ask anything...',
  selectModel: props.locale?.selectModel || props.modelPlaceholder,
  fallbackConversationTitle: props.locale?.fallbackConversationTitle || 'New conversation',
}))

const { modelOptions, selectedModel, hasApiConfig, availableModelCount } = useChatModel(
  () => props.modelOptions,
  selectedModelId,
)
const mcpStore = useChatMcp({
  storageKey: props.mcpStorageKey,
  mcpServers: props.mcpServers,
  defaultInstalledServerIds: props.defaultInstalledMcpServerIds,
  marketServerIds: props.marketMcpServerIds,
})
const chatStore = useChatConversation({
  storageKey: props.storageKey,
  activeConversationStorageKey: props.activeConversationStorageKey,
  systemPrompt: props.systemPrompt,
  selectedModel: () => selectedModel.value,
  hasApiConfig: () => hasApiConfig.value,
  getEnabledTools: mcpStore.getEnabledTools,
  callTool: mcpStore.callTool,
})

const historyDrawerOpen = ref(false)

const panelTitle = computed(() => chatStore.currentConversationTitle.value || props.title)
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
    :ariaLabel="launcherAriaLabel"
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

      <ChatThemeToggleButton />
    </template>

    <ChatConversation
      :fullscreen="fullscreen"
      :input-message="chatStore.inputMessage.value"
      :messages="chatStore.messages.value"
      :visible-messages="chatStore.visibleMessages.value"
      :is-processing="chatStore.isProcessing.value"
      :has-api-config="hasApiConfig"
      :available-model-count="availableModelCount"
      :model-options="modelOptions"
      :selected-model="selectedModel"
      :title="welcomeTitle"
      :description="welcomeDescription"
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
  box-shadow: -12px 0 40px rgba(15, 23, 42, 0.08);
}

.tr-chat :deep(.tr-container__header) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: 12px;
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
  background: var(--tr-container-bg-default);
  border: 1px solid color-mix(in srgb, var(--tr-border-color-disabled) 84%, transparent);
  border-radius: 24px;
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.14),
    0 2px 10px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-chat__history-popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tr-chat__history-popover-title {
  font-size: 18px;
  font-weight: 700;
}

.tr-chat__history-popover-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-selected-color: var(--tr-color-primary);
  --tr-history-item-space-y: 4px;
}

.tr-chat__history-popover-list :deep(.tr-history) {
  padding-right: 2px;
}

.tr-chat__history-popover-list :deep(.tr-history__search) {
  margin-bottom: 8px;
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
    background: transparent;
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
