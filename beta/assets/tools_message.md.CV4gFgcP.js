const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/ToolCall.BCzsKpR4.js","assets/chunks/theme.DWoXJ9L5.js","assets/chunks/framework.CSCYUGUn.js","assets/chunks/index.DXEx-_iz.js","assets/chunks/CustomChunk.BAhcC3l8.js","assets/chunks/OnBeforeRequest.DP8B2c3E.js","assets/chunks/ErrorHandling.CDv9zzWU.js","assets/chunks/RequestState.CvhjEbqq.js","assets/chunks/NonStreaming.BsBWiuBQ.js","assets/chunks/Basic.BoJ6k6mB.js","assets/chunks/MockStream.DxM2yQSy.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as l,aZ as k,aL as S,v as x,H as g,bL as c,bB as E,J as t,bk as n,bJ as i,G as u,w as s,I as o,b7 as p,aU as M}from"./chunks/framework.CSCYUGUn.js";import{L as B,N as A}from"./chunks/index.Dr3IFbIi.js";const P=`<template>
  <div>
    <p class="hint">
      使用 <code>toolPlugin</code> 做工具调用：<code>getTools</code> + <code>callTool</code>。本示例使用模拟 API 返回
      tool_calls。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '询问天气（如：北京）'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageToolCall } from './ToolCall'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageToolCall()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
  tool: { placement: 'start', avatar: aiAvatar },
}
<\/script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 13px;
}
</style>
`,R=`<template>
  <div>
    <p class="hint">
      使用 <code>onCompletionChunk</code> 处理每个数据块（如统计、转换），再调用
      <code>runDefault()</code> 执行默认合并。
    </p>
    <p class="chunk-count">本回合已收到数据块数：{{ chunkCount }}</p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '流式输出中...' : '发送一条消息'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageCustomChunk } from './CustomChunk'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest, chunkCount } = useMessageCustomChunk()

const inputMessage = ref('')

// 用户发送消息（新回合）时重置数据块计数
function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  chunkCount.value = 0
  sendMessage(content.trim())
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
<\/script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 13px;
}
.chunk-count {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--vp-c-brand-1);
}
</style>
`,T=`<template>
  <p class="request-summary" aria-live="polite">{{ lastRequestSummary }}</p>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="isProcessing"
    @submit="handleSubmit"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageOnBeforeRequest } from './OnBeforeRequest'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest, lastRequestSummary } = useMessageOnBeforeRequest()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
<\/script>

<style scoped>
.request-summary {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
`,q=`<template>
  <div>
    <p class="hint">
      使用插件的 <code>onError</code> 处理错误；输入「error-renderer」通过 BubbleProvider 的 error 渲染器展示不同 UI。
    </p>
    <tr-bubble-provider :box-renderer-matches="boxRendererMatches" :content-renderer-matches="contentRendererMatches">
      <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    </tr-bubble-provider>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '输入消息（error / error-renderer）'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import {
  BubbleRenderers,
  TrBubbleList,
  TrBubbleProvider,
  TrSender,
  type BubbleBoxRendererMatch,
  type BubbleContentRendererMatch,
  type BubbleContentRendererProps,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { defineComponent, h, markRaw, ref } from 'vue'
import { useMessageErrorHandling } from './ErrorHandling'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageErrorHandling()

const inputMessage = ref('')

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}

// Box 匹配：错误消息使用自带的 Box 渲染器，attributes 加 class 去掉 padding，data-shape 为 none
const boxRendererMatches: BubbleBoxRendererMatch[] = [
  {
    find: (messages) => messages[0]?.state?.error != null,
    renderer: markRaw(BubbleRenderers.Box),
    attributes: { class: 'error-box-no-padding', 'data-shape': 'none' },
    priority: 0, // 默认优先级是0，优先级越小越先匹配
  },
]

// 自定义 error 内容渲染器：当 message.state.error 存在时使用，从 state.error 读取错误信息
const ErrorContentRenderer = defineComponent<BubbleContentRendererProps>({
  props: { message: { type: Object, required: true }, contentIndex: { type: Number, required: true } },
  setup(props: BubbleContentRendererProps) {
    const errorInfo = props.message?.state?.error as { message?: string } | undefined
    const errorMessage = errorInfo?.message ?? ''
    return () =>
      h(
        'div',
        {
          class: 'error-renderer',
          style: {
            padding: '12px 16px',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          },
        },
        [
          h('span', { style: { flexShrink: 0, fontSize: '18px' } }, '⚠️'),
          h('div', { style: { flex: 1 } }, [
            h('div', { style: { fontWeight: 600, marginBottom: '4px' } }, '错误'),
            h('div', { style: { fontSize: '14px', opacity: 0.9 } }, errorMessage),
          ]),
        ],
      )
  },
})

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => message.state?.error != null,
    renderer: markRaw(ErrorContentRenderer),
    priority: 0, // 默认优先级是0，优先级越小越先匹配
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
<\/script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
}
/* Box 匹配的 attributes.class，通过变量去掉 padding */
:deep(.error-box-no-padding) {
  --tr-bubble-box-padding: 0;
}
</style>
`,I=`<template>
  <div>
    <p class="hint">
      用 <code>requestState</code> 和 <code>processingState</code> 驱动 UI。<code>processingState</code> 是
      <code>requestState</code> 为 processing 时的子状态。
    </p>
    <div class="state-bar">
      <span class="label">requestState:</span>
      <span :class="['badge', requestState]">{{ requestState }}</span>
      <span class="label">processingState:</span>
      <span class="badge">{{ processingState ?? '—' }}</span>
    </div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '发送一条消息'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageRequestState } from './RequestState'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest, requestState, processingState } = useMessageRequestState()

const inputMessage = ref('')

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
<\/script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 13px;
}
.state-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 13px;
}
.state-bar .label {
  color: var(--vp-c-text-2);
}
.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.badge.idle {
  background: var(--vp-c-gray-soft);
  color: var(--vp-c-text-1);
}
.badge.processing {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.badge.completed {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}
.badge.aborted {
  background: var(--vp-c-orange-soft);
  color: var(--vp-c-orange-1);
}
.badge.error {
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
}
</style>
`,_=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="isProcessing"
    @submit="handleSubmit"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageNonStreaming } from './NonStreaming'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageNonStreaming()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
