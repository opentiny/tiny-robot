const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/AssistantContainerExample.q6RSOV-b.js","assets/chunks/framework.CV5uswMq.js","assets/chunks/theme.D0z9_hSQ.js","assets/chunks/index.BJskwZNb.js","assets/chunks/responseProvider.I8dBiSmV.js","assets/chunks/AssistantPageExample.Dx7dxyU6.js"])))=>i.map(i=>d[i]);
import{aD as B,bQ as l,aZ as u,aL as F,v as y,H as v,bL as c,bB as p,J as e,bk as t,bJ as s,G as D,w as i,I as r,b7 as m,aU as f}from"./chunks/framework.CV5uswMq.js";import{L as d,N as g}from"./chunks/index.UKYjhuGV.js";const h=`<template>
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
const show = ref(false)

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
<\/script>

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
`,x=`<template>
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
<\/script>

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
`,T=JSON.parse('{"title":"综合示例","description":"","frontmatter":{},"headers":[],"relativePath":"examples/assistant.md","filePath":"examples/assistant.md"}'),b={name:"examples/assistant.md"},P=Object.assign(b,{setup(_){const a=m();B(async()=>{a.value=(await l(async()=>{const{default:o}=await import("./chunks/AssistantContainerExample.q6RSOV-b.js");return{default:o}},__vite__mapDeps([0,1,2,3,4]))).default});const C=f(!0),E=m();return B(async()=>{E.value=(await l(async()=>{const{default:o}=await import("./chunks/AssistantPageExample.Dx7dxyU6.js");return{default:o}},__vite__mapDeps([5,1,2,3,4]))).default}),(o,n)=>{const A=u("ClientOnly");return F(),y("div",null,[n[2]||(n[2]=v('<h1 id="综合示例" tabindex="-1">综合示例 <a class="header-anchor" href="#综合示例" aria-label="Permalink to &quot;综合示例&quot;">​</a></h1><h2 id="直接嵌入页面" tabindex="-1">直接嵌入页面 <a class="header-anchor" href="#直接嵌入页面" aria-label="Permalink to &quot;直接嵌入页面&quot;">​</a></h2><p>在页面主体布局中集成 <code>TrBubbleList</code>、<code>TrSender</code>、<code>TrHistory</code>，配合 <code>useConversation</code> 与消息引擎，完成多会话与消息收发。</p>',3)),c(e(t(d),null,null,512),[[p,C.value]]),e(A,null,{default:s(()=>[e(t(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22AssistantPageExample.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FAssistantPageExample.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%5Cn%20%20%20%20class%3D%5C%22assistant-demo%5C%22%5Cn%20%20%20%20v-dropzone%3D%5C%22%7B%5Cn%20%20%20%20%20%20accept%3A%20'image%2Fjpeg%2C%20image%2Fpng'%2C%5Cn%20%20%20%20%20%20multiple%3A%20true%2C%5Cn%20%20%20%20%20%20onDrop%3A%20handleFilesDropped%2C%5Cn%20%20%20%20%20%20onError%3A%20handleFilesRejected%2C%5Cn%20%20%20%20%20%20onDraggingChange%3A%20handleDraggingChange%2C%5Cn%20%20%20%20%7D%5C%22%5Cn%20%20%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__layout-root%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__shell%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Caside%20class%3D%5C%22assistant-demo__sidebar%20assistant-demo__sidebar--desktop%5C%22%20aria-label%3D%5C%22%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__sidebar-head%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22assistant-demo__sidebar-title%5C%22%3E%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconNewSession%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3D%5C%22%E6%96%B0%E4%BC%9A%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22activeConversationId%20%3D%20null%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-history%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22assistant-demo__history%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aselected%3D%5C%22activeConversationId%20%3F%3F%20undefined%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Asearch-bar%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22historyData%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-title-change%3D%5C%22handleHistoryTitleChange%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handleHistorySelect%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-action%3D%5C%22handleHistoryAction%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Faside%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%3Cmain%20class%3D%5C%22assistant-demo__main%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__mobile-bar%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__mobile-bar-actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconHistory%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3D%5C%22%E5%8E%86%E5%8F%B2%E4%BC%9A%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20aria-label%3D%5C%22%E6%89%93%E5%BC%80%E5%8E%86%E5%8F%B2%E4%BC%9A%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22historyDrawerOpen%20%3D%20true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconNewSession%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3D%5C%22%E6%96%B0%E4%BC%9A%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20aria-label%3D%5C%22%E6%96%B0%E4%BC%9A%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22activeConversationId%20%3D%20null%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22messages.length%20%3D%3D%3D%200%5C%22%20class%3D%5C%22assistant-demo__welcome%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-welcome%20title%3D%5C%22TinyRobot%5C%22%20description%3D%5C%22%E6%82%A8%E5%A5%BD%EF%BC%8C%E6%88%91%E6%98%AFTinyRobot%EF%BC%8C%E6%82%A8%E4%B8%93%E5%B1%9E%E7%9A%84%20AI%20%E6%99%BA%E8%83%BD%E4%B8%93%E5%AE%B6%5C%22%20%3Aicon%3D%5C%22welcomeIcon%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-prompts%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22promptItems%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Awrap%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20item-class%3D%5C%22prompt-item%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22assistant-demo__prompts%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handlePromptItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-bubble-list%5Cn%20%20%20%20%20%20%20%20%20%20%20%20v-else%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22assistant-demo__bubble-list%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Amessages%3D%5C%22messages%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Arole-configs%3D%5C%22roles%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20auto-scroll%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__footer%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22assistant-demo__mcp-hint%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E6%B6%88%E6%81%AF%E4%B8%AD%E5%90%AB%E3%80%8C%E6%90%9C%E7%B4%A2%20%2F%20search%20%2F%20MCP%20%2F%20%E5%B7%A5%E5%85%B7%20%2F%20%E6%9F%A5%E8%AF%A2%E3%80%8D%E7%AD%89%E5%85%B3%E9%94%AE%E8%AF%8D%E5%8F%AF%E8%A7%A6%E5%8F%91%E6%A8%A1%E6%8B%9F%20MCP%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%88toolPlugin%20%2B%20%E6%A8%A1%E6%8B%9F%20MCP%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E6%9C%8D%E5%8A%A1%EF%BC%89%E3%80%82%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__pills%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-popover%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22--tr-suggestion-popover-width%3A%20440px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22popoverData%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handlePopoverItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23trigger%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23icon%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CIconSparkles%20style%3D%5C%22font-size%3A%2016px%3B%20color%3A%20%231476ff%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-popover%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pills%20class%3D%5C%22assistant-demo__pills-row%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-dropdown-menu%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(item%2C%20index)%20in%20pillItems%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22item.menu.items%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20trigger%3D%5C%22click%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22item.menu.onItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23trigger%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pill-button%3E%7B%7B%20item.text%20%7D%7D%3C%2Ftr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-dropdown-menu%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-pills%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22senderRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22assistant-demo__sender%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3AshowWordLimit%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3AmaxLength%3D%5C%221000%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-model%3Atemplate-data%3D%5C%22currentTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSendMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40reset-template%3D%5C%22clearTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fmain%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3C!--%20History%20drawer%3A%20overlay%20clipped%20to%20.assistant-demo%20--%3E%5Cn%20%20%20%20%3CTransition%20name%3D%5C%22assistant-demo-drawer%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%5Cn%20%20%20%20%20%20%20%20v-if%3D%5C%22historyDrawerOpen%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22assistant-demo__drawer-root%5C%22%5Cn%20%20%20%20%20%20%20%20role%3D%5C%22dialog%5C%22%5Cn%20%20%20%20%20%20%20%20aria-modal%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20aria-label%3D%5C%22%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__drawer-backdrop%5C%22%20%40click%3D%5C%22historyDrawerOpen%20%3D%20false%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3Caside%20class%3D%5C%22assistant-demo__drawer-panel%5C%22%20%40click.stop%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__sidebar-head%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22assistant-demo__sidebar-title%5C%22%3E%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22assistant-demo__drawer-actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconNewSession%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3D%5C%22%E6%96%B0%E4%BC%9A%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22resetSessionAndCloseDrawer%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconClose%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3D%5C%22%E5%85%B3%E9%97%AD%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20aria-label%3D%5C%22%E5%85%B3%E9%97%AD%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22historyDrawerOpen%20%3D%20false%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-history%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22assistant-demo__history%20assistant-demo__history--drawer%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aselected%3D%5C%22activeConversationId%20%3F%3F%20undefined%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Asearch-bar%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22historyData%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-title-change%3D%5C%22handleHistoryTitleChange%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handleHistorySelect%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-action%3D%5C%22handleHistoryAction%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Faside%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2FTransition%3E%5Cn%5Cn%20%20%20%20%3Ctr-drag-overlay%5Cn%20%20%20%20%20%20%3Aoverlay-title%3D%5C%22overlayTitle%5C%22%5Cn%20%20%20%20%20%20%3Aoverlay-description%3D%5C%22overlayDescription%5C%22%5Cn%20%20%20%20%20%20%3Ais-dragging%3D%5C%22isDragging%5C%22%5Cn%20%20%20%20%20%20%3Afullscreen%3D%5C%22false%5C%22%5Cn%20%20%20%20%20%20%3Adrag-target%3D%5C%22targetElement%5C%22%5Cn%20%20%20%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20type%20%7B%5Cn%20%20BubbleRoleConfig%2C%5Cn%20%20FileRejection%2C%5Cn%20%20HistoryMenuItem%2C%5Cn%20%20PromptProps%2C%5Cn%20%20SuggestionGroup%2C%5Cn%20%20SuggestionItem%2C%5Cn%20%20UserItem%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrDragOverlay%2C%5Cn%20%20TrDropdownMenu%2C%5Cn%20%20TrHistory%2C%5Cn%20%20TrIconButton%2C%5Cn%20%20TrPrompts%2C%5Cn%20%20TrSender%2C%5Cn%20%20TrSuggestionPillButton%2C%5Cn%20%20TrSuggestionPills%2C%5Cn%20%20TrSuggestionPopover%2C%5Cn%20%20TrWelcome%2C%5Cn%20%20vDropzone%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20ConversationInfo%2C%20UseMessageOptions%2C%20UseMessageReturn%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20toolPlugin%2C%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20IconAi%2C%5Cn%20%20IconClose%2C%5Cn%20%20IconEdit%2C%5Cn%20%20IconHistory%2C%5Cn%20%20IconNewSession%2C%5Cn%20%20IconSparkles%2C%5Cn%20%20IconUser%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20computed%2C%20type%20CSSProperties%2C%20h%2C%20markRaw%2C%20nextTick%2C%20onMounted%2C%20ref%2C%20watch%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20DROPDOWN_MENU_ITEMS%2C%5Cn%20%20OVERLAY_DESCRIPTION%2C%5Cn%20%20OVERLAY_TITLE%2C%5Cn%20%20PILL_ITEMS_CONFIG%2C%5Cn%20%20PROMPT_ITEMS_DATA%2C%5Cn%20%20suggestionPopoverData%2C%5Cn%20%20templateSuggestions%2C%5Cn%7D%20from%20'.%2FassistantConstants'%5Cnimport%20%7B%20callMcpTool%2C%20MCP_TOOLS%20%7D%20from%20'.%2FmockMcp'%5Cnimport%20%7B%20assistantResponseProvider%20%7D%20from%20'.%2FresponseProvider'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20welcomeIcon%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'48px'%20%7D%20%7D)%5Cn%5Cnconst%20promptItems%3A%20PromptProps%5B%5D%20%3D%20PROMPT_ITEMS_DATA.map((item)%20%3D%3E%20(%7B%5Cn%20%20...item%2C%5Cn%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20item.emoji)%2C%5Cn%7D))%5Cn%5Cnconst%20dropdownMenuItems%20%3D%20ref(DROPDOWN_MENU_ITEMS)%5Cn%5Cnconst%20popoverData%20%3D%20ref%3CSuggestionGroup%5B%5D%3E(suggestionPopoverData)%5Cn%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20deleteConversation%2C%5Cn%20%20updateConversationTitle%2C%5Cn%20%20sendMessage%3A%20sendToActiveConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20assistantResponseProvider%20as%20UseMessageOptions%5B'responseProvider'%5D%2C%5Cn%20%20%20%20plugins%3A%20%5B%5Cn%20%20%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20%20%20getTools%3A%20async%20()%20%3D%3E%20MCP_TOOLS%2C%5Cn%20%20%20%20%20%20%20%20callTool%3A%20async%20(toolCall)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%5Cn%20%20%20%20%20%20%20%20%20%20return%20callMcpTool(toolCall.function%3F.name%20%7C%7C%20''%2C%20args)%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20historyData%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((item)%20%3D%3E%20(%7B%5Cn%20%20%20%20...item%2C%5Cn%20%20%20%20title%3A%20item.title%20%7C%7C%20''%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconst%20messageEngine%20%3D%20computed%3CUseMessageReturn%20%7C%20undefined%3E(()%20%3D%3E%20activeConversation.value%3F.engine)%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20messageEngine.value%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20messageEngine.value%3F.isProcessing.value%20%3F%3F%20false)%5Cn%5Cnconst%20sendMessage%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20if%20(!activeConversationId.value)%20%7B%5Cn%20%20%20%20createConversation(%7B%20title%3A%20content.slice(0%2C%2010)%20%7D)%5Cn%20%20%7D%5Cn%20%20sendToActiveConversation(content)%5Cn%7D%5Cn%5Cnconst%20handlePromptItemClick%20%3D%20(ev%3A%20unknown%2C%20item%3A%20%7B%20description%3F%3A%20string%20%7D)%20%3D%3E%20%7B%5Cn%20%20if%20(!item.description)%20return%5Cn%20%20sendMessage(item.description)%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20system%3A%20%7B%5Cn%20%20%20%20hidden%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20handleHistoryTitleChange%20%3D%20(newTitle%3A%20string%2C%20item%3A%20ConversationInfo)%20%3D%3E%20%7B%5Cn%20%20updateConversationTitle(item.id%2C%20newTitle)%5Cn%7D%5Cn%5Cnconst%20historyDrawerOpen%20%3D%20ref(false)%5Cn%5Cnconst%20overlayTitle%20%3D%20OVERLAY_TITLE%5Cnconst%20overlayDescription%20%3D%20OVERLAY_DESCRIPTION%5Cnconst%20isDragging%20%3D%20ref(false)%5Cnconst%20targetElement%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20handleDraggingChange%20%3D%20(dragging%3A%20boolean%2C%20element%3A%20HTMLElement%20%7C%20null)%20%3D%3E%20%7B%5Cn%20%20isDragging.value%20%3D%20dragging%5Cn%20%20targetElement.value%20%3D%20element%5Cn%7D%5Cn%5Cnconst%20handleFilesDropped%20%3D%20(files%3A%20File%5B%5D)%20%3D%3E%20%7B%5Cn%20%20console.log('%E4%B8%8A%E4%BC%A0%E7%9A%84%E6%96%87%E4%BB%B6%3A'%2C%20files)%5Cn%7D%5Cn%5Cnconst%20handleFilesRejected%20%3D%20(rejection%3A%20FileRejection)%20%3D%3E%20%7B%5Cn%20%20console.error('%E8%A2%AB%E6%8B%92%E7%BB%9D%E7%9A%84%E6%96%87%E4%BB%B6%3A'%2C%20rejection)%5Cn%7D%5Cn%5Cnconst%20resetSessionAndCloseDrawer%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20activeConversationId.value%20%3D%20null%5Cn%20%20historyDrawerOpen.value%20%3D%20false%5Cn%7D%5Cn%5Cnconst%20handleHistorySelect%20%3D%20(item%3A%20ConversationInfo)%20%3D%3E%20%7B%5Cn%20%20switchConversation(item.id)%5Cn%20%20historyDrawerOpen.value%20%3D%20false%5Cn%7D%5Cn%5Cnconst%20handleHistoryAction%20%3D%20(action%3A%20HistoryMenuItem%2C%20item%3A%20ConversationInfo)%20%3D%3E%20%7B%5Cn%20%20if%20(action.id%20%3D%3D%3D%20'delete')%20%7B%5Cn%20%20%20%20deleteConversation(item.id)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20senderRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrSender%3E%20%7C%20null%3E(null)%5Cnconst%20inputMessage%20%3D%20ref('')%5Cnconst%20currentTemplate%20%3D%20ref%3CUserItem%5B%5D%3E(%5B%5D)%5Cnconst%20suggestionOpen%20%3D%20ref(false)%5Cn%5Cn%2F%2F%20Load%20template%20chips%20into%20the%20sender.%5Cnconst%20handleFillTemplate%20%3D%20(template%3A%20UserItem%5B%5D)%20%3D%3E%20%7B%5Cn%20%20currentTemplate.value%20%3D%20template%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%5Cn%20%20nextTick(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.activateTemplateFirstField()%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%B8%85%E9%99%A4%E5%BD%93%E5%89%8D%E6%8C%87%E4%BB%A4%5Cnconst%20clearTemplate%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%2F%2F%20%E6%B8%85%E7%A9%BA%E6%8C%87%E4%BB%A4%E7%9B%B8%E5%85%B3%E7%8A%B6%E6%80%81%5Cn%20%20currentTemplate.value%20%3D%20%5B%5D%5Cn%5Cn%20%20%2F%2F%20%E7%A1%AE%E4%BF%9D%E9%87%8D%E6%96%B0%E8%81%9A%E7%84%A6%E5%88%B0%E8%BE%93%E5%85%A5%E6%A1%86%5Cn%20%20nextTick(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.focus()%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cn%2F%2F%20%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%5Cnconst%20handleSendMessage%20%3D%20(textContent%3A%20string)%20%3D%3E%20%7B%5Cn%20%20sendMessage(textContent)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%20%20clearTemplate()%5Cn%7D%5Cn%5Cnconst%20handlePopoverItemClick%20%3D%20(item%3A%20SuggestionItem)%20%3D%3E%20%7B%5Cn%20%20sendMessage(item.text)%5Cn%7D%5Cn%5Cnconst%20pillItems%20%3D%20computed(()%20%3D%3E%5Cn%20%20PILL_ITEMS_CONFIG.map((config)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20base%20%3D%20%7B%20text%3A%20config.text%2C%20icon%3A%20markRaw(IconEdit)%20%7D%5Cn%20%20%20%20if%20(config.type%20%3D%3D%3D%20'dropdown')%20%7B%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20...base%2C%5Cn%20%20%20%20%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20items%3A%20dropdownMenuItems.value%2C%5Cn%20%20%20%20%20%20%20%20%20%20onItemClick%3A%20(item%3A%20unknown)%20%3D%3E%20sendMessage((item%20as%20%7B%20text%3A%20string%20%7D).text)%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20const%20%5Bstart%2C%20end%5D%20%3D%20config.range%5Cn%20%20%20%20const%20items%20%3D%20end%20!%3D%3D%20undefined%20%3F%20templateSuggestions.slice(start%2C%20end)%20%3A%20templateSuggestions.slice(start)%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20...base%2C%5Cn%20%20%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20%20%20items%2C%5Cn%20%20%20%20%20%20%20%20onItemClick%3A%20(item%3A%20unknown)%20%3D%3E%20handleFillTemplate((item%20as%20%7B%20template%3A%20UserItem%5B%5D%20%7D).template)%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cnwatch(%5Cn%20%20()%20%3D%3E%20inputMessage.value%2C%5Cn%20%20(value)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(suggestionOpen.value%20%26%26%20value%20%3D%3D%3D%20'')%20%7B%5Cn%20%20%20%20%20%20suggestionOpen.value%20%3D%20false%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn)%5Cn%5Cn%2F%2F%20Focus%20sender%20shortly%20after%20mount.%5CnonMounted(()%20%3D%3E%20%7B%5Cn%20%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.focus()%5Cn%20%20%7D%2C%20500)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.assistant-demo%20%7B%5Cn%20%20%2F*%20Inline-size%20container%20for%20layout%20queries%20and%20cqw%20units.%20*%2F%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20max-width%3A%201280px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-height%3A%20min(560px%2C%20calc(100vh%20-%20200px))%3B%5Cn%20%20position%3A%20relative%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20overflow%3A%20visible%3B%5Cn%20%20box-shadow%3A%200%204px%2024px%20rgba(0%2C%200%2C%200%2C%200.06)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%7D%5Cn%5Cn.assistant-demo__layout-root%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20position%3A%20relative%3B%5Cn%7D%5Cn%5Cn.assistant-demo__shell%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%7D%5Cn%5Cn%2F*%20Narrow%20demo%20width%3A%20drawer%20%2B%20mobile%20bar%3B%20hide%20desktop%20history%20column.%20*%2F%5Cn%40container%20(max-width%3A%20767px)%20%7B%5Cn%20%20.assistant-demo__sidebar--desktop%20%7B%5Cn%20%20%20%20display%3A%20none%20!important%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.assistant-demo__mobile-bar%20%7B%5Cn%20%20%20%20display%3A%20flex%20!important%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F*%20Wide%20demo%20width%3A%20desktop%20history%20column%3B%20hide%20drawer%20and%20mobile%20bar.%20*%2F%5Cn%40container%20(min-width%3A%20768px)%20%7B%5Cn%20%20.assistant-demo__mobile-bar%20%7B%5Cn%20%20%20%20display%3A%20none%20!important%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.assistant-demo__drawer-root%20%7B%5Cn%20%20%20%20display%3A%20none%20!important%3B%5Cn%20%20%7D%5Cn%5Cn%20%20.assistant-demo__prompts%20%7B%5Cn%20%20%20%20--tr-prompt-width%3A%20calc(50%25%20-%208px)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.assistant-demo__mobile-bar%20%7B%5Cn%20%20display%3A%20none%3B%5Cn%20%20flex-shrink%3A%200%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--tr-color-border%2C%20rgba(0%2C%200%2C%200%2C%200.08))%3B%5Cn%7D%5Cn%5Cn.assistant-demo__mobile-bar-actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%7D%5Cn%5Cn%2F*%20Drawer%20transition%3A%20backdrop%20fade.%20*%2F%5Cn.assistant-demo-drawer-enter-active%2C%5Cn.assistant-demo-drawer-leave-active%20%7B%5Cn%20%20transition%3A%20none%3B%5Cn%7D%5Cn%5Cn.assistant-demo-drawer-enter-active%20.assistant-demo__drawer-backdrop%2C%5Cn.assistant-demo-drawer-leave-active%20.assistant-demo__drawer-backdrop%20%7B%5Cn%20%20transition%3A%20opacity%200.28s%20ease%3B%5Cn%7D%5Cn%5Cn.assistant-demo-drawer-enter-from%20.assistant-demo__drawer-backdrop%2C%5Cn.assistant-demo-drawer-leave-to%20.assistant-demo__drawer-backdrop%20%7B%5Cn%20%20opacity%3A%200%3B%5Cn%7D%5Cn%5Cn.assistant-demo__drawer-root%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20inset%3A%200%3B%5Cn%20%20z-index%3A%2010%3B%5Cn%20%20pointer-events%3A%20none%3B%5Cn%20%20border-radius%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.assistant-demo__drawer-root%20%3E%20*%20%7B%5Cn%20%20pointer-events%3A%20auto%3B%5Cn%7D%5Cn%5Cn.assistant-demo__drawer-backdrop%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20inset%3A%200%3B%5Cn%20%20background%3A%20rgba(0%2C%200%2C%200%2C%200.45)%3B%5Cn%20%20border-radius%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.assistant-demo__drawer-panel%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20left%3A%200%3B%5Cn%20%20top%3A%200%3B%5Cn%20%20bottom%3A%200%3B%5Cn%20%20width%3A%20min(300px%2C%2092cqw)%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20box-shadow%3A%204px%200%2024px%20rgba(0%2C%200%2C%200%2C%200.12)%3B%5Cn%20%20border-right%3A%201px%20solid%20var(--tr-color-border%2C%20rgba(0%2C%200%2C%200%2C%200.08))%3B%5Cn%7D%5Cn%5Cn.assistant-demo__drawer-actions%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%204px%3B%5Cn%7D%5Cn%5Cn.assistant-demo__history--drawer%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.assistant-demo__sidebar%20%7B%5Cn%20%20width%3A%20300px%3B%5Cn%20%20flex-shrink%3A%200%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20border-right%3A%201px%20solid%20var(--tr-color-border%2C%20rgba(0%2C%200%2C%200%2C%200.08))%3B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.assistant-demo__sidebar-head%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20padding%3A%204px%204px%208px%3B%5Cn%7D%5Cn%5Cn.assistant-demo__sidebar-title%20%7B%5Cn%20%20font-weight%3A%20600%3B%5Cn%20%20font-size%3A%2015px%3B%5Cn%7D%5Cn%5Cn.assistant-demo__history%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20overflow-y%3A%20auto%3B%5Cn%20%20--tr-history-item-selected-bg%3A%20var(--tr-history-item-hover-bg)%3B%5Cn%20%20--tr-history-item-selected-color%3A%20var(--tr-color-primary)%3B%5Cn%20%20--tr-history-item-space-y%3A%204px%3B%5Cn%7D%5Cn%5Cn.assistant-demo__main%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.assistant-demo__welcome%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20overflow-y%3A%20auto%3B%5Cn%7D%5Cn%5Cn.assistant-demo__bubble-list%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%5Cn.assistant-demo__prompts%20%7B%5Cn%20%20padding%3A%2016px%2024px%2024px%3B%5Cn%20%20--tr-prompt-width%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.assistant-demo__footer%20%7B%5Cn%20%20padding%3A%208px%2016px%2016px%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20border-top%3A%201px%20solid%20var(--tr-color-border%2C%20rgba(0%2C%200%2C%200%2C%200.06))%3B%5Cn%7D%5Cn%5Cn.assistant-demo__mcp-hint%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.4%3B%5Cn%20%20color%3A%20var(--tr-color-text-secondary%2C%20%23666)%3B%5Cn%7D%5Cn%5Cn.assistant-demo__pills%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.assistant-demo__pills-row%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.assistant-demo__pills-row%20%3Adeep(.tr-suggestion-pills__container)%20%7B%5Cn%20%20mask%3A%20linear-gradient(to%20right%2C%20rgba(0%2C%200%2C%200%2C%201)%2080%25%2C%20rgba(0%2C%200%2C%200%2C%200)%20100%25)%3B%5Cn%7D%5Cn%5Cn.assistant-demo__sender%20%3Adeep(.tr-sender)%20%7B%5Cn%20%20max-width%3A%20none%3B%5Cn%7D%5Cn%5Cn%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22responseProvider.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FresponseProvider.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20extractSearchQuery%2C%20hasMcpTriggerKeyword%20%7D%20from%20'.%2FmockMcp'%5Cn%5Cn%2F**%5Cn%20*%20Response%20provider%20for%20the%20assistant%20chat.%5Cn%20*%20When%20user%20message%20contains%20MCP%20trigger%20keywords%20(%E6%90%9C%E7%B4%A2%2Fsearch%2FMCP%2F%E5%B7%A5%E5%85%B7%2F%E6%9F%A5%E8%AF%A2)%2C%5Cn%20*%20uses%20mock%20MCP%20tool%20flow%3B%20otherwise%20fetches%20from%20real%20API.%5Cn%20*%2F%5Cnexport%20async%20function%20assistantResponseProvider(%5Cn%20%20requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20Promise%3CAsyncGenerator%3CChatCompletion%3E%3E%20%7B%5Cn%20%20const%20msgs%20%3D%20requestBody.messages%20%7C%7C%20%5B%5D%5Cn%20%20const%20last%20%3D%20msgs%5Bmsgs.length%20-%201%5D%5Cn%5Cn%20%20%2F%2F%20Use%20mock%20MCP%20flow%20when%3A%20(1)%20user%20message%20has%20keyword%2C%20or%20(2)%20last%20message%20is%20tool%5Cn%20%20const%20useMockMcp%20%3D%5Cn%20%20%20%20(last%3F.role%20%3D%3D%3D%20'user'%20%26%26%20hasMcpTriggerKeyword(String(last.content%20%7C%7C%20'')))%20%7C%7C%20last%3F.role%20%3D%3D%3D%20'tool'%5Cn%5Cn%20%20if%20(useMockMcp)%20%7B%5Cn%20%20%20%20return%20mockMcpStream(requestBody%2C%20abortSignal)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20response%20%3D%20await%20fetch('%2Fapi%2Fchat%2Fcompletions'%2C%20%7B%5Cn%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%7D)%5Cn%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%7D%5Cn%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20Mock%20stream%3A%20when%20user%20message%20contains%20MCP%20keyword%2C%20return%20tool_calls%3B%5Cn%20*%20when%20last%20message%20is%20tool%2C%20return%20AI%20summary.%5Cn%20*%2F%5Cnasync%20function*%20mockMcpStream(%5Cn%20%20requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20msgs%20%3D%20requestBody.messages%20%7C%7C%20%5B%5D%5Cn%20%20const%20last%20%3D%20msgs%5Bmsgs.length%20-%201%5D%5Cn%20%20const%20id%20%3D%20'mock-mcp-'%20%2B%20Date.now()%5Cn%5Cn%20%20if%20(last%3F.role%20%3D%3D%3D%20'tool')%20%7B%5Cn%20%20%20%20%2F%2F%20Second%20round%3A%20return%20AI%20summary%20based%20on%20tool%20result%5Cn%20%20%20%20const%20toolContent%20%3D%20typeof%20last.content%20%3D%3D%3D%20'string'%20%3F%20last.content%20%3A%20''%5Cn%20%20%20%20let%20query%20%3D%20'%E6%9C%AA%E7%9F%A5'%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20parsed%20%3D%20JSON.parse(toolContent)%5Cn%20%20%20%20%20%20if%20(parsed%3F.query)%20query%20%3D%20parsed.query%5Cn%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20ignore%5Cn%20%20%20%20%7D%5Cn%20%20%20%20const%20text%20%3D%20%60%E6%A0%B9%E6%8D%AE%20MCP%20%E6%90%9C%E7%B4%A2%E7%BB%93%E6%9E%9C%EF%BC%88%E6%9F%A5%E8%AF%A2%EF%BC%9A%E3%80%8C%24%7Bquery%7D%E3%80%8D%EF%BC%89%EF%BC%8C%E4%B8%BA%E6%82%A8%E6%80%BB%E7%BB%93%E5%A6%82%E4%B8%8B%EF%BC%9A%E6%89%BE%E5%88%B0%202%20%E6%9D%A1%E7%9B%B8%E5%85%B3%E7%BB%93%E6%9E%9C%EF%BC%8C%E5%9D%87%E4%B8%BA%E6%A8%A1%E6%8B%9F%E6%95%B0%E6%8D%AE%E3%80%82%E5%A6%82%E9%9C%80%E7%9C%9F%E5%AE%9E%E6%90%9C%E7%B4%A2%EF%BC%8C%E8%AF%B7%E6%8E%A5%E5%85%A5%E5%AE%9E%E9%99%85%E7%9A%84%20MCP%20%E6%9C%8D%E5%8A%A1%E3%80%82%60%5Cn%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20text.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%2040))%5Cn%20%20%20%20%20%20const%20content%20%3D%20text%5Bi%5D%5Cn%20%20%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20%20%20model%3A%20'mock-mcp'%2C%5Cn%20%20%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%20%7D%20%3A%20%7B%20content%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20text.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20%2F%2F%20First%20round%3A%20user%20message%20contains%20keyword%20-%3E%20return%20tool_calls%5Cn%20%20const%20userContent%20%3D%20typeof%20last%3F.content%20%3D%3D%3D%20'string'%20%3F%20last.content%20%3A%20''%5Cn%20%20const%20query%20%3D%20extractSearchQuery(userContent)%5Cn%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20yield%20%7B%5Cn%20%20%20%20id%2C%5Cn%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20model%3A%20'mock-mcp'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20tool_calls%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3A%20'call_mcp_search_'%20%2B%20Date.now()%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20'mcp_search'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20arguments%3A%20JSON.stringify(%7B%20query%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'tool_calls'%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22assistantConstants.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FassistantConstants.ts%22%2C%22code%22%3A%22import%20type%20%7B%20SuggestionGroup%2C%20UserItem%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconDislike%2C%20IconLike%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cn%2F%2F%20---%20Drag%20overlay%20---%5Cnexport%20const%20OVERLAY_TITLE%20%3D%20'%E5%B0%86%E5%9B%BE%E7%89%87%E6%8B%96%E5%88%B0%E6%AD%A4%E5%A4%84%E5%AE%8C%E6%88%90%E4%B8%8A%E4%BC%A0'%5Cnexport%20const%20OVERLAY_DESCRIPTION%20%3D%20%5B'%E6%80%BB%E8%AE%A1%E6%9C%80%E5%A4%9A%E4%B8%8A%E4%BC%A03%E4%B8%AA%E5%9B%BE%E7%89%87%EF%BC%88%E6%AF%8F%E4%B8%AA10MB%E4%BB%A5%E5%86%85%EF%BC%89'%2C%20'%E6%94%AF%E6%8C%81%E5%9B%BE%E7%89%87%E6%A0%BC%E5%BC%8F%20JPG%2FJPEG%2FPNG'%5D%5Cn%5Cn%2F%2F%20---%20Dropdown%20menu%20---%5Cnexport%20const%20DROPDOWN_MENU_ITEMS%20%3D%20%5B%5Cn%20%20%7B%20id%3A%20'1'%2C%20text%3A%20'%E5%8E%BB%E7%BB%AD%E8%B4%B9'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'2'%2C%20text%3A%20'%E5%8E%BB%E9%80%80%E8%AE%A2'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'3'%2C%20text%3A%20'%E6%9F%A5%E8%B4%A6%E5%8D%95'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'4'%2C%20text%3A%20'%E5%AF%BC%E8%B4%A6%E5%8D%95'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'5'%2C%20text%3A%20'%E5%AF%B9%E5%B8%90%E5%8D%95'%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Prompt%20items%20---%5Cnexport%20interface%20PromptItemData%20%7B%5Cn%20%20label%3A%20string%5Cn%20%20description%3A%20string%5Cn%20%20emoji%3A%20string%5Cn%20%20badge%3F%3A%20string%5Cn%7D%5Cn%5Cnexport%20const%20PROMPT_ITEMS_DATA%3A%20PromptItemData%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E6%97%A5%E5%B8%B8%E5%8A%A9%E7%90%86%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20emoji%3A%20'%F0%9F%A7%A0'%2C%5Cn%20%20%20%20badge%3A%20'NEW'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%5C%22Vue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%5C%22%EF%BC%81'%2C%5Cn%20%20%20%20emoji%3A%20'%F0%9F%A4%94'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%88%9B%E6%84%8F%E7%94%9F%E6%88%90%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20emoji%3A%20'%E2%9C%A8'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'MCP%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8'%2C%5Cn%20%20%20%20description%3A%20'%E6%90%9C%E7%B4%A2%EF%BC%9A%E5%8C%97%E4%BA%AC%E5%A4%A9%E6%B0%94%EF%BC%88%E8%BE%93%E5%85%A5%E3%80%8C%E6%90%9C%E7%B4%A2%E3%80%8D%E3%80%8CMCP%E3%80%8D%E3%80%8C%E5%B7%A5%E5%85%B7%E3%80%8D%E7%AD%89%E5%85%B3%E9%94%AE%E8%AF%8D%E5%8F%AF%E8%A7%A6%E5%8F%91%E6%A8%A1%E6%8B%9F%20MCP%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%89'%2C%5Cn%20%20%20%20emoji%3A%20'%F0%9F%94%A7'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Pill%20items%20config%20---%5Cnexport%20interface%20PillItemConfig%20%7B%5Cn%20%20text%3A%20string%5Cn%20%20type%3A%20'dropdown'%5Cn%7D%5Cn%5Cnexport%20interface%20TemplatePillItemConfig%20%7B%5Cn%20%20text%3A%20string%5Cn%20%20type%3A%20'template'%5Cn%20%20range%3A%20%5Bnumber%2C%20number%3F%5D%5Cn%7D%5Cn%5Cnexport%20type%20PillConfig%20%3D%20PillItemConfig%20%7C%20TemplatePillItemConfig%5Cn%5Cnexport%20const%20PILL_ITEMS_CONFIG%3A%20PillConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%20text%3A%20'%E8%B4%B9%E7%94%A8%E6%88%90%E6%9C%AC'%2C%20type%3A%20'dropdown'%20%7D%2C%5Cn%20%20%7B%20text%3A%20'%E5%B8%B8%E7%94%A8%E6%8C%87%E4%BB%A4'%2C%20type%3A%20'template'%2C%20range%3A%20%5B0%2C%203%5D%20%7D%2C%5Cn%20%20%7B%20text%3A%20'%E5%B7%A5%E4%BD%9C%E5%8A%A9%E6%89%8B'%2C%20type%3A%20'template'%2C%20range%3A%20%5B3%2C%206%5D%20%7D%2C%5Cn%20%20%7B%20text%3A%20'%E5%86%85%E5%AE%B9%E5%88%9B%E4%BD%9C'%2C%20type%3A%20'template'%2C%20range%3A%20%5B6%5D%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Template%20suggestions%20---%5Cnexport%20interface%20TemplateSuggestionItem%20%7B%5Cn%20%20id%3A%20string%5Cn%20%20text%3A%20string%5Cn%20%20template%3A%20UserItem%5B%5D%5Cn%7D%5Cn%5Cnexport%20const%20templateSuggestions%3A%20TemplateSuggestionItem%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'write'%2C%5Cn%20%20%20%20text%3A%20'%E5%B8%AE%E6%88%91%E5%86%99%E4%BD%9C'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%B8%AE%E6%88%91%E6%92%B0%E5%86%99'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%96%87%E7%AB%A0%E7%B1%BB%E5%9E%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%AD%97%E7%9A%84'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%2C%20%E8%AF%AD%E6%B0%94%E7%B1%BB%E5%9E%8B%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%AD%A3%E5%BC%8F%2F%E8%BD%BB%E6%9D%BE%2F%E4%B8%93%E4%B8%9A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%2C%20%E5%85%B7%E4%BD%93%E5%86%85%E5%AE%B9%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E8%AF%A6%E7%BB%86%E6%8F%8F%E8%BF%B0'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'translate'%2C%5Cn%20%20%20%20text%3A%20'%E7%BF%BB%E8%AF%91'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B0%86%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%B8%AD%E6%96%87%2F%E8%8B%B1%E6%96%87%2F%E6%B3%95%E8%AF%AD%2F%E5%BE%B7%E8%AF%AD%2F%E6%97%A5%E8%AF%AD'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%86%85%E5%AE%B9%E7%BF%BB%E8%AF%91%E6%88%90'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%9B%AE%E6%A0%87%E8%AF%AD%E8%A8%80'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%9C%80%E8%A6%81%E7%BF%BB%E8%AF%91%E7%9A%84%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'summarize'%2C%5Cn%20%20%20%20text%3A%20'%E5%86%85%E5%AE%B9%E6%80%BB%E7%BB%93'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%AF%B9%E4%BB%A5%E4%B8%8B%E5%86%85%E5%AE%B9%E8%BF%9B%E8%A1%8C'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%AE%80%E8%A6%81%2F%E8%AF%A6%E7%BB%86'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%80%BB%E7%BB%93%EF%BC%8C%E7%BA%A6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%AD%97%E6%95%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%AD%97%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%9C%80%E8%A6%81%E6%80%BB%E7%BB%93%E7%9A%84%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'code-review'%2C%5Cn%20%20%20%20text%3A%20'%E4%BB%A3%E7%A0%81%E5%AE%A1%E6%9F%A5'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E5%AE%A1%E6%9F%A5%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'JavaScript%2FTypeScript%2FPython%2FJava%2FC%2B%2B%2FGo'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E4%BB%A3%E7%A0%81%EF%BC%8C%E5%85%B3%E6%B3%A8'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%80%A7%E8%83%BD%2F%E5%AE%89%E5%85%A8%2F%E5%8F%AF%E8%AF%BB%E6%80%A7%2F%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%96%B9%E9%9D%A2%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BB%A3%E7%A0%81%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'email-compose'%2C%5Cn%20%20%20%20text%3A%20'%E5%86%99%E9%82%AE%E4%BB%B6'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%AD%A3%E5%BC%8F%2F%E9%9D%9E%E6%AD%A3%E5%BC%8F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%EF%BC%8C%E5%8F%91%E9%80%81%E7%BB%99'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%94%B6%E4%BB%B6%E4%BA%BA%E8%A7%92%E8%89%B2'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E5%86%85%E5%AE%B9%E6%98%AF%E5%85%B3%E4%BA%8E'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'data-analysis'%2C%5Cn%20%20%20%20text%3A%20'%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%88%86%E6%9E%90%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%94%80%E5%94%AE%2F%E7%94%A8%E6%88%B7%2F%E6%B5%81%E9%87%8F%2F%E9%87%91%E8%9E%8D%2F%E5%81%A5%E5%BA%B7'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%95%B0%E6%8D%AE%EF%BC%8C%E5%85%B3%E6%B3%A8'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%A2%9E%E9%95%BF%E7%8E%87%2F%E5%88%86%E5%B8%83%2F%E8%B6%8B%E5%8A%BF%2F%E5%BC%82%E5%B8%B8%2F%E5%85%B3%E8%81%94%E6%80%A7'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%8C%87%E6%A0%87%EF%BC%8C%E7%94%9F%E6%88%90'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%9F%B1%E7%8A%B6%E5%9B%BE%2F%E6%8A%98%E7%BA%BF%E5%9B%BE%2F%E9%A5%BC%E5%9B%BE%2F%E6%95%A3%E7%82%B9%E5%9B%BE%2F%E7%83%AD%E5%8A%9B%E5%9B%BE'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%8F%AF%E8%A7%86%E5%8C%96%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%95%B0%E6%8D%AE%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'product-design'%2C%5Cn%20%20%20%20text%3A%20'%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E8%AE%BE%E8%AE%A1%E4%B8%80%E4%B8%AA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%A7%BB%E5%8A%A8%E5%BA%94%E7%94%A8%2F%E7%BD%91%E7%AB%99%2F%E5%B0%8F%E7%A8%8B%E5%BA%8F%2F%E6%A1%8C%E9%9D%A2%E8%BD%AF%E4%BB%B6%2F%E6%99%BA%E8%83%BD%E7%A1%AC%E4%BB%B6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E7%9A%84'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%E5%90%8D%E7%A7%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%EF%BC%8C%E7%9B%AE%E6%A0%87%E7%94%A8%E6%88%B7%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%94%A8%E6%88%B7%E7%BE%A4%E4%BD%93'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E6%A0%B8%E5%BF%83%E4%BB%B7%E5%80%BC%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%E4%BB%B7%E5%80%BC'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'meeting-summary'%2C%5Cn%20%20%20%20text%3A%20'%E4%BC%9A%E8%AE%AE%E7%BA%AA%E8%A6%81'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E4%B8%80%E4%BB%BD%E4%BC%9A%E8%AE%AE%E7%BA%AA%E8%A6%81%EF%BC%8C%E4%BC%9A%E8%AE%AE%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BC%9A%E8%AE%AE%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E5%8F%82%E4%BC%9A%E4%BA%BA%E5%91%98%E6%9C%89'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8F%82%E4%BC%9A%E4%BA%BA%E5%91%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E4%BC%9A%E8%AE%AE%E8%A6%81%E7%82%B9%E5%8C%85%E6%8B%AC'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BC%9A%E8%AE%AE%E8%A6%81%E7%82%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'interview-questions'%2C%5Cn%20%20%20%20text%3A%20'%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E4%B8%BA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%B2%97%E4%BD%8D%E5%90%8D%E7%A7%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%B2%97%E4%BD%8D%EF%BC%8C%E9%92%88%E5%AF%B9'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%8A%80%E8%83%BD%E9%A2%86%E5%9F%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%96%B9%E5%90%91%EF%BC%8C%E8%AE%BE%E8%AE%A1'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'3%2F5%2F10'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E4%B8%AA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%AE%80%E5%8D%95%2F%E4%B8%AD%E7%AD%89%2F%E5%9B%B0%E9%9A%BE'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'speech-draft'%2C%5Cn%20%20%20%20text%3A%20'%E6%BC%94%E8%AE%B2%E7%A8%BF'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%92%B0%E5%86%99%E4%B8%80%E7%AF%87'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%BC%80%E5%9C%BA%2F%E4%B8%BB%E9%A2%98%2F%E8%87%B4%E8%B0%A2%2F%E9%A2%81%E5%A5%96%2F%E6%AF%95%E4%B8%9A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%BC%94%E8%AE%B2%E7%A8%BF%EF%BC%8C%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%BC%94%E8%AE%B2%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E6%97%B6%E9%95%BF%E7%BA%A6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'5%2F10%2F15%2F30'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%88%86%E9%92%9F%EF%BC%8C%E5%8F%97%E4%BC%97%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%9B%AE%E6%A0%87%E5%90%AC%E4%BC%97'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Suggestion%20popover%20---%5Cnexport%20const%20suggestionPopoverData%3A%20SuggestionGroup%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'basic'%2C%5Cn%20%20%20%20label%3A%20'%E6%8E%A8%E8%8D%90'%2C%5Cn%20%20%20%20icon%3A%20IconLike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b1'%2C%20text%3A%20'%E4%BB%80%E4%B9%88%E6%98%AF%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b2'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%99%BB%E5%BD%95%E5%88%B0Windows%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b3'%2C%20text%3A%20'%E5%BC%B9%E6%80%A7%E5%85%AC%E7%BD%91IP%E4%B8%BA%E4%BB%80%E4%B9%88ping%E4%B8%8D%E9%80%9A%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b4'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AE%89%E5%85%A8%E7%BB%84%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AE%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b5'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b6'%2C%20text%3A%20'%E4%BB%80%E4%B9%88%E6%98%AF%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b7'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%99%BB%E5%BD%95%E5%88%B0Windows%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b8'%2C%20text%3A%20'%E5%BC%B9%E6%80%A7%E5%85%AC%E7%BD%91IP%E4%B8%BA%E4%BB%80%E4%B9%88ping%E4%B8%8D%E9%80%9A%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b9'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AE%89%E5%85%A8%E7%BB%84%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AE%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b0'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'purchase'%2C%5Cn%20%20%20%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20IconDislike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p1'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E8%B4%AD%E4%B9%B0%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p2'%2C%20text%3A%20'%E6%97%A0%E6%B3%95%E7%99%BB%E5%BD%95%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%80%8E%E4%B9%88%E5%8A%9E%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p3'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BB%B7%E6%A0%BC%E6%80%8E%E4%B9%88%E8%AE%A1%E7%AE%97%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p4'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E8%B4%A6%E5%8D%95%E8%AF%A6%E6%83%85%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p5'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%BB%AD%E8%B4%B9%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'usage'%2C%5Cn%20%20%20%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20IconLike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u1'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BD%BF%E7%94%A8%E9%99%90%E5%88%B6%E4%B8%8E%E9%A1%BB%E7%9F%A5'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u2'%2C%20text%3A%20'%E4%BD%BF%E7%94%A8RDP%E6%96%87%E4%BB%B6%E8%BF%9E%E6%8E%A5Windows%E5%AE%9E%E4%BE%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u3'%2C%20text%3A%20'%E5%A4%9A%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95%EF%BC%88Windows2016%EF%BC%89'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u4'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E9%87%8D%E7%BD%AE%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u5'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%A6%82%E4%BD%95%E5%AE%89%E8%A3%85%E8%BD%AF%E4%BB%B6%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%20group%3A%20'4'%2C%20label%3A%20'%E6%8E%A8%E8%8D%90'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'5'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'6'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'7'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'8'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'9'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'10'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Container%20styles%20---%5Cnexport%20function%20getContainerStyles()%3A%20Record%3Cstring%2C%20string%3E%20%7B%5Cn%20%20return%20window.self%20!%3D%3D%20window.top%20%3F%20%7B%20height%3A%20'100vh'%20%7D%20%3A%20%7B%20top%3A%20'112px'%2C%20height%3A%20'calc(100vh%20-%20112px)'%20%7D%5Cn%7D%5Cn%22%7D%2C%22mockMcp.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FmockMcp.ts%22%2C%22code%22%3A%22import%20type%20%7B%20Tool%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F**%5Cn%20*%20Keywords%20that%20trigger%20mock%20MCP%20tool%20calls%20when%20present%20in%20user%20message.%5Cn%20*%2F%5Cnexport%20const%20MCP_TRIGGER_KEYWORDS%20%3D%20%5B'%E6%90%9C%E7%B4%A2'%2C%20'search'%2C%20'MCP'%2C%20'mcp'%2C%20'%E5%B7%A5%E5%85%B7'%2C%20'%E6%9F%A5%E8%AF%A2'%5D%5Cn%5Cn%2F**%5Cn%20*%20Check%20if%20user%20message%20contains%20any%20MCP%20trigger%20keyword.%5Cn%20*%2F%5Cnexport%20function%20hasMcpTriggerKeyword(content%3A%20string)%3A%20boolean%20%7B%5Cn%20%20const%20text%20%3D%20(content%20%7C%7C%20'').trim().toLowerCase()%5Cn%20%20return%20MCP_TRIGGER_KEYWORDS.some((kw)%20%3D%3E%20text.includes(kw.toLowerCase()))%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20Extract%20search%20query%20from%20user%20message%20(simple%20heuristic).%5Cn%20*%2F%5Cnexport%20function%20extractSearchQuery(content%3A%20string)%3A%20string%20%7B%5Cn%20%20const%20text%20%3D%20content.trim()%5Cn%20%20%2F%2F%20Try%20to%20extract%20content%20after%20keywords%20like%20%5C%22%E6%90%9C%E7%B4%A2%5C%22%2C%20%5C%22%E6%9F%A5%E8%AF%A2%5C%22%5Cn%20%20const%20patterns%20%3D%20%5B%2F(%3F%3A%E6%90%9C%E7%B4%A2%7C%E6%9F%A5%E8%AF%A2)%5C%5Cs*%5B%EF%BC%9A%3A%5D%5C%5Cs*(.%2B)%2F%2C%20%2F(%3F%3A%E6%90%9C%E7%B4%A2%7C%E6%9F%A5%E8%AF%A2)%5C%5Cs%2B(.%2B)%2F%2C%20%2Fsearch%5C%5Cs%2B(.%2B)%2Fi%2C%20%2F(.%2B)%2F%5D%5Cn%20%20for%20(const%20p%20of%20patterns)%20%7B%5Cn%20%20%20%20const%20m%20%3D%20text.match(p)%5Cn%20%20%20%20if%20(m%3F.%5B1%5D%3F.trim())%20return%20m%5B1%5D.trim()%5Cn%20%20%7D%5Cn%20%20return%20text.slice(0%2C%2030)%20%7C%7C%20'%E9%BB%98%E8%AE%A4%E6%9F%A5%E8%AF%A2'%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20MCP%20tool%20definitions%20(OpenAI%20format).%5Cn%20*%2F%5Cnexport%20const%20MCP_TOOLS%3A%20Tool%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20'mcp_search'%2C%5Cn%20%20%20%20%20%20description%3A%20'MCP%20search%20tool.%20Search%20for%20information%20by%20query.'%2C%5Cn%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20query%3A%20%7B%20type%3A%20'string'%2C%20description%3A%20'Search%20query'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'query'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F**%5Cn%20*%20Execute%20mock%20MCP%20tool.%20Simulates%20MCP%20server%20tool%20call.%5Cn%20*%2F%5Cnexport%20async%20function%20callMcpTool(toolName%3A%20string%2C%20args%3A%20Record%3Cstring%2C%20unknown%3E)%3A%20Promise%3Cstring%3E%20%7B%5Cn%20%20if%20(toolName%20%3D%3D%3D%20'mcp_search')%20%7B%5Cn%20%20%20%20const%20query%20%3D%20(args.query%20as%20string)%20%7C%7C%20'unknown'%5Cn%20%20%20%20%2F%2F%20Simulate%20MCP%20search%20result%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20%20%20return%20JSON.stringify(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20source%3A%20'mock-mcp-server'%2C%5Cn%20%20%20%20%20%20%20%20tool%3A%20'mcp_search'%2C%5Cn%20%20%20%20%20%20%20%20query%2C%5Cn%20%20%20%20%20%20%20%20results%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20title%3A%20%60%E5%85%B3%E4%BA%8E%E3%80%8C%24%7Bquery%7D%E3%80%8D%E7%9A%84%E6%A8%A1%E6%8B%9F%E7%BB%93%E6%9E%9C%201%60%2C%20snippet%3A%20'%E8%BF%99%E6%98%AF%20MCP%20%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2%E8%BF%94%E5%9B%9E%E7%9A%84%E7%AC%AC%E4%B8%80%E6%9D%A1%E7%BB%93%E6%9E%9C%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20title%3A%20%60%E5%85%B3%E4%BA%8E%E3%80%8C%24%7Bquery%7D%E3%80%8D%E7%9A%84%E6%A8%A1%E6%8B%9F%E7%BB%93%E6%9E%9C%202%60%2C%20snippet%3A%20'%E8%BF%99%E6%98%AF%20MCP%20%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2%E8%BF%94%E5%9B%9E%E7%9A%84%E7%AC%AC%E4%BA%8C%E6%9D%A1%E7%BB%93%E6%9E%9C%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20null%2C%5Cn%20%20%20%20%20%202%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%20%20return%20JSON.stringify(%7B%20error%3A%20%60Unknown%20MCP%20tool%3A%20%24%7BtoolName%7D%60%20%7D)%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{C.value=!1}),vueCode:t(x)},D({_:2},[E.value?{name:"vue",fn:s(()=>[e(t(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[3]||(n[3]=i("h2",{id:"使用悬浮容器",tabindex:"-1"},[r("使用悬浮容器 "),i("a",{class:"header-anchor",href:"#使用悬浮容器","aria-label":'Permalink to "使用悬浮容器"'},"​")],-1)),n[4]||(n[4]=i("p",null,[r("使用 "),i("code",null,"TrContainer"),r(" 的悬浮窗形态，可控制显示与全屏，适合在站点内以浮层嵌入聊天。")],-1)),c(e(t(d),null,null,512),[[p,C.value]]),e(A,null,{default:s(()=>[e(t(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22AssistantContainerExample.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FAssistantContainerExample.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-container%5Cn%20%20%20%20v-dropzone%3D%5C%22%7B%5Cn%20%20%20%20%20%20accept%3A%20'image%2Fjpeg%2C%20image%2Fpng'%2C%5Cn%20%20%20%20%20%20multiple%3A%20true%2C%5Cn%20%20%20%20%20%20onDrop%3A%20handleFilesDropped%2C%5Cn%20%20%20%20%20%20onError%3A%20handleFilesRejected%2C%5Cn%20%20%20%20%20%20onDraggingChange%3A%20handleDraggingChange%2C%5Cn%20%20%20%20%7D%5C%22%5Cn%20%20%20%20v-model%3Afullscreen%3D%5C%22fullscreen%5C%22%5Cn%20%20%20%20v-model%3Ashow%3D%5C%22show%5C%22%5Cn%20%20%20%20class%3D%5C%22tiny-container%5C%22%5Cn%20%20%20%20%3Astyle%3D%5C%22containerStyles%5C%22%5Cn%20%20%3E%5Cn%20%20%20%20%3Ctemplate%20%23operations%3E%5Cn%20%20%20%20%20%20%3Ctr-icon-button%20%3Aicon%3D%5C%22IconNewSession%5C%22%20size%3D%5C%2228%5C%22%20svgSize%3D%5C%2220%5C%22%20%40click%3D%5C%22activeConversationId%20%3D%20null%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3Cspan%20style%3D%5C%22display%3A%20inline-flex%3B%20line-height%3A%200%3B%20position%3A%20relative%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-icon-button%20%3Aicon%3D%5C%22IconHistory%5C%22%20size%3D%5C%2228%5C%22%20svgSize%3D%5C%2220%5C%22%20%40click%3D%5C%22showHistory%20%3D%20true%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20v-show%3D%5C%22showHistory%5C%22%20class%3D%5C%22tr-history-demo-container%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%3E%3Ch3%20style%3D%5C%22margin%3A%200%3B%20padding%3A%200%2012px%5C%22%3E%E5%8E%86%E5%8F%B2%E5%AF%B9%E8%AF%9D%3C%2Fh3%3E%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-icon-button%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aicon%3D%5C%22IconClose%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20size%3D%5C%2228%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20svgSize%3D%5C%2220%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22showHistory%20%3D%20false%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22position%3A%20absolute%3B%20right%3A%2014px%3B%20top%3A%2014px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-history%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22tr-history-demo%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aselected%3D%5C%22activeConversationId%20%3F%3F%20undefined%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Asearch-bar%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22historyData%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-title-change%3D%5C%22handleHistoryTitleChange%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handleHistorySelect%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-action%3D%5C%22handleHistoryAction%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%3C%2Ftr-history%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3Cdiv%20%3Aclass%3D%5C%22%7B%20'max-container'%3A%20fullscreen%20%7D%5C%22%20v-if%3D%5C%22messages.length%20%3D%3D%3D%200%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-welcome%20title%3D%5C%22TinyRobot%5C%22%20description%3D%5C%22%E6%82%A8%E5%A5%BD%EF%BC%8C%E6%88%91%E6%98%AFTinyRobot%EF%BC%8C%E6%82%A8%E4%B8%93%E5%B1%9E%E7%9A%84%20AI%20%E6%99%BA%E8%83%BD%E4%B8%93%E5%AE%B6%5C%22%20%3Aicon%3D%5C%22welcomeIcon%5C%22%3E%5Cn%20%20%20%20%20%20%3C%2Ftr-welcome%3E%5Cn%20%20%20%20%20%20%3Ctr-prompts%5Cn%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22promptItems%5C%22%5Cn%20%20%20%20%20%20%20%20%3Awrap%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20item-class%3D%5C%22prompt-item%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22tiny-prompts%5C%22%5Cn%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handlePromptItemClick%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-prompts%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%5Cn%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'max-container'%3A%20fullscreen%20%7D%5C%22%5Cn%20%20%20%20%20%20v-else%5Cn%20%20%20%20%20%20%3Amessages%3D%5C%22messages%5C%22%5Cn%20%20%20%20%20%20%3Arole-configs%3D%5C%22roles%5C%22%5Cn%20%20%20%20%20%20auto-scroll%5Cn%20%20%20%20%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3Ctemplate%20%23footer%3E%5Cn%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-input%5C%22%20%3Aclass%3D%5C%22%7B%20'max-container'%3A%20fullscreen%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-input-pills%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-popover%5Cn%20%20%20%20%20%20%20%20%20%20%20%20style%3D%5C%22--tr-suggestion-popover-width%3A%20440px%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Adata%3D%5C%22popoverData%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22handlePopoverItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23trigger%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23icon%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CIconSparkles%20style%3D%5C%22font-size%3A%2016px%3B%20color%3A%20%231476ff%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-popover%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pills%20class%3D%5C%22pills%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-dropdown-menu%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20v-for%3D%5C%22(item%2C%20index)%20in%20pillItems%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aitems%3D%5C%22item.menu.items%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40item-click%3D%5C%22item.menu.onItemClick%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Akey%3D%5C%22index%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20trigger%3D%5C%22click%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctemplate%20%23trigger%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ctr-suggestion-pill-button%3E%7B%7B%20item.text%20%7D%7D%3C%2Ftr-suggestion-pill-button%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-dropdown-menu%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Ftr-suggestion-pills%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20%20%20%20%20ref%3D%5C%22senderRef%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20mode%3D%5C%22single%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'tr-sender-compact'%3A%20!fullscreen%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AshowWordLimit%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3AmaxLength%3D%5C%221000%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20v-model%3Atemplate-data%3D%5C%22currentTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSendMessage%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40reset-template%3D%5C%22clearTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2Ftr-container%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%208px%5C%22%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Clabel%3Eshow%EF%BC%9A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22show%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%3E%5Cn%20%20%20%20%20%20%3Clabel%3Efullscreen%EF%BC%9A%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22fullscreen%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%3Ctr-drag-overlay%5Cn%20%20%20%20%3Aoverlay-title%3D%5C%22overlayTitle%5C%22%5Cn%20%20%20%20%3Aoverlay-description%3D%5C%22overlayDescription%5C%22%5Cn%20%20%20%20%3Ais-dragging%3D%5C%22isDragging%5C%22%5Cn%20%20%20%20%3Afullscreen%3D%5C%22fullscreen%5C%22%5Cn%20%20%20%20%3Adrag-target%3D%5C%22targetElement%5C%22%5Cn%20%20%2F%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20type%20%7B%5Cn%20%20BubbleRoleConfig%2C%5Cn%20%20FileRejection%2C%5Cn%20%20HistoryMenuItem%2C%5Cn%20%20PromptProps%2C%5Cn%20%20SuggestionGroup%2C%5Cn%20%20SuggestionItem%2C%5Cn%20%20UserItem%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrContainer%2C%5Cn%20%20TrDragOverlay%2C%5Cn%20%20TrDropdownMenu%2C%5Cn%20%20TrHistory%2C%5Cn%20%20TrIconButton%2C%5Cn%20%20TrPrompts%2C%5Cn%20%20TrSender%2C%5Cn%20%20TrSuggestionPillButton%2C%5Cn%20%20TrSuggestionPills%2C%5Cn%20%20TrSuggestionPopover%2C%5Cn%20%20TrWelcome%2C%5Cn%20%20vDropzone%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20ConversationInfo%2C%20toolPlugin%2C%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20IconAi%2C%5Cn%20%20IconClose%2C%5Cn%20%20IconEdit%2C%5Cn%20%20IconHistory%2C%5Cn%20%20IconNewSession%2C%5Cn%20%20IconSparkles%2C%5Cn%20%20IconUser%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20type%20CSSProperties%2C%20h%2C%20markRaw%2C%20nextTick%2C%20onMounted%2C%20ref%2C%20watch%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20DROPDOWN_MENU_ITEMS%2C%5Cn%20%20getContainerStyles%2C%5Cn%20%20OVERLAY_DESCRIPTION%2C%5Cn%20%20OVERLAY_TITLE%2C%5Cn%20%20PILL_ITEMS_CONFIG%2C%5Cn%20%20PROMPT_ITEMS_DATA%2C%5Cn%20%20suggestionPopoverData%2C%5Cn%20%20templateSuggestions%2C%5Cn%7D%20from%20'.%2FassistantConstants'%5Cnimport%20%7B%20callMcpTool%2C%20MCP_TOOLS%20%7D%20from%20'.%2FmockMcp'%5Cnimport%20%7B%20assistantResponseProvider%20%7D%20from%20'.%2FresponseProvider'%5Cn%5Cnconst%20fullscreen%20%3D%20ref(false)%5Cnconst%20show%20%3D%20ref(false)%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20welcomeIcon%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'48px'%20%7D%20%7D)%5Cn%5Cnconst%20promptItems%3A%20PromptProps%5B%5D%20%3D%20PROMPT_ITEMS_DATA.map((item)%20%3D%3E%20(%7B%5Cn%20%20...item%2C%5Cn%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20item.emoji)%2C%5Cn%7D))%5Cn%5Cnconst%20dropdownMenuItems%20%3D%20ref(DROPDOWN_MENU_ITEMS)%5Cn%5Cnconst%20popoverData%20%3D%20ref%3CSuggestionGroup%5B%5D%3E(suggestionPopoverData)%5Cn%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20deleteConversation%2C%5Cn%20%20updateConversationTitle%2C%5Cn%20%20abortActiveRequest%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20assistantResponseProvider%2C%5Cn%20%20%20%20plugins%3A%20%5B%5Cn%20%20%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20%20%20getTools%3A%20async%20()%20%3D%3E%20MCP_TOOLS%2C%5Cn%20%20%20%20%20%20%20%20callTool%3A%20async%20(toolCall)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%5Cn%20%20%20%20%20%20%20%20%20%20return%20callMcpTool(toolCall.function%3F.name%20%7C%7C%20''%2C%20args)%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20historyData%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((item)%20%3D%3E%20(%7B%5Cn%20%20%20%20...item%2C%5Cn%20%20%20%20title%3A%20item.title%20%7C%7C%20''%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconst%20messageEngine%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine)%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20messageEngine.value%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20messageEngine.value%3F.isProcessing.value)%5Cn%5Cnconst%20sendMessage%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20if%20(!activeConversationId.value)%20%7B%5Cn%20%20%20%20createConversation(%7B%20title%3A%20content.slice(0%2C%2010)%20%7D)%5Cn%20%20%7D%5Cn%20%20messageEngine.value%3F.sendMessage(content)%5Cn%7D%5Cn%5Cnconst%20handlePromptItemClick%20%3D%20(ev%3A%20unknown%2C%20item%3A%20%7B%20description%3F%3A%20string%20%7D)%20%3D%3E%20%7B%5Cn%20%20if%20(!item.description)%20return%5Cn%20%20sendMessage(item.description)%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20showHistory%20%3D%20ref(false)%5Cn%5Cnconst%20handleHistoryTitleChange%20%3D%20(newTitle%3A%20string%2C%20item%3A%20ConversationInfo)%20%3D%3E%20%7B%5Cn%20%20updateConversationTitle(item.id%2C%20newTitle)%5Cn%7D%5Cn%5Cnconst%20handleHistorySelect%20%3D%20(item%3A%20ConversationInfo)%20%3D%3E%20%7B%5Cn%20%20switchConversation(item.id)%5Cn%20%20showHistory.value%20%3D%20false%5Cn%7D%5Cn%5Cnconst%20handleHistoryAction%20%3D%20(action%3A%20HistoryMenuItem%2C%20item%3A%20ConversationInfo)%20%3D%3E%20%7B%5Cn%20%20if%20(action.id%20%3D%3D%3D%20'delete')%20%7B%5Cn%20%20%20%20deleteConversation(item.id)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20senderRef%20%3D%20ref%3CInstanceType%3Ctypeof%20TrSender%3E%20%7C%20null%3E(null)%5Cnconst%20inputMessage%20%3D%20ref('')%5Cnconst%20currentTemplate%20%3D%20ref%3CUserItem%5B%5D%3E(%5B%5D)%5Cnconst%20suggestionOpen%20%3D%20ref(false)%5Cn%5Cn%2F%2F%20%E8%AE%BE%E7%BD%AE%E6%8C%87%E4%BB%A4%5Cnconst%20handleFillTemplate%20%3D%20(template%3A%20UserItem%5B%5D)%20%3D%3E%20%7B%5Cn%20%20currentTemplate.value%20%3D%20template%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%5Cn%20%20nextTick(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.activateTemplateFirstField()%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cn%2F%2F%20%E6%B8%85%E9%99%A4%E5%BD%93%E5%89%8D%E6%8C%87%E4%BB%A4%5Cnconst%20clearTemplate%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%2F%2F%20%E6%B8%85%E7%A9%BA%E6%8C%87%E4%BB%A4%E7%9B%B8%E5%85%B3%E7%8A%B6%E6%80%81%5Cn%20%20currentTemplate.value%20%3D%20%5B%5D%5Cn%5Cn%20%20%2F%2F%20%E7%A1%AE%E4%BF%9D%E9%87%8D%E6%96%B0%E8%81%9A%E7%84%A6%E5%88%B0%E8%BE%93%E5%85%A5%E6%A1%86%5Cn%20%20nextTick(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.focus()%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cn%2F%2F%20%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%5Cnconst%20handleSendMessage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20sendMessage(inputMessage.value)%5Cn%5Cn%20%20clearTemplate()%5Cn%7D%5Cn%5Cnconst%20handlePopoverItemClick%20%3D%20(item%3A%20SuggestionItem)%20%3D%3E%20%7B%5Cn%20%20sendMessage(item.text)%5Cn%7D%5Cn%5Cnconst%20pillItems%20%3D%20computed(()%20%3D%3E%5Cn%20%20PILL_ITEMS_CONFIG.map((config)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20base%20%3D%20%7B%20text%3A%20config.text%2C%20icon%3A%20markRaw(IconEdit)%20%7D%5Cn%20%20%20%20if%20(config.type%20%3D%3D%3D%20'dropdown')%20%7B%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20...base%2C%5Cn%20%20%20%20%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20items%3A%20dropdownMenuItems.value%2C%5Cn%20%20%20%20%20%20%20%20%20%20onItemClick%3A%20(item%3A%20unknown)%20%3D%3E%20sendMessage((item%20as%20%7B%20text%3A%20string%20%7D).text)%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20const%20%5Bstart%2C%20end%5D%20%3D%20config.range%5Cn%20%20%20%20const%20items%20%3D%20end%20!%3D%3D%20undefined%20%3F%20templateSuggestions.slice(start%2C%20end)%20%3A%20templateSuggestions.slice(start)%5Cn%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20...base%2C%5Cn%20%20%20%20%20%20menu%3A%20%7B%5Cn%20%20%20%20%20%20%20%20items%2C%5Cn%20%20%20%20%20%20%20%20onItemClick%3A%20(item%3A%20unknown)%20%3D%3E%20handleFillTemplate((item%20as%20%7B%20template%3A%20UserItem%5B%5D%20%7D).template)%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cnwatch(%5Cn%20%20()%20%3D%3E%20inputMessage.value%2C%5Cn%20%20(value)%20%3D%3E%20%7B%5Cn%20%20%20%20%2F%2F%20%E5%A6%82%E6%9E%9C%E6%8C%87%E4%BB%A4%E9%9D%A2%E6%9D%BF%E5%B7%B2%E6%89%93%E5%BC%80%EF%BC%8C%E5%B9%B6%E4%B8%94%E6%8C%87%E4%BB%A4%E4%B8%BA%E7%A9%BA%EF%BC%8C%E5%85%B3%E9%97%AD%E6%8C%87%E4%BB%A4%E9%9D%A2%E6%9D%BF%5Cn%20%20%20%20if%20(suggestionOpen.value%20%26%26%20value%20%3D%3D%3D%20'')%20%7B%5Cn%20%20%20%20%20%20suggestionOpen.value%20%3D%20false%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn)%5Cn%5Cnconst%20overlayTitle%20%3D%20OVERLAY_TITLE%5Cnconst%20overlayDescription%20%3D%20OVERLAY_DESCRIPTION%5Cn%5Cnconst%20isDragging%20%3D%20ref(false)%5Cnconst%20targetElement%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20handleDraggingChange%20%3D%20(dragging%3A%20boolean%2C%20element%3A%20HTMLElement%20%7C%20null)%20%3D%3E%20%7B%5Cn%20%20isDragging.value%20%3D%20dragging%5Cn%20%20targetElement.value%20%3D%20element%5Cn%7D%5Cn%5Cnconst%20handleFilesDropped%20%3D%20(files%3A%20File%5B%5D)%20%3D%3E%20%7B%5Cn%20%20console.log('%E4%B8%8A%E4%BC%A0%E7%9A%84%E6%96%87%E4%BB%B6%3A'%2C%20files)%5Cn%7D%5Cn%5Cnconst%20handleFilesRejected%20%3D%20(rejection%3A%20FileRejection)%20%3D%3E%20%7B%5Cn%20%20console.error('%E8%A2%AB%E6%8B%92%E7%BB%9D%E7%9A%84%E6%96%87%E4%BB%B6%3A'%2C%20rejection)%5Cn%7D%5Cn%5Cn%2F%2F%20%E9%A1%B5%E9%9D%A2%E5%8A%A0%E8%BD%BD%E5%AE%8C%E6%88%90%E5%90%8E%E8%87%AA%E5%8A%A8%E8%81%9A%E7%84%A6%E8%BE%93%E5%85%A5%E6%A1%86%5CnonMounted(()%20%3D%3E%20%7B%5Cn%20%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20senderRef.value%3F.focus()%5Cn%20%20%7D%2C%20500)%5Cn%7D)%5Cn%5Cnconst%20containerStyles%20%3D%20getContainerStyles()%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn%40media%20(min-width%3A%201280px)%20%7B%5Cn%20%20.max-container%20%7B%5Cn%20%20%20%20width%3A%201280px%3B%5Cn%20%20%20%20margin%3A%200%20auto%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.chat-input%20%7B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%5Cn%20%20.chat-input-pills%20%7B%5Cn%20%20%20%20display%3A%20flex%3B%5Cn%20%20%20%20align-items%3A%20center%3B%5Cn%20%20%20%20gap%3A%208px%3B%5Cn%5Cn%20%20%20%20.pills%20%7B%5Cn%20%20%20%20%20%20flex%3A%201%3B%5Cn%20%20%20%20%20%20%3Adeep(.tr-suggestion-pills__container)%20%7B%5Cn%20%20%20%20%20%20%20%20mask%3A%20linear-gradient(to%20right%2C%20rgba(0%2C%200%2C%200%2C%201)%2080%25%2C%20rgba(0%2C%200%2C%200%2C%200)%20100%25)%3B%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.tiny-container%20%7B%5Cn%20%20container-type%3A%20inline-size%3B%5Cn%5Cn%20%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20%20%20display%3A%20flex%3B%5Cn%20%20%20%20align-items%3A%20center%3B%5Cn%20%20%20%20justify-content%3A%20center%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.tiny-prompts%20%7B%5Cn%20%20padding%3A%2016px%2024px%3B%5Cn%5Cn%20%20--tr-prompt-width%3A%20100%25%3B%5Cn%5Cn%20%20%40container%20(width%20%3E%3D64rem)%20%7B%5Cn%20%20%20%20--tr-prompt-width%3A%20calc(50%25%20-%208px)%3B%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn.tr-history-demo-container%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20right%3A%20100%25%3B%5Cn%20%20top%3A%20100%25%3B%5Cn%20%20z-index%3A%20var(--tr-z-index-popover)%3B%5Cn%20%20width%3A%20300px%3B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20box-shadow%3A%200%204px%2020px%20rgba(0%2C%200%2C%200%2C%200.04)%3B%5Cn%20%20background-color%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%5Cn%20%20.tr-history-demo%20%7B%5Cn%20%20%20%20overflow-y%3A%20auto%3B%5Cn%20%20%20%20flex%3A%201%3B%5Cn%5Cn%20%20%20%20--tr-history-item-selected-bg%3A%20var(--tr-history-item-hover-bg)%3B%5Cn%20%20%20%20--tr-history-item-selected-color%3A%20var(--tr-color-primary)%3B%5Cn%20%20%20%20--tr-history-item-space-y%3A%204px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22responseProvider.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FresponseProvider.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20extractSearchQuery%2C%20hasMcpTriggerKeyword%20%7D%20from%20'.%2FmockMcp'%5Cn%5Cn%2F**%5Cn%20*%20Response%20provider%20for%20the%20assistant%20chat.%5Cn%20*%20When%20user%20message%20contains%20MCP%20trigger%20keywords%20(%E6%90%9C%E7%B4%A2%2Fsearch%2FMCP%2F%E5%B7%A5%E5%85%B7%2F%E6%9F%A5%E8%AF%A2)%2C%5Cn%20*%20uses%20mock%20MCP%20tool%20flow%3B%20otherwise%20fetches%20from%20real%20API.%5Cn%20*%2F%5Cnexport%20async%20function%20assistantResponseProvider(%5Cn%20%20requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20Promise%3CAsyncGenerator%3CChatCompletion%3E%3E%20%7B%5Cn%20%20const%20msgs%20%3D%20requestBody.messages%20%7C%7C%20%5B%5D%5Cn%20%20const%20last%20%3D%20msgs%5Bmsgs.length%20-%201%5D%5Cn%5Cn%20%20%2F%2F%20Use%20mock%20MCP%20flow%20when%3A%20(1)%20user%20message%20has%20keyword%2C%20or%20(2)%20last%20message%20is%20tool%5Cn%20%20const%20useMockMcp%20%3D%5Cn%20%20%20%20(last%3F.role%20%3D%3D%3D%20'user'%20%26%26%20hasMcpTriggerKeyword(String(last.content%20%7C%7C%20'')))%20%7C%7C%20last%3F.role%20%3D%3D%3D%20'tool'%5Cn%5Cn%20%20if%20(useMockMcp)%20%7B%5Cn%20%20%20%20return%20mockMcpStream(requestBody%2C%20abortSignal)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20response%20%3D%20await%20fetch('%2Fapi%2Fchat%2Fcompletions'%2C%20%7B%5Cn%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%7D)%5Cn%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%7D%5Cn%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20Mock%20stream%3A%20when%20user%20message%20contains%20MCP%20keyword%2C%20return%20tool_calls%3B%5Cn%20*%20when%20last%20message%20is%20tool%2C%20return%20AI%20summary.%5Cn%20*%2F%5Cnasync%20function*%20mockMcpStream(%5Cn%20%20requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20msgs%20%3D%20requestBody.messages%20%7C%7C%20%5B%5D%5Cn%20%20const%20last%20%3D%20msgs%5Bmsgs.length%20-%201%5D%5Cn%20%20const%20id%20%3D%20'mock-mcp-'%20%2B%20Date.now()%5Cn%5Cn%20%20if%20(last%3F.role%20%3D%3D%3D%20'tool')%20%7B%5Cn%20%20%20%20%2F%2F%20Second%20round%3A%20return%20AI%20summary%20based%20on%20tool%20result%5Cn%20%20%20%20const%20toolContent%20%3D%20typeof%20last.content%20%3D%3D%3D%20'string'%20%3F%20last.content%20%3A%20''%5Cn%20%20%20%20let%20query%20%3D%20'%E6%9C%AA%E7%9F%A5'%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20parsed%20%3D%20JSON.parse(toolContent)%5Cn%20%20%20%20%20%20if%20(parsed%3F.query)%20query%20%3D%20parsed.query%5Cn%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20ignore%5Cn%20%20%20%20%7D%5Cn%20%20%20%20const%20text%20%3D%20%60%E6%A0%B9%E6%8D%AE%20MCP%20%E6%90%9C%E7%B4%A2%E7%BB%93%E6%9E%9C%EF%BC%88%E6%9F%A5%E8%AF%A2%EF%BC%9A%E3%80%8C%24%7Bquery%7D%E3%80%8D%EF%BC%89%EF%BC%8C%E4%B8%BA%E6%82%A8%E6%80%BB%E7%BB%93%E5%A6%82%E4%B8%8B%EF%BC%9A%E6%89%BE%E5%88%B0%202%20%E6%9D%A1%E7%9B%B8%E5%85%B3%E7%BB%93%E6%9E%9C%EF%BC%8C%E5%9D%87%E4%B8%BA%E6%A8%A1%E6%8B%9F%E6%95%B0%E6%8D%AE%E3%80%82%E5%A6%82%E9%9C%80%E7%9C%9F%E5%AE%9E%E6%90%9C%E7%B4%A2%EF%BC%8C%E8%AF%B7%E6%8E%A5%E5%85%A5%E5%AE%9E%E9%99%85%E7%9A%84%20MCP%20%E6%9C%8D%E5%8A%A1%E3%80%82%60%5Cn%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20text.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%2040))%5Cn%20%20%20%20%20%20const%20content%20%3D%20text%5Bi%5D%5Cn%20%20%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20%20%20model%3A%20'mock-mcp'%2C%5Cn%20%20%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%20%7D%20%3A%20%7B%20content%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20text.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20%2F%2F%20First%20round%3A%20user%20message%20contains%20keyword%20-%3E%20return%20tool_calls%5Cn%20%20const%20userContent%20%3D%20typeof%20last%3F.content%20%3D%3D%3D%20'string'%20%3F%20last.content%20%3A%20''%5Cn%20%20const%20query%20%3D%20extractSearchQuery(userContent)%5Cn%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20yield%20%7B%5Cn%20%20%20%20id%2C%5Cn%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20model%3A%20'mock-mcp'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20tool_calls%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3A%20'call_mcp_search_'%20%2B%20Date.now()%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20'mcp_search'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20arguments%3A%20JSON.stringify(%7B%20query%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'tool_calls'%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22assistantConstants.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FassistantConstants.ts%22%2C%22code%22%3A%22import%20type%20%7B%20SuggestionGroup%2C%20UserItem%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconDislike%2C%20IconLike%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cn%2F%2F%20---%20Drag%20overlay%20---%5Cnexport%20const%20OVERLAY_TITLE%20%3D%20'%E5%B0%86%E5%9B%BE%E7%89%87%E6%8B%96%E5%88%B0%E6%AD%A4%E5%A4%84%E5%AE%8C%E6%88%90%E4%B8%8A%E4%BC%A0'%5Cnexport%20const%20OVERLAY_DESCRIPTION%20%3D%20%5B'%E6%80%BB%E8%AE%A1%E6%9C%80%E5%A4%9A%E4%B8%8A%E4%BC%A03%E4%B8%AA%E5%9B%BE%E7%89%87%EF%BC%88%E6%AF%8F%E4%B8%AA10MB%E4%BB%A5%E5%86%85%EF%BC%89'%2C%20'%E6%94%AF%E6%8C%81%E5%9B%BE%E7%89%87%E6%A0%BC%E5%BC%8F%20JPG%2FJPEG%2FPNG'%5D%5Cn%5Cn%2F%2F%20---%20Dropdown%20menu%20---%5Cnexport%20const%20DROPDOWN_MENU_ITEMS%20%3D%20%5B%5Cn%20%20%7B%20id%3A%20'1'%2C%20text%3A%20'%E5%8E%BB%E7%BB%AD%E8%B4%B9'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'2'%2C%20text%3A%20'%E5%8E%BB%E9%80%80%E8%AE%A2'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'3'%2C%20text%3A%20'%E6%9F%A5%E8%B4%A6%E5%8D%95'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'4'%2C%20text%3A%20'%E5%AF%BC%E8%B4%A6%E5%8D%95'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'5'%2C%20text%3A%20'%E5%AF%B9%E5%B8%90%E5%8D%95'%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Prompt%20items%20---%5Cnexport%20interface%20PromptItemData%20%7B%5Cn%20%20label%3A%20string%5Cn%20%20description%3A%20string%5Cn%20%20emoji%3A%20string%5Cn%20%20badge%3F%3A%20string%5Cn%7D%5Cn%5Cnexport%20const%20PROMPT_ITEMS_DATA%3A%20PromptItemData%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E6%97%A5%E5%B8%B8%E5%8A%A9%E7%90%86%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20emoji%3A%20'%F0%9F%A7%A0'%2C%5Cn%20%20%20%20badge%3A%20'NEW'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%5C%22Vue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%5C%22%EF%BC%81'%2C%5Cn%20%20%20%20emoji%3A%20'%F0%9F%A4%94'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%88%9B%E6%84%8F%E7%94%9F%E6%88%90%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20emoji%3A%20'%E2%9C%A8'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'MCP%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8'%2C%5Cn%20%20%20%20description%3A%20'%E6%90%9C%E7%B4%A2%EF%BC%9A%E5%8C%97%E4%BA%AC%E5%A4%A9%E6%B0%94%EF%BC%88%E8%BE%93%E5%85%A5%E3%80%8C%E6%90%9C%E7%B4%A2%E3%80%8D%E3%80%8CMCP%E3%80%8D%E3%80%8C%E5%B7%A5%E5%85%B7%E3%80%8D%E7%AD%89%E5%85%B3%E9%94%AE%E8%AF%8D%E5%8F%AF%E8%A7%A6%E5%8F%91%E6%A8%A1%E6%8B%9F%20MCP%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%89'%2C%5Cn%20%20%20%20emoji%3A%20'%F0%9F%94%A7'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Pill%20items%20config%20---%5Cnexport%20interface%20PillItemConfig%20%7B%5Cn%20%20text%3A%20string%5Cn%20%20type%3A%20'dropdown'%5Cn%7D%5Cn%5Cnexport%20interface%20TemplatePillItemConfig%20%7B%5Cn%20%20text%3A%20string%5Cn%20%20type%3A%20'template'%5Cn%20%20range%3A%20%5Bnumber%2C%20number%3F%5D%5Cn%7D%5Cn%5Cnexport%20type%20PillConfig%20%3D%20PillItemConfig%20%7C%20TemplatePillItemConfig%5Cn%5Cnexport%20const%20PILL_ITEMS_CONFIG%3A%20PillConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%20text%3A%20'%E8%B4%B9%E7%94%A8%E6%88%90%E6%9C%AC'%2C%20type%3A%20'dropdown'%20%7D%2C%5Cn%20%20%7B%20text%3A%20'%E5%B8%B8%E7%94%A8%E6%8C%87%E4%BB%A4'%2C%20type%3A%20'template'%2C%20range%3A%20%5B0%2C%203%5D%20%7D%2C%5Cn%20%20%7B%20text%3A%20'%E5%B7%A5%E4%BD%9C%E5%8A%A9%E6%89%8B'%2C%20type%3A%20'template'%2C%20range%3A%20%5B3%2C%206%5D%20%7D%2C%5Cn%20%20%7B%20text%3A%20'%E5%86%85%E5%AE%B9%E5%88%9B%E4%BD%9C'%2C%20type%3A%20'template'%2C%20range%3A%20%5B6%5D%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Template%20suggestions%20---%5Cnexport%20interface%20TemplateSuggestionItem%20%7B%5Cn%20%20id%3A%20string%5Cn%20%20text%3A%20string%5Cn%20%20template%3A%20UserItem%5B%5D%5Cn%7D%5Cn%5Cnexport%20const%20templateSuggestions%3A%20TemplateSuggestionItem%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'write'%2C%5Cn%20%20%20%20text%3A%20'%E5%B8%AE%E6%88%91%E5%86%99%E4%BD%9C'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%B8%AE%E6%88%91%E6%92%B0%E5%86%99'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%96%87%E7%AB%A0%E7%B1%BB%E5%9E%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%AD%97%E7%9A%84'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%2C%20%E8%AF%AD%E6%B0%94%E7%B1%BB%E5%9E%8B%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%AD%A3%E5%BC%8F%2F%E8%BD%BB%E6%9D%BE%2F%E4%B8%93%E4%B8%9A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%2C%20%E5%85%B7%E4%BD%93%E5%86%85%E5%AE%B9%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E8%AF%A6%E7%BB%86%E6%8F%8F%E8%BF%B0'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'translate'%2C%5Cn%20%20%20%20text%3A%20'%E7%BF%BB%E8%AF%91'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B0%86%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%B8%AD%E6%96%87%2F%E8%8B%B1%E6%96%87%2F%E6%B3%95%E8%AF%AD%2F%E5%BE%B7%E8%AF%AD%2F%E6%97%A5%E8%AF%AD'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%86%85%E5%AE%B9%E7%BF%BB%E8%AF%91%E6%88%90'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%9B%AE%E6%A0%87%E8%AF%AD%E8%A8%80'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%9C%80%E8%A6%81%E7%BF%BB%E8%AF%91%E7%9A%84%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'summarize'%2C%5Cn%20%20%20%20text%3A%20'%E5%86%85%E5%AE%B9%E6%80%BB%E7%BB%93'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%AF%B9%E4%BB%A5%E4%B8%8B%E5%86%85%E5%AE%B9%E8%BF%9B%E8%A1%8C'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%AE%80%E8%A6%81%2F%E8%AF%A6%E7%BB%86'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%80%BB%E7%BB%93%EF%BC%8C%E7%BA%A6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%AD%97%E6%95%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%AD%97%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%9C%80%E8%A6%81%E6%80%BB%E7%BB%93%E7%9A%84%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'code-review'%2C%5Cn%20%20%20%20text%3A%20'%E4%BB%A3%E7%A0%81%E5%AE%A1%E6%9F%A5'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E5%AE%A1%E6%9F%A5%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'JavaScript%2FTypeScript%2FPython%2FJava%2FC%2B%2B%2FGo'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E4%BB%A3%E7%A0%81%EF%BC%8C%E5%85%B3%E6%B3%A8'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%80%A7%E8%83%BD%2F%E5%AE%89%E5%85%A8%2F%E5%8F%AF%E8%AF%BB%E6%80%A7%2F%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%96%B9%E9%9D%A2%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BB%A3%E7%A0%81%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'email-compose'%2C%5Cn%20%20%20%20text%3A%20'%E5%86%99%E9%82%AE%E4%BB%B6'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%AD%A3%E5%BC%8F%2F%E9%9D%9E%E6%AD%A3%E5%BC%8F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%EF%BC%8C%E5%8F%91%E9%80%81%E7%BB%99'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%94%B6%E4%BB%B6%E4%BA%BA%E8%A7%92%E8%89%B2'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E5%86%85%E5%AE%B9%E6%98%AF%E5%85%B3%E4%BA%8E'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%82%AE%E4%BB%B6%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'data-analysis'%2C%5Cn%20%20%20%20text%3A%20'%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%88%86%E6%9E%90%E4%BB%A5%E4%B8%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E9%94%80%E5%94%AE%2F%E7%94%A8%E6%88%B7%2F%E6%B5%81%E9%87%8F%2F%E9%87%91%E8%9E%8D%2F%E5%81%A5%E5%BA%B7'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%95%B0%E6%8D%AE%EF%BC%8C%E5%85%B3%E6%B3%A8'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%A2%9E%E9%95%BF%E7%8E%87%2F%E5%88%86%E5%B8%83%2F%E8%B6%8B%E5%8A%BF%2F%E5%BC%82%E5%B8%B8%2F%E5%85%B3%E8%81%94%E6%80%A7'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%8C%87%E6%A0%87%EF%BC%8C%E7%94%9F%E6%88%90'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%9F%B1%E7%8A%B6%E5%9B%BE%2F%E6%8A%98%E7%BA%BF%E5%9B%BE%2F%E9%A5%BC%E5%9B%BE%2F%E6%95%A3%E7%82%B9%E5%9B%BE%2F%E7%83%AD%E5%8A%9B%E5%9B%BE'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%8F%AF%E8%A7%86%E5%8C%96%3A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%95%B0%E6%8D%AE%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'product-design'%2C%5Cn%20%20%20%20text%3A%20'%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E8%AE%BE%E8%AE%A1%E4%B8%80%E4%B8%AA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%A7%BB%E5%8A%A8%E5%BA%94%E7%94%A8%2F%E7%BD%91%E7%AB%99%2F%E5%B0%8F%E7%A8%8B%E5%BA%8F%2F%E6%A1%8C%E9%9D%A2%E8%BD%AF%E4%BB%B6%2F%E6%99%BA%E8%83%BD%E7%A1%AC%E4%BB%B6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E7%9A%84'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%E5%90%8D%E7%A7%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%EF%BC%8C%E7%9B%AE%E6%A0%87%E7%94%A8%E6%88%B7%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%94%A8%E6%88%B7%E7%BE%A4%E4%BD%93'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E6%A0%B8%E5%BF%83%E4%BB%B7%E5%80%BC%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8A%9F%E8%83%BD%E4%BB%B7%E5%80%BC'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'meeting-summary'%2C%5Cn%20%20%20%20text%3A%20'%E4%BC%9A%E8%AE%AE%E7%BA%AA%E8%A6%81'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E4%B8%80%E4%BB%BD%E4%BC%9A%E8%AE%AE%E7%BA%AA%E8%A6%81%EF%BC%8C%E4%BC%9A%E8%AE%AE%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BC%9A%E8%AE%AE%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E5%8F%82%E4%BC%9A%E4%BA%BA%E5%91%98%E6%9C%89'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%8F%82%E4%BC%9A%E4%BA%BA%E5%91%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E4%BC%9A%E8%AE%AE%E8%A6%81%E7%82%B9%E5%8C%85%E6%8B%AC'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E4%BC%9A%E8%AE%AE%E8%A6%81%E7%82%B9'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'interview-questions'%2C%5Cn%20%20%20%20text%3A%20'%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E4%B8%BA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%B2%97%E4%BD%8D%E5%90%8D%E7%A7%B0'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%B2%97%E4%BD%8D%EF%BC%8C%E9%92%88%E5%AF%B9'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%8A%80%E8%83%BD%E9%A2%86%E5%9F%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%96%B9%E5%90%91%EF%BC%8C%E8%AE%BE%E8%AE%A1'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'3%2F5%2F10'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E4%B8%AA'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%AE%80%E5%8D%95%2F%E4%B8%AD%E7%AD%89%2F%E5%9B%B0%E9%9A%BE'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'speech-draft'%2C%5Cn%20%20%20%20text%3A%20'%E6%BC%94%E8%AE%B2%E7%A8%BF'%2C%5Cn%20%20%20%20template%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%92%B0%E5%86%99%E4%B8%80%E7%AF%87'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E5%BC%80%E5%9C%BA%2F%E4%B8%BB%E9%A2%98%2F%E8%87%B4%E8%B0%A2%2F%E9%A2%81%E5%A5%96%2F%E6%AF%95%E4%B8%9A'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E6%BC%94%E8%AE%B2%E7%A8%BF%EF%BC%8C%E4%B8%BB%E9%A2%98%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E6%BC%94%E8%AE%B2%E4%B8%BB%E9%A2%98'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E6%97%B6%E9%95%BF%E7%BA%A6'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'5%2F10%2F15%2F30'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E5%88%86%E9%92%9F%EF%BC%8C%E5%8F%97%E4%BC%97%E6%98%AF'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20type%3A%20'template'%2C%20content%3A%20'%E7%9B%AE%E6%A0%87%E5%90%AC%E4%BC%97'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Suggestion%20popover%20---%5Cnexport%20const%20suggestionPopoverData%3A%20SuggestionGroup%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'basic'%2C%5Cn%20%20%20%20label%3A%20'%E6%8E%A8%E8%8D%90'%2C%5Cn%20%20%20%20icon%3A%20IconLike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b1'%2C%20text%3A%20'%E4%BB%80%E4%B9%88%E6%98%AF%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b2'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%99%BB%E5%BD%95%E5%88%B0Windows%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b3'%2C%20text%3A%20'%E5%BC%B9%E6%80%A7%E5%85%AC%E7%BD%91IP%E4%B8%BA%E4%BB%80%E4%B9%88ping%E4%B8%8D%E9%80%9A%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b4'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AE%89%E5%85%A8%E7%BB%84%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AE%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b5'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b6'%2C%20text%3A%20'%E4%BB%80%E4%B9%88%E6%98%AF%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b7'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%99%BB%E5%BD%95%E5%88%B0Windows%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b8'%2C%20text%3A%20'%E5%BC%B9%E6%80%A7%E5%85%AC%E7%BD%91IP%E4%B8%BA%E4%BB%80%E4%B9%88ping%E4%B8%8D%E9%80%9A%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b9'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AE%89%E5%85%A8%E7%BB%84%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AE%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'b0'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'purchase'%2C%5Cn%20%20%20%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20IconDislike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p1'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E8%B4%AD%E4%B9%B0%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p2'%2C%20text%3A%20'%E6%97%A0%E6%B3%95%E7%99%BB%E5%BD%95%E5%BC%B9%E6%80%A7%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%80%8E%E4%B9%88%E5%8A%9E%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p3'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BB%B7%E6%A0%BC%E6%80%8E%E4%B9%88%E8%AE%A1%E7%AE%97%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p4'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E6%9F%A5%E7%9C%8B%E8%B4%A6%E5%8D%95%E8%AF%A6%E6%83%85%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'p5'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E7%BB%AD%E8%B4%B9%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20group%3A%20'usage'%2C%5Cn%20%20%20%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%5Cn%20%20%20%20icon%3A%20IconLike%2C%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u1'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%BD%BF%E7%94%A8%E9%99%90%E5%88%B6%E4%B8%8E%E9%A1%BB%E7%9F%A5'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u2'%2C%20text%3A%20'%E4%BD%BF%E7%94%A8RDP%E6%96%87%E4%BB%B6%E8%BF%9E%E6%8E%A5Windows%E5%AE%9E%E4%BE%8B'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u3'%2C%20text%3A%20'%E5%A4%9A%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95%EF%BC%88Windows2016%EF%BC%89'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u4'%2C%20text%3A%20'%E5%A6%82%E4%BD%95%E9%87%8D%E7%BD%AE%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%AF%86%E7%A0%81%3F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'u5'%2C%20text%3A%20'%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%A6%82%E4%BD%95%E5%AE%89%E8%A3%85%E8%BD%AF%E4%BB%B6%3F'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%20group%3A%20'4'%2C%20label%3A%20'%E6%8E%A8%E8%8D%90'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'5'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'6'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'7'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'8'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'9'%2C%20label%3A%20'%E8%B4%AD%E4%B9%B0%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%20%20%7B%20group%3A%20'10'%2C%20label%3A%20'%E4%BD%BF%E7%94%A8%E5%92%A8%E8%AF%A2'%2C%20icon%3A%20IconLike%2C%20items%3A%20%5B%5D%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20---%20Container%20styles%20---%5Cnexport%20function%20getContainerStyles()%3A%20Record%3Cstring%2C%20string%3E%20%7B%5Cn%20%20return%20window.self%20!%3D%3D%20window.top%20%3F%20%7B%20height%3A%20'100vh'%20%7D%20%3A%20%7B%20top%3A%20'112px'%2C%20height%3A%20'calc(100vh%20-%20112px)'%20%7D%5Cn%7D%5Cn%22%7D%2C%22mockMcp.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fexamples%2FmockMcp.ts%22%2C%22code%22%3A%22import%20type%20%7B%20Tool%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F**%5Cn%20*%20Keywords%20that%20trigger%20mock%20MCP%20tool%20calls%20when%20present%20in%20user%20message.%5Cn%20*%2F%5Cnexport%20const%20MCP_TRIGGER_KEYWORDS%20%3D%20%5B'%E6%90%9C%E7%B4%A2'%2C%20'search'%2C%20'MCP'%2C%20'mcp'%2C%20'%E5%B7%A5%E5%85%B7'%2C%20'%E6%9F%A5%E8%AF%A2'%5D%5Cn%5Cn%2F**%5Cn%20*%20Check%20if%20user%20message%20contains%20any%20MCP%20trigger%20keyword.%5Cn%20*%2F%5Cnexport%20function%20hasMcpTriggerKeyword(content%3A%20string)%3A%20boolean%20%7B%5Cn%20%20const%20text%20%3D%20(content%20%7C%7C%20'').trim().toLowerCase()%5Cn%20%20return%20MCP_TRIGGER_KEYWORDS.some((kw)%20%3D%3E%20text.includes(kw.toLowerCase()))%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20Extract%20search%20query%20from%20user%20message%20(simple%20heuristic).%5Cn%20*%2F%5Cnexport%20function%20extractSearchQuery(content%3A%20string)%3A%20string%20%7B%5Cn%20%20const%20text%20%3D%20content.trim()%5Cn%20%20%2F%2F%20Try%20to%20extract%20content%20after%20keywords%20like%20%5C%22%E6%90%9C%E7%B4%A2%5C%22%2C%20%5C%22%E6%9F%A5%E8%AF%A2%5C%22%5Cn%20%20const%20patterns%20%3D%20%5B%2F(%3F%3A%E6%90%9C%E7%B4%A2%7C%E6%9F%A5%E8%AF%A2)%5C%5Cs*%5B%EF%BC%9A%3A%5D%5C%5Cs*(.%2B)%2F%2C%20%2F(%3F%3A%E6%90%9C%E7%B4%A2%7C%E6%9F%A5%E8%AF%A2)%5C%5Cs%2B(.%2B)%2F%2C%20%2Fsearch%5C%5Cs%2B(.%2B)%2Fi%2C%20%2F(.%2B)%2F%5D%5Cn%20%20for%20(const%20p%20of%20patterns)%20%7B%5Cn%20%20%20%20const%20m%20%3D%20text.match(p)%5Cn%20%20%20%20if%20(m%3F.%5B1%5D%3F.trim())%20return%20m%5B1%5D.trim()%5Cn%20%20%7D%5Cn%20%20return%20text.slice(0%2C%2030)%20%7C%7C%20'%E9%BB%98%E8%AE%A4%E6%9F%A5%E8%AF%A2'%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20MCP%20tool%20definitions%20(OpenAI%20format).%5Cn%20*%2F%5Cnexport%20const%20MCP_TOOLS%3A%20Tool%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20'mcp_search'%2C%5Cn%20%20%20%20%20%20description%3A%20'MCP%20search%20tool.%20Search%20for%20information%20by%20query.'%2C%5Cn%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20query%3A%20%7B%20type%3A%20'string'%2C%20description%3A%20'Search%20query'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'query'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F**%5Cn%20*%20Execute%20mock%20MCP%20tool.%20Simulates%20MCP%20server%20tool%20call.%5Cn%20*%2F%5Cnexport%20async%20function%20callMcpTool(toolName%3A%20string%2C%20args%3A%20Record%3Cstring%2C%20unknown%3E)%3A%20Promise%3Cstring%3E%20%7B%5Cn%20%20if%20(toolName%20%3D%3D%3D%20'mcp_search')%20%7B%5Cn%20%20%20%20const%20query%20%3D%20(args.query%20as%20string)%20%7C%7C%20'unknown'%5Cn%20%20%20%20%2F%2F%20Simulate%20MCP%20search%20result%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20%20%20return%20JSON.stringify(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20source%3A%20'mock-mcp-server'%2C%5Cn%20%20%20%20%20%20%20%20tool%3A%20'mcp_search'%2C%5Cn%20%20%20%20%20%20%20%20query%2C%5Cn%20%20%20%20%20%20%20%20results%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20title%3A%20%60%E5%85%B3%E4%BA%8E%E3%80%8C%24%7Bquery%7D%E3%80%8D%E7%9A%84%E6%A8%A1%E6%8B%9F%E7%BB%93%E6%9E%9C%201%60%2C%20snippet%3A%20'%E8%BF%99%E6%98%AF%20MCP%20%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2%E8%BF%94%E5%9B%9E%E7%9A%84%E7%AC%AC%E4%B8%80%E6%9D%A1%E7%BB%93%E6%9E%9C%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20title%3A%20%60%E5%85%B3%E4%BA%8E%E3%80%8C%24%7Bquery%7D%E3%80%8D%E7%9A%84%E6%A8%A1%E6%8B%9F%E7%BB%93%E6%9E%9C%202%60%2C%20snippet%3A%20'%E8%BF%99%E6%98%AF%20MCP%20%E6%A8%A1%E6%8B%9F%E6%90%9C%E7%B4%A2%E8%BF%94%E5%9B%9E%E7%9A%84%E7%AC%AC%E4%BA%8C%E6%9D%A1%E7%BB%93%E6%9E%9C%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20null%2C%5Cn%20%20%20%20%20%202%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%20%20return%20JSON.stringify(%7B%20error%3A%20%60Unknown%20MCP%20tool%3A%20%24%7BtoolName%7D%60%20%7D)%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{C.value=!1}),vueCode:t(h)},D({_:2},[a.value?{name:"vue",fn:s(()=>[e(t(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1})])}}});export{T as __pageData,P as default};
