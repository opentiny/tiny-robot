<template>
  <div
    class="assistant-demo"
    v-dropzone="{
      accept: 'image/jpeg, image/png',
      multiple: true,
      onDrop: handleFilesDropped,
      onError: handleFilesRejected,
      onDraggingChange: handleDraggingChange,
    }"
  >
    <div class="assistant-demo__layout-root">
      <div class="assistant-demo__shell">
        <aside class="assistant-demo__sidebar assistant-demo__sidebar--desktop" aria-label="历史对话">
          <div class="assistant-demo__sidebar-head">
            <span class="assistant-demo__sidebar-title">历史对话</span>
            <tr-icon-button
              :icon="IconNewSession"
              size="28"
              svgSize="20"
              title="新会话"
              @click="activeConversationId = null"
            />
          </div>
          <tr-history
            class="assistant-demo__history"
            :selected="activeConversationId ?? undefined"
            :search-bar="true"
            :data="historyData"
            @item-title-change="handleHistoryTitleChange"
            @item-click="handleHistorySelect"
            @item-action="handleHistoryAction"
          />
        </aside>

        <main class="assistant-demo__main">
          <div class="assistant-demo__mobile-bar">
            <div class="assistant-demo__mobile-bar-actions">
              <tr-icon-button
                :icon="IconHistory"
                size="28"
                svgSize="20"
                title="历史会话"
                aria-label="打开历史会话"
                @click="historyDrawerOpen = true"
              />
              <tr-icon-button
                :icon="IconNewSession"
                size="28"
                svgSize="20"
                title="新会话"
                aria-label="新会话"
                @click="activeConversationId = null"
              />
            </div>
          </div>
          <div v-if="messages.length === 0" class="assistant-demo__welcome">
            <tr-welcome title="TinyRobot" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="welcomeIcon" />
            <tr-prompts
              :items="promptItems"
              :wrap="true"
              item-class="prompt-item"
              class="assistant-demo__prompts"
              @item-click="handlePromptItemClick"
            />
          </div>
          <tr-bubble-list
            v-else
            class="assistant-demo__bubble-list"
            :messages="messages"
            :role-configs="roles"
            auto-scroll
          />

          <div class="assistant-demo__footer">
            <p class="assistant-demo__mcp-hint">
              消息中含「搜索 / search / MCP / 工具 / 查询」等关键词可触发模拟 MCP 工具调用（toolPlugin + 模拟 MCP
              服务）。
            </p>
            <div class="assistant-demo__pills">
              <tr-suggestion-popover
                style="--tr-suggestion-popover-width: 440px"
                :data="popoverData"
                @item-click="handlePopoverItemClick"
              >
                <template #trigger>
                  <tr-suggestion-pill-button>
                    <template #icon>
                      <IconSparkles style="font-size: 16px; color: #1476ff" />
                    </template>
                  </tr-suggestion-pill-button>
                </template>
              </tr-suggestion-popover>
              <tr-suggestion-pills class="assistant-demo__pills-row">
                <tr-dropdown-menu
                  v-for="(item, index) in pillItems"
                  :key="index"
                  :items="item.menu.items"
                  trigger="click"
                  @item-click="item.menu.onItemClick"
                >
                  <template #trigger>
                    <tr-suggestion-pill-button>{{ item.text }}</tr-suggestion-pill-button>
                  </template>
                </tr-dropdown-menu>
              </tr-suggestion-pills>
            </div>
            <tr-sender
              ref="senderRef"
              mode="single"
              v-model="inputMessage"
              class="assistant-demo__sender"
              :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
              :clearable="true"
              :loading="isProcessing"
              :showWordLimit="true"
              :maxLength="1000"
              v-model:template-data="currentTemplate"
              @submit="handleSendMessage"
              @cancel="abortActiveRequest"
              @reset-template="clearTemplate"
            />
          </div>
        </main>
      </div>
    </div>

    <!-- History drawer: overlay clipped to .assistant-demo -->
    <Transition name="assistant-demo-drawer">
      <div
        v-if="historyDrawerOpen"
        class="assistant-demo__drawer-root"
        role="dialog"
        aria-modal="true"
        aria-label="历史对话"
      >
        <div class="assistant-demo__drawer-backdrop" @click="historyDrawerOpen = false" />
        <aside class="assistant-demo__drawer-panel" @click.stop>
          <div class="assistant-demo__sidebar-head">
            <span class="assistant-demo__sidebar-title">历史对话</span>
            <div class="assistant-demo__drawer-actions">
              <tr-icon-button
                :icon="IconNewSession"
                size="28"
                svgSize="20"
                title="新会话"
                @click="resetSessionAndCloseDrawer"
              />
              <tr-icon-button
                :icon="IconClose"
                size="28"
                svgSize="20"
                title="关闭"
                aria-label="关闭历史对话"
                @click="historyDrawerOpen = false"
              />
            </div>
          </div>
          <tr-history
            class="assistant-demo__history assistant-demo__history--drawer"
            :selected="activeConversationId ?? undefined"
            :search-bar="true"
            :data="historyData"
            @item-title-change="handleHistoryTitleChange"
            @item-click="handleHistorySelect"
            @item-action="handleHistoryAction"
          />
        </aside>
      </div>
    </Transition>

    <tr-drag-overlay
      :overlay-title="overlayTitle"
      :overlay-description="overlayDescription"
      :is-dragging="isDragging"
      :fullscreen="false"
      :drag-target="targetElement"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  BubbleRoleConfig,
  FileRejection,
  HistoryMenuItem,
  PromptProps,
  SuggestionGroup,
  SuggestionItem,
  UserItem,
} from '@opentiny/tiny-robot'
import {
  TrBubbleList,
  TrDragOverlay,
  TrDropdownMenu,
  TrHistory,
  TrIconButton,
  TrPrompts,
  TrSender,
  TrSuggestionPillButton,
  TrSuggestionPills,
  TrSuggestionPopover,
  TrWelcome,
  vDropzone,
} from '@opentiny/tiny-robot'
import type { ConversationInfo, UseMessageOptions, UseMessageReturn } from '@opentiny/tiny-robot-kit'
import { toolPlugin, useConversation } from '@opentiny/tiny-robot-kit'
import {
  IconAi,
  IconClose,
  IconEdit,
  IconHistory,
  IconNewSession,
  IconSparkles,
  IconUser,
} from '@opentiny/tiny-robot-svgs'
import { computed, type CSSProperties, h, markRaw, nextTick, onMounted, ref, watch } from 'vue'
import {
  DROPDOWN_MENU_ITEMS,
  OVERLAY_DESCRIPTION,
  OVERLAY_TITLE,
  PILL_ITEMS_CONFIG,
  PROMPT_ITEMS_DATA,
  suggestionPopoverData,
  templateSuggestions,
} from './assistantConstants'
import { callMcpTool, MCP_TOOLS } from './mockMcp'
import { assistantResponseProvider } from './responseProvider'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
const welcomeIcon = h(IconAi, { style: { fontSize: '48px' } })