<\/script>
`,w=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="isProcessing"
    @submit="handleSubmit"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageBasic } from './Basic'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageBasic()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
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
<\/script>
`,U=`<template>
  <div>
    <p class="hint">模拟 <code>responseProvider</code>：不依赖真实 API，用于开发时模拟流式响应。</p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '模拟流式中...' : '输入任意内容'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageMockStream } from './MockStream'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageMockStream()

const inputMessage = ref('')

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
<\/script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 13px;
}
</style>
`,X=JSON.parse('{"title":"useMessage 消息数据管理","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),W={name:"tools/message.md"},G=Object.assign(W,{setup(L){const m=p();d(async()=>{m.value=(await l(async()=>{const{default:a}=await import("./chunks/ToolCall.BCzsKpR4.js");return{default:a}},__vite__mapDeps([0,1,2,3]))).default});const b=p();d(async()=>{b.value=(await l(async()=>{const{default:a}=await import("./chunks/CustomChunk.BAhcC3l8.js");return{default:a}},__vite__mapDeps([4,1,2,3]))).default});const D=p();d(async()=>{D.value=(await l(async()=>{const{default:a}=await import("./chunks/OnBeforeRequest.DP8B2c3E.js");return{default:a}},__vite__mapDeps([5,1,2,3]))).default});const h=p();d(async()=>{h.value=(await l(async()=>{const{default:a}=await import("./chunks/ErrorHandling.CDv9zzWU.js");return{default:a}},__vite__mapDeps([6,1,2,3]))).default});const F=p();d(async()=>{F.value=(await l(async()=>{const{default:a}=await import("./chunks/RequestState.CvhjEbqq.js");return{default:a}},__vite__mapDeps([7,1,2,3]))).default});const f=p();d(async()=>{f.value=(await l(async()=>{const{default:a}=await import("./chunks/NonStreaming.BsBWiuBQ.js");return{default:a}},__vite__mapDeps([8,1,2,3]))).default});const y=p();d(async()=>{y.value=(await l(async()=>{const{default:a}=await import("./chunks/Basic.BoJ6k6mB.js");return{default:a}},__vite__mapDeps([9,1,2,3]))).default});const r=M(!0),v=p();return d(async()=>{v.value=(await l(async()=>{const{default:a}=await import("./chunks/MockStream.DxM2yQSy.js");return{default:a}},__vite__mapDeps([10,1,2,3]))).default}),(a,e)=>{const C=k("ClientOnly");return S(),x("div",null,[e[8]||(e[8]=g('<h1 id="usemessage-消息数据管理" tabindex="-1">useMessage 消息数据管理 <a class="header-anchor" href="#usemessage-消息数据管理" aria-label="Permalink to &quot;useMessage 消息数据管理&quot;">​</a></h1><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><p><code>useMessage</code> 是管理单个 AI 消息流的 Vue Composable。它持有消息和请求状态，调用应用提供的 <code>responseProvider</code>，消费完整或流式响应，并通过插件扩展请求、消息与工具调用生命周期。</p><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>管理单个对话中的消息发送、流式合并、错误和取消状态；</li><li>将自定义后端或 OpenAI 兼容响应适配到 TinyRobot 消息组件；</li><li>使用插件注入请求参数、处理响应块或执行工具调用；</li><li>需要把消息状态与 <code>tr-bubble-list</code>、<code>tr-sender</code> 等界面组件自由组合。</li></ul><p><code>useMessage</code> 不负责持久化多个会话。需要创建、切换和恢复会话时，使用 <a href="./conversation.html"><code>useConversation</code></a>，由它为每个会话管理一个 <code>useMessage</code> 引擎。</p><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><h3 id="发送并接收流式消息" tabindex="-1">发送并接收流式消息 <a class="header-anchor" href="#发送并接收流式消息" aria-label="Permalink to &quot;发送并接收流式消息&quot;">​</a></h3><p>提供 <code>responseProvider</code>，再把 <code>messages</code>、<code>isProcessing</code>、<code>sendMessage</code> 和 <code>abortRequest</code> 连接到消息列表与输入组件，即可形成完整交互。示例使用本地 AsyncGenerator 返回固定内容，不依赖真实服务。</p>',9)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"基础流式消息",description:"使用本地模拟响应展示发送、增量更新和取消。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22MockStream.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FMockStream.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F%2F%20%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%EF%BC%9A%E6%8C%89%E5%AD%97%E7%AC%A6%E9%80%90%E4%B8%AA%20yield%20%E5%9B%BA%E5%AE%9A%E5%9B%9E%E5%A4%8D%E5%86%85%E5%AE%B9%5Cnasync%20function*%20mockStream(_requestBody%3A%20MessageRequestBody%2C%20abortSignal%3A%20AbortSignal)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20reply%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E6%9D%A1%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%E5%9B%9E%E5%A4%8D%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%E3%80%82'%5Cn%20%20const%20id%20%3D%20'mock-'%20%2B%20Date.now()%5Cn%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20reply.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%2030))%5Cn%20%20%20%20if%20(abortSignal.aborted)%20return%5Cn%20%20%20%20const%20deltaContent%20%3D%20reply%5Bi%5D%5Cn%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%3A%20deltaContent%20%7D%20%3A%20%7B%20content%3A%20deltaContent%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20reply.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%EF%BC%9AresponseProvider%20%E4%B8%BA%20AsyncGenerator%EF%BC%8C%E4%B8%8D%E4%BE%9D%E8%B5%96%E7%9C%9F%E5%AE%9E%20API%5Cn%20*%2F%5Cnexport%20function%20useMessageMockStream()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20mockStream%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E7%9A%84%20responseProvider%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%EF%BC%8C%E9%80%82%E5%90%88%E7%A6%BB%E7%BA%BF%E5%BC%80%E5%8F%91%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22MockStream.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FMockStream.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%E6%A8%A1%E6%8B%9F%20%3Ccode%3EresponseProvider%3C%2Fcode%3E%EF%BC%9A%E4%B8%8D%E4%BE%9D%E8%B5%96%E7%9C%9F%E5%AE%9E%20API%EF%BC%8C%E7%94%A8%E4%BA%8E%E5%BC%80%E5%8F%91%E6%97%B6%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%E4%B8%AD...'%20%3A%20'%E8%BE%93%E5%85%A5%E4%BB%BB%E6%84%8F%E5%86%85%E5%AE%B9'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageMockStream%20%7D%20from%20'.%2FMockStream'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageMockStream()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{r.value=!1}),vueCode:n(U)},u({_:2},[v.value?{name:"vue",fn:i(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[9]||(e[9]=g('<p>同一时刻只能运行一个用户回合。界面应使用 <code>canStartTurn</code> 或 <code>isProcessing</code> 控制重复提交；<code>sendMessage</code> 本身也会在当前回合不能开始时直接短路。</p><h3 id="接入响应服务" tabindex="-1">接入响应服务 <a class="header-anchor" href="#接入响应服务" aria-label="Permalink to &quot;接入响应服务&quot;">​</a></h3><p><code>responseProvider</code> 可以返回单个结果，也可以返回 AsyncGenerator。TinyRobot 负责消费响应和更新消息，但请求 URL、鉴权、协议映射、服务端密钥和 HTTP 错误仍由应用负责。</p><h4 id="sse-流式响应" tabindex="-1">SSE 流式响应 <a class="header-anchor" href="#sse-流式响应" aria-label="Permalink to &quot;SSE 流式响应&quot;">​</a></h4><p>下面的集成示例请求文档站的 <code>/api/chat/completions</code>，并使用 <code>sseStreamToGenerator</code> 把 SSE <code>Response</code> 转成 AsyncGenerator。接入自己的服务时，应在服务端保存密钥，并把非 OpenAI 兼容数据映射为 <code>ChatCompletion</code>。</p>',5)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"接入 SSE 服务",description:"通过站点 API 获取流式响应；部署时需要提供对应的服务端接口。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FBasic.ts%22%2C%22code%22%3A%22import%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F%2F%20%E8%8B%A5%E6%9C%89%20import.meta%20%E5%88%99%E5%8F%96%20BASE_URL%EF%BC%8C%E5%90%A6%E5%88%99%E4%B8%BA%E7%A9%BA%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%EF%BC%9AresponseProvider%20%E5%8F%91%E8%B5%B7%E6%B5%81%E5%BC%8F%E8%AF%B7%E6%B1%82%EF%BC%8CinitialMessages%20%E5%B1%95%E7%A4%BA%E6%AC%A2%E8%BF%8E%E8%AF%AD%5Cn%20*%2F%5Cnexport%20function%20useMessageBasic()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFAI%E5%8A%A9%E6%89%8B%EF%BC%8C%E6%9C%89%E4%BB%80%E4%B9%88%E5%8F%AF%E4%BB%A5%E5%B8%AE%E5%8A%A9%E4%BD%A0%E7%9A%84%E5%90%97%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageBasic%20%7D%20from%20'.%2FBasic'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageBasic()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{r.value=!1}),vueCode:n(w)},u({_:2},[y.value?{name:"vue",fn:i(()=>[t(n(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[10]||(e[10]=s("h4",{id:"非流式响应",tabindex:"-1"},[o("非流式响应 "),s("a",{class:"header-anchor",href:"#非流式响应","aria-label":'Permalink to "非流式响应"'},"​")],-1)),e[11]||(e[11]=s("p",null,[o("返回 "),s("code",null,"Promise<ChatCompletion>"),o(" 时，"),s("code",null,"useMessage"),o(" 会一次性合并完整响应，适合不支持 SSE 的后端。")],-1)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"非流式响应",description:"等待完整响应后一次性更新助手消息。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22NonStreaming.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FNonStreaming.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E9%9D%9E%E6%B5%81%E5%BC%8F%EF%BC%9AresponseProvider%20%E8%BF%94%E5%9B%9E%20Promise%3CChatCompletion%3E%EF%BC%8C%E4%B8%80%E6%AC%A1%E6%80%A7%E5%BE%97%E5%88%B0%E5%AE%8C%E6%95%B4%E7%BB%93%E6%9E%9C%5Cn%20*%2F%5Cnexport%20function%20useMessageNonStreaming()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%3A%20Promise%3CChatCompletion%3E%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20false%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20response.json()%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E9%9D%9E%E6%B5%81%E5%BC%8F%E6%8E%A5%E5%8F%A3%EF%BC%88stream%3A%20false%EF%BC%89%EF%BC%8C%E4%B8%80%E6%AC%A1%E6%80%A7%E8%BF%94%E5%9B%9E%E5%AE%8C%E6%95%B4%E7%BB%93%E6%9E%9C%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22NonStreaming.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FNonStreaming.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageNonStreaming%20%7D%20from%20'.%2FNonStreaming'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageNonStreaming()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{r.value=!1}),vueCode:n(_)},u({_:2},[f.value?{name:"vue",fn:i(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[12]||(e[12]=s("h3",{id:"呈现请求状态",tabindex:"-1"},[o("呈现请求状态 "),s("a",{class:"header-anchor",href:"#呈现请求状态","aria-label":'Permalink to "呈现请求状态"'},"​")],-1)),e[13]||(e[13]=s("p",null,[s("code",null,"requestState"),o(" 描述整个回合，"),s("code",null,"processingState"),o(" 细分正在请求还是正在合并响应。界面可以用这些状态显示进度、禁用输入并提供取消操作。")],-1)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"请求状态",description:"观察请求、响应合并、完成和取消阶段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22RequestState.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FRequestState.ts%22%2C%22code%22%3A%22import%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E8%AF%B7%E6%B1%82%E7%8A%B6%E6%80%81%EF%BC%9AresponseProvider%20%E5%8A%A0%E5%BB%B6%E8%BF%9F%EF%BC%8C%E4%BE%BF%E4%BA%8E%E8%A7%82%E5%AF%9F%20processingState%20%E4%BB%8E%20requesting%20%E5%8F%98%E4%B8%BA%20completing%5Cn%20*%2F%5Cnexport%20function%20useMessageRequestState()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%BB%B6%E8%BF%9F%201.5s%20%E5%86%8D%E5%8F%91%E8%B5%B7%E8%AF%B7%E6%B1%82%EF%BC%8C%E4%BE%BF%E4%BA%8E%E8%A7%82%E5%AF%9F%20processingState%20%E4%BB%8E%20requesting%20%E5%8F%98%E4%B8%BA%20completing%5Cn%20%20%20%20%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%201500))%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E5%90%8E%E8%A7%82%E5%AF%9F%E7%8A%B6%E6%80%81%E6%9D%A1%EF%BC%9A%E5%85%88%E4%B8%BA%20requesting%EF%BC%8C%E6%94%B6%E5%88%B0%E9%A6%96%E5%8C%85%E5%90%8E%E5%8F%98%E4%B8%BA%20completing%EF%BC%8C%E7%BB%93%E6%9D%9F%E5%90%8E%E4%B8%BA%20completed%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22RequestState.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FRequestState.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E7%94%A8%20%3Ccode%3ErequestState%3C%2Fcode%3E%20%E5%92%8C%20%3Ccode%3EprocessingState%3C%2Fcode%3E%20%E9%A9%B1%E5%8A%A8%20UI%E3%80%82%3Ccode%3EprocessingState%3C%2Fcode%3E%20%E6%98%AF%5Cn%20%20%20%20%20%20%3Ccode%3ErequestState%3C%2Fcode%3E%20%E4%B8%BA%20processing%20%E6%97%B6%E7%9A%84%E5%AD%90%E7%8A%B6%E6%80%81%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22state-bar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22label%5C%22%3ErequestState%3A%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20%3Aclass%3D%5C%22%5B'badge'%2C%20requestState%5D%5C%22%3E%7B%7B%20requestState%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22label%5C%22%3EprocessingState%3A%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22badge%5C%22%3E%7B%7B%20processingState%20%3F%3F%20'%E2%80%94'%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E5%8F%91%E9%80%81%E4%B8%80%E6%9D%A1%E6%B6%88%E6%81%AF'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageRequestState%20%7D%20from%20'.%2FRequestState'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%2C%20requestState%2C%20processingState%20%7D%20%3D%20useMessageRequestState()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn.state-bar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-bottom%3A%2012px%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn.state-bar%20.label%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%7D%5Cn.badge%20%7B%5Cn%20%20padding%3A%202px%208px%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%7D%5Cn.badge.idle%20%7B%5Cn%20%20background%3A%20var(--vp-c-gray-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%7D%5Cn.badge.processing%20%7B%5Cn%20%20background%3A%20var(--vp-c-brand-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn.badge.completed%20%7B%5Cn%20%20background%3A%20var(--vp-c-green-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-green-1)%3B%5Cn%7D%5Cn.badge.aborted%20%7B%5Cn%20%20background%3A%20var(--vp-c-orange-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-orange-1)%3B%5Cn%7D%5Cn.badge.error%20%7B%5Cn%20%20background%3A%20var(--vp-c-red-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-red-1)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{r.value=!1}),vueCode:n(I)},u({_:2},[F.value?{name:"vue",fn:i(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[14]||(e[14]=g('<h3 id="处理错误" tabindex="-1">处理错误 <a class="header-anchor" href="#处理错误" aria-label="Permalink to &quot;处理错误&quot;">​</a></h3><p><code>responseProvider</code> 或会向外传播的生命周期钩子抛错时，当前回合进入 <code>error</code>，调用 <code>sendMessage</code> / <code>send</code> 得到的 Promise 会拒绝。<code>onFinally</code> 是例外：其同步异常只会记录到控制台，不会改变回合状态或拒绝发送 Promise。插件的 <code>onError</code> 可以追加可见错误消息，但不会吞掉原始错误；调用方仍应捕获 Provider 和可传播钩子的错误。</p>',2)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"错误处理",description:"通过 onError 把请求失败转成对话内可见反馈。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22ErrorHandling.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FErrorHandling.ts%22%2C%22code%22%3A%22import%20type%20%7B%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20UseMessagePlugin%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F%2F%20%E6%8F%92%E4%BB%B6%EF%BC%9A%E6%A0%B9%E6%8D%AE%20error.name%20%E5%8C%BA%E5%88%86%E5%A4%84%E7%90%86%EF%BC%9BErrorRenderer%20%E6%97%B6%E8%AE%BE%E7%BD%AE%20state.error%20%E4%BE%9B%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%5Cnconst%20errorHandlingPlugin%3A%20UseMessagePlugin%20%3D%20%7B%5Cn%20%20name%3A%20'errorHandling'%2C%5Cn%20%20onError(%7B%20currentTurn%2C%20error%20%7D)%20%7B%5Cn%20%20%20%20const%20message%20%3D%20error%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%5Cn%20%20%20%20const%20lastMessage%20%3D%20currentTurn.at(-1)!%5Cn%20%20%20%20if%20(error%20instanceof%20Error%20%26%26%20error.name%20%3D%3D%3D%20'ErrorRenderer')%20%7B%5Cn%20%20%20%20%20%20if%20(!lastMessage.state)%20lastMessage.state%20%3D%20%7B%7D%5Cn%20%20%20%20%20%20lastMessage.state.error%20%3D%20%7B%20message%2C%20name%3A%20error.name%20%7D%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20lastMessage.content%20%3D%20%60%E6%8A%B1%E6%AD%89%EF%BC%8C%E5%87%BA%E9%94%99%E4%BA%86%EF%BC%9A%24%7Bmessage%7D%60%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%EF%BC%9Aplugins%20%E4%B8%AD%20onError%20%E6%A0%B9%E6%8D%AE%20error.name%20%E5%8C%BA%E5%88%86%EF%BC%9BErrorRenderer%20%E6%97%B6%E8%AE%BE%E7%BD%AE%20state.error%20%E4%BE%9B%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%5Cn%20*%2F%5Cnexport%20function%20useMessageErrorHandling()%20%7B%5Cn%20%20const%20responseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody%2C%20abortSignal%3A%20AbortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20lastUser%20%3D%20requestBody.messages.filter((m)%20%3D%3E%20m.role%20%3D%3D%3D%20'user').pop()%5Cn%20%20%20%20const%20content%20%3D%20(lastUser%3F.content%20as%20string)%20%7C%7C%20''%5Cn%20%20%20%20if%20(content.trim().toLowerCase()%20%3D%3D%3D%20'error')%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20%20%20%20%20throw%20new%20Error('%E7%A4%BA%E4%BE%8B%EF%BC%9A%E6%A8%A1%E6%8B%9F%20API%20%E9%94%99%E8%AF%AF')%5Cn%20%20%20%20%7D%5Cn%20%20%20%20if%20(content.trim().toLowerCase()%20%3D%3D%3D%20'error-renderer')%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20%20%20%20%20const%20err%20%3D%20new%20Error('%E6%B8%B2%E6%9F%93%E9%94%99%E8%AF%AF%E7%A4%BA%E4%BE%8B%EF%BC%9A%E6%AD%A4%E6%B6%88%E6%81%AF%E9%80%9A%E8%BF%87%20state.error%20%E5%8C%B9%E9%85%8D%E8%87%AA%E5%AE%9A%E4%B9%89%20error%20%E6%B8%B2%E6%9F%93%E5%99%A8%E3%80%82')%5Cn%20%20%20%20%20%20err.name%20%3D%20'ErrorRenderer'%5Cn%20%20%20%20%20%20throw%20err%5Cn%20%20%20%20%7D%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%7D%5Cn%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%7D%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20responseProvider%20as%20Parameters%3Ctypeof%20useMessage%3E%5B0%5D%5B'responseProvider'%5D%2C%5Cn%20%20%20%20plugins%3A%20%5BerrorHandlingPlugin%5D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%91%E9%80%81%E4%BB%BB%E6%84%8F%E6%B6%88%E6%81%AF%E5%8F%AF%E6%AD%A3%E5%B8%B8%E5%9B%9E%E5%A4%8D%EF%BC%9B%E8%BE%93%E5%85%A5%E3%80%8Cerror%E3%80%8D%E6%A8%A1%E6%8B%9F%20API%20%E9%94%99%E8%AF%AF%EF%BC%9B%E8%BE%93%E5%85%A5%E3%80%8Cerror-renderer%E3%80%8D%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%20error%20%E6%B8%B2%E6%9F%93%E5%99%A8%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22ErrorHandling.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FErrorHandling.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%E6%8F%92%E4%BB%B6%E7%9A%84%20%3Ccode%3EonError%3C%2Fcode%3E%20%E5%A4%84%E7%90%86%E9%94%99%E8%AF%AF%EF%BC%9B%E8%BE%93%E5%85%A5%E3%80%8Cerror-renderer%E3%80%8D%E9%80%9A%E8%BF%87%20BubbleProvider%20%E7%9A%84%20error%20%E6%B8%B2%E6%9F%93%E5%99%A8%E5%B1%95%E7%A4%BA%E4%B8%8D%E5%90%8C%20UI%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-provider%20%3Abox-renderer-matches%3D%5C%22boxRendererMatches%5C%22%20%3Acontent-renderer-matches%3D%5C%22contentRendererMatches%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E8%BE%93%E5%85%A5%E6%B6%88%E6%81%AF%EF%BC%88error%20%2F%20error-renderer%EF%BC%89'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%5Cn%20%20BubbleRenderers%2C%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%20%20TrSender%2C%5Cn%20%20type%20BubbleBoxRendererMatch%2C%5Cn%20%20type%20BubbleContentRendererMatch%2C%5Cn%20%20type%20BubbleContentRendererProps%2C%5Cn%20%20type%20BubbleRoleConfig%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineComponent%2C%20h%2C%20markRaw%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageErrorHandling%20%7D%20from%20'.%2FErrorHandling'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageErrorHandling()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cn%2F%2F%20Box%20%E5%8C%B9%E9%85%8D%EF%BC%9A%E9%94%99%E8%AF%AF%E6%B6%88%E6%81%AF%E4%BD%BF%E7%94%A8%E8%87%AA%E5%B8%A6%E7%9A%84%20Box%20%E6%B8%B2%E6%9F%93%E5%99%A8%EF%BC%8Cattributes%20%E5%8A%A0%20class%20%E5%8E%BB%E6%8E%89%20padding%EF%BC%8Cdata-shape%20%E4%B8%BA%20none%5Cnconst%20boxRendererMatches%3A%20BubbleBoxRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(messages)%20%3D%3E%20messages%5B0%5D%3F.state%3F.error%20!%3D%20null%2C%5Cn%20%20%20%20renderer%3A%20markRaw(BubbleRenderers.Box)%2C%5Cn%20%20%20%20attributes%3A%20%7B%20class%3A%20'error-box-no-padding'%2C%20'data-shape'%3A%20'none'%20%7D%2C%5Cn%20%20%20%20priority%3A%200%2C%20%2F%2F%20%E9%BB%98%E8%AE%A4%E4%BC%98%E5%85%88%E7%BA%A7%E6%98%AF0%EF%BC%8C%E4%BC%98%E5%85%88%E7%BA%A7%E8%B6%8A%E5%B0%8F%E8%B6%8A%E5%85%88%E5%8C%B9%E9%85%8D%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%20error%20%E5%86%85%E5%AE%B9%E6%B8%B2%E6%9F%93%E5%99%A8%EF%BC%9A%E5%BD%93%20message.state.error%20%E5%AD%98%E5%9C%A8%E6%97%B6%E4%BD%BF%E7%94%A8%EF%BC%8C%E4%BB%8E%20state.error%20%E8%AF%BB%E5%8F%96%E9%94%99%E8%AF%AF%E4%BF%A1%E6%81%AF%5Cnconst%20ErrorContentRenderer%20%3D%20defineComponent%3CBubbleContentRendererProps%3E(%7B%5Cn%20%20props%3A%20%7B%20message%3A%20%7B%20type%3A%20Object%2C%20required%3A%20true%20%7D%2C%20contentIndex%3A%20%7B%20type%3A%20Number%2C%20required%3A%20true%20%7D%20%7D%2C%5Cn%20%20setup(props%3A%20BubbleContentRendererProps)%20%7B%5Cn%20%20%20%20const%20errorInfo%20%3D%20props.message%3F.state%3F.error%20as%20%7B%20message%3F%3A%20string%20%7D%20%7C%20undefined%5Cn%20%20%20%20const%20errorMessage%20%3D%20errorInfo%3F.message%20%3F%3F%20''%5Cn%20%20%20%20return%20()%20%3D%3E%5Cn%20%20%20%20%20%20h(%5Cn%20%20%20%20%20%20%20%20'div'%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20class%3A%20'error-renderer'%2C%5Cn%20%20%20%20%20%20%20%20%20%20style%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%20'12px%2016px'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20'%23fef2f2'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20'%23dc2626'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20borderRadius%3A%20'8px'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border%3A%20'1px%20solid%20%23fecaca'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20display%3A%20'flex'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20alignItems%3A%20'flex-start'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20gap%3A%20'8px'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20h('span'%2C%20%7B%20style%3A%20%7B%20flexShrink%3A%200%2C%20fontSize%3A%20'18px'%20%7D%20%7D%2C%20'%E2%9A%A0%EF%B8%8F')%2C%5Cn%20%20%20%20%20%20%20%20%20%20h('div'%2C%20%7B%20style%3A%20%7B%20flex%3A%201%20%7D%20%7D%2C%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20h('div'%2C%20%7B%20style%3A%20%7B%20fontWeight%3A%20600%2C%20marginBottom%3A%20'4px'%20%7D%20%7D%2C%20'%E9%94%99%E8%AF%AF')%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20h('div'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'14px'%2C%20opacity%3A%200.9%20%7D%20%7D%2C%20errorMessage)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D)%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20contentRendererMatches%3A%20BubbleContentRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(message)%20%3D%3E%20message.state%3F.error%20!%3D%20null%2C%5Cn%20%20%20%20renderer%3A%20markRaw(ErrorContentRenderer)%2C%5Cn%20%20%20%20priority%3A%200%2C%20%2F%2F%20%E9%BB%98%E8%AE%A4%E4%BC%98%E5%85%88%E7%BA%A7%E6%98%AF0%EF%BC%8C%E4%BC%98%E5%85%88%E7%BA%A7%E8%B6%8A%E5%B0%8F%E8%B6%8A%E5%85%88%E5%8C%B9%E9%85%8D%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20%23f0f0f0%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%2F*%20Box%20%E5%8C%B9%E9%85%8D%E7%9A%84%20attributes.class%EF%BC%8C%E9%80%9A%E8%BF%87%E5%8F%98%E9%87%8F%E5%8E%BB%E6%8E%89%20padding%20*%2F%5Cn%3Adeep(.error-box-no-padding)%20%7B%5Cn%20%20--tr-bubble-box-padding%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{r.value=!1}),vueCode:n(q)},u({_:2},[h.value?{name:"vue",fn:i(()=>[t(n(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[15]||(e[15]=s("h3",{id:"调整请求与响应",tabindex:"-1"},[o("调整请求与响应 "),s("a",{class:"header-anchor",href:"#调整请求与响应","aria-label":'Permalink to "调整请求与响应"'},"​")],-1)),e[16]||(e[16]=s("h4",{id:"修改请求参数",tabindex:"-1"},[o("修改请求参数 "),s("a",{class:"header-anchor",href:"#修改请求参数","aria-label":'Permalink to "修改请求参数"'},"​")],-1)),e[17]||(e[17]=s("p",null,[s("code",null,"onBeforeRequest"),o(" 在消息清洗和请求发送前运行，可以注入 system 消息、模型参数或工具定义。修改只影响当次 "),s("code",null,"requestBody"),o("；示例把结果显示在页面内，便于验证。")],-1)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"修改请求参数",description:"在请求前注入额外消息与参数。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22OnBeforeRequest.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FOnBeforeRequest.ts%22%2C%22code%22%3A%22import%20type%20%7B%20UseMessagePlugin%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cnconst%20lastRequestSummary%20%3D%20ref('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81%E8%AF%B7%E6%B1%82')%5Cn%5Cn%2F%2F%20%E6%8F%92%E4%BB%B6%EF%BC%9A%E5%9C%A8%20onBeforeRequest%20%E4%B8%AD%E4%BF%AE%E6%94%B9%20requestBody%EF%BC%8C%E6%B3%A8%E5%85%A5%20system%20%E6%B6%88%E6%81%AF%E5%92%8C%20temperature%5Cnconst%20modifyRequestPlugin%3A%20UseMessagePlugin%20%3D%20%7B%5Cn%20%20name%3A%20'modifyRequest'%2C%5Cn%20%20onBeforeRequest(%7B%20requestBody%20%7D)%20%7B%5Cn%20%20%20%20requestBody.messages%20%3D%20%5B%5Cn%20%20%20%20%20%20%7B%20role%3A%20'system'%2C%20content%3A%20'%E4%BD%A0%E6%98%AF%E4%B8%80%E4%B8%AA%E7%AE%80%E6%B4%81%E7%9A%84%E5%8A%A9%E6%89%8B%EF%BC%8C%E8%AF%B7%E7%94%A8%E7%AE%80%E7%9F%AD%E7%9A%84%E8%AF%9D%E5%9B%9E%E5%A4%8D%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20...requestBody.messages%2C%5Cn%20%20%20%20%5D%5Cn%20%20%20%20%3B(requestBody%20as%20Record%3Cstring%2C%20unknown%3E).temperature%20%3D%200.7%5Cn%20%20%20%20lastRequestSummary.value%20%3D%20%60%E5%B7%B2%E6%B3%A8%E5%85%A5%20system%20%E6%B6%88%E6%81%AF%EF%BC%9Btemperature%20%3D%200.7%EF%BC%9B%E6%B6%88%E6%81%AF%E6%95%B0%20%3D%20%24%7BrequestBody.messages.length%7D%60%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20onBeforeRequest%EF%BC%9A%E6%8F%92%E4%BB%B6%E5%9C%A8%E8%AF%B7%E6%B1%82%E5%89%8D%E4%BF%AE%E6%94%B9%20requestBody%EF%BC%88%E6%B3%A8%E5%85%A5%20system%E3%80%81%E8%BF%BD%E5%8A%A0%E5%8F%82%E6%95%B0%E7%AD%89%EF%BC%89%5Cn%20*%2F%5Cnexport%20function%20useMessageOnBeforeRequest()%20%7B%5Cn%20%20const%20message%20%3D%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20plugins%3A%20%5BmodifyRequestPlugin%5D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%9C%AC%E7%A4%BA%E4%BE%8B%E9%80%9A%E8%BF%87%20onBeforeRequest%20%E6%8F%92%E4%BB%B6%E5%9C%A8%E8%AF%B7%E6%B1%82%E5%89%8D%E6%B3%A8%E5%85%A5%20system%20%E6%B6%88%E6%81%AF%E5%92%8C%20temperature%20%E5%8F%82%E6%95%B0%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20%7B%20...message%2C%20lastRequestSummary%20%7D%5Cn%7D%5Cn%22%7D%2C%22OnBeforeRequest.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FOnBeforeRequest.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cp%20class%3D%5C%22request-summary%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%7B%7B%20lastRequestSummary%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageOnBeforeRequest%20%7D%20from%20'.%2FOnBeforeRequest'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%2C%20lastRequestSummary%20%7D%20%3D%20useMessageOnBeforeRequest()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.request-summary%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{r.value=!1}),vueCode:n(T)},u({_:2},[D.value?{name:"vue",fn:i(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=s("h4",{id:"自定义响应块处理",tabindex:"-1"},[o("自定义响应块处理 "),s("a",{class:"header-anchor",href:"#自定义响应块处理","aria-label":'Permalink to "自定义响应块处理"'},"​")],-1)),e[19]||(e[19]=s("p",null,[o("顶层 "),s("code",null,"onCompletionChunk"),o(" 会取代默认合并入口。需要保留默认消息合并时，必须调用 "),s("code",null,"runDefault()"),o("；插件中的同名钩子则在顶层处理之后继续运行。")],-1)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"自定义响应块处理",description:"统计响应块，并继续执行默认消息合并。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22CustomChunk.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FCustomChunk.ts%22%2C%22code%22%3A%22import%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E8%87%AA%E5%AE%9A%E4%B9%89%20Chunk%20%E5%A4%84%E7%90%86%EF%BC%9AonCompletionChunk%20%E5%A4%84%E7%90%86%E6%AF%8F%E4%B8%AA%E6%95%B0%E6%8D%AE%E5%9D%97%EF%BC%8C%E8%B0%83%E7%94%A8%20runDefault()%20%E6%89%A7%E8%A1%8C%E9%BB%98%E8%AE%A4%E5%90%88%E5%B9%B6%5Cn%20*%2F%5Cnexport%20function%20useMessageCustomChunk()%20%7B%5Cn%20%20const%20chunkCount%20%3D%20ref(0)%5Cn%5Cn%20%20const%20result%20%3D%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20onCompletionChunk(_context%2C%20runDefault)%20%7B%5Cn%20%20%20%20%20%20chunkCount.value%20%2B%3D%201%5Cn%20%20%20%20%20%20runDefault()%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E4%B8%8A%E6%96%B9%E4%BC%9A%E7%BB%9F%E8%AE%A1%E6%9C%AC%E5%9B%9E%E5%90%88%E6%94%B6%E5%88%B0%E7%9A%84%E6%95%B0%E6%8D%AE%E5%9D%97%E6%95%B0%E9%87%8F%EF%BC%8C%E5%8F%AF%E7%94%A8%20onCompletionChunk%20%E5%81%9A%E6%97%A5%E5%BF%97%E6%88%96%E8%87%AA%E5%AE%9A%E4%B9%89%E5%90%88%E5%B9%B6%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20%7B%20...result%2C%20chunkCount%20%7D%5Cn%7D%5Cn%22%7D%2C%22CustomChunk.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FCustomChunk.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%20%3Ccode%3EonCompletionChunk%3C%2Fcode%3E%20%E5%A4%84%E7%90%86%E6%AF%8F%E4%B8%AA%E6%95%B0%E6%8D%AE%E5%9D%97%EF%BC%88%E5%A6%82%E7%BB%9F%E8%AE%A1%E3%80%81%E8%BD%AC%E6%8D%A2%EF%BC%89%EF%BC%8C%E5%86%8D%E8%B0%83%E7%94%A8%5Cn%20%20%20%20%20%20%3Ccode%3ErunDefault()%3C%2Fcode%3E%20%E6%89%A7%E8%A1%8C%E9%BB%98%E8%AE%A4%E5%90%88%E5%B9%B6%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22chunk-count%5C%22%3E%E6%9C%AC%E5%9B%9E%E5%90%88%E5%B7%B2%E6%94%B6%E5%88%B0%E6%95%B0%E6%8D%AE%E5%9D%97%E6%95%B0%EF%BC%9A%7B%7B%20chunkCount%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%B5%81%E5%BC%8F%E8%BE%93%E5%87%BA%E4%B8%AD...'%20%3A%20'%E5%8F%91%E9%80%81%E4%B8%80%E6%9D%A1%E6%B6%88%E6%81%AF'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageCustomChunk%20%7D%20from%20'.%2FCustomChunk'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%2C%20chunkCount%20%7D%20%3D%20useMessageCustomChunk()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cn%2F%2F%20%E7%94%A8%E6%88%B7%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%EF%BC%88%E6%96%B0%E5%9B%9E%E5%90%88%EF%BC%89%E6%97%B6%E9%87%8D%E7%BD%AE%E6%95%B0%E6%8D%AE%E5%9D%97%E8%AE%A1%E6%95%B0%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20chunkCount.value%20%3D%200%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn.chunk-count%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{r.value=!1}),vueCode:n(R)},u({_:2},[b.value?{name:"vue",fn:i(()=>[t(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[20]||(e[20]=s("h3",{id:"执行工具调用",tabindex:"-1"},[o("执行工具调用 "),s("a",{class:"header-anchor",href:"#执行工具调用","aria-label":'Permalink to "执行工具调用"'},"​")],-1)),e[21]||(e[21]=s("p",null,[s("code",null,"toolPlugin"),o(" 把工具 schema 写入请求，在模型返回 "),s("code",null,"tool_calls"),o(" 后执行工具、追加 tool 消息并继续请求。工具执行、审批、权限和副作用由应用负责；"),s("code",null,"useMessage"),o(" 只协调回合状态和消息链。")],-1)),c(t(n(B),null,null,512),[[E,r.value]]),t(C,null,{default:i(()=>[t(n(A),{title:"工具调用",description:"使用本地模拟工具完成声明、执行和结果回传。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22ToolCall.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FToolCall.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%2C%20Tool%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20toolPlugin%2C%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F%2F%20%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%EF%BC%9A%E8%8B%A5%E6%9C%80%E5%90%8E%E4%B8%80%E6%9D%A1%E6%98%AF%20user%EF%BC%8C%E5%88%99%E8%BF%94%E5%9B%9E%E5%B8%A6%20tool_calls%20%E7%9A%84%20assistant%20%E6%B6%88%E6%81%AF%EF%BC%9B%E5%90%A6%E5%88%99%E8%BF%94%E5%9B%9E%E6%9C%80%E7%BB%88%E6%96%87%E6%9C%AC%E3%80%82%5Cnasync%20function*%20mockStreamWithTools(%5Cn%20%20requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20msgs%20%3D%20requestBody.messages%20%7C%7C%20%5B%5D%5Cn%20%20const%20last%20%3D%20msgs%5Bmsgs.length%20-%201%5D%5Cn%20%20const%20id%20%3D%20'mock-tool-'%20%2B%20Date.now()%5Cn%5Cn%20%20if%20(last%3F.role%20%3D%3D%3D%20'tool')%20%7B%5Cn%20%20%20%20%2F%2F%20%E7%AC%AC%E4%BA%8C%E8%BD%AE%EF%BC%9A%E8%BF%94%E5%9B%9E%E6%9C%80%E7%BB%88%E5%9B%9E%E7%AD%94%EF%BC%88%E6%97%A0%20tool_calls%EF%BC%89%5Cn%20%20%20%20const%20text%20%3D%20'%E6%A0%B9%E6%8D%AE%E5%A4%A9%E6%B0%94%E7%BB%93%E6%9E%9C%EF%BC%8C%E6%80%BB%E7%BB%93%E5%A6%82%E4%B8%8B%EF%BC%9A%E6%99%B4%EF%BC%8C25%C2%B0C%E3%80%82'%5Cn%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20text.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%2060))%5Cn%20%20%20%20%20%20const%20content%20%3D%20text%5Bi%5D%5Cn%20%20%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%20%7D%20%3A%20%7B%20content%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20text.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20%2F%2F%20%E7%AC%AC%E4%B8%80%E8%BD%AE%EF%BC%9A%E8%BF%94%E5%9B%9E%20tool_calls%EF%BC%88get_weather%EF%BC%89%5Cn%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20400))%5Cn%20%20yield%20%7B%5Cn%20%20%20%20id%2C%5Cn%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20tool_calls%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3A%20'call_mock_weather_1'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20'get_weather'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20arguments%3A%20'%7B%5C%22city%5C%22%3A%5C%22Beijing%5C%22%7D'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'tool_calls'%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20getTools%20%3D%20async%20()%3A%20Promise%3CTool%5B%5D%3E%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get_weather'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E6%A0%B9%E6%8D%AE%E5%9F%8E%E5%B8%82%E5%90%8D%E7%A7%B0%E6%9F%A5%E8%AF%A2%E5%A4%A9%E6%B0%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20city%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'city'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%9AtoolPlugin%20%E7%9A%84%20getTools%20%2B%20callTool%EF%BC%8CresponseProvider%20%E6%A8%A1%E6%8B%9F%20tool_calls%5Cn%20*%2F%5Cnexport%20function%20useMessageToolCall()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20mockStreamWithTools%2C%5Cn%20%20%20%20plugins%3A%20%5B%5Cn%20%20%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20%20%20getTools%2C%5Cn%20%20%20%20%20%20%20%20callTool%3A%20async%20(toolCall)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%5Cn%20%20%20%20%20%20%20%20%20%20return%20%60%24%7Bargs.city%7D%20%E5%A4%A9%E6%B0%94%EF%BC%9A%E6%99%B4%EF%BC%8C25%C2%B0C%E3%80%82%60%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20toolCallCancelledContent%3A%20'%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E5%B7%B2%E5%8F%96%E6%B6%88%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20toolCallFailedContent%3A%20'%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E5%A4%B1%E8%B4%A5%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%AF%E8%AF%A2%E9%97%AE%E5%A4%A9%E6%B0%94%EF%BC%88%E5%A6%82%E3%80%8C%E5%8C%97%E4%BA%AC%E5%A4%A9%E6%B0%94%E6%80%8E%E4%B9%88%E6%A0%B7%EF%BC%9F%E3%80%8D%EF%BC%89%EF%BC%8C%E7%A4%BA%E4%BE%8B%E4%BC%9A%E6%A8%A1%E6%8B%9F%E4%B8%80%E6%AC%A1%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22ToolCall.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FToolCall.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%20%3Ccode%3EtoolPlugin%3C%2Fcode%3E%20%E5%81%9A%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%9A%3Ccode%3EgetTools%3C%2Fcode%3E%20%2B%20%3Ccode%3EcallTool%3C%2Fcode%3E%E3%80%82%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%20API%20%E8%BF%94%E5%9B%9E%5Cn%20%20%20%20%20%20tool_calls%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E8%AF%A2%E9%97%AE%E5%A4%A9%E6%B0%94%EF%BC%88%E5%A6%82%EF%BC%9A%E5%8C%97%E4%BA%AC%EF%BC%89'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageToolCall%20%7D%20from%20'.%2FToolCall'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageToolCall()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%20%20tool%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{r.value=!1}),vueCode:n(P)},u({_:2},[m.value?{name:"vue",fn:i(()=>[t(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[22]||(e[22]=g(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p><code>useMessage</code>、插件和 Types 小节列出的类型均从 <code>@opentiny/tiny-robot-kit</code> 导入。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> message</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(options: UseMessageOptions): UseMessageReturn</span></span></code></pre></div><h3 id="配置" tabindex="-1">配置 <a class="header-anchor" href="#配置" aria-label="Permalink to &quot;配置&quot;">​</a></h3><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>responseProvider</code></td><td><code>ResponseProvider</code></td><td>是</td><td>—</td><td>接收清洗后的请求体与 <code>AbortSignal</code>，返回完整或流式响应。初始化后也可通过返回对象中的同名 Ref 动态替换。</td></tr><tr><td><code>initialMessages</code></td><td><code>ChatMessage[]</code></td><td>否</td><td><code>[]</code></td><td>创建引擎时读取并转为响应式消息；后续替换原数组不会同步。</td></tr><tr><td><code>requestMessageFields</code></td><td><code>string[]</code></td><td>否</td><td><code>[]</code>（保留所有字段）</td><td>请求消息字段白名单。非空时先选择这些字段。</td></tr><tr><td><code>requestMessageFieldsExclude</code></td><td><code>string[]</code></td><td>否</td><td><code>[&#39;state&#39;, &#39;metadata&#39;, &#39;loading&#39;]</code></td><td>在白名单处理后排除字段，避免把界面状态发给模型。</td></tr><tr><td><code>plugins</code></td><td><code>UseMessagePlugin[]</code></td><td>否</td><td><code>[]</code></td><td>在默认插件之后安装的插件。配置只在初始化时读取；同名插件以后者覆盖前者。</td></tr><tr><td><code>onCompletionChunk</code></td><td><code>(context, runDefault) =&gt; void</code></td><td>否</td><td>—</td><td>顶层响应块处理入口；提供后不会自动执行默认合并。</td></tr></tbody></table><h4 id="responseprovider" tabindex="-1">ResponseProvider <a class="header-anchor" href="#responseprovider" aria-label="Permalink to &quot;ResponseProvider&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ResponseProvider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatCompletion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  requestBody</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MessageRequestBody</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  abortSignal</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AbortSignal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AsyncGenerator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AsyncGenerator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&gt;</span></span></code></pre></div><p>每次请求都会创建新的 <code>AbortSignal</code>。Provider 应把它传给 <code>fetch</code> 或自己的异步任务，并在取消后停止继续产出响应块。返回结果需要符合 <code>ChatCompletion</code> 的完整响应或流式 chunk 结构；每个 chunk 从 <code>choices</code> 中按 <code>index === 0</code> 优先选择内容。</p><h3 id="状态" tabindex="-1">状态 <a class="header-anchor" href="#状态" aria-label="Permalink to &quot;状态&quot;">​</a></h3><table tabindex="0"><thead><tr><th>返回字段</th><th>类型</th><th>写入方</th><th>说明</th></tr></thead><tbody><tr><td><code>messages</code></td><td><code>Ref&lt;ChatMessage[]&gt;</code></td><td>引擎 / 应用</td><td>当前消息列表。引擎追加用户、助手和工具消息；应用可以用于初始化后的界面调整，但应避免在请求中重排当前回合。</td></tr><tr><td><code>requestState</code></td><td><code>Ref&lt;RequestState&gt;</code></td><td>引擎</td><td>当前回合状态。</td></tr><tr><td><code>processingState</code></td><td><code>Ref&lt;RequestProcessingState | undefined&gt;</code></td><td>引擎</td><td>仅在 <code>requestState === &#39;processing&#39;</code> 时有值。</td></tr><tr><td><code>responseProvider</code></td><td><code>Ref&lt;UseMessageOptions[&#39;responseProvider&#39;]&gt;</code></td><td>应用</td><td>修改 <code>.value</code> 后，后续请求使用新的 Provider；正在执行的请求仍使用回合开始时的 Provider。</td></tr></tbody></table><h3 id="派生状态" tabindex="-1">派生状态 <a class="header-anchor" href="#派生状态" aria-label="Permalink to &quot;派生状态&quot;">​</a></h3><table tabindex="0"><thead><tr><th>返回字段</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>isProcessing</code></td><td><code>ComputedRef&lt;boolean&gt;</code></td><td>当前是否正在请求或合并响应；暂停等待外部确认时为 <code>false</code>。</td></tr><tr><td><code>isPaused</code></td><td><code>ComputedRef&lt;boolean&gt;</code></td><td>当前回合是否暂停。</td></tr><tr><td><code>canStartTurn</code></td><td><code>ComputedRef&lt;boolean&gt;</code></td><td>是否允许开始新回合。处理或暂停期间为 <code>false</code>。</td></tr></tbody></table><h3 id="动作" tabindex="-1">动作 <a class="header-anchor" href="#动作" aria-label="Permalink to &quot;动作&quot;">​</a></h3><table tabindex="0"><thead><tr><th>动作</th><th>签名</th><th>短路、错误与副作用</th></tr></thead><tbody><tr><td><code>sendMessage</code></td><td><code>(content: string) =&gt; Promise&lt;void&gt;</code></td><td>去除首尾空白后追加一条 user 消息并运行回合。空文本或 <code>canStartTurn === false</code> 时警告并直接完成；请求错误会拒绝 Promise。</td></tr><tr><td><code>send</code></td><td><code>(...messages: ChatMessage[]) =&gt; Promise&lt;void&gt;</code></td><td>原样追加一组消息并运行回合。当前不能开始回合时警告并直接完成；请求错误会拒绝 Promise。</td></tr><tr><td><code>abortRequest</code></td><td><code>() =&gt; Promise&lt;void&gt;</code></td><td>取消正在处理的 Provider 并等待回合离开 processing；暂停时执行插件清理并转为 aborted；没有活动回合时直接完成。</td></tr><tr><td><code>dispatchCommand</code></td><td><code>&lt;Result&gt;(command: string, payload?: unknown) =&gt; Promise&lt;Result&gt;</code></td><td>调用注册该命令的插件。未知、禁用或当前状态不允许的命令会拒绝 Promise；命令可以追加消息、恢复暂停回合或请求下一轮。</td></tr></tbody></table><h3 id="请求状态" tabindex="-1">请求状态 <a class="header-anchor" href="#请求状态" aria-label="Permalink to &quot;请求状态&quot;">​</a></h3><table tabindex="0"><thead><tr><th><code>requestState</code></th><th>含义</th><th>可开始新回合</th></tr></thead><tbody><tr><td><code>idle</code></td><td>引擎刚创建，尚未运行回合。</td><td>是</td></tr><tr><td><code>processing</code></td><td>正在执行钩子、请求 Provider 或合并响应。</td><td>否</td></tr><tr><td><code>paused</code></td><td>当前回合等待工具确认或其他外部恢复。</td><td>否</td></tr><tr><td><code>completed</code></td><td>当前回合正常结束。</td><td>是</td></tr><tr><td><code>aborted</code></td><td>当前回合已取消。</td><td>是</td></tr><tr><td><code>error</code></td><td>Provider 或生命周期抛错。</td><td>是</td></tr></tbody></table><p><code>processingState</code> 的内置值包括：</p><ul><li><code>requesting</code>：准备请求、等待首个有效响应块或发起后续请求；</li><li><code>completing</code>：已经收到响应块并正在合并；</li><li><code>pausing</code>：插件正在把当前回合转换为暂停状态；</li><li>插件也可以通过 <code>setRequestState</code> 使用自定义字符串。</li></ul><h3 id="插件" tabindex="-1">插件 <a class="header-anchor" href="#插件" aria-label="Permalink to &quot;插件&quot;">​</a></h3><p>默认安装 <code>thinkingPlugin()</code> 和 <code>lengthPlugin()</code>。传入同名插件可以覆盖默认实例，例如使用 <code>thinkingPlugin({ disabled: true })</code> 禁用思考状态处理。<code>toolPlugin</code> 不会默认安装。</p><h4 id="生命周期" tabindex="-1">生命周期 <a class="header-anchor" href="#生命周期" aria-label="Permalink to &quot;生命周期&quot;">​</a></h4><table tabindex="0"><thead><tr><th>钩子</th><th>时机与执行规则</th></tr></thead><tbody><tr><td><code>onInit</code></td><td>引擎创建时同步执行；必须通过初始化上下文的 setter 修改状态，不能返回 Promise 或其他值。</td></tr><tr><td><code>onTurnStart</code></td><td>新用户回合开始后、首个请求前，按插件顺序等待执行。恢复暂停回合时不重复调用。</td></tr><tr><td><code>onBeforeRequest</code></td><td>每次请求发送前按插件顺序等待执行，包括插件触发的后续请求。</td></tr><tr><td><code>onCompletionChunk</code></td><td>顶层响应块处理完成后同步调用；是否已经执行默认合并取决于顶层处理是否调用 <code>runDefault()</code>。</td></tr><tr><td><code>onAfterRequest</code></td><td>一次 Provider 响应消费完成后并行执行；可以追加消息或请求下一轮。</td></tr><tr><td><code>onTurnPause</code> / <code>onTurnResume</code></td><td>回合进入暂停状态后 / 从暂停状态恢复请求前，按插件顺序等待执行。</td></tr><tr><td><code>onTurnAbort</code></td><td>处理或暂停回合被外部取消时按插件顺序等待执行。</td></tr><tr><td><code>onTurnEnd</code></td><td>回合正常完成后按插件顺序等待执行。取消回合不调用。</td></tr><tr><td><code>onError</code></td><td>回合出错后按插件顺序等待执行；钩子错误会记录但不替换原始错误。</td></tr><tr><td><code>onFinally</code></td><td>每次回合结束时同步执行；钩子错误只记录。</td></tr><tr><td><code>commands</code></td><td>注册供 <code>dispatchCommand</code> 调用的命令。命令名全局重复会在初始化时抛错。</td></tr></tbody></table><p><code>BasePluginContext</code> 提供当前消息、回合 ID、请求状态、<code>AbortSignal</code>、插件列表和 <code>customContext</code>。<code>customContext</code> 只在当前回合内共享；新回合会重置，暂停与恢复期间保留。</p><h4 id="lengthplugin" tabindex="-1">lengthPlugin <a class="header-anchor" href="#lengthplugin" aria-label="Permalink to &quot;lengthPlugin&quot;">​</a></h4><p>模型以 <code>finish_reason: &#39;length&#39;</code> 结束时，<code>lengthPlugin</code> 追加一条 user 消息并自动请求下一段。它默认启用。</p><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>continueContent</code></td><td><code>string</code></td><td><code>&#39;Please continue with your previous answer.&#39;</code></td><td>自动续写时追加的 user 消息内容。</td></tr></tbody></table><h4 id="thinkingplugin" tabindex="-1">thinkingPlugin <a class="header-anchor" href="#thinkingplugin" aria-label="Permalink to &quot;thinkingPlugin&quot;">​</a></h4><p><code>thinkingPlugin</code> 根据 <code>reasoning_content</code> 更新助手消息的 <code>state.thinking</code> 和 <code>state.open</code>。收到思考内容时展开，普通内容或回合结束时收起。它默认启用，其他配置来自通用插件字段。</p><h4 id="skillplugin" tabindex="-1">skillPlugin <a class="header-anchor" href="#skillplugin" aria-label="Permalink to &quot;skillPlugin&quot;">​</a></h4><p><code>skillPlugin</code> 根据应用选择的 Skill 生成当前请求的 instructions，并可向 <code>toolPlugin</code> 提供 Skill 资源工具。它不会默认安装，也不会自行决定 instructions 在具体 Provider 请求中的承载位置。选择模式、响应式配置和资源工具的完整说明见 <a href="./skill.html#vue-skillplugin">Skill</a>。</p><h4 id="toolplugin" tabindex="-1">toolPlugin <a class="header-anchor" href="#toolplugin" aria-label="Permalink to &quot;toolPlugin&quot;">​</a></h4><p><code>toolPlugin</code> 需要显式传入 <code>plugins</code>。<code>getTools</code> 提供工具 schema，<code>callTool</code> 执行没有本地 handler 的 function tool；<code>skillPlugin</code> 也可以向同一轮请求贡献 Skill 资源工具。</p><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>getTools</code></td><td><code>(context) =&gt; MaybePromise&lt;ToolProviderItem[]&gt;</code></td><td>是</td><td>—</td><td>返回当前请求可用的 OpenAI tool schema 或带本地 handler 的 runtime tool。</td></tr><tr><td><code>callTool</code></td><td><code>(toolCall, context) =&gt; MaybeStreamableResult&lt;string | Record&lt;string, unknown&gt;&gt;</code></td><td>是</td><td>—</td><td>执行普通 function tool。结果写入对应 tool 消息；上下文包含 <code>toolMessage</code> 和 <code>toolSource</code>。</td></tr><tr><td><code>beforeCallTools</code></td><td><code>(toolCalls, context) =&gt; Promise&lt;void&gt;</code></td><td>否</td><td>—</td><td>执行一批工具前进行校验、鉴权或遥测。</td></tr><tr><td><code>shouldPauseToolCall</code></td><td><code>(toolCall, context) =&gt; boolean | Promise&lt;boolean&gt;</code></td><td>否</td><td>—</td><td>返回 <code>true</code> 时仅暂停当前工具并等待外部确认，同批其他工具仍可继续。</td></tr><tr><td><code>maxToolRounds</code></td><td><code>number</code></td><td>否</td><td>不限制</td><td>单个用户回合允许的工具调用批次数；必须为非负整数，<code>0</code> 表示不执行工具。</td></tr><tr><td><code>onLimitExceeded</code></td><td><code>(toolCalls, context) =&gt; MaybePromise&lt;void&gt;</code></td><td>否</td><td>—</td><td>下一批超过轮次上限时调用；不能放行超限工具。</td></tr><tr><td><code>onToolCallStart</code></td><td><code>(toolCall, context) =&gt; void</code></td><td>否</td><td>—</td><td>tool 消息已追加、实际执行前调用。</td></tr><tr><td><code>onToolCallEnd</code></td><td><code>(toolCall, context) =&gt; void</code></td><td>否</td><td>—</td><td>工具以 <code>success</code>、<code>failed</code>、<code>cancelled</code> 或 <code>denied</code> 结束时调用。</td></tr><tr><td><code>toolCallAwaitingApprovalContent</code></td><td><code>string</code></td><td>否</td><td><code>&#39;Tool call awaiting confirmation.&#39;</code></td><td>等待确认时写入 tool 消息的内容。</td></tr><tr><td><code>toolCallCancelledContent</code></td><td><code>string</code></td><td>否</td><td><code>&#39;Tool call cancelled.&#39;</code></td><td>取消或补齐缺失 tool 消息时使用的内容。</td></tr><tr><td><code>toolCallFailedContent</code></td><td><code>string</code></td><td>否</td><td><code>&#39;Tool call failed.&#39;</code></td><td>执行失败或拒绝时使用的内容。</td></tr><tr><td><code>persistPausedTurn</code></td><td><code>boolean</code></td><td>否</td><td><code>true</code></td><td>是否把暂停回合快照写入浏览器 LocalStorage，以便重建引擎后恢复。</td></tr><tr><td><code>autoFillMissingToolMessages</code></td><td><code>boolean</code></td><td>否</td><td><code>false</code></td><td>下一轮请求前是否为历史中缺失的 tool 结果补充取消消息。</td></tr></tbody></table><p>工具审批通过插件命令完成：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> message.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dispatchCommand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">TOOL_RESUME_COMMAND</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, { toolCallId: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;call-123&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> message.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dispatchCommand</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">TOOL_REJECT_COMMAND</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  toolCallId: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;call-456&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  reason: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;用户拒绝执行该工具&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>两个命令每次只处理一个 <code>toolCallId</code>，并返回 <code>ToolCallCommandResult</code>。恢复会执行该工具并继续回合；拒绝会把状态标记为 <code>denied</code>，但不会直接中止整个回合。</p><p>一个工具调用轮次是一条包含一个或多个 <code>tool_calls</code> 的 assistant 响应。同一响应中的多个调用只计一轮。下一批超过 <code>maxToolRounds</code> 时，该批工具不会执行；插件补充取消结果后发起不允许再次调用工具的关闭请求。</p><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类型名</th><th>类别 / 用途</th><th>说明</th></tr></thead><tbody><tr><td><code>UseMessageOptions</code></td><td>配置</td><td><code>useMessage</code> 初始化配置。</td></tr><tr><td><code>UseMessageReturn</code></td><td>返回值</td><td>响应式状态、派生状态和动作。</td></tr><tr><td><code>ResponseProvider&lt;T&gt;</code></td><td>回调</td><td>完整或流式响应提供者。</td></tr><tr><td><code>MessageRequestBody</code></td><td>请求模型</td><td>至少包含 <code>messages</code>，并允许 Provider 所需的其他字段。</td></tr><tr><td><code>ChatMessage</code></td><td>数据模型</td><td>消息对象；包含角色、内容、元数据和可选工具字段。</td></tr><tr><td><code>ChatCompletion</code> / <code>CompletionChoice</code></td><td>响应模型</td><td>Provider 返回的完整或增量响应结构。</td></tr><tr><td><code>RequestState</code> / <code>RequestProcessingState</code></td><td>状态</td><td>回合状态和处理子状态。</td></tr><tr><td><code>UseMessagePlugin</code></td><td>扩展接口</td><td>Vue 消息引擎插件及生命周期。</td></tr><tr><td><code>UseMessagePluginCommandHandler</code></td><td>扩展接口</td><td>插件命令处理函数。</td></tr><tr><td><code>BasePluginContext</code></td><td>插件上下文</td><td>插件读取状态、共享回合数据和响应取消信号的上下文。</td></tr><tr><td><code>UseMessagePluginInitContext</code></td><td>插件上下文</td><td><code>onInit</code> 专用的同步初始化上下文。</td></tr><tr><td><code>UseMessageErrorContext</code></td><td>插件上下文</td><td><code>onError</code> 上下文，额外提供错误和追加消息动作。</td></tr><tr><td><code>UseMessageToolActionContext</code></td><td>工具上下文</td><td>批量工具执行前的上下文，包含 assistant 消息。</td></tr><tr><td><code>UseMessageCallToolContext</code></td><td>工具上下文</td><td><code>callTool</code> 上下文，额外包含 tool 消息和工具来源。</td></tr><tr><td><code>UseMessageToolLimitExceededContext</code></td><td>工具上下文</td><td>工具轮次超限上下文。</td></tr><tr><td><code>UseMessageToolCallContext</code></td><td>工具上下文</td><td>单个工具开始、结束与暂停判断的上下文。</td></tr><tr><td><code>ToolCallCommandPayload</code> / <code>ToolCallCommandResult</code></td><td>命令</td><td>工具确认和拒绝命令的参数与结果。</td></tr><tr><td><code>UseMessageSkillPluginOptions</code></td><td>Skill 配置</td><td>Vue <code>skillPlugin</code> 的响应式配置。</td></tr><tr><td><code>SkillRequestContext</code> / <code>SkillSelection</code></td><td>Skill 状态</td><td>当前请求的 Skill 解析结果和选择模式。</td></tr><tr><td><code>Tool</code> / <code>ToolCall</code></td><td>工具模型</td><td>请求工具定义和消息中的工具调用结构。</td></tr><tr><td><code>Choice</code> / <code>DeltaChoice</code> / <code>Usage</code></td><td>响应模型</td><td>完整选择、增量选择和 token 使用量。</td></tr><tr><td><code>AsyncStreamableResult&lt;T&gt;</code> / <code>MaybeStreamableResult&lt;T&gt;</code></td><td>工具类型</td><td>描述 Promise、AsyncGenerator 和同步工具结果。</td></tr></tbody></table><p><code>toolPlugin</code> 的工具项与工具来源当前没有从包根导出独立的命名类型；调用 <code>toolPlugin</code> 时应依靠参数推断。插件只为 function tool 建立名称去重、来源记录和 runtime handler 路由。OpenAI <code>custom</code> tool 可以保留在请求体中，但不会进入这套本地执行流程。</p><h2 id="迁移与弃用" tabindex="-1">迁移与弃用 <a class="header-anchor" href="#迁移与弃用" aria-label="Permalink to &quot;迁移与弃用&quot;">​</a></h2><p>本页描述当前公开 API。仍在使用 <code>client</code>、<code>messageState</code> 或旧事件入口的项目，可参考 <a href="./../migration/use-message-migration.html">useMessage 迁移</a> 进入以 <code>responseProvider</code>、请求状态和插件为核心的当前架构；迁移后请以本页 API 为准。</p>`,42))])}}});export{X as __pageData,G as default};
