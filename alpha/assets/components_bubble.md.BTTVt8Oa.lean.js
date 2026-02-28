const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/state-change.jB2PE7X4.js","assets/chunks/framework.Bj9nRyxS.js","assets/chunks/theme.CziWrlFo.js","assets/chunks/custom-renderer.1Bq--Eqj.js","assets/chunks/tools.8p7nqd2o.js","assets/chunks/reasoning.BpmlSQBT.js","assets/chunks/provider-renderer.D4BjeOGV.js","assets/chunks/list-auto-scroll.Cn8YHoVy.js","assets/chunks/list-hidden.4CBXa2bD.js","assets/chunks/list-array-content.lyUVfPCl.js","assets/chunks/list-custom-group.DPZkCNjW.js","assets/chunks/list-consecutive.VEZElHxx.js","assets/chunks/list.DevMsPx3.js","assets/chunks/schema-render.B-2aMRQJ.js","assets/chunks/slots.Bw8YJo5K.js","assets/chunks/content-resolver.nNucgQ-3.js","assets/chunks/content-render-mode.cKfKBa8X.js","assets/chunks/image.C5rI-Brh.js","assets/chunks/streaming.Dvyaqiic.js","assets/chunks/markdown.DE4YHVSv.js","assets/chunks/loading.DlB7X5Ym.js","assets/chunks/shape.BH1_hLhO.js","assets/chunks/avatar-and-placement.ChqKP63S.js","assets/chunks/basic.B5v1b2pq.js"])))=>i.map(i=>d[i]);
import{aD as u,bQ as b,aZ as q,aL as J,v as V,H as y,bL as r,bB as p,J as t,bk as s,bJ as i,G as h,w as l,I as o,b7 as g,aU as z}from"./chunks/framework.Bj9nRyxS.js";import{L as c,N as k}from"./chunks/index.CWoq7UBq.js";const U=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <label>
        <input type="checkbox" v-model="messageState.expanded" />
        展开消息
      </label>
    </div>

    <tr-bubble
      content="这是一条可以交互的消息"
      :avatar="aiAvatar"
      :state="messageState"
      @state-change="handleStateChange"
    >
      <template #content-footer>
        <div v-if="messageState.expanded" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee">
          <button @click="toggleLike" style="padding: 4px 8px; font-size: 12px">
            {{ messageState.liked ? '取消点赞' : '点赞' }}
          </button>
        </div>
      </template>
    </tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const messageState = ref<Record<string, unknown>>({
  expanded: false,
  liked: false,
})

const handleStateChange = (payload: { key: string; value: unknown }) => {
  messageState.value[payload.key] = payload.value
}

const toggleLike = () => {
  messageState.value.liked = !messageState.value.liked
  handleStateChange({ key: 'liked', value: messageState.value.liked })
}
<\/script>
`,j=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble :content="codeMessage" :avatar="aiAvatar" :fallback-content-renderer="CodeBlockRenderer"></tr-bubble>
    <tr-bubble :content="normalMessage" :avatar="aiAvatar"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { BubbleContentRendererProps, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineComponent, h } from 'vue'
import { useMessageContent } from '@opentiny/tiny-robot'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

// 定义代码消息类型
interface CodeMessage {
  type: 'code'
  language: string
  code: string
}

const codeMessage: CodeMessage[] = [
  {
    type: 'code',
    language: 'javascript',
    code: \`function hello() {
  console.log('Hello, World!')
}\`,
  },
]

const normalMessage = '这是一条普通消息'

// 自定义代码块渲染器
const CodeBlockRenderer = defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    // 使用 useMessageContent 来正确处理数组内容和 contentIndex
    const { content: contentItem } = useMessageContent(props)

    return () => {
      const content = contentItem.value as unknown as CodeMessage

      if (!content || content.type !== 'code') {
        return h('div', '无效的代码内容')
      }

      return h('div', { class: 'code-block-wrapper' }, [
        h(
          'div',
          {
            class: 'code-block-header',
            style: {
              padding: '8px 12px',
              background: '#2d2d2d',
              color: '#fff',
              fontSize: '12px',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
            },
          },
          content.language || 'code',
        ),
        h(
          'pre',
          {
            class: 'code-block-content',
            style: {
              margin: 0,
              padding: '12px',
              background: '#1e1e1e',
              color: '#d4d4d4',
              fontSize: '14px',
              fontFamily: 'monospace',
              borderBottomLeftRadius: '6px',
              borderBottomRightRadius: '6px',
              overflow: 'auto',
            },
          },
          h('code', {}, content.code),
        ),
      ])
    }
  },
})
<\/script>

<style scoped>
.code-block-wrapper {
  width: 100%;
  max-width: 100%;
}
</style>
`,N=`<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const toolCalls = ref([
  {
    id: 'call_0',
    type: 'function',
    function: { name: 'add', arguments: '{"a": 4, "b": 4}' },
  },
  {
    id: 'call_1',
    type: 'function',
    function: { name: 'multiply', arguments: '{"a": 4, "b": 4}' },
  },
])

const state = ref<{
  toolCall: Record<string, { status?: string; open?: boolean }>
}>({
  toolCall: {
    call_0: { status: 'running', open: true },
    call_1: { open: true },
  },
})

const handleChangeToolCallStatus = () => {
  const allStatus = ['running', 'success', 'failed', 'cancelled']
  const currentStatus = state.value.toolCall.call_0!.status!
  const nextStatus = allStatus[(allStatus.indexOf(currentStatus) + 1) % allStatus.length]
  state.value.toolCall.call_0!.status = nextStatus
}

const handleChangeToolCallArguments = () => {
  const args = toolCalls.value[0]!.function.arguments
  const parsedArgs = JSON.parse(args)
  parsedArgs.a = parsedArgs.a + 1
  toolCalls.value[0]!.function.arguments = JSON.stringify(parsedArgs)
}

const isReplaying = ref(false)

const handleReplaySecondToolCall = async () => {
  const originalArguments = toolCalls.value[1]!.function.arguments

  isReplaying.value = true
  toolCalls.value[1]!.function.arguments = ''
  state.value.toolCall.call_1!.status = 'running'
  for (const char of originalArguments) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    toolCalls.value[1]!.function.arguments += char
  }

  isReplaying.value = false
  state.value.toolCall.call_1!.status = 'success'
}

const handleStateChange = (payload: { key: string; value: unknown }) => {
  if (payload.key === 'toolCall') {
    state.value.toolCall = payload.value as typeof state.value.toolCall
  }
}
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="state.toolCall.call_0!.open" />
        展开第一个工具调用
      </label>
      <button @click="handleChangeToolCallStatus">切换状态</button>
      <button @click="handleChangeToolCallArguments">修改参数</button>
      <button @click="handleReplaySecondToolCall" :disabled="isReplaying">重放第二个工具调用</button>
    </div>

    <Bubble
      content="我来帮您同时计算这两个算式。"
      :tool_calls="toolCalls"
      :avatar="aiAvatar"
      :state="state"
      @state-change="handleStateChange"
    ></Bubble>
  </div>
</template>
`,Y=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="reasoningState.open" />
        展开推理过程
      </label>
      <button @click="replayThinking">重放推理</button>
    </div>

    <Bubble
      :content="content"
      :reasoning_content="reasoningContent"
      :avatar="aiAvatar"
      :state="reasoningState"
      @state-change="handleStateChange"
    ></Bubble>
  </div>
