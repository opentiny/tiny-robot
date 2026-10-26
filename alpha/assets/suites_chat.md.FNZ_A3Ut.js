const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/controlled-ui.55Egx0Z2.js","assets/chunks/index.4FILK6BP.js","assets/chunks/framework.BnMBnixn.js","assets/chunks/theme.BZ9yqhu8.js","assets/chunks/index.pu6DNDM2.js","assets/chunks/responsive-layout.CCkP180N.js","assets/chunks/floating-layout.DONuCuUR.js","assets/chunks/right-aside-panel.CWmmyv5Z.js","assets/chunks/modelProviders.BZjB-uZP.js","assets/chunks/slots-basic.CxaKPUDR.js","assets/chunks/history-groups.CzlKaTLn.js","assets/chunks/createChatRuntime.CE5BrhwV.js","assets/chunks/mockConversationStorage.kaoalIKQ.js","assets/chunks/runtime-error.DaX7P4tO.js","assets/chunks/bubble-options.BVQ3sv01.js","assets/chunks/sender-options.CODFefYn.js","assets/chunks/welcome-prompts.Bct4VhBY.js","assets/chunks/layout-presets.C5QB19OR.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as l,aZ as _,aL as x,v as w,H as o,bL as C,bB as p,J as t,bk as n,bJ as a,G as c,b7 as h,aU as I}from"./chunks/framework.BnMBnixn.js";import{L as E,N as u}from"./chunks/index.Cyut7m58.js";const S=`<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import { TrChatUI, type ChatMessageItem, type ChatSendPayload, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const inputValue = shallowRef('')
const messages = shallowRef<ChatMessageItem[]>([])
const sending = shallowRef(false)
let replyTimer: ReturnType<typeof setTimeout> | undefined

const data = computed<ChatUIData>(() => ({
  conversation: { activeId: 'controlled-demo', title: '应用助手' },
  bubble: { messages: messages.value },
  sender: { loading: sending.value },
}))

function handleSubmit(payload: ChatSendPayload) {
  if (!payload.text.trim() || sending.value) return

  sending.value = true
  messages.value = [...messages.value, { role: 'user', content: payload.text }]
  inputValue.value = ''
  replyTimer = setTimeout(() => {
    messages.value = [...messages.value, { role: 'assistant', content: \`已收到：\${payload.text}\` }]
    replyTimer = undefined
    sending.value = false
  }, 1500)
}

function handleCancel() {
  clearTimeout(replyTimer)
  replyTimer = undefined
  sending.value = false
}

onUnmounted(handleCancel)
<\/script>

<template>
  <div class="controlled-ui-demo">
    <TrChatUI
      :data="data"
      :ui="{ layout: { leftAside: false, rightAside: false } }"
      v-model:input-value="inputValue"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.controlled-ui-demo {
  --tr-layout-height: 100%;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.controlled-ui-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.controlled-ui-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
`,P=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type PreviewMode = 'dock' | 'drawer'

const mode = shallowRef<PreviewMode>('dock')
const inputValue = shallowRef('')
const modeOptions: PreviewMode[] = ['dock', 'drawer']

