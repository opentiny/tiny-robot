<template>
  <tr-container
    v-dropzone="{
      accept: 'image/jpeg, image/png',
      multiple: true,
      onDrop: handleFilesDropped,
      onError: handleFilesRejected,
      onDraggingChange: handleDraggingChange,
    }"
    v-model:fullscreen="fullscreen"
    v-model:show="show"
    class="tiny-container"
    :style="containerStyles"
  >
    <template #operations>
      <tr-icon-button :icon="IconNewSession" size="28" svgSize="20" @click="activeConversationId = null" />
      <span style="display: inline-flex; line-height: 0; position: relative">
        <tr-icon-button :icon="IconHistory" size="28" svgSize="20" @click="showHistory = true" />
        <div v-show="showHistory" class="tr-history-demo-container">
          <div><h3 style="margin: 0; padding: 0 12px">历史对话</h3></div>
          <tr-icon-button
            :icon="IconClose"
            size="28"
            svgSize="20"
            @click="showHistory = false"
            style="position: absolute; right: 14px; top: 14px"
          />
          <tr-history
            class="tr-history-demo"
            :selected="activeConversationId ?? undefined"
            :search-bar="true"
            :data="historyData"
            @item-title-change="handleHistoryTitleChange"
            @item-click="handleHistorySelect"
            @item-action="handleHistoryAction"
          ></tr-history>
        </div>
      </span>
    </template>
    <div :class="{ 'max-container': fullscreen }" v-if="messages.length === 0">
      <tr-welcome title="TinyRobot" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="welcomeIcon">
      </tr-welcome>
      <tr-prompts
        :items="promptItems"
        :wrap="true"
        item-class="prompt-item"
        class="tiny-prompts"
        @item-click="handlePromptItemClick"
      ></tr-prompts>
    </div>
    <tr-bubble-list
      :class="{ 'max-container': fullscreen }"
      v-else
      :messages="messages"
      :role-configs="roles"
      auto-scroll
    ></tr-bubble-list>

    <template #footer>
      <div class="chat-input" :class="{ 'max-container': fullscreen }">
        <div class="chat-input-pills">
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
          <tr-suggestion-pills class="pills">
            <tr-dropdown-menu
              v-for="(item, index) in pillItems"
              :items="item.menu.items"
              @item-click="item.menu.onItemClick"
              :key="index"
              trigger="click"
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
          :class="{ 'tr-sender-compact': !fullscreen }"
          :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
          :clearable="true"
          :loading="isProcessing"
          :showWordLimit="true"
          :maxLength="1000"
          v-model:template-data="currentTemplate"
          @submit="handleSendMessage"
          @cancel="abortActiveRequest"
          @reset-template="clearTemplate"
        ></tr-sender>
      </div>
    </template>
  </tr-container>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <div>
      <label>show：</label>
      <tiny-switch v-model="show"></tiny-switch>
    </div>
    <div>
      <label>fullscreen：</label>
      <tiny-switch v-model="fullscreen"></tiny-switch>
    </div>
  </div>

  <tr-drag-overlay
    :overlay-title="overlayTitle"
    :overlay-description="overlayDescription"
    :is-dragging="isDragging"
    :fullscreen="fullscreen"
    :drag-target="targetElement"
  />
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
  TrContainer,
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
import { ConversationInfo, toolPlugin, useConversation } from '@opentiny/tiny-robot-kit'
import {
  IconAi,
  IconClose,
  IconEdit,
  IconHistory,
  IconNewSession,
  IconSparkles,
  IconUser,
} from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { computed, type CSSProperties, h, markRaw, nextTick, onMounted, ref, watch } from 'vue'
import {
  DROPDOWN_MENU_ITEMS,
  getContainerStyles,
  OVERLAY_DESCRIPTION,
  OVERLAY_TITLE,
  PILL_ITEMS_CONFIG,
  PROMPT_ITEMS_DATA,
  suggestionPopoverData,
  templateSuggestions,
} from './assistantConstants'
import { callMcpTool, MCP_TOOLS } from './mockMcp'
import { assistantResponseProvider } from './responseProvider'

const fullscreen = ref(false)
const show = ref(true)

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
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: assistantResponseProvider,
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

const messageEngine = computed(() => activeConversation.value?.engine)
const messages = computed(() => messageEngine.value?.messages.value || [])
const isProcessing = computed(() => messageEngine.value?.isProcessing.value)

const sendMessage = (content: string) => {
  if (!activeConversationId.value) {
    createConversation({ title: content.slice(0, 10) })
  }
  messageEngine.value?.sendMessage(content)
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
}

const showHistory = ref(false)

const handleHistoryTitleChange = (newTitle: string, item: ConversationInfo) => {
  updateConversationTitle(item.id, newTitle)
}

const handleHistorySelect = (item: ConversationInfo) => {
  switchConversation(item.id)
  showHistory.value = false
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

// 设置指令
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
const handleSendMessage = () => {
  sendMessage(inputMessage.value)

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
    // 如果指令面板已打开，并且指令为空，关闭指令面板
    if (suggestionOpen.value && value === '') {
      suggestionOpen.value = false
    }
  },
)

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

// 页面加载完成后自动聚焦输入框
onMounted(() => {
  setTimeout(() => {
    senderRef.value?.focus()
  }, 500)
})

const containerStyles = getContainerStyles()
</script>

<style scoped>
@media (min-width: 1280px) {
  .max-container {
    width: 1280px;
    margin: 0 auto;
  }
}

.chat-input {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .chat-input-pills {
    display: flex;
    align-items: center;
    gap: 8px;

    .pills {
      flex: 1;
      :deep(.tr-suggestion-pills__container) {
        mask: linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
      }
    }
  }
}

.tiny-container {
  container-type: inline-size;

  :deep(.tr-welcome__title-wrapper) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.tiny-prompts {
  padding: 16px 24px;

  --tr-prompt-width: 100%;

  @container (width >=64rem) {
    --tr-prompt-width: calc(50% - 8px);
  }
}

.tr-history-demo-container {
  position: absolute;
  right: 100%;
  top: 100%;
  z-index: var(--tr-z-index-popover);
  width: 300px;
  height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  background-color: var(--tr-container-bg-default);
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .tr-history-demo {
    overflow-y: auto;
    flex: 1;

    --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
    --tr-history-item-selected-color: var(--tr-color-primary);
    --tr-history-item-space-y: 4px;
  }
}
</style>
