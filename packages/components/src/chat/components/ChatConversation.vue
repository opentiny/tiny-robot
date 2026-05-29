<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { IconAi, IconArrowDown, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h, nextTick, ref, type ComponentPublicInstance, watch } from 'vue'
import { BubbleRenderers, BubbleList, BubbleProvider } from '../../bubble'
import DropdownMenu from '../../dropdown-menu'
import Sender from '../../sender'
import type { BubbleRoleConfig } from '../../bubble/index.type'
import type { PluginInfo } from '../../mcp-server-picker/index.type'
import type { ChatLang, ChatModelOption, ChatPromptItem, ChatWelcomeIcon } from '../index.type'
import ChatMcpTrigger from './ChatMcpTrigger.vue'
import ChatWelcome from './ChatWelcome.vue'

const props = defineProps<{
  lang: ChatLang
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

type BubbleListInstance = ComponentPublicInstance & {
  $el: HTMLElement
  scrollToBottom?: (behavior?: ScrollBehavior) => Promise<void>
}

const assistantAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })
const bubbleListRef = ref<BubbleListInstance | null>(null)

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
  })),
)

const compactActions = computed(() => !props.fullscreen)
const bubbleListElement = computed(() => bubbleListRef.value?.$el ?? null)
const { y } = useScroll(bubbleListElement, { throttle: 60 })
const isNearBottom = ref(true)
const lastMessage = computed(() => props.messages.at(-1))

function syncNearBottomState() {
  const el = bubbleListElement.value

  if (!el) {
    isNearBottom.value = true
    return
  }

  isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight <= 24
}

watch(y, syncNearBottomState, { immediate: true })
watch(bubbleListElement, () => nextTick(syncNearBottomState), { immediate: true })
watch(
  () => [props.messages.length, lastMessage.value?.content, lastMessage.value?.reasoning_content, props.isProcessing],
  async () => {
    await nextTick()
    syncNearBottomState()
  },
  { flush: 'post' },
)

const showScrollToBottom = computed(() => props.visibleMessages.length > 0 && !isNearBottom.value)
const selectedModelLabel = computed(() => props.selectedModel?.name || props.modelPlaceholder)

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

function handleScrollToBottom() {
  void bubbleListRef.value?.scrollToBottom?.('smooth')
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
            :lang="lang"
            :title="title"
            :description="description"
            :icon="welcomeIcon"
            :prompt-items="promptItems"
            @submit="emit('submit', $event)"
          />
        </slot>
        <BubbleList
          ref="bubbleListRef"
          v-if="visibleMessages.length > 0"
          :messages="messages"
          :role-configs="roles"
          :auto-scroll="true"
          class="tr-chat-conversation__list"
        />
      </BubbleProvider>
      <button
        v-if="showScrollToBottom"
        class="tr-chat-conversation__scroll-bottom"
        type="button"
        @click="handleScrollToBottom"
      >
        <IconArrowDown />
      </button>
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
                  :title="selectedModelLabel"
                >
                  <span class="tr-chat-conversation__sender-model-icon-shell">
                    <component
                      :is="selectedModel?.icon || IconAi"
                      :size="16"
                      class="tr-chat-conversation__sender-action-btn-icon tr-chat-conversation__sender-model-icon"
                    />
                  </span>
                  <span v-if="!compactActions" class="tr-chat-conversation__sender-model-label">{{
                    selectedModelLabel
                  }}</span>
                  <IconArrowDown v-if="!compactActions" class="tr-chat-conversation__sender-model-caret" />
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
  gap: 16px;
  padding: 0 18px 18px;
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-chat-conversation__config-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--tr-radius-md);
  border: 1px solid color-mix(in srgb, var(--tr-color-warning) 20%, transparent);
  background: color-mix(in srgb, var(--tr-color-warning-light) 84%, var(--tr-container-bg-default));
  color: var(--tr-color-warning);
  font-size: var(--tr-font-size-sm);
}

.tr-chat-conversation__list {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  padding: 15px 20px;
  margin: 0 -6px;
  scroll-padding-bottom: 24px;
}

.tr-chat-conversation__sender {
  flex-shrink: 0;
}

.tr-chat-conversation__scroll-bottom {
  position: absolute;
  right: 0;
  bottom: 24px;
  z-index: 2;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 58%, transparent);
  border-radius: 999px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.12),
    0 2px 8px rgba(15, 23, 42, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.tr-chat-conversation__scroll-bottom:hover {
  transform: translateX(-50%) translateY(-1px);
  box-shadow:
    0 14px 28px rgba(15, 23, 42, 0.14),
    0 4px 10px rgba(15, 23, 42, 0.08);
}

.tr-chat-conversation__scroll-bottom :deep(svg) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.tr-chat-conversation__model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tr-chat-conversation__sender-action-btn {
  border: 1px solid color-mix(in srgb, var(--tr-border-color-disabled) 82%, transparent);
  border-radius: var(--tr-radius-full);
  background: color-mix(in srgb, var(--tr-container-bg-default) 94%, var(--tr-container-bg-default-2));
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  height: 32px;
  padding: 0 10px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.tr-chat-conversation__sender-model-btn--compact {
  min-width: 36px;
  padding: 0 4px;
  justify-content: center;
}

.tr-chat-conversation__sender-action-btn-icon {
  flex-shrink: 0;
}

.tr-chat-conversation__sender-model-btn {
  min-width: 0;
  padding: 0 8px 0 4px;
  gap: 8px;
}

.tr-chat-conversation__sender-model-icon-shell {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 88%, var(--tr-container-bg-default-2));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tr-chat-conversation__sender-model-btn--compact .tr-chat-conversation__sender-model-icon-shell {
  width: 20px;
  height: 20px;
}

.tr-chat-conversation__sender-model-icon {
  display: block;
}

.tr-chat-conversation__sender-model-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tr-chat-conversation__sender-model-caret {
  width: 12px;
  height: 12px;
  color: var(--tr-text-tertiary);
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

  .tr-chat-conversation__scroll-bottom {
    bottom: 18px;
  }
}

:deep([data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: var(--tr-chat-user-bubble-bg);
  --tr-bubble-box-border: none;
  --tr-bubble-box-shadow: none;
}

:deep([data-box-type='box'][data-role='assistant']) {
  --tr-bubble-box-bg: var(--tr-chat-assistant-bubble-bg);
  --tr-bubble-box-border: 1px solid var(--tr-chat-assistant-bubble-border);
  --tr-bubble-box-shadow: none;
}

:deep([data-box-type='box']:not([data-role='user']):not([data-role='assistant'])) {
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
