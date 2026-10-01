const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/responsive-layout.DkGbKcfh.js","assets/chunks/index.CBbZfu1y.js","assets/chunks/framework.BHsLpWB3.js","assets/chunks/theme.CaZx_sMv.js","assets/chunks/index.CtMmZvOy.js","assets/chunks/floating-layout.YxijAf1R.js","assets/chunks/right-aside-panel.BH28BPmw.js","assets/chunks/modelProviders.BIAMQmdt.js","assets/chunks/layout-presets.D-qgdCrf.js","assets/chunks/controlled-ui.Li5J_-I9.js","assets/chunks/runtime-error.CDlx3xpJ.js","assets/chunks/data-driven-ui.o0dGuz6k.js","assets/chunks/basic.ByeSO09s.js"])))=>i.map(i=>d[i]);
import{aD as s,bQ as r,aZ as k,aL as _,v as x,H as c,bL as C,bB as l,J as t,bk as d,bJ as a,G as p,w as E,I as B,b7 as h,aU as w}from"./chunks/framework.BHsLpWB3.js";import{T as P,a as I}from"./chunks/basic.BGvZKLpn.js";import{L as u,N as A}from"./chunks/index.DXUwwNat.js";const S=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  TrChatUI,
  type ChatAsideOpenChangePayload,
  type ChatUIData,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type PreviewMode = 'dock' | 'drawer'

const mode = shallowRef<PreviewMode>('dock')
const inputValue = shallowRef('')
const lastAsideEvent = shallowRef('尚未触发侧栏事件')
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
    },
    rightAside: false,
  },
}))

