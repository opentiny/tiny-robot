const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/tool-approval.BijLFZf1.js","assets/chunks/theme.CaZx_sMv.js","assets/chunks/framework.BHsLpWB3.js","assets/chunks/index.CtMmZvOy.js","assets/chunks/state-change.B5BWhrLb.js","assets/chunks/custom-renderer.CyUa6ql-.js","assets/chunks/custom-composite-renderer.DdDPAcf_.js","assets/chunks/tools.C6HXGb_S.js","assets/chunks/reasoning.BUzBaW1H.js","assets/chunks/error.DvxDkR9U.js","assets/chunks/provider-attributes.CL03Zq5E.js","assets/chunks/provider-renderer.By8j_v3p.js","assets/chunks/list-auto-scroll.BSttPLEH.js","assets/chunks/list-hidden.CxOH-4eW.js","assets/chunks/list-array-content.Y_LvRGak.js","assets/chunks/list-custom-group.C4Zm_KOM.js","assets/chunks/list-consecutive.DGpS6IYr.js","assets/chunks/list.DaKkj2Ud.js","assets/chunks/schema-render.D-xjFHwZ.js","assets/chunks/slots.DDWwLqzo.js","assets/chunks/content-resolver.BMo0tYk-.js","assets/chunks/content-render-mode.DodaaS8L.js","assets/chunks/image.iVBQhv3g.js","assets/chunks/markdown.DoZhLgDD.js","assets/chunks/streaming.CcSrP7K7.js","assets/chunks/loading.Dm8j-pHe.js","assets/chunks/shape.XLWoCFqx.js","assets/chunks/avatar-and-placement.BB8DtWN0.js","assets/chunks/basic.kMb3_a98.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as r,aZ as V,aL as z,v as U,H as y,bL as p,bB as c,J as t,bk as n,bJ as i,G as h,w as o,I as g,b7 as u,aU as j}from"./chunks/framework.BHsLpWB3.js";import{L as b,N as k}from"./chunks/index.DXUwwNat.js";const N=`<template>
  <div class="tool-approval-demo">
    <div class="tool-approval-demo__controls">
      <tiny-button class="tool-approval-demo__start-button" :disabled="!canStartTurn" @click="startApproval">
        {{
          canStartTurn ? (requestState === 'completed' ? '再次发起审批' : '发起审批') : isPaused ? '等待审批' : '处理中'
        }}
      </tiny-button>
      <span class="tool-approval-demo__status" role="status" aria-live="polite">{{ statusText }}</span>
    </div>
    <p v-if="errorMessage" class="tool-approval-demo__error" role="alert">{{ errorMessage }}</p>
    <div class="tool-approval-demo__messages">
      <tr-bubble-list :messages="messages" :auto-scroll="true" @bubble-event="handleBubbleEvent"></tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { BubbleEvent } from '@opentiny/tiny-robot'
import { TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import type { ChatCompletion, MessageRequestBody, Tool } from '@opentiny/tiny-robot-kit'
import { computed, onMounted, ref } from 'vue'

let approvalRun = 0
let responseSequence = 0

const createCompletion = (
  message: NonNullable<ChatCompletion['choices'][number]['message']>,
  finishReason: 'stop' | 'tool_calls',
): ChatCompletion => ({
  id: \`tool-approval-response-\${++responseSequence}\`,
  object: 'chat.completion',
  created: responseSequence,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message,
      delta: undefined,
      finish_reason: finishReason,
      logprobs: null,
    },
  ],
})

const responseProvider = async (requestBody: MessageRequestBody, abortSignal: AbortSignal): Promise<ChatCompletion> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (abortSignal.aborted) {
    throw new DOMException('The request was aborted.', 'AbortError')
  }

  const latestMessage = requestBody.messages.at(-1)
  if (latestMessage?.role === 'tool') {
    const wasRejected = latestMessage.content === '工具调用已拒绝。'
    return createCompletion(
      {
        role: 'assistant',
        content: wasRejected ? '你已拒绝发送邮件，邮件未发送。' : '邮件工具已执行，审批流程完成。',
      },
      'stop',
    )
  }

  return createCompletion(
    {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          id: \`call-tool-approval-\${++approvalRun}\`,
          index: 0,
          type: 'function',
          function: {
            name: 'send_email',
            arguments: JSON.stringify({
              to: 'team@example.com',
              subject: '周报',
              body: '本周工作进展请查收。',
            }),
          },
        },
      ],
    },
    'tool_calls',
  )
}

const getTools = async (): Promise<Tool[]> => [
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: '发送邮件，需要用户确认。',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  },
]

const message = useMessage({
  initialMessages: [
    {
      role: 'assistant',
      content: '示例会自动发起一次邮件工具调用，请在工具卡片中选择是否执行。',
    },
  ],
  responseProvider,
  plugins: [
    toolPlugin({
      getTools,
      callTool: async () => '邮件已发送。',
      shouldPauseToolCall: (toolCall) => toolCall.function.name === 'send_email',
      toolCallAwaitingApprovalContent: '发送邮件前需要确认。',
      toolCallFailedContent: '工具调用已拒绝。',
      persistPausedTurn: false,
    }),
  ],
})

const { messages, sendMessage } = message
const { canStartTurn, isPaused, requestState } = message
const errorMessage = ref('')

const statusText = computed(() => {
  if (errorMessage.value || requestState.value === 'error') {
    return '演示失败，可重新发起'
  }

  if (isPaused.value || requestState.value === 'paused') {
    return '等待你选择允许或拒绝'
  }

  if (requestState.value === 'processing') {
    return '正在处理工具调用'
  }

  if (requestState.value === 'completed') {
    return '审批流程完成，可再次发起'
  }

  return '准备发起审批'
})

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const startApproval = async () => {
  if (!canStartTurn.value) {
    return
  }

  errorMessage.value = ''

  try {
    await sendMessage('请发送本周邮件')
  } catch (error) {
    errorMessage.value = \`演示失败：\${getErrorMessage(error)}\`
  }
}

const handleBubbleEvent = async (event: BubbleEvent) => {
  if (event.name !== 'tool-call:resume' && event.name !== 'tool-call:reject') {
    return
  }

  const payload = event.payload
  if (!payload || typeof payload !== 'object' || !('toolCallId' in payload)) {
    return
  }

  const { toolCallId } = payload as { toolCallId?: unknown }
  if (typeof toolCallId !== 'string' || !toolCallId) {
    return
  }

  const command = event.name === 'tool-call:resume' ? TOOL_RESUME_COMMAND : TOOL_REJECT_COMMAND
  try {
    errorMessage.value = ''
    await message.dispatchCommand(command, { toolCallId })
  } catch (error) {
    errorMessage.value = \`审批处理失败：\${getErrorMessage(error)}\`
  }
}

onMounted(() => {
  void startApproval()
})
<\/script>

<style scoped>
.tool-approval-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-approval-demo__controls {
  align-items: center;
  display: flex;
  gap: 12px;
}

.tool-approval-demo__status {
  color: #666;
  font-size: 13px;
}

.tool-approval-demo__error {
  color: #c00;
  margin: -8px 0 0;
}

.tool-approval-demo__messages {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  height: clamp(260px, 60vh, 420px);
  overflow: hidden;
}

.tool-approval-demo__messages :deep(.tr-bubble-list) {
  height: 100%;
}
</style>
`,Y=`<template>
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
`,Q=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble :content="codeMessage" :avatar="aiAvatar" :fallback-content-renderer="CodeBlockRenderer"></tr-bubble>
    <tr-bubble :content="normalMessage" :avatar="aiAvatar"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble, useMessageContent } from '@opentiny/tiny-robot'
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineComponent, h } from 'vue'

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
`,H=`<template>
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
`,$=`<script setup lang="ts">
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
`,K=`<template>
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
`,ee=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { BubbleRenderers, TrBubble, TrBubbleProvider } from '@opentiny/tiny-robot'
import type { BubbleErrorInfo } from '@opentiny/tiny-robot'

const error = ref<BubbleErrorInfo | null>({
  message: '请求失败，请稍后重试',
  code: 'REQUEST_FAILED',
})

const state = computed(() => ({ error: error.value }))

const toggleError = () => {
  error.value = error.value
    ? null
    : {
        message: '请求失败，请稍后重试',
        code: 'REQUEST_FAILED',
      }
}
<\/script>

<template>
  <div class="error-demo">
    <button type="button" @click="toggleError">
      {{ error ? '清除错误' : '模拟请求失败' }}
    </button>

    <tr-bubble-provider :error-renderer="BubbleRenderers.Error">
      <tr-bubble role="assistant" content="已生成的部分回答" :state="state" />
    </tr-bubble-provider>
  </div>
</template>

<style scoped>
.error-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
</style>
`,te=`<template>
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
`,ne=`<template>
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
`,se=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="autoScroll" />
        启用自动滚动
      </label>
      <button @click="addMessage">添加消息</button>
      <button :disabled="isImageLoading" @click="loadAsyncImage">
        {{ isImageLoading ? '图片加载中…' : '模拟图片异步加载' }}
      </button>
    </div>

    <div
      class="scroll-container"
      style="height: 300px; border: 1px solid #ddd; border-radius: 4px; overflow-y: auto; padding: 8px"
    >
      <tr-bubble-list :messages="messages" :role-configs="roles" :auto-scroll="autoScroll" style="max-height: 100%">
        <template #after="{ messages: groupMessages }">
          <div
            v-for="message in getAsyncMessages(groupMessages)"
            :key="message.id"
            class="async-content"
            :class="{ 'async-content--end': message.role === 'user' }"
          >
            <template v-if="getImageStatus(message) === 'loaded'">
              <img
                class="async-image"
                :src="earthriseImageUrl"
                alt="从月球地平线上升起的地球"
                @error="setImageStatus(message, 'error')"
              />
              <div class="async-caption">
                <strong>Earthrise · Apollo 8</strong>
                <span>NASA / Bill Anders，1968</span>
              </div>
            </template>
            <div v-else class="async-status">
              {{ getImageStatus(message) === 'loading' ? '图片加载中…' : '图片加载失败' }}
            </div>
          </div>
        </template>
      </tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h, onBeforeUnmount, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const autoScroll = ref(true)
type ImageStatus = 'loading' | 'loaded' | 'error'
type Message = BubbleListProps['messages'][number]

const imageStatuses = ref<Record<string, ImageStatus>>({})
const earthriseImageUrl =
  'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/climate/2023/12/August-2013_1920x1200.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1200&w=1920'
const isImageLoading = computed(() => Object.values(imageStatuses.value).some((status) => status === 'loading'))

const messages = ref<BubbleListProps['messages']>([
  { id: 'message-1', role: 'user', content: '请展示一张经典的太空照片。' },
  { id: 'message-2', role: 'ai', content: '当然，这是 Apollo 8 拍摄的 Earthrise：' },
])

const getImageStatus = (message: Message) => (message.id ? imageStatuses.value[message.id] : undefined)
const getAsyncMessages = (groupMessages: BubbleListProps['messages']) =>
  groupMessages.filter((message) => getImageStatus(message))
const setImageStatus = (message: Message, status: ImageStatus) => {
  if (message.id) {
    imageStatuses.value[message.id] = status
  }
}

const roles: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}

let messageCount = 2

