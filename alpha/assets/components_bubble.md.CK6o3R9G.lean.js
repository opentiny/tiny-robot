const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/state-change.3OS3QYwD.js","assets/chunks/theme.B_Q0j8t6.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/custom-renderer.DAQD_9I9.js","assets/chunks/custom-composite-renderer.IGeAnae2.js","assets/chunks/tools.B51rVlk6.js","assets/chunks/reasoning.DSFwIFk8.js","assets/chunks/provider-attributes.B9iunXRU.js","assets/chunks/provider-renderer.D2FhYj0Z.js","assets/chunks/list-auto-scroll.Dh7GehpX.js","assets/chunks/list-hidden.CDZvSHZi.js","assets/chunks/list-array-content.C94mPcvW.js","assets/chunks/list-custom-group.9495-Nkv.js","assets/chunks/list-consecutive.BYP8vzYW.js","assets/chunks/list.Cb_8R5zU.js","assets/chunks/schema-render.CWHoUimS.js","assets/chunks/slots.DcO59KJd.js","assets/chunks/content-resolver.DxTV0yHa.js","assets/chunks/content-render-mode.BpkCJVSw.js","assets/chunks/image.Dc0jkegl.js","assets/chunks/streaming.CdUdPK8D.js","assets/chunks/markdown.DNkr_TYf.js","assets/chunks/loading.C9S-fY2U.js","assets/chunks/shape.C7uvMfB5.js","assets/chunks/avatar-and-placement.Bwwfsr1S.js","assets/chunks/basic.B79I5trS.js"])))=>i.map(i=>d[i]);
import{aD as u,bQ as b,aZ as z,aL as V,v as U,H as y,bL as r,bB as d,J as t,bk as n,bJ as a,G as p,w as l,I as k,b7 as g,aU as j}from"./chunks/framework.CUa_Cx66.js";import{L as c,N as h}from"./chunks/index.C4PESc4f.js";const O=`<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches">
    <div style="display: flex; flex-direction: column; gap: 16px">
      <tr-bubble
        :content="messageContent"
        :avatar="aiAvatar"
        :state="messageState"
        @bubble-event="handleBubbleEvent"
        @state-change="handleStateChange"
      ></tr-bubble>

      <div style="font-size: 12px; color: #666">
        <div style="display: flex; align-items: center; gap: 8px">
          <span>外部收到的事件：</span>
          <button type="button" style="padding: 2px 8px; font-size: 12px" @click="resetEventLogs">重置日志</button>
        </div>
        <pre style="margin: 8px 0 0; padding: 8px; background: #f5f5f5; border-radius: 6px">{{ bubbleEventLog }}</pre>
        <pre style="margin: 8px 0 0; padding: 8px; background: #f5f5f5; border-radius: 6px">{{ stateChangeLog }}</pre>
      </div>
    </div>
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import {
  BubbleRendererMatchPriority,
  type BubbleEvent,
  type BubbleContentRendererMatch,
  type BubbleContentRendererProps,
  TrBubble,
  TrBubbleProvider,
  useBubbleEventFn,
  useBubbleStateChangeFn,
  useMessageContent,
} from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { computed, defineComponent, h, markRaw, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const messageContent = [{ type: 'state-demo', text: '这条消息的状态由自定义 renderer 修改。' }]
const messageState = ref<Record<string, unknown>>({
  expanded: false,
  liked: false,
})
const bubbleEventLog = ref('bubble-event 尚未触发')
const stateChangeLog = ref('state-change 尚未触发')

const StateDemoRenderer = defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    const { content } = useMessageContent(props)
    const emitBubbleEvent = useBubbleEventFn()
    const handleStateChange = useBubbleStateChangeFn()

    const expanded = computed(() => Boolean(props.message.state?.expanded))
    const liked = computed(() => Boolean(props.message.state?.liked))

    const toggleExpanded = () => {
      handleStateChange('expanded', !expanded.value)
    }

    const toggleLiked = () => {
      handleStateChange('liked', !liked.value)
    }

    const sendCustomEvent = () => {
      emitBubbleEvent({
        name: 'demo:apply-to-input',
        payload: {
          text: content.value?.text || '',
        },
      })
    }

    const button = (text: string, onClick: () => void) => h('button', { type: 'button', onClick }, text)

    return () => {
      const detailText = liked.value ? '详情已展开，当前已点赞。' : '详情已展开，当前未点赞。'

      return h('div', { style: 'display: flex; flex-direction: column; gap: 8px' }, [
        h('div', content.value?.text || ''),
        h('div', { style: 'display: flex; gap: 8px' }, [
          button(expanded.value ? '收起详情' : '展开详情', toggleExpanded),
          button(liked.value ? '取消点赞' : '点赞', toggleLiked),
          button('发送普通事件', sendCustomEvent),
        ]),
        expanded.value
          ? h(
              'div',
              { style: 'padding: 8px; background: #f5f5f5; border-radius: 6px; color: #666; font-size: 12px' },
              detailText,
            )
          : null,
      ])
    }
  },
})

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (_message, content) => content.type === 'state-demo',
    renderer: markRaw(StateDemoRenderer),
    priority: BubbleRendererMatchPriority.CONTENT,
  },
]

const handleStateChange = (payload: { key: string; value: unknown; contentIndex: number }) => {
  messageState.value[payload.key] = payload.value
  stateChangeLog.value = \`state-change\\n\${JSON.stringify(payload, null, 2)}\`
}

const handleBubbleEvent = (payload: BubbleEvent & { messageIndex: number; contentIndex: number }) => {
  bubbleEventLog.value = \`bubble-event\\n\${JSON.stringify(payload, null, 2)}\`
}

const resetEventLogs = () => {
  bubbleEventLog.value = 'bubble-event 尚未触发'
  stateChangeLog.value = 'state-change 尚未触发'
}
<\/script>
`,N=`<template>
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
`,Y=`<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches" :content-attributes="contentAttributes">
    <tr-bubble
      content="最终答案：1 + 1 在二进制中等于 10。"
      reasoning_content="先按十进制理解 1 + 1 = 2，再把 2 转成二进制，结果是 10。"
      :avatar="aiAvatar"
    ></tr-bubble>
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import {
  BubbleRendererMatchPriority,
  type BubbleContentAttributesConfig,
  type BubbleContentRendererMatch,
  TrBubble,
  TrBubbleProvider,
} from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, markRaw } from 'vue'
import RecursiveReasoningRenderer from './RecursiveReasoningRenderer.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => typeof message.reasoning_content === 'string',
    renderer: markRaw(RecursiveReasoningRenderer),
    priority: BubbleRendererMatchPriority.NORMAL - 1,
    attributes: { 'data-renderer': 'custom-recursive-reasoning' },
  },
]

const contentAttributes: BubbleContentAttributesConfig = (message, content, contentIndex) => {
  const isReasoning = typeof message.reasoning_content === 'string' && message.reasoning_content

  return {
    'data-demo-kind': isReasoning ? 'reasoning' : 'content',
    'data-role': message.role || 'assistant',
    'data-content-type': content.type,
    'data-content-index': contentIndex,
  }
}
<\/script>
`,Q=`<script setup lang="ts">
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
`,H=`<template>
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
`,$=`<template>
  <div class="demo">
    <p class="desc">
      外层气泡容器是 Box，里面的每一段内容是 Content。点击下方任意 Box 或 Content，可查看该 DOM 节点上的真实 data-*
      属性。
    </p>

    <div class="preview" @click="handleInspect">
      <tr-bubble-provider :box-attributes="boxAttributes" :content-attributes="contentAttributes">
        <tr-bubble-list :messages="messages" :role-configs="roleConfigs" content-render-mode="split"></tr-bubble-list>
      </tr-bubble-provider>
    </div>

    <pre class="output">{{ output }}</pre>
  </div>
</template>

<script setup lang="ts">
import type {
  BubbleBoxAttributesConfig,
  BubbleContentAttributesConfig,
  BubbleMessage,
  BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { TrBubbleList, TrBubbleProvider } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const messages: BubbleMessage[] = [
  { role: 'user', content: '请总结今天会议。' },
  {
    role: 'assistant',
    content: [
      { type: 'text', text: '重点一：支持 BubbleProvider 统一注入 attributes。' },
      { type: 'text', text: '重点二：支持按消息上下文动态生成 attributes。' },
    ],
  },
]

const roleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: {
    avatar: h(IconAi, { style: { fontSize: '28px' } }),
  },
  user: {
    avatar: h(IconUser, { style: { fontSize: '28px' } }),
    placement: 'end',
  },
}

const boxAttributes: BubbleBoxAttributesConfig = (messages, content, contentIndex) => ({
  'data-demo-kind': 'box',
  'data-role': messages[0]?.role || 'unknown',
  'data-message-count': messages.length,
  'data-content-type': content?.type || 'unknown',
  'data-content-index': contentIndex ?? 'unknown',
})

const contentAttributes: BubbleContentAttributesConfig = (message, content, contentIndex) => ({
  'data-demo-kind': 'content',
  'data-role': message.role || 'unknown',
  'data-content-type': content.type,
  'data-content-index': contentIndex,
})

const output = ref('点击预览区域中的节点后，这里会显示该节点上的 data-* 属性。')

const handleInspect = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  const element = target?.closest('[data-demo-kind]') as HTMLElement | null

  if (!element) {
    return
  }

  const dataAttributes = Object.fromEntries(
    element
      .getAttributeNames()
      .filter((name) => name.startsWith('data-') && !name.startsWith('data-v-'))
      .map((name) => [name, element.getAttribute(name)]),
  )

  output.value = JSON.stringify(dataAttributes, null, 2)
}
<\/script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desc {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.preview {
  padding: 12px;
  border: 1px solid var(--vp-c-divider, #ddd);
  background: var(--vp-c-bg-soft, #f6f6f7);
}

.preview :deep([data-demo-kind]) {
  cursor: pointer;
}

.preview :deep([data-demo-kind='box']) {
  outline: 1px dashed #f59e0b;
}

.preview :deep([data-demo-kind='content']) {
  outline: 1px solid #60a5fa;
}

.output {
  margin: 0;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg-soft, #f5f5f5);
  border: 1px solid var(--vp-c-divider, #ddd);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
`,J=`<template>
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
`,K=`<template>
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
    hidden: true,
  },
}
<\/script>
`,te=`<template>
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
`,ne=`<template>
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
`,se=`<template>
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
`,ae=`<template>
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
`,ie=`<template>
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
`,le=`<template>
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
`,oe=`<template>
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
`,re=`<template>
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
`,de=`<template>
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
`,pe=`<template>
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
`,ce=`<template>
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
`,he=`<template>
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
`,ue=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="形状: rounded" placement="start" shape="rounded"></tr-bubble>
    <tr-bubble content="形状: corner" placement="start" shape="corner"></tr-bubble>
    <tr-bubble content="形状: none" placement="start" shape="none"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,be=`<template>
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
`,ke=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    style="--tr-bubble-box-bg: var(--tr-color-primary-light); --tr-bubble-text-font-size: 16px"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,Ee=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),ge={name:"components/bubble.md"},Ce=Object.assign(ge,{setup(ye){const v=g();u(async()=>{v.value=(await b(async()=>{const{default:i}=await import("./chunks/state-change.3OS3QYwD.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const E=g();u(async()=>{E.value=(await b(async()=>{const{default:i}=await import("./chunks/custom-renderer.DAQD_9I9.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const C=g();u(async()=>{C.value=(await b(async()=>{const{default:i}=await import("./chunks/custom-composite-renderer.IGeAnae2.js");return{default:i}},__vite__mapDeps([4,1,2]))).default});const B=g();u(async()=>{B.value=(await b(async()=>{const{default:i}=await import("./chunks/tools.B51rVlk6.js");return{default:i}},__vite__mapDeps([5,2,1]))).default});const f=g();u(async()=>{f.value=(await b(async()=>{const{default:i}=await import("./chunks/reasoning.DSFwIFk8.js");return{default:i}},__vite__mapDeps([6,2,1]))).default});const A=g();u(async()=>{A.value=(await b(async()=>{const{default:i}=await import("./chunks/provider-attributes.B9iunXRU.js");return{default:i}},__vite__mapDeps([7,1,2]))).default});const m=g();u(async()=>{m.value=(await b(async()=>{const{default:i}=await import("./chunks/provider-renderer.D2FhYj0Z.js");return{default:i}},__vite__mapDeps([8,1,2]))).default});const F=g();u(async()=>{F.value=(await b(async()=>{const{default:i}=await import("./chunks/list-auto-scroll.Dh7GehpX.js");return{default:i}},__vite__mapDeps([9,2,1]))).default});const x=g();u(async()=>{x.value=(await b(async()=>{const{default:i}=await import("./chunks/list-hidden.CDZvSHZi.js");return{default:i}},__vite__mapDeps([10,1,2]))).default});const D=g();u(async()=>{D.value=(await b(async()=>{const{default:i}=await import("./chunks/list-array-content.C94mPcvW.js");return{default:i}},__vite__mapDeps([11,1,2]))).default});const _=g();u(async()=>{_.value=(await b(async()=>{const{default:i}=await import("./chunks/list-custom-group.9495-Nkv.js");return{default:i}},__vite__mapDeps([12,1,2]))).default});const R=g();u(async()=>{R.value=(await b(async()=>{const{default:i}=await import("./chunks/list-consecutive.BYP8vzYW.js");return{default:i}},__vite__mapDeps([13,1,2]))).default});const T=g();u(async()=>{T.value=(await b(async()=>{const{default:i}=await import("./chunks/list.Cb_8R5zU.js");return{default:i}},__vite__mapDeps([14,1,2]))).default});const W=g();u(async()=>{W.value=(await b(async()=>{const{default:i}=await import("./chunks/schema-render.CWHoUimS.js");return{default:i}},__vite__mapDeps([15,2,1]))).default});const w=g();u(async()=>{w.value=(await b(async()=>{const{default:i}=await import("./chunks/slots.DcO59KJd.js");return{default:i}},__vite__mapDeps([16,1,2]))).default});const I=g();u(async()=>{I.value=(await b(async()=>{const{default:i}=await import("./chunks/content-resolver.DxTV0yHa.js");return{default:i}},__vite__mapDeps([17,1,2]))).default});const S=g();u(async()=>{S.value=(await b(async()=>{const{default:i}=await import("./chunks/content-render-mode.BpkCJVSw.js");return{default:i}},__vite__mapDeps([18,1,2]))).default});const Z=g();u(async()=>{Z.value=(await b(async()=>{const{default:i}=await import("./chunks/image.Dc0jkegl.js");return{default:i}},__vite__mapDeps([19,2,1]))).default});const G=g();u(async()=>{G.value=(await b(async()=>{const{default:i}=await import("./chunks/streaming.CdUdPK8D.js");return{default:i}},__vite__mapDeps([20,1,2]))).default});const M=g();u(async()=>{M.value=(await b(async()=>{const{default:i}=await import("./chunks/markdown.DNkr_TYf.js");return{default:i}},__vite__mapDeps([21,1,2]))).default});const P=g();u(async()=>{P.value=(await b(async()=>{const{default:i}=await import("./chunks/loading.C9S-fY2U.js");return{default:i}},__vite__mapDeps([22,2,1]))).default});const L=g();u(async()=>{L.value=(await b(async()=>{const{default:i}=await import("./chunks/shape.C7uvMfB5.js");return{default:i}},__vite__mapDeps([23,1,2]))).default});const X=g();u(async()=>{X.value=(await b(async()=>{const{default:i}=await import("./chunks/avatar-and-placement.Bwwfsr1S.js");return{default:i}},__vite__mapDeps([24,1,2]))).default});const s=j(!0),q=g();return u(async()=>{q.value=(await b(async()=>{const{default:i}=await import("./chunks/basic.B79I5trS.js");return{default:i}},__vite__mapDeps([25,1,2]))).default}),(i,e)=>{const o=z("ClientOnly");return V(),U("div",null,[e[25]||(e[25]=y("",10)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{s.value=!1}),vueCode:n(ke)},p({_:2},[q.value?{name:"vue",fn:a(()=>[t(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=l("h3",{id:"头像和位置",tabindex:"-1"},[k("头像和位置 "),l("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[27]||(e[27]=l("p",null,[k("通过 "),l("code",null,"avatar"),k(" 设置自定义头像，通过 "),l("code",null,"placement"),k(" 设置位置，提供了 "),l("code",null,"start"),k("、"),l("code",null,"end"),k(" 两个选项")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{s.value=!1}),vueCode:n(be)},p({_:2},[X.value?{name:"vue",fn:a(()=>[t(n(X))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=y("",3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{s.value=!1}),vueCode:n(ue)},p({_:2},[L.value?{name:"vue",fn:a(()=>[t(n(L))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=l("h3",{id:"加载中",tabindex:"-1"},[k("加载中 "),l("a",{class:"header-anchor",href:"#加载中","aria-label":'Permalink to "加载中"'},"​")],-1)),e[30]||(e[30]=l("p",null,[k("通过 "),l("code",null,"loading"),k(" 设置加载中状态")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{s.value=!1}),vueCode:n(he)},p({_:2},[P.value?{name:"vue",fn:a(()=>[t(n(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=y("",4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{s.value=!1}),vueCode:n(ce)},p({_:2},[M.value?{name:"vue",fn:a(()=>[t(n(M))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=l("h3",{id:"流式文本",tabindex:"-1"},[k("流式文本 "),l("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[33]||(e[33]=l("p",null,[l("code",null,"content"),k(" 属性是响应式的，动态设置 "),l("code",null,"content"),k(" 即可实现流式文本")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{s.value=!1}),vueCode:n(pe)},p({_:2},[G.value?{name:"vue",fn:a(()=>[t(n(G))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=y("",4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{s.value=!1}),vueCode:n(de)},p({_:2},[Z.value?{name:"vue",fn:a(()=>[t(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=y("",3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{s.value=!1}),vueCode:n(re)},p({_:2},[S.value?{name:"vue",fn:a(()=>[t(n(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[36]||(e[36]=y("",3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{s.value=!1}),vueCode:n(oe)},p({_:2},[I.value?{name:"vue",fn:a(()=>[t(n(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[37]||(e[37]=y("",3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{s.value=!1}),vueCode:n(le)},p({_:2},[w.value?{name:"vue",fn:a(()=>[t(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[38]||(e[38]=l("h3",{id:"schema-卡片渲染",tabindex:"-1"},[k("schema 卡片渲染 "),l("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22schema-render.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-render.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Cp%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23666%3B%20margin%3A%200%5C%22%3E%E4%BD%BF%E7%94%A8%20Markdown%20%E6%B8%B2%E6%9F%93%E5%99%A8%E6%B8%B2%E6%9F%93%E8%BF%90%E8%A1%8C%E6%97%B6%E7%BB%84%E4%BB%B6%EF%BC%88WebComponent%EF%BC%89%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-provider%20%3Astore%3D%5C%22bubbleStore%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%20%20%20%20%3Acontent%3D%5C%22mdContent%5C%22%5Cn%20%20%20%20%20%20%20%20%3Afallback-content-renderer%3D%5C%22BubbleRenderers.Markdown%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRenderers%2C%20TrBubble%2C%20TrBubbleProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineCustomElement%2C%20h%2C%20reactive%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20SchemaCard%20from%20'.%2Fschema-card.ce.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20bubbleStore%20%3D%20reactive(%7B%5Cn%20%20mdConfig%3A%20%7B%20html%3A%20true%20%7D%2C%5Cn%20%20dompurifyConfig%3A%20%7B%20ADD_TAGS%3A%20%5B'schema-card'%5D%2C%20ADD_ATTR%3A%20%5B'schema'%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20ref(%5Cn%20%20JSON.stringify(%7B%5Cn%20%20%20%20componentName%3A%20'Page'%2C%5Cn%20%20%20%20children%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Text'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%96%87%E6%9C%AC'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Button'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%8C%89%E9%92%AE'%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B3%A8%E5%86%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E5%85%83%E7%B4%A0%5Cnif%20(!customElements.get('schema-card'))%20%7B%5Cn%20%20const%20CardElement%20%3D%20defineCustomElement(SchemaCard)%5Cn%20%20customElements.define('schema-card'%2C%20CardElement)%5Cn%7D%5Cn%5Cnconst%20mdContent%20%3D%20%60%23%20Markdown%20%E6%A0%87%E9%A2%98%5Cn%5Cn**%E5%8A%A0%E7%B2%97%E6%96%87%E6%9C%AC**%5Cn%5Cn%3Cschema-card%20schema%3D'%24%7BschemaObj.value%7D'%3E%3C%2Fschema-card%3E%5Cn%60%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22schema-card.ce.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-card.ce.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cschema-renderer%20%3Aschema%3D%5C%22schemaObj%5C%22%3E%3C%2Fschema-renderer%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20SchemaRenderer%20from%20'%40opentiny%2Ftiny-schema-renderer'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cnconst%20props%20%3D%20defineProps(%7B%5Cn%20%20schema%3A%20%7B%5Cn%20%20%20%20type%3A%20String%2C%5Cn%20%20%20%20required%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20return%20JSON.parse(props.schema)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%3Cstyle%3E%5Cn%40import%20url('%40opentiny%2Fvue-theme%2Findex.css')%3B%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{s.value=!1}),vueCode:n(ie)},p({_:2},[W.value?{name:"vue",fn:a(()=>[t(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[39]||(e[39]=l("h3",{id:"列表",tabindex:"-1"},[k("列表 "),l("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{s.value=!1}),vueCode:n(ae)},p({_:2},[T.value?{name:"vue",fn:a(()=>[t(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[40]||(e[40]=l("h3",{id:"分组策略",tabindex:"-1"},[k("分组策略 "),l("a",{class:"header-anchor",href:"#分组策略","aria-label":'Permalink to "分组策略"'},"​")],-1)),e[41]||(e[41]=l("p",null,[k("BubbleList 支持多种分组策略。分组时，连续的 "),l("code",null,"hidden"),k(" 消息会归为同一组。")],-1)),e[42]||(e[42]=l("p",null,[l("strong",null,"连续分组（consecutive）")],-1)),e[43]||(e[43]=l("p",null,"连续相同角色的消息会被合并为一组。",-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{s.value=!1}),vueCode:n(se)},p({_:2},[R.value?{name:"vue",fn:a(()=>[t(n(R))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[44]||(e[44]=l("p",null,[l("strong",null,"自定义分组函数")],-1)),e[45]||(e[45]=l("p",null,"可以通过自定义函数实现更灵活的分组逻辑。",-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{s.value=!1}),vueCode:n(ne)},p({_:2},[_.value?{name:"vue",fn:a(()=>[t(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[46]||(e[46]=y("",4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{s.value=!1}),vueCode:n(te)},p({_:2},[D.value?{name:"vue",fn:a(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[47]||(e[47]=l("h3",{id:"隐藏角色",tabindex:"-1"},[k("隐藏角色 "),l("a",{class:"header-anchor",href:"#隐藏角色","aria-label":'Permalink to "隐藏角色"'},"​")],-1)),e[48]||(e[48]=l("p",null,[k("角色配置中使用 "),l("code",null,"hidden"),k(" 来隐藏这个角色的所有消息")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{s.value=!1}),vueCode:n(ee)},p({_:2},[x.value?{name:"vue",fn:a(()=>[t(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[49]||(e[49]=l("h3",{id:"自动滚动",tabindex:"-1"},[k("自动滚动 "),l("a",{class:"header-anchor",href:"#自动滚动","aria-label":'Permalink to "自动滚动"'},"​")],-1)),e[50]||(e[50]=l("p",null,[k("通过 "),l("code",null,"autoScroll"),k(" 属性启用自动滚动功能。当新消息添加时，如果滚动容器接近底部，会自动滚动到底部。")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[16]||(e[16]=()=>{s.value=!1}),vueCode:n(K)},p({_:2},[F.value?{name:"vue",fn:a(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[51]||(e[51]=y("",15)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[17]||(e[17]=()=>{s.value=!1}),vueCode:n(J)},p({_:2},[m.value?{name:"vue",fn:a(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[52]||(e[52]=y("",4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[18]||(e[18]=()=>{s.value=!1}),vueCode:n($)},p({_:2},[A.value?{name:"vue",fn:a(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[53]||(e[53]=y("",8)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[19]||(e[19]=()=>{s.value=!1}),vueCode:n(H)},p({_:2},[f.value?{name:"vue",fn:a(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[20]||(e[20]=()=>{s.value=!1}),vueCode:n(Q)},p({_:2},[B.value?{name:"vue",fn:a(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[54]||(e[54]=y("",7)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22custom-composite-renderer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fcustom-composite-renderer.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-provider%20%3Acontent-renderer-matches%3D%5C%22contentRendererMatches%5C%22%20%3Acontent-attributes%3D%5C%22contentAttributes%5C%22%3E%5Cn%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20content%3D%5C%22%E6%9C%80%E7%BB%88%E7%AD%94%E6%A1%88%EF%BC%9A1%20%2B%201%20%E5%9C%A8%E4%BA%8C%E8%BF%9B%E5%88%B6%E4%B8%AD%E7%AD%89%E4%BA%8E%2010%E3%80%82%5C%22%5Cn%20%20%20%20%20%20reasoning_content%3D%5C%22%E5%85%88%E6%8C%89%E5%8D%81%E8%BF%9B%E5%88%B6%E7%90%86%E8%A7%A3%201%20%2B%201%20%3D%202%EF%BC%8C%E5%86%8D%E6%8A%8A%202%20%E8%BD%AC%E6%88%90%E4%BA%8C%E8%BF%9B%E5%88%B6%EF%BC%8C%E7%BB%93%E6%9E%9C%E6%98%AF%2010%E3%80%82%5C%22%5Cn%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3C%2Ftr-bubble-provider%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%5Cn%20%20BubbleRendererMatchPriority%2C%5Cn%20%20type%20BubbleContentAttributesConfig%2C%5Cn%20%20type%20BubbleContentRendererMatch%2C%5Cn%20%20TrBubble%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20markRaw%20%7D%20from%20'vue'%5Cnimport%20RecursiveReasoningRenderer%20from%20'.%2FRecursiveReasoningRenderer.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20contentRendererMatches%3A%20BubbleContentRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(message)%20%3D%3E%20typeof%20message.reasoning_content%20%3D%3D%3D%20'string'%2C%5Cn%20%20%20%20renderer%3A%20markRaw(RecursiveReasoningRenderer)%2C%5Cn%20%20%20%20priority%3A%20BubbleRendererMatchPriority.NORMAL%20-%201%2C%5Cn%20%20%20%20attributes%3A%20%7B%20'data-renderer'%3A%20'custom-recursive-reasoning'%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20contentAttributes%3A%20BubbleContentAttributesConfig%20%3D%20(message%2C%20content%2C%20contentIndex)%20%3D%3E%20%7B%5Cn%20%20const%20isReasoning%20%3D%20typeof%20message.reasoning_content%20%3D%3D%3D%20'string'%20%26%26%20message.reasoning_content%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20'data-demo-kind'%3A%20isReasoning%20%3F%20'reasoning'%20%3A%20'content'%2C%5Cn%20%20%20%20'data-role'%3A%20message.role%20%7C%7C%20'assistant'%2C%5Cn%20%20%20%20'data-content-type'%3A%20content.type%2C%5Cn%20%20%20%20'data-content-index'%3A%20contentIndex%2C%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22RecursiveReasoningRenderer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2FRecursiveReasoningRenderer.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20type%20BubbleContentRendererProps%2C%20useBubbleContentRenderer%2C%20useOmitMessageFields%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5CndefineOptions(%7B%5Cn%20%20inheritAttrs%3A%20false%2C%5Cn%7D)%5Cn%5Cnconst%20props%20%3D%20defineProps%3CBubbleContentRendererProps%3E()%5Cn%5Cnconst%20%7B%20restMessage%2C%20restProps%20%7D%20%3D%20useOmitMessageFields(props%2C%20%5B'reasoning_content'%5D)%5Cnconst%20renderer%20%3D%20useBubbleContentRenderer(restMessage%2C%20props.contentIndex)%5Cn%5Cnconst%20recursiveProps%20%3D%20computed(()%20%3D%3E%20(%7B%5Cn%20%20...renderer.value.attributes%2C%5Cn%20%20...restProps.value%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22custom-reasoning%5C%22%20data-type%3D%5C%22custom-reasoning%5C%22%20v-bind%3D%5C%22%24attrs%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22custom-reasoning__title%5C%22%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8E%A8%E7%90%86%E8%BF%87%E7%A8%8B%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22custom-reasoning__content%5C%22%3E%7B%7B%20props.message.reasoning_content%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%20%20%3Ccomponent%20%3Ais%3D%5C%22renderer.renderer%5C%22%20v-bind%3D%5C%22recursiveProps%5C%22%20%2F%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.custom-reasoning%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20padding-left%3A%2010px%3B%5Cn%20%20border-left%3A%202px%20solid%20%238b5cf6%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%7D%5Cn%5Cn.custom-reasoning__title%20%7B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%7D%5Cn%5Cn.custom-reasoning__content%20%7B%5Cn%20%20margin%3A%204px%200%200%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%20%20white-space%3A%20pre-wrap%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[21]||(e[21]=()=>{s.value=!1}),vueCode:n(Y)},p({_:2},[C.value?{name:"vue",fn:a(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[55]||(e[55]=y("",6)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[22]||(e[22]=()=>{s.value=!1}),vueCode:n(J)},p({_:2},[m.value?{name:"vue",fn:a(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[56]||(e[56]=l("p",null,[l("strong",null,"方式二：通过 fallback 属性配置"),k("（用于单个组件）")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[23]||(e[23]=()=>{s.value=!1}),vueCode:n(N)},p({_:2},[E.value?{name:"vue",fn:a(()=>[t(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[57]||(e[57]=y("",13)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[24]||(e[24]=()=>{s.value=!1}),vueCode:n(O)},p({_:2},[v.value?{name:"vue",fn:a(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[58]||(e[58]=y("",61))])}}});export{Ee as __pageData,Ce as default};
