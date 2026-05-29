<script setup lang="ts">
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h } from 'vue'
import { BubbleRenderers, BubbleList, BubbleProvider } from '../../bubble'
import DropdownMenu from '../../dropdown-menu'
import Sender from '../../sender'
import type { BubbleRoleConfig } from '../../bubble/index.type'
import type { PluginInfo } from '../../mcp-server-picker/index.type'
import type { ChatModelOption, ChatPromptItem, ChatWelcomeIcon } from '../index.type'
import ChatMcpTrigger from './ChatMcpTrigger.vue'
import ChatWelcome from './ChatWelcome.vue'

const props = defineProps<{
  fullscreen?: boolean
  inputMessage: string
  messages: Record<string, unknown>[]
  visibleMessages: Record<string, unknown>[]
  isProcessing: boolean
  hasApiConfig: boolean
  availableModelCount: number
  modelOptions: ChatModelOption[]
  selectedModel?: ChatModelOption
  title: string
  description: string
  welcomeIcon?: ChatWelcomeIcon
  promptItems?: ChatPromptItem[]
  modelPlaceholder: string
  mcpTitle: string
  installedTabTitle: string
  marketTabTitle: string
  searchPluginsPlaceholder: string
  marketCategoryPlaceholder: string
  unavailableModelConfig: string
  missingProviderConfig: string
  unavailableModelPrompt: string
  missingProviderPrompt: string
  thinkingPrompt: string
  defaultPrompt: string
  activePluginCount: number
  pickerVisible: boolean
  installedPlugins: PluginInfo[]
  marketPlugins: PluginInfo[]
}>()

const emit = defineEmits<{
  (e: 'update:inputMessage', value: string): void
  (e: 'submit', value: string): void
  (e: 'cancel'): void
  (e: 'update:selectedModelId', value: string): void
  (e: 'update:pickerVisible', value: boolean): void
  (e: 'plugin-toggle', plugin: PluginInfo, enabled: boolean): void
  (e: 'plugin-add', plugin: PluginInfo): void
  (e: 'plugin-delete', plugin: PluginInfo): void
  (e: 'tool-toggle', plugin: PluginInfo, toolId: string, enabled: boolean): void
}>()

const assistantAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: assistantAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    hidden: true,
  },
}

const senderPlaceholder = computed(() => {
  if (!props.hasApiConfig) {
    return props.availableModelCount > 0 ? props.unavailableModelPrompt : props.missingProviderPrompt
  }

  return props.isProcessing ? props.thinkingPrompt : props.defaultPrompt
})

const modelMenuItems = computed(() =>
  props.modelOptions.map((item) => ({
    id: item.id,
    text: item.name,
    disabled: !item.apiKey,
  })),
)

const compactActions = computed(() => !props.fullscreen)

function handleModelSelect(item: { id?: string }) {
  if (!item.id) {
    return
  }

  emit('update:selectedModelId', item.id)
}

function handlePickerVisibleChange(value: boolean) {
  emit('update:pickerVisible', value)
}

function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  emit('plugin-toggle', plugin, enabled)
}

function handlePluginAdd(plugin: PluginInfo) {
  emit('plugin-add', plugin)
}

function handlePluginDelete(plugin: PluginInfo) {
  emit('plugin-delete', plugin)
}

function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  emit('tool-toggle', plugin, toolId, enabled)
}
</script>

<template>
  <section class="tr-chat-conversation">
    <div class="tr-chat-conversation__body">
      <p v-if="!hasApiConfig" class="tr-chat-conversation__config-warning">
        <template v-if="availableModelCount > 0">{{ unavailableModelConfig }}</template>
        <template v-else>{{ missingProviderConfig }}</template>
      </p>

      <BubbleProvider :fallback-content-renderer="BubbleRenderers.Markdown">
        <slot name="welcome">
          <ChatWelcome
            v-if="visibleMessages.length === 0"
            :title="title"
            :description="description"
            :icon="welcomeIcon"
            :prompt-items="promptItems"
            @submit="emit('submit', $event)"
          />
        </slot>
        <BubbleList
          v-if="visibleMessages.length > 0"
          :messages="messages"
          :role-configs="roles"
          :auto-scroll="true"
          class="tr-chat-conversation__list"
        />
      </BubbleProvider>
    </div>

    <div class="tr-chat-conversation__footer">
      <Sender
        :model-value="inputMessage"
        class="tr-chat-conversation__sender"
        mode="multiple"
        :placeholder="senderPlaceholder"
        :clearable="true"
        :loading="isProcessing"
        :disabled="!hasApiConfig"
        @update:model-value="emit('update:inputMessage', $event)"
        @submit="emit('submit', $event)"
        @cancel="emit('cancel')"
      >
        <template #footer>
          <div class="tr-chat-conversation__model-actions">
            <ChatMcpTrigger
              :compact="compactActions"
              :picker-visible="pickerVisible"
              :active-plugin-count="activePluginCount"
              :installed-plugins="installedPlugins"
              :market-plugins="marketPlugins"
              :title="mcpTitle"
              :installed-tab-title="installedTabTitle"
              :market-tab-title="marketTabTitle"
              :search-placeholder="searchPluginsPlaceholder"
              :market-category-placeholder="marketCategoryPlaceholder"
              @update:picker-visible="handlePickerVisibleChange"
              @plugin-toggle="handlePluginToggle"
              @plugin-add="handlePluginAdd"
              @plugin-delete="handlePluginDelete"
              @tool-toggle="handleToolToggle"
            />
            <DropdownMenu :items="modelMenuItems" trigger="click" @item-click="handleModelSelect">
              <template #trigger>
                <button
                  class="tr-chat-conversation__sender-action-btn tr-chat-conversation__sender-model-btn"
                  :class="{ 'tr-chat-conversation__sender-model-btn--compact': compactActions }"
                  type="button"
                >
                  <component
                    :is="selectedModel?.icon || IconAi"
                    :size="16"
                    class="tr-chat-conversation__sender-action-btn-icon"
                  />
                  <span v-if="!compactActions">{{ selectedModel?.name || modelPlaceholder }}</span>
                </button>
              </template>
            </DropdownMenu>
          </div>
        </template>
      </Sender>
    </div>
  </section>
</template>

<style scoped lang="less">
.tr-chat-conversation {
  container-type: inline-size;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
}

.tr-chat-conversation__body,
.tr-chat-conversation__footer {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.tr-chat-conversation__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-chat-conversation__config-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--tr-radius-md);
  background: var(--tr-color-warning-light);
  color: var(--tr-color-warning);
  font-size: var(--tr-font-size-sm);
}

.tr-chat-conversation__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 0 0;
}

.tr-chat-conversation__sender {
  flex-shrink: 0;
}

.tr-chat-conversation__model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tr-chat-conversation__sender-action-btn {
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  height: 32px;
  padding: 0 10px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tr-chat-conversation__sender-model-btn--compact {
  min-width: 32px;
  padding: 0;
  justify-content: center;
}

.tr-chat-conversation__sender-action-btn-icon {
  flex-shrink: 0;
}

.tr-chat-conversation__sender-action-btn:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.tr-chat-conversation__sender-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 767px) {
  .tr-chat-conversation {
    padding: 0 12px 12px;
  }
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

:deep(.tr-chat-conversation__sender .tr-sender) {
  box-shadow: none;
  background: transparent;
}
</style>