</template>

<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const rawContent = \`二进制中1+1的结果是10。\`

const rawReasoningContent = \`首先，用户的问题是：“二进制中1+1的结果是多少，请给出简要回答”。这是一个关于二进制加法的问题。

在二进制系统中，只有两个数字：0和1。当我们将1和1相加时，根据二进制加法规则，1 + 1等于10。这是因为在二进制中，1 + 1产生一个进位，所以结果为0，并进位1，因此写作10。

所以，二进制中1+1的结果是10。

用户要求简要回答，所以我应该直接给出答案，不需要过多解释。

最终回答：二进制中1+1的结果是10。\`

const content = ref(rawContent)
const reasoningContent = ref(rawReasoningContent)

const reasoningState = ref<Record<string, unknown>>({
  thinking: false,
  open: true,
})

const replayThinking = async () => {
  if (reasoningState.value.thinking) {
    return
  }
  reasoningState.value.thinking = true
  reasoningContent.value = ''
  content.value = ''

  for (const char of rawReasoningContent) {
    await new Promise((resolve) => setTimeout(resolve, 10))
    reasoningContent.value += char
  }

  reasoningState.value.thinking = false

  for (const char of rawContent) {
    await new Promise((resolve) => setTimeout(resolve, 10))
    content.value += char
  }
}

const handleStateChange = (payload: { key: string; value: unknown }) => {
  reasoningState.value[payload.key] = payload.value
}
<\/script>
`,X=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      通过 BubbleProvider 配置渲染器，包含 "🎯" 或 "VIP" 的消息会使用自定义渲染器（Box 透明且无 padding）。
    </p>
    <tr-bubble-provider :box-renderer-matches="boxRendererMatches" :content-renderer-matches="contentRendererMatches">
      <div style="display: flex; flex-direction: column; gap: 16px">
        <tr-bubble content="这是一条包含特殊标记的消息：🎯" :avatar="aiAvatar"></tr-bubble>
        <tr-bubble content="这是一条普通消息" :avatar="aiAvatar"></tr-bubble>
        <tr-bubble content="这是一条 VIP 消息" :avatar="aiAvatar"></tr-bubble>
      </div>
    </tr-bubble-provider>
  </div>
</template>

<script setup lang="ts">
import {
  BubbleBoxRendererMatch,
  BubbleBoxRendererProps,
  BubbleContentRendererMatch,
  BubbleContentRendererProps,
  BubbleRendererMatchPriority,
  TrBubble,
  TrBubbleProvider,
} from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineComponent, markRaw, h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

// 自定义 Box 渲染器：透明背景，无 padding
const TransparentBoxRenderer = defineComponent({
  props: {
    placement: String,
    shape: String,
  },
  setup(props: BubbleBoxRendererProps, { slots }) {
    return () =>
      h(
        'div',
        {
          class: 'transparent-box',
          style: {
            background: 'transparent',
            padding: '0',
            border: 'none',
            boxShadow: 'none',
          },
          'data-placement': props.placement,
          'data-shape': props.shape,
        },
        slots.default?.(),
      )
  },
})