const addMessage = () => {
  messageCount++
  const role = messageCount % 2 === 0 ? 'ai' : 'user'
  messages.value.push({ id: \`message-\${messageCount}\`, role, content: \`第 \${messageCount} 条消息\` })
}

const imageTimers = new Map<string, number>()

const loadAsyncImage = () => {
  const message = messages.value.at(-1)
  const messageId = message?.id
  if (!message || !messageId) {
    return
  }

  setImageStatus(message, 'loading')
  const timer = window.setTimeout(() => {
    setImageStatus(message, 'loaded')
    imageTimers.delete(messageId)
  }, 500)
  imageTimers.set(messageId, timer)
}

onBeforeUnmount(() => imageTimers.forEach((timer) => window.clearTimeout(timer)))
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

.async-content {
  width: min(240px, 100%);
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid var(--tr-color-border);
  border-radius: 8px;
  background: var(--tr-color-bg-1);
}

.async-content--end {
  margin-left: auto;
}

.async-image {
  display: block;
  width: 100%;
  height: auto;
}

.async-status,
.async-caption {
  padding: 10px 12px;
  font-size: 12px;
}

.async-status {
  color: var(--tr-color-text-secondary);
}

.async-caption {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.async-caption span {
  color: var(--tr-color-text-secondary);
}
</style>
`,ae=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
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
`,ie=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      满足「contentRenderMode 为 split 且组内只有 1 条消息」时，数组 content 的每一项会单独渲染为一个 box； 否则在同一
      box 内渲染。下例中第一个气泡满足该条件（单条消息 + 数组 content + split），故出现多个 box。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles" content-render-mode="split"></tr-bubble-list>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
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
`,oe=`<template>
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
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleMessage, BubbleMessageGroup, BubbleRoleConfig } from '@opentiny/tiny-robot'
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
`,le=`<template>
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
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
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
`,de=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import type { BubbleListProps, BubbleRoleConfig } from '@opentiny/tiny-robot'
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
`,re=`<template>
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
`,pe=`<template>
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
`,ce=`<template>
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
`,he=`<template>
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
`,ue=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <p><strong>纯图片</strong></p>
      <tr-bubble :content="images" :avatar="aiAvatar"></tr-bubble>
    </div>

    <div>
      <p><strong>图片在前、文本在后</strong></p>
      <tr-bubble :content="imageFirst" :avatar="aiAvatar" content-render-mode="single"></tr-bubble>
    </div>

    <div>
      <p><strong>文本在前、图片在后</strong></p>
      <tr-bubble :content="textFirst" :avatar="aiAvatar" content-render-mode="single"></tr-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const images = [
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-1/400/300' } },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-2/400/300' } },
]

const imageFirst = [
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-3/400/300' } },
  { type: 'text', text: '图片后的文本与图片显示在同一个气泡中。' },
]

const textFirst = [
  { type: 'text', text: '文本后的图片也显示在同一个气泡中。' },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-4/400/300' } },
]
<\/script>
`,be=`<template>
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
`,ke=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <button :disabled="streaming" @click="resetStreamContent">
      {{ streaming ? '正在输出…' : '点击展示流式文本' }}
    </button>
    <tr-bubble :content="streamContent" :avatar="aiAvatar" />
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, onBeforeUnmount, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const fullText = '这是一段流式输出的文本内容。'
const streamContent = ref('点击上方按钮开始流式输出文本')
const streaming = ref(false)
let runId = 0

const resetStreamContent = async () => {
  const currentRunId = ++runId
  streaming.value = true
  streamContent.value = ''
  for (const char of fullText) {
    if (currentRunId !== runId) return
    streamContent.value += char
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (currentRunId === runId) streaming.value = false
}

onBeforeUnmount(() => {
  runId += 1
})
<\/script>
`,ge=`<template>
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
`,ye=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="形状: rounded" placement="start" shape="rounded"></tr-bubble>
    <tr-bubble content="形状: corner" placement="start" shape="corner"></tr-bubble>
    <tr-bubble content="形状: none" placement="start" shape="none"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,me=`<template>
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
`,Ee=`<template>
  <tr-bubble content="TinyRobot 可以帮助你构建聊天和 AI 对话界面。"></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,Ae=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),ve={name:"components/bubble.md"},Fe=Object.assign(ve,{setup(Ce){const m=u();d(async()=>{m.value=(await r(async()=>{const{default:a}=await import("./chunks/tool-approval.BijLFZf1.js");return{default:a}},__vite__mapDeps([0,1,2,3]))).default});const E=u();d(async()=>{E.value=(await r(async()=>{const{default:a}=await import("./chunks/state-change.B5BWhrLb.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const v=u();d(async()=>{v.value=(await r(async()=>{const{default:a}=await import("./chunks/custom-renderer.CyUa6ql-.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const C=u();d(async()=>{C.value=(await r(async()=>{const{default:a}=await import("./chunks/custom-composite-renderer.DdDPAcf_.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const B=u();d(async()=>{B.value=(await r(async()=>{const{default:a}=await import("./chunks/tools.C6HXGb_S.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const f=u();d(async()=>{f.value=(await r(async()=>{const{default:a}=await import("./chunks/reasoning.BUzBaW1H.js");return{default:a}},__vite__mapDeps([8,2,1]))).default});const A=u();d(async()=>{A.value=(await r(async()=>{const{default:a}=await import("./chunks/error.DvxDkR9U.js");return{default:a}},__vite__mapDeps([9,1,2]))).default});const F=u();d(async()=>{F.value=(await r(async()=>{const{default:a}=await import("./chunks/provider-attributes.CL03Zq5E.js");return{default:a}},__vite__mapDeps([10,1,2]))).default});const x=u();d(async()=>{x.value=(await r(async()=>{const{default:a}=await import("./chunks/provider-renderer.By8j_v3p.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const D=u();d(async()=>{D.value=(await r(async()=>{const{default:a}=await import("./chunks/list-auto-scroll.BSttPLEH.js");return{default:a}},__vite__mapDeps([12,2,1]))).default});const _=u();d(async()=>{_.value=(await r(async()=>{const{default:a}=await import("./chunks/list-hidden.CxOH-4eW.js");return{default:a}},__vite__mapDeps([13,1,2]))).default});const R=u();d(async()=>{R.value=(await r(async()=>{const{default:a}=await import("./chunks/list-array-content.Y_LvRGak.js");return{default:a}},__vite__mapDeps([14,1,2]))).default});const T=u();d(async()=>{T.value=(await r(async()=>{const{default:a}=await import("./chunks/list-custom-group.C4Zm_KOM.js");return{default:a}},__vite__mapDeps([15,1,2]))).default});const I=u();d(async()=>{I.value=(await r(async()=>{const{default:a}=await import("./chunks/list-consecutive.DGpS6IYr.js");return{default:a}},__vite__mapDeps([16,1,2]))).default});const w=u();d(async()=>{w.value=(await r(async()=>{const{default:a}=await import("./chunks/list.DaKkj2Ud.js");return{default:a}},__vite__mapDeps([17,1,2]))).default});const S=u();d(async()=>{S.value=(await r(async()=>{const{default:a}=await import("./chunks/schema-render.D-xjFHwZ.js");return{default:a}},__vite__mapDeps([18,2,1]))).default});const W=u();d(async()=>{W.value=(await r(async()=>{const{default:a}=await import("./chunks/slots.DDWwLqzo.js");return{default:a}},__vite__mapDeps([19,1,2]))).default});const M=u();d(async()=>{M.value=(await r(async()=>{const{default:a}=await import("./chunks/content-resolver.BMo0tYk-.js");return{default:a}},__vite__mapDeps([20,1,2]))).default});const P=u();d(async()=>{P.value=(await r(async()=>{const{default:a}=await import("./chunks/content-render-mode.DodaaS8L.js");return{default:a}},__vite__mapDeps([21,1,2]))).default});const Z=u();d(async()=>{Z.value=(await r(async()=>{const{default:a}=await import("./chunks/image.iVBQhv3g.js");return{default:a}},__vite__mapDeps([22,1,2]))).default});const L=u();d(async()=>{L.value=(await r(async()=>{const{default:a}=await import("./chunks/markdown.DoZhLgDD.js");return{default:a}},__vite__mapDeps([23,1,2]))).default});const G=u();d(async()=>{G.value=(await r(async()=>{const{default:a}=await import("./chunks/streaming.CcSrP7K7.js");return{default:a}},__vite__mapDeps([24,1,2]))).default});const q=u();d(async()=>{q.value=(await r(async()=>{const{default:a}=await import("./chunks/loading.Dm8j-pHe.js");return{default:a}},__vite__mapDeps([25,2,1]))).default});const X=u();d(async()=>{X.value=(await r(async()=>{const{default:a}=await import("./chunks/shape.XLWoCFqx.js");return{default:a}},__vite__mapDeps([26,1,2]))).default});const J=u();d(async()=>{J.value=(await r(async()=>{const{default:a}=await import("./chunks/avatar-and-placement.BB8DtWN0.js");return{default:a}},__vite__mapDeps([27,1,2]))).default});const s=j(!0),O=u();return d(async()=>{O.value=(await r(async()=>{const{default:a}=await import("./chunks/basic.kMb3_a98.js");return{default:a}},__vite__mapDeps([28,1,2]))).default}),(a,e)=>{const l=V("ClientOnly");return z(),U("div",null,[e[26]||(e[26]=y('<h1 id="bubble-气泡组件" tabindex="-1">Bubble 气泡组件 <a class="header-anchor" href="#bubble-气泡组件" aria-label="Permalink to &quot;Bubble 气泡组件&quot;">​</a></h1><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><p>Bubble 用于展示单条消息或消息列表，适合聊天、AI 流式回复以及需要自定义内容渲染的场景。它既可以独立展示气泡，也可以通过 <code>BubbleList</code> 和 <code>BubbleProvider</code> 组合管理分组、渲染器与共享配置。</p><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><p>主要解决以下问题：</p><ul><li><strong>消息展示</strong>：支持文本、图片、Markdown 等多种内容类型的渲染</li><li><strong>流式输出</strong>：支持流式文本展示，适用于 AI 对话场景</li><li><strong>消息分组</strong>：支持将连续相同角色的消息合并显示</li><li><strong>自定义渲染</strong>：通过渲染器系统支持自定义内容渲染逻辑</li><li><strong>状态管理</strong>：支持消息状态管理，用于存储 UI 相关的数据</li></ul><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><p>传入 <code>content</code> 即可展示一条使用默认外观的消息。</p>',8)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"基础气泡",description:"使用 content 展示一条默认气泡消息。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{s.value=!1}),vueCode:n(Ee)},h({_:2},[O.value?{name:"vue",fn:i(()=>[t(n(O))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[27]||(e[27]=y('<h3 id="外观与生成状态" tabindex="-1">外观与生成状态 <a class="header-anchor" href="#外观与生成状态" aria-label="Permalink to &quot;外观与生成状态&quot;">​</a></h3><h4 id="头像和位置" tabindex="-1">头像和位置 <a class="header-anchor" href="#头像和位置" aria-label="Permalink to &quot;头像和位置&quot;">​</a></h4><p>通过 <code>avatar</code> 设置自定义头像，通过 <code>placement</code> 设置位置，提供了 <code>start</code>、<code>end</code> 两个选项</p>',3)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"头像和位置",description:"为不同角色配置头像，并使用 placement 控制气泡对齐方向。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{s.value=!1}),vueCode:n(me)},h({_:2},[J.value?{name:"vue",fn:i(()=>[t(n(J))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=y('<h4 id="气泡形状" tabindex="-1">气泡形状 <a class="header-anchor" href="#气泡形状" aria-label="Permalink to &quot;气泡形状&quot;">​</a></h4><p>通过 <code>shape</code> 设置气泡形状。目前提供了 <code>rounded</code>、<code>corner</code> 和 <code>none</code> 三个选项。默认为 <code>corner</code>，可以使用 css 变量来设置圆角</p><ul><li>rounded 形状气泡圆角 <code>--tr-bubble-box-shape-rounded-radius</code></li><li>corner 形状气泡圆角 <code>--tr-bubble-box-shape-corner-radius</code>。这个 CSS 变量只会设置 corner 一个角的圆角，另外3个角则使用的 <code>--tr-bubble-box-shape-rounded-radius</code> 的值</li><li>none 形状气泡圆角 <code>--tr-bubble-box-border-radius</code></li></ul>',3)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"气泡形状",description:"对比 corner、rounded 和 none 三种气泡形状。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{s.value=!1}),vueCode:n(ye)},h({_:2},[X.value?{name:"vue",fn:i(()=>[t(n(X))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=o("h4",{id:"加载状态",tabindex:"-1"},[g("加载状态 "),o("a",{class:"header-anchor",href:"#加载状态","aria-label":'Permalink to "加载状态"'},"​")],-1)),e[30]||(e[30]=o("p",null,[g("通过 "),o("code",null,"loading"),g(" 设置加载中状态")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"加载状态",description:"使用 loading 展示消息生成前的等待状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{s.value=!1}),vueCode:n(ge)},h({_:2},[q.value?{name:"vue",fn:i(()=>[t(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=o("h4",{id:"流式文本",tabindex:"-1"},[g("流式文本 "),o("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[32]||(e[32]=o("p",null,[o("code",null,"content"),g(" 属性是响应式的，动态设置 "),o("code",null,"content"),g(" 即可实现流式文本")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"流式文本",description:"持续更新响应式 content，模拟 AI 回复逐步生成的过程。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{s.value=!1}),vueCode:n(ke)},h({_:2},[G.value?{name:"vue",fn:i(()=>[t(n(G))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[33]||(e[33]=y('<h3 id="内容类型与解析" tabindex="-1">内容类型与解析 <a class="header-anchor" href="#内容类型与解析" aria-label="Permalink to &quot;内容类型与解析&quot;">​</a></h3><h4 id="渲染-markdown" tabindex="-1">渲染 Markdown <a class="header-anchor" href="#渲染-markdown" aria-label="Permalink to &quot;渲染 Markdown&quot;">​</a></h4><p>Bubble 提供 <code>BubbleRenderers.Markdown</code> 渲染器。使用前需要在应用中安装 <code>markdown-it</code> 和 <code>dompurify</code>；单个 Bubble 可以通过 <code>fallback-content-renderer</code> 配置，列表或组件树则推荐由 <code>BubbleProvider</code> 统一配置。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> markdown-it</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dompurify</span></span></code></pre></div>',4)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"Markdown 内容",description:"配置 Markdown 渲染器展示格式化文本。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{s.value=!1}),vueCode:n(be)},h({_:2},[L.value?{name:"vue",fn:i(()=>[t(n(L))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=y('<h4 id="图片渲染" tabindex="-1">图片渲染 <a class="header-anchor" href="#图片渲染" aria-label="Permalink to &quot;图片渲染&quot;">​</a></h4><p>Bubble 组件支持渲染图片内容。当 <code>content</code> 为数组且包含 <code>type: &#39;image_url&#39;</code> 的内容项时，会自动使用 Image 渲染器。</p><p>图文混合时，可以通过 <code>contentRenderMode</code> 控制渲染方式：</p><ul><li><code>&#39;single&#39;</code> 模式：文本和图片在同一个 box 中渲染</li><li><code>&#39;split&#39;</code> 模式：每个内容项（文本或图片）单独一个 box</li></ul>',4)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"图片与图文混排",description:"使用固定的公开图片展示多图，以及图片位于文本前后的混合内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{s.value=!1}),vueCode:n(ue)},h({_:2},[Z.value?{name:"vue",fn:i(()=>[t(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=y('<h4 id="内容渲染模式" tabindex="-1">内容渲染模式 <a class="header-anchor" href="#内容渲染模式" aria-label="Permalink to &quot;内容渲染模式&quot;">​</a></h4><p>通过 <code>contentRenderMode</code> 设置内容渲染模式：</p><ul><li><code>&#39;single&#39;</code>（默认）：所有内容在一个 box 中渲染</li><li><code>&#39;split&#39;</code>：当 <code>content</code> 为数组时，每个内容项单独一个 box</li></ul>',3)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"内容渲染模式",description:"对比 single 与 split 模式处理数组内容时的布局差异。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{s.value=!1}),vueCode:n(he)},h({_:2},[P.value?{name:"vue",fn:i(()=>[t(n(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[36]||(e[36]=y('<blockquote><p><strong>注意</strong>：<code>&#39;single&#39;</code> 模式会将所有内容在一个 box 中渲染（默认）。<code>&#39;split&#39;</code> 模式会在 <code>content</code> 为数组时，将每个内容项单独一个 box 渲染。</p></blockquote><h4 id="内容解析器" tabindex="-1">内容解析器 <a class="header-anchor" href="#内容解析器" aria-label="Permalink to &quot;内容解析器&quot;">​</a></h4><p>通过 <code>contentResolver</code> 可以自定义内容解析逻辑，用于从消息的其他字段提取内容。</p>',3)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"自定义内容解析",description:"使用 contentResolver 从消息的自定义字段中提取展示内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{s.value=!1}),vueCode:n(ce)},h({_:2},[M.value?{name:"vue",fn:i(()=>[t(n(M))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[37]||(e[37]=y('<blockquote><p><strong>注意</strong>：默认情况下，组件使用 <code>message.content</code> 作为内容。如果需要自定义内容解析逻辑（例如从其他字段提取内容），可以通过 <code>contentResolver</code> 属性传入自定义函数。</p></blockquote><h4 id="插槽扩展" tabindex="-1">插槽扩展 <a class="header-anchor" href="#插槽扩展" aria-label="Permalink to &quot;插槽扩展&quot;">​</a></h4><p>气泡组件提供了多个插槽，分别是 <code>prefix</code> 插槽, <code>suffix</code> 插槽、<code>content-footer</code> 插槽 和 <code>after</code> 插槽</p>',3)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"插槽扩展",description:"通过 prefix、suffix、content-footer 和 after 插槽扩展气泡区域。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{s.value=!1}),vueCode:n(pe)},h({_:2},[W.value?{name:"vue",fn:i(()=>[t(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[38]||(e[38]=o("h4",{id:"schema-卡片渲染",tabindex:"-1"},[g("Schema 卡片渲染 "),o("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "Schema 卡片渲染"'},"​")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"Schema 卡片渲染",description:"将结构化消息匹配到自定义卡片渲染器。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22schema-render.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-render.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Cp%20style%3D%5C%22font-size%3A%2012px%3B%20color%3A%20%23666%3B%20margin%3A%200%5C%22%3E%E4%BD%BF%E7%94%A8%20Markdown%20%E6%B8%B2%E6%9F%93%E5%99%A8%E6%B8%B2%E6%9F%93%E8%BF%90%E8%A1%8C%E6%97%B6%E7%BB%84%E4%BB%B6%EF%BC%88WebComponent%EF%BC%89%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-provider%20%3Astore%3D%5C%22bubbleStore%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%20%20%20%20%3Acontent%3D%5C%22mdContent%5C%22%5Cn%20%20%20%20%20%20%20%20%3Afallback-content-renderer%3D%5C%22BubbleRenderers.Markdown%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRenderers%2C%20TrBubble%2C%20TrBubbleProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineCustomElement%2C%20h%2C%20reactive%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20SchemaCard%20from%20'.%2Fschema-card.ce.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20bubbleStore%20%3D%20reactive(%7B%5Cn%20%20mdConfig%3A%20%7B%20html%3A%20true%20%7D%2C%5Cn%20%20dompurifyConfig%3A%20%7B%20ADD_TAGS%3A%20%5B'schema-card'%5D%2C%20ADD_ATTR%3A%20%5B'schema'%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20ref(%5Cn%20%20JSON.stringify(%7B%5Cn%20%20%20%20componentName%3A%20'Page'%2C%5Cn%20%20%20%20children%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Text'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%96%87%E6%9C%AC'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Button'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%8C%89%E9%92%AE'%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B3%A8%E5%86%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E5%85%83%E7%B4%A0%5Cnif%20(!customElements.get('schema-card'))%20%7B%5Cn%20%20const%20CardElement%20%3D%20defineCustomElement(SchemaCard)%5Cn%20%20customElements.define('schema-card'%2C%20CardElement)%5Cn%7D%5Cn%5Cnconst%20mdContent%20%3D%20%60%23%20Markdown%20%E6%A0%87%E9%A2%98%5Cn%5Cn**%E5%8A%A0%E7%B2%97%E6%96%87%E6%9C%AC**%5Cn%5Cn%3Cschema-card%20schema%3D'%24%7BschemaObj.value%7D'%3E%3C%2Fschema-card%3E%5Cn%60%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22schema-card.ce.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-card.ce.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cschema-renderer%20%3Aschema%3D%5C%22schemaObj%5C%22%3E%3C%2Fschema-renderer%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20SchemaRenderer%20from%20'%40opentiny%2Ftiny-schema-renderer'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cnconst%20props%20%3D%20defineProps(%7B%5Cn%20%20schema%3A%20%7B%5Cn%20%20%20%20type%3A%20String%2C%5Cn%20%20%20%20required%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20return%20JSON.parse(props.schema)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%3Cstyle%3E%5Cn%40import%20url('%40opentiny%2Fvue-theme%2Findex.css')%3B%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{s.value=!1}),vueCode:n(re)},h({_:2},[S.value?{name:"vue",fn:i(()=>[t(n(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[39]||(e[39]=o("h3",{id:"bubblelist-列表与分组",tabindex:"-1"},[g("BubbleList 列表与分组 "),o("a",{class:"header-anchor",href:"#bubblelist-列表与分组","aria-label":'Permalink to "BubbleList 列表与分组"'},"​")],-1)),e[40]||(e[40]=o("h4",{id:"基础列表",tabindex:"-1"},[g("基础列表 "),o("a",{class:"header-anchor",href:"#基础列表","aria-label":'Permalink to "基础列表"'},"​")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"基础消息列表",description:"使用 BubbleList 按角色配置连续的聊天消息。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{s.value=!1}),vueCode:n(de)},h({_:2},[w.value?{name:"vue",fn:i(()=>[t(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[41]||(e[41]=o("h4",{id:"分组策略",tabindex:"-1"},[g("分组策略 "),o("a",{class:"header-anchor",href:"#分组策略","aria-label":'Permalink to "分组策略"'},"​")],-1)),e[42]||(e[42]=o("p",null,[g("BubbleList 支持多种分组策略。分组时，连续的 "),o("code",null,"hidden"),g(" 消息会归为同一组。")],-1)),e[43]||(e[43]=o("p",null,[o("strong",null,"连续分组（consecutive）")],-1)),e[44]||(e[44]=o("p",null,"连续相同角色的消息会被合并为一组。",-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"连续角色分组",description:"将相邻且角色相同的消息合并为一组。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{s.value=!1}),vueCode:n(le)},h({_:2},[I.value?{name:"vue",fn:i(()=>[t(n(I))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[45]||(e[45]=o("p",null,[o("strong",null,"自定义分组函数")],-1)),e[46]||(e[46]=o("p",null,"可以通过自定义函数实现更灵活的分组逻辑。",-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"自定义分组",description:"使用分组函数按应用规则组织消息。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{s.value=!1}),vueCode:n(oe)},h({_:2},[T.value?{name:"vue",fn:i(()=>[t(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[47]||(e[47]=y("<p><strong>数组内容的展示</strong></p><p>当消息的 <code>content</code> 为数组时，每一项的渲染方式由 <code>contentRenderMode</code> 与<strong>当前组的消息条数</strong>共同决定：</p><ul><li>若 <code>contentRenderMode</code> 为 <code>&#39;split&#39;</code> <strong>且</strong> 当前组仅包含 1 条消息，则数组的每一项会单独渲染为一个 box。</li><li>若不满足上述条件（例如为 <code>&#39;single&#39;</code> 模式，或组内有多条消息），则不会按数组项拆成多个 box，所有内容在同一 box 内渲染。</li></ul><p>下方示例中，第一个气泡为单条消息且 <code>content</code> 为数组、<code>contentRenderMode=&quot;split&quot;</code>，因此出现多个 box；其余气泡为单条消息且 <code>content</code> 为字符串，或组内有多条消息，因此每个气泡一个 box。</p>",4)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"列表中的数组内容",description:"观察分组数量与 contentRenderMode 共同决定数组内容的渲染方式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{s.value=!1}),vueCode:n(ie)},h({_:2},[R.value?{name:"vue",fn:i(()=>[t(n(R))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[48]||(e[48]=o("h4",{id:"隐藏角色",tabindex:"-1"},[g("隐藏角色 "),o("a",{class:"header-anchor",href:"#隐藏角色","aria-label":'Permalink to "隐藏角色"'},"​")],-1)),e[49]||(e[49]=o("p",null,[g("角色配置中使用 "),o("code",null,"hidden"),g(" 来隐藏这个角色的所有消息")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"隐藏指定角色",description:"通过角色配置隐藏不需要展示的消息。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{s.value=!1}),vueCode:n(ae)},h({_:2},[_.value?{name:"vue",fn:i(()=>[t(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[50]||(e[50]=o("h4",{id:"自动滚动",tabindex:"-1"},[g("自动滚动 "),o("a",{class:"header-anchor",href:"#自动滚动","aria-label":'Permalink to "自动滚动"'},"​")],-1)),e[51]||(e[51]=o("p",null,[g("通过 "),o("code",null,"autoScroll"),g(" 属性启用自动跟随。BubbleList 会观察实际渲染内容的尺寸；图片、Markdown、自定义渲染器等异步内容增高时，只要仍处于跟随状态，就会继续滚动到底部。")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"消息列表自动滚动",description:"添加消息或异步加载固定的外部图片时，观察列表在接近底部时的自动跟随。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[16]||(e[16]=()=>{s.value=!1}),vueCode:n(se)},h({_:2},[D.value?{name:"vue",fn:i(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[52]||(e[52]=y(`<blockquote><p><strong>注意</strong>：自动跟随遵循以下规则：</p><ol><li>用户向上滚动并离开底部后，自动跟随会暂停，避免打断阅读。</li><li>用户重新滚动到底部后，自动跟随会恢复。</li><li><code>autoScroll</code> 支持响应式切换；关闭时暂停自动行为，再次开启时会恢复此前保留的跟随意图。</li><li>当最后一条消息的 <code>role</code> 为 <code>&#39;user&#39;</code> 时，会使用平滑滚动（<code>smooth</code>）滚动到底部，确保用户能立即看到自己发送的内容。</li></ol></blockquote><h4 id="useautoscroll" tabindex="-1">useAutoScroll <a class="header-anchor" href="#useautoscroll" aria-label="Permalink to &quot;useAutoScroll&quot;">​</a></h4><p><code>useAutoScroll</code> 是 BubbleList 内部使用的公开组合式函数。新代码推荐使用对象参数，并分别传入滚动容器和承载全部内容的内部元素：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { useAutoScroll } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ref } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> scrollRef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">HTMLElement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> contentRef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">HTMLElement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> enabled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">scrollToBottom</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">arrivedState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useAutoScroll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  scrollRef,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  contentRef,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  enabled,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  scrollOnMount: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  scrollThrottle: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bottomThreshold: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><table tabindex="0"><thead><tr><th>参数</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>scrollRef</code></td><td><code>MaybeComputedElementRef</code></td><td>—</td><td>产生滚动条的容器元素。</td></tr><tr><td><code>contentRef</code></td><td><code>MaybeComputedElementRef</code></td><td>—</td><td>滚动容器内承载全部内容的元素；其尺寸变化用于触发自动跟随。</td></tr><tr><td><code>enabled</code></td><td><code>MaybeRefOrGetter&lt;boolean&gt;</code></td><td><code>true</code></td><td>是否启用自动跟随，支持响应式切换。</td></tr><tr><td><code>scrollOnMount</code></td><td><code>boolean</code></td><td><code>true</code></td><td>挂载时是否滚动到底部。</td></tr><tr><td><code>scrollThrottle</code></td><td><code>number</code></td><td><code>0</code></td><td>滚动事件节流时间，单位为毫秒。</td></tr><tr><td><code>bottomThreshold</code></td><td><code>number</code></td><td><code>20</code></td><td>判断是否接近底部的距离阈值，单位为像素。</td></tr></tbody></table><table tabindex="0"><thead><tr><th>返回值</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>scrollToBottom</code></td><td><code>(behavior?: ScrollBehavior) =&gt; Promise&lt;void&gt;</code></td><td>命令式滚动到底部；不受 <code>enabled</code> 限制。</td></tr><tr><td><code>arrivedState</code></td><td><code>UseScrollReturn[&#39;arrivedState&#39;]</code></td><td>当前是否到达各滚动边界的响应式状态。</td></tr></tbody></table><p>旧的位置参数签名仍为兼容性保留，但已弃用：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">useAutoScroll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(scrollRef, source, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  contentTarget: contentRef,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 其他滚动配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>其中 <code>source</code> 是旧版业务数据变化信号。新代码应使用对象参数和 <code>contentRef</code>，让自动滚动由实际 UI 尺寸变化驱动。</p><h3 id="渲染器架构与扩展" tabindex="-1">渲染器架构与扩展 <a class="header-anchor" href="#渲染器架构与扩展" aria-label="Permalink to &quot;渲染器架构与扩展&quot;">​</a></h3><p>Bubble 组件采用渲染器架构，支持灵活的内容渲染和自定义扩展。渲染器系统分为两种类型：</p><ul><li><strong>Box 渲染器</strong>：用于渲染消息的外层容器（box），控制气泡的样式和布局</li><li><strong>Content 渲染器</strong>：用于渲染消息的具体内容，如文本、图片、Markdown 等</li></ul><h4 id="渲染器匹配机制" tabindex="-1">渲染器匹配机制 <a class="header-anchor" href="#渲染器匹配机制" aria-label="Permalink to &quot;渲染器匹配机制&quot;">​</a></h4><p>渲染器通过匹配规则来选择，匹配过程如下：</p><ol><li>按照优先级排序所有匹配规则（<code>priority</code> 值越小优先级越高）</li><li>依次执行每个规则的 <code>find</code> 函数，找到第一个返回 <code>true</code> 的规则</li><li>使用该规则对应的渲染器</li><li>如果没有匹配到任何规则，使用 fallback 渲染器</li></ol><h4 id="渲染器配置层级" tabindex="-1">渲染器配置层级 <a class="header-anchor" href="#渲染器配置层级" aria-label="Permalink to &quot;渲染器配置层级&quot;">​</a></h4><p>渲染器配置支持三个层级，优先级从高到低：</p><ol><li><strong>Prop 级别</strong>：通过 <code>Bubble</code> 的 <code>fallback-box-renderer</code> 和 <code>fallback-content-renderer</code> 属性配置，只对当前组件生效</li><li><strong>Provider 级别</strong>：通过 <code>BubbleProvider</code> 的 <code>box-renderer-matches</code>、<code>content-renderer-matches</code>、 <code>fallback-box-renderer</code> 和 <code>fallback-content-renderer</code> 属性配置，在整个组件树中生效</li><li><strong>Default 级别</strong>：内置的默认渲染器和匹配规则</li></ol><p><strong>设置 Fallback 渲染器</strong></p><p>当无法匹配到合适的渲染器时，会使用 fallback 渲染器。上面的<a href="#渲染-markdown">渲染 markdown 示例</a>中，就是通过 <code>fallback-content-renderer</code> 属性设置的 <code>BubbleRenderers.Markdown</code> 渲染器。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-bubble</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mdContent</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fallback-content-renderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">BubbleRenderers.Markdown</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-bubble</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h4 id="通过-bubbleprovider-配置渲染器" tabindex="-1">通过 BubbleProvider 配置渲染器 <a class="header-anchor" href="#通过-bubbleprovider-配置渲染器" aria-label="Permalink to &quot;通过 BubbleProvider 配置渲染器&quot;">​</a></h4><p><code>BubbleProvider</code> 组件提供了 <code>box-renderer-matches</code> 和 <code>content-renderer-matches</code> 属性，用于设置渲染器匹配规则。通过 BubbleProvider 配置的渲染器会在整个组件树中生效，适合全局配置。</p>`,23)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"Provider 渲染器配置",description:"在 BubbleProvider 中配置匹配规则，让整个组件树复用自定义渲染器。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[17]||(e[17]=()=>{s.value=!1}),vueCode:n(ne)},h({_:2},[x.value?{name:"vue",fn:i(()=>[t(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[53]||(e[53]=y('<h4 id="通过-bubbleprovider-统一注入-attributes" tabindex="-1">通过 BubbleProvider 统一注入 attributes <a class="header-anchor" href="#通过-bubbleprovider-统一注入-attributes" aria-label="Permalink to &quot;通过 BubbleProvider 统一注入 attributes&quot;">​</a></h4><p>除了配置渲染器，<code>BubbleProvider</code> 还支持通过 <code>box-attributes</code> 和 <code>content-attributes</code> 为 Box / Content 统一注入 attributes。</p><ul><li><code>box-attributes</code> 的作用域是一个 Box，对应参数为 <code>(messages, content, contentIndex)</code></li><li><code>content-attributes</code> 的作用域是单个 Content，对应参数为 <code>(message, content, contentIndex)</code></li><li>两个属性都支持传入静态对象，或返回 attributes 的函数</li></ul><p>适合用于统一添加 <code>data-*</code> 标记、埋点字段、测试选择器等通用属性，而不需要依赖所有消息都匹配某个自定义渲染器。</p>',4)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"Provider Attributes",description:"统一为 Box 和 Content 注入 data 属性，并与匹配规则中的 attributes 合并。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[18]||(e[18]=()=>{s.value=!1}),vueCode:n(te)},h({_:2},[F.value?{name:"vue",fn:i(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[54]||(e[54]=y('<blockquote><p><code>BubbleProvider</code> 注入的 attributes 会在对应的 Box / Content 上统一生效；如果某个匹配规则本身也配置了 <code>attributes</code>，会在 Provider attributes 的基础上继续合并。</p></blockquote><h4 id="渲染器匹配优先级" tabindex="-1">渲染器匹配优先级 <a class="header-anchor" href="#渲染器匹配优先级" aria-label="Permalink to &quot;渲染器匹配优先级&quot;">​</a></h4><p>匹配规则可以使用 <code>priority</code> 属性来设置优先级，值越小优先级越高。系统提供了以下优先级常量：</p><ul><li><p><code>BubbleRendererMatchPriority.LOADING</code>: -1</p><p>通常基于 <code>message.loading</code> 判断，用于加载状态渲染器。例如：<code>{ loading: true }</code></p></li><li><p><code>BubbleRendererMatchPriority.NORMAL</code>: 0</p><p>普通渲染器的默认优先级。未设置优先级时，默认使用该优先级</p></li><li><p><code>BubbleRendererMatchPriority.CONTENT</code>: 10</p><p>通常基于 <code>message.content</code> 判断。例如：<code>{ content: [{ type: &#39;image_url&#39;, image_url: &#39;xxx&#39; }] }</code></p></li><li><p><code>BubbleRendererMatchPriority.ROLE</code>: 20</p><p>通常基于 <code>message.role</code> 判断。例如：<code>{ role: &#39;tool&#39; }</code></p></li></ul><blockquote><p><strong>注意</strong>：渲染器匹配时，优先级数值越小优先级越高。自定义渲染器应该根据匹配条件选择合适的优先级。</p></blockquote><h4 id="内置渲染器" tabindex="-1">内置渲染器 <a class="header-anchor" href="#内置渲染器" aria-label="Permalink to &quot;内置渲染器&quot;">​</a></h4><p>组件内置了以下渲染器，可以通过 <code>BubbleRenderers</code> 访问：</p><ul><li><code>BubbleRenderers.Box</code> - 默认 Box 渲染器</li><li><code>BubbleRenderers.Text</code> - 文本内容渲染器（默认 Content 渲染器）</li><li><code>BubbleRenderers.Image</code> - 图片渲染器</li><li><code>BubbleRenderers.Markdown</code> - Markdown 渲染器</li><li><code>BubbleRenderers.Loading</code> - 加载状态渲染器</li><li><code>BubbleRenderers.Reasoning</code> - 推理内容渲染器</li><li><code>BubbleRenderers.Tool</code> - 单个工具调用渲染器</li><li><code>BubbleRenderers.Tools</code> - 工具调用列表渲染器</li><li><code>BubbleRenderers.ToolRole</code> - 工具角色消息渲染器</li><li><code>BubbleRenderers.Error</code> - 消息级错误渲染器</li></ul><p>错误渲染器默认关闭。需要根据 <code>message.state.error</code> 渲染内置错误视图时，通过 <code>BubbleProvider</code> 显式启用：</p>',9)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"错误消息",description:"显式启用内置 Error 渲染器，并重复切换消息级错误状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[19]||(e[19]=()=>{s.value=!1}),vueCode:n(ee)},h({_:2},[A.value?{name:"vue",fn:i(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[55]||(e[55]=o("p",null,[g("自定义错误渲染器接收 "),o("code",null,"{ message }"),g("，不接收 "),o("code",null,"contentIndex"),g("。省略 "),o("code",null,"errorRenderer"),g(" 或传入 "),o("code",null,"null"),g(" 时，不渲染独立的消息级错误视图。")],-1)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"推理内容渲染器",description:"使用内置 Reasoning 渲染器展示可展开的推理内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[20]||(e[20]=()=>{s.value=!1}),vueCode:n(K)},h({_:2},[f.value?{name:"vue",fn:i(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"工具调用渲染器",description:"使用内置 Tool 与 Tools 渲染器展示工具调用状态和结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[21]||(e[21]=()=>{s.value=!1}),vueCode:n($)},h({_:2},[B.value?{name:"vue",fn:i(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[56]||(e[56]=y(`<h4 id="实现自定义渲染器" tabindex="-1">实现自定义渲染器 <a class="header-anchor" href="#实现自定义渲染器" aria-label="Permalink to &quot;实现自定义渲染器&quot;">​</a></h4><p><strong>Content 渲染器</strong></p><p>Content 渲染器接收 <code>BubbleContentRendererProps</code> 作为 props，包含 <code>message</code> 和 <code>contentIndex</code>。最简单的渲染器只需要消费当前消息内容，并把外部传入的 attributes 绑定到自己的根节点上。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!-- CustomContentRenderer.vue --&gt;</span></span>
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
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>当一个渲染器会拆出部分字段单独渲染，同时还要继续渲染剩余内容时，可以实现为复合渲染器。典型场景是 <code>reasoning_content + content</code> 或 <code>tool_calls + content</code>：</p><ul><li>使用 <code>useOmitMessageFields(props, fields)</code> 从消息中剥离已经消费的字段，避免递归时再次命中同一个渲染器</li><li>使用 <code>useBubbleContentRenderer(restMessage, contentIndex)</code> 为剩余消息重新选择渲染器</li><li>内部递归渲染时传入 <code>renderer.attributes</code>，保证 <code>BubbleProvider</code> / match 注入的 attributes 不丢失</li><li>多根节点组件需要 <code>inheritAttrs: false</code>，并把 <code>$attrs</code> 显式绑定到当前渲染器真正代表的 DOM 节点上</li></ul><p>下方示例中，<code>contentAttributes</code> 使用函数形式，并根据 <code>message.reasoning_content</code> 分发不同属性；match 的 <code>attributes</code> 会落到自定义推理块上，递归渲染普通 <code>content</code> 时会重新计算并传递新的 <code>contentAttributes</code>。</p>`,7)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"复合内容渲染器",description:"拆分推理字段并递归渲染剩余内容，同时保留 Provider 注入的 attributes。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22custom-composite-renderer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fcustom-composite-renderer.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-provider%20%3Acontent-renderer-matches%3D%5C%22contentRendererMatches%5C%22%20%3Acontent-attributes%3D%5C%22contentAttributes%5C%22%3E%5Cn%20%20%20%20%3Ctr-bubble%5Cn%20%20%20%20%20%20content%3D%5C%22%E6%9C%80%E7%BB%88%E7%AD%94%E6%A1%88%EF%BC%9A1%20%2B%201%20%E5%9C%A8%E4%BA%8C%E8%BF%9B%E5%88%B6%E4%B8%AD%E7%AD%89%E4%BA%8E%2010%E3%80%82%5C%22%5Cn%20%20%20%20%20%20reasoning_content%3D%5C%22%E5%85%88%E6%8C%89%E5%8D%81%E8%BF%9B%E5%88%B6%E7%90%86%E8%A7%A3%201%20%2B%201%20%3D%202%EF%BC%8C%E5%86%8D%E6%8A%8A%202%20%E8%BD%AC%E6%88%90%E4%BA%8C%E8%BF%9B%E5%88%B6%EF%BC%8C%E7%BB%93%E6%9E%9C%E6%98%AF%2010%E3%80%82%5C%22%5Cn%20%20%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3C%2Ftr-bubble-provider%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%5Cn%20%20BubbleRendererMatchPriority%2C%5Cn%20%20type%20BubbleContentAttributesConfig%2C%5Cn%20%20type%20BubbleContentRendererMatch%2C%5Cn%20%20TrBubble%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20markRaw%20%7D%20from%20'vue'%5Cnimport%20RecursiveReasoningRenderer%20from%20'.%2FRecursiveReasoningRenderer.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20contentRendererMatches%3A%20BubbleContentRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(message)%20%3D%3E%20typeof%20message.reasoning_content%20%3D%3D%3D%20'string'%2C%5Cn%20%20%20%20renderer%3A%20markRaw(RecursiveReasoningRenderer)%2C%5Cn%20%20%20%20priority%3A%20BubbleRendererMatchPriority.NORMAL%20-%201%2C%5Cn%20%20%20%20attributes%3A%20%7B%20'data-renderer'%3A%20'custom-recursive-reasoning'%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20contentAttributes%3A%20BubbleContentAttributesConfig%20%3D%20(message%2C%20content%2C%20contentIndex)%20%3D%3E%20%7B%5Cn%20%20const%20isReasoning%20%3D%20typeof%20message.reasoning_content%20%3D%3D%3D%20'string'%20%26%26%20message.reasoning_content%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20'data-demo-kind'%3A%20isReasoning%20%3F%20'reasoning'%20%3A%20'content'%2C%5Cn%20%20%20%20'data-role'%3A%20message.role%20%7C%7C%20'assistant'%2C%5Cn%20%20%20%20'data-content-type'%3A%20content.type%2C%5Cn%20%20%20%20'data-content-index'%3A%20contentIndex%2C%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22RecursiveReasoningRenderer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2FRecursiveReasoningRenderer.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20type%20BubbleContentRendererProps%2C%20useBubbleContentRenderer%2C%20useOmitMessageFields%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5CndefineOptions(%7B%5Cn%20%20inheritAttrs%3A%20false%2C%5Cn%7D)%5Cn%5Cnconst%20props%20%3D%20defineProps%3CBubbleContentRendererProps%3E()%5Cn%5Cnconst%20%7B%20restMessage%2C%20restProps%20%7D%20%3D%20useOmitMessageFields(props%2C%20%5B'reasoning_content'%5D)%5Cnconst%20renderer%20%3D%20useBubbleContentRenderer(restMessage%2C%20props.contentIndex)%5Cn%5Cnconst%20recursiveProps%20%3D%20computed(()%20%3D%3E%20(%7B%5Cn%20%20...renderer.value.attributes%2C%5Cn%20%20...restProps.value%2C%5Cn%7D))%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22custom-reasoning%5C%22%20data-type%3D%5C%22custom-reasoning%5C%22%20v-bind%3D%5C%22%24attrs%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22custom-reasoning__title%5C%22%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8E%A8%E7%90%86%E8%BF%87%E7%A8%8B%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22custom-reasoning__content%5C%22%3E%7B%7B%20props.message.reasoning_content%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%20%20%3Ccomponent%20%3Ais%3D%5C%22renderer.renderer%5C%22%20v-bind%3D%5C%22recursiveProps%5C%22%20%2F%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.custom-reasoning%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20padding-left%3A%2010px%3B%5Cn%20%20border-left%3A%202px%20solid%20%238b5cf6%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%7D%5Cn%5Cn.custom-reasoning__title%20%7B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20font-weight%3A%20600%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%7D%5Cn%5Cn.custom-reasoning__content%20%7B%5Cn%20%20margin%3A%204px%200%200%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20line-height%3A%2020px%3B%5Cn%20%20white-space%3A%20pre-wrap%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[22]||(e[22]=()=>{s.value=!1}),vueCode:n(H)},h({_:2},[C.value?{name:"vue",fn:i(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[57]||(e[57]=y(`<p><strong>Box 渲染器示例</strong></p><p>Box 渲染器接收 <code>BubbleBoxRendererProps</code> 作为 props，包含 <code>placement</code> 和 <code>shape</code>，并通过插槽渲染内容。</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { BubbleBoxRendererProps } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defineProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleBoxRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;custom-box&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data-placement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">placement</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data-shape</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">slot</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;"> /</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p><strong>配置自定义渲染器</strong></p><p>配置自定义渲染器有两种方式：</p><p><strong>方式一：通过 BubbleProvider 配置匹配规则</strong>（推荐用于全局配置）</p><p>前文的 <a href="#通过-bubbleprovider-配置渲染器">Provider 渲染器配置</a> 已展示全局匹配规则的完整接入方式。</p><p><strong>方式二：通过 fallback 属性配置</strong>（用于单个组件）</p>`,8)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"Fallback 渲染器",description:"为单个 Bubble 配置自定义 fallback Box 与 Content 渲染器。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[23]||(e[23]=()=>{s.value=!1}),vueCode:n(Q)},h({_:2},[v.value?{name:"vue",fn:i(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[58]||(e[58]=y(`<p><strong>注意事项</strong></p><ul><li>使用 <code>markRaw</code> 包装渲染器组件，避免 Vue 的响应式处理</li><li>为了不修改源数据内部内容和结构，UI 相关的数据应放在消息的 <code>state</code> 属性中</li><li>Box 渲染器的 <code>find</code> 函数签名：<code>(messages, content, contentIndex, context) =&gt; boolean</code>。Box 仅包含一条消息时，single 模式下的 <code>content</code> 为第一项、<code>contentIndex</code> 为 <code>0</code>，split 模式下则为当前项及其索引；需要判断完整内容时，使用 <code>context.resolvedMessageContent</code></li><li>Content 渲染器的 <code>find</code> 函数签名：<code>(message, content, contentIndex) =&gt; boolean</code>，<code>content</code> 为统一化后的 <code>ChatMessageContentItem</code></li><li>在 Content 渲染器中可使用 <code>useMessageContent(props)</code> 获取当前 <code>content</code> 和 <code>contentText</code>，以正确处理 <code>contentIndex</code> 与数组内容</li><li>多根节点或复合渲染器应使用 <code>inheritAttrs: false</code>，并显式决定 <code>$attrs</code> 绑定到哪个节点；不要把同一份 attributes 复制到多个兄弟节点上，避免重复 <code>id</code>、ARIA 或测试选择器</li></ul><h3 id="交互与状态管理" tabindex="-1">交互与状态管理 <a class="header-anchor" href="#交互与状态管理" aria-label="Permalink to &quot;交互与状态管理&quot;">​</a></h3><p>如果你希望在 Bubble 内部（例如自定义 Content 渲染器中）向外通知交互行为，可以使用 <code>useBubbleEventFn()</code> 触发 <code>bubble-event</code>。事件会从当前渲染器逐层透传到外层的 <code>Bubble</code> / <code>BubbleList</code>，应用可以统一监听并处理。</p><p>Bubble 也支持通过 <code>state</code> 属性存储 UI 相关的数据，例如展开状态、点赞状态等。这些状态不会写入消息内容本身，适合放置只影响渲染表现的交互数据。</p><p>Bubble 内部统一通过 <code>bubble-event</code> 抛出渲染器交互事件。状态变化本身也是一种特定事件，事件名为 <code>state:update</code>；对于常见的 UI 状态更新场景，可以使用 <code>useBubbleStateChangeFn()</code> 这个便捷 API，它会自动触发 <code>name</code> 为 <code>state:update</code> 的 <code>bubble-event</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> handleStateChange</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useBubbleStateChangeFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">handleStateChange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;expanded&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><p>这等价于发出：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> emitBubbleEvent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useBubbleEventFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">emitBubbleEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;state:update&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  payload: { key: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;expanded&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, value: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>外层 <code>Bubble</code> / <code>BubbleList</code> 会收到 <code>bubble-event</code>；当事件名为 <code>state:update</code> 时，还会额外触发 <code>state-change</code> 这个便捷事件，应用可以直接在事件回调中把新的 <code>key</code> / <code>value</code> 同步回消息的 <code>state</code>。</p><p>如果渲染器需要抛出不直接修改 UI 状态的普通交互事件，可以使用 <code>useBubbleEventFn()</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> emitBubbleEvent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useBubbleEventFn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">emitBubbleEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;demo:apply-to-input&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  payload: { text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;...&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>组件内置的部分渲染器也会使用同一事件机制触发状态更新，例如 Reasoning 渲染器的展开/收起、Tool 渲染器的详情展开/收起。</p>`,13)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"状态更新与事件透传",description:"从渲染器发出 bubble-event，并由外层同步 state:update 产生的新状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[24]||(e[24]=()=>{s.value=!1}),vueCode:n(Y)},h({_:2},[E.value?{name:"vue",fn:i(()=>[t(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[59]||(e[59]=y('<blockquote><p><strong>注意</strong>：<code>state-change</code> 是针对 <code>bubble-event</code> 中 <code>state:update</code> 提供的便捷事件，只负责通知外部更新 UI 状态。若状态没有同步回传给消息的 <code>state</code> 属性，渲染器下一次渲染时不会保留该状态。</p></blockquote><h3 id="工具调用确认" tabindex="-1">工具调用确认 <a class="header-anchor" href="#工具调用确认" aria-label="Permalink to &quot;工具调用确认&quot;">​</a></h3><p>该示例只使用 Bubble 和 <code>@opentiny/tiny-robot-kit</code>。页面加载后会自动发起一次模拟工具调用；完成允许或拒绝后，还可以点击“再次发起审批”重复演示。消息列表会在限定高度的区域内滚动，顶部操作区始终保持可见。</p>',3)),p(t(n(b),null,null,512),[[c,s.value]]),t(l,null,{default:i(()=>[t(n(k),{title:"确认工具调用",description:"工具等待执行时，用户可以允许或拒绝本次调用。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[25]||(e[25]=()=>{s.value=!1}),vueCode:n(N)},h({_:2},[m.value?{name:"vue",fn:i(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[60]||(e[60]=y(`<p>如果应用使用 <code>toolPlugin</code>，可以将它加入 <code>useMessage</code> 的 <code>plugins</code>，并通过 <code>shouldPauseToolCall</code> 控制哪些工具需要用户确认：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND, toolPlugin, useMessage } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-kit&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  responseProvider,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugins: [</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    toolPlugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      getTools,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      callTool,</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 根据工具名称、参数或用户权限决定是否需要确认</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      shouldPauseToolCall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">toolCall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> toolCall.function.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;send_email&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>当 <code>shouldPauseToolCall</code> 返回 <code>true</code> 时，kit 会将工具状态设置为 <code>awaiting-approval</code>，Bubble 的 Tool 渲染器会显示“允许”和“拒绝”按钮。应用监听 <code>bubble-event</code> 后，将对应的 <code>toolCallId</code> 转发给 kit：</p><ul><li>当工具状态为 <code>awaiting-approval</code> 且存在有效的工具调用 ID 时，点击“允许”会让 Tool 渲染器触发 <code>tool-call:resume</code>，payload 为 <code>{ toolCallId: string }</code>；Bubble 不会执行工具，也不会自行修改工具状态。</li><li>当工具状态为 <code>awaiting-approval</code> 且存在有效的工具调用 ID 时，点击“拒绝”会让 Tool 渲染器触发 <code>tool-call:reject</code>，payload 同样为 <code>{ toolCallId: string }</code>；Bubble 不会自行拒绝工具调用。</li><li>应用必须把 <code>toolCallId</code> 和对应命令传给 <code>message.dispatchCommand</code>（或当前会话的 <code>engine.dispatchCommand</code>）。kit 随后负责执行工具或标记为 <code>denied</code>，更新 tool 消息，并继续当前回合。</li><li>应用负责处理命令的异步错误，并根据需要展示处理中、成功或失败状态。</li></ul><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (event.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;tool-call:resume&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;tool-call:reject&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> payload</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event.payload</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">payload </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> payload </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;object&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;toolCallId&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> payload)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">toolCallId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> payload </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">toolCallId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> toolCallId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!==</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;string&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">toolCallId) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> command</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event.name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;tool-call:resume&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ?</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> TOOL_RESUME_COMMAND</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> :</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> TOOL_REJECT_COMMAND</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> message.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dispatchCommand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(command, { toolCallId })</span></span></code></pre></div><p>如果使用 <code>useConversation</code>，事件处理方式相同，只需要将命令发送给当前会话的引擎：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> activeConversation.value?.engine.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dispatchCommand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(command, { toolCallId })</span></span></code></pre></div><p>更详细的 <code>toolPlugin</code> 配置和命令说明，请参考 <a href="./../tools/message.html">工具插件 API</a>。</p><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="公开导出" tabindex="-1">公开导出 <a class="header-anchor" href="#公开导出" aria-label="Permalink to &quot;公开导出&quot;">​</a></h3><table tabindex="0"><thead><tr><th>导出</th><th>用途</th></tr></thead><tbody><tr><td><code>TrBubble</code> / <code>Bubble</code></td><td>展示单个消息或消息组</td></tr><tr><td><code>TrBubbleList</code> / <code>BubbleList</code></td><td>分组并展示消息列表，提供自动滚动方法</td></tr><tr><td><code>TrBubbleProvider</code> / <code>BubbleProvider</code></td><td>为后代 Bubble 统一配置渲染器、attributes、错误渲染器与共享存储</td></tr><tr><td><code>BubbleRenderers</code></td><td>内置 Box、Text、Image、Markdown、Loading、Reasoning、Tool、Tools、ToolRole、Error 渲染器集合</td></tr><tr><td><code>BubbleRendererMatchPriority</code></td><td>内置匹配优先级常量：<code>LOADING</code>、<code>NORMAL</code>、<code>CONTENT</code>、<code>ROLE</code></td></tr></tbody></table><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><h4 id="bubble" tabindex="-1">Bubble <a class="header-anchor" href="#bubble" aria-label="Permalink to &quot;Bubble&quot;">​</a></h4><p>单个气泡的属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>role</code></td><td>气泡角色标识；在 BubbleList 中用于分组并关联 <code>role-configs</code></td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>content</code></td><td>气泡内容</td><td><code>ChatMessageContent</code></td><td>—</td><td>否</td></tr><tr><td><code>reasoning_content</code></td><td>推理内容，供内置 Reasoning 渲染器读取</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>tool_calls</code></td><td>工具调用列表，供内置 Tool 渲染器读取</td><td><code>ToolCall[]</code></td><td>—</td><td>否</td></tr><tr><td><code>tool_call_id</code></td><td>当前工具结果关联的工具调用 ID</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>name</code></td><td>消息名称</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>id</code></td><td>消息标识</td><td><code>string</code></td><td>—</td><td>否</td></tr><tr><td><code>loading</code></td><td>显示加载状态</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>state</code></td><td>渲染器使用的 UI 状态；组件不会自行持久化外部更新</td><td><code>Record&lt;string, unknown&gt;</code></td><td>—</td><td>否</td></tr><tr><td><code>hidden</code></td><td>隐藏整个气泡</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr><tr><td><code>avatar</code></td><td>气泡头像的 Vue 节点或组件</td><td><code>VNode | Component</code></td><td>—</td><td>否</td></tr><tr><td><code>placement</code></td><td>气泡在容器起始侧或结束侧对齐</td><td><code>&#39;start&#39; | &#39;end&#39;</code></td><td><code>&#39;start&#39;</code></td><td>否</td></tr><tr><td><code>shape</code></td><td>气泡外形</td><td><code>&#39;corner&#39; | &#39;rounded&#39; | &#39;none&#39;</code></td><td><code>&#39;corner&#39;</code></td><td>否</td></tr><tr><td><code>content-render-mode</code></td><td><code>single</code> 把内容放入一个 box；<code>split</code> 为数组中的每个内容项创建独立 box</td><td><code>&#39;single&#39; | &#39;split&#39;</code></td><td><code>&#39;single&#39;</code></td><td>否</td></tr><tr><td><code>content-resolver</code></td><td>在选择渲染器前解析消息内容</td><td><code>(message: BubbleMessage) =&gt; ChatMessageContent | undefined</code></td><td><code>(message) =&gt; message.content</code></td><td>否</td></tr><tr><td><code>fallback-box-renderer</code></td><td>没有匹配规则时使用的 box 渲染器</td><td><code>Component&lt;BubbleBoxRendererProps&gt;</code></td><td>内置默认渲染器</td><td>否</td></tr><tr><td><code>fallback-content-renderer</code></td><td>没有匹配规则时使用的内容渲染器</td><td><code>Component&lt;BubbleContentRendererProps&gt;</code></td><td>内置默认渲染器</td><td>否</td></tr></tbody></table><h4 id="bubblelist" tabindex="-1">BubbleList <a class="header-anchor" href="#bubblelist" aria-label="Permalink to &quot;BubbleList&quot;">​</a></h4><p>气泡列表组件的属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>messages</code></td><td>消息数组</td><td><code>BubbleMessage[]</code></td><td>—</td><td>是</td></tr><tr><td><code>group-strategy</code></td><td>按相邻角色、分隔角色或自定义函数分组</td><td><code>&#39;consecutive&#39; | &#39;divider&#39; | ((messages: BubbleMessage[], dividerRole?: string) =&gt; BubbleMessageGroup[])</code></td><td><code>&#39;divider&#39;</code></td><td>否</td></tr><tr><td><code>divider-role</code></td><td><code>divider</code> 策略中需要单独成组的角色</td><td><code>string</code></td><td><code>&#39;user&#39;</code></td><td>否</td></tr><tr><td><code>fallback-role</code></td><td>消息缺少角色或角色为空时使用的角色</td><td><code>string</code></td><td><code>&#39;assistant&#39;</code></td><td>否</td></tr><tr><td><code>role-configs</code></td><td>按角色提供头像、位置、形状、隐藏状态与 fallback 渲染器</td><td><code>Record&lt;string, BubbleRoleConfig&gt;</code></td><td>—</td><td>否</td></tr><tr><td><code>content-render-mode</code></td><td>统一设置列表中 Bubble 的内容渲染模式</td><td><code>BubbleProps[&#39;contentRenderMode&#39;]</code></td><td>—</td><td>否</td></tr><tr><td><code>content-resolver</code></td><td>统一设置列表中 Bubble 的内容解析函数</td><td><code>BubbleProps[&#39;contentResolver&#39;]</code></td><td><code>(message) =&gt; message.content</code></td><td>否</td></tr><tr><td><code>auto-scroll</code></td><td>根据实际渲染内容尺寸自动跟随底部；异步内容增高时继续跟随，用户向上滚动时暂停，回到底部后恢复；支持响应式切换</td><td><code>boolean</code></td><td><code>false</code></td><td>否</td></tr></tbody></table><h4 id="bubbleprovider" tabindex="-1">BubbleProvider <a class="header-anchor" href="#bubbleprovider" aria-label="Permalink to &quot;BubbleProvider&quot;">​</a></h4><p>气泡提供者组件的属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>说明</th><th>类型</th><th>默认值</th><th>必填</th></tr></thead><tbody><tr><td><code>box-renderer-matches</code></td><td>在内置规则之前参与排序和匹配的 box 渲染器规则</td><td><code>BubbleBoxRendererMatch[]</code></td><td><code>[]</code></td><td>否</td></tr><tr><td><code>content-renderer-matches</code></td><td>在内置规则之前参与排序和匹配的内容渲染器规则</td><td><code>BubbleContentRendererMatch[]</code></td><td><code>[]</code></td><td>否</td></tr><tr><td><code>box-attributes</code></td><td>注入 box 的静态 attributes 或 resolver</td><td><code>BubbleBoxAttributesConfig</code></td><td>—</td><td>否</td></tr><tr><td><code>content-attributes</code></td><td>注入内容节点的静态 attributes 或 resolver</td><td><code>BubbleContentAttributesConfig</code></td><td>—</td><td>否</td></tr><tr><td><code>fallback-box-renderer</code></td><td>没有规则匹配时使用的 box 渲染器</td><td><code>Component&lt;BubbleBoxRendererProps&gt;</code></td><td>内置默认渲染器</td><td>否</td></tr><tr><td><code>fallback-content-renderer</code></td><td>没有规则匹配时使用的内容渲染器</td><td><code>Component&lt;BubbleContentRendererProps&gt;</code></td><td>内置默认渲染器</td><td>否</td></tr><tr><td><code>error-renderer</code></td><td>消息级错误渲染器；省略或传入 <code>null</code> 时关闭</td><td><code>Component&lt;BubbleErrorRendererProps&gt; | null</code></td><td>—</td><td>否</td></tr><tr><td><code>store</code></td><td>在同一 Provider 下为渲染器共享的数据</td><td><code>Record&lt;string, unknown&gt;</code></td><td><code>{}</code></td><td>否</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><h4 id="bubble-与-bubblelist-events" tabindex="-1">Bubble 与 BubbleList Events <a class="header-anchor" href="#bubble-与-bubblelist-events" aria-label="Permalink to &quot;Bubble 与 BubbleList Events&quot;">​</a></h4><table tabindex="0"><thead><tr><th>事件名</th><th>触发时机</th><th>回调参数</th></tr></thead><tbody><tr><td><code>state-change</code></td><td>渲染器发出 <code>state:update</code> 后触发；组件只通知下一状态，应用需要把值同步回消息的 <code>state</code></td><td><code>(payload: { key: string; value: unknown; messageIndex: number; contentIndex: number }) =&gt; void</code></td></tr><tr><td><code>bubble-event</code></td><td>渲染器发出任意 Bubble 事件时触发；<code>state:update</code> 还会额外派发 <code>state-change</code></td><td><code>(payload: BubbleEvent &amp; { messageIndex: number; contentIndex: number }) =&gt; void</code></td></tr></tbody></table><p><code>bubble-event</code> 允许自定义事件名。内置渲染器会使用以下事件：</p><table tabindex="0"><thead><tr><th>内置事件名</th><th><code>payload</code> 类型</th><th>说明</th></tr></thead><tbody><tr><td><code>state:update</code></td><td><code>{ key: string; value: unknown }</code></td><td>请求应用更新消息的 <code>state</code>；组件随后额外触发 <code>state-change</code>，不会自行持久化状态。</td></tr><tr><td><code>tool-call:resume</code></td><td><code>{ toolCallId: string }</code></td><td>Tool 处于 <code>awaiting-approval</code> 时点击“允许”触发；应用需转发 <code>TOOL_RESUME_COMMAND</code>。</td></tr><tr><td><code>tool-call:reject</code></td><td><code>{ toolCallId: string }</code></td><td>Tool 处于 <code>awaiting-approval</code> 时点击“拒绝”触发；应用需转发 <code>TOOL_REJECT_COMMAND</code>。</td></tr></tbody></table><p><code>bubble-event</code> 的回调参数还包含 <code>messageIndex</code> 和 <code>contentIndex</code>。工具审批事件只负责通知应用，Bubble 不会执行工具、拒绝调用或修改工具状态；请由 <code>toolPlugin</code> / <code>useMessage</code>（或会话引擎）处理对应命令。</p><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><h4 id="bubble-slots" tabindex="-1">Bubble Slots <a class="header-anchor" href="#bubble-slots" aria-label="Permalink to &quot;Bubble Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>prefix</code></td><td>在气泡主体前添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string }</code></td></tr><tr><td><code>suffix</code></td><td>在气泡主体后添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string }</code></td></tr><tr><td><code>after</code></td><td>在气泡内容区域之后添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string }</code></td></tr><tr><td><code>content-footer</code></td><td>在每个内容 box 的底部添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string; contentIndex?: number }</code></td></tr></tbody></table><h4 id="bubblelist-slots" tabindex="-1">BubbleList Slots <a class="header-anchor" href="#bubblelist-slots" aria-label="Permalink to &quot;BubbleList Slots&quot;">​</a></h4><table tabindex="0"><thead><tr><th>插槽名</th><th>用途</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>prefix</code></td><td>在分组气泡主体前添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }</code></td></tr><tr><td><code>suffix</code></td><td>在分组气泡主体后添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }</code></td></tr><tr><td><code>after</code></td><td>在分组气泡内容区域之后添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string; messageIndexes: number[] }</code></td></tr><tr><td><code>content-footer</code></td><td>在每个内容 box 的底部添加内容</td><td><code>{ messages: BubbleMessage[]; role?: string; contentIndex?: number; messageIndexes: number[] }</code></td></tr></tbody></table><h3 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h3><h4 id="bubblelist-methods" tabindex="-1">BubbleList Methods <a class="header-anchor" href="#bubblelist-methods" aria-label="Permalink to &quot;BubbleList Methods&quot;">​</a></h4><table tabindex="0"><thead><tr><th>方法</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><code>scrollToBottom</code></td><td><code>(behavior?: ScrollBehavior) =&gt; Promise&lt;void&gt;</code></td><td><code>BubbleList</code> 滚动到底部。传入 <code>&#39;smooth&#39;</code> 可平滑滚动；即使 <code>autoScroll</code> 已关闭也可以调用。</td></tr></tbody></table><h3 id="composables" tabindex="-1">Composables <a class="header-anchor" href="#composables" aria-label="Permalink to &quot;Composables&quot;">​</a></h3><p>以下组合式函数均从 <code>@opentiny/tiny-robot</code> 导入。渲染器相关函数必须在 <code>Bubble</code>、<code>BubbleList</code> 或 <code>BubbleProvider</code> 建立的组件树中使用；缺少对应注入时会回退到默认渲染器、空存储或警告函数。</p><table tabindex="0"><thead><tr><th>函数</th><th>用途</th><th>签名或返回值</th></tr></thead><tbody><tr><td><code>useBubbleBoxRenderer</code></td><td>按当前消息组、内容索引和 Provider 配置选择 Box 渲染器</td><td><code>(messages: MaybeRefOrGetter&lt;BubbleMessage[]&gt;, contentIndex?: number) =&gt; ComputedRef&lt;{ renderer: Component; attributes?: BubbleAttributes }&gt;</code></td></tr><tr><td><code>useBubbleContentRenderer</code></td><td>按当前消息和内容索引选择 Content 渲染器</td><td><code>(message: MaybeRefOrGetter&lt;BubbleMessage&gt;, contentIndex: number) =&gt; ComputedRef&lt;{ renderer: Component; attributes?: BubbleAttributes }&gt;</code></td></tr><tr><td><code>useBubbleErrorRenderer</code></td><td>读取 Provider 中配置的消息级错误渲染器</td><td><code>() =&gt; ComputedRef&lt;Component&lt;BubbleErrorRendererProps&gt; | null | undefined&gt;</code></td></tr><tr><td><code>useBubbleEventFn</code></td><td>在自定义渲染器中向外层发出 <code>BubbleEvent</code></td><td><code>() =&gt; (event: BubbleEvent) =&gt; void</code></td></tr><tr><td><code>useBubbleStateChangeFn</code></td><td>发出名称为 <code>state:update</code> 的状态事件</td><td><code>() =&gt; (key: string, value: unknown) =&gt; void</code></td></tr><tr><td><code>useMessageContent</code></td><td>按 <code>contentResolver</code> 与 <code>contentIndex</code> 取得标准化内容项和文本</td><td><code>(props: Readonly&lt;BubbleContentRendererProps&gt;) =&gt; { content: ComputedRef&lt;ChatMessageContentItem&gt;; contentText: ComputedRef&lt;string&gt; }</code></td></tr><tr><td><code>useOmitMessageFields</code></td><td>从响应式消息中排除已由复合渲染器消费的字段，返回剩余消息与 Props</td><td><code>&lt;P extends BubbleContentRendererProps, K extends keyof BubbleMessage&gt;(props: P, fields: K[]) =&gt; { restMessage: ComputedRef&lt;Omit&lt;BubbleMessage, K&gt;&gt;; restProps: ComputedRef&lt;P&gt; }</code></td></tr><tr><td><code>useToolCall</code></td><td>读取指定工具调用、Provider 中的结果和当前 UI 状态</td><td><code>(props: BubbleContentRendererProps &amp; { toolCallIndex: number }) =&gt; { toolCall; toolCallWithResult; state }</code></td></tr><tr><td><code>useAutoScroll</code></td><td>监听滚动容器与内容尺寸，在用户仍处于跟随状态时滚动到底部</td><td><code>(options: UseAutoScrollOptions) =&gt; UseAutoScrollReturn</code></td></tr></tbody></table><p><code>useAutoScroll</code> 的 <code>enabled</code> 接受普通值、Ref 或 Getter，并会持续跟踪变化。组合式函数使用 <code>ResizeObserver</code>、<code>requestAnimationFrame</code> 和全局键盘监听，仅适用于浏览器环境；卸载时会清理动画帧、监听器和内部 watch。<code>scrollToBottom()</code> 是命令式操作，不受 <code>enabled</code> 限制。旧位置参数签名由 <code>LegacyUseAutoScrollOptions</code> 描述，已弃用。</p><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><p>以下类型均从 <code>@opentiny/tiny-robot</code> 导出。</p><h4 id="推荐类型" tabindex="-1">推荐类型 <a class="header-anchor" href="#推荐类型" aria-label="Permalink to &quot;推荐类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类别 / 用途</th><th>说明</th></tr></thead><tbody><tr><td><code>BubbleProps</code></td><td>组件属性</td><td>单个 Bubble 的属性</td></tr><tr><td><code>BubbleListProps</code></td><td>组件属性</td><td>BubbleList 的属性</td></tr><tr><td><code>BubbleProviderProps</code></td><td>Provider 属性</td><td>BubbleProvider 的属性</td></tr><tr><td><code>BubbleSlots</code></td><td>组件插槽</td><td>Bubble 插槽</td></tr><tr><td><code>BubbleListSlots</code></td><td>组件插槽</td><td>BubbleList 插槽</td></tr><tr><td><code>BubbleMessage</code></td><td>消息数据</td><td>消息基础类型</td></tr><tr><td><code>BubbleErrorInfo</code></td><td>错误数据</td><td>消息错误信息</td></tr><tr><td><code>BubbleErrorRendererProps</code></td><td>渲染器属性</td><td>消息级错误渲染器接收的属性</td></tr><tr><td><code>BubbleMessageGroup</code></td><td>分组数据</td><td>BubbleList 分组结果</td></tr><tr><td><code>ChatMessageContent</code></td><td>内容数据</td><td>字符串或内容项数组</td></tr><tr><td><code>ChatMessageContentItem</code></td><td>内容数据</td><td>带 <code>type</code> 的可扩展内容项</td></tr><tr><td><code>ToolCall</code></td><td>工具调用数据</td><td>OpenAI 风格工具调用</td></tr><tr><td><code>BubbleRoleConfig</code></td><td>角色配置</td><td>BubbleList 的角色默认配置</td></tr><tr><td><code>BubbleAttributes</code></td><td>渲染器属性映射</td><td>渲染器 attributes 基础映射</td></tr><tr><td><code>BubbleBoxRendererContext</code></td><td>渲染器上下文</td><td>Box 渲染器匹配时的完整内容上下文</td></tr><tr><td><code>BubbleBoxRendererAttributeMap</code></td><td>渲染器属性映射</td><td>Box 渲染器 attributes 映射</td></tr><tr><td><code>BubbleBoxRendererAttributesResolver</code></td><td>渲染器回调</td><td>动态 Box 匹配规则 attributes 解析函数</td></tr><tr><td><code>BubbleBoxAttributesResolver</code></td><td>Provider 回调</td><td>动态 Provider Box attributes 解析函数</td></tr><tr><td><code>BubbleContentAttributesResolver</code></td><td>Provider 回调</td><td>动态 Provider Content attributes 解析函数</td></tr><tr><td><code>BubbleBoxAttributesConfig</code></td><td>Provider 配置</td><td>静态或动态 Box attributes 配置</td></tr><tr><td><code>BubbleContentAttributesConfig</code></td><td>Provider 配置</td><td>静态或动态 Content attributes 配置</td></tr><tr><td><code>BubbleBoxRendererMatch</code></td><td>渲染器配置</td><td>Box 渲染器匹配规则</td></tr><tr><td><code>BubbleContentRendererMatch</code></td><td>渲染器配置</td><td>Content 渲染器匹配规则</td></tr><tr><td><code>BubbleBoxRendererProps</code></td><td>渲染器属性</td><td>自定义 Box 渲染器接收的属性</td></tr><tr><td><code>BubbleContentRendererProps</code></td><td>渲染器属性</td><td>自定义 Content 渲染器接收的属性</td></tr><tr><td><code>BubbleEvent</code></td><td>事件数据</td><td>渲染器向 Bubble 发出的事件</td></tr><tr><td><code>UseAutoScrollOptions</code></td><td>组合式函数参数</td><td>自动滚动对象参数</td></tr><tr><td><code>UseAutoScrollReturn</code></td><td>组合式函数返回值</td><td>自动滚动的动作与边界状态</td></tr></tbody></table><h4 id="已弃用类型" tabindex="-1">已弃用类型 <a class="header-anchor" href="#已弃用类型" aria-label="Permalink to &quot;已弃用类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>类型名</th><th>类别 / 用途</th><th>说明</th></tr></thead><tbody><tr><td><code>LegacyUseAutoScrollOptions</code></td><td>组合式函数参数</td><td>已弃用的自动滚动位置参数配置</td></tr></tbody></table><h4 id="类型定义" tabindex="-1">类型定义 <a class="header-anchor" href="#类型定义" aria-label="Permalink to &quot;类型定义&quot;">​</a></h4><p>以下为 <code>BubbleMessage</code> 公开结构的完整等价展开：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  S</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  role</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  reasoning_content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tool_calls</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ToolCall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  tool_call_id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  loading</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  state</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> S</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>以下为 <code>BubbleErrorInfo</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleErrorInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  code</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  details</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>以下为 <code>BubbleErrorRendererProps</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleErrorRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>以下为 <code>ChatMessageContent</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span></code></pre></div><p>以下为 <code>ChatMessageContentItem</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [key: string]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>type</code></td><td><code>string</code></td><td>消息类型，用于选择对应的渲染器</td></tr><tr><td><code>[key: string]</code></td><td><code>any</code></td><td>其他字段可自由扩展，用于携带消息所需的自定义数据</td></tr></tbody></table><p>以下为 <code>ToolCall</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ToolCall</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;function&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  function</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    arguments</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [x: string]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>以下为 <code>BubbleRoleConfig</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleRoleConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Pick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  BubbleProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;avatar&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;placement&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;shape&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;hidden&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;fallbackBoxRenderer&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;fallbackContentRenderer&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>以下代码块给出 <code>BubbleBoxRendererContext</code> 与 <code>BubbleBoxRendererMatch</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererContext</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  contentRenderMode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;single&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;split&#39;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  resolvedMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  find</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[],</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  renderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleBoxRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  priority</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  attributes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererAttributeMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererAttributesResolver</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ul><li><code>content</code>: Box 仅包含一条消息时传入；single 模式为解析后内容的第一项，split 模式为当前索引对应的内容项。Box 包含多条消息时为 <code>undefined</code></li><li><code>contentIndex</code>: Box 仅包含一条消息时传入；single 模式为 <code>0</code>，split 模式为当前索引。Box 包含多条消息时为 <code>undefined</code></li><li><code>context</code>: 仅传给 <code>find</code>；<code>contentRenderMode</code> 表示当前 Box 的渲染模式，<code>resolvedMessageContent</code> 是单条消息经 <code>contentResolver</code> 解析后的完整内容。Box 包含多条消息时为 <code>undefined</code></li></ul><p>以下为 <code>BubbleContentRendererMatch</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleContentRendererMatch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  find</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContentItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  renderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleContentRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  priority</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  attributes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleAttributes</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ul><li><code>content</code>: 当前消息经 <code>contentResolver</code> 解析并统一化后的内容项；若为数组则取 <code>contentIndex</code> 对应项，若为字符串则转为 <code>{ type: &#39;text&#39;, text: string }</code></li><li><code>contentIndex</code>: 内容索引，字符串解析时为 0</li></ul><p>以下为 <code>BubbleBoxRendererProps</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleBoxRendererProps</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Pick</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">BubbleProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;placement&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;shape&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>以下为 <code>BubbleContentRendererProps</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleContentRendererProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessageContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  S</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">S</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  contentIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>以下为 <code>BubbleMessageGroup</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageGroup</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  role</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messageIndexes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@deprecated</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 自定义分组中的消息可能不连续，使用 startIndex + 局部索引推导全局索引可能出错。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 请以 messageIndexes 作为局部索引到全局索引的映射依据。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  startIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="css-变量" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS Variables {#css-变量}&quot;">​</a></h3><p><strong>Bubble 根元素</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-gap</code></td><td>头像与内容间距</td><td><code>16px</code></td></tr><tr><td><code>--tr-bubble-max-width</code></td><td>气泡最大宽度</td><td><code>80%</code></td></tr><tr><td><code>--tr-bubble-min-width</code></td><td>气泡最小宽度</td><td><code>auto</code></td></tr></tbody></table><p><strong>Box 容器</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-box-bg</code></td><td>Box 背景色</td><td><code>var(--tr-container-bg-default)</code></td></tr><tr><td><code>--tr-bubble-box-padding</code></td><td>Box 内边距</td><td><code>8px 16px</code></td></tr><tr><td><code>--tr-bubble-box-border-radius</code></td><td><code>shape=&quot;none&quot;</code> 等场景使用的基础圆角</td><td><code>0</code></td></tr><tr><td><code>--tr-bubble-box-shadow</code></td><td>Box 阴影</td><td><code>var(--tr-shadow-md)</code></td></tr><tr><td><code>--tr-bubble-box-border</code></td><td>Box 边框</td><td><code>none</code></td></tr><tr><td><code>--tr-bubble-box-shape-rounded-radius</code></td><td><code>rounded</code> 形状圆角，也作为错误视图圆角的默认来源</td><td><code>18px</code></td></tr><tr><td><code>--tr-bubble-box-shape-corner-radius</code></td><td><code>corner</code> 形状的尖角圆角；<code>start</code> 对应左上角，<code>end</code> 对应右上角</td><td><code>4px</code></td></tr><tr><td><code>--tr-bubble-box-image-border-color</code></td><td>纯图片 Box 的边框颜色</td><td><code>transparent</code></td></tr><tr><td><code>--tr-bubble-box-image-border</code></td><td>纯图片 Box 的边框</td><td><code>4px solid var(--tr-bubble-box-image-border-color)</code></td></tr><tr><td><code>--tr-bubble-box-image-padding</code></td><td>纯图片 Box 的内边距</td><td><code>0</code></td></tr></tbody></table><p><strong>Text 文本</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-text-color</code></td><td>文本文字颜色</td><td><code>var(--tr-text-primary)</code></td></tr><tr><td><code>--tr-bubble-text-font-size</code></td><td>文本字号</td><td><code>inherit</code></td></tr><tr><td><code>--tr-bubble-text-line-height</code></td><td>文本行高</td><td><code>1.5</code></td></tr></tbody></table><p><strong>Loading 与错误提示</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-loading-color</code></td><td>加载图标颜色</td><td><code>var(--tr-text-secondary)</code></td></tr><tr><td><code>--tr-bubble-loading-size</code></td><td>加载图标尺寸</td><td><code>24px</code></td></tr><tr><td><code>--tr-bubble-error-color</code></td><td>错误提示文字颜色</td><td><code>color-mix(in srgb, var(--tr-color-error) 70%, var(--tr-text-primary))</code></td></tr><tr><td><code>--tr-bubble-error-bg</code></td><td>错误提示背景色</td><td><code>color-mix(in srgb, var(--tr-color-error) 10%, var(--tr-container-bg-default))</code></td></tr><tr><td><code>--tr-bubble-error-border-radius</code></td><td>错误提示圆角</td><td><code>var(--tr-bubble-box-shape-rounded-radius)</code></td></tr></tbody></table><p><strong>Image 图片</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-image-max-width</code></td><td>图片最大宽度</td><td><code>100%</code></td></tr><tr><td><code>--tr-bubble-image-max-height</code></td><td>图片最大高度</td><td><code>240px</code></td></tr><tr><td><code>--tr-bubble-image-border-radius</code></td><td>图片圆角</td><td><code>2px</code></td></tr><tr><td><code>--tr-bubble-image-space-y</code></td><td>多张图片之间的垂直间距</td><td><code>8px</code></td></tr><tr><td><code>--tr-bubble-image-embedded-border</code></td><td>嵌入其他 Box 时的图片边框</td><td><code>1px solid rgba(0, 0, 0, 0.04)</code></td></tr><tr><td><code>--tr-bubble-image-embedded-border-radius</code></td><td>嵌入其他 Box 时的图片圆角</td><td><code>4px</code></td></tr><tr><td><code>--tr-bubble-image-embedded-margin-block</code></td><td>嵌入其他 Box 时的垂直外边距</td><td><code>4px</code></td></tr></tbody></table><p><strong>Tool 工具调用</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-tool-call-bg</code></td><td>工具调用背景色</td><td><code>var(--tr-container-bg-default-2)</code></td></tr><tr><td><code>--tr-bubble-tool-call-space-y</code></td><td>工具调用之间的垂直间距</td><td><code>8px</code></td></tr><tr><td><code>--tr-bubble-tool-call-min-width</code></td><td>工具调用最小宽度</td><td><code>unset</code></td></tr><tr><td><code>--tr-bubble-tool-call-max-width</code></td><td>工具调用最大宽度</td><td><code>unset</code></td></tr><tr><td><code>--tr-bubble-tool-call-max-height</code></td><td>工具调用详情最大高度</td><td><code>300px</code></td></tr><tr><td><code>--tr-bubble-tool-key-color</code></td><td>JSON 键名颜色</td><td>浅色 <code>#922</code>；深色 <code>#ff6b6b</code></td></tr><tr><td><code>--tr-bubble-tool-number-color</code></td><td>JSON 数字颜色</td><td>浅色 <code>#00f</code>；深色 <code>#4da6ff</code></td></tr><tr><td><code>--tr-bubble-tool-string-color</code></td><td>JSON 字符串颜色</td><td>浅色 <code>#080</code>；深色 <code>#6bcf7f</code></td></tr><tr><td><code>--tr-bubble-tool-boolean-color</code></td><td>JSON 布尔值颜色</td><td>浅色 <code>#c60</code>；深色 <code>#ffb366</code></td></tr><tr><td><code>--tr-bubble-tool-null-color</code></td><td>JSON <code>null</code> 颜色</td><td>浅色 <code>gray</code>；深色 <code>#b3b3b3</code></td></tr></tbody></table><p><strong>Reasoning 推理</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-reasoning-max-height</code></td><td>推理内容最大高度</td><td><code>300px</code></td></tr><tr><td><code>--tr-bubble-reasoning-side-border-width</code></td><td>推理内容左侧边线宽度</td><td><code>1.5px</code></td></tr><tr><td><code>--tr-bubble-reasoning-side-border-color</code></td><td>推理内容左侧边线颜色</td><td><code>var(--tr-border-color-disabled)</code></td></tr></tbody></table><p><strong>BubbleList 容器变量</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-bubble-list-gap</code></td><td>气泡项之间的间距</td><td><code>16px</code></td></tr><tr><td><code>--tr-bubble-list-padding</code></td><td>容器内边距</td><td><code>16px</code></td></tr></tbody></table><h2 id="迁移与弃用" tabindex="-1">迁移与弃用 <a class="header-anchor" href="#迁移与弃用" aria-label="Permalink to &quot;迁移与弃用&quot;">​</a></h2><p>Bubble v0.4 重构了消息结构与渲染器体系。从 v0.3.x 升级时，请按照 <a href="./../migration/bubble-migration.html">Bubble 迁移指南</a> 调整消息数据、渲染器和事件接入方式；新项目直接使用本文 API。</p><p><code>BubbleMessageGroup.startIndex</code> 已弃用。自定义分组可能产生不连续消息，应用应使用 <code>messageIndexes</code> 将组内索引映射回原始消息索引。</p>`,93))])}}});export{Ae as __pageData,Fe as default};