const promptItems: PromptProps[] = PROMPT_ITEMS_DATA.map((item) => ({
  ...item,
  icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, item.emoji),
}))

const dropdownMenuItems = ref(DROPDOWN_MENU_ITEMS)

const popoverData = ref<SuggestionGroup[]>(suggestionPopoverData)

const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  deleteConversation,
  updateConversationTitle,
  sendMessage: sendToActiveConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: assistantResponseProvider as UseMessageOptions['responseProvider'],
    plugins: [
      toolPlugin({
        getTools: async () => MCP_TOOLS,
        callTool: async (toolCall) => {
          const args = JSON.parse(toolCall.function?.arguments || '{}')
          return callMcpTool(toolCall.function?.name || '', args)
        },
      }),
    ],
  },
})

const historyData = computed(() =>
  conversations.value.map((item) => ({
    ...item,
    title: item.title || '',
  })),
)

const messageEngine = computed<UseMessageReturn | undefined>(() => activeConversation.value?.engine)
const messages = computed(() => messageEngine.value?.messages.value || [])
const isProcessing = computed(() => messageEngine.value?.isProcessing.value ?? false)

const sendMessage = (content: string) => {
  if (!activeConversationId.value) {
    createConversation({ title: content.slice(0, 10) })
  }
  sendToActiveConversation(content)
}

const handlePromptItemClick = (ev: unknown, item: { description?: string }) => {
  if (!item.description) return
  sendMessage(item.description)
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    hidden: true,
  },
}

const handleHistoryTitleChange = (newTitle: string, item: ConversationInfo) => {
  updateConversationTitle(item.id, newTitle)
}

const historyDrawerOpen = ref(false)

const overlayTitle = OVERLAY_TITLE
const overlayDescription = OVERLAY_DESCRIPTION
const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)

const handleDraggingChange = (dragging: boolean, element: HTMLElement | null) => {
  isDragging.value = dragging
  targetElement.value = element
}

const handleFilesDropped = (files: File[]) => {
  console.log('上传的文件:', files)
}

const handleFilesRejected = (rejection: FileRejection) => {
  console.error('被拒绝的文件:', rejection)
}

const resetSessionAndCloseDrawer = () => {
  activeConversationId.value = null
  historyDrawerOpen.value = false
}

const handleHistorySelect = (item: ConversationInfo) => {
  switchConversation(item.id)
  historyDrawerOpen.value = false
}

const handleHistoryAction = (action: HistoryMenuItem, item: ConversationInfo) => {
  if (action.id === 'delete') {
    deleteConversation(item.id)
  }
}

const senderRef = ref<InstanceType<typeof TrSender> | null>(null)
const inputMessage = ref('')
const currentTemplate = ref<UserItem[]>([])
const suggestionOpen = ref(false)

// Load template chips into the sender.
const handleFillTemplate = (template: UserItem[]) => {
  currentTemplate.value = template
  inputMessage.value = ''

  nextTick(() => {
    senderRef.value?.activateTemplateFirstField()
  })
}

