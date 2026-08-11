const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/state-change.lwdj56f0.js","assets/chunks/theme.7L8HYfI8.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/custom-renderer.CwPolTPf.js","assets/chunks/custom-composite-renderer.Bb6mx2nr.js","assets/chunks/tools.BsVQ5dXl.js","assets/chunks/reasoning.DxT9nsCD.js","assets/chunks/provider-attributes.4R-bSatO.js","assets/chunks/provider-renderer.BQ87ODQz.js","assets/chunks/list-auto-scroll.DT1WBEd-.js","assets/chunks/list-hidden.u-5Fzey2.js","assets/chunks/list-array-content.CxRA7_Yc.js","assets/chunks/list-custom-group.CxF54EMq.js","assets/chunks/list-consecutive.D5wply9-.js","assets/chunks/list.C-TSxd45.js","assets/chunks/schema-render.BX8B7tZa.js","assets/chunks/slots.BSnzA3_g.js","assets/chunks/content-resolver.DKBhWaZC.js","assets/chunks/content-render-mode.CP7HgJxc.js","assets/chunks/image.XCDTzn-o.js","assets/chunks/streaming.2E3OgKFi.js","assets/chunks/markdown.CQVXIwwG.js","assets/chunks/loading.1SrPATVG.js","assets/chunks/shape.D4bgX07r.js","assets/chunks/avatar-and-placement.Cz81aVse.js","assets/chunks/basic.CcvMmpok.js"])))=>i.map(i=>d[i]);
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
`,Ee=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),ge={name:"components/bubble.md"},Ce=Object.assign(ge,{setup(ye){const v=g();u(async()=>{v.value=(await b(async()=>{const{default:i}=await import("./chunks/state-change.lwdj56f0.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const E=g();u(async()=>{E.value=(await b(async()=>{const{default:i}=await import("./chunks/custom-renderer.CwPolTPf.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const C=g();u(async()=>{C.value=(await b(async()=>{const{default:i}=await import("./chunks/custom-composite-renderer.Bb6mx2nr.js");return{default:i}},__vite__mapDeps([4,1,2]))).default});const B=g();u(async()=>{B.value=(await b(async()=>{const{default:i}=await import("./chunks/tools.BsVQ5dXl.js");return{default:i}},__vite__mapDeps([5,2,1]))).default});const f=g();u(async()=>{f.value=(await b(async()=>{const{default:i}=await import("./chunks/reasoning.DxT9nsCD.js");return{default:i}},__vite__mapDeps([6,2,1]))).default});const A=g();u(async()=>{A.value=(await b(async()=>{const{default:i}=await import("./chunks/provider-attributes.4R-bSatO.js");return{default:i}},__vite__mapDeps([7,1,2]))).default});const m=g();u(async()=>{m.value=(await b(async()=>{const{default:i}=await import("./chunks/provider-renderer.BQ87ODQz.js");return{default:i}},__vite__mapDeps([8,1,2]))).default});const F=g();u(async()=>{F.value=(await b(async()=>{const{default:i}=await import("./chunks/list-auto-scroll.DT1WBEd-.js");return{default:i}},__vite__mapDeps([9,2,1]))).default});const x=g();u(async()=>{x.value=(await b(async()=>{const{default:i}=await import("./chunks/list-hidden.u-5Fzey2.js");return{default:i}},__vite__mapDeps([10,1,2]))).default});const D=g();u(async()=>{D.value=(await b(async()=>{const{default:i}=await import("./chunks/list-array-content.CxRA7_Yc.js");return{default:i}},__vite__mapDeps([11,1,2]))).default});const _=g();u(async()=>{_.value=(await b(async()=>{const{default:i}=await import("./chunks/list-custom-group.CxF54EMq.js");return{default:i}},__vite__mapDeps([12,1,2]))).default});const R=g();u(async()=>{R.value=(await b(async()=>{const{default:i}=await import("./chunks/list-consecutive.D5wply9-.js");return{default:i}},__vite__mapDeps([13,1,2]))).default});const T=g();u(async()=>{T.value=(await b(async()=>{const{default:i}=await import("./chunks/list.C-TSxd45.js");return{default:i}},__vite__mapDeps([14,1,2]))).default});const W=g();u(async()=>{W.value=(await b(async()=>{const{default:i}=await import("./chunks/schema-render.BX8B7tZa.js");return{default:i}},__vite__mapDeps([15,2,1]))).default});const w=g();u(async()=>{w.value=(await b(async()=>{const{default:i}=await import("./chunks/slots.BSnzA3_g.js");return{default:i}},__vite__mapDeps([16,1,2]))).default});const I=g();u(async()=>{I.value=(await b(async()=>{const{default:i}=await import("./chunks/content-resolver.DKBhWaZC.js");return{default:i}},__vite__mapDeps([17,1,2]))).default});const S=g();u(async()=>{S.value=(await b(async()=>{const{default:i}=await import("./chunks/content-render-mode.CP7HgJxc.js");return{default:i}},__vite__mapDeps([18,1,2]))).default});const Z=g();u(async()=>{Z.value=(await b(async()=>{const{default:i}=await import("./chunks/image.XCDTzn-o.js");return{default:i}},__vite__mapDeps([19,2,1]))).default});const G=g();u(async()=>{G.value=(await b(async()=>{const{default:i}=await import("./chunks/streaming.2E3OgKFi.js");return{default:i}},__vite__mapDeps([20,1,2]))).default});const M=g();u(async()=>{M.value=(await b(async()=>{const{default:i}=await import("./chunks/markdown.CQVXIwwG.js");return{default:i}},__vite__mapDeps([21,1,2]))).default});const P=g();u(async()=>{P.value=(await b(async()=>{const{default:i}=await import("./chunks/loading.1SrPATVG.js");return{default:i}},__vite__mapDeps([22,2,1]))).default});const L=g();u(async()=>{L.value=(await b(async()=>{const{default:i}=await import("./chunks/shape.D4bgX07r.js");return{default:i}},__vite__mapDeps([23,1,2]))).default});const X=g();u(async()=>{X.value=(await b(async()=>{const{default:i}=await import("./chunks/avatar-and-placement.Cz81aVse.js");return{default:i}},__vite__mapDeps([24,1,2]))).default});const s=j(!0),q=g();return u(async()=>{q.value=(await b(async()=>{const{default:i}=await import("./chunks/basic.CcvMmpok.js");return{default:i}},__vite__mapDeps([25,1,2]))).default}),(i,e)=>{const o=z("ClientOnly");return V(),U("div",null,[e[25]||(e[25]=y('<h1 id="bubble-气泡组件" tabindex="-1">Bubble 气泡组件 <a class="header-anchor" href="#bubble-气泡组件" aria-label="Permalink to &quot;Bubble 气泡组件&quot;">​</a></h1><div class="danger custom-block"><p class="custom-block-title">重大版本升级 v0.4</p><p>Bubble 在 v0.4 进行了重大升级。</p><p><strong>从 v0.3.x 升级？</strong> 请查看 <a href="./../migration/bubble-migration.html">Bubble 迁移指南</a>。</p><p><strong>新项目：</strong> 直接使用下方 v0.4 的 API 和示例即可。</p></div><p>Bubble 气泡组件用于展示消息气泡，支持流式文本、头像、位置、加载中、终止状态、操作按钮等功能。组件采用渲染器架构，支持灵活的内容渲染和自定义扩展。</p><p>主要解决以下问题：</p><ul><li><strong>消息展示</strong>：支持文本、图片、Markdown 等多种内容类型的渲染</li><li><strong>流式输出</strong>：支持流式文本展示，适用于 AI 对话场景</li><li><strong>消息分组</strong>：支持将连续相同角色的消息合并显示</li><li><strong>自定义渲染</strong>：通过渲染器系统支持自定义内容渲染逻辑</li><li><strong>状态管理</strong>：支持消息状态管理，用于存储 UI 相关的数据</li></ul><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>基本示例。使用 <code>content</code> 属性设置气泡内容，可以使用 css 变量来设置样式，比如：</p><ul><li>气泡背景 <code>--tr-bubble-box-bg</code></li><li>气泡文字大小 <code>--tr-bubble-text-font-size</code></li></ul><blockquote><p>更多 css 变量请参考 <a href="#css-变量">CSS 变量</a></p></blockquote>',10)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{s.value=!1}),vueCode:n(ke)},p({_:2},[q.value?{name:"vue",fn:a(()=>[t(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=l("h3",{id:"头像和位置",tabindex:"-1"},[k("头像和位置 "),l("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[27]||(e[27]=l("p",null,[k("通过 "),l("code",null,"avatar"),k(" 设置自定义头像，通过 "),l("code",null,"placement"),k(" 设置位置，提供了 "),l("code",null,"start"),k("、"),l("code",null,"end"),k(" 两个选项")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{s.value=!1}),vueCode:n(be)},p({_:2},[X.value?{name:"vue",fn:a(()=>[t(n(X))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=y('<h3 id="气泡形状" tabindex="-1">气泡形状 <a class="header-anchor" href="#气泡形状" aria-label="Permalink to &quot;气泡形状&quot;">​</a></h3><p>通过 <code>shape</code> 设置气泡形状。目前提供了 <code>rounded</code>、<code>corner</code> 和 <code>none</code> 三个选项。默认为 <code>corner</code>，可以使用 css 变量来设置圆角</p><ul><li>rounded 形状气泡圆角 <code>--tr-bubble-box-shape-rounded-radius</code></li><li>corner 形状气泡圆角 <code>--tr-bubble-box-shape-corner-radius</code>。这个 CSS 变量只会设置 corner 一个角的圆角，另外3个角则使用的 <code>--tr-bubble-box-shape-rounded-radius</code> 的值</li><li>none 形状气泡圆角 <code>--tr-bubble-box-border-radius</code></li></ul>',3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{s.value=!1}),vueCode:n(ue)},p({_:2},[L.value?{name:"vue",fn:a(()=>[t(n(L))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=l("h3",{id:"加载中",tabindex:"-1"},[k("加载中 "),l("a",{class:"header-anchor",href:"#加载中","aria-label":'Permalink to "加载中"'},"​")],-1)),e[30]||(e[30]=l("p",null,[k("通过 "),l("code",null,"loading"),k(" 设置加载中状态")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{s.value=!1}),vueCode:n(he)},p({_:2},[P.value?{name:"vue",fn:a(()=>[t(n(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=y(`<h3 id="渲染-markdown" tabindex="-1">渲染 markdown <a class="header-anchor" href="#渲染-markdown" aria-label="Permalink to &quot;渲染 markdown&quot;">​</a></h3><p>Bubble 组件提供了 <code>markdown</code> 渲染器，可以渲染 markdown 内容。需要安装 <code>markdown-it</code> 和 <code>dompurify</code> 依赖</p><blockquote><p>BubbleList 使用自定义渲染器，需要使用 BubbleProvider 包裹，BubbleProvider 的详细 Props 信息请参考 <a href="#props">Props</a>。</p></blockquote><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># npm</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># yarn</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># pnpm</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span></code></pre></div>`,4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{s.value=!1}),vueCode:n(ce)},p({_:2},[M.value?{name:"vue",fn:a(()=>[t(n(M))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=l("h3",{id:"流式文本",tabindex:"-1"},[k("流式文本 "),l("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[33]||(e[33]=l("p",null,[l("code",null,"content"),k(" 属性是响应式的，动态设置 "),l("code",null,"content"),k(" 即可实现流式文本")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{s.value=!1}),vueCode:n(pe)},p({_:2},[G.value?{name:"vue",fn:a(()=>[t(n(G))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=y('<h3 id="图片渲染" tabindex="-1">图片渲染 <a class="header-anchor" href="#图片渲染" aria-label="Permalink to &quot;图片渲染&quot;">​</a></h3><p>Bubble 组件支持渲染图片内容。当 <code>content</code> 为数组且包含 <code>type: &#39;image_url&#39;</code> 的内容项时，会自动使用 Image 渲染器。</p><p>图文混合时，可以通过 <code>contentRenderMode</code> 控制渲染方式：</p><ul><li><code>&#39;single&#39;</code> 模式：文本和图片在同一个 box 中渲染</li><li><code>&#39;split&#39;</code> 模式：每个内容项（文本或图片）单独一个 box</li></ul>',4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{s.value=!1}),vueCode:n(de)},p({_:2},[Z.value?{name:"vue",fn:a(()=>[t(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=y('<h3 id="内容渲染模式" tabindex="-1">内容渲染模式 <a class="header-anchor" href="#内容渲染模式" aria-label="Permalink to &quot;内容渲染模式&quot;">​</a></h3><p>通过 <code>contentRenderMode</code> 设置内容渲染模式：</p><ul><li><code>&#39;single&#39;</code>（默认）：所有内容在一个 box 中渲染</li><li><code>&#39;split&#39;</code>：当 <code>content</code> 为数组时，每个内容项单独一个 box</li></ul>',3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{s.value=!1}),vueCode:n(re)},p({_:2},[S.value?{name:"vue",fn:a(()=>[t(n(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[36]||(e[36]=y('<blockquote><p><strong>注意</strong>：<code>&#39;single&#39;</code> 模式会将所有内容在一个 box 中渲染（默认）。<code>&#39;split&#39;</code> 模式会在 <code>content</code> 为数组时，将每个内容项单独一个 box 渲染。</p></blockquote><h3 id="内容解析器" tabindex="-1">内容解析器 <a class="header-anchor" href="#内容解析器" aria-label="Permalink to &quot;内容解析器&quot;">​</a></h3><p>通过 <code>contentResolver</code> 可以自定义内容解析逻辑，用于从消息的其他字段提取内容。</p>',3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{s.value=!1}),vueCode:n(oe)},p({_:2},[I.value?{name:"vue",fn:a(()=>[t(n(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[37]||(e[37]=y('<blockquote><p><strong>注意</strong>：默认情况下，组件使用 <code>message.content</code> 作为内容。如果需要自定义内容解析逻辑（例如从其他字段提取内容），可以通过 <code>contentResolver</code> 属性传入自定义函数。</p></blockquote><h3 id="插槽" tabindex="-1">插槽 <a class="header-anchor" href="#插槽" aria-label="Permalink to &quot;插槽&quot;">​</a></h3><p>气泡组件提供了多个插槽，分别是 <code>prefix</code> 插槽, <code>suffix</code> 插槽、<code>content-footer</code> 插槽 和 <code>after</code> 插槽</p>',3)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{s.value=!1}),vueCode:n(le)},p({_:2},[w.value?{name:"vue",fn:a(()=>[t(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[38]||(e[38]=l("h3",{id:"schema-卡片渲染",tabindex:"-1"},[k("schema 卡片渲染 "),l("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22schema-render.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-render.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Cp%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23666%3B%20margin%3A%200%5C%22%3E%E4%BD%BF%E7%94%A8%20Markdown%20%E6%B8%B2%E6%9F%93%E5%99%A8%E6%B8%B2%E6%9F%93%E8%BF%90%E8%A1%8C%E6%97%B6%E7%BB%84%E4%BB%B6%EF%BC%88WebComponent%EF%BC%89%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-provider%20%3Astore%3D%5C%22bubbleStore%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%20%20%20%20%3Acontent%3D%5C%22mdContent%5C%22%5Cn%20%20%20%20%20%20%20%20%3Afallback-content-renderer%3D%5C%22BubbleRenderers.Markdown%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRenderers%2C%20TrBubble%2C%20TrBubbleProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineCustomElement%2C%20h%2C%20reactive%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20SchemaCard%20from%20'.%2Fschema-card.ce.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20bubbleStore%20%3D%20reactive(%7B%5Cn%20%20mdConfig%3A%20%7B%20html%3A%20true%20%7D%2C%5Cn%20%20dompurifyConfig%3A%20%7B%20ADD_TAGS%3A%20%5B'schema-card'%5D%2C%20ADD_ATTR%3A%20%5B'schema'%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20ref(%5Cn%20%20JSON.stringify(%7B%5Cn%20%20%20%20componentName%3A%20'Page'%2C%5Cn%20%20%20%20children%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Text'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%96%87%E6%9C%AC'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Button'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%8C%89%E9%92%AE'%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B3%A8%E5%86%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E5%85%83%E7%B4%A0%5Cnif%20(!customElements.get('schema-card'))%20%7B%5Cn%20%20const%20CardElement%20%3D%20defineCustomElement(SchemaCard)%5Cn%20%20customElements.define('schema-card'%2C%20CardElement)%5Cn%7D%5Cn%5Cnconst%20mdContent%20%3D%20%60%23%20Markdown%20%E6%A0%87%E9%A2%98%5Cn%5Cn**%E5%8A%A0%E7%B2%97%E6%96%87%E6%9C%AC**%5Cn%5Cn%3Cschema-card%20schema%3D'%24%7BschemaObj.value%7D'%3E%3C%2Fschema-card%3E%5Cn%60%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22schema-card.ce.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-card.ce.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cschema-renderer%20%3Aschema%3D%5C%22schemaObj%5C%22%3E%3C%2Fschema-renderer%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20SchemaRenderer%20from%20'%40opentiny%2Ftiny-schema-renderer'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cnconst%20props%20%3D%20defineProps(%7B%5Cn%20%20schema%3A%20%7B%5Cn%20%20%20%20type%3A%20String%2C%5Cn%20%20%20%20required%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20return%20JSON.parse(props.schema)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%3Cstyle%3E%5Cn%40import%20url('%40opentiny%2Fvue-theme%2Findex.css')%3B%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{s.value=!1}),vueCode:n(ie)},p({_:2},[W.value?{name:"vue",fn:a(()=>[t(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[39]||(e[39]=l("h3",{id:"列表",tabindex:"-1"},[k("列表 "),l("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{s.value=!1}),vueCode:n(ae)},p({_:2},[T.value?{name:"vue",fn:a(()=>[t(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[40]||(e[40]=l("h3",{id:"分组策略",tabindex:"-1"},[k("分组策略 "),l("a",{class:"header-anchor",href:"#分组策略","aria-label":'Permalink to "分组策略"'},"​")],-1)),e[41]||(e[41]=l("p",null,[k("BubbleList 支持多种分组策略。分组时，连续的 "),l("code",null,"hidden"),k(" 消息会归为同一组。")],-1)),e[42]||(e[42]=l("p",null,[l("strong",null,"连续分组（consecutive）")],-1)),e[43]||(e[43]=l("p",null,"连续相同角色的消息会被合并为一组。",-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{s.value=!1}),vueCode:n(se)},p({_:2},[R.value?{name:"vue",fn:a(()=>[t(n(R))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[44]||(e[44]=l("p",null,[l("strong",null,"自定义分组函数")],-1)),e[45]||(e[45]=l("p",null,"可以通过自定义函数实现更灵活的分组逻辑。",-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{s.value=!1}),vueCode:n(ne)},p({_:2},[_.value?{name:"vue",fn:a(()=>[t(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[46]||(e[46]=y("<p><strong>数组内容的展示</strong></p><p>当消息的 <code>content</code> 为数组时，每一项的渲染方式由 <code>contentRenderMode</code> 与<strong>当前组的消息条数</strong>共同决定：</p><ul><li>若 <code>contentRenderMode</code> 为 <code>&#39;split&#39;</code> <strong>且</strong> 当前组仅包含 1 条消息，则数组的每一项会单独渲染为一个 box。</li><li>若不满足上述条件（例如为 <code>&#39;single&#39;</code> 模式，或组内有多条消息），则不会按数组项拆成多个 box，所有内容在同一 box 内渲染。</li></ul><p>下方示例中，第一个气泡为单条消息且 <code>content</code> 为数组、<code>contentRenderMode=&quot;split&quot;</code>，因此出现多个 box；其余气泡为单条消息且 <code>content</code> 为字符串，或组内有多条消息，因此每个气泡一个 box。</p>",4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{s.value=!1}),vueCode:n(te)},p({_:2},[D.value?{name:"vue",fn:a(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[47]||(e[47]=l("h3",{id:"隐藏角色",tabindex:"-1"},[k("隐藏角色 "),l("a",{class:"header-anchor",href:"#隐藏角色","aria-label":'Permalink to "隐藏角色"'},"​")],-1)),e[48]||(e[48]=l("p",null,[k("角色配置中使用 "),l("code",null,"hidden"),k(" 来隐藏这个角色的所有消息")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{s.value=!1}),vueCode:n(ee)},p({_:2},[x.value?{name:"vue",fn:a(()=>[t(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[49]||(e[49]=l("h3",{id:"自动滚动",tabindex:"-1"},[k("自动滚动 "),l("a",{class:"header-anchor",href:"#自动滚动","aria-label":'Permalink to "自动滚动"'},"​")],-1)),e[50]||(e[50]=l("p",null,[k("通过 "),l("code",null,"autoScroll"),k(" 属性启用自动滚动功能。当新消息添加时，如果滚动容器接近底部，会自动滚动到底部。")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[16]||(e[16]=()=>{s.value=!1}),vueCode:n(K)},p({_:2},[F.value?{name:"vue",fn:a(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[51]||(e[51]=y(`<blockquote><p><strong>注意</strong>：<code>autoScroll</code> 功能有两种触发机制：</p><ol><li><strong>常规自动滚动</strong>：当消息内容变化时（如消息数量、内容、推理内容），如果满足以下条件会自动滚动： <ul><li>BubbleList 必须是可滚动容器（<code>scrollHeight &gt; clientHeight</code>）</li><li>滚动容器需要接近底部</li></ul></li><li><strong>用户消息特殊处理</strong>：当最后一条消息的 <code>role</code> 为 <code>&#39;user&#39;</code> 时，会立即使用平滑滚动（<code>smooth</code>）滚动到底部，无需满足上述条件。这确保了用户发送消息后能立即看到自己发送的内容。</li></ol></blockquote><h3 id="自定义渲染器" tabindex="-1">自定义渲染器 <a class="header-anchor" href="#自定义渲染器" aria-label="Permalink to &quot;自定义渲染器&quot;">​</a></h3><p>Bubble 组件采用渲染器架构，支持灵活的内容渲染和自定义扩展。渲染器系统分为两种类型：</p><ul><li><strong>Box 渲染器</strong>：用于渲染消息的外层容器（box），控制气泡的样式和布局</li><li><strong>Content 渲染器</strong>：用于渲染消息的具体内容，如文本、图片、Markdown 等</li></ul><h4 id="渲染器匹配机制" tabindex="-1">渲染器匹配机制 <a class="header-anchor" href="#渲染器匹配机制" aria-label="Permalink to &quot;渲染器匹配机制&quot;">​</a></h4><p>渲染器通过匹配规则来选择，匹配过程如下：</p><ol><li>按照优先级排序所有匹配规则（<code>priority</code> 值越小优先级越高）</li><li>依次执行每个规则的 <code>find</code> 函数，找到第一个返回 <code>true</code> 的规则</li><li>使用该规则对应的渲染器</li><li>如果没有匹配到任何规则，使用 fallback 渲染器</li></ol><h4 id="渲染器配置层级" tabindex="-1">渲染器配置层级 <a class="header-anchor" href="#渲染器配置层级" aria-label="Permalink to &quot;渲染器配置层级&quot;">​</a></h4><p>渲染器配置支持三个层级，优先级从高到低：</p><ol><li><strong>Prop 级别</strong>：通过 <code>Bubble</code> 的 <code>fallback-box-renderer</code> 和 <code>fallback-content-renderer</code> 属性配置，只对当前组件生效</li><li><strong>Provider 级别</strong>：通过 <code>BubbleProvider</code> 的 <code>box-renderer-matches</code>、<code>content-renderer-matches</code>、 <code>fallback-box-renderer</code> 和 <code>fallback-content-renderer</code> 属性配置，在整个组件树中生效</li><li><strong>Default 级别</strong>：内置的默认渲染器和匹配规则</li></ol><p><strong>设置 Fallback 渲染器</strong></p><p>当无法匹配到合适的渲染器时，会使用 fallback 渲染器。上面的<a href="#渲染-markdown">渲染 markdown 示例</a>中，就是通过 <code>fallback-content-renderer</code> 属性设置的 <code>BubbleRenderers.Markdown</code> 渲染器。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-bubble</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mdContent</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fallback-content-renderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">BubbleRenderers.Markdown</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-bubble</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h4 id="通过-bubbleprovider-配置渲染器" tabindex="-1">通过 BubbleProvider 配置渲染器 <a class="header-anchor" href="#通过-bubbleprovider-配置渲染器" aria-label="Permalink to &quot;通过 BubbleProvider 配置渲染器&quot;">​</a></h4><p><code>BubbleProvider</code> 组件提供了 <code>box-renderer-matches</code> 和 <code>content-renderer-matches</code> 属性，用于设置渲染器匹配规则。通过 BubbleProvider 配置的渲染器会在整个组件树中生效，适合全局配置。</p>`,15)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[17]||(e[17]=()=>{s.value=!1}),vueCode:n(J)},p({_:2},[m.value?{name:"vue",fn:a(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[52]||(e[52]=y('<h4 id="通过-bubbleprovider-统一注入-attributes" tabindex="-1">通过 BubbleProvider 统一注入 attributes <a class="header-anchor" href="#通过-bubbleprovider-统一注入-attributes" aria-label="Permalink to &quot;通过 BubbleProvider 统一注入 attributes&quot;">​</a></h4><p>除了配置渲染器，<code>BubbleProvider</code> 还支持通过 <code>box-attributes</code> 和 <code>content-attributes</code> 为 Box / Content 统一注入 attributes。</p><ul><li><code>box-attributes</code> 的作用域是一个 Box，对应参数为 <code>(messages, content, contentIndex)</code></li><li><code>content-attributes</code> 的作用域是单个 Content，对应参数为 <code>(message, content, contentIndex)</code></li><li>两个属性都支持传入静态对象，或返回 attributes 的函数</li></ul><p>适合用于统一添加 <code>data-*</code> 标记、埋点字段、测试选择器等通用属性，而不需要依赖所有消息都匹配某个自定义渲染器。</p>',4)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[18]||(e[18]=()=>{s.value=!1}),vueCode:n($)},p({_:2},[A.value?{name:"vue",fn:a(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[53]||(e[53]=y('<blockquote><p><code>BubbleProvider</code> 注入的 attributes 会在对应的 Box / Content 上统一生效；如果某个匹配规则本身也配置了 <code>attributes</code>，会在 Provider attributes 的基础上继续合并。</p></blockquote><h4 id="渲染器匹配优先级" tabindex="-1">渲染器匹配优先级 <a class="header-anchor" href="#渲染器匹配优先级" aria-label="Permalink to &quot;渲染器匹配优先级&quot;">​</a></h4><p>匹配规则可以使用 <code>priority</code> 属性来设置优先级，值越小优先级越高。系统提供了以下优先级常量：</p><ul><li><p><code>BubbleRendererMatchPriority.LOADING</code>: -1</p><p>通常基于 <code>message.loading</code> 判断，用于加载状态渲染器。例如：<code>{ loading: true }</code></p></li><li><p><code>BubbleRendererMatchPriority.NORMAL</code>: 0</p><p>普通渲染器的默认优先级。未设置优先级时，默认使用该优先级</p></li><li><p><code>BubbleRendererMatchPriority.CONTENT</code>: 10</p><p>通常基于 <code>message.content</code> 判断。例如：<code>{ content: [{ type: &#39;image_url&#39;, image_url: &#39;xxx&#39; }] }</code></p></li><li><p><code>BubbleRendererMatchPriority.ROLE</code>: 20</p><p>通常基于 <code>message.role</code> 判断。例如：<code>{ role: &#39;tool&#39; }</code></p></li></ul><blockquote><p><strong>注意</strong>：渲染器匹配时，优先级数值越小优先级越高。自定义渲染器应该根据匹配条件选择合适的优先级。</p></blockquote><h4 id="内置渲染器" tabindex="-1">内置渲染器 <a class="header-anchor" href="#内置渲染器" aria-label="Permalink to &quot;内置渲染器&quot;">​</a></h4><p>组件内置了以下渲染器，可以通过 <code>BubbleRenderers</code> 访问：</p><ul><li><code>BubbleRenderers.Box</code> - 默认 Box 渲染器</li><li><code>BubbleRenderers.Text</code> - 文本内容渲染器（默认 Content 渲染器）</li><li><code>BubbleRenderers.Image</code> - 图片渲染器</li><li><code>BubbleRenderers.Markdown</code> - Markdown 渲染器</li><li><code>BubbleRenderers.Loading</code> - 加载状态渲染器</li><li><code>BubbleRenderers.Reasoning</code> - 推理内容渲染器</li><li><code>BubbleRenderers.Tool</code> - 单个工具调用渲染器</li><li><code>BubbleRenderers.Tools</code> - 工具调用列表渲染器</li><li><code>BubbleRenderers.ToolRole</code> - 工具角色消息渲染器</li></ul>',8)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[19]||(e[19]=()=>{s.value=!1}),vueCode:n(H)},p({_:2},[f.value?{name:"vue",fn:a(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[20]||(e[20]=()=>{s.value=!1}),vueCode:n(Q)},p({_:2},[B.value?{name:"vue",fn:a(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[54]||(e[54]=y(`<h4 id="实现自定义渲染器" tabindex="-1">实现自定义渲染器 <a class="header-anchor" href="#实现自定义渲染器" aria-label="Permalink to &quot;实现自定义渲染器&quot;">​</a></h4><p><strong>Content 渲染器</strong></p><p>Content 渲染器接收 <code>BubbleContentRendererProps</code> 作为 props，包含 <code>message</code> 和 <code>contentIndex</code>。最简单的渲染器只需要消费当前消息内容，并把外部传入的 attributes 绑定到自己的根节点上。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- CustomContentRenderer.vue --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { BubbleContentRendererProps } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defineProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleContentRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;custom-content&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> v-bind</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$attrs</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {{ message.content }}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>当一个渲染器会拆出部分字段单独渲染，同时还要继续渲染剩余内容时，可以实现为复合渲染器。典型场景是 <code>reasoning_content + content</code> 或 <code>tool_calls + content</code>：</p><ul><li>使用 <code>useOmitMessageFields(props, fields)</code> 从消息中剥离已经消费的字段，避免递归时再次命中同一个渲染器</li><li>使用 <code>useBubbleContentRenderer(restMessage, contentIndex)</code> 为剩余消息重新选择渲染器</li><li>内部递归渲染时传入 <code>renderer.attributes</code>，保证 <code>BubbleProvider</code> / match 注入的 attributes 不丢失</li><li>多根节点组件需要 <code>inheritAttrs: false</code>，并把 <code>$attrs</code> 显式绑定到当前渲染器真正代表的 DOM 节点上</li></ul><p>下方示例中，<code>contentAttributes</code> 使用函数形式，并根据 <code>message.reasoning_content</code> 分发不同属性；match 的 <code>attributes</code> 会落到自定义推理块上，递归渲染普通 <code>content</code> 时会重新计算并传递新的 <code>contentAttributes</code>。</p>`,7)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22custom-composite-renderer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fcustom-composite-renderer.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-provider%20%3Acontent-renderer-matches%3D%5C%22contentRendererMatches%5C%22%20%3Acontent-attributes%3D%5C%22contentAttributes%5C%22%3E%5Cn%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20content%3D%5C%22%E6%9C%80%E7%BB%88%E7%AD%94%E6%A1%88%EF%BC%9A1%20%2B%201%20%E5%9C%A8%E4%BA%8C%E8%BF%9B%E5%88%B6%E4%B8%AD%E7%AD%89%E4%BA%8E%2010%E3%80%82%5C%22%5Cn%20%20%20%20%20%20reasoning_content%3D%5C%22%E5%85%88%E6%8C%89%E5%8D%81%E8%BF%9B%E5%88%B6%E7%90%86%E8%A7%A3%201%20%2B%201%20%3D%202%EF%BC%8C%E5%86%8D%E6%8A%8A%202%20%E8%BD%AC%E6%88%90%E4%BA%8C%E8%BF%9B%E5%88%B6%EF%BC%8C%E7%BB%93%E6%9E%9C%E6%98%AF%2010%E3%80%82%5C%22%5Cn%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3C%2Ftr-bubble-provider%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%5Cn%20%20BubbleRendererMatchPriority%2C%5Cn%20%20type%20BubbleContentAttributesConfig%2C%5Cn%20%20type%20BubbleContentRendererMatch%2C%5Cn%20%20TrBubble%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20markRaw%20%7D%20from%20'vue'%5Cnimport%20RecursiveReasoningRenderer%20from%20'.%2FRecursiveReasoningRenderer.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20contentRendererMatches%3A%20BubbleContentRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(message)%20%3D%3E%20typeof%20message.reasoning_content%20%3D%3D%3D%20'string'%2C%5Cn%20%20%20%20renderer%3A%20markRaw(RecursiveReasoningRenderer)%2C%5Cn%20%20%20%20priority%3A%20BubbleRendererMatchPriority.NORMAL%20-%201%2C%5Cn%20%20%20%20attributes%3A%20%7B%20'data-renderer'%3A%20'custom-recursive-reasoning'%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20contentAttributes%3A%20BubbleContentAttributesConfig%20%3D%20(message%2C%20content%2C%20contentIndex)%20%3D%3E%20%7B%5Cn%20%20const%20isReasoning%20%3D%20typeof%20message.reasoning_content%20%3D%3D%3D%20'string'%20%26%26%20message.reasoning_content%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20'data-demo-kind'%3A%20isReasoning%20%3F%20'reasoning'%20%3A%20'content'%2C%5Cn%20%20%20%20'data-role'%3A%20message.role%20%7C%7C%20'assistant'%2C%5Cn%20%20%20%20'data-content-type'%3A%20content.type%2C%5Cn%20%20%20%20'data-content-index'%3A%20contentIndex%2C%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22RecursiveReasoningRenderer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2FRecursiveReasoningRenderer.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20type%20BubbleContentRendererProps%2C%20useBubbleContentRenderer%2C%20useOmitMessageFields%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5CndefineOptions(%7B%5Cn%20%20inheritAttrs%3A%20false%2C%5Cn%7D)%5Cn%5Cnconst%20props%20%3D%20defineProps%3CBubbleContentRendererProps%3E()%5Cn%5Cnconst%20%7B%20restMessage%2C%20restProps%20%7D%20%3D%20useOmitMessageFields(props%2C%20%5B'reasoning_content'%5D)%5Cnconst%20renderer%20%3D%20useBubbleContentRenderer(restMessage%2C%20props.contentIndex)%5Cn%5Cnconst%20recursiveProps%20%3D%20computed(()%20%3D%3E%20(%7B%5Cn%20%20...renderer.value.attributes%2C%5Cn%20%20...restProps.value%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22custom-reasoning%5C%22%20data-type%3D%5C%22custom-reasoning%5C%22%20v-bind%3D%5C%22%24attrs%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22custom-reasoning__title%5C%22%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8E%A8%E7%90%86%E8%BF%87%E7%A8%8B%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22custom-reasoning__content%5C%22%3E%7B%7B%20props.message.reasoning_content%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%20%20%3Ccomponent%20%3Ais%3D%5C%22renderer.renderer%5C%22%20v-bind%3D%5C%22recursiveProps%5C%22%20%2F%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.custom-reasoning%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20padding-left%3A%2010px%3B%5Cn%20%20border-left%3A%202px%20solid%20%238b5cf6%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%7D%5Cn%5Cn.custom-reasoning__title%20%7B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%7D%5Cn%5Cn.custom-reasoning__content%20%7B%5Cn%20%20margin%3A%204px%200%200%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%20%20white-space%3A%20pre-wrap%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[21]||(e[21]=()=>{s.value=!1}),vueCode:n(Y)},p({_:2},[C.value?{name:"vue",fn:a(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[55]||(e[55]=y(`<p><strong>Box 渲染器示例</strong></p><p>Box 渲染器接收 <code>BubbleBoxRendererProps</code> 作为 props，包含 <code>placement</code> 和 <code>shape</code>，并通过插槽渲染内容。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { BubbleBoxRendererProps } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defineProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleBoxRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;custom-box&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data-placement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">placement</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data-shape</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">slot</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> /</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>配置自定义渲染器</strong></p><p>配置自定义渲染器有两种方式：</p><p><strong>方式一：通过 BubbleProvider 配置匹配规则</strong>（推荐用于全局配置）</p>`,6)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[22]||(e[22]=()=>{s.value=!1}),vueCode:n(J)},p({_:2},[m.value?{name:"vue",fn:a(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[56]||(e[56]=l("p",null,[l("strong",null,"方式二：通过 fallback 属性配置"),k("（用于单个组件）")],-1)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[23]||(e[23]=()=>{s.value=!1}),vueCode:n(N)},p({_:2},[E.value?{name:"vue",fn:a(()=>[t(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[57]||(e[57]=y(`<p><strong>注意事项</strong></p><ul><li>使用 <code>markRaw</code> 包装渲染器组件，避免 Vue 的响应式处理</li><li>为了不修改源数据内部内容和结构，UI 相关的数据应放在消息的 <code>state</code> 属性中</li><li>Box 渲染器的 <code>find</code> 函数签名：<code>(messages, content, contentIndex) =&gt; boolean</code>，其中 <code>content</code> 仅在 split 模式有值</li><li>Content 渲染器的 <code>find</code> 函数签名：<code>(message, content, contentIndex) =&gt; boolean</code>，<code>content</code> 为统一化后的 <code>ChatMessageContentItem</code></li><li>在 Content 渲染器中可使用 <code>useMessageContent(props)</code> 获取当前 <code>content</code> 和 <code>contentText</code>，以正确处理 <code>contentIndex</code> 与数组内容</li><li>多根节点或复合渲染器应使用 <code>inheritAttrs: false</code>，并显式决定 <code>$attrs</code> 绑定到哪个节点；不要把同一份 attributes 复制到多个兄弟节点上，避免重复 <code>id</code>、ARIA 或测试选择器</li></ul><h3 id="状态和事件管理" tabindex="-1">状态和事件管理 <a class="header-anchor" href="#状态和事件管理" aria-label="Permalink to &quot;状态和事件管理&quot;">​</a></h3><p>如果你希望在 Bubble 内部（例如自定义 Content 渲染器中）向外通知交互行为，可以使用 <code>useBubbleEventFn()</code> 触发 <code>bubble-event</code>。事件会从当前渲染器逐层透传到外层的 <code>Bubble</code> / <code>BubbleList</code>，业务侧可以统一监听并处理。</p><p>Bubble 也支持通过 <code>state</code> 属性存储 UI 相关的数据，例如展开状态、点赞状态等。这些状态不会写入消息内容本身，适合放置只影响渲染表现的交互数据。</p><p>Bubble 内部统一通过 <code>bubble-event</code> 抛出渲染器交互事件。状态变化本身也是一种特定事件，事件名为 <code>state:update</code>；对于常见的 UI 状态更新场景，可以使用 <code>useBubbleStateChangeFn()</code> 这个便捷 API，它会自动触发 <code>name</code> 为 <code>state:update</code> 的 <code>bubble-event</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> handleStateChange</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useBubbleStateChangeFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">handleStateChange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;expanded&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><p>这等价于发出：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> emitBubbleEvent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useBubbleEventFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">emitBubbleEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;state:update&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  payload: { key: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;expanded&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, value: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>外层 <code>Bubble</code> / <code>BubbleList</code> 会收到 <code>bubble-event</code>；当事件名为 <code>state:update</code> 时，还会额外触发 <code>state-change</code> 这个便捷事件，业务侧可以直接在事件回调中把新的 <code>key</code> / <code>value</code> 同步回消息的 <code>state</code>。</p><p>如果渲染器需要抛出不直接修改 UI 状态的普通交互事件，可以使用 <code>useBubbleEventFn()</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> emitBubbleEvent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useBubbleEventFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">emitBubbleEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;demo:apply-to-input&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  payload: { text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;...&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>组件内置的部分渲染器也会使用同一事件机制触发状态更新，例如 Reasoning 渲染器的展开/收起、Tool 渲染器的详情展开/收起。</p>`,13)),r(t(n(c),null,null,512),[[d,s.value]]),t(o,null,{default:a(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[24]||(e[24]=()=>{s.value=!1}),vueCode:n(O)},p({_:2},[v.value?{name:"vue",fn:a(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[58]||(e[58]=y(`<blockquote><p><strong>注意</strong>：<code>state-change</code> 是针对 <code>bubble-event</code> 中 <code>state:update</code> 提供的便捷事件，只负责通知外部更新 UI 状态。若状态没有同步回传给消息的 <code>state</code> 属性，渲染器下一次渲染时不会保留该状态。</p></blockquote><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><p><strong>BubbleProps</strong> - 单个气泡的属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>role</code></td><td><code>string</code></td><td>-</td><td>气泡角色标识，用于关联 <code>roleConfigs</code> 配置</td></tr><tr><td><code>content</code></td><td><code>string | ChatMessageContentItem[]</code></td><td>-</td><td>气泡内容</td></tr><tr><td><code>reasoning_content</code></td><td><code>string</code></td><td>-</td><td>推理内容（用于 Reasoning 渲染器）</td></tr><tr><td><code>tool_calls</code></td><td><code>ToolCall[]</code></td><td>-</td><td>工具调用列表（用于 Tool 渲染器）</td></tr><tr><td><code>tool_call_id</code></td><td><code>string</code></td><td>-</td><td>工具调用 ID</td></tr><tr><td><code>name</code></td><td><code>string</code></td><td>-</td><td>消息名称</td></tr><tr><td><code>id</code></td><td><code>string</code></td><td>-</td><td>气泡唯一标识</td></tr><tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示加载状态</td></tr><tr><td><code>state</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>-</td><td>消息状态数据（用于存储 UI 相关的数据，不会影响消息内容）</td></tr><tr><td><code>hidden</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否隐藏气泡</td></tr><tr><td><code>avatar</code></td><td><code>VNode | Component</code></td><td>-</td><td>气泡头像部分的自定义 Vue 节点或组件</td></tr><tr><td><code>placement</code></td><td><code>&#39;start&#39; | &#39;end&#39;</code></td><td><code>&#39;start&#39;</code></td><td>气泡对齐位置</td></tr><tr><td><code>shape</code></td><td><code>&#39;corner&#39; | &#39;rounded&#39; | &#39;none&#39;</code></td><td><code>&#39;corner&#39;</code></td><td>气泡形状</td></tr><tr><td><code>contentRenderMode</code></td><td><code>&#39;single&#39; | &#39;split&#39;</code></td><td><code>&#39;single&#39;</code></td><td>内容渲染模式。<code>&#39;single&#39;</code> 表示所有内容在一个 box 中，<code>&#39;split&#39;</code> 表示每个内容项单独一个 box</td></tr><tr><td><code>contentResolver</code></td><td><code>(message: BubbleMessage) =&gt; ChatMessageContent | undefined</code></td><td><code>(message) =&gt; message.content</code></td><td>内容解析函数，用于解析消息内容</td></tr><tr><td><code>fallbackBoxRenderer</code></td><td><code>Component&lt;BubbleBoxRendererProps&gt;</code></td><td>-</td><td>默认 box 渲染器（当无法匹配到合适的渲染器时使用）</td></tr><tr><td><code>fallbackContentRenderer</code></td><td><code>Component&lt;BubbleContentRendererProps&gt;</code></td><td>-</td><td>默认内容渲染器（当无法匹配到合适的渲染器时使用）</td></tr></tbody></table><p><strong>BubbleListProps</strong> - 气泡列表组件的属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>messages</code></td><td><code>BubbleMessage[]</code></td><td>-</td><td><strong>必填</strong>，消息数组</td></tr><tr><td><code>groupStrategy</code></td><td><code>&#39;consecutive&#39; | &#39;divider&#39; | BubbleGroupFunction</code></td><td><code>&#39;divider&#39;</code></td><td>分组策略：<br>- <code>&#39;consecutive&#39;</code>: 连续相同角色的消息合并为一组<br>- <code>&#39;divider&#39;</code>: 按分割角色分组（每条分割角色消息单独成组，其他消息在两个分割角色之间合并为一组）<br>- 自定义函数: <code>(messages, dividerRole?) =&gt; BubbleMessageGroup[]</code></td></tr><tr><td><code>dividerRole</code></td><td><code>string</code></td><td><code>&#39;user&#39;</code></td><td><code>&#39;divider&#39;</code> 策略的分割角色，具有此角色的消息将作为分割线</td></tr><tr><td><code>fallbackRole</code></td><td><code>string</code></td><td><code>&#39;assistant&#39;</code></td><td>当消息没有角色或角色为空时，使用此角色</td></tr><tr><td><code>roleConfigs</code></td><td><code>Record&lt;string, BubbleRoleConfig&gt;</code></td><td>-</td><td>每个角色的默认配置项（头像、位置、形状等）</td></tr><tr><td><code>contentRenderMode</code></td><td><code>&#39;single&#39; | &#39;split&#39;</code></td><td>-</td><td>内容渲染模式</td></tr><tr><td><code>contentResolver</code></td><td><code>(message: BubbleMessage) =&gt; ChatMessageContent | undefined</code></td><td><code>(message) =&gt; message.content</code></td><td>内容解析函数，用于解析消息内容</td></tr><tr><td><code>autoScroll</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否自动滚动到底部。需要满足以下条件：<br>- BubbleList 是可滚动容器（需要 scrollHeight &gt; clientHeight）<br>- 滚动容器接近底部</td></tr></tbody></table><p><strong>BubbleList Expose</strong></p><table tabindex="0"><thead><tr><th>方法</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><code>scrollToBottom</code></td><td><code>(behavior?: ScrollBehavior) =&gt; Promise&lt;void&gt;</code></td><td>滚动到底部。传入 <code>&#39;smooth&#39;</code> 可平滑滚动。若未启用 <code>autoScroll</code>，调用后无实际滚动效果。</td></tr></tbody></table><p><strong>BubbleProviderProps</strong> - 气泡提供者组件的属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>boxRendererMatches</code></td><td><code>BubbleBoxRendererMatch[]</code></td><td>-</td><td>Box 渲染器匹配规则数组</td></tr><tr><td><code>contentRendererMatches</code></td><td><code>BubbleContentRendererMatch[]</code></td><td>-</td><td>内容渲染器匹配规则数组</td></tr><tr><td><code>boxAttributes</code></td><td><code>BubbleBoxAttributesConfig</code></td><td>-</td><td>统一注入到 Box 的 attributes，支持静态对象或 resolver 函数</td></tr><tr><td><code>contentAttributes</code></td><td><code>BubbleContentAttributesConfig</code></td><td>-</td><td>统一注入到 Content 的 attributes，支持静态对象或 resolver 函数</td></tr><tr><td><code>fallbackBoxRenderer</code></td><td><code>Component&lt;BubbleBoxRendererProps&gt;</code></td><td>-</td><td>默认 box 渲染器（当无法匹配到合适的渲染器时使用）</td></tr><tr><td><code>fallbackContentRenderer</code></td><td><code>Component&lt;BubbleContentRendererProps&gt;</code></td><td>-</td><td>默认内容渲染器（当无法匹配到合适的渲染器时使用）</td></tr><tr><td><code>store</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>-</td><td>全局状态存储，用于在 BubbleList 和 Bubble 组件之间共享数据</td></tr></tbody></table><h2 id="emits" tabindex="-1">Emits <a class="header-anchor" href="#emits" aria-label="Permalink to &quot;Emits&quot;">​</a></h2><p><strong>Bubble 和 BubbleList 组件的事件</strong></p><table tabindex="0"><thead><tr><th>事件名</th><th>参数类型</th><th>说明</th></tr></thead><tbody><tr><td><code>state-change</code></td><td><code>{ key: string; value: unknown; messageIndex: number; contentIndex: number }</code></td><td>当消息状态改变时触发。<code>key</code> 为状态键名，<code>value</code> 为状态值，<code>messageIndex</code> 为消息索引，<code>contentIndex</code> 为内容索引</td></tr><tr><td><code>bubble-event</code></td><td><code>BubbleEvent &amp; { messageIndex: number; contentIndex: number }</code></td><td>Bubble 内部交互事件。状态更新会以 <code>name: &#39;state:update&#39;</code> 触发，并额外派发 <code>state-change</code> 便捷事件</td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><p><strong>Bubble 组件插槽</strong></p><table tabindex="0"><thead><tr><th>插槽名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>prefix</code></td><td><code>{ messages: BubbleMessage[]; role?: string }</code></td><td>前缀插槽，用于在气泡前添加内容</td></tr><tr><td><code>suffix</code></td><td><code>{ messages: BubbleMessage[]; role?: string }</code></td><td>后缀插槽，用于在气泡后添加内容</td></tr><tr><td><code>after</code></td><td><code>{ messages: BubbleMessage[]; role?: string }</code></td><td>尾部插槽，用于在气泡内容外部添加内容</td></tr><tr><td><code>content-footer</code></td><td><code>{ messages: BubbleMessage[]; role?: string; contentIndex?: number }</code></td><td>内容底部插槽，用于在气泡内容底部添加内容</td></tr></tbody></table><p><strong>BubbleList 组件插槽</strong></p><table tabindex="0"><thead><tr><th>插槽名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>prefix</code></td><td><code>{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }</code></td><td>前缀插槽，用于在气泡前添加内容</td></tr><tr><td><code>suffix</code></td><td><code>{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }</code></td><td>后缀插槽，用于在气泡后添加内容</td></tr><tr><td><code>after</code></td><td><code>{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }</code></td><td>尾部插槽，用于在气泡内容外部添加内容</td></tr><tr><td><code>content-footer</code></td><td><code>{ messages: BubbleMessage[]; role?: string; contentIndex?: number; messageIndexes: number[] }</code></td><td>内容底部插槽，用于在气泡内容底部添加内容</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><p><strong>BubbleMessage</strong> - 消息基础类型</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  S</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  role</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoning_content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tool_calls</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ToolCall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tool_call_id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  loading</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  state</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> S</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>ChatMessageContent</strong> - 消息内容类型</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span></code></pre></div><p><strong>ChatMessageContentItem</strong> - 单条消息内容项的结构</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [key: string]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>type</code></td><td><code>string</code></td><td>消息类型，用于选择对应的渲染器</td></tr><tr><td><code>[key: string]</code></td><td><code>any</code></td><td>其他字段可自由扩展，用于携带消息所需的自定义数据</td></tr></tbody></table><p><strong>ToolCall</strong> - 工具调用接口</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ToolCall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;function&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  function</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    arguments</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [x: string]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>BubbleRoleConfig</strong> - 角色配置类型</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleRoleConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Pick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  BubbleProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;avatar&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;placement&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;shape&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;hidden&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;fallbackBoxRenderer&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;fallbackContentRenderer&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>BubbleBoxRendererMatch</strong> - Box 渲染器匹配规则</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  find</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[],</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  renderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleBoxRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  priority</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  attributes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ((</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[],</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">        contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ul><li><code>content</code>: 仅在 <code>split</code> 模式（<code>contentIndex</code> 为数字）时传入，为当前消息经 <code>contentResolver</code> 解析后对应索引的内容项；<code>contentIndex</code> 为 <code>undefined</code> 时 <code>content</code> 也为 <code>undefined</code></li><li><code>contentIndex</code>: 仅在 split 模式下传入，此时 <code>messages</code> 长度为 1</li></ul><p><strong>BubbleContentRendererMatch</strong> - 内容渲染器匹配规则</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleContentRendererMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  find</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  renderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleContentRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  priority</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  attributes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ul><li><code>content</code>: 当前消息经 <code>contentResolver</code> 解析并统一化后的内容项；若为数组则取 <code>contentIndex</code> 对应项，若为字符串则转为 <code>{ type: &#39;text&#39;, text: string }</code></li><li><code>contentIndex</code>: 内容索引，字符串解析时为 0</li></ul><p><strong>BubbleBoxRendererProps</strong> - Box 渲染器属性</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererProps</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Pick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;placement&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;shape&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>BubbleContentRendererProps</strong> - 内容渲染器属性</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleContentRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  S</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">S</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>BubbleGroupFunction</strong> - 自定义分组函数类型</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleGroupFunction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[], </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">dividerRole</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageGroup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span></code></pre></div><p><strong>BubbleMessageGroup</strong> - 消息分组类型</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageGroup</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  role</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messageIndexes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@deprecated</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 自定义分组中的消息可能不连续，使用 startIndex + 局部索引推导全局索引可能出错。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 请以 messageIndexes 作为局部索引到全局索引的映射依据。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  startIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><p><strong>Bubble 根元素</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-gap</code></td><td>头像与内容间距</td></tr><tr><td><code>--tr-bubble-max-width</code></td><td>气泡最大宽度</td></tr><tr><td><code>--tr-bubble-min-width</code></td><td>气泡最小宽度</td></tr></tbody></table><p><strong>box 容器</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-box-bg</code></td><td>Box 背景色</td></tr><tr><td><code>--tr-bubble-box-padding</code></td><td>Box 内边距</td></tr><tr><td><code>--tr-bubble-box-border-radius</code></td><td>Box 圆角大小</td></tr><tr><td><code>--tr-bubble-box-shadow</code></td><td>Box 阴影效果</td></tr><tr><td><code>--tr-bubble-box-border</code></td><td>Box 边框样式</td></tr><tr><td><code>--tr-bubble-box-shape-rounded-radius</code></td><td>rounded 形状气泡圆角</td></tr><tr><td><code>--tr-bubble-box-shape-corner-radius</code></td><td>corner 形状气泡的特定角圆角（start 为左上角，end 为右上角）</td></tr><tr><td><code>--tr-bubble-box-image-padding</code></td><td>图片类型 Box 的内边距</td></tr><tr><td><code>--tr-bubble-box-image-border</code></td><td>图片类型 Box 的边框样式</td></tr></tbody></table><p><strong>text 文本</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-text-color</code></td><td>文本文字颜色</td></tr><tr><td><code>--tr-bubble-text-font-size</code></td><td>文本字号</td></tr><tr><td><code>--tr-bubble-text-line-height</code></td><td>文本行高</td></tr></tbody></table><p><strong>loading 加载</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-loading-color</code></td><td>加载图标颜色</td></tr><tr><td><code>--tr-bubble-loading-size</code></td><td>加载图标尺寸</td></tr></tbody></table><p><strong>image 图片</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-image-max-width</code></td><td>图片最大宽度</td></tr><tr><td><code>--tr-bubble-image-max-height</code></td><td>图片最大高度</td></tr><tr><td><code>--tr-bubble-image-border-radius</code></td><td>图片圆角大小</td></tr><tr><td><code>--tr-bubble-image-space-y</code></td><td>图片之间的垂直间距</td></tr><tr><td><code>--tr-bubble-image-embedded-border</code></td><td>嵌入在其他 box 中的图片边框样式</td></tr><tr><td><code>--tr-bubble-image-embedded-border-radius</code></td><td>嵌入在其他 box 中的图片圆角大小</td></tr><tr><td><code>--tr-bubble-image-embedded-margin-block</code></td><td>嵌入在其他 box 中的图片垂直外边距</td></tr></tbody></table><p><strong>tool 工具调用</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-tool-call-bg</code></td><td>工具调用背景色</td></tr><tr><td><code>--tr-bubble-tool-call-space-y</code></td><td>工具调用之间的垂直间距</td></tr><tr><td><code>--tr-bubble-tool-call-min-width</code></td><td>工具调用的最小宽度</td></tr><tr><td><code>--tr-bubble-tool-call-max-width</code></td><td>工具调用的最大宽度</td></tr><tr><td><code>--tr-bubble-tool-call-max-height</code></td><td>工具调用详情最大高度（默认 300px）</td></tr><tr><td><code>--tr-bubble-tool-key-color</code></td><td>工具调用 JSON 中 key 的颜色</td></tr><tr><td><code>--tr-bubble-tool-number-color</code></td><td>工具调用 JSON 中数字的颜色</td></tr><tr><td><code>--tr-bubble-tool-string-color</code></td><td>工具调用 JSON 中字符串的颜色</td></tr><tr><td><code>--tr-bubble-tool-boolean-color</code></td><td>工具调用 JSON 中布尔值的颜色</td></tr><tr><td><code>--tr-bubble-tool-null-color</code></td><td>工具调用 JSON 中 null 的颜色</td></tr></tbody></table><p><strong>reasoning 推理</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-reasoning-max-height</code></td><td>推理内容最大高度（默认 300px）</td></tr><tr><td><code>--tr-bubble-reasoning-side-border-width</code></td><td>推理内容左侧边线宽度（默认 1.5px）</td></tr><tr><td><code>--tr-bubble-reasoning-side-border-color</code></td><td>推理内容左侧边线颜色（默认使用 <code>--tr-border-color-disabled</code>）</td></tr></tbody></table><p><strong>BubbleList 容器变量</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-bubble-list-gap</code></td><td>气泡项之间的间距</td></tr><tr><td><code>--tr-bubble-list-padding</code></td><td>容器内边距</td></tr></tbody></table>`,61))])}}});export{Ee as __pageData,Ce as default};