// 自定义 Content 渲染器：渐变背景
const CustomContentRenderer = defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    return () =>
      h(
        'div',
        {
          style: {
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        [h('span', { style: { marginRight: '8px' } }, '✨'), h('span', {}, \`特殊消息：\${props.message.content}\`)],
      )
  },
})

// 检查消息是否为特殊消息
const isSpecialMessage = (message: { content?: unknown }): boolean => {
  return typeof message.content === 'string' && (message.content.includes('🎯') || message.content.includes('VIP'))
}

// 配置 Box 渲染器匹配规则
const boxRendererMatches: BubbleBoxRendererMatch[] = [
  {
    find: (messages) => messages.length > 0 && isSpecialMessage(messages[0]),
    renderer: markRaw(TransparentBoxRenderer),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
]

// 配置 Content 渲染器匹配规则
const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => isSpecialMessage(message),
    renderer: markRaw(CustomContentRenderer),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
]
<\/script>
`,O=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="autoScroll" />
        启用自动滚动
      </label>
      <button @click="addMessage">添加消息</button>
    </div>

    <div
      ref="containerRef"
      style="height: 300px; border: 1px solid #ddd; border-radius: 4px; overflow-y: auto; padding: 8px"
    >
      <tr-bubble-list
        :messages="messages"
        :role-configs="roles"
        :auto-scroll="autoScroll"
        style="max-height: 100%"
      ></tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const autoScroll = ref(true)

const messages = ref<BubbleListProps['messages']>([
  { role: 'user', content: '第一条消息' },
  { role: 'ai', content: 'AI 回复' },
])

const roles: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}

let messageCount = 2

const addMessage = () => {
  messageCount++
  const role = messageCount % 2 === 0 ? 'ai' : 'user'
  messages.value.push({ role, content: \`第 \${messageCount} 条消息\` })
}
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
`,Q=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const messages: BubbleListProps['messages'] = [
  { role: 'user', content: '用户消息 1' },
  { role: 'ai', content: 'AI 回复 1' },
  { role: 'user', content: '用户消息 2' },
  { role: 'ai', content: 'AI 回复 2' },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    hidden: true,
  },
}
<\/script>
`,H=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      满足「contentRenderMode 为 split 且组内只有 1 条消息」时，数组 content 的每一项会单独渲染为一个 box； 否则在同一
      box 内渲染。下例中第一个气泡满足该条件（单条消息 + 数组 content + split），故出现多个 box。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles" content-render-mode="split"></tr-bubble-list>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

// 第一个气泡：单条消息 + content 为数组，且 contentRenderMode="split" → 每项单独一个 box
// 第二、三个气泡：单条消息 + content 为字符串 → 各一个 box
const messages: BubbleListProps['messages'] = [
  {
    role: 'user',
    content: [
      { type: 'text', text: '数组第一项' },
      { type: 'text', text: '数组第二项' },
      { type: 'text', text: '数组第三项' },
    ],
  },
  {
    role: 'ai',
    content: '单条消息，字符串 content，一个 box',
  },
  {
    role: 'user',
    content: '单条消息，字符串 content，一个 box',
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
`,$=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      通过自定义分组函数控制 BubbleList 的展示逻辑：
      <br />
      - 「按时间间隔分组」：时间间隔超过 5 秒则开启新分组
      <br />
      - 「按对话轮次分组」：每一轮 user 提问及其后续 ai/system 回复视为一组
    </p>

    <div style="display: flex; gap: 8px; margin: 8px 0">
      <button
        type="button"
        style="padding: 4px 8px; font-size: 12px"
        :style="activeMode === 'time' ? activeButtonStyle : inactiveButtonStyle"
        @click="activeMode = 'time'"
      >
        按时间间隔分组
      </button>
      <button
        type="button"
        style="padding: 4px 8px; font-size: 12px"
        :style="activeMode === 'turn' ? activeButtonStyle : inactiveButtonStyle"
        @click="activeMode = 'turn'"
      >
        按对话轮次分组
      </button>
    </div>

    <tr-bubble-list :messages="messages" :role-configs="roles" :group-strategy="customGroupStrategy"></tr-bubble-list>
  </div>
</template>

<script setup lang="ts">
import {
  BubbleListProps,
  BubbleMessage,
  BubbleMessageGroup,
  BubbleRoleConfig,
  TrBubbleList,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

// 示例消息，包含时间戳，方便进行时间分组演示
type MessageWithTimestamp = BubbleListProps['messages'][0] & { timestamp?: number }

const messages: MessageWithTimestamp[] = [
  { role: 'user', content: '用户：第一次提问（t=0s）', timestamp: 0 },
  { role: 'ai', content: 'AI：第一次回答（t=1s，同一轮对话）', timestamp: 1000 },
  { role: 'system', content: 'System：提示信息（t=2s，同一轮对话）', timestamp: 2000 },
  { role: 'user', content: '用户：第二次提问（t=10s，新一轮对话）', timestamp: 10000 },
  { role: 'ai', content: 'AI：第二次回答（t=11s，同一轮对话）', timestamp: 11000 },
  { role: 'user', content: '用户：第三次提问（t=25s，新一轮对话）', timestamp: 25000 },
  { role: 'ai', content: 'AI：第三次回答（t=35s，时间间隔较大）', timestamp: 35000 },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    placement: 'start',
  },
}

// 当前分组模式：'time' | 'turn'
const activeMode = ref<'time' | 'turn'>('time')

// 按时间间隔分组：相邻消息时间差超过 5 秒则开启新分组
const groupByTime = (msgs: BubbleMessage[]): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  const TIME_THRESHOLD = 5000

  for (const [index, message] of msgs.entries()) {
    const msgWithTimestamp = message as MessageWithTimestamp
    const lastGroup = groups[groups.length - 1]

    if (
      !lastGroup ||
      !msgWithTimestamp.timestamp ||
      !(lastGroup.messages[lastGroup.messages.length - 1] as MessageWithTimestamp).timestamp ||
      msgWithTimestamp.timestamp -
        ((lastGroup.messages[lastGroup.messages.length - 1] as MessageWithTimestamp).timestamp || 0) >
        TIME_THRESHOLD
    ) {
      groups.push({
        role: message.role || 'assistant',
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
    } else {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    }
  }

  return groups
}

// 按对话轮次分组：
// - 以 user 消息作为一轮对话的开始
// - 将后续的 ai/system 消息归入同一组，直到下一条 user 出现
const groupByTurn = (msgs: BubbleMessage[]): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let currentGroup: BubbleMessageGroup | null = null

  msgs.forEach((message, index) => {
    const role = message.role || 'assistant'

    if (role === 'user') {
      // 遇到新的 user，开启新一轮对话
      currentGroup = {
        role,
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      }
      groups.push(currentGroup)
    } else if (currentGroup) {
      // 将 ai/system 等回复归入当前轮次
      currentGroup.messages.push(message)
      currentGroup.messageIndexes.push(index)
    } else {
      // 没有 user 作为起点时，单独成组兜底
      const fallbackGroup: BubbleMessageGroup = {
        role,
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      }
      groups.push(fallbackGroup)
      currentGroup = fallbackGroup
    }
  })

  return groups
}

// 统一对外暴露的分组函数，根据 activeMode 切换具体实现
const customGroupStrategy = (msgs: BubbleMessage[]): BubbleMessageGroup[] => {
  if (activeMode.value === 'turn') {
    return groupByTurn(msgs)
  }
  return groupByTime(msgs)
}

const activeButtonStyle: Record<string, string> = {
  backgroundColor: '#409eff',
  color: '#fff',
  border: '1px solid #409eff',
  borderRadius: '4px',
}

const inactiveButtonStyle: Record<string, string> = {
  backgroundColor: '#fff',
  color: '#666',
  border: '1px solid #ddd',
  borderRadius: '4px',
}
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
`,K=`<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div>
      <p><strong>consecutive 分组策略</strong></p>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px">连续相同角色的消息会被合并为一组</p>
      <tr-bubble-list :messages="messages" :role-configs="roles" group-strategy="consecutive"></tr-bubble-list>
    </div>

    <div>
      <p><strong>divider 分组策略（对比）</strong></p>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px">
        按分割角色分组（每条分割角色消息单独成组，其他消息在两个分割角色之间合并为一组）
      </p>
      <tr-bubble-list :messages="messages" :role-configs="roles" group-strategy="divider"></tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
// 系统消息使用简单的圆形作为头像
const systemAvatar = h(
  'div',
  {
    style: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: '#666',
    },
  },
  'S',
)

// consecutive：连续相同角色合并为一组；divider：每条分割角色单独成组，其他消息在两分割角色之间合并为一组
const messages: BubbleListProps['messages'] = [
  {
    role: 'user',
    content: '第一条用户消息',
  },
  {
    role: 'user',
    content: '第二条用户消息',
  },
  {
    role: 'ai',
    content: 'AI 回复第一条',
  },
  {
    role: 'ai',
    content: 'AI 回复第二条',
  },
  {
    role: 'system',
    content: '系统通知：这是一条系统消息',
  },
  {
    role: 'system',
    content: '系统通知：另一条系统消息',
  },
  {
    role: 'user',
    content: '第三条用户消息',
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    placement: 'start',
    avatar: systemAvatar,
  },
}
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
`,ee=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const messages: BubbleListProps['messages'] = [
  { role: 'user', content: '用户消息 1' },
  { role: 'ai', content: 'AI 回复 1' },
  { role: 'user', content: '用户消息 2' },
  { role: 'ai', content: 'AI 回复 2' },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
`,te=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">使用 Markdown 渲染器渲染运行时组件（WebComponent）</p>
    <tr-bubble-provider :store="bubbleStore">
      <tr-bubble
        :avatar="aiAvatar"
        :content="mdContent"
        :fallback-content-renderer="BubbleRenderers.Markdown"
      ></tr-bubble>
    </tr-bubble-provider>
  </div>
</template>

<script setup lang="ts">
import { BubbleRenderers, TrBubble, TrBubbleProvider } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineCustomElement, h, reactive, ref } from 'vue'
import SchemaCard from './schema-card.ce.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const bubbleStore = reactive({
  mdConfig: { html: true },
  dompurifyConfig: { ADD_TAGS: ['schema-card'], ADD_ATTR: ['schema'] },
})

const schemaObj = ref(
  JSON.stringify({
    componentName: 'Page',
    children: [
      { componentName: 'Text', props: { text: '运行时渲染器文本' } },
      { componentName: 'Button', props: { text: '运行时渲染器按钮' } },
    ],
  }),
)

// 注册自定义元素
if (!customElements.get('schema-card')) {
  const CardElement = defineCustomElement(SchemaCard)
  customElements.define('schema-card', CardElement)
}

const mdContent = \`# Markdown 标题

**加粗文本**

<schema-card schema='\${schemaObj.value}'></schema-card>
\`
<\/script>
`,se=`<template>
  <tr-bubble content="消息内容" :avatar="aiAvatar">
    <template #prefix>
      <div style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px">
        前缀插槽
      </div>
    </template>
    <template #suffix>
      <div style="background: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px; font-size: 12px">
        后缀插槽
      </div>
    </template>
    <template #content-footer>
      <div
        style="
          background: #e8f5e9;
          color: #388e3c;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
        "
      >
        内容底部插槽
      </div>
    </template>
    <template #after>
      <div
        style="
          background: #fff3e0;
          color: #f57c00;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
        "
      >
        后置插槽
      </div>
    </template>
  </tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
<\/script>
`,ne=`<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div>
      <p><strong>默认内容解析（使用 message.content）</strong></p>
      <tr-bubble :content="message.content" :avatar="aiAvatar"></tr-bubble>
    </div>

    <div>
      <p><strong>自定义内容解析（从 message.state 字段提取）</strong></p>
      <tr-bubble v-bind="message" :avatar="aiAvatar" :content-resolver="customResolver"></tr-bubble>
    </div>

    <div>
      <p><strong>自定义内容解析（组合多个字段）</strong></p>
      <tr-bubble v-bind="message" :avatar="aiAvatar" :content-resolver="combinedResolver"></tr-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import type { BubbleMessage, ChatMessageContent } from '@opentiny/tiny-robot'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

// 示例消息，将额外数据存储在 state 中
// state 用于存储 UI 相关的数据，不会影响消息内容
const message: BubbleMessage<ChatMessageContent, { text?: string; extra?: string }> = {
  role: 'ai',
  content: '这是默认的 content 字段',
  state: {
    text: '这是从 state.text 字段提取的内容',
    extra: '这是存储在 state.extra 中的自定义数据',
  },
}

// 自定义解析器：从 state.text 字段提取内容
const customResolver = (msg: BubbleMessage): ChatMessageContent | undefined => {
  return msg.state?.text as string | undefined
}

// 组合解析器：组合 content 和 state.extra
const combinedResolver = (msg: BubbleMessage): ChatMessageContent | undefined => {
  const content = (msg.content as string) || ''
  const extra = (msg.state?.extra as string) || ''
  return \`\${content}\\n\\n状态数据：\${extra}\`
}
<\/script>
`,ie=`<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px">
        <strong>single 模式（默认）</strong>：所有内容在一个 box 中渲染
      </p>
      <tr-bubble :content="arrayContent" :avatar="aiAvatar" content-render-mode="single"></tr-bubble>
    </div>

    <div>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px">
        <strong>split 模式</strong>：每个内容项单独一个 box
      </p>
      <tr-bubble :content="arrayContent" :avatar="aiAvatar" content-render-mode="split"></tr-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const arrayContent = [
  { type: 'text', text: '第一条内容' },
  { type: 'text', text: '第二条内容' },
  { type: 'text', text: '第三条内容' },
]
<\/script>
`,ae=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <p><strong>单张图片</strong></p>
      <tr-bubble
        :content="[{ type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=1' } }]"
        :avatar="aiAvatar"
      ></tr-bubble>
    </div>

    <div>
      <p><strong>多张图片</strong></p>
      <tr-bubble :content="multipleImages" :avatar="aiAvatar"></tr-bubble>
    </div>

    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
        <p style="margin: 0"><strong>图片与文本混合</strong></p>
        <label style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666">
          <input type="checkbox" v-model="useSplitMode" />
          split 模式
        </label>
      </div>
      <tr-bubble
        :content="mixedContent"
        :avatar="aiAvatar"
        :content-render-mode="useSplitMode ? 'split' : 'single'"
      ></tr-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const multipleImages = [
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=2' } },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=3' } },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=4' } },
]