// 清除当前指令
const clearTemplate = () => {
  // 清空指令相关状态
  currentTemplate.value = []

  // 确保重新聚焦到输入框
  nextTick(() => {
    senderRef.value?.focus()
  })
}

// 发送消息
const handleSendMessage = (textContent: string) => {
  sendMessage(textContent)
  inputMessage.value = ''
  clearTemplate()
}

const handlePopoverItemClick = (item: SuggestionItem) => {
  sendMessage(item.text)
}

const pillItems = computed(() =>
  PILL_ITEMS_CONFIG.map((config) => {
    const base = { text: config.text, icon: markRaw(IconEdit) }
    if (config.type === 'dropdown') {
      return {
        ...base,
        menu: {
          items: dropdownMenuItems.value,
          onItemClick: (item: unknown) => sendMessage((item as { text: string }).text),
        },
      }
    }
    const [start, end] = config.range
    const items = end !== undefined ? templateSuggestions.slice(start, end) : templateSuggestions.slice(start)
    return {
      ...base,
      menu: {
        items,
        onItemClick: (item: unknown) => handleFillTemplate((item as { template: UserItem[] }).template),
      },
    }
  }),
)

watch(
  () => inputMessage.value,
  (value) => {
    if (suggestionOpen.value && value === '') {
      suggestionOpen.value = false
    }
  },
)

// Focus sender shortly after mount.
onMounted(() => {
  setTimeout(() => {
    senderRef.value?.focus()
  }, 500)
})
</script>

<style scoped>
.assistant-demo {
  /* Inline-size container for layout queries and cqw units. */
  container-type: inline-size;
  width: 100%;
  min-width: 0;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: min(560px, calc(100vh - 200px));
  position: relative;
  border-radius: 16px;
  overflow: visible;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  background: var(--tr-container-bg-default, #fff);
}

.assistant-demo__layout-root {
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  position: relative;
}

.assistant-demo__shell {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 16px;
}

/* Narrow demo width: drawer + mobile bar; hide desktop history column. */
@container (max-width: 767px) {
  .assistant-demo__sidebar--desktop {
    display: none !important;
  }

  .assistant-demo__mobile-bar {
    display: flex !important;
  }
}

/* Wide demo width: desktop history column; hide drawer and mobile bar. */
@container (min-width: 768px) {
  .assistant-demo__mobile-bar {
    display: none !important;
  }

  .assistant-demo__drawer-root {
    display: none !important;
  }

  .assistant-demo__prompts {
    --tr-prompt-width: calc(50% - 8px);
  }
}

.assistant-demo__mobile-bar {
  display: none;
  flex-shrink: 0;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--tr-color-border, rgba(0, 0, 0, 0.08));
}

.assistant-demo__mobile-bar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Drawer transition: backdrop fade. */
.assistant-demo-drawer-enter-active,
.assistant-demo-drawer-leave-active {
  transition: none;
}

.assistant-demo-drawer-enter-active .assistant-demo__drawer-backdrop,
.assistant-demo-drawer-leave-active .assistant-demo__drawer-backdrop {
  transition: opacity 0.28s ease;
}

.assistant-demo-drawer-enter-from .assistant-demo__drawer-backdrop,
.assistant-demo-drawer-leave-to .assistant-demo__drawer-backdrop {
  opacity: 0;
}

.assistant-demo__drawer-root {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  border-radius: inherit;
}

.assistant-demo__drawer-root > * {
  pointer-events: auto;
}

.assistant-demo__drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  border-radius: inherit;
}

.assistant-demo__drawer-panel {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: min(300px, 92cqw);
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 8px;
  background: var(--tr-container-bg-default, #fff);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  border-right: 1px solid var(--tr-color-border, rgba(0, 0, 0, 0.08));
}

.assistant-demo__drawer-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.assistant-demo__history--drawer {
  flex: 1;
  min-height: 0;
}

.assistant-demo__sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--tr-color-border, rgba(0, 0, 0, 0.08));
  padding: 12px;
  gap: 8px;
}

.assistant-demo__sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 8px;
}

.assistant-demo__sidebar-title {
  font-weight: 600;
  font-size: 15px;
}

.assistant-demo__history {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-selected-color: var(--tr-color-primary);
  --tr-history-item-space-y: 4px;
}

.assistant-demo__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.assistant-demo__welcome {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.assistant-demo__bubble-list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.assistant-demo__prompts {
  padding: 16px 24px 24px;
  --tr-prompt-width: 100%;
}

.assistant-demo__footer {
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--tr-color-border, rgba(0, 0, 0, 0.06));
}

.assistant-demo__mcp-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--tr-color-text-secondary, #666);
}

.assistant-demo__pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assistant-demo__pills-row {
  flex: 1;
  min-width: 0;
}

.assistant-demo__pills-row :deep(.tr-suggestion-pills__container) {
  mask: linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
}

.assistant-demo__sender :deep(.tr-sender) {
  max-width: none;
}

:deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