const data: ChatUIData = {
  conversation: {
    items: [
      { id: 'mobile', title: '移动端适配' },
      { id: 'desktop', title: '桌面端布局' },
    ],
    activeId: 'mobile',
    title: '响应式布局',
  },
  bubble: {
    messages: [
      { id: 'question', role: 'user', content: '窄视口下会话列表如何展示？' },
      {
        id: 'answer',
        role: 'assistant',
        content: '侧栏应使用抽屉覆盖内容，并通过页头按钮打开或关闭。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const ui = computed<ChatUIOptions>(() => ({
  layout: {
    contentMaxWidth: mode.value === 'drawer' ? 360 : 720,
    leftAside: {
      mode: mode.value,
      defaultOpen: mode.value === 'dock',
      resizable: mode.value === 'dock',
      minWidth: 240,
      maxWidth: 420,
    },
    rightAside: false,
  },
}))
<\/script>

<template>
  <section class="chat-responsive-demo">
    <div class="chat-responsive-demo__toolbar">
      <button
        v-for="item in modeOptions"
        :key="item"
        type="button"
        :class="{ 'is-active': mode === item }"
        :aria-pressed="mode === item"
        @click="mode = item"
      >
        {{ item === 'dock' ? '桌面 Dock' : '移动端 Drawer' }}
      </button>
    </div>

    <p>桌面布局下，拖动左侧栏右边缘可在 240px 到 420px 之间调整宽度；抽屉布局不支持调整宽度。</p>

    <div class="chat-responsive-demo__stage" :class="\`is-\${mode}\`">
      <TrChatUI :key="mode" :data="data" :ui="ui" :input-value="inputValue" @update:input-value="inputValue = $event" />
    </div>
  </section>
</template>

<style scoped>
.chat-responsive-demo {
  --tr-layout-height: 100%;
  display: grid;
  gap: 12px;
}

.chat-responsive-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.chat-responsive-demo__toolbar button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--tr-color-border, #dcdfe6);
  border-radius: 6px;
  color: var(--tr-text-primary, #252b3a);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.chat-responsive-demo__toolbar button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-responsive-demo__toolbar button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-responsive-demo__stage {
  box-sizing: border-box;
  height: 600px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--tr-color-border, #dcdfe6);
  border-radius: 10px;
  transition: max-width 0.2s ease;
}

.chat-responsive-demo__stage.is-dock {
  max-width: 760px;
}

.chat-responsive-demo__stage.is-drawer {
  max-width: 390px;
}

.chat-responsive-demo__stage :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
`,T=`<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions, type LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const open = ref(false)
const inputValue = shallowRef('')
const floatingState = ref<LayoutFloatingState>({
  placement: 'top-right',
  offsetX: 24,
  offsetY: 72,
  width: 520,
  height: 520,
})

const data: ChatUIData = {
  conversation: { activeId: 'floating', title: '浮动助手' },
  bubble: {
    messages: [
      {
        id: 'intro',
        role: 'assistant',
        content: '拖动顶部把手或窗口边缘，外部状态会同步更新。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const ui: ChatUIOptions = {
  layout: {
    surface: {
      mode: 'floating',
      floatingOptions: {
        draggable: true,
        resizable: true,
        minWidth: 360,
        maxWidth: 760,
        minHeight: 420,
        maxHeight: 720,
      },
    },
    leftAside: false,
  },
}

const stateText = computed(() => {
  const state = floatingState.value
  return \`\${state.placement} · x \${state.offsetX}px · y \${state.offsetY}px · \${state.width} × \${state.height}px\`
})

function updateFloatingState(value: LayoutFloatingState) {
  floatingState.value = value
}
<\/script>

<template>
  <section class="chat-floating-demo">
    <button type="button" class="chat-floating-demo__trigger" @click="open = !open">
      {{ open ? '关闭浮动聊天' : '打开浮动聊天' }}
    </button>
    <p class="chat-floating-demo__state" aria-live="polite">当前状态：{{ stateText }}</p>

    <TrChatUI
      v-if="open"
      class="chat-floating-window"
      :data="data"
      :ui="ui"
      :input-value="inputValue"
      :floating-state="floatingState"
      @update:input-value="inputValue = $event"
      @update:floating-state="updateFloatingState"
    >
      <template #layout-header="{ title }">
        <div class="chat-floating-demo__header">
          <strong>{{ title }}</strong>
          <button type="button" aria-label="关闭浮动聊天" @click="open = false">关闭</button>
        </div>
      </template>
    </TrChatUI>
  </section>
</template>

<style>
.chat-floating-window {
  --tr-layout-floating-radius: 12px;
}
</style>

<style scoped>
.chat-floating-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-height: 72px;
}

.chat-floating-demo__trigger,
.chat-floating-demo__header button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--tr-color-primary, #1476ff);
  border-radius: 6px;
  color: var(--tr-color-primary, #1476ff);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  cursor: pointer;
}

.chat-floating-demo__state {
  margin: 0;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
</style>
`,R=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrChat, useChatRuntime, type ChatMcpServers } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import BusinessRightAside from './business-right-aside.vue'
import { modelProviders } from './shared/modelProviders'

const mcpServers: ChatMcpServers = [
  {
    id: 'project-knowledge',
    name: '项目知识库',
    description: '检索需求、设计和项目约定。',
    baseUrl: \`\${import.meta.env.BASE_URL}api/mcp/project-knowledge\`,
    installed: true,
  },
  {
    id: 'release-calendar',
    name: '发布日历',
    description: '查询发布窗口和冻结时间。',
    baseUrl: \`\${import.meta.env.BASE_URL}api/mcp/release-calendar\`,
    installed: true,
  },
]

const rightAsideOpen = shallowRef(true)
const activeRightAsidePanelId = shallowRef<string | undefined>('preview')

const runtime = useChatRuntime({
  modelProviders,
  mcpServers,
  conversation: {
    useMessageOptions: {
      initialMessages: [
        {
          role: 'assistant',
          content: '发布方案已整理完成。你可以打开右侧预览，或查看引用资料。',
        },
      ],
    },
  },
})

runtime.actions.createConversation({ title: '发布方案协作' })

function openPanel(panelId: 'preview' | 'sources') {
  activeRightAsidePanelId.value = panelId
  rightAsideOpen.value = true
}
<\/script>

<template>
  <section class="chat-workbench">
    <TrChat
      class="chat-workbench__chat"
      :runtime="runtime"
      :ui="{
        layout: {
          rightAside: {
            width: 344,
            resizable: true,
            minWidth: 300,
            maxWidth: 480,
            panels: [
              { id: 'preview', title: '发布方案预览' },
              { id: 'sources', title: '引用资料' },
            ],
          },
        },
      }"
      :right-aside-open="rightAsideOpen"
      :active-right-aside-panel-id="activeRightAsidePanelId"
      @update:right-aside-open="rightAsideOpen = $event"
      @update:active-right-aside-panel-id="activeRightAsidePanelId = $event"
    >
      <template #bubble-content-footer="{ role, messageIndexes }">
        <div v-if="role === 'assistant' && messageIndexes.includes(0)" class="message-actions">
          <button class="message-actions__button" type="button" @click="openPanel('preview')">查看发布方案</button>
          <button class="message-actions__button" type="button" @click="openPanel('sources')">查看引用资料</button>
        </div>
      </template>

      <template #layout-right-aside-panel="{ panelId }">
        <BusinessRightAside :panel-id="panelId" @open-panel="openPanel" />
      </template>
    </TrChat>
  </section>
</template>

<style scoped>
.chat-workbench {
  --tr-layout-height: 100%;
  height: min(700px, calc(100vh - 240px));
  min-height: 480px;
}

.chat-workbench__chat {
  height: 100%;
}

.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.message-actions__button {
  border: 1px solid #c8d6e6;
  border-radius: 8px;
  color: #27567e;
  background: #fff;
  cursor: pointer;
  font: inherit;
}

.message-actions__button {
  padding: 6px 10px;
  font-size: 13px;
}

.message-actions__button:hover {
  border-color: #5d8db7;
  background: #f1f7fc;
}

:deep(h2.chat-right-aside-title) {
  padding: 0;
  border-top: none;
}

:deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .chat-workbench {
    height: 620px;
  }
}
</style>
`,q=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrChat, useChatRuntime } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const markedAnswers = shallowRef<string[]>([])
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    useMessageOptions: {
      initialMessages: [
        { role: 'assistant', content: '这个示例通过插槽自定义页头、添加消息按钮，并在输入框下方显示提示。' },
      ],
    },
  },
})

runtime.actions.createConversation({ title: '插槽定制' })

function answerKey(indexes: readonly number[]) {
  return \`\${runtime.activeConversation.value?.id}:\${indexes.join(',')}\`
}

function markAnswer(indexes: readonly number[]) {
  markedAnswers.value = [...markedAnswers.value, answerKey(indexes)]
}
<\/script>

<template>
  <section class="chat-slots-demo">
    <TrChat :runtime="runtime">
      <template #layout-header="{ title, isLeftAsideOpen, toggleLeftAside, createConversation }">
        <div class="chat-slots-demo__header">
          <button
            class="chat-slots-demo__button"
            type="button"
            :aria-expanded="isLeftAsideOpen"
            @click="toggleLeftAside"
          >
            {{ isLeftAsideOpen ? '收起会话列表' : '展开会话列表' }}
          </button>
          <strong class="chat-slots-demo__title">{{ title }}</strong>
          <button class="chat-slots-demo__button" type="button" @click="createConversation">新建会话</button>
        </div>
      </template>
      <template #bubble-content-footer="{ role, messageIndexes }">
        <button
          v-if="role === 'assistant'"
          class="chat-slots-demo__button chat-slots-demo__button--feedback"
          type="button"
          :disabled="markedAnswers.includes(answerKey(messageIndexes))"
          @click="markAnswer(messageIndexes)"
        >
          {{ markedAnswers.includes(answerKey(messageIndexes)) ? '已标记' : '有帮助' }}
        </button>
      </template>
      <template #composer-after>
        <p class="chat-slots-demo__tip">内容由 AI 生成，请仔细甄别。</p>
      </template>
    </TrChat>
  </section>
</template>

<style scoped>
.chat-slots-demo {
  --tr-layout-height: 100%;
  height: 600px;
}

.chat-slots-demo__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.chat-slots-demo__title {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.chat-slots-demo__button {
  min-height: 32px;
  padding: 4px 12px;
  border: 1px solid var(--tr-color-primary, #1476ff);
  border-radius: 6px;
  color: var(--tr-color-primary, #1476ff);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  cursor: pointer;
}

.chat-slots-demo__button--feedback {
  margin-top: 8px;
}

.chat-slots-demo__button:disabled {
  color: var(--tr-text-secondary, #575d6c);
  border-color: var(--tr-color-border, #dcdfe6);
  cursor: default;
}

.chat-slots-demo__tip {
  margin: 8px 0 0;
  color: var(--tr-text-tertiary);
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}

.chat-slots-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
`,M=`<script setup lang="ts">
import { computed } from 'vue'
import { TrChat, type ChatHistoryData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const groups = ['置顶', '昨天', '30天内']
const initialConversations = [
  { title: '初次问候与自我介绍', group: '置顶' },
  { title: 'square-pen 含义解释', group: '昨天' },
  { title: '浏览器 Agent 视觉操作优化', group: '30天内' },
  { title: 'VSCode 重启 TS 服务快捷键', group: '30天内' },
  { title: '如何制定英语学习计划', group: '30天内' },
]
const runtime = useChatCaseRuntime({
  storageKey: 'tiny-robot-demo-history-groups-v1',
  initialConversations: initialConversations.map(({ title, group }) => ({
    title,
    metadata: { group },
    messages: [
      { role: 'user', content: title },
      { role: 'assistant', content: \`这是“\${title}”的示例回答。切换左侧会话，可查看对应的消息。\` },
    ],
  })),
})

const historyData = computed<ChatHistoryData>(() =>
  groups
    .map((group) => ({
      group,
      items: runtime.conversations.value.filter((item) => (item.metadata?.group ?? '30天内') === group),
    }))
    .filter(({ items }) => items.length > 0),
)

const ui: ChatUIOptions = {
  layout: { leftAside: { width: 260, defaultOpen: true } },
  history: { showRenameControls: true },
}
<\/script>

<template>
  <section class="history-groups-demo">
    <p class="history-groups-demo__tip">
      展开会话列表后，可切换、重命名或删除会话。分组为预设示例，不包含自动日期归类或置顶操作；新会话显示在“30天内”。
    </p>
    <div class="history-groups-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" :history-data="historyData" />
    </div>
  </section>
</template>

<style scoped>
.history-groups-demo__tip {
  margin: 0 0 12px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.history-groups-demo__chat {
  --tr-layout-height: 100%;
  --tr-history-group-space-y: 14px;
  --tr-history-group-title-font-size: 12px;
  --tr-history-group-title-line-height: 18px;
  --tr-history-group-title-padding: 0 8px 6px;
  --tr-history-group-title-color: var(--tr-text-tertiary);
  --tr-history-item-padding: 7px 8px;
  --tr-history-item-padding-editing: 7px 8px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-space-y: 2px;
  --tr-history-item-selected-bg: #e4edfd;
  --tr-history-item-selected-color: #3964fe;
  height: 600px;
}

.history-groups-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.history-groups-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-groups-demo__chat :deep(.chat-left-aside-content) {
  overflow-x: hidden;
}
</style>
`,L=`<script setup lang="ts">
import { shallowRef } from 'vue'
import type { ConversationStorageStrategy, MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

let responseIndex = 0

const memoryStorage: ConversationStorageStrategy = {
  loadConversations: () => [],
  loadMessages: () => [],
  saveConversation: () => undefined,
  saveMessages: () => undefined,
  deleteConversation: () => undefined,
}

const responseProvider: ResponseProvider = async (requestBody: MessageRequestBody) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')

  if (text.includes('失败')) {
    const error = new Error('模拟请求失败：模型服务暂时不可用。')
    Object.assign(error, { code: 'DEMO_UNAVAILABLE' })
    throw error
  }

  responseIndex += 1
  return {
    id: \`runtime-error-demo-\${responseIndex}\`,
    object: 'chat.completion',
    created: responseIndex,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: \`正常回复：\${text || '成功消息'}\` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const runtime = useChatRuntime({
  conversation: { storage: memoryStorage, useMessageOptions: { responseProvider } },
})
const actionStatus = shallowRef('尚未收到操作失败通知')
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
}

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionStatus.value = payload.action === 'send' ? '已收到发送失败通知' : '已收到操作失败通知'
}
<\/script>

<template>
  <section class="runtime-error-demo">
    <p class="runtime-error-demo__hint">发送包含“失败”的内容可查看错误提示，发送其他内容可查看正常回复。</p>
    <p class="runtime-error-demo__status" aria-live="polite">{{ actionStatus }}</p>
    <div class="runtime-error-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" @runtime-action-error="handleRuntimeActionError" />
    </div>
  </section>
</template>

<style scoped>
.runtime-error-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.runtime-error-demo__hint,
.runtime-error-demo__status {
  margin: 0;
  overflow-wrap: anywhere;
}

.runtime-error-demo__hint {
  color: var(--tr-text-primary, #252b3a);
}

.runtime-error-demo__status {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.runtime-error-demo__chat {
  box-sizing: border-box;
  width: min(100%, 720px);
  height: min(620px, calc(100vh - 280px));
  min-height: 480px;
  min-width: 0;
}

.runtime-error-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.runtime-error-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .runtime-error-demo__chat {
    height: 560px;
  }
}
</style>
`,O=`<script setup lang="ts">
import { computed, h, shallowRef } from 'vue'
import { TrChat, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const customAppearance = shallowRef(true)
const userAvatar = h('span', { class: 'bubble-options-demo__avatar bubble-options-demo__avatar--user' }, '我')
const assistantAvatar = h('span', { class: 'bubble-options-demo__avatar bubble-options-demo__avatar--assistant' }, 'AI')
const runtime = useChatCaseRuntime({
  storageKey: 'tiny-robot-demo-bubble-options-v1',
  initialConversations: [
    {
      title: '消息外观配置',
      messages: [
        { role: 'user', content: '如何定制聊天消息的外观？' },
        {
          role: 'assistant',
          content:
            '**可以按角色分别配置：**\\n\\n- 用户消息显示在右侧，使用圆角气泡。\\n- AI 回答显示在左侧，不使用气泡框。\\n\\n切换上方选项，可比较默认外观。',
        },
      ],
    },
  ],
})

const ui = computed<ChatUIOptions>(() => ({
  layout: { leftAside: false },
  bubble: customAppearance.value
    ? {
        bubbleList: {
          roleConfigs: {
            user: { placement: 'end', avatar: userAvatar, shape: 'rounded' },
            assistant: { placement: 'start', avatar: assistantAvatar, shape: 'none' },
          },
        },
      }
    : {},
}))
<\/script>

<template>
  <section class="bubble-options-demo">
    <div class="bubble-options-demo__controls">
      <label><input v-model="customAppearance" type="radio" :value="false" /> 默认外观</label>
      <label><input v-model="customAppearance" type="radio" :value="true" /> 自定义外观</label>
    </div>
    <p class="bubble-options-demo__tip">比较头像和气泡外观；继续发送消息，新消息会沿用当前配置。</p>
    <div class="bubble-options-demo__chat" :class="{ 'bubble-options-demo__chat--custom': customAppearance }">
      <TrChat :runtime="runtime" :ui="ui" />
    </div>
  </section>
</template>

<style scoped>
.bubble-options-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.bubble-options-demo__tip {
  margin: 12px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.bubble-options-demo__chat {
  --tr-layout-height: 100%;
  height: 600px;
}

.bubble-options-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.bubble-options-demo__chat :deep(.bubble-options-demo__avatar) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.bubble-options-demo__chat :deep(.bubble-options-demo__avatar--user) {
  color: #3964fe;
  background: #e4edfd;
}

.bubble-options-demo__chat :deep(.bubble-options-demo__avatar--assistant) {
  color: #087f5b;
  background: #d3f9d8;
}

.bubble-options-demo__chat--custom :deep([data-box-type='box'][data-role='assistant']) {
  --tr-bubble-box-bg: transparent;
}
</style>
`,U=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrSender, type MentionItem, type TemplateItem } from '@opentiny/tiny-robot'
import { TrChat, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const showHelp = shallowRef(false)
const currentTemplate = shallowRef<TemplateItem[]>([])
const mentions: MentionItem[] = [
  { label: '产品组', value: 'product' },
  { label: '研发组', value: 'engineering' },
  { label: '测试组', value: 'qa' },
]
const extensions = [TrSender.mention(mentions), TrSender.template(currentTemplate)]
const runtime = useChatCaseRuntime({ storageKey: 'tiny-robot-demo-sender-options-v1' })
const inputDisabled = computed(() =>
  Boolean(runtime.composer.disabled?.value || runtime.composer.submitDisabled?.value),
)

const ui: ChatUIOptions = {
  layout: { leftAside: false },
  welcome: { title: '输入区配置', description: '输入 @ 选择对象，或使用下方按钮填入内容。' },
  sender: {
    placeholder: '输入 @ 选择对象，或点击“写报告”插入模板...',
    mode: 'multiple',
    maxLength: 300,
    showWordLimit: true,
    clearable: true,
    extensions,
    defaultActions: {
      submit: { tooltip: '发送给项目助手' },
      clear: { tooltip: '清空输入内容' },
    },
  },
}

function fillReportTemplate() {
  currentTemplate.value = [
    { type: 'text', content: '请帮我写一份关于' },
    { type: 'block', content: '项目进展' },
    { type: 'text', content: '的报告，面向' },
    {
      type: 'select',
      content: '',
      placeholder: '选择读者',
      options: [
        { label: '项目成员', value: '项目成员' },
        { label: '项目负责人', value: '项目负责人' },
      ],
    },
    { type: 'text', content: '，重点说明' },
    { type: 'block', content: '已完成工作和下一步计划' },
    { type: 'text', content: '。' },
  ]
}

function fillCommonQuestion() {
  currentTemplate.value = [{ type: 'text', content: '请列出项目周报中需要包含的内容。' }]
}
<\/script>

<template>
  <section class="sender-options-demo">
    <p class="sender-options-demo__tip">
      输入 @ 选择对象；点击“写报告”编辑模板字段；点击“常用问题”填入文本。所有内容均可编辑后发送。
    </p>
    <div class="sender-options-demo__chat">
      <TrChat :runtime="runtime" :ui="ui">
        <template v-if="showHelp" #sender-header>
          <p id="sender-options-help" class="sender-options-demo__help">
            @ 用于插入对象名称，不会切换模型；模板中的文本块可以编辑，下拉字段可以选择。内容超过 300 字时无法提交。
          </p>
        </template>
        <template #sender-footer>
          <div class="sender-options-demo__actions">
            <button
              class="sender-options-demo__button"
              type="button"
              :disabled="inputDisabled"
              @click="fillReportTemplate"
            >
              写报告
            </button>
            <button
              class="sender-options-demo__button"
              type="button"
              :disabled="inputDisabled"
              @click="fillCommonQuestion"
            >
              常用问题
            </button>
          </div>
        </template>
        <template #sender-footer-right>
          <button
            class="sender-options-demo__button"
            type="button"
            :aria-expanded="showHelp"
            aria-controls="sender-options-help"
            @click="showHelp = !showHelp"
          >
            使用说明
          </button>
        </template>
      </TrChat>
    </div>
  </section>
</template>

<style scoped>
.sender-options-demo__tip {
  margin: 0 0 12px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.sender-options-demo__chat {
  --tr-layout-height: 100%;
  height: 640px;
}

.sender-options-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sender-options-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.sender-options-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sender-options-demo__button {
  min-height: 30px;
  padding: 4px 8px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 16px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.sender-options-demo__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.sender-options-demo__help {
  margin: 0;
  padding: 8px 12px;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
</style>
`,W=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrSender, type TemplateItem } from '@opentiny/tiny-robot'
import { TrChat, type ChatPromptClickPayload, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const showWelcome = shallowRef(true)
const showPrompts = shallowRef(true)
const inputTemplate = shallowRef<TemplateItem[]>([])
const extensions = [TrSender.template(inputTemplate)]
const runtime = useChatCaseRuntime({ storageKey: 'tiny-robot-demo-welcome-prompts-v1' })

const ui = computed<ChatUIOptions>(() => ({
  layout: { leftAside: false },
  welcome: showWelcome.value ? { title: '项目助手', description: '选择一个问题开始，或输入自己的问题。' } : false,
  prompts: showPrompts.value
    ? {
        wrap: true,
        items: [
          { id: 'code', label: '解释代码', description: '请解释这段代码的作用，并给出使用建议。' },
          { id: 'report', label: '撰写周报', description: '请帮我整理本周工作，生成一份简洁的周报。' },
          { id: 'plan', label: '制定学习计划', description: '请为 Vue 初学者制定一份两周学习计划。' },
        ],
      }
    : false,
  sender: { extensions },
}))

function handlePromptClick({ item }: ChatPromptClickPayload) {
  inputTemplate.value = [{ type: 'text', content: item.description || item.label }]
}

async function startNewConversation() {
  await runtime.actions.abort?.()
  await runtime.actions.clearActiveConversation()
  inputTemplate.value = []
}
<\/script>

<template>
  <section class="welcome-prompts-demo">
    <div class="welcome-prompts-demo__controls">
      <label><input v-model="showWelcome" type="checkbox" /> 显示欢迎区</label>
      <label><input v-model="showPrompts" type="checkbox" /> 显示推荐问题</label>
      <button class="welcome-prompts-demo__button" type="button" @click="startNewConversation">返回新会话</button>
    </div>
    <p class="welcome-prompts-demo__tip">点击推荐问题填入输入框，编辑后发送；返回新会话可再次查看欢迎区。</p>
    <div class="welcome-prompts-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" @prompt-click="handlePromptClick" />
    </div>
  </section>
</template>

<style scoped>
.welcome-prompts-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.welcome-prompts-demo__button {
  min-height: 32px;
  padding: 4px 12px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  font: inherit;
  cursor: pointer;
}

.welcome-prompts-demo__tip {
  margin: 12px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.welcome-prompts-demo__chat {
  --tr-layout-height: 100%;
  height: 600px;
}

.welcome-prompts-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
`,z=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type LayoutPreset = 'default' | 'compact' | 'focus' | 'welcome-footer' | 'welcome-center'

const preset = shallowRef<LayoutPreset>('default')
const inputValue = shallowRef('')

const data: ChatUIData = {
  conversation: {
    items: [
      { id: 'review', title: '变更评审' },
      { id: 'release', title: '发布检查' },
    ],
    activeId: 'review',
    title: '变更评审',
  },
  bubble: {
    messages: [
      { id: 'question', role: 'user', content: '这个改动最需要关注什么？' },
      {
        id: 'answer',
        role: 'assistant',
        content: '先确认公开接口是否兼容，再检查错误恢复和窄屏布局。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const emptyData: ChatUIData = {
  conversation: { items: data.conversation?.items, activeId: null, title: '新对话' },
  bubble: { messages: [] },
  sender: { submitDisabled: true },
}

const presets: Record<LayoutPreset, { label: string; description: string; ui: ChatUIOptions }> = {
  default: {
    label: '默认布局',
    description: '保留完整页面区域，内容最大宽度为 980px。',
    ui: {},
  },
  compact: {
    label: '紧凑内容',
    description: '内容最大宽度为 640px；左侧栏默认展开，展开宽度为 240px，收起宽度为 48px。',
    ui: {
      layout: {
        contentMaxWidth: 640,
        panelPadding: 20,
        panelGap: 8,
        leftAside: { width: 240, collapsedWidth: 48, defaultOpen: true },
      },
    },
  },
  focus: {
    label: '专注模式',
    description: '隐藏页头与会话列表，只保留消息和输入区。',
    ui: {
      header: false,
      history: false,
      layout: {
        contentMaxWidth: 720,
        leftAside: false,
      },
    },
  },
  'welcome-footer': {
    label: '空会话：底部输入',
    description: '没有消息时，输入区位于页面底部。',
    ui: {
      layout: {
        composer: { welcome: 'footer' },
      },
    },
  },
  'welcome-center': {
    label: '空会话：居中输入',
    description: '没有消息时，输入区位于欢迎区中央；已有消息时仍位于页面底部。',
    ui: {
      layout: {
        composer: { welcome: 'center' },
      },
    },
  },
}

const presetOptions: LayoutPreset[] = ['default', 'compact', 'focus', 'welcome-footer', 'welcome-center']
const activePreset = computed(() => presets[preset.value])
const activeData = computed(() =>
  preset.value === 'welcome-footer' || preset.value === 'welcome-center' ? emptyData : data,
)
<\/script>

<template>
  <section class="chat-layout-demo">
    <div class="chat-layout-demo__toolbar">
      <button
        v-for="id in presetOptions"
        :key="id"
        type="button"
        :class="{ 'is-active': preset === id }"
        :aria-pressed="preset === id"
        @click="preset = id"
      >
        {{ presets[id].label }}
      </button>
      <span>{{ activePreset.description }}</span>
    </div>

    <TrChatUI
      :key="preset"
      :data="activeData"
      :ui="activePreset.ui"
      :input-value="inputValue"
      @update:input-value="inputValue = $event"
    />
  </section>
</template>

<style scoped>
.chat-layout-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(660px, calc(100vh - 200px));
  min-height: 520px;
}

.chat-layout-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
  background: var(--tr-container-bg-default-2, #f7f8fa);
}

.chat-layout-demo__toolbar button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--tr-color-border, #dcdfe6);
  border-radius: 6px;
  color: var(--tr-text-primary, #252b3a);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.chat-layout-demo__toolbar button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-layout-demo__toolbar button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-layout-demo__toolbar span {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-layout-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}

.chat-layout-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
`,j=JSON.parse('{"title":"界面与交互配置","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat.md","filePath":"suites/chat.md"}'),V={name:"suites/chat.md"},K=Object.assign(V,{setup(Z){const k=h();r(async()=>{k.value=(await l(async()=>{const{default:i}=await import("./chunks/controlled-ui.55Egx0Z2.js");return{default:i}},__vite__mapDeps([0,1,2,3,4]))).default});const A=h();r(async()=>{A.value=(await l(async()=>{const{default:i}=await import("./chunks/responsive-layout.CCkP180N.js");return{default:i}},__vite__mapDeps([5,1,2,3,4]))).default});const m=h();r(async()=>{m.value=(await l(async()=>{const{default:i}=await import("./chunks/floating-layout.DONuCuUR.js");return{default:i}},__vite__mapDeps([6,1,2,3,4]))).default});const g=h();r(async()=>{g.value=(await l(async()=>{const{default:i}=await import("./chunks/right-aside-panel.CWmmyv5Z.js");return{default:i}},__vite__mapDeps([7,1,2,3,4,8]))).default});const B=h();r(async()=>{B.value=(await l(async()=>{const{default:i}=await import("./chunks/slots-basic.CxaKPUDR.js");return{default:i}},__vite__mapDeps([9,1,2,3,4,8]))).default});const y=h();r(async()=>{y.value=(await l(async()=>{const{default:i}=await import("./chunks/history-groups.CzlKaTLn.js");return{default:i}},__vite__mapDeps([10,1,2,3,4,11,12,8]))).default});const D=h();r(async()=>{D.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-error.DaX7P4tO.js");return{default:i}},__vite__mapDeps([13,1,2,3,4]))).default});const b=h();r(async()=>{b.value=(await l(async()=>{const{default:i}=await import("./chunks/bubble-options.BVQ3sv01.js");return{default:i}},__vite__mapDeps([14,2,1,3,4,11,12,8]))).default});const F=h();r(async()=>{F.value=(await l(async()=>{const{default:i}=await import("./chunks/sender-options.CODFefYn.js");return{default:i}},__vite__mapDeps([15,3,2,1,4,11,12,8]))).default});const v=h();r(async()=>{v.value=(await l(async()=>{const{default:i}=await import("./chunks/welcome-prompts.Bct4VhBY.js");return{default:i}},__vite__mapDeps([16,2,3,1,4,11,12,8]))).default});const s=I(!0),f=h();return r(async()=>{f.value=(await l(async()=>{const{default:i}=await import("./chunks/layout-presets.C5QB19OR.js");return{default:i}},__vite__mapDeps([17,1,2,3,4]))).default}),(i,e)=>{const d=_("ClientOnly");return x(),w("div",null,[e[11]||(e[11]=o(`<h1 id="界面与交互配置" tabindex="-1">界面与交互配置 <a class="header-anchor" href="#界面与交互配置" aria-label="Permalink to &quot;界面与交互配置&quot;">​</a></h1><p>本文介绍如何通过 <code>ui</code> 配置和插槽调整 <code>TrChat</code> 的布局、输入区、消息展示及交互，以及如何单独使用界面组件 <code>TrChatUI</code>。首次接入见 <a href="./quick-start.html">快速上手</a>。</p><h2 id="界面配置与定制" tabindex="-1">界面配置与定制 <a class="header-anchor" href="#界面配置与定制" aria-label="Permalink to &quot;界面配置与定制&quot;">​</a></h2><p>按照 <a href="./quick-start.html">快速上手</a> 接入 <code>TrChat</code> 后，可以通过 <code>ui</code> 配置和插槽调整界面。需要直接提供显示数据并自行处理界面事件时，参考<a href="#仅使用界面组件">仅使用界面组件</a>。</p><p><code>ui</code> 是一个界面配置对象，用于设置布局、文案和各区域的显示方式；只需配置需要调整的部分，其余使用默认值。常用的字段如下，具体配置见后续示例：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatUIOptions } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  layout: {},  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 页面布局、侧栏和浮动窗口</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  labels: {},  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 按字段修改界面文案</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  history: {}, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 历史会话列表</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  welcome: {}, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 欢迎区内容</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  prompts: {}, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 推荐问题</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  sender: {},  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 输入区配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: {},  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 消息展示配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>将配置好的 <code>ui</code> 传给 <code>TrChat</code>：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">runtime</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ui</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>下面介绍常用配置和示例，完整字段见 <a href="#界面配置">界面配置</a>。需要自定义界面内容时，见 <a href="#插槽定制">插槽定制</a>。</p><h3 id="基础布局" tabindex="-1">基础布局 <a class="header-anchor" href="#基础布局" aria-label="Permalink to &quot;基础布局&quot;">​</a></h3><p>调整内容宽度、侧栏显示和空会话输入区的位置，适应不同页面布局。</p>`,11)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"基础布局",description:"切换布局，查看侧栏宽度、展开和隐藏，以及空会话输入区的位置变化。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22layout-presets.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Flayout-presets.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatUIData%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cntype%20LayoutPreset%20%3D%20'default'%20%7C%20'compact'%20%7C%20'focus'%20%7C%20'welcome-footer'%20%7C%20'welcome-center'%5Cn%5Cnconst%20preset%20%3D%20shallowRef%3CLayoutPreset%3E('default')%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cn%5Cnconst%20data%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'review'%2C%20title%3A%20'%E5%8F%98%E6%9B%B4%E8%AF%84%E5%AE%A1'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'release'%2C%20title%3A%20'%E5%8F%91%E5%B8%83%E6%A3%80%E6%9F%A5'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20activeId%3A%20'review'%2C%5Cn%20%20%20%20title%3A%20'%E5%8F%98%E6%9B%B4%E8%AF%84%E5%AE%A1'%2C%5Cn%20%20%7D%2C%5Cn%20%20bubble%3A%20%7B%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'question'%2C%20role%3A%20'user'%2C%20content%3A%20'%E8%BF%99%E4%B8%AA%E6%94%B9%E5%8A%A8%E6%9C%80%E9%9C%80%E8%A6%81%E5%85%B3%E6%B3%A8%E4%BB%80%E4%B9%88%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'answer'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%85%88%E7%A1%AE%E8%AE%A4%E5%85%AC%E5%BC%80%E6%8E%A5%E5%8F%A3%E6%98%AF%E5%90%A6%E5%85%BC%E5%AE%B9%EF%BC%8C%E5%86%8D%E6%A3%80%E6%9F%A5%E9%94%99%E8%AF%AF%E6%81%A2%E5%A4%8D%E5%92%8C%E7%AA%84%E5%B1%8F%E5%B8%83%E5%B1%80%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20emptyData%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%20items%3A%20data.conversation%3F.items%2C%20activeId%3A%20null%2C%20title%3A%20'%E6%96%B0%E5%AF%B9%E8%AF%9D'%20%7D%2C%5Cn%20%20bubble%3A%20%7B%20messages%3A%20%5B%5D%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20presets%3A%20Record%3CLayoutPreset%2C%20%7B%20label%3A%20string%3B%20description%3A%20string%3B%20ui%3A%20ChatUIOptions%20%7D%3E%20%3D%20%7B%5Cn%20%20default%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E9%BB%98%E8%AE%A4%E5%B8%83%E5%B1%80'%2C%5Cn%20%20%20%20description%3A%20'%E4%BF%9D%E7%95%99%E5%AE%8C%E6%95%B4%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%8C%E5%86%85%E5%AE%B9%E6%9C%80%E5%A4%A7%E5%AE%BD%E5%BA%A6%E4%B8%BA%20980px%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20compact%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E7%B4%A7%E5%87%91%E5%86%85%E5%AE%B9'%2C%5Cn%20%20%20%20description%3A%20'%E5%86%85%E5%AE%B9%E6%9C%80%E5%A4%A7%E5%AE%BD%E5%BA%A6%E4%B8%BA%20640px%EF%BC%9B%E5%B7%A6%E4%BE%A7%E6%A0%8F%E9%BB%98%E8%AE%A4%E5%B1%95%E5%BC%80%EF%BC%8C%E5%B1%95%E5%BC%80%E5%AE%BD%E5%BA%A6%E4%B8%BA%20240px%EF%BC%8C%E6%94%B6%E8%B5%B7%E5%AE%BD%E5%BA%A6%E4%B8%BA%2048px%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20contentMaxWidth%3A%20640%2C%5Cn%20%20%20%20%20%20%20%20panelPadding%3A%2020%2C%5Cn%20%20%20%20%20%20%20%20panelGap%3A%208%2C%5Cn%20%20%20%20%20%20%20%20leftAside%3A%20%7B%20width%3A%20240%2C%20collapsedWidth%3A%2048%2C%20defaultOpen%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20focus%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E4%B8%93%E6%B3%A8%E6%A8%A1%E5%BC%8F'%2C%5Cn%20%20%20%20description%3A%20'%E9%9A%90%E8%97%8F%E9%A1%B5%E5%A4%B4%E4%B8%8E%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8%EF%BC%8C%E5%8F%AA%E4%BF%9D%E7%95%99%E6%B6%88%E6%81%AF%E5%92%8C%E8%BE%93%E5%85%A5%E5%8C%BA%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20header%3A%20false%2C%5Cn%20%20%20%20%20%20history%3A%20false%2C%5Cn%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20contentMaxWidth%3A%20720%2C%5Cn%20%20%20%20%20%20%20%20leftAside%3A%20false%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20'welcome-footer'%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E7%A9%BA%E4%BC%9A%E8%AF%9D%EF%BC%9A%E5%BA%95%E9%83%A8%E8%BE%93%E5%85%A5'%2C%5Cn%20%20%20%20description%3A%20'%E6%B2%A1%E6%9C%89%E6%B6%88%E6%81%AF%E6%97%B6%EF%BC%8C%E8%BE%93%E5%85%A5%E5%8C%BA%E4%BD%8D%E4%BA%8E%E9%A1%B5%E9%9D%A2%E5%BA%95%E9%83%A8%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20composer%3A%20%7B%20welcome%3A%20'footer'%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20'welcome-center'%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E7%A9%BA%E4%BC%9A%E8%AF%9D%EF%BC%9A%E5%B1%85%E4%B8%AD%E8%BE%93%E5%85%A5'%2C%5Cn%20%20%20%20description%3A%20'%E6%B2%A1%E6%9C%89%E6%B6%88%E6%81%AF%E6%97%B6%EF%BC%8C%E8%BE%93%E5%85%A5%E5%8C%BA%E4%BD%8D%E4%BA%8E%E6%AC%A2%E8%BF%8E%E5%8C%BA%E4%B8%AD%E5%A4%AE%EF%BC%9B%E5%B7%B2%E6%9C%89%E6%B6%88%E6%81%AF%E6%97%B6%E4%BB%8D%E4%BD%8D%E4%BA%8E%E9%A1%B5%E9%9D%A2%E5%BA%95%E9%83%A8%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20composer%3A%20%7B%20welcome%3A%20'center'%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20presetOptions%3A%20LayoutPreset%5B%5D%20%3D%20%5B'default'%2C%20'compact'%2C%20'focus'%2C%20'welcome-footer'%2C%20'welcome-center'%5D%5Cnconst%20activePreset%20%3D%20computed(()%20%3D%3E%20presets%5Bpreset.value%5D)%5Cnconst%20activeData%20%3D%20computed(()%20%3D%3E%5Cn%20%20preset.value%20%3D%3D%3D%20'welcome-footer'%20%7C%7C%20preset.value%20%3D%3D%3D%20'welcome-center'%20%3F%20emptyData%20%3A%20data%2C%5Cn)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-layout-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-layout-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22id%20in%20presetOptions%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22id%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20preset%20%3D%3D%3D%20id%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22preset%20%3D%3D%3D%20id%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22preset%20%3D%20id%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20presets%5Bid%5D.label%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%7B%7B%20activePreset.description%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20%3Akey%3D%5C%22preset%5C%22%5Cn%20%20%20%20%20%20%3Adata%3D%5C%22activeData%5C%22%5Cn%20%20%20%20%20%20%3Aui%3D%5C%22activePreset.ui%5C%22%5Cn%20%20%20%20%20%20%3Ainput-value%3D%5C%22inputValue%5C%22%5Cn%20%20%20%20%20%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%5Cn%20%20%20%20%2F%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-layout-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20height%3A%20min(660px%2C%20calc(100vh%20-%20200px))%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--tr-color-border%2C%20%23e5e6eb)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2%2C%20%23f7f8fa)%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20button.is-active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20span%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{s.value=!1}),vueCode:n(z)},c({_:2},[f.value?{name:"vue",fn:a(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[12]||(e[12]=o(`<blockquote><p>此演示使用 <code>TrChatUI</code> 展示布局效果，相同的 <code>ui</code> 配置也适用于 <code>TrChat</code>。</p></blockquote><p>通过 <code>ui.layout</code> 设置布局，常用字段如下：</p><table tabindex="0"><thead><tr><th>配置</th><th>用途和可选值</th><th>默认值</th></tr></thead><tbody><tr><td><code>contentMaxWidth</code></td><td>消息、欢迎区和输入区的最大内容宽度；支持数字或 CSS 长度，如 <code>640</code>、<code>&#39;80%&#39;</code></td><td><code>980</code>，数字单位为 px</td></tr><tr><td><code>leftAside</code></td><td>左侧栏配置对象；设为 <code>false</code> 隐藏整个左侧栏</td><td>显示侧栏，默认收起</td></tr><tr><td><code>leftAside.width</code></td><td>左侧栏展开宽度，单位为 px</td><td><code>300</code></td></tr><tr><td><code>leftAside.collapsedWidth</code></td><td>左侧栏收起宽度，单位为 px</td><td><code>56</code></td></tr><tr><td><code>leftAside.defaultOpen</code></td><td>是否默认展开，之后可通过界面按钮切换</td><td><code>false</code></td></tr><tr><td><code>composer.welcome</code></td><td>空会话时的输入区位置：<code>&#39;footer&#39;</code> 位于页面底部；<code>&#39;center&#39;</code> 随内置欢迎区居中显示，需保留默认内容布局、欢迎区和输入区</td><td><code>&#39;footer&#39;</code></td></tr></tbody></table><p>例如，缩小内容宽度并默认展开左侧栏：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  layout: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    contentMaxWidth: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">640</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    leftAside: { width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">240</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, collapsedWidth: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">48</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, defaultOpen: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    composer: { welcome: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;center&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><blockquote><p>已有消息或隐藏欢迎区时，输入区仍位于底部。通过插槽自定义主区或空会话内容时，输入区的居中位置需自行设置，详见<a href="#插槽">插槽说明</a>。</p></blockquote><p>完整字段和默认值见 <a href="#layout">布局配置</a>。</p><p>聊天界面默认使用浏览器视口高度。嵌入已有页面时，可将 <code>TrChat</code> 放入高度明确的容器，并设置 <code>--tr-layout-height: 100%</code>，使界面填满该容器。例如，将高度设为 <code>600px</code>：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">main</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;chat-page&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;runtime&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">style</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> scoped</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.chat-page</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-layout-height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="配置欢迎区和推荐问题" tabindex="-1">配置欢迎区和推荐问题 <a class="header-anchor" href="#配置欢迎区和推荐问题" aria-label="Permalink to &quot;配置欢迎区和推荐问题&quot;">​</a></h3><p>设置欢迎内容和推荐问题，帮助用户开始对话。</p>`,11)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"欢迎区和推荐问题",description:"切换欢迎区和推荐问题的显示，点击问题填入输入框，编辑后发送并查看模拟回答。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22welcome-prompts.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fwelcome-prompts.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%2C%20type%20TemplateItem%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20type%20ChatPromptClickPayload%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20useChatCaseRuntime%20%7D%20from%20'.%2Fshared%2FcreateChatRuntime'%5Cn%5Cnconst%20showWelcome%20%3D%20shallowRef(true)%5Cnconst%20showPrompts%20%3D%20shallowRef(true)%5Cnconst%20inputTemplate%20%3D%20shallowRef%3CTemplateItem%5B%5D%3E(%5B%5D)%5Cnconst%20extensions%20%3D%20%5BTrSender.template(inputTemplate)%5D%5Cnconst%20runtime%20%3D%20useChatCaseRuntime(%7B%20storageKey%3A%20'tiny-robot-demo-welcome-prompts-v1'%20%7D)%5Cn%5Cnconst%20ui%20%3D%20computed%3CChatUIOptions%3E(()%20%3D%3E%20(%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%20%7D%2C%5Cn%20%20welcome%3A%20showWelcome.value%20%3F%20%7B%20title%3A%20'%E9%A1%B9%E7%9B%AE%E5%8A%A9%E6%89%8B'%2C%20description%3A%20'%E9%80%89%E6%8B%A9%E4%B8%80%E4%B8%AA%E9%97%AE%E9%A2%98%E5%BC%80%E5%A7%8B%EF%BC%8C%E6%88%96%E8%BE%93%E5%85%A5%E8%87%AA%E5%B7%B1%E7%9A%84%E9%97%AE%E9%A2%98%E3%80%82'%20%7D%20%3A%20false%2C%5Cn%20%20prompts%3A%20showPrompts.value%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20wrap%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'code'%2C%20label%3A%20'%E8%A7%A3%E9%87%8A%E4%BB%A3%E7%A0%81'%2C%20description%3A%20'%E8%AF%B7%E8%A7%A3%E9%87%8A%E8%BF%99%E6%AE%B5%E4%BB%A3%E7%A0%81%E7%9A%84%E4%BD%9C%E7%94%A8%EF%BC%8C%E5%B9%B6%E7%BB%99%E5%87%BA%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'report'%2C%20label%3A%20'%E6%92%B0%E5%86%99%E5%91%A8%E6%8A%A5'%2C%20description%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E6%9C%AC%E5%91%A8%E5%B7%A5%E4%BD%9C%EF%BC%8C%E7%94%9F%E6%88%90%E4%B8%80%E4%BB%BD%E7%AE%80%E6%B4%81%E7%9A%84%E5%91%A8%E6%8A%A5%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'plan'%2C%20label%3A%20'%E5%88%B6%E5%AE%9A%E5%AD%A6%E4%B9%A0%E8%AE%A1%E5%88%92'%2C%20description%3A%20'%E8%AF%B7%E4%B8%BA%20Vue%20%E5%88%9D%E5%AD%A6%E8%80%85%E5%88%B6%E5%AE%9A%E4%B8%80%E4%BB%BD%E4%B8%A4%E5%91%A8%E5%AD%A6%E4%B9%A0%E8%AE%A1%E5%88%92%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20false%2C%5Cn%20%20sender%3A%20%7B%20extensions%20%7D%2C%5Cn%7D))%5Cn%5Cnfunction%20handlePromptClick(%7B%20item%20%7D%3A%20ChatPromptClickPayload)%20%7B%5Cn%20%20inputTemplate.value%20%3D%20%5B%7B%20type%3A%20'text'%2C%20content%3A%20item.description%20%7C%7C%20item.label%20%7D%5D%5Cn%7D%5Cn%5Cnasync%20function%20startNewConversation()%20%7B%5Cn%20%20await%20runtime.actions.abort%3F.()%5Cn%20%20await%20runtime.actions.clearActiveConversation()%5Cn%20%20inputTemplate.value%20%3D%20%5B%5D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22welcome-prompts-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22welcome-prompts-demo__controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Clabel%3E%3Cinput%20v-model%3D%5C%22showWelcome%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%20%E6%98%BE%E7%A4%BA%E6%AC%A2%E8%BF%8E%E5%8C%BA%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Clabel%3E%3Cinput%20v-model%3D%5C%22showPrompts%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%20%E6%98%BE%E7%A4%BA%E6%8E%A8%E8%8D%90%E9%97%AE%E9%A2%98%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22welcome-prompts-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22startNewConversation%5C%22%3E%E8%BF%94%E5%9B%9E%E6%96%B0%E4%BC%9A%E8%AF%9D%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22welcome-prompts-demo__tip%5C%22%3E%E7%82%B9%E5%87%BB%E6%8E%A8%E8%8D%90%E9%97%AE%E9%A2%98%E5%A1%AB%E5%85%A5%E8%BE%93%E5%85%A5%E6%A1%86%EF%BC%8C%E7%BC%96%E8%BE%91%E5%90%8E%E5%8F%91%E9%80%81%EF%BC%9B%E8%BF%94%E5%9B%9E%E6%96%B0%E4%BC%9A%E8%AF%9D%E5%8F%AF%E5%86%8D%E6%AC%A1%E6%9F%A5%E7%9C%8B%E6%AC%A2%E8%BF%8E%E5%8C%BA%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22welcome-prompts-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%40prompt-click%3D%5C%22handlePromptClick%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.welcome-prompts-demo__controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.welcome-prompts-demo__button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%204px%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.welcome-prompts-demo__tip%20%7B%5Cn%20%20margin%3A%2012px%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.welcome-prompts-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20600px%3B%5Cn%7D%5Cn%5Cn.welcome-prompts-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22createChatRuntime.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FcreateChatRuntime.ts%22%2C%22code%22%3A%22import%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20createMockConversationStorage%2C%20type%20MockConversationSeed%20%7D%20from%20'.%2FmockConversationStorage'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2FmodelProviders'%5Cn%5Cnexport%20interface%20ChatCaseRuntimeOptions%20%7B%5Cn%20%20storageKey%3F%3A%20string%5Cn%20%20initialConversations%3F%3A%20readonly%20MockConversationSeed%5B%5D%5Cn%20%20mcpServers%3F%3A%20ChatMcpServers%5Cn%7D%5Cn%5Cnexport%20function%20useChatCaseRuntime(options%3A%20ChatCaseRuntimeOptions)%20%7B%5Cn%20%20const%20initialConversations%20%3D%20options.initialConversations%20%3F%3F%20%5B%5D%5Cn%20%20const%20mcpServers%20%3D%20options.mcpServers%20%3F%3F%20%5B%5D%5Cn%20%20const%20storage%20%3D%20options.storageKey%5Cn%20%20%20%20%3F%20initialConversations.length%5Cn%20%20%20%20%20%20%3F%20createMockConversationStorage(options.storageKey%2C%20initialConversations)%5Cn%20%20%20%20%20%20%3A%20localStorageStrategyFactory(%7B%20key%3A%20options.storageKey%20%7D)%5Cn%20%20%20%20%3A%20undefined%5Cn%5Cn%20%20const%20runtime%3A%20ReturnType%3Ctypeof%20useChatRuntime%3E%20%3D%20useChatRuntime(%7B%5Cn%20%20%20%20mcpServers%2C%5Cn%20%20%20%20modelProviders%2C%5Cn%20%20%20%20conversation%3A%5Cn%20%20%20%20%20%20options.storageKey%20%7C%7C%20initialConversations.length%5Cn%20%20%20%20%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20...(storage%20%3F%20%7B%20storage%20%7D%20%3A%20%7B%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20onLoad%3A%20(conversations)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!runtime)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(conversations.length)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(conversations%5B0%5D.id)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(options.storageKey%20%7C%7C%20!initialConversations.length)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20firstConversationId%3A%20string%20%7C%20undefined%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20(const%20item%20of%20initialConversations)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20seedConversation%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3A%20item.title%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metadata%3A%20item.metadata%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20useMessageOptions%3A%20%7B%20initialMessages%3A%20%5B...item.messages%5D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.createConversation(seedConversation)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20firstConversationId%20%3F%3F%3D%20runtime.conversations.value%5B0%5D%3F.id%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(firstConversationId)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(firstConversationId)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%3A%20undefined%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20runtime%5Cn%7D%5Cn%22%7D%2C%22mockConversationStorage.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmockConversationStorage.ts%22%2C%22code%22%3A%22import%20%7B%5Cn%20%20localStorageStrategyFactory%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20interface%20MockConversationSeed%20%7B%5Cn%20%20title%3A%20string%5Cn%20%20metadata%3F%3A%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20messages%3A%20readonly%20ChatMessage%5B%5D%5Cn%7D%5Cn%5Cnexport%20function%20createMockConversationStorage(%5Cn%20%20storageKey%3A%20string%2C%5Cn%20%20seeds%3A%20readonly%20MockConversationSeed%5B%5D%2C%5Cn)%3A%20ConversationStorageStrategy%20%7B%5Cn%20%20const%20storage%20%3D%20localStorageStrategyFactory(%7B%20key%3A%20storageKey%20%7D)%5Cn%20%20const%20initializedKey%20%3D%20%60%24%7BstorageKey%7D%3Ainitialized%60%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20async%20loadConversations()%20%7B%5Cn%20%20%20%20%20%20const%20conversations%20%3D%20await%20storage.loadConversations()%5Cn%20%20%20%20%20%20let%20initialized%3A%20string%20%7C%20null%20%3D%20null%5Cn%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20initialized%20%3D%20localStorage.getItem(initializedKey)%5Cn%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20markInitialized%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20localStorage.setItem(initializedKey%2C%20'true')%5Cn%20%20%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20The%20marker%20is%20best%20effort.%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(conversations.length%20%26%26%20!initialized)%20%7B%5Cn%20%20%20%20%20%20%20%20markInitialized()%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(initialized%20%7C%7C%20conversations.length%20%7C%7C%20!seeds.length)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20now%20%3D%20Date.now()%5Cn%20%20%20%20%20%20const%20seededConversations%3A%20ConversationInfo%5B%5D%20%3D%20seeds.map((seed%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20%60tiny-robot-mock-conversation-%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20%20%20%20%20%20%20title%3A%20seed.title%2C%5Cn%20%20%20%20%20%20%20%20createdAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20updatedAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20metadata%3A%20seed.metadata%2C%5Cn%20%20%20%20%20%20%7D))%5Cn%5Cn%20%20%20%20%20%20for%20(const%20%5Bindex%2C%20conversation%5D%20of%20seededConversations.entries())%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.saveConversation(conversation)%5Cn%20%20%20%20%20%20%20%20await%20storage.saveMessages(conversation.id%2C%20%5B...seeds%5Bindex%5D.messages%5D)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20markInitialized()%5Cn%5Cn%20%20%20%20%20%20return%20seededConversations%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20storage.loadMessages(conversationId)%2C%5Cn%20%20%20%20saveConversation%3A%20(conversation)%20%3D%3E%20storage.saveConversation(conversation)%2C%5Cn%20%20%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20storage.saveMessages(conversationId%2C%20messages)%2C%5Cn%20%20%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20storage.deleteConversation%3F.(conversationId)%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{s.value=!1}),vueCode:n(W)},c({_:2},[v.value?{name:"vue",fn:a(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[13]||(e[13]=o(`<p>没有消息时，通过 <code>ui.welcome</code> 设置欢迎标题和描述，通过 <code>ui.prompts</code> 提供推荐问题，帮助用户开始对话。</p><table tabindex="0"><thead><tr><th>配置</th><th>用途</th><th>默认值</th></tr></thead><tbody><tr><td><code>welcome.title</code></td><td>欢迎标题，类型为 <code>string</code></td><td><code>&#39;TinyRobot AI 助手&#39;</code></td></tr><tr><td><code>welcome.description</code></td><td>欢迎描述，类型为 <code>string</code></td><td><code>&#39;您好，我是TinyRobot，您专属的 AI 智能专家&#39;</code></td></tr><tr><td><code>prompts.items</code></td><td>推荐问题数组；每项的 <code>label</code> 为必填显示文字，<code>description</code> 为可选补充说明</td><td><code>[]</code>，不显示推荐问题</td></tr><tr><td><code>prompts.wrap</code></td><td>是否允许推荐问题换行，类型为 <code>boolean</code></td><td><code>false</code></td></tr></tbody></table><p>例如，设置项目助手的欢迎内容和两个推荐问题：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  welcome: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;项目助手&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;选择一个问题开始，或输入自己的问题。&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  prompts: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    wrap: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    items: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      { label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;解释代码&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;请解释这段代码的作用，并给出使用建议。&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      { label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;撰写周报&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;请帮我整理本周工作，生成一份简洁的周报。&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>点击推荐问题会触发 <code>prompt-click</code>，不会自动填入或发送。下面使用 Sender 的模板扩展将问题填入输入框，用户可编辑后发送：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { shallowRef } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrSender, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TemplateItem } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatPromptClickPayload } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> inputTemplate</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">TemplateItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;([])</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui.sender </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { extensions: [TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(inputTemplate)] }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> handlePromptClick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatPromptClickPayload</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  inputTemplate.value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [{ type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;text&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, content: item.description </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> item.label }]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">runtime</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ui</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">prompt-click</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">handlePromptClick</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>将 <code>ui.welcome</code> 或 <code>ui.prompts</code> 设为 <code>false</code> 可隐藏对应区域。发送首条消息后不再显示欢迎内容；返回新会话可重新查看。</p><p>更多展示配置见 <a href="./../components/welcome.html#props">Welcome</a> 和 <a href="./../components/prompts.html#props">Prompts</a>。</p><h3 id="配置输入区" tabindex="-1">配置输入区 <a class="header-anchor" href="#配置输入区" aria-label="Permalink to &quot;配置输入区&quot;">​</a></h3><p>为输入框添加提及、可编辑模板和自定义按钮，满足不同输入需求。</p>`,11)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"输入扩展与自定义按钮",description:"输入 @ 选择对象，使用报告模板和常用问题按钮填入内容，编辑后发送；点击“使用说明”查看操作提示。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22sender-options.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fsender-options.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrSender%2C%20type%20MentionItem%2C%20type%20TemplateItem%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20useChatCaseRuntime%20%7D%20from%20'.%2Fshared%2FcreateChatRuntime'%5Cn%5Cnconst%20showHelp%20%3D%20shallowRef(false)%5Cnconst%20currentTemplate%20%3D%20shallowRef%3CTemplateItem%5B%5D%3E(%5B%5D)%5Cnconst%20mentions%3A%20MentionItem%5B%5D%20%3D%20%5B%5Cn%20%20%7B%20label%3A%20'%E4%BA%A7%E5%93%81%E7%BB%84'%2C%20value%3A%20'product'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'%E7%A0%94%E5%8F%91%E7%BB%84'%2C%20value%3A%20'engineering'%20%7D%2C%5Cn%20%20%7B%20label%3A%20'%E6%B5%8B%E8%AF%95%E7%BB%84'%2C%20value%3A%20'qa'%20%7D%2C%5Cn%5D%5Cnconst%20extensions%20%3D%20%5BTrSender.mention(mentions)%2C%20TrSender.template(currentTemplate)%5D%5Cnconst%20runtime%20%3D%20useChatCaseRuntime(%7B%20storageKey%3A%20'tiny-robot-demo-sender-options-v1'%20%7D)%5Cnconst%20inputDisabled%20%3D%20computed(()%20%3D%3E%5Cn%20%20Boolean(runtime.composer.disabled%3F.value%20%7C%7C%20runtime.composer.submitDisabled%3F.value)%2C%5Cn)%5Cn%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%20%7D%2C%5Cn%20%20welcome%3A%20%7B%20title%3A%20'%E8%BE%93%E5%85%A5%E5%8C%BA%E9%85%8D%E7%BD%AE'%2C%20description%3A%20'%E8%BE%93%E5%85%A5%20%40%20%E9%80%89%E6%8B%A9%E5%AF%B9%E8%B1%A1%EF%BC%8C%E6%88%96%E4%BD%BF%E7%94%A8%E4%B8%8B%E6%96%B9%E6%8C%89%E9%92%AE%E5%A1%AB%E5%85%A5%E5%86%85%E5%AE%B9%E3%80%82'%20%7D%2C%5Cn%20%20sender%3A%20%7B%5Cn%20%20%20%20placeholder%3A%20'%E8%BE%93%E5%85%A5%20%40%20%E9%80%89%E6%8B%A9%E5%AF%B9%E8%B1%A1%EF%BC%8C%E6%88%96%E7%82%B9%E5%87%BB%E2%80%9C%E5%86%99%E6%8A%A5%E5%91%8A%E2%80%9D%E6%8F%92%E5%85%A5%E6%A8%A1%E6%9D%BF...'%2C%5Cn%20%20%20%20mode%3A%20'multiple'%2C%5Cn%20%20%20%20maxLength%3A%20300%2C%5Cn%20%20%20%20showWordLimit%3A%20true%2C%5Cn%20%20%20%20clearable%3A%20true%2C%5Cn%20%20%20%20extensions%2C%5Cn%20%20%20%20defaultActions%3A%20%7B%5Cn%20%20%20%20%20%20submit%3A%20%7B%20tooltip%3A%20'%E5%8F%91%E9%80%81%E7%BB%99%E9%A1%B9%E7%9B%AE%E5%8A%A9%E6%89%8B'%20%7D%2C%5Cn%20%20%20%20%20%20clear%3A%20%7B%20tooltip%3A%20'%E6%B8%85%E7%A9%BA%E8%BE%93%E5%85%A5%E5%86%85%E5%AE%B9'%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnfunction%20fillReportTemplate()%20%7B%5Cn%20%20currentTemplate.value%20%3D%20%5B%5Cn%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%B8%AE%E6%88%91%E5%86%99%E4%B8%80%E4%BB%BD%E5%85%B3%E4%BA%8E'%20%7D%2C%5Cn%20%20%20%20%7B%20type%3A%20'block'%2C%20content%3A%20'%E9%A1%B9%E7%9B%AE%E8%BF%9B%E5%B1%95'%20%7D%2C%5Cn%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E7%9A%84%E6%8A%A5%E5%91%8A%EF%BC%8C%E9%9D%A2%E5%90%91'%20%7D%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20type%3A%20'select'%2C%5Cn%20%20%20%20%20%20content%3A%20''%2C%5Cn%20%20%20%20%20%20placeholder%3A%20'%E9%80%89%E6%8B%A9%E8%AF%BB%E8%80%85'%2C%5Cn%20%20%20%20%20%20options%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20label%3A%20'%E9%A1%B9%E7%9B%AE%E6%88%90%E5%91%98'%2C%20value%3A%20'%E9%A1%B9%E7%9B%AE%E6%88%90%E5%91%98'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%20label%3A%20'%E9%A1%B9%E7%9B%AE%E8%B4%9F%E8%B4%A3%E4%BA%BA'%2C%20value%3A%20'%E9%A1%B9%E7%9B%AE%E8%B4%9F%E8%B4%A3%E4%BA%BA'%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%EF%BC%8C%E9%87%8D%E7%82%B9%E8%AF%B4%E6%98%8E'%20%7D%2C%5Cn%20%20%20%20%7B%20type%3A%20'block'%2C%20content%3A%20'%E5%B7%B2%E5%AE%8C%E6%88%90%E5%B7%A5%E4%BD%9C%E5%92%8C%E4%B8%8B%E4%B8%80%E6%AD%A5%E8%AE%A1%E5%88%92'%20%7D%2C%5Cn%20%20%20%20%7B%20type%3A%20'text'%2C%20content%3A%20'%E3%80%82'%20%7D%2C%5Cn%20%20%5D%5Cn%7D%5Cn%5Cnfunction%20fillCommonQuestion()%20%7B%5Cn%20%20currentTemplate.value%20%3D%20%5B%7B%20type%3A%20'text'%2C%20content%3A%20'%E8%AF%B7%E5%88%97%E5%87%BA%E9%A1%B9%E7%9B%AE%E5%91%A8%E6%8A%A5%E4%B8%AD%E9%9C%80%E8%A6%81%E5%8C%85%E5%90%AB%E7%9A%84%E5%86%85%E5%AE%B9%E3%80%82'%20%7D%5D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22sender-options-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22sender-options-demo__tip%5C%22%3E%5Cn%20%20%20%20%20%20%E8%BE%93%E5%85%A5%20%40%20%E9%80%89%E6%8B%A9%E5%AF%B9%E8%B1%A1%EF%BC%9B%E7%82%B9%E5%87%BB%E2%80%9C%E5%86%99%E6%8A%A5%E5%91%8A%E2%80%9D%E7%BC%96%E8%BE%91%E6%A8%A1%E6%9D%BF%E5%AD%97%E6%AE%B5%EF%BC%9B%E7%82%B9%E5%87%BB%E2%80%9C%E5%B8%B8%E7%94%A8%E9%97%AE%E9%A2%98%E2%80%9D%E5%A1%AB%E5%85%A5%E6%96%87%E6%9C%AC%E3%80%82%E6%89%80%E6%9C%89%E5%86%85%E5%AE%B9%E5%9D%87%E5%8F%AF%E7%BC%96%E8%BE%91%E5%90%8E%E5%8F%91%E9%80%81%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22sender-options-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20v-if%3D%5C%22showHelp%5C%22%20%23sender-header%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cp%20id%3D%5C%22sender-options-help%5C%22%20class%3D%5C%22sender-options-demo__help%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40%20%E7%94%A8%E4%BA%8E%E6%8F%92%E5%85%A5%E5%AF%B9%E8%B1%A1%E5%90%8D%E7%A7%B0%EF%BC%8C%E4%B8%8D%E4%BC%9A%E5%88%87%E6%8D%A2%E6%A8%A1%E5%9E%8B%EF%BC%9B%E6%A8%A1%E6%9D%BF%E4%B8%AD%E7%9A%84%E6%96%87%E6%9C%AC%E5%9D%97%E5%8F%AF%E4%BB%A5%E7%BC%96%E8%BE%91%EF%BC%8C%E4%B8%8B%E6%8B%89%E5%AD%97%E6%AE%B5%E5%8F%AF%E4%BB%A5%E9%80%89%E6%8B%A9%E3%80%82%E5%86%85%E5%AE%B9%E8%B6%85%E8%BF%87%20300%20%E5%AD%97%E6%97%B6%E6%97%A0%E6%B3%95%E6%8F%90%E4%BA%A4%E3%80%82%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23sender-footer%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22sender-options-demo__actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22sender-options-demo__button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Adisabled%3D%5C%22inputDisabled%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22fillReportTemplate%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E5%86%99%E6%8A%A5%E5%91%8A%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22sender-options-demo__button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Adisabled%3D%5C%22inputDisabled%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22fillCommonQuestion%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E5%B8%B8%E7%94%A8%E9%97%AE%E9%A2%98%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23sender-footer-right%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22sender-options-demo__button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aaria-expanded%3D%5C%22showHelp%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20aria-controls%3D%5C%22sender-options-help%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22showHelp%20%3D%20!showHelp%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3C%2FTrChat%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.sender-options-demo__tip%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20640px%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%206px%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__button%20%7B%5Cn%20%20min-height%3A%2030px%3B%5Cn%20%20padding%3A%204px%208px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default)%3B%5Cn%20%20border-radius%3A%2016px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20white-space%3A%20nowrap%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__button%3Adisabled%20%7B%5Cn%20%20cursor%3A%20not-allowed%3B%5Cn%20%20opacity%3A%200.5%3B%5Cn%7D%5Cn%5Cn.sender-options-demo__help%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22createChatRuntime.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FcreateChatRuntime.ts%22%2C%22code%22%3A%22import%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20createMockConversationStorage%2C%20type%20MockConversationSeed%20%7D%20from%20'.%2FmockConversationStorage'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2FmodelProviders'%5Cn%5Cnexport%20interface%20ChatCaseRuntimeOptions%20%7B%5Cn%20%20storageKey%3F%3A%20string%5Cn%20%20initialConversations%3F%3A%20readonly%20MockConversationSeed%5B%5D%5Cn%20%20mcpServers%3F%3A%20ChatMcpServers%5Cn%7D%5Cn%5Cnexport%20function%20useChatCaseRuntime(options%3A%20ChatCaseRuntimeOptions)%20%7B%5Cn%20%20const%20initialConversations%20%3D%20options.initialConversations%20%3F%3F%20%5B%5D%5Cn%20%20const%20mcpServers%20%3D%20options.mcpServers%20%3F%3F%20%5B%5D%5Cn%20%20const%20storage%20%3D%20options.storageKey%5Cn%20%20%20%20%3F%20initialConversations.length%5Cn%20%20%20%20%20%20%3F%20createMockConversationStorage(options.storageKey%2C%20initialConversations)%5Cn%20%20%20%20%20%20%3A%20localStorageStrategyFactory(%7B%20key%3A%20options.storageKey%20%7D)%5Cn%20%20%20%20%3A%20undefined%5Cn%5Cn%20%20const%20runtime%3A%20ReturnType%3Ctypeof%20useChatRuntime%3E%20%3D%20useChatRuntime(%7B%5Cn%20%20%20%20mcpServers%2C%5Cn%20%20%20%20modelProviders%2C%5Cn%20%20%20%20conversation%3A%5Cn%20%20%20%20%20%20options.storageKey%20%7C%7C%20initialConversations.length%5Cn%20%20%20%20%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20...(storage%20%3F%20%7B%20storage%20%7D%20%3A%20%7B%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20onLoad%3A%20(conversations)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!runtime)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(conversations.length)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(conversations%5B0%5D.id)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(options.storageKey%20%7C%7C%20!initialConversations.length)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20firstConversationId%3A%20string%20%7C%20undefined%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20(const%20item%20of%20initialConversations)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20seedConversation%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3A%20item.title%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metadata%3A%20item.metadata%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20useMessageOptions%3A%20%7B%20initialMessages%3A%20%5B...item.messages%5D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.createConversation(seedConversation)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20firstConversationId%20%3F%3F%3D%20runtime.conversations.value%5B0%5D%3F.id%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(firstConversationId)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(firstConversationId)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%3A%20undefined%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20runtime%5Cn%7D%5Cn%22%7D%2C%22mockConversationStorage.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmockConversationStorage.ts%22%2C%22code%22%3A%22import%20%7B%5Cn%20%20localStorageStrategyFactory%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20interface%20MockConversationSeed%20%7B%5Cn%20%20title%3A%20string%5Cn%20%20metadata%3F%3A%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20messages%3A%20readonly%20ChatMessage%5B%5D%5Cn%7D%5Cn%5Cnexport%20function%20createMockConversationStorage(%5Cn%20%20storageKey%3A%20string%2C%5Cn%20%20seeds%3A%20readonly%20MockConversationSeed%5B%5D%2C%5Cn)%3A%20ConversationStorageStrategy%20%7B%5Cn%20%20const%20storage%20%3D%20localStorageStrategyFactory(%7B%20key%3A%20storageKey%20%7D)%5Cn%20%20const%20initializedKey%20%3D%20%60%24%7BstorageKey%7D%3Ainitialized%60%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20async%20loadConversations()%20%7B%5Cn%20%20%20%20%20%20const%20conversations%20%3D%20await%20storage.loadConversations()%5Cn%20%20%20%20%20%20let%20initialized%3A%20string%20%7C%20null%20%3D%20null%5Cn%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20initialized%20%3D%20localStorage.getItem(initializedKey)%5Cn%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20markInitialized%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20localStorage.setItem(initializedKey%2C%20'true')%5Cn%20%20%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20The%20marker%20is%20best%20effort.%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(conversations.length%20%26%26%20!initialized)%20%7B%5Cn%20%20%20%20%20%20%20%20markInitialized()%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(initialized%20%7C%7C%20conversations.length%20%7C%7C%20!seeds.length)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20now%20%3D%20Date.now()%5Cn%20%20%20%20%20%20const%20seededConversations%3A%20ConversationInfo%5B%5D%20%3D%20seeds.map((seed%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20%60tiny-robot-mock-conversation-%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20%20%20%20%20%20%20title%3A%20seed.title%2C%5Cn%20%20%20%20%20%20%20%20createdAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20updatedAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20metadata%3A%20seed.metadata%2C%5Cn%20%20%20%20%20%20%7D))%5Cn%5Cn%20%20%20%20%20%20for%20(const%20%5Bindex%2C%20conversation%5D%20of%20seededConversations.entries())%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.saveConversation(conversation)%5Cn%20%20%20%20%20%20%20%20await%20storage.saveMessages(conversation.id%2C%20%5B...seeds%5Bindex%5D.messages%5D)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20markInitialized()%5Cn%5Cn%20%20%20%20%20%20return%20seededConversations%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20storage.loadMessages(conversationId)%2C%5Cn%20%20%20%20saveConversation%3A%20(conversation)%20%3D%3E%20storage.saveConversation(conversation)%2C%5Cn%20%20%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20storage.saveMessages(conversationId%2C%20messages)%2C%5Cn%20%20%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20storage.deleteConversation%3F.(conversationId)%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{s.value=!1}),vueCode:n(U)},c({_:2},[F.value?{name:"vue",fn:a(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[14]||(e[14]=o(`<p>示例通过 <code>sender-header</code> 展示使用说明；“写报告”填入可编辑文本块和读者选项，“常用问题”填入预设问题。</p><p>通过 <code>ui.sender</code> 调整输入框、配置提及和模板功能；通过输入区插槽添加自定义按钮，无需重新实现消息发送和取消。</p><h4 id="基础设置" tabindex="-1">基础设置 <a class="header-anchor" href="#基础设置" aria-label="Permalink to &quot;基础设置&quot;">​</a></h4><p>以下默认值为 Chat 的输入区配置，与单独使用 Sender 时不同：</p><table tabindex="0"><thead><tr><th>配置</th><th>用途和可选值</th><th>默认值</th></tr></thead><tbody><tr><td><code>placeholder</code></td><td>输入框为空时的提示，类型为 <code>string</code></td><td>未发送时为 <code>&#39;请输入你的问题...&#39;</code>，发送中为 <code>&#39;思考中...&#39;</code></td></tr><tr><td><code>mode</code></td><td><code>&#39;single&#39;</code> 单行、<code>&#39;multiple&#39;</code> 多行</td><td><code>&#39;multiple&#39;</code></td></tr><tr><td><code>maxLength</code></td><td>最大输入字数，类型为 <code>number</code>；超出后保留内容，但无法提交</td><td><code>1000</code></td></tr><tr><td><code>showWordLimit</code></td><td>是否显示字数统计，类型为 <code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>clearable</code></td><td>有内容时是否显示清空按钮，类型为 <code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>defaultActions</code></td><td>配置默认发送和清空按钮的提示等选项</td><td>沿用内置按钮配置</td></tr><tr><td><code>extensions</code></td><td>输入扩展数组，如提及、模板和联想</td><td><code>[]</code></td></tr></tbody></table><p>例如，限制为 300 字并修改按钮提示：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  sender: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    placeholder: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;请输入问题，最多 300 字...&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    showWordLimit: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    defaultActions: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      submit: { tooltip: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;发送给项目助手&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      clear: { tooltip: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;清空输入内容&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>输入值、发送中状态和禁用状态由 Chat 管理，不在 <code>ui.sender</code> 中设置。需要禁止输入或提交时，见 <a href="./chat-runtime.html#禁用输入与提交">禁用输入与提交</a>。</p><h4 id="提及与模板" tabindex="-1">提及与模板 <a class="header-anchor" href="#提及与模板" aria-label="Permalink to &quot;提及与模板&quot;">​</a></h4><p><code>TrSender.mention()</code> 为输入框提供提及选择，默认输入 <code>@</code> 触发；<code>TrSender.template()</code> 用于填入包含可编辑字段的模板。将它们放入 <code>ui.sender.extensions</code> 即可在 <code>TrChat</code> 中使用，默认不启用这些扩展。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { shallowRef } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrSender, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MentionItem, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TemplateItem } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> mentions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MentionItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;产品组&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, value: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;product&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;研发组&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, value: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;engineering&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> currentTemplate</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">TemplateItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;([])</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui.sender </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui.sender,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  extensions: [TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mention</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mentions), TrSender.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(currentTemplate)],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fillReportTemplate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  currentTemplate.value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;text&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;请帮我写一份关于&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;block&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;项目进展&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;text&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, content: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;的报告。&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>提及项中的 <code>label</code> 是显示名称，<code>value</code> 是对应标识；模板中的 <code>&#39;text&#39;</code> 为普通文本，<code>&#39;block&#39;</code> 为可编辑字段。更新 <code>currentTemplate</code> 会替换输入框内容。</p><blockquote><p>提及功能不会自动切换模型或助手。默认发送使用输入内容的纯文本；需要处理提及标识或模板字段时，见 <a href="./../components/sender.html#结构化数据">结构化提交数据</a> 和 <a href="./chat-runtime.html#发送前检查">发送前检查</a>。</p></blockquote><h4 id="自定义按钮" tabindex="-1">自定义按钮 <a class="header-anchor" href="#自定义按钮" aria-label="Permalink to &quot;自定义按钮&quot;">​</a></h4><p><code>sender-footer</code> 在多行输入框底部左侧添加按钮，与模型选择等操作同一区域；<code>sender-footer-right</code> 在底部右侧、默认操作按钮前添加内容。这些插槽默认没有自定义内容，使用时不会替换发送和取消按钮。</p><p>例如，通过按钮插入上面配置的报告模板：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">runtime</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ui</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;template #sender-footer&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;button type=&quot;button&quot; @click=&quot;fillReportTemplate&quot;&gt;写报告&lt;/button&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/template&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>更多配置见 <a href="./../components/sender.html#mention-配置">Mention</a>、<a href="./../components/sender.html#template-配置">Template</a> 和 <a href="./../components/sender.html#默认按钮配置">默认按钮配置</a>，完整插槽列表见 <a href="#插槽">插槽</a>。</p><h3 id="配置消息展示" tabindex="-1">配置消息展示 <a class="header-anchor" href="#配置消息展示" aria-label="Permalink to &quot;配置消息展示&quot;">​</a></h3><p>通过 <code>ui.bubble</code> 调整消息展示：<code>bubbleList</code> 设置消息列表外观，<code>bubbleProvider</code> 设置内容渲染和错误提示，<code>autoScroll</code> 控制自动滚动（默认 <code>true</code>）；未配置时使用默认展示方式。</p><h4 id="消息外观" tabindex="-1">消息外观 <a class="header-anchor" href="#消息外观" aria-label="Permalink to &quot;消息外观&quot;">​</a></h4><p>按消息角色设置头像、位置和气泡形状，区分用户消息与 AI 回答。</p>`,22)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"按角色定制消息外观",description:"切换默认和自定义外观，比较用户与 AI 消息的头像和气泡形状；预设回答包含 Markdown 内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22bubble-options.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbubble-options.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20h%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20useChatCaseRuntime%20%7D%20from%20'.%2Fshared%2FcreateChatRuntime'%5Cn%5Cnconst%20customAppearance%20%3D%20shallowRef(true)%5Cnconst%20userAvatar%20%3D%20h('span'%2C%20%7B%20class%3A%20'bubble-options-demo__avatar%20bubble-options-demo__avatar--user'%20%7D%2C%20'%E6%88%91')%5Cnconst%20assistantAvatar%20%3D%20h('span'%2C%20%7B%20class%3A%20'bubble-options-demo__avatar%20bubble-options-demo__avatar--assistant'%20%7D%2C%20'AI')%5Cnconst%20runtime%20%3D%20useChatCaseRuntime(%7B%5Cn%20%20storageKey%3A%20'tiny-robot-demo-bubble-options-v1'%2C%5Cn%20%20initialConversations%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20title%3A%20'%E6%B6%88%E6%81%AF%E5%A4%96%E8%A7%82%E9%85%8D%E7%BD%AE'%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20role%3A%20'user'%2C%20content%3A%20'%E5%A6%82%E4%BD%95%E5%AE%9A%E5%88%B6%E8%81%8A%E5%A4%A9%E6%B6%88%E6%81%AF%E7%9A%84%E5%A4%96%E8%A7%82%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%5Cn%20%20%20%20%20%20%20%20%20%20%20%20'**%E5%8F%AF%E4%BB%A5%E6%8C%89%E8%A7%92%E8%89%B2%E5%88%86%E5%88%AB%E9%85%8D%E7%BD%AE%EF%BC%9A**%5C%5Cn%5C%5Cn-%20%E7%94%A8%E6%88%B7%E6%B6%88%E6%81%AF%E6%98%BE%E7%A4%BA%E5%9C%A8%E5%8F%B3%E4%BE%A7%EF%BC%8C%E4%BD%BF%E7%94%A8%E5%9C%86%E8%A7%92%E6%B0%94%E6%B3%A1%E3%80%82%5C%5Cn-%20AI%20%E5%9B%9E%E7%AD%94%E6%98%BE%E7%A4%BA%E5%9C%A8%E5%B7%A6%E4%BE%A7%EF%BC%8C%E4%B8%8D%E4%BD%BF%E7%94%A8%E6%B0%94%E6%B3%A1%E6%A1%86%E3%80%82%5C%5Cn%5C%5Cn%E5%88%87%E6%8D%A2%E4%B8%8A%E6%96%B9%E9%80%89%E9%A1%B9%EF%BC%8C%E5%8F%AF%E6%AF%94%E8%BE%83%E9%BB%98%E8%AE%A4%E5%A4%96%E8%A7%82%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnconst%20ui%20%3D%20computed%3CChatUIOptions%3E(()%20%3D%3E%20(%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%20%7D%2C%5Cn%20%20bubble%3A%20customAppearance.value%5Cn%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20bubbleList%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20roleConfigs%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%2C%20shape%3A%20'rounded'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20assistantAvatar%2C%20shape%3A%20'none'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3A%20%7B%7D%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22bubble-options-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22bubble-options-demo__controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Clabel%3E%3Cinput%20v-model%3D%5C%22customAppearance%5C%22%20type%3D%5C%22radio%5C%22%20%3Avalue%3D%5C%22false%5C%22%20%2F%3E%20%E9%BB%98%E8%AE%A4%E5%A4%96%E8%A7%82%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Clabel%3E%3Cinput%20v-model%3D%5C%22customAppearance%5C%22%20type%3D%5C%22radio%5C%22%20%3Avalue%3D%5C%22true%5C%22%20%2F%3E%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%A4%96%E8%A7%82%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22bubble-options-demo__tip%5C%22%3E%E6%AF%94%E8%BE%83%E5%A4%B4%E5%83%8F%E5%92%8C%E6%B0%94%E6%B3%A1%E5%A4%96%E8%A7%82%EF%BC%9B%E7%BB%A7%E7%BB%AD%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%EF%BC%8C%E6%96%B0%E6%B6%88%E6%81%AF%E4%BC%9A%E6%B2%BF%E7%94%A8%E5%BD%93%E5%89%8D%E9%85%8D%E7%BD%AE%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22bubble-options-demo__chat%5C%22%20%3Aclass%3D%5C%22%7B%20'bubble-options-demo__chat--custom'%3A%20customAppearance%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.bubble-options-demo__controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__tip%20%7B%5Cn%20%20margin%3A%2012px%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20600px%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__chat%20%3Adeep(.bubble-options-demo__avatar)%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20width%3A%2032px%3B%5Cn%20%20height%3A%2032px%3B%5Cn%20%20border-radius%3A%2050%25%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__chat%20%3Adeep(.bubble-options-demo__avatar--user)%20%7B%5Cn%20%20color%3A%20%233964fe%3B%5Cn%20%20background%3A%20%23e4edfd%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__chat%20%3Adeep(.bubble-options-demo__avatar--assistant)%20%7B%5Cn%20%20color%3A%20%23087f5b%3B%5Cn%20%20background%3A%20%23d3f9d8%3B%5Cn%7D%5Cn%5Cn.bubble-options-demo__chat--custom%20%3Adeep(%5Bdata-box-type%3D'box'%5D%5Bdata-role%3D'assistant'%5D)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20transparent%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22createChatRuntime.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FcreateChatRuntime.ts%22%2C%22code%22%3A%22import%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20createMockConversationStorage%2C%20type%20MockConversationSeed%20%7D%20from%20'.%2FmockConversationStorage'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2FmodelProviders'%5Cn%5Cnexport%20interface%20ChatCaseRuntimeOptions%20%7B%5Cn%20%20storageKey%3F%3A%20string%5Cn%20%20initialConversations%3F%3A%20readonly%20MockConversationSeed%5B%5D%5Cn%20%20mcpServers%3F%3A%20ChatMcpServers%5Cn%7D%5Cn%5Cnexport%20function%20useChatCaseRuntime(options%3A%20ChatCaseRuntimeOptions)%20%7B%5Cn%20%20const%20initialConversations%20%3D%20options.initialConversations%20%3F%3F%20%5B%5D%5Cn%20%20const%20mcpServers%20%3D%20options.mcpServers%20%3F%3F%20%5B%5D%5Cn%20%20const%20storage%20%3D%20options.storageKey%5Cn%20%20%20%20%3F%20initialConversations.length%5Cn%20%20%20%20%20%20%3F%20createMockConversationStorage(options.storageKey%2C%20initialConversations)%5Cn%20%20%20%20%20%20%3A%20localStorageStrategyFactory(%7B%20key%3A%20options.storageKey%20%7D)%5Cn%20%20%20%20%3A%20undefined%5Cn%5Cn%20%20const%20runtime%3A%20ReturnType%3Ctypeof%20useChatRuntime%3E%20%3D%20useChatRuntime(%7B%5Cn%20%20%20%20mcpServers%2C%5Cn%20%20%20%20modelProviders%2C%5Cn%20%20%20%20conversation%3A%5Cn%20%20%20%20%20%20options.storageKey%20%7C%7C%20initialConversations.length%5Cn%20%20%20%20%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20...(storage%20%3F%20%7B%20storage%20%7D%20%3A%20%7B%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20onLoad%3A%20(conversations)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!runtime)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(conversations.length)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(conversations%5B0%5D.id)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(options.storageKey%20%7C%7C%20!initialConversations.length)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20firstConversationId%3A%20string%20%7C%20undefined%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20(const%20item%20of%20initialConversations)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20seedConversation%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3A%20item.title%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metadata%3A%20item.metadata%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20useMessageOptions%3A%20%7B%20initialMessages%3A%20%5B...item.messages%5D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.createConversation(seedConversation)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20firstConversationId%20%3F%3F%3D%20runtime.conversations.value%5B0%5D%3F.id%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(firstConversationId)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(firstConversationId)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%3A%20undefined%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20runtime%5Cn%7D%5Cn%22%7D%2C%22mockConversationStorage.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmockConversationStorage.ts%22%2C%22code%22%3A%22import%20%7B%5Cn%20%20localStorageStrategyFactory%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20interface%20MockConversationSeed%20%7B%5Cn%20%20title%3A%20string%5Cn%20%20metadata%3F%3A%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20messages%3A%20readonly%20ChatMessage%5B%5D%5Cn%7D%5Cn%5Cnexport%20function%20createMockConversationStorage(%5Cn%20%20storageKey%3A%20string%2C%5Cn%20%20seeds%3A%20readonly%20MockConversationSeed%5B%5D%2C%5Cn)%3A%20ConversationStorageStrategy%20%7B%5Cn%20%20const%20storage%20%3D%20localStorageStrategyFactory(%7B%20key%3A%20storageKey%20%7D)%5Cn%20%20const%20initializedKey%20%3D%20%60%24%7BstorageKey%7D%3Ainitialized%60%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20async%20loadConversations()%20%7B%5Cn%20%20%20%20%20%20const%20conversations%20%3D%20await%20storage.loadConversations()%5Cn%20%20%20%20%20%20let%20initialized%3A%20string%20%7C%20null%20%3D%20null%5Cn%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20initialized%20%3D%20localStorage.getItem(initializedKey)%5Cn%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20markInitialized%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20localStorage.setItem(initializedKey%2C%20'true')%5Cn%20%20%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20The%20marker%20is%20best%20effort.%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(conversations.length%20%26%26%20!initialized)%20%7B%5Cn%20%20%20%20%20%20%20%20markInitialized()%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(initialized%20%7C%7C%20conversations.length%20%7C%7C%20!seeds.length)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20now%20%3D%20Date.now()%5Cn%20%20%20%20%20%20const%20seededConversations%3A%20ConversationInfo%5B%5D%20%3D%20seeds.map((seed%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20%60tiny-robot-mock-conversation-%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20%20%20%20%20%20%20title%3A%20seed.title%2C%5Cn%20%20%20%20%20%20%20%20createdAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20updatedAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20metadata%3A%20seed.metadata%2C%5Cn%20%20%20%20%20%20%7D))%5Cn%5Cn%20%20%20%20%20%20for%20(const%20%5Bindex%2C%20conversation%5D%20of%20seededConversations.entries())%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.saveConversation(conversation)%5Cn%20%20%20%20%20%20%20%20await%20storage.saveMessages(conversation.id%2C%20%5B...seeds%5Bindex%5D.messages%5D)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20markInitialized()%5Cn%5Cn%20%20%20%20%20%20return%20seededConversations%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20storage.loadMessages(conversationId)%2C%5Cn%20%20%20%20saveConversation%3A%20(conversation)%20%3D%3E%20storage.saveConversation(conversation)%2C%5Cn%20%20%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20storage.saveMessages(conversationId%2C%20messages)%2C%5Cn%20%20%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20storage.deleteConversation%3F.(conversationId)%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{s.value=!1}),vueCode:n(O)},c({_:2},[b.value?{name:"vue",fn:a(()=>[t(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[15]||(e[15]=o(`<p>演示中的自定义外观还将 AI 气泡背景设为透明；继续发送消息，新的消息会沿用当前配置。</p><p>通过 <code>ui.bubble.bubbleList.roleConfigs</code> 按消息角色设置外观。例如，分别配置用户消息（<code>user</code>）和 AI 回答（<code>assistant</code>）的头像、位置和气泡形状。</p><table tabindex="0"><thead><tr><th>配置</th><th>用途和可选值</th><th>默认值</th></tr></thead><tbody><tr><td><code>avatar</code></td><td>自定义头像，例如通过 Vue 的 <code>h()</code> 创建的节点</td><td>用户和 AI 分别使用内置头像</td></tr><tr><td><code>placement</code></td><td><code>&#39;start&#39;</code> 左侧、<code>&#39;end&#39;</code> 右侧</td><td><code>user</code> 为 <code>&#39;end&#39;</code>，<code>assistant</code> 为 <code>&#39;start&#39;</code></td></tr><tr><td><code>shape</code></td><td><code>&#39;corner&#39;</code> 带角气泡、<code>&#39;rounded&#39;</code> 圆角气泡、<code>&#39;none&#39;</code> 不使用预设气泡形状</td><td><code>&#39;corner&#39;</code></td></tr></tbody></table><p>例如，给用户设置圆角气泡，给 AI 设置自定义头像：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { h } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bubbleList: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      roleConfigs: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        user: { placement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;end&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, avatar: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">h</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;span&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;我&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), shape: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;rounded&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        assistant: { placement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;start&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, avatar: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">h</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;span&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;AI&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), shape: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;none&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>更多配置见 <a href="./../components/bubble.html#头像和位置">头像和位置</a>、<a href="./../components/bubble.html#气泡形状">气泡形状</a> 和 <a href="./../components/bubble.html#bubblelist">BubbleList 属性</a>。</p><h4 id="消息错误提示配置" tabindex="-1">消息错误提示配置 <a class="header-anchor" href="#消息错误提示配置" aria-label="Permalink to &quot;消息错误提示配置&quot;">​</a></h4><p>请求失败时，在对应的 AI 消息下显示错误提示，帮助用户了解失败原因。</p>`,8)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"请求失败提示",description:"发送包含“失败”的内容查看默认错误提示，发送其他内容查看正常回复。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-error.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-error.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20ConversationStorageStrategy%2C%20MessageRequestBody%2C%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20TrChat%2C%5Cn%20%20useChatRuntime%2C%5Cn%20%20type%20ChatRuntimeActionErrorPayload%2C%5Cn%20%20type%20ChatUIOptions%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnlet%20responseIndex%20%3D%200%5Cn%5Cnconst%20memoryStorage%3A%20ConversationStorageStrategy%20%3D%20%7B%5Cn%20%20loadConversations%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20loadMessages%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20saveConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20saveMessages%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20deleteConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%7D%5Cn%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody)%20%3D%3E%20%7B%5Cn%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%20300))%5Cn%5Cn%20%20const%20text%20%3D%20String(requestBody.messages.filter((message)%20%3D%3E%20message.role%20%3D%3D%3D%20'user').at(-1)%3F.content%20%3F%3F%20'')%5Cn%5Cn%20%20if%20(text.includes('%E5%A4%B1%E8%B4%A5'))%20%7B%5Cn%20%20%20%20const%20error%20%3D%20new%20Error('%E6%A8%A1%E6%8B%9F%E8%AF%B7%E6%B1%82%E5%A4%B1%E8%B4%A5%EF%BC%9A%E6%A8%A1%E5%9E%8B%E6%9C%8D%E5%8A%A1%E6%9A%82%E6%97%B6%E4%B8%8D%E5%8F%AF%E7%94%A8%E3%80%82')%5Cn%20%20%20%20Object.assign(error%2C%20%7B%20code%3A%20'DEMO_UNAVAILABLE'%20%7D)%5Cn%20%20%20%20throw%20error%5Cn%20%20%7D%5Cn%5Cn%20%20responseIndex%20%2B%3D%201%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20%60runtime-error-demo-%24%7BresponseIndex%7D%60%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20responseIndex%2C%5Cn%20%20%20%20model%3A%20'local-demo'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60%E6%AD%A3%E5%B8%B8%E5%9B%9E%E5%A4%8D%EF%BC%9A%24%7Btext%20%7C%7C%20'%E6%88%90%E5%8A%9F%E6%B6%88%E6%81%AF'%7D%60%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20conversation%3A%20%7B%20storage%3A%20memoryStorage%2C%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%20%7D%2C%5Cn%7D)%5Cnconst%20actionStatus%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E6%94%B6%E5%88%B0%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5')%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%2C%20rightAside%3A%20false%20%7D%2C%5Cn%20%20welcome%3A%20false%2C%5Cn%20%20prompts%3A%20false%2C%5Cn%7D%5Cn%5Cnfunction%20handleRuntimeActionError(payload%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionStatus.value%20%3D%20payload.action%20%3D%3D%3D%20'send'%20%3F%20'%E5%B7%B2%E6%94%B6%E5%88%B0%E5%8F%91%E9%80%81%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5'%20%3A%20'%E5%B7%B2%E6%94%B6%E5%88%B0%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5'%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-error-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-error-demo__hint%5C%22%3E%E5%8F%91%E9%80%81%E5%8C%85%E5%90%AB%E2%80%9C%E5%A4%B1%E8%B4%A5%E2%80%9D%E7%9A%84%E5%86%85%E5%AE%B9%E5%8F%AF%E6%9F%A5%E7%9C%8B%E9%94%99%E8%AF%AF%E6%8F%90%E7%A4%BA%EF%BC%8C%E5%8F%91%E9%80%81%E5%85%B6%E4%BB%96%E5%86%85%E5%AE%B9%E5%8F%AF%E6%9F%A5%E7%9C%8B%E6%AD%A3%E5%B8%B8%E5%9B%9E%E5%A4%8D%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-error-demo__status%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-error-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%40runtime-action-error%3D%5C%22handleRuntimeActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-error-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__hint%2C%5Cn.runtime-error-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__status%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20width%3A%20min(100%25%2C%20720px)%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-error-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{s.value=!1}),vueCode:n(L)},c({_:2},[D.value?{name:"vue",fn:a(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[16]||(e[16]=o(`<p>演示使用 <code>useChatRuntime</code> 展示默认错误提示，不包含自定义提示组件；默认提示不提供重试按钮。</p><p>通过 <code>ui.bubble.bubbleProvider.errorRenderer</code> 替换错误提示，传入 <code>null</code> 可关闭默认提示。<code>CustomErrorRenderer</code> 表示应用自行实现的错误展示组件。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> customErrorUI</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bubbleProvider: { errorRenderer: CustomErrorRenderer },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> disabledErrorUI</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bubbleProvider: { errorRenderer: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>errorRenderer</code> 只控制提示的显示，不会改变请求的失败状态。</p><p>默认错误提示支持以下 CSS 变量：</p><ul><li><code>--tr-bubble-error-color</code>：文字颜色。</li><li><code>--tr-bubble-error-bg</code>：背景颜色。</li><li><code>--tr-bubble-error-border-radius</code>：圆角大小。</li></ul><p>更多样式配置见 <a href="./../components/bubble.html#css-变量">Bubble CSS 变量</a>。</p><p>请求异常处理和操作失败通知见 <a href="./chat-runtime.html#请求失败时的提示">请求失败时的提示</a>。</p><h3 id="配置历史会话列表" tabindex="-1">配置历史会话列表 <a class="header-anchor" href="#配置历史会话列表" aria-label="Permalink to &quot;配置历史会话列表&quot;">​</a></h3><p>自定义历史会话的排序、筛选和分组，同时保留内置会话操作。</p>`,10)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"自定义历史会话分组",description:"查看预设分组和选中样式，切换、重命名或删除会话；新建会话并发送消息后，查看列表更新。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22history-groups.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fhistory-groups.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20type%20ChatHistoryData%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20useChatCaseRuntime%20%7D%20from%20'.%2Fshared%2FcreateChatRuntime'%5Cn%5Cnconst%20groups%20%3D%20%5B'%E7%BD%AE%E9%A1%B6'%2C%20'%E6%98%A8%E5%A4%A9'%2C%20'30%E5%A4%A9%E5%86%85'%5D%5Cnconst%20initialConversations%20%3D%20%5B%5Cn%20%20%7B%20title%3A%20'%E5%88%9D%E6%AC%A1%E9%97%AE%E5%80%99%E4%B8%8E%E8%87%AA%E6%88%91%E4%BB%8B%E7%BB%8D'%2C%20group%3A%20'%E7%BD%AE%E9%A1%B6'%20%7D%2C%5Cn%20%20%7B%20title%3A%20'square-pen%20%E5%90%AB%E4%B9%89%E8%A7%A3%E9%87%8A'%2C%20group%3A%20'%E6%98%A8%E5%A4%A9'%20%7D%2C%5Cn%20%20%7B%20title%3A%20'%E6%B5%8F%E8%A7%88%E5%99%A8%20Agent%20%E8%A7%86%E8%A7%89%E6%93%8D%E4%BD%9C%E4%BC%98%E5%8C%96'%2C%20group%3A%20'30%E5%A4%A9%E5%86%85'%20%7D%2C%5Cn%20%20%7B%20title%3A%20'VSCode%20%E9%87%8D%E5%90%AF%20TS%20%E6%9C%8D%E5%8A%A1%E5%BF%AB%E6%8D%B7%E9%94%AE'%2C%20group%3A%20'30%E5%A4%A9%E5%86%85'%20%7D%2C%5Cn%20%20%7B%20title%3A%20'%E5%A6%82%E4%BD%95%E5%88%B6%E5%AE%9A%E8%8B%B1%E8%AF%AD%E5%AD%A6%E4%B9%A0%E8%AE%A1%E5%88%92'%2C%20group%3A%20'30%E5%A4%A9%E5%86%85'%20%7D%2C%5Cn%5D%5Cnconst%20runtime%20%3D%20useChatCaseRuntime(%7B%5Cn%20%20storageKey%3A%20'tiny-robot-demo-history-groups-v1'%2C%5Cn%20%20initialConversations%3A%20initialConversations.map((%7B%20title%2C%20group%20%7D)%20%3D%3E%20(%7B%5Cn%20%20%20%20title%2C%5Cn%20%20%20%20metadata%3A%20%7B%20group%20%7D%2C%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20role%3A%20'user'%2C%20content%3A%20title%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60%E8%BF%99%E6%98%AF%E2%80%9C%24%7Btitle%7D%E2%80%9D%E7%9A%84%E7%A4%BA%E4%BE%8B%E5%9B%9E%E7%AD%94%E3%80%82%E5%88%87%E6%8D%A2%E5%B7%A6%E4%BE%A7%E4%BC%9A%E8%AF%9D%EF%BC%8C%E5%8F%AF%E6%9F%A5%E7%9C%8B%E5%AF%B9%E5%BA%94%E7%9A%84%E6%B6%88%E6%81%AF%E3%80%82%60%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D))%2C%5Cn%7D)%5Cn%5Cnconst%20historyData%20%3D%20computed%3CChatHistoryData%3E(()%20%3D%3E%5Cn%20%20groups%5Cn%20%20%20%20.map((group)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20group%2C%5Cn%20%20%20%20%20%20items%3A%20runtime.conversations.value.filter((item)%20%3D%3E%20(item.metadata%3F.group%20%3F%3F%20'30%E5%A4%A9%E5%86%85')%20%3D%3D%3D%20group)%2C%5Cn%20%20%20%20%7D))%5Cn%20%20%20%20.filter((%7B%20items%20%7D)%20%3D%3E%20items.length%20%3E%200)%2C%5Cn)%5Cn%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20%7B%20width%3A%20260%2C%20defaultOpen%3A%20true%20%7D%20%7D%2C%5Cn%20%20history%3A%20%7B%20showRenameControls%3A%20true%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22history-groups-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22history-groups-demo__tip%5C%22%3E%5Cn%20%20%20%20%20%20%E5%B1%95%E5%BC%80%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8%E5%90%8E%EF%BC%8C%E5%8F%AF%E5%88%87%E6%8D%A2%E3%80%81%E9%87%8D%E5%91%BD%E5%90%8D%E6%88%96%E5%88%A0%E9%99%A4%E4%BC%9A%E8%AF%9D%E3%80%82%E5%88%86%E7%BB%84%E4%B8%BA%E9%A2%84%E8%AE%BE%E7%A4%BA%E4%BE%8B%EF%BC%8C%E4%B8%8D%E5%8C%85%E5%90%AB%E8%87%AA%E5%8A%A8%E6%97%A5%E6%9C%9F%E5%BD%92%E7%B1%BB%E6%88%96%E7%BD%AE%E9%A1%B6%E6%93%8D%E4%BD%9C%EF%BC%9B%E6%96%B0%E4%BC%9A%E8%AF%9D%E6%98%BE%E7%A4%BA%E5%9C%A8%E2%80%9C30%E5%A4%A9%E5%86%85%E2%80%9D%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22history-groups-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%3Ahistory-data%3D%5C%22historyData%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.history-groups-demo__tip%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.history-groups-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20--tr-history-group-space-y%3A%2014px%3B%5Cn%20%20--tr-history-group-title-font-size%3A%2012px%3B%5Cn%20%20--tr-history-group-title-line-height%3A%2018px%3B%5Cn%20%20--tr-history-group-title-padding%3A%200%208px%206px%3B%5Cn%20%20--tr-history-group-title-color%3A%20var(--tr-text-tertiary)%3B%5Cn%20%20--tr-history-item-padding%3A%207px%208px%3B%5Cn%20%20--tr-history-item-padding-editing%3A%207px%208px%3B%5Cn%20%20--tr-history-item-border-radius%3A%208px%3B%5Cn%20%20--tr-history-item-space-y%3A%202px%3B%5Cn%20%20--tr-history-item-selected-bg%3A%20%23e4edfd%3B%5Cn%20%20--tr-history-item-selected-color%3A%20%233964fe%3B%5Cn%20%20height%3A%20600px%3B%5Cn%7D%5Cn%5Cn.history-groups-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.history-groups-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.history-groups-demo__chat%20%3Adeep(.chat-left-aside-content)%20%7B%5Cn%20%20overflow-x%3A%20hidden%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22createChatRuntime.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FcreateChatRuntime.ts%22%2C%22code%22%3A%22import%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20createMockConversationStorage%2C%20type%20MockConversationSeed%20%7D%20from%20'.%2FmockConversationStorage'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2FmodelProviders'%5Cn%5Cnexport%20interface%20ChatCaseRuntimeOptions%20%7B%5Cn%20%20storageKey%3F%3A%20string%5Cn%20%20initialConversations%3F%3A%20readonly%20MockConversationSeed%5B%5D%5Cn%20%20mcpServers%3F%3A%20ChatMcpServers%5Cn%7D%5Cn%5Cnexport%20function%20useChatCaseRuntime(options%3A%20ChatCaseRuntimeOptions)%20%7B%5Cn%20%20const%20initialConversations%20%3D%20options.initialConversations%20%3F%3F%20%5B%5D%5Cn%20%20const%20mcpServers%20%3D%20options.mcpServers%20%3F%3F%20%5B%5D%5Cn%20%20const%20storage%20%3D%20options.storageKey%5Cn%20%20%20%20%3F%20initialConversations.length%5Cn%20%20%20%20%20%20%3F%20createMockConversationStorage(options.storageKey%2C%20initialConversations)%5Cn%20%20%20%20%20%20%3A%20localStorageStrategyFactory(%7B%20key%3A%20options.storageKey%20%7D)%5Cn%20%20%20%20%3A%20undefined%5Cn%5Cn%20%20const%20runtime%3A%20ReturnType%3Ctypeof%20useChatRuntime%3E%20%3D%20useChatRuntime(%7B%5Cn%20%20%20%20mcpServers%2C%5Cn%20%20%20%20modelProviders%2C%5Cn%20%20%20%20conversation%3A%5Cn%20%20%20%20%20%20options.storageKey%20%7C%7C%20initialConversations.length%5Cn%20%20%20%20%20%20%20%20%3F%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20...(storage%20%3F%20%7B%20storage%20%7D%20%3A%20%7B%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20onLoad%3A%20(conversations)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(!runtime)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(conversations.length)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(conversations%5B0%5D.id)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(options.storageKey%20%7C%7C%20!initialConversations.length)%20return%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20firstConversationId%3A%20string%20%7C%20undefined%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20(const%20item%20of%20initialConversations)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20seedConversation%20%3D%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20title%3A%20item.title%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metadata%3A%20item.metadata%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20useMessageOptions%3A%20%7B%20initialMessages%3A%20%5B...item.messages%5D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.createConversation(seedConversation)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20firstConversationId%20%3F%3F%3D%20runtime.conversations.value%5B0%5D%3F.id%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(firstConversationId)%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtime.actions.switchConversation(firstConversationId)%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%20%20%3A%20undefined%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20runtime%5Cn%7D%5Cn%22%7D%2C%22mockConversationStorage.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmockConversationStorage.ts%22%2C%22code%22%3A%22import%20%7B%5Cn%20%20localStorageStrategyFactory%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20interface%20MockConversationSeed%20%7B%5Cn%20%20title%3A%20string%5Cn%20%20metadata%3F%3A%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20messages%3A%20readonly%20ChatMessage%5B%5D%5Cn%7D%5Cn%5Cnexport%20function%20createMockConversationStorage(%5Cn%20%20storageKey%3A%20string%2C%5Cn%20%20seeds%3A%20readonly%20MockConversationSeed%5B%5D%2C%5Cn)%3A%20ConversationStorageStrategy%20%7B%5Cn%20%20const%20storage%20%3D%20localStorageStrategyFactory(%7B%20key%3A%20storageKey%20%7D)%5Cn%20%20const%20initializedKey%20%3D%20%60%24%7BstorageKey%7D%3Ainitialized%60%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20async%20loadConversations()%20%7B%5Cn%20%20%20%20%20%20const%20conversations%20%3D%20await%20storage.loadConversations()%5Cn%20%20%20%20%20%20let%20initialized%3A%20string%20%7C%20null%20%3D%20null%5Cn%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20initialized%20%3D%20localStorage.getItem(initializedKey)%5Cn%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20markInitialized%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20localStorage.setItem(initializedKey%2C%20'true')%5Cn%20%20%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20The%20marker%20is%20best%20effort.%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(conversations.length%20%26%26%20!initialized)%20%7B%5Cn%20%20%20%20%20%20%20%20markInitialized()%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(initialized%20%7C%7C%20conversations.length%20%7C%7C%20!seeds.length)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20now%20%3D%20Date.now()%5Cn%20%20%20%20%20%20const%20seededConversations%3A%20ConversationInfo%5B%5D%20%3D%20seeds.map((seed%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20%60tiny-robot-mock-conversation-%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20%20%20%20%20%20%20title%3A%20seed.title%2C%5Cn%20%20%20%20%20%20%20%20createdAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20updatedAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20metadata%3A%20seed.metadata%2C%5Cn%20%20%20%20%20%20%7D))%5Cn%5Cn%20%20%20%20%20%20for%20(const%20%5Bindex%2C%20conversation%5D%20of%20seededConversations.entries())%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.saveConversation(conversation)%5Cn%20%20%20%20%20%20%20%20await%20storage.saveMessages(conversation.id%2C%20%5B...seeds%5Bindex%5D.messages%5D)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20markInitialized()%5Cn%5Cn%20%20%20%20%20%20return%20seededConversations%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20storage.loadMessages(conversationId)%2C%5Cn%20%20%20%20saveConversation%3A%20(conversation)%20%3D%3E%20storage.saveConversation(conversation)%2C%5Cn%20%20%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20storage.saveMessages(conversationId%2C%20messages)%2C%5Cn%20%20%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20storage.deleteConversation%3F.(conversationId)%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{s.value=!1}),vueCode:n(M)},c({_:2},[y.value?{name:"vue",fn:a(()=>[t(n(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[17]||(e[17]=o(`<p>浏览器宽度低于 <code>960px</code> 时，先通过界面按钮展开会话列表。</p><blockquote><p>“置顶”和日期分组使用预设数据，不包含置顶操作或自动按日期归类。演示使用独立的本地存储保存示例会话，刷新后保留修改结果。</p></blockquote><p><code>TrChat</code> 默认使用 Runtime 的会话生成历史列表，支持切换、重命名和删除，无需额外传入 <code>historyData</code>。需要自定义排序、筛选或分组展示时，可通过 <code>historyData</code> 提供列表数据，继续使用内置列表和会话操作。</p><p><code>historyData</code> 支持会话数组或 <code>{ group, items }[]</code> 分组数组，列表按传入顺序展示；传入 <code>[]</code> 时显示空列表。<code>group</code> 是分组标题，<code>items</code> 是该组的会话数组，每项的 <code>id</code> 应对应 Runtime 中已有的会话。</p><p>下面以分组展示为例，按会话中的 <code>metadata.group</code> 展示“置顶”“昨天”“30天内”，未设置分组的会话放入“30天内”。<code>metadata.group</code> 是本例约定的字段，不是内置日期或置顶配置：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { computed } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatHistoryData } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> groups</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;置顶&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;昨天&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;30天内&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> historyData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> computed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ChatHistoryData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  groups</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">group</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      group,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      items: runtime.conversations.value.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">item</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (item.metadata?.group </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;30天内&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> group),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">items</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> items.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;chat-history&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">runtime</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ui</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">history-data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">historyData</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>本例通过 <code>computed</code> 根据 Runtime 会话生成分组，列表会随会话新增、重命名或删除更新。</p><p><code>ui.history</code> 用于配置菜单等展示选项，可不传，默认菜单包含重命名和删除；设为 <code>false</code> 可隐藏历史列表。例如，只保留重命名菜单：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  history: { menuItems: [{ id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;rename&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;重命名&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }] },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>左侧栏默认使用页面背景色，可通过 <code>--tr-chat-ui-left-aside-bg</code> 调整。选中颜色和圆角可通过 History 的 CSS 变量调整，在 <code>TrChat</code>、<code>TrChatUI</code> 或其父容器上设置即可：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.chat-history</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-history-item-selected-bg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#e4edfd</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-history-item-selected-color</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#3964fe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-history-item-border-radius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>完整展示配置见 <a href="./../components/history.html#props">History 属性</a> 和 <a href="./../components/history.html#css-变量">样式变量</a>，程序调用见 <a href="./chat-runtime.html#会话管理">会话管理</a>。</p><h3 id="插槽定制" tabindex="-1">插槽定制 <a class="header-anchor" href="#插槽定制" aria-label="Permalink to &quot;插槽定制&quot;">​</a></h3><p>在页头、消息和输入区添加自定义内容。</p>`,15)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"插槽定制",description:"通过自定义页头展开会话列表或返回新会话页面，点击 AI 回答下的“有帮助”按钮，并查看输入框外下方的提示文字。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22slots-basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fslots-basic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20markedAnswers%20%3D%20shallowRef%3Cstring%5B%5D%3E(%5B%5D)%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20role%3A%20'assistant'%2C%20content%3A%20'%E8%BF%99%E4%B8%AA%E7%A4%BA%E4%BE%8B%E9%80%9A%E8%BF%87%E6%8F%92%E6%A7%BD%E8%87%AA%E5%AE%9A%E4%B9%89%E9%A1%B5%E5%A4%B4%E3%80%81%E6%B7%BB%E5%8A%A0%E6%B6%88%E6%81%AF%E6%8C%89%E9%92%AE%EF%BC%8C%E5%B9%B6%E5%9C%A8%E8%BE%93%E5%85%A5%E6%A1%86%E4%B8%8B%E6%96%B9%E6%98%BE%E7%A4%BA%E6%8F%90%E7%A4%BA%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnruntime.actions.createConversation(%7B%20title%3A%20'%E6%8F%92%E6%A7%BD%E5%AE%9A%E5%88%B6'%20%7D)%5Cn%5Cnfunction%20answerKey(indexes%3A%20readonly%20number%5B%5D)%20%7B%5Cn%20%20return%20%60%24%7Bruntime.activeConversation.value%3F.id%7D%3A%24%7Bindexes.join('%2C')%7D%60%5Cn%7D%5Cn%5Cnfunction%20markAnswer(indexes%3A%20readonly%20number%5B%5D)%20%7B%5Cn%20%20markedAnswers.value%20%3D%20%5B...markedAnswers.value%2C%20answerKey(indexes)%5D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-slots-demo%5C%22%3E%5Cn%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23layout-header%3D%5C%22%7B%20title%2C%20isLeftAsideOpen%2C%20toggleLeftAside%2C%20createConversation%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-slots-demo__header%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22chat-slots-demo__button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Aaria-expanded%3D%5C%22isLeftAsideOpen%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22toggleLeftAside%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%7B%20isLeftAsideOpen%20%3F%20'%E6%94%B6%E8%B5%B7%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8'%20%3A%20'%E5%B1%95%E5%BC%80%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8'%20%7D%7D%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%20class%3D%5C%22chat-slots-demo__title%5C%22%3E%7B%7B%20title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22chat-slots-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22createConversation%5C%22%3E%E6%96%B0%E5%BB%BA%E4%BC%9A%E8%AF%9D%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23bubble-content-footer%3D%5C%22%7B%20role%2C%20messageIndexes%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20v-if%3D%5C%22role%20%3D%3D%3D%20'assistant'%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20class%3D%5C%22chat-slots-demo__button%20chat-slots-demo__button--feedback%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%3Adisabled%3D%5C%22markedAnswers.includes(answerKey(messageIndexes))%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22markAnswer(messageIndexes)%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%7B%7B%20markedAnswers.includes(answerKey(messageIndexes))%20%3F%20'%E5%B7%B2%E6%A0%87%E8%AE%B0'%20%3A%20'%E6%9C%89%E5%B8%AE%E5%8A%A9'%20%7D%7D%5Cn%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23composer-after%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22chat-slots-demo__tip%5C%22%3E%E5%86%85%E5%AE%B9%E7%94%B1%20AI%20%E7%94%9F%E6%88%90%EF%BC%8C%E8%AF%B7%E4%BB%94%E7%BB%86%E7%94%84%E5%88%AB%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2FTrChat%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-slots-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20600px%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo__header%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo__title%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo__button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%204px%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo__button--feedback%20%7B%5Cn%20%20margin-top%3A%208px%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo__button%3Adisabled%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20border-color%3A%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20cursor%3A%20default%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo__tip%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--tr-text-tertiary)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%20%20line-height%3A%2016px%3B%5Cn%20%20text-align%3A%20center%3B%5Cn%7D%5Cn%5Cn.chat-slots-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{s.value=!1}),vueCode:n(q)},c({_:2},[B.value?{name:"vue",fn:a(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=o('<p>本示例使用以下插槽：</p><ul><li><code>layout-header</code>：自定义页头。</li><li><code>bubble-content-footer</code>：添加消息反馈按钮。</li><li><code>composer-after</code>：添加输入框下方的提示。</li></ul><p>完整插槽列表及参数见 <a href="#插槽">插槽</a>。</p><h3 id="右侧面板" tabindex="-1">右侧面板 <a class="header-anchor" href="#右侧面板" aria-label="Permalink to &quot;右侧面板&quot;">​</a></h3><p>在聊天界面旁展示引用资料或结果预览。</p>',5)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"右侧资料与预览面板",description:"点击消息操作，打开发布方案预览或引用资料。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22right-aside-panel.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fright-aside-panel.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20BusinessRightAside%20from%20'.%2Fbusiness-right-aside.vue'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20mcpServers%3A%20ChatMcpServers%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'project-knowledge'%2C%5Cn%20%20%20%20name%3A%20'%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E5%BA%93'%2C%5Cn%20%20%20%20description%3A%20'%E6%A3%80%E7%B4%A2%E9%9C%80%E6%B1%82%E3%80%81%E8%AE%BE%E8%AE%A1%E5%92%8C%E9%A1%B9%E7%9B%AE%E7%BA%A6%E5%AE%9A%E3%80%82'%2C%5Cn%20%20%20%20baseUrl%3A%20%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%2Fmcp%2Fproject-knowledge%60%2C%5Cn%20%20%20%20installed%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'release-calendar'%2C%5Cn%20%20%20%20name%3A%20'%E5%8F%91%E5%B8%83%E6%97%A5%E5%8E%86'%2C%5Cn%20%20%20%20description%3A%20'%E6%9F%A5%E8%AF%A2%E5%8F%91%E5%B8%83%E7%AA%97%E5%8F%A3%E5%92%8C%E5%86%BB%E7%BB%93%E6%97%B6%E9%97%B4%E3%80%82'%2C%5Cn%20%20%20%20baseUrl%3A%20%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%2Fmcp%2Frelease-calendar%60%2C%5Cn%20%20%20%20installed%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20rightAsideOpen%20%3D%20shallowRef(true)%5Cnconst%20activeRightAsidePanelId%20%3D%20shallowRef%3Cstring%20%7C%20undefined%3E('preview')%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20mcpServers%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E5%B7%B2%E6%95%B4%E7%90%86%E5%AE%8C%E6%88%90%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E6%89%93%E5%BC%80%E5%8F%B3%E4%BE%A7%E9%A2%84%E8%A7%88%EF%BC%8C%E6%88%96%E6%9F%A5%E7%9C%8B%E5%BC%95%E7%94%A8%E8%B5%84%E6%96%99%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnruntime.actions.createConversation(%7B%20title%3A%20'%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E5%8D%8F%E4%BD%9C'%20%7D)%5Cn%5Cnfunction%20openPanel(panelId%3A%20'preview'%20%7C%20'sources')%20%7B%5Cn%20%20activeRightAsidePanelId.value%20%3D%20panelId%5Cn%20%20rightAsideOpen.value%20%3D%20true%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-workbench%5C%22%3E%5Cn%20%20%20%20%3CTrChat%5Cn%20%20%20%20%20%20class%3D%5C%22chat-workbench__chat%5C%22%5Cn%20%20%20%20%20%20%3Aruntime%3D%5C%22runtime%5C%22%5Cn%20%20%20%20%20%20%3Aui%3D%5C%22%7B%5Cn%20%20%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20rightAside%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20width%3A%20344%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20resizable%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20minWidth%3A%20300%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20maxWidth%3A%20480%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20panels%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'preview'%2C%20title%3A%20'%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E9%A2%84%E8%A7%88'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'sources'%2C%20title%3A%20'%E5%BC%95%E7%94%A8%E8%B5%84%E6%96%99'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5C%22%5Cn%20%20%20%20%20%20%3Aright-aside-open%3D%5C%22rightAsideOpen%5C%22%5Cn%20%20%20%20%20%20%3Aactive-right-aside-panel-id%3D%5C%22activeRightAsidePanelId%5C%22%5Cn%20%20%20%20%20%20%40update%3Aright-aside-open%3D%5C%22rightAsideOpen%20%3D%20%24event%5C%22%5Cn%20%20%20%20%20%20%40update%3Aactive-right-aside-panel-id%3D%5C%22activeRightAsidePanelId%20%3D%20%24event%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23bubble-content-footer%3D%5C%22%7B%20role%2C%20messageIndexes%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22role%20%3D%3D%3D%20'assistant'%20%26%26%20messageIndexes.includes(0)%5C%22%20class%3D%5C%22message-actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22message-actions__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22openPanel('preview')%5C%22%3E%E6%9F%A5%E7%9C%8B%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22message-actions__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22openPanel('sources')%5C%22%3E%E6%9F%A5%E7%9C%8B%E5%BC%95%E7%94%A8%E8%B5%84%E6%96%99%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20%23layout-right-aside-panel%3D%5C%22%7B%20panelId%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3CBusinessRightAside%20%3Apanel-id%3D%5C%22panelId%5C%22%20%40open-panel%3D%5C%22openPanel%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2FTrChat%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-workbench%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(700px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-workbench__chat%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.message-actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-top%3A%208px%3B%5Cn%7D%5Cn%5Cn.message-actions__button%20%7B%5Cn%20%20border%3A%201px%20solid%20%23c8d6e6%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20color%3A%20%2327567e%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.message-actions__button%20%7B%5Cn%20%20padding%3A%206px%2010px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.message-actions__button%3Ahover%20%7B%5Cn%20%20border-color%3A%20%235d8db7%3B%5Cn%20%20background%3A%20%23f1f7fc%3B%5Cn%7D%5Cn%5Cn%3Adeep(h2.chat-right-aside-title)%20%7B%5Cn%20%20padding%3A%200%3B%5Cn%20%20border-top%3A%20none%3B%5Cn%7D%5Cn%5Cn%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-workbench%20%7B%5Cn%20%20%20%20height%3A%20620px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22business-right-aside.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbusiness-right-aside.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20previewTemplate%20from%20'.%2Frelease-preview.html%3Fraw'%5Cn%5Cntype%20SourceId%20%3D%20'requirements'%20%7C%20'api'%20%7C%20'regression'%5Cntype%20Source%20%3D%20%7B%5Cn%20%20id%3A%20SourceId%5Cn%20%20title%3A%20string%5Cn%20%20meta%3A%20string%5Cn%20%20summary%3A%20string%5Cn%7D%5Cn%5CndefineProps%3C%7B%5Cn%20%20panelId%3F%3A%20string%5Cn%7D%3E()%5Cn%5Cnconst%20emit%20%3D%20defineEmits%3C%7B%5Cn%20%20'open-panel'%3A%20%5BpanelId%3A%20'preview'%5D%5Cn%7D%3E()%5Cn%5Cnconst%20selectedSourceId%20%3D%20shallowRef%3CSourceId%3E('requirements')%5Cnconst%20sources%3A%20readonly%20Source%5B%5D%20%3D%20%5B%5Cn%20%20%7B%20id%3A%20'requirements'%2C%20title%3A%20'%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3'%2C%20meta%3A%20'PRD-2026-04'%2C%20summary%3A%20'%E9%9C%80%E6%B1%82%E8%8C%83%E5%9B%B4%E5%92%8C%E9%AA%8C%E6%94%B6%E5%8F%A3%E5%BE%84%E5%B7%B2%E5%AE%8C%E6%88%90%E7%A1%AE%E8%AE%A4%E3%80%82'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'api'%2C%20title%3A%20'%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E'%2C%20meta%3A%20'API-RELEASE-07'%2C%20summary%3A%20'%E6%8E%A5%E5%8F%A3%E5%A5%91%E7%BA%A6%E7%A8%B3%E5%AE%9A%EF%BC%8C%E8%81%94%E8%B0%83%E7%BB%93%E6%9E%9C%E6%BB%A1%E8%B6%B3%E5%8F%91%E5%B8%83%E5%89%8D%E6%A0%A1%E9%AA%8C%E8%A6%81%E6%B1%82%E3%80%82'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'regression'%2C%20title%3A%20'%E5%9B%9E%E5%BD%92%E6%8A%A5%E5%91%8A'%2C%20meta%3A%20'QA-2026-04-17'%2C%20summary%3A%20'%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B%E5%92%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E9%AA%8C%E8%AF%81%E9%80%9A%E8%BF%87%EF%BC%8C%E6%9A%82%E6%97%A0%E9%98%BB%E5%A1%9E%E7%BC%BA%E9%99%B7%E3%80%82'%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20selectedSource%20%3D%20computed(()%20%3D%3E%20sources.find((source)%20%3D%3E%20source.id%20%3D%3D%3D%20selectedSourceId.value)%20%3F%3F%20sources%5B0%5D)%5Cnconst%20previewSrcdoc%20%3D%20computed(()%20%3D%3E%5Cn%20%20previewTemplate%5Cn%20%20%20%20.replace('__SOURCE_TITLE__'%2C%20selectedSource.value.title)%5Cn%20%20%20%20.replace('__SOURCE_META__'%2C%20selectedSource.value.meta)%5Cn%20%20%20%20.replace('__SOURCE_SUMMARY__'%2C%20selectedSource.value.summary)%2C%5Cn)%5Cn%5Cnfunction%20openSource(sourceId%3A%20SourceId)%20%7B%5Cn%20%20selectedSourceId.value%20%3D%20sourceId%5Cn%20%20emit('open-panel'%2C%20'preview')%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20v-if%3D%5C%22panelId%20%3D%3D%3D%20'preview'%5C%22%20class%3D%5C%22business-panel%20business-panel--preview%5C%22%3E%5Cn%20%20%20%20%3Ciframe%20class%3D%5C%22preview-frame%5C%22%20title%3D%5C%22%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E7%BD%91%E9%A1%B5%E9%A2%84%E8%A7%88%5C%22%20sandbox%3D%5C%22allow-same-origin%5C%22%20%3Asrcdoc%3D%5C%22previewSrcdoc%5C%22%20%2F%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%5Cn%20%20%3Csection%20v-else-if%3D%5C%22panelId%20%3D%3D%3D%20'sources'%5C%22%20class%3D%5C%22business-panel%20business-panel--sources%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22sources-intro%5C%22%3E%E7%82%B9%E5%87%BB%E8%B5%84%E6%96%99%E8%BF%94%E5%9B%9E%E5%8F%91%E5%B8%83%E9%A2%84%E8%A7%88%EF%BC%8C%E5%B9%B6%E6%9F%A5%E7%9C%8B%E5%AF%B9%E5%BA%94%E5%BC%95%E7%94%A8%E4%BF%A1%E6%81%AF%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22source-list%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22source%20in%20sources%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22source.id%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22source-list__item%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22openSource(source.id)%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22source-list__title%5C%22%3E%7B%7B%20source.title%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22source-list__meta%5C%22%3E%7B%7B%20source.meta%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.business-panel%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.business-panel--preview%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%5Cn.preview-frame%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20flex%3A%201%201%20auto%3B%5Cn%20%20border%3A%200%3B%5Cn%20%20background%3A%20%23f7f9fc%3B%5Cn%7D%5Cn%5Cn.sources-intro%20%7B%5Cn%20%20margin%3A%200%200%2016px%3B%5Cn%20%20color%3A%20%23667890%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.source-list%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%7D%5Cn%5Cn.source-list__item%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20border%3A%201px%20solid%20%23c8d6e6%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20padding%3A%2013px%2014px%3B%5Cn%20%20color%3A%20%2327567e%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20text-align%3A%20left%3B%5Cn%7D%5Cn%5Cn.source-list__item%3Ahover%20%7B%5Cn%20%20border-color%3A%20%235d8db7%3B%5Cn%20%20background%3A%20%23f1f7fc%3B%5Cn%7D%5Cn%5Cn.source-list__title%20%7B%5Cn%20%20color%3A%20%231f3854%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%7D%5Cn%5Cn.source-list__meta%20%7B%5Cn%20%20margin-top%3A%205px%3B%5Cn%20%20color%3A%20%237a8ba0%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.business-panel%20%7B%5Cn%20%20%20%20padding%3A%2012px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22release-preview.html%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Frelease-preview.html%22%2C%22code%22%3A%22%3C!doctype%20html%3E%5Cn%3Chtml%20lang%3D%5C%22zh-CN%5C%22%3E%5Cn%20%20%3Chead%3E%5Cn%20%20%20%20%3Cmeta%20charset%3D%5C%22UTF-8%5C%22%20%2F%3E%5Cn%20%20%20%20%3Cmeta%20name%3D%5C%22viewport%5C%22%20content%3D%5C%22width%3Ddevice-width%2C%20initial-scale%3D1%5C%22%20%2F%3E%5Cn%20%20%20%20%3Cstyle%3E%5Cn%20%20%20%20%20%20.preview-page%20%7B%5Cn%20%20%20%20%20%20%20%20box-sizing%3A%20border-box%3B%5Cn%20%20%20%20%20%20%20%20max-width%3A%20720px%3B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%20auto%3B%5Cn%20%20%20%20%20%20%20%20padding%3A%2020px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-header%20%7B%5Cn%20%20%20%20%20%20%20%20padding%3A%208px%200%2020px%3B%5Cn%20%20%20%20%20%20%20%20border-bottom%3A%201px%20solid%20%23dce3eb%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-eyebrow%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%200%208px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2353708f%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2012px%3B%5Cn%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%5Cn%20%20%20%20%20%20%20%20letter-spacing%3A%200.08em%3B%5Cn%20%20%20%20%20%20%20%20text-transform%3A%20uppercase%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-title%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2316283f%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2030px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.2%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-summary%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%2012px%200%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2364758a%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2014px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.6%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-meta%20%7B%5Cn%20%20%20%20%20%20%20%20display%3A%20flex%3B%5Cn%20%20%20%20%20%20%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20%20%20%20%20%20%20gap%3A%208px%2016px%3B%5Cn%20%20%20%20%20%20%20%20margin-top%3A%2016px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2364758a%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2013px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-status%20%7B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23087443%3B%5Cn%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-section%20%7B%5Cn%20%20%20%20%20%20%20%20padding%3A%2020px%200%3B%5Cn%20%20%20%20%20%20%20%20border-bottom%3A%201px%20solid%20%23dce3eb%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-section__title%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%200%2014px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23263d57%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2016px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-source__title%20%7B%5Cn%20%20%20%20%20%20%20%20color%3A%20%231f3854%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2015px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-source__meta%2C%5Cn%20%20%20%20%20%20.preview-source__summary%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%208px%200%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2364758a%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2013px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.5%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list%20%7B%5Cn%20%20%20%20%20%20%20%20display%3A%20grid%3B%5Cn%20%20%20%20%20%20%20%20gap%3A%2010px%3B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%3B%5Cn%20%20%20%20%20%20%20%20padding%3A%200%3B%5Cn%20%20%20%20%20%20%20%20list-style%3A%20none%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list%20%3E%20li%20%7B%5Cn%20%20%20%20%20%20%20%20position%3A%20relative%3B%5Cn%20%20%20%20%20%20%20%20padding-left%3A%2022px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%234e6075%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2014px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.5%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list%20%3E%20li%3A%3Abefore%20%7B%5Cn%20%20%20%20%20%20%20%20position%3A%20absolute%3B%5Cn%20%20%20%20%20%20%20%20left%3A%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23087443%3B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E2%9C%93'%3B%5Cn%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list--changes%20%3E%20li%3A%3Abefore%20%7B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23537da5%3B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E2%80%A2'%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2020px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%2018px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%40media%20(max-width%3A%20560px)%20%7B%5Cn%20%20%20%20%20%20%20%20.preview-page%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20padding%3A%2016px%3B%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20.preview-title%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20font-size%3A%2026px%3B%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3C%2Fstyle%3E%5Cn%20%20%3C%2Fhead%3E%5Cn%20%20%3Cbody%20class%3D%5C%22preview-body%5C%22%3E%5Cn%20%20%20%20%3Cmain%20class%3D%5C%22preview-page%5C%22%3E%5Cn%20%20%20%20%20%20%3Cheader%20class%3D%5C%22preview-header%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-eyebrow%5C%22%3E%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Ch1%20class%3D%5C%22preview-title%5C%22%3E%E6%98%A5%E5%AD%A3%E8%90%A5%E9%94%80%E6%B4%BB%E5%8A%A8%3C%2Fh1%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-summary%5C%22%3E%E5%8F%91%E5%B8%83%E6%A3%80%E6%9F%A5%E5%B7%B2%E5%AE%8C%E6%88%90%EF%BC%8C%E5%BD%93%E5%89%8D%E7%89%88%E6%9C%AC%E5%B7%B2%E6%8C%89%E8%AE%A1%E5%88%92%E5%8F%91%E5%B8%83%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22preview-meta%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22preview-status%5C%22%3E%E5%B7%B2%E5%8F%91%E5%B8%83%3C%2Fspan%3E%3Cspan%3E%E5%8F%91%E5%B8%83%E6%97%B6%E9%97%B4%EF%BC%9A2026-04-18%2020%3A00%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fheader%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22preview-section%20preview-source%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch2%20class%3D%5C%22preview-section__title%5C%22%3E%E5%BD%93%E5%89%8D%E5%BC%95%E7%94%A8%3C%2Fh2%3E%5Cn%20%20%20%20%20%20%20%20%3Cstrong%20class%3D%5C%22preview-source__title%5C%22%3E__SOURCE_TITLE__%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-source__meta%5C%22%3E__SOURCE_META__%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-source__summary%5C%22%3E__SOURCE_SUMMARY__%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22preview-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch2%20class%3D%5C%22preview-section__title%5C%22%3E%E6%A3%80%E6%9F%A5%E6%B8%85%E5%8D%95%3C%2Fh2%3E%5Cn%20%20%20%20%20%20%20%20%3Cul%20class%3D%5C%22preview-list%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E6%8E%A5%E5%8F%A3%E8%81%94%E8%B0%83%E5%AE%8C%E6%88%90%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E7%81%B0%E5%BA%A6%E5%BC%80%E5%85%B3%E5%B7%B2%E9%85%8D%E7%BD%AE%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E5%9B%9E%E5%BD%92%E6%8A%A5%E5%91%8A%E5%B7%B2%E5%BD%92%E6%A1%A3%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22preview-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch2%20class%3D%5C%22preview-section__title%5C%22%3E%E5%8F%98%E6%9B%B4%E6%91%98%E8%A6%81%3C%2Fh2%3E%5Cn%20%20%20%20%20%20%20%20%3Cul%20class%3D%5C%22preview-list%20preview-list--changes%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E6%96%B0%E5%A2%9E%E6%B4%BB%E5%8A%A8%E9%A6%96%E9%A1%B5%E5%92%8C%E6%9D%83%E7%9B%8A%E8%AF%B4%E6%98%8E%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E4%BC%98%E5%8C%96%E5%8F%91%E5%B8%83%E5%89%8D%E6%A0%A1%E9%AA%8C%E6%B5%81%E7%A8%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E8%A1%A5%E5%85%85%E5%A4%B1%E8%B4%A5%E5%9B%9E%E6%BB%9A%E6%8F%90%E7%A4%BA%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%3C%2Fmain%3E%5Cn%20%20%3C%2Fbody%3E%5Cn%3C%2Fhtml%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Falpha%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{s.value=!1}),vueCode:n(R)},c({_:2},[g.value?{name:"vue",fn:a(()=>[t(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[19]||(e[19]=o(`<p>需要在会话旁展示引用资料、预览结果等内容时，通过 <code>ui.layout.rightAside.panels</code> 配置面板列表，再用 <code>layout-right-aside-panel</code> 插槽提供内容。</p><p><code>panels</code> 是面板配置对象数组，默认为空数组 <code>[]</code>，每项包含以下字段：</p><table tabindex="0"><thead><tr><th>字段</th><th>用途</th><th>必填</th></tr></thead><tbody><tr><td><code>id</code></td><td>面板唯一标识，与 <code>layout-right-aside-panel</code> 插槽中的 <code>panelId</code> 对应。</td><td>是</td></tr><tr><td><code>title</code></td><td>面板标题，省略时显示 <code>ui.labels.rightAsideTitle</code>（默认 <code>&#39;详情&#39;</code>）。</td><td>否</td></tr></tbody></table><p><code>id</code> 不能重复，也不能使用内置保留标识 <code>mcp</code>。右侧栏默认宽度为 <code>320px</code>，初始关闭；没有自定义面板或 MCP 数据时不会显示。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  layout: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    rightAside: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      panels: [{ id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;preview&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;结果预览&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>仅需设置初始打开状态时，使用 <code>defaultRightAsideOpen</code> 属性（默认 <code>false</code>）；<code>defaultActiveRightAsidePanelId</code> 属性指定初始面板，未设置时选择第一个可用面板：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">runtime</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ui</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">default-right-aside-open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> default-active-right-aside-panel-id</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;preview&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;template #layout-right-aside-panel=&quot;{ panelId }&quot;&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;p v-if=&quot;panelId === &#39;preview&#39;&quot;&gt;在这里放置预览内容。&lt;/p&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/template&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>通过 <code>v-model</code> 绑定 <code>rightAsideOpen</code> 和 <code>activeRightAsidePanelId</code>，分别控制右栏开闭和当前面板。未设置这两个属性时，由组件自行管理。</p><p>完整配置及默认值见 <a href="#layout">布局配置</a>，面板控制属性见 <a href="#trchat-props">TrChat 属性</a>。</p><h3 id="浮动聊天窗口" tabindex="-1">浮动聊天窗口 <a class="header-anchor" href="#浮动聊天窗口" aria-label="Permalink to &quot;浮动聊天窗口&quot;">​</a></h3><p>将聊天界面显示为可拖动、缩放的浮动窗口。</p>`,11)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"浮动聊天窗口",description:"打开聊天窗口，拖动或缩放后查看位置和尺寸变化。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22floating-layout.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Ffloating-layout.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatUIData%2C%20type%20ChatUIOptions%2C%20type%20LayoutFloatingState%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20open%20%3D%20ref(false)%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cnconst%20floatingState%20%3D%20ref%3CLayoutFloatingState%3E(%7B%5Cn%20%20placement%3A%20'top-right'%2C%5Cn%20%20offsetX%3A%2024%2C%5Cn%20%20offsetY%3A%2072%2C%5Cn%20%20width%3A%20520%2C%5Cn%20%20height%3A%20520%2C%5Cn%7D)%5Cn%5Cnconst%20data%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%20activeId%3A%20'floating'%2C%20title%3A%20'%E6%B5%AE%E5%8A%A8%E5%8A%A9%E6%89%8B'%20%7D%2C%5Cn%20%20bubble%3A%20%7B%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'intro'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%8B%96%E5%8A%A8%E9%A1%B6%E9%83%A8%E6%8A%8A%E6%89%8B%E6%88%96%E7%AA%97%E5%8F%A3%E8%BE%B9%E7%BC%98%EF%BC%8C%E5%A4%96%E9%83%A8%E7%8A%B6%E6%80%81%E4%BC%9A%E5%90%8C%E6%AD%A5%E6%9B%B4%E6%96%B0%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20surface%3A%20%7B%5Cn%20%20%20%20%20%20mode%3A%20'floating'%2C%5Cn%20%20%20%20%20%20floatingOptions%3A%20%7B%5Cn%20%20%20%20%20%20%20%20draggable%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20resizable%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20minWidth%3A%20360%2C%5Cn%20%20%20%20%20%20%20%20maxWidth%3A%20760%2C%5Cn%20%20%20%20%20%20%20%20minHeight%3A%20420%2C%5Cn%20%20%20%20%20%20%20%20maxHeight%3A%20720%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20leftAside%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20stateText%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20const%20state%20%3D%20floatingState.value%5Cn%20%20return%20%60%24%7Bstate.placement%7D%20%C2%B7%20x%20%24%7Bstate.offsetX%7Dpx%20%C2%B7%20y%20%24%7Bstate.offsetY%7Dpx%20%C2%B7%20%24%7Bstate.width%7D%20%C3%97%20%24%7Bstate.height%7Dpx%60%5Cn%7D)%5Cn%5Cnfunction%20updateFloatingState(value%3A%20LayoutFloatingState)%20%7B%5Cn%20%20floatingState.value%20%3D%20value%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-floating-demo%5C%22%3E%5Cn%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20class%3D%5C%22chat-floating-demo__trigger%5C%22%20%40click%3D%5C%22open%20%3D%20!open%5C%22%3E%5Cn%20%20%20%20%20%20%7B%7B%20open%20%3F%20'%E5%85%B3%E9%97%AD%E6%B5%AE%E5%8A%A8%E8%81%8A%E5%A4%A9'%20%3A%20'%E6%89%93%E5%BC%80%E6%B5%AE%E5%8A%A8%E8%81%8A%E5%A4%A9'%20%7D%7D%5Cn%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22chat-floating-demo__state%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%E5%BD%93%E5%89%8D%E7%8A%B6%E6%80%81%EF%BC%9A%7B%7B%20stateText%20%7D%7D%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20v-if%3D%5C%22open%5C%22%5Cn%20%20%20%20%20%20class%3D%5C%22chat-floating-window%5C%22%5Cn%20%20%20%20%20%20%3Adata%3D%5C%22data%5C%22%5Cn%20%20%20%20%20%20%3Aui%3D%5C%22ui%5C%22%5Cn%20%20%20%20%20%20%3Ainput-value%3D%5C%22inputValue%5C%22%5Cn%20%20%20%20%20%20%3Afloating-state%3D%5C%22floatingState%5C%22%5Cn%20%20%20%20%20%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%5Cn%20%20%20%20%20%20%40update%3Afloating-state%3D%5C%22updateFloatingState%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23layout-header%3D%5C%22%7B%20title%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-floating-demo__header%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20aria-label%3D%5C%22%E5%85%B3%E9%97%AD%E6%B5%AE%E5%8A%A8%E8%81%8A%E5%A4%A9%5C%22%20%40click%3D%5C%22open%20%3D%20false%5C%22%3E%E5%85%B3%E9%97%AD%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2FTrChatUI%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%3E%5Cn.chat-floating-window%20%7B%5Cn%20%20--tr-layout-floating-radius%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-floating-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%20%20min-height%3A%2072px%3B%5Cn%7D%5Cn%5Cn.chat-floating-demo__trigger%2C%5Cn.chat-floating-demo__header%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-floating-demo__state%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.chat-floating-demo__header%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{s.value=!1}),vueCode:n(T)},c({_:2},[m.value?{name:"vue",fn:a(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[20]||(e[20]=o(`<p><code>ui.layout.surface</code> 用于配置聊天界面的显示方式，可在父容器中显示，也可作为浮动窗口显示。它包含以下两个属性：</p><ul><li><code>mode</code>：选择显示方式，默认 <code>&#39;normal&#39;</code>，显示在父容器中；设为 <code>&#39;floating&#39;</code> 时显示为浮动窗口。</li><li><code>floatingOptions</code>：配置浮动窗口的拖动、缩放和尺寸限制，仅在 <code>mode</code> 为 <code>&#39;floating&#39;</code> 时生效。</li></ul><p><code>floatingOptions</code> 的常用字段如下：</p><table tabindex="0"><thead><tr><th>字段</th><th>用途</th><th>默认值或行为</th></tr></thead><tbody><tr><td><code>draggable</code></td><td>是否允许拖动窗口</td><td><code>true</code></td></tr><tr><td><code>resizable</code></td><td>是否允许拖动边缘缩放窗口</td><td><code>false</code></td></tr><tr><td><code>minWidth</code> / <code>minHeight</code></td><td>最小宽度、最小高度，单位为 px</td><td><code>320</code> / <code>240</code>，同时受视口尺寸限制</td></tr><tr><td><code>maxWidth</code> / <code>maxHeight</code></td><td>最大宽度、最大高度，单位为 px</td><td>不超过当前视口宽度、高度</td></tr></tbody></table><p>窗口默认支持拖动，下面开启缩放：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  layout: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    surface: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      mode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;floating&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      floatingOptions: { resizable: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>需要自定义窗口的位置和尺寸时，设置 <code>floatingState</code> 属性：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { shallowRef } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { LayoutFloatingState } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> floatingState</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">LayoutFloatingState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  placement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;top-right&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  offsetX: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">24</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  offsetY: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">72</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  width: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">520</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  height: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">520</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">runtime</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ui</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ui</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">floating-state</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">floatingState</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><blockquote><p>上例将窗口放在右上角，距右侧 <code>24px</code>、顶部 <code>72px</code>，宽高均为 <code>520px</code>。</p></blockquote><p>未设置 <code>floatingState</code> 时，窗口默认居中，尺寸为 <code>420px × 560px</code>；实际尺寸不会超过浏览器可视区域。</p><p>传入 <code>floatingState</code> 时，需同步更新状态，建议使用 <code>v-model:floating-state</code>。</p><p>完整字段及默认值见 <a href="./../components/layout.html#layout-floating-options">拖动与缩放配置</a>和<a href="./../components/layout.html#layout-floating-state">窗口位置与尺寸</a>。</p><h3 id="响应式布局与侧栏缩放" tabindex="-1">响应式布局与侧栏缩放 <a class="header-anchor" href="#响应式布局与侧栏缩放" aria-label="Permalink to &quot;响应式布局与侧栏缩放&quot;">​</a></h3><p>切换桌面和移动端布局，并在桌面布局下调整侧栏宽度。</p>`,15)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"桌面与移动端布局",description:"切换布局，查看侧栏的显示和开闭效果，以及桌面布局下的宽度调整。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22responsive-layout.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fresponsive-layout.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatUIData%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cntype%20PreviewMode%20%3D%20'dock'%20%7C%20'drawer'%5Cn%5Cnconst%20mode%20%3D%20shallowRef%3CPreviewMode%3E('dock')%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cnconst%20modeOptions%3A%20PreviewMode%5B%5D%20%3D%20%5B'dock'%2C%20'drawer'%5D%5Cn%5Cnconst%20data%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'mobile'%2C%20title%3A%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF%E9%80%82%E9%85%8D'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'desktop'%2C%20title%3A%20'%E6%A1%8C%E9%9D%A2%E7%AB%AF%E5%B8%83%E5%B1%80'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20activeId%3A%20'mobile'%2C%5Cn%20%20%20%20title%3A%20'%E5%93%8D%E5%BA%94%E5%BC%8F%E5%B8%83%E5%B1%80'%2C%5Cn%20%20%7D%2C%5Cn%20%20bubble%3A%20%7B%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'question'%2C%20role%3A%20'user'%2C%20content%3A%20'%E7%AA%84%E8%A7%86%E5%8F%A3%E4%B8%8B%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8%E5%A6%82%E4%BD%95%E5%B1%95%E7%A4%BA%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'answer'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E4%BE%A7%E6%A0%8F%E5%BA%94%E4%BD%BF%E7%94%A8%E6%8A%BD%E5%B1%89%E8%A6%86%E7%9B%96%E5%86%85%E5%AE%B9%EF%BC%8C%E5%B9%B6%E9%80%9A%E8%BF%87%E9%A1%B5%E5%A4%B4%E6%8C%89%E9%92%AE%E6%89%93%E5%BC%80%E6%88%96%E5%85%B3%E9%97%AD%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20ui%20%3D%20computed%3CChatUIOptions%3E(()%20%3D%3E%20(%7B%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20contentMaxWidth%3A%20mode.value%20%3D%3D%3D%20'drawer'%20%3F%20360%20%3A%20720%2C%5Cn%20%20%20%20leftAside%3A%20%7B%5Cn%20%20%20%20%20%20mode%3A%20mode.value%2C%5Cn%20%20%20%20%20%20defaultOpen%3A%20mode.value%20%3D%3D%3D%20'dock'%2C%5Cn%20%20%20%20%20%20resizable%3A%20mode.value%20%3D%3D%3D%20'dock'%2C%5Cn%20%20%20%20%20%20minWidth%3A%20240%2C%5Cn%20%20%20%20%20%20maxWidth%3A%20420%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20rightAside%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-responsive-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-responsive-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22item%20in%20modeOptions%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22item%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20mode%20%3D%3D%3D%20item%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22mode%20%3D%3D%3D%20item%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22mode%20%3D%20item%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20item%20%3D%3D%3D%20'dock'%20%3F%20'%E6%A1%8C%E9%9D%A2%20Dock'%20%3A%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF%20Drawer'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%3E%E6%A1%8C%E9%9D%A2%E5%B8%83%E5%B1%80%E4%B8%8B%EF%BC%8C%E6%8B%96%E5%8A%A8%E5%B7%A6%E4%BE%A7%E6%A0%8F%E5%8F%B3%E8%BE%B9%E7%BC%98%E5%8F%AF%E5%9C%A8%20240px%20%E5%88%B0%20420px%20%E4%B9%8B%E9%97%B4%E8%B0%83%E6%95%B4%E5%AE%BD%E5%BA%A6%EF%BC%9B%E6%8A%BD%E5%B1%89%E5%B8%83%E5%B1%80%E4%B8%8D%E6%94%AF%E6%8C%81%E8%B0%83%E6%95%B4%E5%AE%BD%E5%BA%A6%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-responsive-demo__stage%5C%22%20%3Aclass%3D%5C%22%60is-%24%7Bmode%7D%60%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChatUI%20%3Akey%3D%5C%22mode%5C%22%20%3Adata%3D%5C%22data%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%3Ainput-value%3D%5C%22inputValue%5C%22%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-responsive-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20button.is-active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20transition%3A%20max-width%200.2s%20ease%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage.is-dock%20%7B%5Cn%20%20max-width%3A%20760px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage.is-drawer%20%7B%5Cn%20%20max-width%3A%20390px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{s.value=!1}),vueCode:n(P)},c({_:2},[A.value?{name:"vue",fn:a(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[21]||(e[21]=o(`<blockquote><p>演示切换的是布局效果，不改变浏览器宽度；浏览器可视区域宽度低于 <code>960px</code> 时，即使选择桌面布局，也会自动使用抽屉。</p></blockquote><p>侧栏支持两种布局，通过 <code>ui.layout.leftAside.mode</code> 或 <code>ui.layout.rightAside.mode</code> 设置，默认是 <code>&#39;dock&#39;</code>：</p><ul><li>桌面布局（<code>&#39;dock&#39;</code>）：侧栏与消息区并排显示。</li><li>移动端布局（<code>&#39;drawer&#39;</code>）：侧栏以抽屉形式覆盖消息区。</li></ul><p>浏览器可视区域宽度低于 <code>960px</code> 时，组件会自动使用抽屉布局。</p><blockquote><p>仅缩小父容器不会触发自动切换；需要在较窄容器中使用抽屉时，将侧栏的 <code>mode</code> 设为 <code>&#39;drawer&#39;</code>。</p></blockquote><p>桌面布局下，将侧栏配置中的 <code>resizable</code> 设为 <code>true</code>，可拖动边缘调整宽度，默认不启用。通过 <code>minWidth</code>、<code>maxWidth</code> 设置调整范围，单位为 px；抽屉布局不支持调整宽度。例如：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> ui</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  layout: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    leftAside: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      defaultOpen: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      resizable: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      minWidth: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">240</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      maxWidth: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">420</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>完整侧栏配置及默认值见 <a href="#layout">布局配置</a>。</p><h3 id="仅使用界面组件" tabindex="-1">仅使用界面组件 <a class="header-anchor" href="#仅使用界面组件" aria-label="Permalink to &quot;仅使用界面组件&quot;">​</a></h3><p><code>TrChatUI</code> 是 <code>TrChat</code> 使用的界面组件，只负责展示数据和触发事件。需要自行处理消息请求、会话保存和数据更新时，可单独使用，前面的 <code>ui</code> 配置和插槽同样适用。</p><blockquote><p>复用已有会话或请求逻辑，也可以继续使用 <code>TrChat</code>，详见<a href="./chat-runtime.html#高级用法">高级用法</a>。</p></blockquote>`,11)),C(t(n(E),null,null,512),[[p,s.value]]),t(d,null,{default:a(()=>[t(n(u),{title:"处理发送与取消",description:"使用本地模拟回答，展示消息更新、发送中状态和取消操作，不连接真实服务或保存会话。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled-ui.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fcontrolled-ui.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onUnmounted%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatMessageItem%2C%20type%20ChatSendPayload%2C%20type%20ChatUIData%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cnconst%20messages%20%3D%20shallowRef%3CChatMessageItem%5B%5D%3E(%5B%5D)%5Cnconst%20sending%20%3D%20shallowRef(false)%5Cnlet%20replyTimer%3A%20ReturnType%3Ctypeof%20setTimeout%3E%20%7C%20undefined%5Cn%5Cnconst%20data%20%3D%20computed%3CChatUIData%3E(()%20%3D%3E%20(%7B%5Cn%20%20conversation%3A%20%7B%20activeId%3A%20'controlled-demo'%2C%20title%3A%20'%E5%BA%94%E7%94%A8%E5%8A%A9%E6%89%8B'%20%7D%2C%5Cn%20%20bubble%3A%20%7B%20messages%3A%20messages.value%20%7D%2C%5Cn%20%20sender%3A%20%7B%20loading%3A%20sending.value%20%7D%2C%5Cn%7D))%5Cn%5Cnfunction%20handleSubmit(payload%3A%20ChatSendPayload)%20%7B%5Cn%20%20if%20(!payload.text.trim()%20%7C%7C%20sending.value)%20return%5Cn%5Cn%20%20sending.value%20%3D%20true%5Cn%20%20messages.value%20%3D%20%5B...messages.value%2C%20%7B%20role%3A%20'user'%2C%20content%3A%20payload.text%20%7D%5D%5Cn%20%20inputValue.value%20%3D%20''%5Cn%20%20replyTimer%20%3D%20setTimeout(()%20%3D%3E%20%7B%5Cn%20%20%20%20messages.value%20%3D%20%5B...messages.value%2C%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60%E5%B7%B2%E6%94%B6%E5%88%B0%EF%BC%9A%24%7Bpayload.text%7D%60%20%7D%5D%5Cn%20%20%20%20replyTimer%20%3D%20undefined%5Cn%20%20%20%20sending.value%20%3D%20false%5Cn%20%20%7D%2C%201500)%5Cn%7D%5Cn%5Cnfunction%20handleCancel()%20%7B%5Cn%20%20clearTimeout(replyTimer)%5Cn%20%20replyTimer%20%3D%20undefined%5Cn%20%20sending.value%20%3D%20false%5Cn%7D%5Cn%5CnonUnmounted(handleCancel)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22controlled-ui-demo%5C%22%3E%5Cn%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20%3Adata%3D%5C%22data%5C%22%5Cn%20%20%20%20%20%20%3Aui%3D%5C%22%7B%20layout%3A%20%7B%20leftAside%3A%20false%2C%20rightAside%3A%20false%20%7D%20%7D%5C%22%5Cn%20%20%20%20%20%20v-model%3Ainput-value%3D%5C%22inputValue%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22handleCancel%5C%22%5Cn%20%20%20%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.controlled-ui-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.controlled-ui-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.controlled-ui-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{s.value=!1}),vueCode:n(S)},c({_:2},[k.value?{name:"vue",fn:a(()=>[t(n(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[22]||(e[22]=o(`<h4 id="数据与事件处理" tabindex="-1">数据与事件处理 <a class="header-anchor" href="#数据与事件处理" aria-label="Permalink to &quot;数据与事件处理&quot;">​</a></h4><p>通过 <code>data</code> 提供会话列表、消息和发送状态。用户发送消息、取消请求或切换会话时，在对应事件中执行项目的操作，并更新显示数据。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { computed, shallowRef } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatMessageItem, ChatUIData } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> inputValue</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ChatMessageItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;([])</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> sending</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shallowRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> computed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ChatUIData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  conversation: { title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;应用助手&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: { messages: messages.value },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  sender: { loading: sending.value },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}))</span></span></code></pre></div><table tabindex="0"><thead><tr><th>字段</th><th>用途</th><th>默认值</th></tr></thead><tbody><tr><td><code>conversation.title</code></td><td>设置页头标题</td><td>默认文案为“新对话”</td></tr><tr><td><code>bubble.messages</code></td><td>提供消息列表</td><td><code>[]</code></td></tr><tr><td><code>sender.loading</code></td><td>显示发送中状态，并切换为取消操作</td><td><code>false</code></td></tr></tbody></table><p>常见操作通过以下事件通知项目处理：</p><table tabindex="0"><thead><tr><th>用户操作</th><th>事件</th><th>项目需要处理</th></tr></thead><tbody><tr><td>发送消息</td><td><code>submit</code></td><td>发起请求，更新消息和发送状态</td></tr><tr><td>取消发送</td><td><code>cancel</code></td><td>停止请求，恢复发送状态</td></tr><tr><td>新建会话</td><td><code>create-conversation</code></td><td>清空当前选择或创建会话，更新显示数据</td></tr><tr><td>切换会话</td><td><code>switch-conversation</code></td><td>更新选中会话、标题和消息</td></tr><tr><td>重命名会话</td><td><code>rename-conversation</code></td><td>保存新标题并更新列表</td></tr><tr><td>删除会话</td><td><code>history-action</code></td><td>判断 <code>action.id === &#39;delete&#39;</code>，删除并更新数据</td></tr></tbody></table><p>例如，监听 <code>submit</code> 和 <code>cancel</code> 处理发送与取消，通过 <code>v-model:input-value</code> 同步输入内容：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChatUI</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">data</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">input-value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">inputValue</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  @</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">handleSubmit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  @</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cancel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">handleCancel</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/&gt;</span></span></code></pre></div><p><code>submit</code> 和 <code>cancel</code> 只通知项目处理操作，不会自动请求或停止服务。发送后是否清空输入、何时追加回答，由对应的事件处理方法决定。</p><p>输入区的清空按钮会清空输入；使用 <code>v-model</code> 时，会同步更新绑定值。清空输入不会删除消息或取消请求。</p><p>完整数据字段见 <a href="#chatuidata">ChatUIData</a>，属性和事件见 <a href="#trchatui-api">TrChatUI API</a>。</p><h4 id="受控与非受控" tabindex="-1">受控与非受控 <a class="header-anchor" href="#受控与非受控" aria-label="Permalink to &quot;受控与非受控&quot;">​</a></h4><p>输入内容、侧栏开闭等界面状态支持两种管理方式：</p><ul><li><strong>受控</strong>：由项目传入当前值并同步更新，适合填入预设问题、发送后清空输入或从外部打开侧栏。</li><li><strong>非受控</strong>：由组件维护状态，无需从外部同步更新，可按需设置初始值。</li></ul><p>以输入内容为例，受控方式通过 <code>v-model:input-value</code> 绑定当前内容，<code>inputValue</code> 可初始化为 <code>&#39;&#39;</code>：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChatUI</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">input-value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">inputValue</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">handleSubmit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>非受控方式不传入 <code>inputValue</code>，由组件维护输入。可通过 <code>defaultInputValue</code> 设置初始内容，默认 <code>&#39;&#39;</code>；后续修改该属性不会重置当前输入：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChatUI</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defaultInputValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;请介绍一下 TinyRobot&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">handleSubmit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>两种方式都能通过 <code>submit</code> 获取文本，但不会自动发送请求或清空输入。</p><blockquote><p>输入管理方式应在初始化时确定，不要在使用过程中切换。</p></blockquote><p>右栏和浮动窗口也支持这两种方式：</p><table tabindex="0"><thead><tr><th>状态</th><th>受控方式</th><th>非受控方式</th></tr></thead><tbody><tr><td>右栏开闭</td><td><code>v-model:right-aside-open</code></td><td>使用 <code>defaultRightAsideOpen</code> 设置初始值，默认 <code>false</code></td></tr><tr><td>当前右栏面板</td><td><code>v-model:active-right-aside-panel-id</code></td><td>使用 <code>defaultActiveRightAsidePanelId</code>；未指定有效面板时选择第一个可用面板</td></tr><tr><td>浮动窗口位置和尺寸</td><td><code>v-model:floating-state</code></td><td>不传入当前值，由组件维护内置窗口状态</td></tr></tbody></table><p>左栏通过 <code>ui.layout.leftAside.open</code> 设置当前开闭状态，并在 <code>left-aside-open-change</code> 中更新；不设置当前值时，可通过 <code>ui.layout.leftAside.defaultOpen</code> 设置初始状态，默认 <code>false</code>。</p><p>完整属性和事件见 <a href="#trchatui-api">TrChatUI API</a>，相关布局配置见 <a href="#右侧面板">右侧面板</a> 和 <a href="#浮动聊天窗口">浮动聊天窗口</a>。</p><h2 id="trchat-api" tabindex="-1">TrChat API <a class="header-anchor" href="#trchat-api" aria-label="Permalink to &quot;TrChat API&quot;">​</a></h2><h3 id="trchat-props" tabindex="-1">属性 <a class="header-anchor" href="#trchat-props" aria-label="Permalink to &quot;属性 {#trchat-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>runtime</code></td><td>提供会话、输入区状态和操作方法。</td><td><a href="./chat-runtime.html#状态与方法"><code>ChatRuntime</code></a></td><td>—</td><td>是</td></tr><tr><td><code>ui</code></td><td>配置页面布局、文案和区域。</td><td><a href="#界面配置"><code>ChatUIOptions</code></a></td><td>默认界面配置</td><td>否</td></tr><tr><td><code>title</code></td><td>覆盖当前会话提供的页面标题。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>history-data</code></td><td>覆盖 Runtime 会话生成的历史列表或分组。</td><td><a href="#展示数据类型"><code>ChatHistoryData</code></a></td><td>—</td><td>否</td></tr><tr><td><code>floating-state</code></td><td>由应用管理的浮动窗口位置和尺寸。</td><td><a href="./../components/layout.html#layout-floating-state"><code>LayoutFloatingState</code></a></td><td>—</td><td>否</td></tr><tr><td><code>right-aside-open</code></td><td>由应用管理的右栏开闭状态。</td><td><code>boolean</code></td><td>—</td><td>否</td></tr><tr><td><code>default-right-aside-open</code></td><td>组件管理右栏开闭时的初始值。</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>active-right-aside-panel-id</code></td><td>由应用管理的当前右栏面板，需处理更新事件。</td><td><code>ChatRightAsidePanelId</code></td><td>—</td><td>否</td></tr><tr><td><code>default-active-right-aside-panel-id</code></td><td>组件管理当前面板时的初始值。</td><td><code>ChatRightAsidePanelId</code></td><td>第一个可用面板</td><td>否</td></tr></tbody></table><h3 id="trchat-events" tabindex="-1">事件 <a class="header-anchor" href="#trchat-events" aria-label="Permalink to &quot;事件 {#trchat-events}&quot;">​</a></h3><p><code>TrChat</code> 会直接处理提交、取消、会话切换、模型选择和 MCP 开关操作，调用 Runtime 对应方法；这些事件不会再次向外发出。</p><table tabindex="0"><thead><tr><th>事件</th><th>参数</th><th>触发时机</th></tr></thead><tbody><tr><td><code>runtime-action-error</code></td><td><code>ChatRuntimeActionErrorPayload</code></td><td>Runtime 操作失败；send 错误详情仍从所属消息读取。</td></tr><tr><td><code>history-action</code></td><td><code>ChatHistoryActionPayload</code></td><td>历史菜单操作；删除操作可调用 <code>preventDefault()</code> 阻止默认 Runtime 删除。</td></tr><tr><td><code>prompt-click</code></td><td><code>ChatPromptClickPayload</code></td><td>点击提示项。</td></tr><tr><td><code>mcp-create-server</code></td><td><code>ChatMcpCreateServerPayload</code></td><td>请求创建 MCP 服务；Runtime 不处理创建表单。</td></tr><tr><td><code>bubble-state-change</code></td><td><code>ChatBubbleStateChangePayload</code></td><td>气泡内部状态变化。</td></tr><tr><td><code>bubble-event</code></td><td><code>ChatBubbleEventPayload</code></td><td>气泡内容发出自定义事件。</td></tr><tr><td><code>left-aside-open-change</code> / <code>right-aside-open-change</code></td><td><code>ChatAsideOpenChangePayload</code></td><td>侧栏状态变化。</td></tr><tr><td><code>update:right-aside-open</code></td><td><code>boolean</code></td><td>通知应用更新右栏开闭状态。</td></tr><tr><td><code>update:active-right-aside-panel-id</code></td><td><code>ChatRightAsidePanelId | undefined</code></td><td>通知应用更新当前右栏面板。</td></tr><tr><td><code>update:floating-state</code></td><td><a href="./../components/layout.html#layout-floating-state"><code>LayoutFloatingState</code></a></td><td>通知应用更新浮动窗口的位置和尺寸。</td></tr><tr><td><code>floating-drag-start</code> / <code>floating-drag</code> / <code>floating-drag-end</code></td><td><a href="./../components/layout.html#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a></td><td>浮动窗口开始拖动、拖动中或拖动结束。</td></tr><tr><td><code>floating-resize-start</code> / <code>floating-resize</code> / <code>floating-resize-end</code></td><td><a href="./../components/layout.html#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a></td><td>浮动窗口开始缩放、缩放中或缩放结束。</td></tr></tbody></table><h3 id="trchat-methods" tabindex="-1">组件方法 <a class="header-anchor" href="#trchat-methods" aria-label="Permalink to &quot;组件方法 {#trchat-methods}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>方法</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><code>send</code></td><td><code>(payload: ChatSendPayload) =&gt; Promise&lt;boolean&gt;</code></td><td>通过 Runtime 发送消息。</td></tr><tr><td><code>openRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>打开右栏，可同时指定面板。</td></tr><tr><td><code>closeRightAside</code></td><td><code>() =&gt; void</code></td><td>关闭右栏。</td></tr><tr><td><code>toggleRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>切换右栏，可同时指定面板。</td></tr><tr><td><code>activateRightAsidePanel</code></td><td><code>(panel: ChatRightAsidePanelId) =&gt; boolean</code></td><td>激活存在的面板并返回是否成功。</td></tr></tbody></table><h2 id="trchatui-api" tabindex="-1">TrChatUI API <a class="header-anchor" href="#trchatui-api" aria-label="Permalink to &quot;TrChatUI API&quot;">​</a></h2><h3 id="trchatui-props" tabindex="-1">属性 <a class="header-anchor" href="#trchatui-props" aria-label="Permalink to &quot;属性 {#trchatui-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>data</code></td><td>应用提供的显示数据；组件不会修改该对象。</td><td><a href="#chatuidata"><code>ChatUIData</code></a></td><td>空展示数据</td><td>否</td></tr><tr><td><code>ui</code></td><td>配置页面布局、文案和区域。</td><td><a href="#界面配置"><code>ChatUIOptions</code></a></td><td>默认界面配置</td><td>否</td></tr><tr><td><code>input-value</code></td><td>应用管理的输入内容，需处理更新事件。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>default-input-value</code></td><td>组件管理输入时的初始内容。</td><td><code>string</code></td><td><code>&#39;&#39;</code></td><td>否</td></tr><tr><td><code>floating-state</code></td><td>由应用管理的浮动窗口位置和尺寸。</td><td><a href="./../components/layout.html#layout-floating-state"><code>LayoutFloatingState</code></a></td><td>—</td><td>否</td></tr><tr><td><code>right-aside-open</code></td><td>由应用管理的右栏开闭状态。</td><td><code>boolean</code></td><td>—</td><td>否</td></tr><tr><td><code>default-right-aside-open</code></td><td>组件管理右栏开闭时的初始值。</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>active-right-aside-panel-id</code></td><td>由应用管理的当前面板，需处理更新事件。</td><td><code>ChatRightAsidePanelId</code></td><td>—</td><td>否</td></tr><tr><td><code>default-active-right-aside-panel-id</code></td><td>组件管理当前面板时的初始值。</td><td><code>ChatRightAsidePanelId</code></td><td>第一个可用面板</td><td>否</td></tr></tbody></table><p><code>input-value</code> 与 <code>default-input-value</code> 二选一，使用期间不切换输入管理方式。由应用管理左栏开闭时，通过 <code>ui.layout.leftAside.open</code> 设置状态，并在 <code>left-aside-open-change</code> 事件中更新该值。</p><h3 id="trchatui-events" tabindex="-1">事件 <a class="header-anchor" href="#trchatui-events" aria-label="Permalink to &quot;事件 {#trchatui-events}&quot;">​</a></h3><p>点击“新会话”时，<code>TrChatUI</code> 只触发 <code>create-conversation</code>，由项目决定清空当前选择还是立即创建会话。<code>TrChat</code> 会返回新会话页面；使用默认发送流程时，在发送首条非空消息时创建会话。</p><blockquote><p>配置自定义 <code>send</code> 时，不会自动创建会话，需由回调自行创建或选择会话，见 <a href="./chat-runtime.html#自定义发送流程">自定义发送流程</a>。</p></blockquote><p>以下事件需由项目自行处理：</p><table tabindex="0"><thead><tr><th>事件</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>submit</code></td><td><code>ChatSendPayload</code></td><td>发送请求并更新消息、请求状态和输入值。</td></tr><tr><td><code>update:input-value</code></td><td><code>string</code></td><td>由应用管理输入时，更新输入内容。</td></tr><tr><td><code>cancel</code> / <code>clear</code></td><td>无</td><td>中止请求或清空输入；组件不会修改外部请求。</td></tr><tr><td><code>create-conversation</code></td><td>无</td><td>清空当前会话或创建新会话。</td></tr><tr><td><code>switch-conversation</code></td><td><code>ChatSwitchConversationPayload</code></td><td>切换数据源并更新 <code>data.conversation.activeId</code>。</td></tr><tr><td><code>rename-conversation</code></td><td><code>ChatRenameConversationPayload</code></td><td>保存新标题并更新会话列表。</td></tr><tr><td><code>history-action</code></td><td><code>ChatHistoryActionPayload</code></td><td>处理历史菜单操作；<code>TrChatUI</code> 本身不会执行删除。</td></tr><tr><td><code>prompt-click</code></td><td><code>ChatPromptClickPayload</code></td><td>决定填充输入、直接提交或执行其他操作。</td></tr><tr><td><code>bubble-state-change</code> / <code>bubble-event</code></td><td>对应 payload</td><td>更新消息状态或处理自定义气泡事件。</td></tr><tr><td><code>model-select</code></td><td><code>ChatModelSelectPayload</code></td><td>更新 <code>data.model.selectedId</code>。</td></tr><tr><td><code>model-feature-change</code></td><td><code>ChatModelFeatureChangePayload</code></td><td>更新能力开关；异步时可同步 <code>pendingFeatureIds</code>。</td></tr><tr><td><code>model-reasoning-effort-change</code></td><td><code>ChatModelReasoningEffortChangePayload</code></td><td>更新思考强度。</td></tr><tr><td><code>mcp-add-server</code> / <code>mcp-remove-server</code></td><td><code>ChatMcpAddServerPayload</code> / <code>ChatMcpRemoveServerPayload</code></td><td>更新 MCP 服务列表。</td></tr><tr><td><code>mcp-create-server</code></td><td><code>ChatMcpCreateServerPayload</code></td><td>创建并接入自定义 MCP 服务。</td></tr><tr><td><code>mcp-server-enabled-change</code></td><td><code>ChatMcpServerEnabledChangePayload</code></td><td>更新 MCP 服务启用状态。</td></tr><tr><td><code>mcp-tool-enabled-change</code></td><td><code>ChatMcpToolEnabledChangePayload</code></td><td>更新工具启用状态。</td></tr><tr><td><code>left-aside-open-change</code> / <code>right-aside-open-change</code></td><td><code>ChatAsideOpenChangePayload</code></td><td>由应用管理侧栏时更新开闭状态；<code>source</code> 区分用户操作和浏览器窗口变化。</td></tr><tr><td><code>update:right-aside-open</code></td><td><code>boolean</code></td><td>更新应用管理的右栏开闭状态。</td></tr><tr><td><code>update:active-right-aside-panel-id</code></td><td><code>ChatRightAsidePanelId | undefined</code></td><td>更新应用管理的当前面板。</td></tr><tr><td><code>update:floating-state</code></td><td><a href="./../components/layout.html#layout-floating-state"><code>LayoutFloatingState</code></a></td><td>更新应用管理的浮动窗口位置和尺寸。</td></tr><tr><td><code>floating-drag-start</code> / <code>floating-drag</code> / <code>floating-drag-end</code></td><td><a href="./../components/layout.html#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a></td><td>处理窗口开始拖动、拖动中或拖动结束。</td></tr><tr><td><code>floating-resize-start</code> / <code>floating-resize</code> / <code>floating-resize-end</code></td><td><a href="./../components/layout.html#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a></td><td>处理窗口开始缩放、缩放中或缩放结束。</td></tr></tbody></table><h3 id="trchatui-methods" tabindex="-1">组件方法 <a class="header-anchor" href="#trchatui-methods" aria-label="Permalink to &quot;组件方法 {#trchatui-methods}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>方法</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><code>openRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>打开右栏，可同时指定面板。</td></tr><tr><td><code>closeRightAside</code></td><td><code>() =&gt; void</code></td><td>关闭右栏。</td></tr><tr><td><code>toggleRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>切换右栏，可同时指定面板。</td></tr><tr><td><code>activateRightAsidePanel</code></td><td><code>(panel: ChatRightAsidePanelId) =&gt; boolean</code></td><td>激活存在的面板并返回是否成功。</td></tr></tbody></table><h3 id="chatuidata" tabindex="-1">显示数据 <a class="header-anchor" href="#chatuidata" aria-label="Permalink to &quot;显示数据 {#chatuidata}&quot;">​</a></h3><p><code>ChatUIData</code> 是应用传给 <code>TrChatUI</code> 的显示数据，组件不会修改它。以下字段均为可选，对应区域见下表。</p><p>未配置的字段使用下表默认值。无需模型或 MCP 入口时，省略 <code>model</code> / <code>mcp</code>，或将 <code>ui.model</code> / <code>ui.mcp</code> 设为 <code>false</code>。</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>对应区域</th><th>默认行为</th></tr></thead><tbody><tr><td><code>conversation</code></td><td><code>ChatConversationView</code></td><td>页头标题、会话列表和当前选中</td><td>空列表、无选中，标题为“新对话”。</td></tr><tr><td><code>bubble</code></td><td><code>ChatBubbleView</code></td><td>消息主区</td><td><code>messages</code> 为空，进入空状态。</td></tr><tr><td><code>sender</code></td><td><code>ChatSenderView</code></td><td>输入区可用性与加载反馈</td><td>三个布尔状态均为 <code>false</code>。</td></tr><tr><td><code>model</code></td><td><code>ChatModelView</code></td><td>输入区模型选择器与能力开关</td><td>不显示模型选择器。</td></tr><tr><td><code>mcp</code></td><td><code>ChatMcpView</code></td><td>输入区 MCP 入口与内置右栏</td><td>不显示 MCP 入口或面板。</td></tr><tr><td><code>request</code></td><td><code>ChatRequestView</code></td><td>自定义主区和空状态插槽参数</td><td><code>undefined</code>；默认界面不额外显示状态。</td></tr></tbody></table><h4 id="conversation" tabindex="-1"><code>conversation</code> <a class="header-anchor" href="#conversation" aria-label="Permalink to &quot;\`conversation\`&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>ChatConversationInfo[]</code></td><td><code>[]</code></td><td>原始会话列表；未提供 <code>history</code> 时按当前数组顺序生成默认历史数据。</td></tr><tr><td><code>activeId</code></td><td><code>string | null</code></td><td><code>null</code></td><td>当前选中会话 ID；应用处理切换事件后更新。</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td>新对话</td><td>页头标题；空字符串会原样显示。</td></tr><tr><td><code>history</code></td><td><code>ChatHistoryData</code></td><td>—</td><td>应用提供的排序或分组结果；提供后优先于根据 <code>items</code> 生成的默认历史。</td></tr></tbody></table><p><code>ChatConversationInfo</code>、<code>ChatMessageItem</code> 及消息内容结构见 <a href="./chat-runtime.html#会话、消息与发送">数据与逻辑配置：会话、消息与发送</a>。</p><h4 id="bubble-与-sender" tabindex="-1"><code>bubble</code> 与 <code>sender</code> <a class="header-anchor" href="#bubble-与-sender" aria-label="Permalink to &quot;\`bubble\` 与 \`sender\`&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>bubble.messages</code></td><td><code>ChatMessageItem[]</code></td><td><code>[]</code></td><td>消息列表；组件不会追加、删除或保存消息。</td></tr><tr><td><code>sender.loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>显示发送中反馈并切换为取消操作。</td></tr><tr><td><code>sender.disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>禁用整个输入区。</td></tr><tr><td><code>sender.submitDisabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>仅禁止提交；输入仍可编辑。</td></tr></tbody></table><p>单独使用 <code>TrChatUI</code> 时，AI 消息的 <code>state.error</code> 用于显示错误提示，需要由应用写入。</p><h4 id="model" tabindex="-1"><code>model</code> <a class="header-anchor" href="#model" aria-label="Permalink to &quot;\`model\`&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>options</code></td><td><code>ChatModelOptionView[]</code></td><td>可选模型列表；为空时显示没有可选模型的提示。</td></tr><tr><td><code>selectedId</code></td><td><code>string | null</code></td><td>当前模型；选择后应用通过 <code>model-select</code> 写回。</td></tr><tr><td><code>features</code></td><td><code>Partial&lt;Record&lt;&#39;thinking&#39; | &#39;search&#39;, boolean&gt;&gt;</code></td><td>当前能力开关。</td></tr><tr><td><code>reasoning</code></td><td><code>{ enabled: boolean; effort?: string }</code></td><td>深度思考开关及当前思考强度。</td></tr><tr><td><code>selecting</code></td><td><code>boolean</code></td><td>模型切换中的整体等待状态。</td></tr><tr><td><code>reasoningSelecting</code></td><td><code>boolean</code></td><td>思考强度切换中的等待状态。</td></tr><tr><td><code>pendingFeatureIds</code></td><td><code>(&#39;thinking&#39; | &#39;search&#39;)[]</code></td><td>正在切换的能力，用于逐项等待反馈。</td></tr></tbody></table><p><code>ChatModelOptionView</code> 至少包含 <code>id</code> 和 <code>label</code>，还可提供 <code>description</code>、<code>icon</code>、<code>disabled</code>、<code>group</code>、思考强度选项（<code>efforts</code>）、默认强度（<code>defaultEffort</code>）、支持的功能和 <code>metadata</code>。选择器弹出面板所在的容器由 <code>ui.model.appendTo</code> 配置，其他行为见 <a href="./../components/model-selector.html">ModelSelector</a>。</p><h4 id="mcp" tabindex="-1"><code>mcp</code> <a class="header-anchor" href="#mcp" aria-label="Permalink to &quot;\`mcp\`&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>servers</code></td><td><code>ChatMcpServerView[]</code></td><td>MCP 服务的安装、启用、加载和错误状态；应用处理对应事件后写回。</td></tr><tr><td><code>tools</code></td><td><code>ChatMcpToolMap</code></td><td>以 MCP 服务 ID 为键的工具数组；工具包含 <code>id</code>、<code>name</code>、<code>enabled</code> 等。</td></tr></tbody></table><p><code>ChatMcpServerView</code> 要求 <code>id</code>、<code>name</code>、<code>installed</code> 和 <code>enabled</code>；可选 <code>description</code>、<code>icon</code>、<code>category</code>、<code>loading</code>、<code>error</code> 与 <code>metadata</code>。<code>ChatMcpToolView</code> 要求 <code>id</code>、<code>name</code> 和 <code>enabled</code>，可选 <code>description</code> 与 <code>loading</code>。只有 <code>ui.mcp</code> 与 <code>ui.layout.rightAside</code> 都未设为 <code>false</code> 时，MCP 入口和内置面板才可见。</p><p>内置右栏使用 <a href="./../components/extension-manager.html">ExtensionManager</a> 将 MCP 服务按“已安装”和“可安装”分区；点击已安装项名称进入 <a href="./../components/mcp-extension.html">MCP 详情</a>切换工具，点击“自定义添加”进入 MCP 表单。表单验证通过后，<code>mcp-create-server</code> 发出 <code>{ config, source }</code>；<code>config</code> 是整理后的单个 MCP 服务连接配置，<code>source</code> 为 <code>&#39;form&#39;</code> 或 <code>&#39;code&#39;</code>。Chat 不保存自定义 MCP 服务，应用收到事件后负责保存并更新 <code>mcp.servers</code>。服务的 <code>loading</code> 状态会禁用其列表操作，工具的 <code>loading</code> 状态会禁用对应开关。</p><h4 id="request" tabindex="-1"><code>request</code> <a class="header-anchor" href="#request" aria-label="Permalink to &quot;\`request\`&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>state</code></td><td><code>&#39;idle&#39; | &#39;processing&#39; | &#39;completed&#39; | &#39;paused&#39; | &#39;aborted&#39; | &#39;error&#39;</code></td><td>是</td><td>请求状态。</td></tr><tr><td><code>processingState</code></td><td><code>&#39;requesting&#39; | &#39;completing&#39; | string</code></td><td>否</td><td>应用定义的处理中阶段。</td></tr></tbody></table><p><code>request</code> 会传给 <code>layout-main</code> 和 <code>layout-empty-state</code>。默认界面的发送中反馈读取 <code>sender.loading</code>，消息错误读取 <code>message.state.error</code>；只更新 <code>request</code> 不会自动渲染这些反馈。</p><h2 id="公共配置" tabindex="-1">公共配置 <a class="header-anchor" href="#公共配置" aria-label="Permalink to &quot;公共配置&quot;">​</a></h2><p>以下界面配置和插槽均适用于 <code>TrChat</code> 和 <code>TrChatUI</code>。</p><h3 id="界面配置" tabindex="-1">界面配置 <a class="header-anchor" href="#界面配置" aria-label="Permalink to &quot;界面配置&quot;">​</a></h3><p><code>TrChat</code> 和 <code>TrChatUI</code> 都通过 <code>ui</code> 接收 <code>ChatUIOptions</code>，配置布局、文案和各区域的显示方式。</p><p>未配置时使用默认界面。支持 <code>false</code> 的区域可通过它隐藏，其他选项见下表。</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>配置说明</th><th><code>false</code> 的作用</th></tr></thead><tbody><tr><td><code>layout</code></td><td><code>ChatLayoutOptions</code></td><td>未配置的布局字段使用默认值；窗口、输入区和左右侧栏可分别配置。</td><td>不支持；使用 <code>leftAside</code> / <code>rightAside</code>。</td></tr><tr><td><code>brand</code></td><td><code>ChatBrandOptions</code></td><td>提供的选项覆盖对应的默认名称或图标，默认名称为 <code>TinyRobot</code>。</td><td>不支持。</td></tr><tr><td><code>labels</code></td><td><code>Partial&lt;ChatLabels&gt;</code></td><td>按字段覆盖内置中文文案；也会更新默认欢迎文案和历史菜单文案。</td><td>不支持。</td></tr><tr><td><code>header</code></td><td><code>false</code></td><td>省略时显示默认 Header。</td><td>移除 Header。</td></tr><tr><td><code>history</code></td><td><code>false | ChatHistoryOptions</code></td><td>与默认 History 选项合并；<code>menuItems</code> 整体替换默认重命名、删除菜单。</td><td>隐藏历史列表，左栏品牌和操作仍在。</td></tr><tr><td><code>welcome</code></td><td><code>false | ChatWelcomeOptions</code></td><td>与默认欢迎区配置合并；未提供标题和描述时使用 <code>labels</code> 中的文案。</td><td>空会话不显示欢迎区。</td></tr><tr><td><code>prompts</code></td><td><code>false | ChatPromptsOptions</code></td><td>与默认 Prompts 选项合并；<code>items</code> 整体替换，默认 <code>[]</code>。</td><td>不显示提示项。</td></tr><tr><td><code>bubble</code></td><td><code>ChatBubbleOptions</code></td><td>合并气泡渲染和列表配置；<code>autoScroll</code> 默认 <code>true</code>，<code>system</code> 消息默认隐藏。</td><td>不支持。</td></tr><tr><td><code>sender</code></td><td><code>false | ChatSenderOptions</code></td><td>提供的选项覆盖对应的默认输入区选项。</td><td>移除输入区及其插槽。</td></tr><tr><td><code>model</code></td><td><code>false | ChatModelOptions</code></td><td>默认 <code>{}</code>；只有 <code>data.model</code> 存在时显示。</td><td>即使存在模型数据也隐藏选择器。</td></tr><tr><td><code>mcp</code></td><td><code>false | ChatMcpOptions</code></td><td>默认 <code>{}</code>；当前没有额外配置字段。</td><td>即使存在 MCP 数据也隐藏入口和面板。</td></tr></tbody></table><h4 id="layout" tabindex="-1"><code>layout</code> <a class="header-anchor" href="#layout" aria-label="Permalink to &quot;\`layout\`&quot;">​</a></h4><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>surface.mode</code></td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>&#39;normal&#39;</code></td><td>页面或浮动窗口；浮动时读取 <code>floatingOptions</code> 与 <code>floating-state</code>。</td></tr><tr><td><code>emptyState</code></td><td><code>&#39;start&#39; | &#39;center&#39;</code></td><td><code>&#39;start&#39;</code></td><td>空状态在主区起始位置或居中。</td></tr><tr><td><code>composer.welcome</code></td><td><code>&#39;footer&#39; | &#39;center&#39;</code></td><td><code>&#39;footer&#39;</code></td><td>空会话时的输入区位置：<code>&#39;footer&#39;</code> 位于页面底部；<code>&#39;center&#39;</code> 随内置欢迎区居中显示，需保留默认内容布局、欢迎区和输入区。</td></tr><tr><td><code>contentMaxWidth</code></td><td><code>string | number</code></td><td><code>980</code></td><td>消息、欢迎区和输入区的最大内容宽度。</td></tr><tr><td><code>panelPadding</code> / <code>panelGap</code></td><td><code>string | number</code></td><td><code>12</code> / <code>12</code></td><td>内容区内边距与区域间距。</td></tr><tr><td><code>leftAside</code></td><td><code>false | ChatAsideOptions</code></td><td>Dock，<code>300</code> / <code>56</code>，关闭</td><td>左栏；<code>open</code> 由应用管理，<code>defaultOpen</code> 仅设置组件管理开闭时的初始值。</td></tr><tr><td><code>rightAside</code></td><td><code>false | ChatRightAsideOptions</code></td><td>Dock，宽 <code>320</code>，不可缩放</td><td>右栏；只有注册应用面板或存在可见 MCP 数据时才渲染。</td></tr></tbody></table><p><code>leftAside</code> 和 <code>rightAside</code> 的配置字段如下，尺寸字段的单位均为 px：</p><table tabindex="0"><thead><tr><th>字段</th><th>类型或可选值</th><th>默认值或未配置行为</th><th>用途</th></tr></thead><tbody><tr><td><code>mode</code></td><td><code>&#39;dock&#39; | &#39;drawer&#39;</code></td><td><code>&#39;dock&#39;</code>；浏览器视口低于 <code>960px</code> 时自动使用 <code>&#39;drawer&#39;</code></td><td>侧栏与消息区并排，或以抽屉覆盖消息区</td></tr><tr><td><code>width</code></td><td><code>number</code></td><td>左栏 <code>300</code>；右栏 <code>320</code></td><td>展开宽度</td></tr><tr><td><code>collapsedWidth</code></td><td><code>number</code></td><td>左栏 <code>56</code>；右栏 <code>0</code></td><td>收起宽度；移动端使用 <code>0</code></td></tr><tr><td><code>resizable</code></td><td><code>boolean</code></td><td><code>false</code></td><td>允许拖动调整展开宽度，仅桌面端并排模式生效</td></tr><tr><td><code>minWidth</code></td><td><code>number</code></td><td>左栏 <code>200</code>；右栏 <code>240</code></td><td>最小展开宽度</td></tr><tr><td><code>maxWidth</code></td><td><code>number</code></td><td>左栏 <code>560</code>；右栏 <code>640</code></td><td>最大展开宽度</td></tr><tr><td><code>open</code></td><td><code>boolean</code></td><td>未设置时由组件管理</td><td>仅左栏；由项目控制开闭时，需处理 <code>left-aside-open-change</code> 并更新值</td></tr><tr><td><code>defaultOpen</code></td><td><code>boolean</code></td><td><code>false</code></td><td>仅左栏；由组件管理开闭时的初始值</td></tr><tr><td><code>showClose</code></td><td><code>boolean</code></td><td><code>true</code></td><td>仅右栏；是否显示关闭按钮</td></tr><tr><td><code>panels</code></td><td><code>ChatRightAsidePanelOptions[]</code></td><td><code>[]</code></td><td>仅右栏；每项必填 <code>id</code>，可选 <code>title</code></td></tr></tbody></table><p>右栏开闭和当前面板通过组件属性设置，见 <a href="#trchat-props">TrChat 属性</a>。浮动窗口的配置结构、尺寸限制和状态绑定见 <a href="#浮动聊天窗口">浮动聊天窗口</a>。</p><p><code>panels</code> 需要配合 <code>layout-right-aside</code> 或 <code>layout-right-aside-panel</code> 插槽提供内容；面板 ID 不能重复，也不能使用内置保留 ID <code>mcp</code>。<code>layout-right-aside-title</code> 和 <code>layout-right-aside-panel</code> 只用于应用添加的面板，不替换 MCP 面板。</p><h4 id="各区域配置" tabindex="-1">各区域配置 <a class="header-anchor" href="#各区域配置" aria-label="Permalink to &quot;各区域配置&quot;">​</a></h4><table tabindex="0"><thead><tr><th>配置项</th><th>说明</th><th>相关组件</th></tr></thead><tbody><tr><td><code>brand</code></td><td><code>name?: string</code>、<code>logo?: unknown</code>。</td><td>—</td></tr><tr><td><code>labels</code></td><td>会话创建/重命名/删除、侧栏展开/收起、输入占位、模型、MCP、Welcome、右栏和滚动到底部等文案。</td><td>—</td></tr><tr><td><code>history</code></td><td>默认菜单为重命名和删除；Chat 固定管理 <code>data</code>、<code>selected</code> 与事件。</td><td><a href="./../components/history.html">History</a></td></tr><tr><td><code>welcome</code></td><td>默认标题与描述来自 <code>labels.welcomeTitle</code>、<code>labels.welcomeDescription</code>。</td><td><a href="./../components/welcome.html">Welcome</a></td></tr><tr><td><code>prompts</code></td><td><code>items?: PromptProps[]</code>，其余展示选项继承 Prompts。</td><td><a href="./../components/prompts.html">Prompts</a></td></tr><tr><td><code>bubble</code></td><td><code>autoScroll</code>、<code>bubbleProvider</code>、<code>bubbleList</code>；消息错误提示配置见<a href="#消息错误提示配置">消息错误提示配置</a>。</td><td><a href="./../components/bubble.html">Bubble</a></td></tr><tr><td><code>sender</code></td><td>默认 <code>mode: &#39;multiple&#39;</code>、<code>clearable: true</code>、<code>maxLength: 1000</code>、<code>showWordLimit: true</code>；值和禁用状态由 Chat 管理。</td><td><a href="./../components/sender.html">Sender</a></td></tr><tr><td><code>model</code></td><td>当前字段为 <code>appendTo?: ModelSelectorProps[&#39;appendTo&#39;]</code>。</td><td><a href="./../components/model-selector.html">ModelSelector</a></td></tr><tr><td><code>mcp</code></td><td><code>Record&lt;string, never&gt;</code>，当前没有配置字段。</td><td>—</td></tr></tbody></table><p><code>ChatLabels</code> 的字段为 <code>newConversationTitle</code>、<code>createConversation</code>、<code>renameConversation</code>、<code>deleteConversation</code>、<code>expandConversationList</code>、<code>collapseConversationList</code>、<code>composerPlaceholder</code>、<code>composerLoadingPlaceholder</code>、<code>selectModel</code>、<code>searchModel</code>、<code>modelEmptyText</code>、<code>mcp</code>、<code>mcpInstallServer</code>、<code>mcpRemoveServer</code>、<code>thinkingFeature</code>、<code>searchFeature</code>、<code>welcomeTitle</code>、<code>welcomeDescription</code>、<code>rightAsideTitle</code>、<code>openRightAside</code>、<code>closeRightAside</code> 和 <code>scrollToBottom</code>，字段值均为 <code>string</code>。</p><h3 id="插槽" tabindex="-1">插槽 <a class="header-anchor" href="#插槽" aria-label="Permalink to &quot;插槽&quot;">​</a></h3><p>以下插槽适用于 <code>TrChat</code> 和 <code>TrChatUI</code>。插槽参数中的发送、会话、模型和 MCP 操作，在 <code>TrChat</code> 中调用当前 Runtime；在 <code>TrChatUI</code> 中触发事件，需要项目处理事件并更新数据。</p><table tabindex="0"><thead><tr><th>插槽</th><th>插槽参数</th><th>说明</th></tr></thead><tbody><tr><td><code>layout-header</code></td><td><code>ChatHeaderSlotProps</code></td><td>替换页头。</td></tr><tr><td><code>layout-left-aside</code></td><td><code>ChatLeftAsideSlotProps</code></td><td>替换左侧展开面板。</td></tr><tr><td><code>layout-left-aside-brand</code> / <code>layout-left-aside-actions</code> / <code>layout-left-aside-rail</code></td><td><code>ChatLeftAsideSlotProps</code></td><td>分别替换左栏品牌、操作和收起时的操作区域。</td></tr><tr><td><code>layout-left-aside-footer</code></td><td><code>ChatLeftAsideSlotProps</code></td><td>在左栏底部添加内容。</td></tr><tr><td><code>layout-left-aside-content</code></td><td><code>ChatLeftAsideContentSlotProps</code></td><td>替换左栏内容区，包括默认会话列表。</td></tr><tr><td><code>layout-left-aside-history-item-prefix</code></td><td><code>ChatHistoryItemPrefixSlotProps</code></td><td>在历史项前添加内容。</td></tr><tr><td><code>layout-right-aside</code></td><td><code>ChatRightAsidePanelSlotProps</code></td><td>替换整个右栏及其面板。</td></tr><tr><td><code>layout-right-aside-title</code></td><td><code>ChatRightAsideTitleSlotProps</code></td><td>替换应用添加的面板标题。</td></tr><tr><td><code>layout-right-aside-panel</code></td><td><code>ChatRightAsidePanelSlotProps</code></td><td>提供应用添加的面板内容。</td></tr><tr><td><code>layout-main</code></td><td><code>ChatMainSlotProps</code></td><td>替换消息区和空状态内容，保留外层滚动区域；优先于 <code>layout-empty-state</code>。</td></tr><tr><td><code>layout-empty-state</code></td><td><code>ChatEmptyStateSlotProps</code></td><td>替换没有消息时的内容；需要显示默认输入区时，调用 <code>renderComposer()</code>。</td></tr><tr><td><code>layout-footer</code></td><td><code>ChatSenderSlotProps</code></td><td>替换默认输入框，需自行连接输入和提交操作；保留 <code>composer-before</code> 和 <code>composer-after</code>。</td></tr><tr><td><code>composer-before</code></td><td><code>ChatSenderSlotProps</code></td><td>在输入框外上方添加内容，不替换输入框；随输入区显示，<code>ui.sender: false</code> 时隐藏。</td></tr><tr><td><code>composer-after</code></td><td><code>ChatSenderSlotProps</code></td><td>在输入框外下方添加提示、链接等内容，不替换输入框；随输入区显示，<code>ui.sender: false</code> 时隐藏。</td></tr><tr><td><code>sender-header</code></td><td>无</td><td>在默认输入框内部上方添加内容。</td></tr><tr><td><code>sender-footer</code></td><td>无</td><td>在默认多行输入框内部底部左侧添加内容，与模型和工具操作同一区域。</td></tr><tr><td><code>sender-footer-right</code></td><td>无</td><td>在默认多行输入框内部底部右侧、默认操作按钮前添加内容。</td></tr><tr><td><code>header-notice</code> / <code>welcome-footer</code> / <code>prompts-footer</code></td><td>无</td><td>扩展对应区域。</td></tr><tr><td><code>bubble-prefix</code> / <code>bubble-suffix</code> / <code>bubble-after</code></td><td><code>ChatBubbleSlotProps</code></td><td>在消息周围添加内容。</td></tr><tr><td><code>bubble-content-footer</code></td><td><code>ChatBubbleContentFooterSlotProps</code></td><td>在消息内容下方添加内容。</td></tr></tbody></table><h2 id="类型索引" tabindex="-1">类型索引 <a class="header-anchor" href="#类型索引" aria-label="Permalink to &quot;类型索引&quot;">​</a></h2><h4 id="组件类型" tabindex="-1">组件类型 <a class="header-anchor" href="#组件类型" aria-label="Permalink to &quot;组件类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>类别</th><th>说明</th></tr></thead><tbody><tr><td><code>ChatUIProps</code></td><td><code>interface</code></td><td><code>TrChatUI</code> 的属性类型，属性名采用小驼峰写法。</td></tr><tr><td><code>ChatUIEmits</code></td><td><code>interface</code></td><td><code>TrChatUI</code> 的事件及参数类型。</td></tr><tr><td><code>ChatUISlots</code></td><td><code>interface</code></td><td><code>TrChat</code> 和 <code>TrChatUI</code> 的插槽及参数类型。</td></tr><tr><td><code>ChatUIData</code></td><td><code>interface</code></td><td>显示数据；字段行为见 <a href="#chatuidata">ChatUIData</a>。</td></tr><tr><td><code>ChatUIOptions</code></td><td><code>interface</code></td><td>界面配置；字段行为见 <a href="#界面配置">ChatUIOptions</a>。</td></tr><tr><td><code>ChatCssSize</code></td><td><code>type</code></td><td><code>string | number</code>。</td></tr><tr><td><code>ChatWelcomeComposerPlacement</code></td><td><code>type</code></td><td><code>&#39;footer&#39; | &#39;center&#39;</code>。</td></tr><tr><td><code>ChatRightAsidePanelId</code></td><td><code>type</code></td><td><code>string</code>。</td></tr><tr><td><code>ChatRightAsidePanelContext</code></td><td><code>interface</code></td><td>当前 <code>panelId</code> 与可选的面板配置。</td></tr><tr><td><code>ChatBuiltInModelFeature</code></td><td><code>type</code></td><td><code>&#39;thinking&#39; | &#39;search&#39;</code>。</td></tr><tr><td><code>ChatRequestState</code></td><td><code>type</code></td><td>请求状态类型。</td></tr><tr><td><code>ChatProcessingState</code></td><td><code>type</code></td><td><code>&#39;requesting&#39; | &#39;completing&#39; | string</code>。</td></tr></tbody></table><p>会话、消息和操作相关类型见 <a href="./chat-runtime.html#api">数据与逻辑配置 API</a>。</p><h4 id="展示数据类型" tabindex="-1">展示数据类型 <a class="header-anchor" href="#展示数据类型" aria-label="Permalink to &quot;展示数据类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>ChatConversationView</code></td><td>会话列表、当前 ID、标题和可选历史分组。</td></tr><tr><td><code>ChatHistoryData</code></td><td><code>ChatConversationInfo[] | ChatHistoryGroup[]</code>。</td></tr><tr><td><code>ChatHistoryGroup</code></td><td><code>group: string | symbol</code> 与 <code>items</code>。</td></tr><tr><td><code>ChatBubbleView</code></td><td>消息列表容器。</td></tr><tr><td><code>ChatSenderView</code></td><td>输入区 loading、disabled 与 submitDisabled 状态。</td></tr><tr><td><code>ChatRequestView</code></td><td>请求 <code>state</code> 与可选 <code>processingState</code>。</td></tr><tr><td><code>ChatModelView</code></td><td>模型列表、选中值、功能开关、思考强度和加载状态。</td></tr><tr><td><code>ChatModelOptionView</code></td><td>单个模型的名称、支持的功能、思考强度与附加信息。</td></tr><tr><td><code>ChatMcpView</code></td><td>MCP 服务列表与工具映射。</td></tr><tr><td><code>ChatMcpServerView</code></td><td>单个 MCP 服务的安装、启用、加载和错误状态。</td></tr><tr><td><code>ChatMcpToolView</code></td><td>单个工具的名称、启用和加载状态。</td></tr><tr><td><code>ChatMcpToolMap</code></td><td><code>Partial&lt;Record&lt;string, readonly ChatMcpToolView[]&gt;&gt;</code>，键为 MCP 服务 ID。</td></tr></tbody></table><h4 id="界面配置类型" tabindex="-1">界面配置类型 <a class="header-anchor" href="#界面配置类型" aria-label="Permalink to &quot;界面配置类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>ChatLayoutOptions</code></td><td>页面显示方式、空状态、内容宽度、间距和两侧栏。</td></tr><tr><td><code>ChatSurfaceOptions</code></td><td>普通页面或浮动窗口配置。</td></tr><tr><td><code>ChatComposerLayoutOptions</code></td><td>欢迎区中输入区的位置。</td></tr><tr><td><code>ChatBrandOptions</code></td><td>品牌名称与图标。</td></tr><tr><td><code>ChatLabels</code></td><td>Chat 所有内置中文文案字段。</td></tr><tr><td><code>ChatAsideOptions</code></td><td>左栏显示方式、宽度、拖动调整与开闭状态。</td></tr><tr><td><code>ChatRightAsideOptions</code></td><td>右栏模式、宽度、缩放与面板注册。</td></tr><tr><td><code>ChatRightAsidePanelOptions</code></td><td><code>id</code> 与可选 <code>title</code>。</td></tr><tr><td><code>ChatHistoryOptions</code></td><td>支持 <a href="./../components/history.html">History</a> 的配置，不支持 <code>data</code>、<code>selected</code> 和 <code>onItemAction</code>。</td></tr><tr><td><code>ChatBubbleOptions</code></td><td>气泡渲染、列表和自动滚动配置。</td></tr><tr><td><code>ChatBubbleListOptions</code></td><td>支持 <a href="./../components/bubble.html">BubbleList</a> 的配置，不支持 <code>messages</code> 和 <code>autoScroll</code>。</td></tr><tr><td><code>ChatWelcomeOptions</code></td><td>支持 <a href="./../components/welcome.html">Welcome</a> 的配置，所有字段均可选。</td></tr><tr><td><code>ChatPromptsOptions</code></td><td>支持 <a href="./../components/prompts.html">Prompts</a> 的配置，<code>items?: PromptProps[]</code> 用于设置推荐问题。</td></tr><tr><td><code>ChatSenderOptions</code></td><td>支持 <a href="./../components/sender.html">Sender</a> 的配置，不支持 <code>modelValue</code>、<code>defaultValue</code>、<code>loading</code> 和 <code>disabled</code>；<code>defaultActions</code> 使用 <code>ChatSenderDefaultActions</code>。</td></tr><tr><td><code>ChatSenderDefaultActions</code></td><td>输入区默认按钮配置，支持 <code>DefaultActions</code> 中除 <code>submit.disabled</code> 外的配置；提交禁用状态通过 <code>data.sender.submitDisabled</code> 设置。</td></tr><tr><td><code>ChatModelOptions</code></td><td>模型选择器弹出面板所在容器的配置。</td></tr><tr><td><code>ChatMcpOptions</code></td><td>当前为空对象配置。</td></tr></tbody></table><h4 id="插槽参数" tabindex="-1">插槽参数 <a class="header-anchor" href="#插槽参数" aria-label="Permalink to &quot;插槽参数&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>字段</th></tr></thead><tbody><tr><td><code>ChatHeaderSlotProps</code></td><td><code>title</code>；<code>isEmpty</code>；<code>conversation</code>；<code>createConversation()</code>；<code>isLeftAsideOpen</code>；<code>openLeftAside()</code>；<code>closeLeftAside()</code>；<code>toggleLeftAside()</code>；<code>openRightAside(panel?)</code>；<code>closeRightAside()</code></td></tr><tr><td><code>ChatLeftAsideSlotProps</code></td><td><code>conversation</code>；<code>isOpen</code>；<code>isDock</code>；<code>createConversation()</code>；<code>switchConversation(id)</code>；<code>renameConversation(id, title)</code>；<code>deleteConversation(id)</code>；<code>openLeftAside()</code>；<code>closeLeftAside()</code>；<code>toggleLeftAside()</code></td></tr><tr><td><code>ChatLeftAsideContentSlotProps</code></td><td>包含 <code>ChatLeftAsideSlotProps</code> 的全部参数，另有 <code>history?: ChatHistoryData</code>。</td></tr><tr><td><code>ChatHistoryItemPrefixSlotProps</code></td><td><code>item: ChatConversationInfo</code></td></tr><tr><td><code>ChatRightAsidePanelSlotProps</code></td><td><code>panelId?</code>；<code>panel?</code>；<code>panels</code>；右栏打开、关闭、切换和激活方法；<code>isRightAsideOpen</code></td></tr><tr><td><code>ChatRightAsideTitleSlotProps</code></td><td><code>panelId?</code>；<code>panel?</code></td></tr><tr><td><code>ChatSenderSlotProps</code></td><td><code>value</code>；<code>loading</code>；<code>disabled</code>；<code>submitDisabled</code>；输入更新、提交、取消和清空方法</td></tr><tr><td><code>ChatMainSlotProps</code></td><td><code>messages</code>；<code>request?</code>；<code>conversation</code></td></tr><tr><td><code>ChatEmptyStateSlotProps</code></td><td><code>messages</code>；<code>request?</code>；<code>conversation</code>；<code>isEmpty: true</code>；<code>renderComposer()</code></td></tr><tr><td><code>ChatBubbleSlotProps</code></td><td><code>messages</code>；<code>role?</code>；<code>messageIndexes</code></td></tr><tr><td><code>ChatBubbleContentFooterSlotProps</code></td><td><code>messages</code>；<code>role?</code>；<code>messageIndexes</code>；<code>contentIndex?: number</code></td></tr></tbody></table><h4 id="事件参数" tabindex="-1">事件参数 <a class="header-anchor" href="#事件参数" aria-label="Permalink to &quot;事件参数&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>字段</th></tr></thead><tbody><tr><td><code>ChatSendPayload</code></td><td><code>text: string</code>；<code>structuredData?: ChatStructuredData</code></td></tr><tr><td><code>ChatStructuredData</code></td><td><code>ChatStructuredDataItem[]</code></td></tr><tr><td><code>ChatStructuredDataItem</code></td><td><code>type: string</code> 用于标识数据种类；其他字段按该种类提供，字段值类型为 <code>unknown</code>。</td></tr><tr><td><code>ChatHistoryActionPayload</code></td><td><code>action: HistoryMenuItem</code>；<code>conversation: ChatConversationInfo</code>；<code>defaultPrevented</code>；<code>preventDefault()</code></td></tr><tr><td><code>ChatSwitchConversationPayload</code></td><td><code>conversationId: string</code></td></tr><tr><td><code>ChatRenameConversationPayload</code></td><td><code>conversationId: string</code>；<code>title: string</code></td></tr><tr><td><code>ChatPromptClickPayload</code></td><td><code>event: MouseEvent</code>；<code>item: PromptProps</code></td></tr><tr><td><code>ChatModelSelectPayload</code></td><td><code>modelId: string | null</code></td></tr><tr><td><code>ChatModelFeatureChangePayload</code></td><td><code>featureId: &#39;thinking&#39; | &#39;search&#39;</code>；<code>enabled: boolean</code></td></tr><tr><td><code>ChatModelReasoningEffortChangePayload</code></td><td><code>effort: string | null</code></td></tr><tr><td><code>ChatMcpAddServerPayload</code> / <code>ChatMcpRemoveServerPayload</code></td><td><code>serverId: string</code></td></tr><tr><td><code>ChatMcpCreateServerPayload</code></td><td><code>config: McpExtensionFormValue</code>；<code>source: McpExtensionFormMode</code></td></tr><tr><td><code>ChatMcpServerEnabledChangePayload</code></td><td><code>serverId: string</code>；<code>enabled: boolean</code></td></tr><tr><td><code>ChatMcpToolEnabledChangePayload</code></td><td><code>serverId: string</code>；<code>toolId: string</code>；<code>enabled: boolean</code></td></tr><tr><td><code>ChatAsideOpenChangePayload</code></td><td><code>open: boolean</code>；<code>source: &#39;user&#39; | &#39;viewport&#39;</code></td></tr><tr><td><code>ChatBubbleStateChangePayload</code></td><td><code>key</code>；<code>value</code>；<code>messageIndex</code>；<code>contentIndex</code></td></tr><tr><td><code>ChatBubbleEventPayload</code></td><td><code>name</code>；<code>payload?</code>；<code>messageIndex</code>；<code>contentIndex</code></td></tr></tbody></table><p><code>LayoutFloatingState</code>、<code>LayoutFloatingDragDetail</code>、<code>LayoutFloatingResizeDetail</code>、<code>HistoryMenuItem</code>、<code>PromptProps</code>、<code>BubbleMessage</code>、<code>ModelSelectorReasoningEffortOption</code>、<code>McpExtensionFormValue</code> 和 <code>McpExtensionFormMode</code> 来自 <code>@opentiny/tiny-robot</code>。气泡状态、事件和渲染器见 <a href="./../components/bubble.html">Bubble</a>。</p><h2 id="常见问题" tabindex="-1">常见问题 <a class="header-anchor" href="#常见问题" aria-label="Permalink to &quot;常见问题&quot;">​</a></h2><h3 id="页面没有高度或消息区不滚动" tabindex="-1">页面没有高度或消息区不滚动 <a class="header-anchor" href="#页面没有高度或消息区不滚动" aria-label="Permalink to &quot;页面没有高度或消息区不滚动&quot;">​</a></h3><p>聊天界面默认使用浏览器视口高度。嵌入已有页面时，检查父容器是否有明确高度，以及是否设置了 <code>--tr-layout-height: 100%</code>，见 <a href="#基础布局">基础布局</a>。使用百分比高度时，祖先容器也需要有明确高度；使用 flex 布局时，检查消息区所在的子项是否允许收缩（如设置 <code>min-height: 0</code>）。</p>`,97))])}}});export{j as __pageData,K as default};