function handleLeftAsideChange(payload: ChatAsideOpenChangePayload) {
  lastAsideEvent.value = \`open: \${payload.open}，source: \${payload.source}\`
}
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
      <span aria-live="polite">最近事件：{{ lastAsideEvent }}</span>
    </div>

    <div class="chat-responsive-demo__stage" :class="\`is-\${mode}\`">
      <TrChatUI
        :key="mode"
        :data="data"
        :ui="ui"
        :input-value="inputValue"
        @update:input-value="inputValue = $event"
        @left-aside-open-change="handleLeftAsideChange"
      />
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

.chat-responsive-demo__toolbar span {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
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
`,R=`<script setup lang="ts">
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
`,T=`<script setup lang="ts">
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
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type LayoutPreset = 'default' | 'compact' | 'focus'

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

const presets: Record<LayoutPreset, { label: string; description: string; ui: ChatUIOptions }> = {
  default: {
    label: '默认布局',
    description: '保留完整页面区域，内容最大宽度为 980px。',
    ui: {},
  },
  compact: {
    label: '紧凑内容',
    description: '收窄消息和输入区，并让会话列表默认展开。',
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
}

const presetOptions: LayoutPreset[] = ['default', 'compact', 'focus']
const activePreset = computed(() => presets[preset.value])
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

    <TrChatUI :data="data" :ui="activePreset.ui" :input-value="inputValue" @update:input-value="inputValue = $event" />
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
</style>
`,L=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatMessageItem, type ChatSendPayload, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const inputValue = shallowRef('')
const messages = shallowRef<ChatMessageItem[]>([])
const sending = shallowRef(false)

const data = computed<ChatUIData>(() => ({
  conversation: { activeId: 'controlled-demo', title: '受控数据' },
  bubble: { messages: messages.value },
  sender: { loading: sending.value },
  request: { state: sending.value ? 'processing' : 'idle' },
}))

async function handleSubmit(payload: ChatSendPayload) {
  if (!payload.text.trim() || sending.value) return

  sending.value = true
  messages.value = [...messages.value, { role: 'user', content: payload.text }]
  inputValue.value = ''
  await Promise.resolve()
  messages.value = [...messages.value, { role: 'assistant', content: \`已收到：\${payload.text}\` }]
  sending.value = false
}
<\/script>

<template>
  <div class="controlled-ui-demo">
    <TrChatUI :data="data" :input-value="inputValue" @update:input-value="inputValue = $event" @submit="handleSubmit" />
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
`,U=`<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type DataSnapshot = 'new' | 'active' | 'tools'

const snapshot = shallowRef<DataSnapshot>('new')
const inputValue = shallowRef('')

const snapshots = {
  new: {
    conversation: {
      items: [],
      activeId: null,
      title: '新会话',
    },
    bubble: { messages: [] },
    sender: { loading: false, disabled: false, submitDisabled: true },
    model: {
      options: [{ id: 'assistant', label: '通用助手', description: '适合日常问答' }],
      selectedId: 'assistant',
    },
    request: { state: 'idle' },
  },
  active: {
    conversation: {
      items: [
        { id: 'release', title: '发布检查清单', updatedAt: 1_726_041_600_000 },
        { id: 'weekly', title: '周报提炼', updatedAt: 1_725_436_800_000 },
      ],
      activeId: 'release',
      title: '发布检查清单',
    },
    bubble: {
      messages: [
        { id: 'question', role: 'user', content: '请给出上线前最需要确认的三件事。' },
        {
          id: 'answer',
          role: 'assistant',
          content: '优先确认回归结果、变更范围和回滚方案，并为每一项指定负责人。',
        },
      ],
    },
    sender: { loading: false, disabled: false, submitDisabled: true },
    model: {
      options: [
        { id: 'assistant', label: '通用助手', description: '适合日常问答' },
        { id: 'reasoner', label: '分析模型', description: '适合复杂推理' },
      ],
      selectedId: 'reasoner',
    },
    request: { state: 'completed' },
  },
  tools: {
    conversation: {
      items: [{ id: 'issue-review', title: '缺陷复盘', updatedAt: 1_726_041_600_000 }],
      activeId: 'issue-review',
      title: '缺陷复盘',
    },
    bubble: {
      messages: [
        { id: 'question', role: 'user', content: '整理最近的缺陷并按模块归类。' },
        {
          id: 'tool-call',
          role: 'assistant',
          content: '我先读取最近的缺陷记录。',
          tool_calls: [
            {
              id: 'call-list-issues',
              type: 'function',
              function: { name: '读取缺陷', arguments: '{"project":"TinyRobot","limit":20}' },
            },
          ],
          state: {
            toolCall: {
              'call-list-issues': { status: 'success', description: '已读取最近 20 条缺陷' },
            },
          },
        },
        {
          id: 'tool-result',
          role: 'tool',
          tool_call_id: 'call-list-issues',
          name: '读取缺陷',
          content: '{"count":20,"modules":["对话框架","Runtime","MCP"]}',
        },
        {
          id: 'answer',
          role: 'assistant',
          content: '已读取 20 条缺陷，可以按对话框架、Runtime 和 MCP 继续归类。',
        },
      ],
    },
    sender: { loading: false, disabled: false, submitDisabled: true },
    model: {
      options: [{ id: 'assistant', label: '通用助手', description: '支持工具调用' }],
      selectedId: 'assistant',
      features: { search: true },
    },
    mcp: {
      servers: [
        {
          id: 'issues',
          name: '缺陷管理',
          description: '读取项目缺陷与处理记录',
          installed: true,
          enabled: true,
        },
      ],
      tools: {
        issues: [{ id: 'list-issues', name: '读取缺陷', description: '查询指定项目的缺陷', enabled: true }],
      },
    },
    request: { state: 'idle' },
  },
} satisfies Record<DataSnapshot, ChatUIData>

const data = computed<ChatUIData>(() => snapshots[snapshot.value])

const snapshotOptions: Array<{ id: DataSnapshot; label: string }> = [
  { id: 'new', label: '新会话' },
  { id: 'active', label: '进行中的会话' },
  { id: 'tools', label: '启用工具的会话' },
]
<\/script>

<template>
  <section class="chat-data-demo">
    <div class="chat-data-demo__toolbar">
      <span>选择数据快照：</span>
      <button
        v-for="item in snapshotOptions"
        :key="item.id"
        type="button"
        :class="{ 'is-active': snapshot === item.id }"
        :aria-pressed="snapshot === item.id"
        @click="snapshot = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <p class="chat-data-demo__hint">当前示例只演示数据映射，因此输入可编辑，但不会发起请求。</p>

    <TrChatUI :data="data" :input-value="inputValue" @update:input-value="inputValue = $event" />
  </section>
</template>

<style scoped>
.chat-data-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(660px, calc(100vh - 200px));
  min-height: 520px;
}

.chat-data-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
  background: var(--tr-container-bg-default-2, #f7f8fa);
}

.chat-data-demo__toolbar span,
.chat-data-demo__hint {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-data-demo__toolbar button {
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

.chat-data-demo__toolbar button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-data-demo__toolbar button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-data-demo__hint {
  margin: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
}

.chat-data-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}

.chat-data-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
`,z=JSON.parse('{"title":"Chat 聊天界面","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat.md","filePath":"suites/chat.md"}'),M={name:"suites/chat.md"},X=Object.assign(M,{setup(W){const m=h();s(async()=>{m.value=(await r(async()=>{const{default:o}=await import("./chunks/responsive-layout.DkGbKcfh.js");return{default:o}},__vite__mapDeps([0,1,2,3,4]))).default});const b=h();s(async()=>{b.value=(await r(async()=>{const{default:o}=await import("./chunks/floating-layout.YxijAf1R.js");return{default:o}},__vite__mapDeps([5,1,2,3,4]))).default});const D=h();s(async()=>{D.value=(await r(async()=>{const{default:o}=await import("./chunks/right-aside-panel.BH28BPmw.js");return{default:o}},__vite__mapDeps([6,1,2,3,4,7]))).default});const g=h();s(async()=>{g.value=(await r(async()=>{const{default:o}=await import("./chunks/layout-presets.D-qgdCrf.js");return{default:o}},__vite__mapDeps([8,1,2,3,4]))).default});const f=h();s(async()=>{f.value=(await r(async()=>{const{default:o}=await import("./chunks/controlled-ui.Li5J_-I9.js");return{default:o}},__vite__mapDeps([9,1,2,3,4]))).default});const y=h();s(async()=>{y.value=(await r(async()=>{const{default:o}=await import("./chunks/runtime-error.CDlx3xpJ.js");return{default:o}},__vite__mapDeps([10,1,2,3,4]))).default});const v=h();s(async()=>{v.value=(await r(async()=>{const{default:o}=await import("./chunks/data-driven-ui.o0dGuz6k.js");return{default:o}},__vite__mapDeps([11,1,2,3,4]))).default});const n=w(!0),F=h();return s(async()=>{F.value=(await r(async()=>{const{default:o}=await import("./chunks/basic.ByeSO09s.js");return{default:o}},__vite__mapDeps([12,1,2,3,4,7]))).default}),(o,e)=>{const i=k("ClientOnly");return _(),x("div",null,[e[8]||(e[8]=c(`<h1 id="chat-聊天界面" tabindex="-1">Chat 聊天界面 <a class="header-anchor" href="#chat-聊天界面" aria-label="Permalink to &quot;Chat 聊天界面&quot;">​</a></h1><p><code>TrChat</code> 用 Runtime 驱动完整聊天页面；<code>TrChatUI</code> 只渲染应用提供的数据并发出用户操作事件。需要自主管理请求与会话时选择前者，已有数据层时选择后者。</p><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>使用 <code>TrChat</code> 快速嵌入会话列表、消息、输入区和模型选择。</li><li>使用 <code>TrChatUI</code> 接入应用已有的会话、消息和请求状态。</li><li>使用插槽替换局部区域，或注册应用右侧面板。</li></ul><h3 id="选择组件" tabindex="-1">选择组件 <a class="header-anchor" href="#选择组件" aria-label="Permalink to &quot;选择组件&quot;">​</a></h3><table tabindex="0"><thead><tr><th>场景</th><th>组件</th><th>应用负责的内容</th></tr></thead><tbody><tr><td>使用 Chat Runtime</td><td><code>TrChat</code></td><td>提供 Runtime，按需处理转发事件</td></tr><tr><td>已有数据和请求层</td><td><code>TrChatUI</code></td><td>更新 <code>data</code>、处理提交和会话操作</td></tr></tbody></table><p><code>TrChatUI</code> 是纯界面入口；它不会创建会话、发送请求或持久化数据。<code>TrChat</code> 在其基础上连接 Runtime 并处理标准动作。</p><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><p>安装并在应用入口引入样式：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span></span></code></pre></div><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/dist/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat/dist/style.css&#39;</span></span></code></pre></div><p>Chat 的父容器需要有可计算高度。下面的示例使用本地模拟服务，发送后会显示回答。</p>`,13)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"完整聊天页面",description:"创建 Runtime 后传给 TrChat，完成一次消息发送。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%20modelProviders%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-basic-demo%5C%22%3E%5Cn%20%20%20%20%3Ctr-chat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-basic-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-basic-demo%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:d(P)},p({_:2},[F.value?{name:"vue",fn:a(()=>[t(d(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[9]||(e[9]=c(`<div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrChat, useChatRuntime, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ChatProviderConfig } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> modelProviders</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatProviderConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;openai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    apiUrl: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/api&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    models: [{ id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;assistant&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;应用助手&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> runtime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useChatRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ modelProviders })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">main</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;chat-page&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-chat</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;runtime&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>生产环境应通过 BFF 保存长期密钥。Runtime 配置见 <a href="./chat-runtime.html#模型服务">Chat 运行时</a>。</p><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><h3 id="数据驱动的页面状态" tabindex="-1">数据驱动的页面状态 <a class="header-anchor" href="#数据驱动的页面状态" aria-label="Permalink to &quot;数据驱动的页面状态&quot;">​</a></h3><p><code>TrChatUI</code> 把 <code>data</code> 中的会话、消息、输入状态、模型和 MCP 数据映射到对应界面区域。下面三个快照分别描述一个完整场景，便于观察同一数据结构如何随会话进程扩展；示例不发送请求。</p>`,5)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"数据驱动的聊天界面",description:"切换三组 ChatUIData 快照，对比各数据分支对应的界面区域。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22data-driven-ui.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fdata-driven-ui.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatUIData%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cntype%20DataSnapshot%20%3D%20'new'%20%7C%20'active'%20%7C%20'tools'%5Cn%5Cnconst%20snapshot%20%3D%20shallowRef%3CDataSnapshot%3E('new')%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cn%5Cnconst%20snapshots%20%3D%20%7B%5Cn%20%20new%3A%20%7B%5Cn%20%20%20%20conversation%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20%5B%5D%2C%5Cn%20%20%20%20%20%20activeId%3A%20null%2C%5Cn%20%20%20%20%20%20title%3A%20'%E6%96%B0%E4%BC%9A%E8%AF%9D'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20bubble%3A%20%7B%20messages%3A%20%5B%5D%20%7D%2C%5Cn%20%20%20%20sender%3A%20%7B%20loading%3A%20false%2C%20disabled%3A%20false%2C%20submitDisabled%3A%20true%20%7D%2C%5Cn%20%20%20%20model%3A%20%7B%5Cn%20%20%20%20%20%20options%3A%20%5B%7B%20id%3A%20'assistant'%2C%20label%3A%20'%E9%80%9A%E7%94%A8%E5%8A%A9%E6%89%8B'%2C%20description%3A%20'%E9%80%82%E5%90%88%E6%97%A5%E5%B8%B8%E9%97%AE%E7%AD%94'%20%7D%5D%2C%5Cn%20%20%20%20%20%20selectedId%3A%20'assistant'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20request%3A%20%7B%20state%3A%20'idle'%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20active%3A%20%7B%5Cn%20%20%20%20conversation%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'release'%2C%20title%3A%20'%E5%8F%91%E5%B8%83%E6%A3%80%E6%9F%A5%E6%B8%85%E5%8D%95'%2C%20updatedAt%3A%201_726_041_600_000%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'weekly'%2C%20title%3A%20'%E5%91%A8%E6%8A%A5%E6%8F%90%E7%82%BC'%2C%20updatedAt%3A%201_725_436_800_000%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20activeId%3A%20'release'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%8F%91%E5%B8%83%E6%A3%80%E6%9F%A5%E6%B8%85%E5%8D%95'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20bubble%3A%20%7B%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'question'%2C%20role%3A%20'user'%2C%20content%3A%20'%E8%AF%B7%E7%BB%99%E5%87%BA%E4%B8%8A%E7%BA%BF%E5%89%8D%E6%9C%80%E9%9C%80%E8%A6%81%E7%A1%AE%E8%AE%A4%E7%9A%84%E4%B8%89%E4%BB%B6%E4%BA%8B%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20id%3A%20'answer'%2C%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BC%98%E5%85%88%E7%A1%AE%E8%AE%A4%E5%9B%9E%E5%BD%92%E7%BB%93%E6%9E%9C%E3%80%81%E5%8F%98%E6%9B%B4%E8%8C%83%E5%9B%B4%E5%92%8C%E5%9B%9E%E6%BB%9A%E6%96%B9%E6%A1%88%EF%BC%8C%E5%B9%B6%E4%B8%BA%E6%AF%8F%E4%B8%80%E9%A1%B9%E6%8C%87%E5%AE%9A%E8%B4%9F%E8%B4%A3%E4%BA%BA%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20sender%3A%20%7B%20loading%3A%20false%2C%20disabled%3A%20false%2C%20submitDisabled%3A%20true%20%7D%2C%5Cn%20%20%20%20model%3A%20%7B%5Cn%20%20%20%20%20%20options%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'assistant'%2C%20label%3A%20'%E9%80%9A%E7%94%A8%E5%8A%A9%E6%89%8B'%2C%20description%3A%20'%E9%80%82%E5%90%88%E6%97%A5%E5%B8%B8%E9%97%AE%E7%AD%94'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'reasoner'%2C%20label%3A%20'%E5%88%86%E6%9E%90%E6%A8%A1%E5%9E%8B'%2C%20description%3A%20'%E9%80%82%E5%90%88%E5%A4%8D%E6%9D%82%E6%8E%A8%E7%90%86'%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20selectedId%3A%20'reasoner'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20request%3A%20%7B%20state%3A%20'completed'%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20tools%3A%20%7B%5Cn%20%20%20%20conversation%3A%20%7B%5Cn%20%20%20%20%20%20items%3A%20%5B%7B%20id%3A%20'issue-review'%2C%20title%3A%20'%E7%BC%BA%E9%99%B7%E5%A4%8D%E7%9B%98'%2C%20updatedAt%3A%201_726_041_600_000%20%7D%5D%2C%5Cn%20%20%20%20%20%20activeId%3A%20'issue-review'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E7%BC%BA%E9%99%B7%E5%A4%8D%E7%9B%98'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20bubble%3A%20%7B%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%20id%3A%20'question'%2C%20role%3A%20'user'%2C%20content%3A%20'%E6%95%B4%E7%90%86%E6%9C%80%E8%BF%91%E7%9A%84%E7%BC%BA%E9%99%B7%E5%B9%B6%E6%8C%89%E6%A8%A1%E5%9D%97%E5%BD%92%E7%B1%BB%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20id%3A%20'tool-call'%2C%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E6%88%91%E5%85%88%E8%AF%BB%E5%8F%96%E6%9C%80%E8%BF%91%E7%9A%84%E7%BC%BA%E9%99%B7%E8%AE%B0%E5%BD%95%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20tool_calls%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3A%20'call-list-issues'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%20name%3A%20'%E8%AF%BB%E5%8F%96%E7%BC%BA%E9%99%B7'%2C%20arguments%3A%20'%7B%5C%22project%5C%22%3A%5C%22TinyRobot%5C%22%2C%5C%22limit%5C%22%3A20%7D'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20state%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20toolCall%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20'call-list-issues'%3A%20%7B%20status%3A%20'success'%2C%20description%3A%20'%E5%B7%B2%E8%AF%BB%E5%8F%96%E6%9C%80%E8%BF%91%2020%20%E6%9D%A1%E7%BC%BA%E9%99%B7'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20id%3A%20'tool-result'%2C%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'tool'%2C%5Cn%20%20%20%20%20%20%20%20%20%20tool_call_id%3A%20'call-list-issues'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'%E8%AF%BB%E5%8F%96%E7%BC%BA%E9%99%B7'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%7B%5C%22count%5C%22%3A20%2C%5C%22modules%5C%22%3A%5B%5C%22%E5%AF%B9%E8%AF%9D%E6%A1%86%E6%9E%B6%5C%22%2C%5C%22Runtime%5C%22%2C%5C%22MCP%5C%22%5D%7D'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20id%3A%20'answer'%2C%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E5%B7%B2%E8%AF%BB%E5%8F%96%2020%20%E6%9D%A1%E7%BC%BA%E9%99%B7%EF%BC%8C%E5%8F%AF%E4%BB%A5%E6%8C%89%E5%AF%B9%E8%AF%9D%E6%A1%86%E6%9E%B6%E3%80%81Runtime%20%E5%92%8C%20MCP%20%E7%BB%A7%E7%BB%AD%E5%BD%92%E7%B1%BB%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20sender%3A%20%7B%20loading%3A%20false%2C%20disabled%3A%20false%2C%20submitDisabled%3A%20true%20%7D%2C%5Cn%20%20%20%20model%3A%20%7B%5Cn%20%20%20%20%20%20options%3A%20%5B%7B%20id%3A%20'assistant'%2C%20label%3A%20'%E9%80%9A%E7%94%A8%E5%8A%A9%E6%89%8B'%2C%20description%3A%20'%E6%94%AF%E6%8C%81%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8'%20%7D%5D%2C%5Cn%20%20%20%20%20%20selectedId%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20features%3A%20%7B%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20mcp%3A%20%7B%5Cn%20%20%20%20%20%20servers%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20id%3A%20'issues'%2C%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'%E7%BC%BA%E9%99%B7%E7%AE%A1%E7%90%86'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E9%A1%B9%E7%9B%AE%E7%BC%BA%E9%99%B7%E4%B8%8E%E5%A4%84%E7%90%86%E8%AE%B0%E5%BD%95'%2C%5Cn%20%20%20%20%20%20%20%20%20%20installed%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20enabled%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20tools%3A%20%7B%5Cn%20%20%20%20%20%20%20%20issues%3A%20%5B%7B%20id%3A%20'list-issues'%2C%20name%3A%20'%E8%AF%BB%E5%8F%96%E7%BC%BA%E9%99%B7'%2C%20description%3A%20'%E6%9F%A5%E8%AF%A2%E6%8C%87%E5%AE%9A%E9%A1%B9%E7%9B%AE%E7%9A%84%E7%BC%BA%E9%99%B7'%2C%20enabled%3A%20true%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20request%3A%20%7B%20state%3A%20'idle'%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%20satisfies%20Record%3CDataSnapshot%2C%20ChatUIData%3E%5Cn%5Cnconst%20data%20%3D%20computed%3CChatUIData%3E(()%20%3D%3E%20snapshots%5Bsnapshot.value%5D)%5Cn%5Cnconst%20snapshotOptions%3A%20Array%3C%7B%20id%3A%20DataSnapshot%3B%20label%3A%20string%20%7D%3E%20%3D%20%5B%5Cn%20%20%7B%20id%3A%20'new'%2C%20label%3A%20'%E6%96%B0%E4%BC%9A%E8%AF%9D'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'active'%2C%20label%3A%20'%E8%BF%9B%E8%A1%8C%E4%B8%AD%E7%9A%84%E4%BC%9A%E8%AF%9D'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'tools'%2C%20label%3A%20'%E5%90%AF%E7%94%A8%E5%B7%A5%E5%85%B7%E7%9A%84%E4%BC%9A%E8%AF%9D'%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-data-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-data-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E5%BF%AB%E7%85%A7%EF%BC%9A%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22item%20in%20snapshotOptions%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22item.id%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20snapshot%20%3D%3D%3D%20item.id%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22snapshot%20%3D%3D%3D%20item.id%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22snapshot%20%3D%20item.id%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20item.label%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cp%20class%3D%5C%22chat-data-demo__hint%5C%22%3E%E5%BD%93%E5%89%8D%E7%A4%BA%E4%BE%8B%E5%8F%AA%E6%BC%94%E7%A4%BA%E6%95%B0%E6%8D%AE%E6%98%A0%E5%B0%84%EF%BC%8C%E5%9B%A0%E6%AD%A4%E8%BE%93%E5%85%A5%E5%8F%AF%E7%BC%96%E8%BE%91%EF%BC%8C%E4%BD%86%E4%B8%8D%E4%BC%9A%E5%8F%91%E8%B5%B7%E8%AF%B7%E6%B1%82%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3CTrChatUI%20%3Adata%3D%5C%22data%5C%22%20%3Ainput-value%3D%5C%22inputValue%5C%22%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%20%2F%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-data-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20height%3A%20min(660px%2C%20calc(100vh%20-%20200px))%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.chat-data-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--tr-color-border%2C%20%23e5e6eb)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2%2C%20%23f7f8fa)%3B%5Cn%7D%5Cn%5Cn.chat-data-demo__toolbar%20span%2C%5Cn.chat-data-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.chat-data-demo__toolbar%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-data-demo__toolbar%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-data-demo__toolbar%20button.is-active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-data-demo__hint%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--tr-color-border%2C%20%23e5e6eb)%3B%5Cn%7D%5Cn%5Cn.chat-data-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-data-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:d(U)},p({_:2},[v.value?{name:"vue",fn:a(()=>[t(d(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[10]||(e[10]=c('<p><code>data.sender.loading</code> 控制发送中的反馈，<code>disabled</code> 和 <code>submitDisabled</code> 分别禁用输入或提交。<code>data.request</code> 记录请求生命周期，并作为参数传给 <code>layout-main</code> 和 <code>layout-empty-state</code>；默认界面不会仅根据它额外渲染反馈。可展示的错误属于具体消息，应放在对应 assistant 消息的 <code>state.error</code> 中。</p><h3 id="消息错误状态" tabindex="-1">消息错误状态 <a class="header-anchor" href="#消息错误状态" aria-label="Permalink to &quot;消息错误状态&quot;">​</a></h3><p><code>useChatRuntime</code> 默认把请求错误规范化到本轮最后一条 assistant 消息的 <code>state.error</code>。Bubble 在正常消息内容之后渲染错误，因此错误会保持所属消息的头像、顺序和布局；请求失败仍会让 <code>request.state</code> 进入 <code>error</code>。</p>',3)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"消息级请求错误",description:"使用确定性本地 Provider 反复触发失败与成功，观察默认错误气泡和动作失败通知。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-error.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-error.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20ConversationStorageStrategy%2C%20MessageRequestBody%2C%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatRuntimeActionErrorPayload%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnlet%20responseIndex%20%3D%200%5Cn%5Cnconst%20memoryStorage%3A%20ConversationStorageStrategy%20%3D%20%7B%5Cn%20%20loadConversations%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20loadMessages%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20saveConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20saveMessages%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20deleteConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%7D%5Cn%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody)%20%3D%3E%20%7B%5Cn%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%20300))%5Cn%5Cn%20%20const%20text%20%3D%20String(requestBody.messages.filter((message)%20%3D%3E%20message.role%20%3D%3D%3D%20'user').at(-1)%3F.content%20%3F%3F%20'')%5Cn%5Cn%20%20if%20(text.includes('%E5%A4%B1%E8%B4%A5'))%20%7B%5Cn%20%20%20%20const%20error%20%3D%20new%20Error(%5Cn%20%20%20%20%20%20'%E6%A8%A1%E6%8B%9F%E6%A8%A1%E5%9E%8B%E6%9C%8D%E5%8A%A1%E4%B8%8D%E5%8F%AF%E7%94%A8%E3%80%82%E9%94%99%E8%AF%AF%E8%AF%A6%E6%83%85%E5%B1%9E%E4%BA%8E%E8%BF%99%E6%9D%A1%20assistant%20%E6%B6%88%E6%81%AF%EF%BC%9B%E5%8C%85%E5%90%AB%E8%BE%83%E9%95%BF%E6%A0%87%E8%AF%86%20demo-request-abcdefghijklmnopqrstuvwxyz-0123456789%20%E4%BB%A5%E4%BE%BF%E6%A3%80%E6%9F%A5%E7%AA%84%E5%AE%B9%E5%99%A8%E6%8D%A2%E8%A1%8C%E3%80%82'%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20Object.assign(error%2C%20%7B%20code%3A%20'DEMO_UNAVAILABLE'%20%7D)%5Cn%20%20%20%20throw%20error%5Cn%20%20%7D%5Cn%5Cn%20%20responseIndex%20%2B%3D%201%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20%60runtime-error-demo-%24%7BresponseIndex%7D%60%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20responseIndex%2C%5Cn%20%20%20%20model%3A%20'local-demo'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60%E8%AF%B7%E6%B1%82%E5%B7%B2%E6%81%A2%E5%A4%8D%EF%BC%9A%24%7Btext%20%7C%7C%20'%E6%88%90%E5%8A%9F%E6%B6%88%E6%81%AF'%7D%60%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20conversation%3A%20%7B%20storage%3A%20memoryStorage%2C%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%20%7D%2C%5Cn%7D)%5Cnconst%20actionStatus%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E6%94%B6%E5%88%B0%E5%8A%A8%E4%BD%9C%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5')%5Cn%5Cnfunction%20handleRuntimeActionError(payload%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionStatus.value%20%3D%20%60%E5%B7%B2%E6%94%B6%E5%88%B0%20%24%7Bpayload.action%7D%20%E5%8A%A8%E4%BD%9C%E5%A4%B1%E8%B4%A5%E9%80%9A%E7%9F%A5%EF%BC%9B%E9%94%99%E8%AF%AF%E8%AF%A6%E6%83%85%E4%BB%8D%E7%94%B1%E6%89%80%E5%B1%9E%E6%B6%88%E6%81%AF%E6%B0%94%E6%B3%A1%E5%B1%95%E7%A4%BA%E3%80%82%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-error-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-error-demo__hint%5C%22%3E%5Cn%20%20%20%20%20%20%E8%BE%93%E5%85%A5%E5%8C%85%E5%90%AB%E2%80%9C%E5%A4%B1%E8%B4%A5%E2%80%9D%E7%9A%84%E5%86%85%E5%AE%B9%E4%BC%9A%E8%A7%A6%E5%8F%91%E7%A1%AE%E5%AE%9A%E6%80%A7%E9%94%99%E8%AF%AF%EF%BC%9B%E9%9A%8F%E5%90%8E%E8%BE%93%E5%85%A5%E5%85%B6%E4%BB%96%E5%86%85%E5%AE%B9%E5%8D%B3%E5%8F%AF%E7%BB%A7%E7%BB%AD%E5%8F%91%E9%80%81%E5%B9%B6%E8%A7%82%E5%AF%9F%E6%81%A2%E5%A4%8D%E7%BB%93%E6%9E%9C%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-error-demo__status%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-error-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-chat%20%3Aruntime%3D%5C%22runtime%5C%22%20%40runtime-action-error%3D%5C%22handleRuntimeActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-error-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__hint%2C%5Cn.runtime-error-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__status%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20width%3A%20min(100%25%2C%20720px)%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-error-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-error-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:d(I)},p({_:2},[y.value?{name:"vue",fn:a(()=>[t(d(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[11]||(e[11]=c(`<p>错误状态的职责如下：</p><table tabindex="0"><thead><tr><th>状态或通知</th><th>管理方</th><th>用途</th></tr></thead><tbody><tr><td><code>message.state.error</code></td><td>Runtime 或应用</td><td>保存并展示属于这条消息的错误详情。</td></tr><tr><td><code>request.state</code></td><td>Runtime 或应用</td><td>表达 idle、processing、completed、aborted、error 等请求生命周期。</td></tr><tr><td><code>runtime-action-error</code></td><td><code>TrChat</code></td><td>通知应用某个 Runtime 动作失败，可用于遥测或全局非消息动作反馈。</td></tr><tr><td>TrChatUI 默认错误渲染器</td><td><code>TrChatUI</code></td><td>在消息内容之后展示错误；不会提供重试按钮，也不改变请求或消息状态。</td></tr></tbody></table><p><code>TrChatUI</code> 会显式启用内置错误渲染器；单独使用 <code>Bubble</code> 或 <code>BubbleProvider</code> 时，错误渲染器默认关闭。默认错误元素使用 <code>role=&quot;alert&quot;</code>，长文本会保留换行并在连续字符串中断行，适合窄容器。它使用公开的 <code>--tr-bubble-error-color</code>、<code>--tr-bubble-error-bg</code>、<code>--tr-bubble-error-border-radius</code> 和 <code>--tr-bubble-max-width</code> 主题变量。</p><p>需要不同结构时，通过 <code>ui.bubble.bubbleProvider.errorRenderer</code> 提供统一的 Provider 级渲染器；传入 <code>null</code> 可以关闭 <code>TrChatUI</code> 的默认错误视图。不要依赖内部 <code>.tr-bubble__error</code> 选择器，也不要把重试等副作用放进纯展示渲染器。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> customErrorUI</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bubbleProvider: { errorRenderer: CustomErrorRenderer },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> disabledErrorUI</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatUIOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bubble: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bubbleProvider: { errorRenderer: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>runtime-action-error</code> 在 send 失败时仍会发出，但它不是消息错误的数据源。应用可以用它记录遥测；默认页面和综合案例不会再把同一个 send 错误同时显示为顶部提示。会话、模型或 MCP 等非消息动作失败仍适合使用全局反馈。</p><h3 id="接入外部数据" tabindex="-1">接入外部数据 <a class="header-anchor" href="#接入外部数据" aria-label="Permalink to &quot;接入外部数据&quot;">​</a></h3><p>受控输入时，值由应用持有，收到 <code>update:input-value</code> 后必须更新该值。非受控输入使用 <code>defaultInputValue</code>，组件在生命周期内维护草稿；两种模式不要切换。</p>`,8)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"受控数据",description:"应用接收提交事件，更新消息列表、请求状态和输入值。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22controlled-ui.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fcontrolled-ui.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatMessageItem%2C%20type%20ChatSendPayload%2C%20type%20ChatUIData%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cnconst%20messages%20%3D%20shallowRef%3CChatMessageItem%5B%5D%3E(%5B%5D)%5Cnconst%20sending%20%3D%20shallowRef(false)%5Cn%5Cnconst%20data%20%3D%20computed%3CChatUIData%3E(()%20%3D%3E%20(%7B%5Cn%20%20conversation%3A%20%7B%20activeId%3A%20'controlled-demo'%2C%20title%3A%20'%E5%8F%97%E6%8E%A7%E6%95%B0%E6%8D%AE'%20%7D%2C%5Cn%20%20bubble%3A%20%7B%20messages%3A%20messages.value%20%7D%2C%5Cn%20%20sender%3A%20%7B%20loading%3A%20sending.value%20%7D%2C%5Cn%20%20request%3A%20%7B%20state%3A%20sending.value%20%3F%20'processing'%20%3A%20'idle'%20%7D%2C%5Cn%7D))%5Cn%5Cnasync%20function%20handleSubmit(payload%3A%20ChatSendPayload)%20%7B%5Cn%20%20if%20(!payload.text.trim()%20%7C%7C%20sending.value)%20return%5Cn%5Cn%20%20sending.value%20%3D%20true%5Cn%20%20messages.value%20%3D%20%5B...messages.value%2C%20%7B%20role%3A%20'user'%2C%20content%3A%20payload.text%20%7D%5D%5Cn%20%20inputValue.value%20%3D%20''%5Cn%20%20await%20Promise.resolve()%5Cn%20%20messages.value%20%3D%20%5B...messages.value%2C%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60%E5%B7%B2%E6%94%B6%E5%88%B0%EF%BC%9A%24%7Bpayload.text%7D%60%20%7D%5D%5Cn%20%20sending.value%20%3D%20false%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22controlled-ui-demo%5C%22%3E%5Cn%20%20%20%20%3CTrChatUI%20%3Adata%3D%5C%22data%5C%22%20%3Ainput-value%3D%5C%22inputValue%5C%22%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%20%40submit%3D%5C%22handleSubmit%5C%22%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.controlled-ui-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.controlled-ui-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.controlled-ui-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{n.value=!1}),vueCode:d(L)},p({_:2},[f.value?{name:"vue",fn:a(()=>[t(d(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[12]||(e[12]=c('<p><code>TrChat</code> 的“新会话”会调用 <code>runtime.actions.clearActiveConversation()</code>，不会创建空会话。<code>TrChatUI</code> 只触发 <code>create-conversation</code>，由应用决定清空当前会话还是立即创建会话。</p><h3 id="页面布局" tabindex="-1">页面布局 <a class="header-anchor" href="#页面布局" aria-label="Permalink to &quot;页面布局&quot;">​</a></h3><p>通过 <code>ui</code> 调整内容宽度和页面区域，不会修改 <code>data</code> 或 Runtime 中的会话状态。下面的示例始终使用同一份数据，只切换布局配置。</p>',3)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"页面布局预设",description:"比较默认、紧凑内容和专注模式下的页面区域与内容宽度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22layout-presets.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Flayout-presets.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatUIData%2C%20type%20ChatUIOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cntype%20LayoutPreset%20%3D%20'default'%20%7C%20'compact'%20%7C%20'focus'%5Cn%5Cnconst%20preset%20%3D%20shallowRef%3CLayoutPreset%3E('default')%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cn%5Cnconst%20data%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'review'%2C%20title%3A%20'%E5%8F%98%E6%9B%B4%E8%AF%84%E5%AE%A1'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'release'%2C%20title%3A%20'%E5%8F%91%E5%B8%83%E6%A3%80%E6%9F%A5'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20activeId%3A%20'review'%2C%5Cn%20%20%20%20title%3A%20'%E5%8F%98%E6%9B%B4%E8%AF%84%E5%AE%A1'%2C%5Cn%20%20%7D%2C%5Cn%20%20bubble%3A%20%7B%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'question'%2C%20role%3A%20'user'%2C%20content%3A%20'%E8%BF%99%E4%B8%AA%E6%94%B9%E5%8A%A8%E6%9C%80%E9%9C%80%E8%A6%81%E5%85%B3%E6%B3%A8%E4%BB%80%E4%B9%88%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'answer'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%85%88%E7%A1%AE%E8%AE%A4%E5%85%AC%E5%BC%80%E6%8E%A5%E5%8F%A3%E6%98%AF%E5%90%A6%E5%85%BC%E5%AE%B9%EF%BC%8C%E5%86%8D%E6%A3%80%E6%9F%A5%E9%94%99%E8%AF%AF%E6%81%A2%E5%A4%8D%E5%92%8C%E7%AA%84%E5%B1%8F%E5%B8%83%E5%B1%80%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20presets%3A%20Record%3CLayoutPreset%2C%20%7B%20label%3A%20string%3B%20description%3A%20string%3B%20ui%3A%20ChatUIOptions%20%7D%3E%20%3D%20%7B%5Cn%20%20default%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E9%BB%98%E8%AE%A4%E5%B8%83%E5%B1%80'%2C%5Cn%20%20%20%20description%3A%20'%E4%BF%9D%E7%95%99%E5%AE%8C%E6%95%B4%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%8C%E5%86%85%E5%AE%B9%E6%9C%80%E5%A4%A7%E5%AE%BD%E5%BA%A6%E4%B8%BA%20980px%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20compact%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E7%B4%A7%E5%87%91%E5%86%85%E5%AE%B9'%2C%5Cn%20%20%20%20description%3A%20'%E6%94%B6%E7%AA%84%E6%B6%88%E6%81%AF%E5%92%8C%E8%BE%93%E5%85%A5%E5%8C%BA%EF%BC%8C%E5%B9%B6%E8%AE%A9%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8%E9%BB%98%E8%AE%A4%E5%B1%95%E5%BC%80%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20contentMaxWidth%3A%20640%2C%5Cn%20%20%20%20%20%20%20%20panelPadding%3A%2020%2C%5Cn%20%20%20%20%20%20%20%20panelGap%3A%208%2C%5Cn%20%20%20%20%20%20%20%20leftAside%3A%20%7B%20width%3A%20240%2C%20collapsedWidth%3A%2048%2C%20defaultOpen%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20focus%3A%20%7B%5Cn%20%20%20%20label%3A%20'%E4%B8%93%E6%B3%A8%E6%A8%A1%E5%BC%8F'%2C%5Cn%20%20%20%20description%3A%20'%E9%9A%90%E8%97%8F%E9%A1%B5%E5%A4%B4%E4%B8%8E%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8%EF%BC%8C%E5%8F%AA%E4%BF%9D%E7%95%99%E6%B6%88%E6%81%AF%E5%92%8C%E8%BE%93%E5%85%A5%E5%8C%BA%E3%80%82'%2C%5Cn%20%20%20%20ui%3A%20%7B%5Cn%20%20%20%20%20%20header%3A%20false%2C%5Cn%20%20%20%20%20%20history%3A%20false%2C%5Cn%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20contentMaxWidth%3A%20720%2C%5Cn%20%20%20%20%20%20%20%20leftAside%3A%20false%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20presetOptions%3A%20LayoutPreset%5B%5D%20%3D%20%5B'default'%2C%20'compact'%2C%20'focus'%5D%5Cnconst%20activePreset%20%3D%20computed(()%20%3D%3E%20presets%5Bpreset.value%5D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-layout-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-layout-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22id%20in%20presetOptions%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22id%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20preset%20%3D%3D%3D%20id%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22preset%20%3D%3D%3D%20id%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22preset%20%3D%20id%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20presets%5Bid%5D.label%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%7B%7B%20activePreset.description%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3CTrChatUI%20%3Adata%3D%5C%22data%5C%22%20%3Aui%3D%5C%22activePreset.ui%5C%22%20%3Ainput-value%3D%5C%22inputValue%5C%22%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%20%2F%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-layout-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20height%3A%20min(660px%2C%20calc(100vh%20-%20200px))%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%20%20border-bottom%3A%201px%20solid%20var(--tr-color-border%2C%20%23e5e6eb)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default-2%2C%20%23f7f8fa)%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20button.is-active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo__toolbar%20span%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.chat-layout-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{n.value=!1}),vueCode:d(q)},p({_:2},[g.value?{name:"vue",fn:a(()=>[t(d(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[13]||(e[13]=c('<p>常用默认值：</p><table tabindex="0"><thead><tr><th>配置</th><th>默认值</th></tr></thead><tbody><tr><td><code>layout.surface.mode</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td><code>layout.emptyState</code></td><td><code>&#39;start&#39;</code></td></tr><tr><td><code>layout.composer.welcome</code></td><td><code>&#39;footer&#39;</code></td></tr><tr><td><code>layout.contentMaxWidth</code></td><td><code>980</code></td></tr><tr><td><code>layout.panelPadding</code> / <code>panelGap</code></td><td><code>12</code> / <code>12</code></td></tr><tr><td><code>layout.leftAside.width</code> / <code>collapsedWidth</code></td><td><code>300</code> / <code>56</code></td></tr><tr><td><code>layout.rightAside.width</code></td><td><code>320</code></td></tr><tr><td><code>sender.maxLength</code></td><td><code>1000</code></td></tr></tbody></table><h3 id="右侧面板" tabindex="-1">右侧面板 <a class="header-anchor" href="#右侧面板" aria-label="Permalink to &quot;右侧面板&quot;">​</a></h3><p>通过 <code>layout.rightAside.panels</code> 注册应用面板。<code>rightAsideOpen</code> 和 <code>activeRightAsidePanelId</code> 同时支持受控值和 <code>default*</code> 初始值；受控时应用收到 <code>update:*</code> 后更新对应值。</p>',4)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"对话驱动的工作台",description:"消息操作可以打开发布方案预览和引用资料面板；输入区 MCP 按钮可以打开内置 MCP 面板。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22right-aside-panel.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fright-aside-panel.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20BusinessRightAside%20from%20'.%2Fbusiness-right-aside.vue'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20mcpServers%3A%20ChatMcpServers%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'project-knowledge'%2C%5Cn%20%20%20%20name%3A%20'%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E5%BA%93'%2C%5Cn%20%20%20%20description%3A%20'%E6%A3%80%E7%B4%A2%E9%9C%80%E6%B1%82%E3%80%81%E8%AE%BE%E8%AE%A1%E5%92%8C%E9%A1%B9%E7%9B%AE%E7%BA%A6%E5%AE%9A%E3%80%82'%2C%5Cn%20%20%20%20baseUrl%3A%20%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%2Fmcp%2Fproject-knowledge%60%2C%5Cn%20%20%20%20installed%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'release-calendar'%2C%5Cn%20%20%20%20name%3A%20'%E5%8F%91%E5%B8%83%E6%97%A5%E5%8E%86'%2C%5Cn%20%20%20%20description%3A%20'%E6%9F%A5%E8%AF%A2%E5%8F%91%E5%B8%83%E7%AA%97%E5%8F%A3%E5%92%8C%E5%86%BB%E7%BB%93%E6%97%B6%E9%97%B4%E3%80%82'%2C%5Cn%20%20%20%20baseUrl%3A%20%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%2Fmcp%2Frelease-calendar%60%2C%5Cn%20%20%20%20installed%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20rightAsideOpen%20%3D%20shallowRef(true)%5Cnconst%20activeRightAsidePanelId%20%3D%20shallowRef%3Cstring%20%7C%20undefined%3E('preview')%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20mcpServers%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E5%B7%B2%E6%95%B4%E7%90%86%E5%AE%8C%E6%88%90%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E6%89%93%E5%BC%80%E5%8F%B3%E4%BE%A7%E9%A2%84%E8%A7%88%EF%BC%8C%E6%88%96%E6%9F%A5%E7%9C%8B%E5%BC%95%E7%94%A8%E8%B5%84%E6%96%99%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnruntime.actions.createConversation(%7B%20title%3A%20'%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E5%8D%8F%E4%BD%9C'%20%7D)%5Cn%5Cnfunction%20openPanel(panelId%3A%20'preview'%20%7C%20'sources')%20%7B%5Cn%20%20activeRightAsidePanelId.value%20%3D%20panelId%5Cn%20%20rightAsideOpen.value%20%3D%20true%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-workbench%5C%22%3E%5Cn%20%20%20%20%3CTrChat%5Cn%20%20%20%20%20%20class%3D%5C%22chat-workbench__chat%5C%22%5Cn%20%20%20%20%20%20%3Aruntime%3D%5C%22runtime%5C%22%5Cn%20%20%20%20%20%20%3Aui%3D%5C%22%7B%5Cn%20%20%20%20%20%20%20%20layout%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20rightAside%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20width%3A%20344%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20resizable%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20minWidth%3A%20300%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20maxWidth%3A%20480%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20panels%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'preview'%2C%20title%3A%20'%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E9%A2%84%E8%A7%88'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%20id%3A%20'sources'%2C%20title%3A%20'%E5%BC%95%E7%94%A8%E8%B5%84%E6%96%99'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%5C%22%5Cn%20%20%20%20%20%20%3Aright-aside-open%3D%5C%22rightAsideOpen%5C%22%5Cn%20%20%20%20%20%20%3Aactive-right-aside-panel-id%3D%5C%22activeRightAsidePanelId%5C%22%5Cn%20%20%20%20%20%20%40update%3Aright-aside-open%3D%5C%22rightAsideOpen%20%3D%20%24event%5C%22%5Cn%20%20%20%20%20%20%40update%3Aactive-right-aside-panel-id%3D%5C%22activeRightAsidePanelId%20%3D%20%24event%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23bubble-content-footer%3D%5C%22%7B%20role%2C%20messageIndexes%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20v-if%3D%5C%22role%20%3D%3D%3D%20'assistant'%20%26%26%20messageIndexes.includes(0)%5C%22%20class%3D%5C%22message-actions%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22message-actions__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22openPanel('preview')%5C%22%3E%E6%9F%A5%E7%9C%8B%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22message-actions__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22openPanel('sources')%5C%22%3E%E6%9F%A5%E7%9C%8B%E5%BC%95%E7%94%A8%E8%B5%84%E6%96%99%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%5Cn%20%20%20%20%20%20%3Ctemplate%20%23layout-right-aside-panel%3D%5C%22%7B%20panelId%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3CBusinessRightAside%20%3Apanel-id%3D%5C%22panelId%5C%22%20%40open-panel%3D%5C%22openPanel%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2FTrChat%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-workbench%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(700px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-workbench__chat%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%7D%5Cn%5Cn.message-actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-top%3A%208px%3B%5Cn%7D%5Cn%5Cn.message-actions__button%20%7B%5Cn%20%20border%3A%201px%20solid%20%23c8d6e6%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20color%3A%20%2327567e%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.message-actions__button%20%7B%5Cn%20%20padding%3A%206px%2010px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.message-actions__button%3Ahover%20%7B%5Cn%20%20border-color%3A%20%235d8db7%3B%5Cn%20%20background%3A%20%23f1f7fc%3B%5Cn%7D%5Cn%5Cn%3Adeep(h2.chat-right-aside-title)%20%7B%5Cn%20%20padding%3A%200%3B%5Cn%20%20border-top%3A%20none%3B%5Cn%7D%5Cn%5Cn%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-workbench%20%7B%5Cn%20%20%20%20height%3A%20620px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22business-right-aside.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbusiness-right-aside.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20previewTemplate%20from%20'.%2Frelease-preview.html%3Fraw'%5Cn%5Cntype%20SourceId%20%3D%20'requirements'%20%7C%20'api'%20%7C%20'regression'%5Cntype%20Source%20%3D%20%7B%5Cn%20%20id%3A%20SourceId%5Cn%20%20title%3A%20string%5Cn%20%20meta%3A%20string%5Cn%20%20summary%3A%20string%5Cn%7D%5Cn%5CndefineProps%3C%7B%5Cn%20%20panelId%3F%3A%20string%5Cn%7D%3E()%5Cn%5Cnconst%20emit%20%3D%20defineEmits%3C%7B%5Cn%20%20'open-panel'%3A%20%5BpanelId%3A%20'preview'%5D%5Cn%7D%3E()%5Cn%5Cnconst%20selectedSourceId%20%3D%20shallowRef%3CSourceId%3E('requirements')%5Cnconst%20sources%3A%20readonly%20Source%5B%5D%20%3D%20%5B%5Cn%20%20%7B%20id%3A%20'requirements'%2C%20title%3A%20'%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3'%2C%20meta%3A%20'PRD-2026-04'%2C%20summary%3A%20'%E9%9C%80%E6%B1%82%E8%8C%83%E5%9B%B4%E5%92%8C%E9%AA%8C%E6%94%B6%E5%8F%A3%E5%BE%84%E5%B7%B2%E5%AE%8C%E6%88%90%E7%A1%AE%E8%AE%A4%E3%80%82'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'api'%2C%20title%3A%20'%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E'%2C%20meta%3A%20'API-RELEASE-07'%2C%20summary%3A%20'%E6%8E%A5%E5%8F%A3%E5%A5%91%E7%BA%A6%E7%A8%B3%E5%AE%9A%EF%BC%8C%E8%81%94%E8%B0%83%E7%BB%93%E6%9E%9C%E6%BB%A1%E8%B6%B3%E5%8F%91%E5%B8%83%E5%89%8D%E6%A0%A1%E9%AA%8C%E8%A6%81%E6%B1%82%E3%80%82'%20%7D%2C%5Cn%20%20%7B%20id%3A%20'regression'%2C%20title%3A%20'%E5%9B%9E%E5%BD%92%E6%8A%A5%E5%91%8A'%2C%20meta%3A%20'QA-2026-04-17'%2C%20summary%3A%20'%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B%E5%92%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E9%AA%8C%E8%AF%81%E9%80%9A%E8%BF%87%EF%BC%8C%E6%9A%82%E6%97%A0%E9%98%BB%E5%A1%9E%E7%BC%BA%E9%99%B7%E3%80%82'%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20selectedSource%20%3D%20computed(()%20%3D%3E%20sources.find((source)%20%3D%3E%20source.id%20%3D%3D%3D%20selectedSourceId.value)%20%3F%3F%20sources%5B0%5D)%5Cnconst%20previewSrcdoc%20%3D%20computed(()%20%3D%3E%5Cn%20%20previewTemplate%5Cn%20%20%20%20.replace('__SOURCE_TITLE__'%2C%20selectedSource.value.title)%5Cn%20%20%20%20.replace('__SOURCE_META__'%2C%20selectedSource.value.meta)%5Cn%20%20%20%20.replace('__SOURCE_SUMMARY__'%2C%20selectedSource.value.summary)%2C%5Cn)%5Cn%5Cnfunction%20openSource(sourceId%3A%20SourceId)%20%7B%5Cn%20%20selectedSourceId.value%20%3D%20sourceId%5Cn%20%20emit('open-panel'%2C%20'preview')%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20v-if%3D%5C%22panelId%20%3D%3D%3D%20'preview'%5C%22%20class%3D%5C%22business-panel%20business-panel--preview%5C%22%3E%5Cn%20%20%20%20%3Ciframe%20class%3D%5C%22preview-frame%5C%22%20title%3D%5C%22%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%E7%BD%91%E9%A1%B5%E9%A2%84%E8%A7%88%5C%22%20sandbox%3D%5C%22allow-same-origin%5C%22%20%3Asrcdoc%3D%5C%22previewSrcdoc%5C%22%20%2F%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%5Cn%20%20%3Csection%20v-else-if%3D%5C%22panelId%20%3D%3D%3D%20'sources'%5C%22%20class%3D%5C%22business-panel%20business-panel--sources%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22sources-intro%5C%22%3E%E7%82%B9%E5%87%BB%E8%B5%84%E6%96%99%E8%BF%94%E5%9B%9E%E5%8F%91%E5%B8%83%E9%A2%84%E8%A7%88%EF%BC%8C%E5%B9%B6%E6%9F%A5%E7%9C%8B%E5%AF%B9%E5%BA%94%E5%BC%95%E7%94%A8%E4%BF%A1%E6%81%AF%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22source-list%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22source%20in%20sources%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22source.id%5C%22%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22source-list__item%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22openSource(source.id)%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22source-list__title%5C%22%3E%7B%7B%20source.title%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22source-list__meta%5C%22%3E%7B%7B%20source.meta%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.business-panel%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.business-panel--preview%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%7D%5Cn%5Cn.preview-frame%20%7B%5Cn%20%20display%3A%20block%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20flex%3A%201%201%20auto%3B%5Cn%20%20border%3A%200%3B%5Cn%20%20background%3A%20%23f7f9fc%3B%5Cn%7D%5Cn%5Cn.sources-intro%20%7B%5Cn%20%20margin%3A%200%200%2016px%3B%5Cn%20%20color%3A%20%23667890%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%201.6%3B%5Cn%7D%5Cn%5Cn.source-list%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%7D%5Cn%5Cn.source-list__item%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20align-items%3A%20flex-start%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20border%3A%201px%20solid%20%23c8d6e6%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20padding%3A%2013px%2014px%3B%5Cn%20%20color%3A%20%2327567e%3B%5Cn%20%20background%3A%20%23fff%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20text-align%3A%20left%3B%5Cn%7D%5Cn%5Cn.source-list__item%3Ahover%20%7B%5Cn%20%20border-color%3A%20%235d8db7%3B%5Cn%20%20background%3A%20%23f1f7fc%3B%5Cn%7D%5Cn%5Cn.source-list__title%20%7B%5Cn%20%20color%3A%20%231f3854%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%7D%5Cn%5Cn.source-list__meta%20%7B%5Cn%20%20margin-top%3A%205px%3B%5Cn%20%20color%3A%20%237a8ba0%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.business-panel%20%7B%5Cn%20%20%20%20padding%3A%2012px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22release-preview.html%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Frelease-preview.html%22%2C%22code%22%3A%22%3C!doctype%20html%3E%5Cn%3Chtml%20lang%3D%5C%22zh-CN%5C%22%3E%5Cn%20%20%3Chead%3E%5Cn%20%20%20%20%3Cmeta%20charset%3D%5C%22UTF-8%5C%22%20%2F%3E%5Cn%20%20%20%20%3Cmeta%20name%3D%5C%22viewport%5C%22%20content%3D%5C%22width%3Ddevice-width%2C%20initial-scale%3D1%5C%22%20%2F%3E%5Cn%20%20%20%20%3Cstyle%3E%5Cn%20%20%20%20%20%20.preview-page%20%7B%5Cn%20%20%20%20%20%20%20%20box-sizing%3A%20border-box%3B%5Cn%20%20%20%20%20%20%20%20max-width%3A%20720px%3B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%20auto%3B%5Cn%20%20%20%20%20%20%20%20padding%3A%2020px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-header%20%7B%5Cn%20%20%20%20%20%20%20%20padding%3A%208px%200%2020px%3B%5Cn%20%20%20%20%20%20%20%20border-bottom%3A%201px%20solid%20%23dce3eb%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-eyebrow%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%200%208px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2353708f%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2012px%3B%5Cn%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%5Cn%20%20%20%20%20%20%20%20letter-spacing%3A%200.08em%3B%5Cn%20%20%20%20%20%20%20%20text-transform%3A%20uppercase%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-title%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2316283f%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2030px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.2%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-summary%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%2012px%200%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2364758a%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2014px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.6%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-meta%20%7B%5Cn%20%20%20%20%20%20%20%20display%3A%20flex%3B%5Cn%20%20%20%20%20%20%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20%20%20%20%20%20%20gap%3A%208px%2016px%3B%5Cn%20%20%20%20%20%20%20%20margin-top%3A%2016px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2364758a%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2013px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-status%20%7B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23087443%3B%5Cn%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-section%20%7B%5Cn%20%20%20%20%20%20%20%20padding%3A%2020px%200%3B%5Cn%20%20%20%20%20%20%20%20border-bottom%3A%201px%20solid%20%23dce3eb%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-section__title%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%200%2014px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23263d57%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2016px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-source__title%20%7B%5Cn%20%20%20%20%20%20%20%20color%3A%20%231f3854%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2015px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-source__meta%2C%5Cn%20%20%20%20%20%20.preview-source__summary%20%7B%5Cn%20%20%20%20%20%20%20%20margin%3A%208px%200%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%2364758a%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2013px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.5%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list%20%7B%5Cn%20%20%20%20%20%20%20%20display%3A%20grid%3B%5Cn%20%20%20%20%20%20%20%20gap%3A%2010px%3B%5Cn%20%20%20%20%20%20%20%20margin%3A%200%3B%5Cn%20%20%20%20%20%20%20%20padding%3A%200%3B%5Cn%20%20%20%20%20%20%20%20list-style%3A%20none%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list%20%3E%20li%20%7B%5Cn%20%20%20%20%20%20%20%20position%3A%20relative%3B%5Cn%20%20%20%20%20%20%20%20padding-left%3A%2022px%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%234e6075%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2014px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%201.5%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list%20%3E%20li%3A%3Abefore%20%7B%5Cn%20%20%20%20%20%20%20%20position%3A%20absolute%3B%5Cn%20%20%20%20%20%20%20%20left%3A%200%3B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23087443%3B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E2%9C%93'%3B%5Cn%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20.preview-list--changes%20%3E%20li%3A%3Abefore%20%7B%5Cn%20%20%20%20%20%20%20%20color%3A%20%23537da5%3B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E2%80%A2'%3B%5Cn%20%20%20%20%20%20%20%20font-size%3A%2020px%3B%5Cn%20%20%20%20%20%20%20%20line-height%3A%2018px%3B%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%40media%20(max-width%3A%20560px)%20%7B%5Cn%20%20%20%20%20%20%20%20.preview-page%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20padding%3A%2016px%3B%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20%20%20.preview-title%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20font-size%3A%2026px%3B%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%3C%2Fstyle%3E%5Cn%20%20%3C%2Fhead%3E%5Cn%20%20%3Cbody%20class%3D%5C%22preview-body%5C%22%3E%5Cn%20%20%20%20%3Cmain%20class%3D%5C%22preview-page%5C%22%3E%5Cn%20%20%20%20%20%20%3Cheader%20class%3D%5C%22preview-header%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-eyebrow%5C%22%3E%E5%8F%91%E5%B8%83%E6%96%B9%E6%A1%88%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Ch1%20class%3D%5C%22preview-title%5C%22%3E%E6%98%A5%E5%AD%A3%E8%90%A5%E9%94%80%E6%B4%BB%E5%8A%A8%3C%2Fh1%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-summary%5C%22%3E%E5%8F%91%E5%B8%83%E6%A3%80%E6%9F%A5%E5%B7%B2%E5%AE%8C%E6%88%90%EF%BC%8C%E5%BD%93%E5%89%8D%E7%89%88%E6%9C%AC%E5%B7%B2%E6%8C%89%E8%AE%A1%E5%88%92%E5%8F%91%E5%B8%83%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22preview-meta%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%5C%22preview-status%5C%22%3E%E5%B7%B2%E5%8F%91%E5%B8%83%3C%2Fspan%3E%3Cspan%3E%E5%8F%91%E5%B8%83%E6%97%B6%E9%97%B4%EF%BC%9A2026-04-18%2020%3A00%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fheader%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22preview-section%20preview-source%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch2%20class%3D%5C%22preview-section__title%5C%22%3E%E5%BD%93%E5%89%8D%E5%BC%95%E7%94%A8%3C%2Fh2%3E%5Cn%20%20%20%20%20%20%20%20%3Cstrong%20class%3D%5C%22preview-source__title%5C%22%3E__SOURCE_TITLE__%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-source__meta%5C%22%3E__SOURCE_META__%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%20class%3D%5C%22preview-source__summary%5C%22%3E__SOURCE_SUMMARY__%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22preview-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch2%20class%3D%5C%22preview-section__title%5C%22%3E%E6%A3%80%E6%9F%A5%E6%B8%85%E5%8D%95%3C%2Fh2%3E%5Cn%20%20%20%20%20%20%20%20%3Cul%20class%3D%5C%22preview-list%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E6%8E%A5%E5%8F%A3%E8%81%94%E8%B0%83%E5%AE%8C%E6%88%90%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E7%81%B0%E5%BA%A6%E5%BC%80%E5%85%B3%E5%B7%B2%E9%85%8D%E7%BD%AE%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E5%9B%9E%E5%BD%92%E6%8A%A5%E5%91%8A%E5%B7%B2%E5%BD%92%E6%A1%A3%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%3Csection%20class%3D%5C%22preview-section%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ch2%20class%3D%5C%22preview-section__title%5C%22%3E%E5%8F%98%E6%9B%B4%E6%91%98%E8%A6%81%3C%2Fh2%3E%5Cn%20%20%20%20%20%20%20%20%3Cul%20class%3D%5C%22preview-list%20preview-list--changes%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E6%96%B0%E5%A2%9E%E6%B4%BB%E5%8A%A8%E9%A6%96%E9%A1%B5%E5%92%8C%E6%9D%83%E7%9B%8A%E8%AF%B4%E6%98%8E%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E4%BC%98%E5%8C%96%E5%8F%91%E5%B8%83%E5%89%8D%E6%A0%A1%E9%AA%8C%E6%B5%81%E7%A8%8B%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cli%3E%E8%A1%A5%E5%85%85%E5%A4%B1%E8%B4%A5%E5%9B%9E%E6%BB%9A%E6%8F%90%E7%A4%BA%3C%2Fli%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%3C%2Fmain%3E%5Cn%20%20%3C%2Fbody%3E%5Cn%3C%2Fhtml%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{n.value=!1}),vueCode:d(T)},p({_:2},[D.value?{name:"vue",fn:a(()=>[t(d(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[14]||(e[14]=c('<p><code>mcp</code> 是内置保留面板 ID，不能在 <code>panels</code> 中注册。MCP 激活时直接使用自身的标题和关闭按钮；<code>layout-right-aside-title</code> 与 <code>layout-right-aside-panel</code> 只作用于应用注册的面板。</p><h3 id="插槽定制" tabindex="-1">插槽定制 <a class="header-anchor" href="#插槽定制" aria-label="Permalink to &quot;插槽定制&quot;">​</a></h3><p>优先使用局部插槽。<code>layout-right-aside</code>、<code>layout-header</code>、<code>layout-left-aside</code> 和 <code>layout-main</code> 会替换整个区域；开发者需要自行实现被替换区域的布局、事件、键盘、焦点和 ARIA 行为。</p><p><code>layout-main</code> 保留滚动宿主和滚动控制，<code>layout-footer</code> 保留外层 Footer，只替换默认 Sender。<code>layout-main</code> 优先于 <code>layout-empty-state</code>；自定义空状态需要调用 <code>renderComposer()</code> 才会渲染默认输入区。</p><h3 id="浮动聊天窗口" tabindex="-1">浮动聊天窗口 <a class="header-anchor" href="#浮动聊天窗口" aria-label="Permalink to &quot;浮动聊天窗口&quot;">​</a></h3><p><code>layout.surface.mode: &#39;floating&#39;</code> 启用浮动布局。通过 <code>floatingState</code> 和 <code>update:floating-state</code> 受控位置和尺寸；如果应用不写回新值，窗口会回到旧位置。</p>',6)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"受控浮动聊天",description:"打开聊天窗口并拖动或缩放，观察位置与尺寸状态同步更新。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22floating-layout.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Ffloating-layout.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20ref%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrChatUI%2C%20type%20ChatUIData%2C%20type%20ChatUIOptions%2C%20type%20LayoutFloatingState%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20open%20%3D%20ref(false)%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cnconst%20floatingState%20%3D%20ref%3CLayoutFloatingState%3E(%7B%5Cn%20%20placement%3A%20'top-right'%2C%5Cn%20%20offsetX%3A%2024%2C%5Cn%20%20offsetY%3A%2072%2C%5Cn%20%20width%3A%20520%2C%5Cn%20%20height%3A%20520%2C%5Cn%7D)%5Cn%5Cnconst%20data%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%20activeId%3A%20'floating'%2C%20title%3A%20'%E6%B5%AE%E5%8A%A8%E5%8A%A9%E6%89%8B'%20%7D%2C%5Cn%20%20bubble%3A%20%7B%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'intro'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%8B%96%E5%8A%A8%E9%A1%B6%E9%83%A8%E6%8A%8A%E6%89%8B%E6%88%96%E7%AA%97%E5%8F%A3%E8%BE%B9%E7%BC%98%EF%BC%8C%E5%A4%96%E9%83%A8%E7%8A%B6%E6%80%81%E4%BC%9A%E5%90%8C%E6%AD%A5%E6%9B%B4%E6%96%B0%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20surface%3A%20%7B%5Cn%20%20%20%20%20%20mode%3A%20'floating'%2C%5Cn%20%20%20%20%20%20floatingOptions%3A%20%7B%5Cn%20%20%20%20%20%20%20%20draggable%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20resizable%3A%20true%2C%5Cn%20%20%20%20%20%20%20%20minWidth%3A%20360%2C%5Cn%20%20%20%20%20%20%20%20maxWidth%3A%20760%2C%5Cn%20%20%20%20%20%20%20%20minHeight%3A%20420%2C%5Cn%20%20%20%20%20%20%20%20maxHeight%3A%20720%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20leftAside%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20stateText%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20const%20state%20%3D%20floatingState.value%5Cn%20%20return%20%60%24%7Bstate.placement%7D%20%C2%B7%20x%20%24%7Bstate.offsetX%7Dpx%20%C2%B7%20y%20%24%7Bstate.offsetY%7Dpx%20%C2%B7%20%24%7Bstate.width%7D%20%C3%97%20%24%7Bstate.height%7Dpx%60%5Cn%7D)%5Cn%5Cnfunction%20updateFloatingState(value%3A%20LayoutFloatingState)%20%7B%5Cn%20%20floatingState.value%20%3D%20value%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-floating-demo%5C%22%3E%5Cn%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20class%3D%5C%22chat-floating-demo__trigger%5C%22%20%40click%3D%5C%22open%20%3D%20!open%5C%22%3E%5Cn%20%20%20%20%20%20%7B%7B%20open%20%3F%20'%E5%85%B3%E9%97%AD%E6%B5%AE%E5%8A%A8%E8%81%8A%E5%A4%A9'%20%3A%20'%E6%89%93%E5%BC%80%E6%B5%AE%E5%8A%A8%E8%81%8A%E5%A4%A9'%20%7D%7D%5Cn%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22chat-floating-demo__state%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%E5%BD%93%E5%89%8D%E7%8A%B6%E6%80%81%EF%BC%9A%7B%7B%20stateText%20%7D%7D%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20v-if%3D%5C%22open%5C%22%5Cn%20%20%20%20%20%20class%3D%5C%22chat-floating-window%5C%22%5Cn%20%20%20%20%20%20%3Adata%3D%5C%22data%5C%22%5Cn%20%20%20%20%20%20%3Aui%3D%5C%22ui%5C%22%5Cn%20%20%20%20%20%20%3Ainput-value%3D%5C%22inputValue%5C%22%5Cn%20%20%20%20%20%20%3Afloating-state%3D%5C%22floatingState%5C%22%5Cn%20%20%20%20%20%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%5Cn%20%20%20%20%20%20%40update%3Afloating-state%3D%5C%22updateFloatingState%5C%22%5Cn%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23layout-header%3D%5C%22%7B%20title%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22chat-floating-demo__header%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cstrong%3E%7B%7B%20title%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20aria-label%3D%5C%22%E5%85%B3%E9%97%AD%E6%B5%AE%E5%8A%A8%E8%81%8A%E5%A4%A9%5C%22%20%40click%3D%5C%22open%20%3D%20false%5C%22%3E%E5%85%B3%E9%97%AD%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2FTrChatUI%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%3E%5Cn.chat-floating-window%20%7B%5Cn%20%20--tr-layout-floating-radius%3A%2012px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-floating-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%2010px%3B%5Cn%20%20min-height%3A%2072px%3B%5Cn%7D%5Cn%5Cn.chat-floating-demo__trigger%2C%5Cn.chat-floating-demo__header%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-floating-demo__state%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.chat-floating-demo__header%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20width%3A%20100%25%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{n.value=!1}),vueCode:d(R)},p({_:2},[b.value?{name:"vue",fn:a(()=>[t(d(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[15]||(e[15]=E("h3",{id:"窄视口与移动端",tabindex:"-1"},[B("窄视口与移动端 "),E("a",{class:"header-anchor",href:"#窄视口与移动端","aria-label":'Permalink to "窄视口与移动端"'},"​")],-1)),e[16]||(e[16]=E("p",null,[B("侧栏的 "),E("code",null,"dock"),B(" 模式占据页面宽度，"),E("code",null,"drawer"),B(" 模式覆盖主内容。下面的约束容器用于比较两种结果；它显式切换模式，不模拟浏览器视口。")],-1)),C(t(d(u),null,null,512),[[l,n.value]]),t(i,null,{default:a(()=>[t(d(A),{title:"Dock 与 Drawer",description:"比较桌面与移动端侧栏交互，并观察侧栏开闭事件。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22responsive-layout.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fresponsive-layout.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20TrChatUI%2C%5Cn%20%20type%20ChatAsideOpenChangePayload%2C%5Cn%20%20type%20ChatUIData%2C%5Cn%20%20type%20ChatUIOptions%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cntype%20PreviewMode%20%3D%20'dock'%20%7C%20'drawer'%5Cn%5Cnconst%20mode%20%3D%20shallowRef%3CPreviewMode%3E('dock')%5Cnconst%20inputValue%20%3D%20shallowRef('')%5Cnconst%20lastAsideEvent%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E8%A7%A6%E5%8F%91%E4%BE%A7%E6%A0%8F%E4%BA%8B%E4%BB%B6')%5Cnconst%20modeOptions%3A%20PreviewMode%5B%5D%20%3D%20%5B'dock'%2C%20'drawer'%5D%5Cn%5Cnconst%20data%3A%20ChatUIData%20%3D%20%7B%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20items%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'mobile'%2C%20title%3A%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF%E9%80%82%E9%85%8D'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'desktop'%2C%20title%3A%20'%E6%A1%8C%E9%9D%A2%E7%AB%AF%E5%B8%83%E5%B1%80'%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20activeId%3A%20'mobile'%2C%5Cn%20%20%20%20title%3A%20'%E5%93%8D%E5%BA%94%E5%BC%8F%E5%B8%83%E5%B1%80'%2C%5Cn%20%20%7D%2C%5Cn%20%20bubble%3A%20%7B%5Cn%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'question'%2C%20role%3A%20'user'%2C%20content%3A%20'%E7%AA%84%E8%A7%86%E5%8F%A3%E4%B8%8B%E4%BC%9A%E8%AF%9D%E5%88%97%E8%A1%A8%E5%A6%82%E4%BD%95%E5%B1%95%E7%A4%BA%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'answer'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E4%BE%A7%E6%A0%8F%E5%BA%94%E4%BD%BF%E7%94%A8%E6%8A%BD%E5%B1%89%E8%A6%86%E7%9B%96%E5%86%85%E5%AE%B9%EF%BC%8C%E5%B9%B6%E9%80%9A%E8%BF%87%E9%A1%B5%E5%A4%B4%E6%8C%89%E9%92%AE%E6%89%93%E5%BC%80%E6%88%96%E5%85%B3%E9%97%AD%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20sender%3A%20%7B%20submitDisabled%3A%20true%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20ui%20%3D%20computed%3CChatUIOptions%3E(()%20%3D%3E%20(%7B%5Cn%20%20layout%3A%20%7B%5Cn%20%20%20%20contentMaxWidth%3A%20mode.value%20%3D%3D%3D%20'drawer'%20%3F%20360%20%3A%20720%2C%5Cn%20%20%20%20leftAside%3A%20%7B%5Cn%20%20%20%20%20%20mode%3A%20mode.value%2C%5Cn%20%20%20%20%20%20defaultOpen%3A%20mode.value%20%3D%3D%3D%20'dock'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20rightAside%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%7D))%5Cn%5Cnfunction%20handleLeftAsideChange(payload%3A%20ChatAsideOpenChangePayload)%20%7B%5Cn%20%20lastAsideEvent.value%20%3D%20%60open%3A%20%24%7Bpayload.open%7D%EF%BC%8Csource%3A%20%24%7Bpayload.source%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22chat-responsive-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-responsive-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20v-for%3D%5C%22item%20in%20modeOptions%5C%22%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22item%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aclass%3D%5C%22%7B%20'is-active'%3A%20mode%20%3D%3D%3D%20item%20%7D%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aaria-pressed%3D%5C%22mode%20%3D%3D%3D%20item%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22mode%20%3D%20item%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20item%20%3D%3D%3D%20'dock'%20%3F%20'%E6%A1%8C%E9%9D%A2%20Dock'%20%3A%20'%E7%A7%BB%E5%8A%A8%E7%AB%AF%20Drawer'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cspan%20aria-live%3D%5C%22polite%5C%22%3E%E6%9C%80%E8%BF%91%E4%BA%8B%E4%BB%B6%EF%BC%9A%7B%7B%20lastAsideEvent%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-responsive-demo__stage%5C%22%20%3Aclass%3D%5C%22%60is-%24%7Bmode%7D%60%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20%20%20%3Akey%3D%5C%22mode%5C%22%5Cn%20%20%20%20%20%20%20%20%3Adata%3D%5C%22data%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aui%3D%5C%22ui%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ainput-value%3D%5C%22inputValue%5C%22%5Cn%20%20%20%20%20%20%20%20%40update%3Ainput-value%3D%5C%22inputValue%20%3D%20%24event%5C%22%5Cn%20%20%20%20%20%20%20%20%40left-aside-open-change%3D%5C%22handleLeftAsideChange%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-responsive-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20button%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%200%2012px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23252b3a)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20button%3Ahover%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20button.is-active%20%7B%5Cn%20%20border-color%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20var(--tr-color-primary%2C%20%231476ff)%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__toolbar%20span%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20600px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20overflow%3A%20hidden%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-color-border%2C%20%23dcdfe6)%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20transition%3A%20max-width%200.2s%20ease%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage.is-dock%20%7B%5Cn%20%20max-width%3A%20760px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage.is-drawer%20%7B%5Cn%20%20max-width%3A%20390px%3B%5Cn%7D%5Cn%5Cn.chat-responsive-demo__stage%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{n.value=!1}),vueCode:d(S)},p({_:2},[m.value?{name:"vue",fn:a(()=>[t(d(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[17]||(e[17]=c('<p>组件的自动响应式判断使用浏览器视口：宽度低于 <code>960px</code> 时侧栏转为抽屉。仅收窄父容器不会触发自动转换。视口转换导致侧栏状态变化时，会触发 <code>*-aside-open-change</code>，其 <code>source</code> 为 <code>&#39;viewport&#39;</code>；用户点击产生的事件则为 <code>&#39;user&#39;</code>。桌面端 <code>rightAside.mode: &#39;dock&#39;</code> 且 <code>resizable: true</code> 时可调整右栏宽度，移动端和 <code>drawer</code> 模式不支持调整宽度。</p><h2 id="可访问性与布局约束" tabindex="-1">可访问性与布局约束 <a class="header-anchor" href="#可访问性与布局约束" aria-label="Permalink to &quot;可访问性与布局约束&quot;">​</a></h2><ul><li>将 Chat 放入有明确高度的 flex 容器；消息区负责内部滚动。</li><li>内置图标按钮提供可访问名称。替换 Header、Sender、侧栏或主区后，开发者需要提供等效的名称、键盘操作和焦点管理。</li><li>宽度不足 <code>960px</code> 时，侧栏切换为抽屉。右栏、消息和自定义内容应允许收缩，长内容由区域自身滚动或换行。</li><li>当前没有另行承诺的 Chat CSS Variable；不要依赖内部 DOM 或 <code>--tr-chat-ui-*</code> 变量作为稳定定制入口。</li></ul><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p>所有 Chat 类型均从 <code>@opentiny/tiny-robot-chat</code> 导出，另有说明的 TinyRobot 基础组件类型除外。</p><h3 id="状态所有权" tabindex="-1">状态所有权 <a class="header-anchor" href="#状态所有权" aria-label="Permalink to &quot;状态所有权&quot;">​</a></h3><table tabindex="0"><thead><tr><th>输入或通知</th><th>所有者</th><th>组件行为</th></tr></thead><tbody><tr><td><code>TrChat.runtime</code></td><td>Runtime</td><td><code>TrChat</code> 读取状态并执行标准动作；会话、消息、请求、模型和 MCP 的详细协议见 <a href="./chat-runtime.html#runtime-协议">Chat 运行时</a>。</td></tr><tr><td><code>TrChatUI.data</code></td><td>应用</td><td>只读展示快照；用户操作后组件发出事件，应用处理并传入新的 <code>data</code>。</td></tr><tr><td><code>ui</code></td><td>应用</td><td>只配置区域、文案和组件选项，不保存会话数据，也不覆盖 Runtime 状态。</td></tr><tr><td><code>input-value</code>、右栏和浮动受控值</td><td>应用</td><td>组件发出 <code>update:*</code>，应用必须写回；<code>default-*</code> 只提供非受控初始值。</td></tr><tr><td>其他 Events</td><td>应用或 Runtime 适配层</td><td>表达用户意图或状态通知；<code>TrChatUI</code> 不会据此修改应用数据。</td></tr></tbody></table><h3 id="trchat-api" tabindex="-1">TrChat API <a class="header-anchor" href="#trchat-api" aria-label="Permalink to &quot;TrChat API&quot;">​</a></h3><h4 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>runtime</code></td><td>提供会话、Composer 状态和动作。</td><td><code>ChatRuntime</code></td><td>—</td><td>是</td></tr><tr><td><code>ui</code></td><td>配置页面布局、文案和区域。</td><td><code>ChatUIOptions</code></td><td>默认界面配置</td><td>否</td></tr><tr><td><code>title</code></td><td>覆盖当前会话提供的页面标题。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>history-data</code></td><td>覆盖 Runtime 会话生成的历史列表或分组。</td><td><code>ChatHistoryData</code></td><td>—</td><td>否</td></tr><tr><td><code>floating-state</code></td><td>浮动布局的受控位置和尺寸。</td><td><code>LayoutFloatingState</code></td><td>—</td><td>否</td></tr><tr><td><code>right-aside-open</code></td><td>右栏受控开闭状态。</td><td><code>boolean</code></td><td>—</td><td>否</td></tr><tr><td><code>default-right-aside-open</code></td><td>非受控右栏初始开闭状态。</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>active-right-aside-panel-id</code></td><td>右栏受控当前面板；应用处理更新事件。</td><td><code>ChatRightAsidePanelId</code></td><td>—</td><td>否</td></tr><tr><td><code>default-active-right-aside-panel-id</code></td><td>非受控当前面板初始值。</td><td><code>ChatRightAsidePanelId</code></td><td>第一个可用面板</td><td>否</td></tr></tbody></table><h4 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h4><p><code>TrChat</code> 在内部消费提交、取消、会话切换、模型选择和 MCP 开关事件，并调用 Runtime 动作；这些事件不会再次向外发出。</p><table tabindex="0"><thead><tr><th>事件</th><th>参数</th><th>触发时机</th></tr></thead><tbody><tr><td><code>runtime-action-error</code></td><td><code>ChatRuntimeActionErrorPayload</code></td><td>Runtime 动作失败；send 错误详情仍从所属消息读取。</td></tr><tr><td><code>history-action</code></td><td><code>ChatHistoryActionPayload</code></td><td>历史菜单操作；删除动作可调用 <code>preventDefault()</code> 阻止默认 Runtime 删除。</td></tr><tr><td><code>prompt-click</code></td><td><code>ChatPromptClickPayload</code></td><td>点击提示项。</td></tr><tr><td><code>mcp-create-server</code></td><td><code>ChatMcpCreateServerPayload</code></td><td>请求创建 MCP Server；Runtime 不处理创建表单。</td></tr><tr><td><code>bubble-state-change</code></td><td><code>ChatBubbleStateChangePayload</code></td><td>气泡内部状态变化。</td></tr><tr><td><code>bubble-event</code></td><td><code>ChatBubbleEventPayload</code></td><td>气泡内容发出自定义事件。</td></tr><tr><td><code>left-aside-open-change</code> / <code>right-aside-open-change</code></td><td><code>ChatAsideOpenChangePayload</code></td><td>侧栏状态变化。</td></tr><tr><td><code>update:right-aside-open</code></td><td><code>boolean</code></td><td>请求应用写回受控右栏开闭状态。</td></tr><tr><td><code>update:active-right-aside-panel-id</code></td><td><code>ChatRightAsidePanelId | undefined</code></td><td>请求应用写回受控右栏面板。</td></tr><tr><td><code>update:floating-state</code></td><td><code>LayoutFloatingState</code></td><td>请求应用写回受控浮动位置和尺寸。</td></tr><tr><td><code>floating-drag-start</code> / <code>floating-drag</code> / <code>floating-drag-end</code></td><td><code>LayoutFloatingDragDetail</code></td><td>浮动窗口拖拽生命周期。</td></tr><tr><td><code>floating-resize-start</code> / <code>floating-resize</code> / <code>floating-resize-end</code></td><td><code>LayoutFloatingResizeDetail</code></td><td>浮动窗口缩放生命周期。</td></tr></tbody></table><h4 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h4><p><code>TrChat</code> 将全部界面插槽传给内部的 <code>TrChatUI</code>。插槽名、作用域参数和替换责任见 <a href="#trchatui-slots">TrChatUI Slots</a>；作用域中的会话、提交、模型和 MCP 动作会连接当前 Runtime。</p><h4 id="expose" tabindex="-1">Expose <a class="header-anchor" href="#expose" aria-label="Permalink to &quot;Expose&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><code>send</code></td><td><code>(payload: ChatSendPayload) =&gt; Promise&lt;boolean&gt;</code></td><td>通过 Runtime 发送消息。</td></tr><tr><td><code>openRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>打开右栏，可同时指定面板。</td></tr><tr><td><code>closeRightAside</code></td><td><code>() =&gt; void</code></td><td>关闭右栏。</td></tr><tr><td><code>toggleRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>切换右栏，可同时指定面板。</td></tr><tr><td><code>activateRightAsidePanel</code></td><td><code>(panel: ChatRightAsidePanelId) =&gt; boolean</code></td><td>激活存在的面板并返回是否成功。</td></tr></tbody></table><h3 id="trchatui-api" tabindex="-1">TrChatUI API <a class="header-anchor" href="#trchatui-api" aria-label="Permalink to &quot;TrChatUI API&quot;">​</a></h3><h4 id="props-1" tabindex="-1">Props <a class="header-anchor" href="#props-1" aria-label="Permalink to &quot;Props&quot;">​</a></h4><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>data</code></td><td>应用提供的展示事实；组件不会修改该对象。</td><td><code>ChatUIData</code></td><td>空展示数据</td><td>否</td></tr><tr><td><code>ui</code></td><td>配置页面布局、文案和区域。</td><td><code>ChatUIOptions</code></td><td>默认界面配置</td><td>否</td></tr><tr><td><code>input-value</code></td><td>受控草稿；应用处理更新事件并写回新值。</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>default-input-value</code></td><td>非受控草稿初始值。</td><td><code>string</code></td><td><code>&#39;&#39;</code></td><td>否</td></tr><tr><td><code>floating-state</code></td><td>浮动布局的受控位置和尺寸。</td><td><code>LayoutFloatingState</code></td><td>—</td><td>否</td></tr><tr><td><code>right-aside-open</code></td><td>右栏受控开闭状态。</td><td><code>boolean</code></td><td>—</td><td>否</td></tr><tr><td><code>default-right-aside-open</code></td><td>非受控右栏初始开闭状态。</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>active-right-aside-panel-id</code></td><td>受控当前面板；应用处理更新事件。</td><td><code>ChatRightAsidePanelId</code></td><td>—</td><td>否</td></tr><tr><td><code>default-active-right-aside-panel-id</code></td><td>非受控当前面板初始值。</td><td><code>ChatRightAsidePanelId</code></td><td>第一个可用面板</td><td>否</td></tr></tbody></table><p><code>input-value</code> 与 <code>default-input-value</code> 二选一，并在组件生命周期内保持同一种模式。左栏的受控开闭值位于 <code>ui.layout.leftAside.open</code>；应用收到 <code>left-aside-open-change</code> 后更新该配置。</p><h4 id="events-1" tabindex="-1">Events <a class="header-anchor" href="#events-1" aria-label="Permalink to &quot;Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件</th><th>参数</th><th>应用责任</th></tr></thead><tbody><tr><td><code>submit</code></td><td><code>ChatSendPayload</code></td><td>发送请求并更新消息、请求状态和输入值。</td></tr><tr><td><code>update:input-value</code></td><td><code>string</code></td><td>受控输入时写回草稿。</td></tr><tr><td><code>cancel</code> / <code>clear</code></td><td>无</td><td>中止请求或清空草稿；组件不会修改外部请求。</td></tr><tr><td><code>create-conversation</code></td><td>无</td><td>清空当前会话或创建新会话。</td></tr><tr><td><code>switch-conversation</code></td><td><code>ChatSwitchConversationPayload</code></td><td>切换数据源并更新 <code>data.conversation.activeId</code>。</td></tr><tr><td><code>rename-conversation</code></td><td><code>ChatRenameConversationPayload</code></td><td>保存新标题并更新会话列表。</td></tr><tr><td><code>history-action</code></td><td><code>ChatHistoryActionPayload</code></td><td>处理历史菜单动作；<code>TrChatUI</code> 本身不会执行删除。</td></tr><tr><td><code>prompt-click</code></td><td><code>ChatPromptClickPayload</code></td><td>决定填充输入、直接提交或执行其他操作。</td></tr><tr><td><code>bubble-state-change</code> / <code>bubble-event</code></td><td>对应 payload</td><td>更新消息状态或处理自定义气泡事件。</td></tr><tr><td><code>model-select</code></td><td><code>ChatModelSelectPayload</code></td><td>更新 <code>data.model.selectedId</code>。</td></tr><tr><td><code>model-feature-change</code></td><td><code>ChatModelFeatureChangePayload</code></td><td>更新能力开关；异步时可同步 <code>pendingFeatureIds</code>。</td></tr><tr><td><code>model-reasoning-effort-change</code></td><td><code>ChatModelReasoningEffortChangePayload</code></td><td>更新 reasoning effort。</td></tr><tr><td><code>mcp-add-server</code> / <code>mcp-remove-server</code></td><td><code>ChatMcpAddServerPayload</code> / <code>ChatMcpRemoveServerPayload</code></td><td>更新 MCP Server 列表。</td></tr><tr><td><code>mcp-create-server</code></td><td><code>ChatMcpCreateServerPayload</code></td><td>创建并接入自定义 MCP Server。</td></tr><tr><td><code>mcp-server-enabled-change</code></td><td><code>ChatMcpServerEnabledChangePayload</code></td><td>更新 Server 启用状态。</td></tr><tr><td><code>mcp-tool-enabled-change</code></td><td><code>ChatMcpToolEnabledChangePayload</code></td><td>更新工具启用状态。</td></tr><tr><td><code>left-aside-open-change</code> / <code>right-aside-open-change</code></td><td><code>ChatAsideOpenChangePayload</code></td><td>受控时写回开闭状态；<code>source</code> 区分用户与视口变化。</td></tr><tr><td><code>update:right-aside-open</code></td><td><code>boolean</code></td><td>写回受控右栏开闭状态。</td></tr><tr><td><code>update:active-right-aside-panel-id</code></td><td><code>ChatRightAsidePanelId | undefined</code></td><td>写回受控当前面板。</td></tr><tr><td><code>update:floating-state</code></td><td><code>LayoutFloatingState</code></td><td>写回受控浮动位置和尺寸。</td></tr><tr><td><code>floating-drag-start</code> / <code>floating-drag</code> / <code>floating-drag-end</code></td><td><code>LayoutFloatingDragDetail</code></td><td>按需记录或响应拖拽生命周期。</td></tr><tr><td><code>floating-resize-start</code> / <code>floating-resize</code> / <code>floating-resize-end</code></td><td><code>LayoutFloatingResizeDetail</code></td><td>按需记录或响应缩放生命周期。</td></tr></tbody></table><p><span id="trchatui-slots"></span></p><h4 id="slots-1" tabindex="-1">Slots <a class="header-anchor" href="#slots-1" aria-label="Permalink to &quot;Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽</th><th>作用域参数</th><th>说明</th></tr></thead><tbody><tr><td><code>layout-header</code></td><td><code>ChatHeaderSlotProps</code></td><td>替换 Header。</td></tr><tr><td><code>layout-left-aside</code></td><td><code>ChatLeftAsideSlotProps</code></td><td>替换左侧展开面板。</td></tr><tr><td><code>layout-left-aside-brand</code> / <code>layout-left-aside-actions</code> / <code>layout-left-aside-footer</code> / <code>layout-left-aside-rail</code></td><td><code>ChatLeftAsideSlotProps</code></td><td>扩展默认左侧栏对应区域。</td></tr><tr><td><code>layout-left-aside-content</code></td><td><code>ChatLeftAsideContentSlotProps</code></td><td>扩展默认左侧栏内容区。</td></tr><tr><td><code>layout-left-aside-history-item-prefix</code></td><td><code>ChatHistoryItemPrefixSlotProps</code></td><td>扩展默认历史项前缀。</td></tr><tr><td><code>layout-right-aside</code></td><td><code>ChatRightAsidePanelSlotProps</code></td><td>替换整个右栏，并接管所有面板。</td></tr><tr><td><code>layout-right-aside-title</code></td><td><code>ChatRightAsideTitleSlotProps</code></td><td>替换应用注册面板的标题。</td></tr><tr><td><code>layout-right-aside-panel</code></td><td><code>ChatRightAsidePanelSlotProps</code></td><td>渲染应用注册面板的正文。</td></tr><tr><td><code>layout-main</code></td><td><code>ChatMainSlotProps</code></td><td>替换消息和空状态主内容。</td></tr><tr><td><code>layout-empty-state</code></td><td><code>ChatEmptyStateSlotProps</code></td><td>在没有可见消息时替换默认空状态。</td></tr><tr><td><code>layout-footer</code> / <code>composer-before</code></td><td><code>ChatSenderSlotProps</code></td><td>替换默认 Sender 或在其前插入内容。</td></tr><tr><td><code>sender-header</code> / <code>sender-footer</code> / <code>sender-footer-right</code></td><td>无</td><td>扩展默认 Sender。</td></tr><tr><td><code>header-notice</code> / <code>welcome-footer</code> / <code>prompts-footer</code></td><td>无</td><td>扩展对应区域。</td></tr><tr><td><code>bubble-prefix</code> / <code>bubble-suffix</code> / <code>bubble-after</code></td><td><code>ChatBubbleSlotProps</code></td><td>扩展消息周边。</td></tr><tr><td><code>bubble-content-footer</code></td><td><code>ChatBubbleContentFooterSlotProps</code></td><td>扩展消息内容底部。</td></tr></tbody></table><p>替换整个 Header、侧栏、主区或 Sender 时，插槽内容接管相应的按钮、事件、键盘、焦点和 ARIA 责任。<code>layout-main</code> 优先于 <code>layout-empty-state</code>。</p><h4 id="expose-1" tabindex="-1">Expose <a class="header-anchor" href="#expose-1" aria-label="Permalink to &quot;Expose&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><code>openRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>打开右栏，可同时指定面板。</td></tr><tr><td><code>closeRightAside</code></td><td><code>() =&gt; void</code></td><td>关闭右栏。</td></tr><tr><td><code>toggleRightAside</code></td><td><code>(panel?: ChatRightAsidePanelId) =&gt; void</code></td><td>切换右栏，可同时指定面板。</td></tr><tr><td><code>activateRightAsidePanel</code></td><td><code>(panel: ChatRightAsidePanelId) =&gt; boolean</code></td><td>激活存在的面板并返回是否成功。</td></tr></tbody></table><p><span id="chatui-data"></span></p><h4 id="chatuidata" tabindex="-1">ChatUIData <a class="header-anchor" href="#chatuidata" aria-label="Permalink to &quot;ChatUIData&quot;">​</a></h4><p><code>ChatUIData</code> 是应用拥有的只读展示快照，六个一级字段均为可选。组件会逐字段读取 <code>conversation</code>、<code>bubble</code> 和 <code>sender</code>，省略字段或传入 <code>undefined</code> 时使用下表默认值；空字符串、空数组、<code>false</code> 和 <code>null</code> 会保留，不会被默认值覆盖。<code>conversation: {}</code>、<code>bubble: {}</code> 和 <code>sender: {}</code> 因此会得到各自的字段默认值。<code>model</code>、<code>mcp</code> 和 <code>request</code> 没有默认对象；空的 <code>model</code> 或 <code>mcp</code> 对象仍表示该能力存在，若要隐藏应省略对应字段或把 <code>ui.model</code> / <code>ui.mcp</code> 设为 <code>false</code>。</p><table tabindex="0"><thead><tr><th>一级字段</th><th>类型</th><th>对应区域</th><th>省略时的结果</th></tr></thead><tbody><tr><td><code>conversation</code></td><td><code>ChatConversationView</code></td><td>页头标题、会话列表和当前选中</td><td>空列表、无选中，标题为“新对话”。</td></tr><tr><td><code>bubble</code></td><td><code>ChatBubbleView</code></td><td>消息主区</td><td><code>messages</code> 为空，进入空状态。</td></tr><tr><td><code>sender</code></td><td><code>ChatSenderView</code></td><td>输入区可用性与加载反馈</td><td>三个布尔状态均为 <code>false</code>。</td></tr><tr><td><code>model</code></td><td><code>ChatModelView</code></td><td>输入区模型选择器与能力开关</td><td>不显示模型选择器。</td></tr><tr><td><code>mcp</code></td><td><code>ChatMcpView</code></td><td>输入区 MCP 入口与内置右栏</td><td>不显示 MCP 入口或面板。</td></tr><tr><td><code>request</code></td><td><code>ChatRequestView</code></td><td>自定义主区和空状态插槽参数</td><td><code>undefined</code>；默认界面不额外显示状态。</td></tr></tbody></table><h5 id="conversation" tabindex="-1"><code>conversation</code> <a class="header-anchor" href="#conversation" aria-label="Permalink to &quot;`conversation`&quot;">​</a></h5><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>ChatConversationInfo[]</code></td><td><code>[]</code></td><td>原始会话列表；未提供 <code>history</code> 时按当前数组顺序生成默认历史数据。</td></tr><tr><td><code>activeId</code></td><td><code>string | null</code></td><td><code>null</code></td><td>当前选中会话 ID；应用处理切换事件后更新。</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td>新对话</td><td>页头标题；空字符串会原样显示。</td></tr><tr><td><code>history</code></td><td><code>ChatHistoryData</code></td><td>—</td><td>应用提供的排序或分组结果；提供后优先于根据 <code>items</code> 生成的默认历史。</td></tr></tbody></table><p><code>ChatConversationInfo</code>、<code>ChatMessageItem</code> 及消息内容结构见 <a href="./chat-runtime.html#会话消息与发送">Chat 运行时：会话、消息与发送</a>。</p><h5 id="bubble-与-sender" tabindex="-1"><code>bubble</code> 与 <code>sender</code> <a class="header-anchor" href="#bubble-与-sender" aria-label="Permalink to &quot;`bubble` 与 `sender`&quot;">​</a></h5><table tabindex="0"><thead><tr><th>路径</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>bubble.messages</code></td><td><code>ChatMessageItem[]</code></td><td><code>[]</code></td><td>消息事实；组件不会追加、删除或持久化消息。</td></tr><tr><td><code>sender.loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>显示发送中反馈并切换为取消操作。</td></tr><tr><td><code>sender.disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>禁用整个输入区。</td></tr><tr><td><code>sender.submitDisabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>仅禁止提交；输入仍可编辑。</td></tr></tbody></table><h5 id="model" tabindex="-1"><code>model</code> <a class="header-anchor" href="#model" aria-label="Permalink to &quot;`model`&quot;">​</a></h5><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>options</code></td><td><code>ChatModelOptionView[]</code></td><td>可选模型；空数组显示模型空态。</td></tr><tr><td><code>selectedId</code></td><td><code>string | null</code></td><td>当前模型；选择后应用通过 <code>model-select</code> 写回。</td></tr><tr><td><code>features</code></td><td><code>Partial&lt;Record&lt;&#39;thinking&#39; | &#39;search&#39;, boolean&gt;&gt;</code></td><td>当前能力开关。</td></tr><tr><td><code>reasoning</code></td><td><code>{ enabled: boolean; effort?: string }</code></td><td>深度思考及当前 effort。</td></tr><tr><td><code>selecting</code></td><td><code>boolean</code></td><td>模型切换中的整体等待状态。</td></tr><tr><td><code>reasoningSelecting</code></td><td><code>boolean</code></td><td>reasoning effort 切换中的等待状态。</td></tr><tr><td><code>pendingFeatureIds</code></td><td><code>(&#39;thinking&#39; | &#39;search&#39;)[]</code></td><td>正在切换的能力，用于逐项等待反馈。</td></tr></tbody></table><p><code>ChatModelOptionView</code> 至少包含 <code>id</code> 和 <code>label</code>，还可提供 <code>description</code>、<code>icon</code>、<code>disabled</code>、<code>group</code>、effort 列表、默认 effort、能力声明和 <code>metadata</code>。选择器浮层挂载位置由 <code>ui.model.appendTo</code> 配置，其他行为见 <a href="./../components/model-selector.html">ModelSelector</a>。</p><h5 id="mcp" tabindex="-1"><code>mcp</code> <a class="header-anchor" href="#mcp" aria-label="Permalink to &quot;`mcp`&quot;">​</a></h5><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>servers</code></td><td><code>ChatMcpServerView[]</code></td><td>Server 的安装、启用、加载和错误状态；应用处理对应事件后写回。</td></tr><tr><td><code>tools</code></td><td><code>ChatMcpToolMap</code></td><td>以 Server ID 为键的工具数组；工具包含 <code>id</code>、<code>name</code>、<code>enabled</code> 等。</td></tr></tbody></table><p><code>ChatMcpServerView</code> 要求 <code>id</code>、<code>name</code>、<code>installed</code> 和 <code>enabled</code>；可选 <code>description</code>、<code>icon</code>、<code>category</code>、<code>loading</code>、<code>error</code> 与 <code>metadata</code>。<code>ChatMcpToolView</code> 要求 <code>id</code>、<code>name</code> 和 <code>enabled</code>，可选 <code>description</code> 与 <code>loading</code>。只有 <code>ui.mcp</code> 与 <code>ui.layout.rightAside</code> 都未设为 <code>false</code> 时，MCP 入口和内置面板才可见。</p><h5 id="request" tabindex="-1"><code>request</code> <a class="header-anchor" href="#request" aria-label="Permalink to &quot;`request`&quot;">​</a></h5><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>state</code></td><td><code>&#39;idle&#39; | &#39;processing&#39; | &#39;completed&#39; | &#39;paused&#39; | &#39;aborted&#39; | &#39;error&#39;</code></td><td>是</td><td>请求生命周期。</td></tr><tr><td><code>processingState</code></td><td><code>&#39;requesting&#39; | &#39;completing&#39; | string</code></td><td>否</td><td>应用定义的处理中阶段。</td></tr></tbody></table><p><code>request</code> 会传给 <code>layout-main</code> 和 <code>layout-empty-state</code>。默认界面的发送中反馈读取 <code>sender.loading</code>，消息错误读取 <code>message.state.error</code>；只更新 <code>request</code> 不会自动渲染这些反馈。</p><p><span id="chatui-options"></span></p><h4 id="chatuioptions" tabindex="-1">ChatUIOptions <a class="header-anchor" href="#chatuioptions" aria-label="Permalink to &quot;ChatUIOptions&quot;">​</a></h4><p><code>ChatUIOptions</code> 的十一个一级字段均为可选，并按分支与默认配置合并；传入空对象或 <code>undefined</code> 都得到默认界面。标记为 <code>false</code> 的区域会被移除；重新传入对象即可恢复。数组字段以应用提供的数组整体替换默认数组，<code>bubble.bubbleList.roleConfigs</code> 例外，它按角色键合并。</p><table tabindex="0"><thead><tr><th>一级字段</th><th>类型</th><th>省略时的行为与合并规则</th><th><code>false</code> 的结果</th></tr></thead><tbody><tr><td><code>layout</code></td><td><code>ChatLayoutOptions</code></td><td>逐个布局字段 fallback，嵌套的 <code>surface</code>、<code>composer</code>、左右侧栏分别解析。</td><td>不支持；使用 <code>leftAside</code> / <code>rightAside</code>。</td></tr><tr><td><code>brand</code></td><td><code>ChatBrandOptions</code></td><td>与默认名称 <code>TinyRobot</code> 和默认图标浅合并。</td><td>不支持。</td></tr><tr><td><code>labels</code></td><td><code>Partial&lt;ChatLabels&gt;</code></td><td>按字段覆盖内置中文文案；也会更新默认欢迎文案和历史菜单文案。</td><td>不支持。</td></tr><tr><td><code>header</code></td><td><code>false</code></td><td>省略时显示默认 Header。</td><td>移除 Header。</td></tr><tr><td><code>history</code></td><td><code>false | ChatHistoryOptions</code></td><td>与默认 History 选项合并；<code>menuItems</code> 整体替换默认重命名、删除菜单。</td><td>隐藏历史列表，左栏品牌和动作仍在。</td></tr><tr><td><code>welcome</code></td><td><code>false | ChatWelcomeOptions</code></td><td>与默认 Welcome 选项合并；标题和描述 fallback 到 <code>labels</code>。</td><td>空会话不显示 Welcome。</td></tr><tr><td><code>prompts</code></td><td><code>false | ChatPromptsOptions</code></td><td>与默认 Prompts 选项合并；<code>items</code> 整体替换，默认 <code>[]</code>。</td><td>不显示提示项。</td></tr><tr><td><code>bubble</code></td><td><code>ChatBubbleOptions</code></td><td>合并气泡 Provider 和列表配置；<code>autoScroll</code> 默认 <code>true</code>，system 消息默认隐藏。</td><td>不支持。</td></tr><tr><td><code>sender</code></td><td><code>false | ChatSenderOptions</code></td><td>与默认 Sender 选项浅合并。</td><td>移除输入区及其插槽。</td></tr><tr><td><code>model</code></td><td><code>false | ChatModelOptions</code></td><td>默认 <code>{}</code>；只有 <code>data.model</code> 存在时显示。</td><td>即使存在模型数据也隐藏选择器。</td></tr><tr><td><code>mcp</code></td><td><code>false | ChatMcpOptions</code></td><td>默认 <code>{}</code>；当前没有额外配置字段。</td><td>即使存在 MCP 数据也隐藏入口和面板。</td></tr></tbody></table><h5 id="layout" tabindex="-1"><code>layout</code> <a class="header-anchor" href="#layout" aria-label="Permalink to &quot;`layout`&quot;">​</a></h5><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>surface.mode</code></td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>&#39;normal&#39;</code></td><td>页面或浮动窗口；浮动时读取 <code>floatingOptions</code> 与 <code>floating-state</code>。</td></tr><tr><td><code>emptyState</code></td><td><code>&#39;start&#39; | &#39;center&#39;</code></td><td><code>&#39;start&#39;</code></td><td>空状态在主区起始位置或居中。</td></tr><tr><td><code>composer.welcome</code></td><td><code>&#39;footer&#39; | &#39;center&#39;</code></td><td><code>&#39;footer&#39;</code></td><td>空会话时输入区位于 Footer 或 Welcome 中央。</td></tr><tr><td><code>contentMaxWidth</code></td><td><code>string | number</code></td><td><code>980</code></td><td>消息、Welcome 和输入区的最大内容宽度。</td></tr><tr><td><code>panelPadding</code> / <code>panelGap</code></td><td><code>string | number</code></td><td><code>12</code> / <code>12</code></td><td>内容区内边距与区域间距。</td></tr><tr><td><code>leftAside</code></td><td><code>false | ChatAsideOptions</code></td><td>Dock，<code>300</code> / <code>56</code>，关闭</td><td>左栏；<code>open</code> 为受控值，<code>defaultOpen</code> 为非受控初始值。</td></tr><tr><td><code>rightAside</code></td><td><code>false | ChatRightAsideOptions</code></td><td>Dock，宽 <code>320</code>，不可缩放</td><td>右栏；只有注册应用面板或存在可见 MCP 数据时才渲染。</td></tr></tbody></table><p><code>ChatAsideOptions</code> 还包含 <code>mode</code>、<code>width</code>、<code>collapsedWidth</code>。浏览器视口低于 <code>960px</code> 时实际模式强制为 <code>drawer</code>。<code>ChatRightAsideOptions</code> 另有 <code>showClose</code>、<code>resizable</code>、<code>minWidth</code>、<code>maxWidth</code> 和 <code>panels</code>；<code>panels</code> 需要配合 <code>layout-right-aside</code> 或 <code>layout-right-aside-panel</code> 插槽，重复 ID 以及保留 ID <code>mcp</code> 会被忽略。</p><h5 id="其他配置字段" tabindex="-1">其他配置字段 <a class="header-anchor" href="#其他配置字段" aria-label="Permalink to &quot;其他配置字段&quot;">​</a></h5><table tabindex="0"><thead><tr><th>分支</th><th>常用字段或默认值</th><th>详细来源</th></tr></thead><tbody><tr><td><code>brand</code></td><td><code>name?: string</code>、<code>logo?: unknown</code>。</td><td>—</td></tr><tr><td><code>labels</code></td><td>会话创建/重命名/删除、侧栏展开/收起、输入占位、模型、MCP、Welcome、右栏和滚动到底部等文案。</td><td>—</td></tr><tr><td><code>history</code></td><td>默认菜单为重命名和删除；Chat 固定管理 <code>data</code>、<code>selected</code> 与事件。</td><td><a href="./../components/history.html">History</a></td></tr><tr><td><code>welcome</code></td><td>默认标题与描述来自 <code>labels.welcomeTitle</code>、<code>labels.welcomeDescription</code>。</td><td><a href="./../components/welcome.html">Welcome</a></td></tr><tr><td><code>prompts</code></td><td><code>items?: PromptProps[]</code>，其余展示选项继承 Prompts。</td><td><a href="./../components/prompts.html">Prompts</a></td></tr><tr><td><code>bubble</code></td><td><code>autoScroll</code>、<code>bubbleProvider</code>、<code>bubbleList</code>；<code>bubbleProvider.errorRenderer</code> 可替换默认消息错误视图，传入 <code>null</code> 可关闭。</td><td><a href="./../components/bubble.html">Bubble</a></td></tr><tr><td><code>sender</code></td><td>默认 <code>mode: &#39;multiple&#39;</code>、<code>clearable: true</code>、<code>maxLength: 1000</code>、<code>showWordLimit: true</code>；值和禁用状态由 Chat 管理。</td><td><a href="./../components/sender.html">Sender</a></td></tr><tr><td><code>model</code></td><td>当前字段为 <code>appendTo?: ModelSelectorProps[&#39;appendTo&#39;]</code>。</td><td><a href="./../components/model-selector.html">ModelSelector</a></td></tr><tr><td><code>mcp</code></td><td><code>Record&lt;string, never&gt;</code>，当前没有配置字段。</td><td>—</td></tr></tbody></table><p><code>ChatLabels</code> 的字段为 <code>newConversationTitle</code>、<code>createConversation</code>、<code>renameConversation</code>、<code>deleteConversation</code>、<code>expandConversationList</code>、<code>collapseConversationList</code>、<code>composerPlaceholder</code>、<code>composerLoadingPlaceholder</code>、<code>selectModel</code>、<code>searchModel</code>、<code>modelEmptyText</code>、<code>mcp</code>、<code>thinkingFeature</code>、<code>searchFeature</code>、<code>welcomeTitle</code>、<code>welcomeDescription</code>、<code>rightAsideTitle</code>、<code>openRightAside</code>、<code>closeRightAside</code> 和 <code>scrollToBottom</code>，字段值均为 <code>string</code>。</p><h3 id="类型索引" tabindex="-1">类型索引 <a class="header-anchor" href="#类型索引" aria-label="Permalink to &quot;类型索引&quot;">​</a></h3><h4 id="组件与核心对象" tabindex="-1">组件与核心对象 <a class="header-anchor" href="#组件与核心对象" aria-label="Permalink to &quot;组件与核心对象&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>种类</th><th>说明</th></tr></thead><tbody><tr><td><code>ChatUIProps</code></td><td><code>interface</code></td><td><code>TrChatUI</code> Props 的 camelCase 类型。</td></tr><tr><td><code>ChatUIEmits</code></td><td><code>interface</code></td><td><code>TrChatUI</code> 事件名到参数元组的映射。</td></tr><tr><td><code>ChatUISlots</code></td><td><code>interface</code></td><td>两个组件共享的插槽函数映射。</td></tr><tr><td><code>ChatUIData</code></td><td><code>interface</code></td><td>展示快照；字段行为见 <a href="#chatui-data">ChatUIData</a>。</td></tr><tr><td><code>ChatUIOptions</code></td><td><code>interface</code></td><td>界面配置；字段行为见 <a href="#chatui-options">ChatUIOptions</a>。</td></tr><tr><td><code>ChatCssSize</code></td><td><code>type</code></td><td><code>string | number</code>。</td></tr><tr><td><code>ChatWelcomeComposerPlacement</code></td><td><code>type</code></td><td><code>&#39;footer&#39; | &#39;center&#39;</code>。</td></tr><tr><td><code>ChatRightAsidePanelId</code></td><td><code>type</code></td><td><code>string</code>。</td></tr><tr><td><code>ChatRightAsidePanelContext</code></td><td><code>interface</code></td><td>当前 <code>panelId</code> 与可选的面板配置。</td></tr><tr><td><code>ChatBuiltInModelFeature</code></td><td><code>type</code></td><td><code>&#39;thinking&#39; | &#39;search&#39;</code>。</td></tr><tr><td><code>ChatRequestState</code></td><td><code>type</code></td><td>请求生命周期联合类型。</td></tr><tr><td><code>ChatProcessingState</code></td><td><code>type</code></td><td><code>&#39;requesting&#39; | &#39;completing&#39; | string</code>。</td></tr></tbody></table><p>共享的 <code>ChatConversationInfo</code>、<code>ChatMessageItem</code>、消息内容、Runtime 和动作类型统一列在 <a href="./chat-runtime.html#api">Chat 运行时 API</a>，这里不重复定义。</p><h4 id="展示数据类型" tabindex="-1">展示数据类型 <a class="header-anchor" href="#展示数据类型" aria-label="Permalink to &quot;展示数据类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>ChatConversationView</code></td><td>会话列表、当前 ID、标题和可选历史分组。</td></tr><tr><td><code>ChatHistoryData</code></td><td><code>ChatConversationInfo[] | ChatHistoryGroup[]</code>。</td></tr><tr><td><code>ChatHistoryGroup</code></td><td><code>group: string | symbol</code> 与 <code>items</code>。</td></tr><tr><td><code>ChatBubbleView</code></td><td>消息列表容器。</td></tr><tr><td><code>ChatSenderView</code></td><td>输入区 loading、disabled 与 submitDisabled 状态。</td></tr><tr><td><code>ChatRequestView</code></td><td>请求 <code>state</code> 与可选 <code>processingState</code>。</td></tr><tr><td><code>ChatModelView</code></td><td>模型列表、选中值、能力、reasoning 和异步状态。</td></tr><tr><td><code>ChatModelOptionView</code></td><td>单个模型的标签、能力、effort 与元数据。</td></tr><tr><td><code>ChatMcpView</code></td><td>MCP Server 列表与工具映射。</td></tr><tr><td><code>ChatMcpServerView</code></td><td>单个 Server 的安装、启用、加载和错误状态。</td></tr><tr><td><code>ChatMcpToolView</code></td><td>单个工具的名称、启用和加载状态。</td></tr><tr><td><code>ChatMcpToolMap</code></td><td><code>Partial&lt;Record&lt;string, readonly ChatMcpToolView[]&gt;&gt;</code>，键为 Server ID。</td></tr></tbody></table><h4 id="界面配置类型" tabindex="-1">界面配置类型 <a class="header-anchor" href="#界面配置类型" aria-label="Permalink to &quot;界面配置类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>ChatLayoutOptions</code></td><td>页面 surface、空状态、内容宽度、间距和两侧栏。</td></tr><tr><td><code>ChatSurfaceOptions</code></td><td>正常或浮动 surface 配置。</td></tr><tr><td><code>ChatComposerLayoutOptions</code></td><td>Welcome 中输入区的位置。</td></tr><tr><td><code>ChatBrandOptions</code></td><td>品牌名称与图标。</td></tr><tr><td><code>ChatLabels</code></td><td>Chat 所有内置中文文案字段。</td></tr><tr><td><code>ChatAsideOptions</code></td><td>左栏模式、宽度与开闭值。</td></tr><tr><td><code>ChatRightAsideOptions</code></td><td>右栏模式、宽度、缩放与面板注册。</td></tr><tr><td><code>ChatRightAsidePanelOptions</code></td><td><code>id</code> 与可选 <code>title</code>。</td></tr><tr><td><code>ChatHistoryOptions</code></td><td>基于 <code>HistoryProps&lt;ChatConversationInfo&gt;</code>，排除 Chat 管理的数据和事件字段。</td></tr><tr><td><code>ChatBubbleOptions</code></td><td>Bubble Provider、列表和自动滚动配置。</td></tr><tr><td><code>ChatBubbleListOptions</code></td><td>基于 <code>BubbleListProps</code>，排除 Chat 管理的消息和自动滚动字段。</td></tr><tr><td><code>ChatWelcomeOptions</code></td><td><code>Partial&lt;WelcomeProps&gt;</code>。</td></tr><tr><td><code>ChatPromptsOptions</code></td><td>基于 <code>PromptsProps</code>，增加可选 <code>items</code>。</td></tr><tr><td><code>ChatSenderOptions</code></td><td>基于 <code>SenderProps</code>，排除值、loading、disabled 和原始 defaultActions。</td></tr><tr><td><code>ChatSenderDefaultActions</code></td><td>基于 <code>DefaultActions</code>，提交按钮的 disabled 由 Chat 管理。</td></tr><tr><td><code>ChatModelOptions</code></td><td>ModelSelector 的浮层挂载配置。</td></tr><tr><td><code>ChatMcpOptions</code></td><td>当前为空对象配置。</td></tr></tbody></table><h4 id="插槽作用域" tabindex="-1">插槽作用域 <a class="header-anchor" href="#插槽作用域" aria-label="Permalink to &quot;插槽作用域&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>字段</th></tr></thead><tbody><tr><td><code>ChatHeaderSlotProps</code></td><td><code>title</code>；<code>isEmpty</code>；<code>conversation</code>；<code>createConversation()</code>；<code>isLeftAsideOpen</code>；<code>openLeftAside()</code>；<code>closeLeftAside()</code>；<code>toggleLeftAside()</code>；<code>openRightAside(panel?)</code>；<code>closeRightAside()</code></td></tr><tr><td><code>ChatLeftAsideSlotProps</code></td><td><code>conversation</code>；<code>isOpen</code>；<code>isDock</code>；<code>createConversation()</code>；<code>switchConversation(id)</code>；<code>renameConversation(id, title)</code>；<code>deleteConversation(id)</code>；<code>openLeftAside()</code>；<code>closeLeftAside()</code>；<code>toggleLeftAside()</code></td></tr><tr><td><code>ChatLeftAsideContentSlotProps</code></td><td>继承 <code>ChatLeftAsideSlotProps</code>；<code>history?: ChatHistoryData</code></td></tr><tr><td><code>ChatHistoryItemPrefixSlotProps</code></td><td><code>item: ChatConversationInfo</code></td></tr><tr><td><code>ChatRightAsidePanelSlotProps</code></td><td><code>panelId?</code>；<code>panel?</code>；<code>panels</code>；右栏打开、关闭、切换和激活方法；<code>isRightAsideOpen</code></td></tr><tr><td><code>ChatRightAsideTitleSlotProps</code></td><td><code>panelId?</code>；<code>panel?</code></td></tr><tr><td><code>ChatSenderSlotProps</code></td><td><code>value</code>；<code>loading</code>；<code>disabled</code>；<code>submitDisabled</code>；输入更新、提交、取消和清空方法</td></tr><tr><td><code>ChatMainSlotProps</code></td><td><code>messages</code>；<code>request?</code>；<code>conversation</code></td></tr><tr><td><code>ChatEmptyStateSlotProps</code></td><td>继承主区数据；<code>isEmpty: true</code>；<code>renderComposer()</code></td></tr><tr><td><code>ChatBubbleSlotProps</code></td><td><code>messages</code>；<code>role?</code>；<code>messageIndexes</code></td></tr><tr><td><code>ChatBubbleContentFooterSlotProps</code></td><td>继承 <code>ChatBubbleSlotProps</code>；<code>contentIndex?</code></td></tr></tbody></table><h4 id="事件参数" tabindex="-1">事件参数 <a class="header-anchor" href="#事件参数" aria-label="Permalink to &quot;事件参数&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型</th><th>字段</th></tr></thead><tbody><tr><td><code>ChatSendPayload</code></td><td><code>text: string</code>；<code>structuredData?: ChatStructuredData</code></td></tr><tr><td><code>ChatStructuredData</code></td><td><code>ChatStructuredDataItem[]</code></td></tr><tr><td><code>ChatStructuredDataItem</code></td><td><code>type: string</code>；可追加自定义字段。</td></tr><tr><td><code>ChatHistoryActionPayload</code></td><td><code>action: HistoryMenuItem</code>；<code>conversation: ChatConversationInfo</code>；<code>defaultPrevented</code>；<code>preventDefault()</code></td></tr><tr><td><code>ChatSwitchConversationPayload</code></td><td><code>conversationId: string</code></td></tr><tr><td><code>ChatRenameConversationPayload</code></td><td><code>conversationId: string</code>；<code>title: string</code></td></tr><tr><td><code>ChatPromptClickPayload</code></td><td><code>event: MouseEvent</code>；<code>item: PromptProps</code></td></tr><tr><td><code>ChatModelSelectPayload</code></td><td><code>modelId: string | null</code></td></tr><tr><td><code>ChatModelFeatureChangePayload</code></td><td><code>featureId: &#39;thinking&#39; | &#39;search&#39;</code>；<code>enabled: boolean</code></td></tr><tr><td><code>ChatModelReasoningEffortChangePayload</code></td><td><code>effort: string | null</code></td></tr><tr><td><code>ChatMcpAddServerPayload</code> / <code>ChatMcpRemoveServerPayload</code></td><td><code>serverId: string</code></td></tr><tr><td><code>ChatMcpCreateServerPayload</code></td><td><code>type: &#39;form&#39; | &#39;code&#39;</code>；<code>data: PluginCreationData</code></td></tr><tr><td><code>ChatMcpServerEnabledChangePayload</code></td><td><code>serverId: string</code>；<code>enabled: boolean</code></td></tr><tr><td><code>ChatMcpToolEnabledChangePayload</code></td><td><code>serverId: string</code>；<code>toolId: string</code>；<code>enabled: boolean</code></td></tr><tr><td><code>ChatAsideOpenChangePayload</code></td><td><code>open: boolean</code>；<code>source: &#39;user&#39; | &#39;viewport&#39;</code></td></tr><tr><td><code>ChatBubbleStateChangePayload</code></td><td><code>key</code>；<code>value</code>；<code>messageIndex</code>；<code>contentIndex</code></td></tr><tr><td><code>ChatBubbleEventPayload</code></td><td><code>name</code>；<code>payload?</code>；<code>messageIndex</code>；<code>contentIndex</code></td></tr></tbody></table><p><code>LayoutFloatingState</code>、<code>LayoutFloatingDragDetail</code>、<code>LayoutFloatingResizeDetail</code>、<code>HistoryMenuItem</code>、<code>PromptProps</code>、<code>BubbleMessage</code>、<code>ModelSelectorReasoningEffortOption</code> 和 <code>PluginCreationData</code> 来自 <code>@opentiny/tiny-robot</code>。气泡状态、事件和渲染器见 <a href="./../components/bubble.html">Bubble</a>。</p><h2 id="常见问题" tabindex="-1">常见问题 <a class="header-anchor" href="#常见问题" aria-label="Permalink to &quot;常见问题&quot;">​</a></h2><h3 id="页面没有高度或消息区不滚动" tabindex="-1">页面没有高度或消息区不滚动 <a class="header-anchor" href="#页面没有高度或消息区不滚动" aria-label="Permalink to &quot;页面没有高度或消息区不滚动&quot;">​</a></h3><p>检查应用根节点、页面容器和 Chat 外层是否有可计算高度，并允许中间 flex 子项收缩。</p><h3 id="trchatui-是否保存会话" tabindex="-1">TrChatUI 是否保存会话 <a class="header-anchor" href="#trchatui-是否保存会话" aria-label="Permalink to &quot;TrChatUI 是否保存会话&quot;">​</a></h3><p>不会。应用处理事件后，将会话、消息、请求和输入状态写回 <code>data</code>。</p>',75))])}}});export{z as __pageData,X as default};