const mixedContent = [
  { type: 'text', text: '这是一张示例图片：' },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=5' } },
  { type: 'text', text: '图片下方可以继续显示文本内容。' },
]

const useSplitMode = ref(false)
<\/script>
`,le=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <button @click="resetStreamContent">点击展示流式文本</button>
    <tr-bubble :content="streamContent" :avatar="aiAvatar" />
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const fullText = '这是一段流式输出的文本内容。'
const streamContent = ref('点击上方按钮开始流式输出文本')

const resetStreamContent = async () => {
  streamContent.value = ''
  for (const char of fullText) {
    streamContent.value += char
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
<\/script>
`,oe=`<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" :fallback-content-renderer="BubbleRenderers.Markdown"></tr-bubble>
</template>

<script setup lang="ts">
import { BubbleRenderers, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const mdContent = \`# 标题

**加粗文本** *斜体文本* ~~删除线~~

- 列表项 1
- 列表项 2
\`
<\/script>
`,de=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>
      <input type="checkbox" v-model="loading" />
      加载中
    </label>
    <tr-bubble content="这是一条消息内容" :avatar="aiAvatar" :loading="loading"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const loading = ref(true)
<\/script>
`,re=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="形状: rounded" placement="start" shape="rounded"></tr-bubble>
    <tr-bubble content="形状: corner" placement="start" shape="corner"></tr-bubble>
    <tr-bubble content="形状: none" placement="start" shape="none"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,pe=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble
      content="用户消息"
      :avatar="userAvatar"
      placement="end"
      style="--tr-bubble-box-bg: var(--tr-color-primary-light)"
    ></tr-bubble>
    <tr-bubble content="AI 回复消息" :avatar="aiAvatar" placement="start"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
<\/script>
`,he=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    style="--tr-bubble-box-bg: var(--tr-color-primary-light); --tr-bubble-text-font-size: 16px"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,ge=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),ce={name:"components/bubble.md"},ye=Object.assign(ce,{setup(ke){const E=g();u(async()=>{E.value=(await b(async()=>{const{default:a}=await import("./chunks/state-change.jB2PE7X4.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=g();u(async()=>{v.value=(await b(async()=>{const{default:a}=await import("./chunks/custom-renderer.1Bq--Eqj.js");return{default:a}},__vite__mapDeps([3,2,1]))).default});const C=g();u(async()=>{C.value=(await b(async()=>{const{default:a}=await import("./chunks/tools.8p7nqd2o.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const f=g();u(async()=>{f.value=(await b(async()=>{const{default:a}=await import("./chunks/reasoning.BpmlSQBT.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const m=g();u(async()=>{m.value=(await b(async()=>{const{default:a}=await import("./chunks/provider-renderer.D4BjeOGV.js");return{default:a}},__vite__mapDeps([6,2,1]))).default});const B=g();u(async()=>{B.value=(await b(async()=>{const{default:a}=await import("./chunks/list-auto-scroll.Cn8YHoVy.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const A=g();u(async()=>{A.value=(await b(async()=>{const{default:a}=await import("./chunks/list-hidden.4CBXa2bD.js");return{default:a}},__vite__mapDeps([8,2,1]))).default});const F=g();u(async()=>{F.value=(await b(async()=>{const{default:a}=await import("./chunks/list-array-content.lyUVfPCl.js");return{default:a}},__vite__mapDeps([9,2,1]))).default});const x=g();u(async()=>{x.value=(await b(async()=>{const{default:a}=await import("./chunks/list-custom-group.DPZkCNjW.js");return{default:a}},__vite__mapDeps([10,2,1]))).default});const D=g();u(async()=>{D.value=(await b(async()=>{const{default:a}=await import("./chunks/list-consecutive.VEZElHxx.js");return{default:a}},__vite__mapDeps([11,2,1]))).default});const _=g();u(async()=>{_.value=(await b(async()=>{const{default:a}=await import("./chunks/list.DevMsPx3.js");return{default:a}},__vite__mapDeps([12,2,1]))).default});const T=g();u(async()=>{T.value=(await b(async()=>{const{default:a}=await import("./chunks/schema-render.B-2aMRQJ.js");return{default:a}},__vite__mapDeps([13,1,2]))).default});const R=g();u(async()=>{R.value=(await b(async()=>{const{default:a}=await import("./chunks/slots.Bw8YJo5K.js");return{default:a}},__vite__mapDeps([14,2,1]))).default});const W=g();u(async()=>{W.value=(await b(async()=>{const{default:a}=await import("./chunks/content-resolver.nNucgQ-3.js");return{default:a}},__vite__mapDeps([15,2,1]))).default});const w=g();u(async()=>{w.value=(await b(async()=>{const{default:a}=await import("./chunks/content-render-mode.cKfKBa8X.js");return{default:a}},__vite__mapDeps([16,2,1]))).default});const I=g();u(async()=>{I.value=(await b(async()=>{const{default:a}=await import("./chunks/image.C5rI-Brh.js");return{default:a}},__vite__mapDeps([17,1,2]))).default});const S=g();u(async()=>{S.value=(await b(async()=>{const{default:a}=await import("./chunks/streaming.Dvyaqiic.js");return{default:a}},__vite__mapDeps([18,2,1]))).default});const Z=g();u(async()=>{Z.value=(await b(async()=>{const{default:a}=await import("./chunks/markdown.DE4YHVSv.js");return{default:a}},__vite__mapDeps([19,2,1]))).default});const G=g();u(async()=>{G.value=(await b(async()=>{const{default:a}=await import("./chunks/loading.DlB7X5Ym.js");return{default:a}},__vite__mapDeps([20,1,2]))).default});const M=g();u(async()=>{M.value=(await b(async()=>{const{default:a}=await import("./chunks/shape.BH1_hLhO.js");return{default:a}},__vite__mapDeps([21,2,1]))).default});const L=g();u(async()=>{L.value=(await b(async()=>{const{default:a}=await import("./chunks/avatar-and-placement.ChqKP63S.js");return{default:a}},__vite__mapDeps([22,2,1]))).default});const n=z(!0),P=g();return u(async()=>{P.value=(await b(async()=>{const{default:a}=await import("./chunks/basic.B5v1b2pq.js");return{default:a}},__vite__mapDeps([23,2,1]))).default}),(a,e)=>{const d=q("ClientOnly");return J(),V("div",null,[e[23]||(e[23]=y("",10)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:s(he)},h({_:2},[P.value?{name:"vue",fn:i(()=>[t(s(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[24]||(e[24]=l("h3",{id:"头像和位置",tabindex:"-1"},[o("头像和位置 "),l("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[25]||(e[25]=l("p",null,[o("通过 "),l("code",null,"avatar"),o(" 设置自定义头像，通过 "),l("code",null,"placement"),o(" 设置位置，提供了 "),l("code",null,"start"),o("、"),l("code",null,"end"),o(" 两个选项")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:s(pe)},h({_:2},[L.value?{name:"vue",fn:i(()=>[t(s(L))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=y("",3)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:s(re)},h({_:2},[M.value?{name:"vue",fn:i(()=>[t(s(M))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[27]||(e[27]=l("h3",{id:"加载中",tabindex:"-1"},[o("加载中 "),l("a",{class:"header-anchor",href:"#加载中","aria-label":'Permalink to "加载中"'},"​")],-1)),e[28]||(e[28]=l("p",null,[o("通过 "),l("code",null,"loading"),o(" 设置加载中状态")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{n.value=!1}),vueCode:s(de)},h({_:2},[G.value?{name:"vue",fn:i(()=>[t(s(G))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=y("",3)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{n.value=!1}),vueCode:s(oe)},h({_:2},[Z.value?{name:"vue",fn:i(()=>[t(s(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[30]||(e[30]=l("h3",{id:"流式文本",tabindex:"-1"},[o("流式文本 "),l("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[31]||(e[31]=l("p",null,[l("code",null,"content"),o(" 属性是响应式的，动态设置 "),l("code",null,"content"),o(" 即可实现流式文本")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{n.value=!1}),vueCode:s(le)},h({_:2},[S.value?{name:"vue",fn:i(()=>[t(s(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=y("",4)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{n.value=!1}),vueCode:s(ae)},h({_:2},[I.value?{name:"vue",fn:i(()=>[t(s(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[33]||(e[33]=y("",3)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{n.value=!1}),vueCode:s(ie)},h({_:2},[w.value?{name:"vue",fn:i(()=>[t(s(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=y("",3)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{n.value=!1}),vueCode:s(ne)},h({_:2},[W.value?{name:"vue",fn:i(()=>[t(s(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=y("",3)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{n.value=!1}),vueCode:s(se)},h({_:2},[R.value?{name:"vue",fn:i(()=>[t(s(R))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[36]||(e[36]=l("h3",{id:"schema-卡片渲染",tabindex:"-1"},[o("schema 卡片渲染 "),l("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22schema-render.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-render.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Cp%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23666%3B%20margin%3A%200%5C%22%3E%E4%BD%BF%E7%94%A8%20Markdown%20%E6%B8%B2%E6%9F%93%E5%99%A8%E6%B8%B2%E6%9F%93%E8%BF%90%E8%A1%8C%E6%97%B6%E7%BB%84%E4%BB%B6%EF%BC%88WebComponent%EF%BC%89%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-provider%20%3Astore%3D%5C%22bubbleStore%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%20%20%20%20%3Acontent%3D%5C%22mdContent%5C%22%5Cn%20%20%20%20%20%20%20%20%3Afallback-content-renderer%3D%5C%22BubbleRenderers.Markdown%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRenderers%2C%20TrBubble%2C%20TrBubbleProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineCustomElement%2C%20h%2C%20reactive%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20SchemaCard%20from%20'.%2Fschema-card.ce.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20bubbleStore%20%3D%20reactive(%7B%5Cn%20%20mdConfig%3A%20%7B%20html%3A%20true%20%7D%2C%5Cn%20%20dompurifyConfig%3A%20%7B%20ADD_TAGS%3A%20%5B'schema-card'%5D%2C%20ADD_ATTR%3A%20%5B'schema'%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20ref(%5Cn%20%20JSON.stringify(%7B%5Cn%20%20%20%20componentName%3A%20'Page'%2C%5Cn%20%20%20%20children%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Text'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%96%87%E6%9C%AC'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Button'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%8C%89%E9%92%AE'%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B3%A8%E5%86%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E5%85%83%E7%B4%A0%5Cnif%20(!customElements.get('schema-card'))%20%7B%5Cn%20%20const%20CardElement%20%3D%20defineCustomElement(SchemaCard)%5Cn%20%20customElements.define('schema-card'%2C%20CardElement)%5Cn%7D%5Cn%5Cnconst%20mdContent%20%3D%20%60%23%20Markdown%20%E6%A0%87%E9%A2%98%5Cn%5Cn**%E5%8A%A0%E7%B2%97%E6%96%87%E6%9C%AC**%5Cn%5Cn%3Cschema-card%20schema%3D'%24%7BschemaObj.value%7D'%3E%3C%2Fschema-card%3E%5Cn%60%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22schema-card.ce.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-card.ce.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cschema-renderer%20%3Aschema%3D%5C%22schemaObj%5C%22%3E%3C%2Fschema-renderer%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20SchemaRenderer%20from%20'%40opentiny%2Ftiny-schema-renderer'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cnconst%20props%20%3D%20defineProps(%7B%5Cn%20%20schema%3A%20%7B%5Cn%20%20%20%20type%3A%20String%2C%5Cn%20%20%20%20required%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20return%20JSON.parse(props.schema)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%3Cstyle%3E%5Cn%40import%20url('%40opentiny%2Fvue-theme%2Findex.css')%3B%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{n.value=!1}),vueCode:s(te)},h({_:2},[T.value?{name:"vue",fn:i(()=>[t(s(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[37]||(e[37]=l("h3",{id:"列表",tabindex:"-1"},[o("列表 "),l("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{n.value=!1}),vueCode:s(ee)},h({_:2},[_.value?{name:"vue",fn:i(()=>[t(s(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[38]||(e[38]=l("h3",{id:"分组策略",tabindex:"-1"},[o("分组策略 "),l("a",{class:"header-anchor",href:"#分组策略","aria-label":'Permalink to "分组策略"'},"​")],-1)),e[39]||(e[39]=l("p",null,[o("BubbleList 支持多种分组策略。分组时，连续的 "),l("code",null,"hidden"),o(" 消息会归为同一组。")],-1)),e[40]||(e[40]=l("p",null,[l("strong",null,"连续分组（consecutive）")],-1)),e[41]||(e[41]=l("p",null,"连续相同角色的消息会被合并为一组。",-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{n.value=!1}),vueCode:s(K)},h({_:2},[D.value?{name:"vue",fn:i(()=>[t(s(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[42]||(e[42]=l("p",null,[l("strong",null,"自定义分组函数")],-1)),e[43]||(e[43]=l("p",null,"可以通过自定义函数实现更灵活的分组逻辑。",-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{n.value=!1}),vueCode:s($)},h({_:2},[x.value?{name:"vue",fn:i(()=>[t(s(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[44]||(e[44]=y("",4)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{n.value=!1}),vueCode:s(H)},h({_:2},[F.value?{name:"vue",fn:i(()=>[t(s(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[45]||(e[45]=l("h3",{id:"隐藏角色",tabindex:"-1"},[o("隐藏角色 "),l("a",{class:"header-anchor",href:"#隐藏角色","aria-label":'Permalink to "隐藏角色"'},"​")],-1)),e[46]||(e[46]=l("p",null,[o("角色配置中使用 "),l("code",null,"hidden"),o(" 来隐藏这个角色的所有消息")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{n.value=!1}),vueCode:s(Q)},h({_:2},[A.value?{name:"vue",fn:i(()=>[t(s(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[47]||(e[47]=l("h3",{id:"自动滚动",tabindex:"-1"},[o("自动滚动 "),l("a",{class:"header-anchor",href:"#自动滚动","aria-label":'Permalink to "自动滚动"'},"​")],-1)),e[48]||(e[48]=l("p",null,[o("通过 "),l("code",null,"autoScroll"),o(" 属性启用自动滚动功能。当新消息添加时，如果滚动容器接近底部，会自动滚动到底部。")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[16]||(e[16]=()=>{n.value=!1}),vueCode:s(O)},h({_:2},[B.value?{name:"vue",fn:i(()=>[t(s(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[49]||(e[49]=y("",15)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[17]||(e[17]=()=>{n.value=!1}),vueCode:s(X)},h({_:2},[m.value?{name:"vue",fn:i(()=>[t(s(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[50]||(e[50]=y("",7)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[18]||(e[18]=()=>{n.value=!1}),vueCode:s(Y)},h({_:2},[f.value?{name:"vue",fn:i(()=>[t(s(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[19]||(e[19]=()=>{n.value=!1}),vueCode:s(N)},h({_:2},[C.value?{name:"vue",fn:i(()=>[t(s(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[51]||(e[51]=y("",12)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[20]||(e[20]=()=>{n.value=!1}),vueCode:s(X)},h({_:2},[m.value?{name:"vue",fn:i(()=>[t(s(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[52]||(e[52]=l("p",null,[l("strong",null,"方式二：通过 fallback 属性配置"),o("（用于单个组件）")],-1)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[21]||(e[21]=()=>{n.value=!1}),vueCode:s(j)},h({_:2},[v.value?{name:"vue",fn:i(()=>[t(s(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[53]||(e[53]=y("",5)),r(t(s(c),null,null,512),[[p,n.value]]),t(d,null,{default:i(()=>[t(s(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[22]||(e[22]=()=>{n.value=!1}),vueCode:s(U)},h({_:2},[E.value?{name:"vue",fn:i(()=>[t(s(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[54]||(e[54]=y("",61))])}}});export{ge as __pageData,ye as default};
