const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/ToolCall.DtwxtEDW.js","assets/chunks/theme.DE5H-yyn.js","assets/chunks/framework.BrPBGZf4.js","assets/chunks/index.DWQOBdIN.js","assets/chunks/CustomChunk.DvhVz96q.js","assets/chunks/MockStream.CVRUNVek.js","assets/chunks/ErrorHandling.B02u2UG1.js","assets/chunks/OnBeforeRequest.B-SKmENV.js","assets/chunks/RequestState.C1elNHSb.js","assets/chunks/NonStreaming.7Tzo4O11.js","assets/chunks/Basic.BbXiKI3L.js"])))=>i.map(i=>d[i]);
import{aD as p,bQ as h,aZ as f,aL as M,v as x,H as v,bL as k,bB as C,J as n,bk as e,bJ as r,G as d,w as i,I as a,b7 as E,aU as S}from"./chunks/framework.BrPBGZf4.js";import{L as c,N as g}from"./chunks/index.CIWzME_L.js";const P=`<template>
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
`,T=`<template>
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
`,R=`<template>
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

const { messages, isProcessing, sendMessage, abortRequest } = useMessageOnBeforeRequest()

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
`,_=`<template>
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
`,U=`<template>
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
`,X=JSON.parse('{"title":"useMessage 消息数据管理","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),W={name:"tools/message.md"},G=Object.assign(W,{setup(L){const A=E();p(async()=>{A.value=(await h(async()=>{const{default:l}=await import("./chunks/ToolCall.DtwxtEDW.js");return{default:l}},__vite__mapDeps([0,1,2,3]))).default});const B=E();p(async()=>{B.value=(await h(async()=>{const{default:l}=await import("./chunks/CustomChunk.DvhVz96q.js");return{default:l}},__vite__mapDeps([4,1,2,3]))).default});const u=E();p(async()=>{u.value=(await h(async()=>{const{default:l}=await import("./chunks/MockStream.CVRUNVek.js");return{default:l}},__vite__mapDeps([5,1,2,3]))).default});const F=E();p(async()=>{F.value=(await h(async()=>{const{default:l}=await import("./chunks/ErrorHandling.B02u2UG1.js");return{default:l}},__vite__mapDeps([6,1,2,3]))).default});const y=E();p(async()=>{y.value=(await h(async()=>{const{default:l}=await import("./chunks/OnBeforeRequest.B-SKmENV.js");return{default:l}},__vite__mapDeps([7,1,2,3]))).default});const D=E();p(async()=>{D.value=(await h(async()=>{const{default:l}=await import("./chunks/RequestState.C1elNHSb.js");return{default:l}},__vite__mapDeps([8,1,2,3]))).default});const m=E();p(async()=>{m.value=(await h(async()=>{const{default:l}=await import("./chunks/NonStreaming.7Tzo4O11.js");return{default:l}},__vite__mapDeps([9,1,2,3]))).default});const t=S(!0),b=E();return p(async()=>{b.value=(await h(async()=>{const{default:l}=await import("./chunks/Basic.BbXiKI3L.js");return{default:l}},__vite__mapDeps([10,1,2,3]))).default}),(l,s)=>{const o=f("ClientOnly");return M(),x("div",null,[s[8]||(s[8]=v("",7)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FBasic.ts%22%2C%22code%22%3A%22import%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F%2F%20%E8%8B%A5%E6%9C%89%20import.meta%20%E5%88%99%E5%8F%96%20BASE_URL%EF%BC%8C%E5%90%A6%E5%88%99%E4%B8%BA%E7%A9%BA%E5%AD%97%E7%AC%A6%E4%B8%B2%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E5%9F%BA%E7%A1%80%E7%94%A8%E6%B3%95%EF%BC%9AresponseProvider%20%E5%8F%91%E8%B5%B7%E6%B5%81%E5%BC%8F%E8%AF%B7%E6%B1%82%EF%BC%8CinitialMessages%20%E5%B1%95%E7%A4%BA%E6%AC%A2%E8%BF%8E%E8%AF%AD%5Cn%20*%2F%5Cnexport%20function%20useMessageBasic()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFAI%E5%8A%A9%E6%89%8B%EF%BC%8C%E6%9C%89%E4%BB%80%E4%B9%88%E5%8F%AF%E4%BB%A5%E5%B8%AE%E5%8A%A9%E4%BD%A0%E7%9A%84%E5%90%97%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageBasic%20%7D%20from%20'.%2FBasic'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageBasic()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:e(U)},d({_:2},[b.value?{name:"vue",fn:r(()=>[n(e(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[9]||(s[9]=i("p",null,[i("strong",null,"非流式"),a("："),i("code",null,"responseProvider"),a(" 返回 "),i("code",null,"Promise<ChatCompletion>"),a("，一次性得到完整结果，适用于不支持 SSE 的后端（"),i("code",null,"stream: false"),a("）。")],-1)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22NonStreaming.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FNonStreaming.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E9%9D%9E%E6%B5%81%E5%BC%8F%EF%BC%9AresponseProvider%20%E8%BF%94%E5%9B%9E%20Promise%3CChatCompletion%3E%EF%BC%8C%E4%B8%80%E6%AC%A1%E6%80%A7%E5%BE%97%E5%88%B0%E5%AE%8C%E6%95%B4%E7%BB%93%E6%9E%9C%5Cn%20*%2F%5Cnexport%20function%20useMessageNonStreaming()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%3A%20Promise%3CChatCompletion%3E%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20false%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20response.json()%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E9%9D%9E%E6%B5%81%E5%BC%8F%E6%8E%A5%E5%8F%A3%EF%BC%88stream%3A%20false%EF%BC%89%EF%BC%8C%E4%B8%80%E6%AC%A1%E6%80%A7%E8%BF%94%E5%9B%9E%E5%AE%8C%E6%95%B4%E7%BB%93%E6%9E%9C%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22NonStreaming.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FNonStreaming.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageNonStreaming%20%7D%20from%20'.%2FNonStreaming'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageNonStreaming()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:e(w)},d({_:2},[m.value?{name:"vue",fn:r(()=>[n(e(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[10]||(s[10]=i("h3",{id:"请求状态",tabindex:"-1"},[a("请求状态 "),i("a",{class:"header-anchor",href:"#请求状态","aria-label":'Permalink to "请求状态"'},"​")],-1)),s[11]||(s[11]=i("p",null,[a("根据 "),i("code",null,"requestState"),a("（idle / processing / completed / aborted / error）和 "),i("code",null,"processingState"),a("（requesting / completing）驱动 UI：加载、禁用发送、展示错误等。")],-1)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22RequestState.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FRequestState.ts%22%2C%22code%22%3A%22import%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E8%AF%B7%E6%B1%82%E7%8A%B6%E6%80%81%EF%BC%9AresponseProvider%20%E5%8A%A0%E5%BB%B6%E8%BF%9F%EF%BC%8C%E4%BE%BF%E4%BA%8E%E8%A7%82%E5%AF%9F%20processingState%20%E4%BB%8E%20requesting%20%E5%8F%98%E4%B8%BA%20completing%5Cn%20*%2F%5Cnexport%20function%20useMessageRequestState()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%BB%B6%E8%BF%9F%201.5s%20%E5%86%8D%E5%8F%91%E8%B5%B7%E8%AF%B7%E6%B1%82%EF%BC%8C%E4%BE%BF%E4%BA%8E%E8%A7%82%E5%AF%9F%20processingState%20%E4%BB%8E%20requesting%20%E5%8F%98%E4%B8%BA%20completing%5Cn%20%20%20%20%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%201500))%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E5%90%8E%E8%A7%82%E5%AF%9F%E7%8A%B6%E6%80%81%E6%9D%A1%EF%BC%9A%E5%85%88%E4%B8%BA%20requesting%EF%BC%8C%E6%94%B6%E5%88%B0%E9%A6%96%E5%8C%85%E5%90%8E%E5%8F%98%E4%B8%BA%20completing%EF%BC%8C%E7%BB%93%E6%9D%9F%E5%90%8E%E4%B8%BA%20completed%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22RequestState.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FRequestState.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E7%94%A8%20%3Ccode%3ErequestState%3C%2Fcode%3E%20%E5%92%8C%20%3Ccode%3EprocessingState%3C%2Fcode%3E%20%E9%A9%B1%E5%8A%A8%20UI%E3%80%82%3Ccode%3EprocessingState%3C%2Fcode%3E%20%E6%98%AF%5Cn%20%20%20%20%20%20%3Ccode%3ErequestState%3C%2Fcode%3E%20%E4%B8%BA%20processing%20%E6%97%B6%E7%9A%84%E5%AD%90%E7%8A%B6%E6%80%81%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22state-bar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22label%5C%22%3ErequestState%3A%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20%3Aclass%3D%5C%22%5B'badge'%2C%20requestState%5D%5C%22%3E%7B%7B%20requestState%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22label%5C%22%3EprocessingState%3A%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20class%3D%5C%22badge%5C%22%3E%7B%7B%20processingState%20%3F%3F%20'%E2%80%94'%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E5%8F%91%E9%80%81%E4%B8%80%E6%9D%A1%E6%B6%88%E6%81%AF'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageRequestState%20%7D%20from%20'.%2FRequestState'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%2C%20requestState%2C%20processingState%20%7D%20%3D%20useMessageRequestState()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn.state-bar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin-bottom%3A%2012px%3B%5Cn%20%20padding%3A%208px%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%208px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn.state-bar%20.label%20%7B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%7D%5Cn.badge%20%7B%5Cn%20%20padding%3A%202px%208px%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-weight%3A%20500%3B%5Cn%7D%5Cn.badge.idle%20%7B%5Cn%20%20background%3A%20var(--vp-c-gray-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-text-1)%3B%5Cn%7D%5Cn.badge.processing%20%7B%5Cn%20%20background%3A%20var(--vp-c-brand-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn.badge.completed%20%7B%5Cn%20%20background%3A%20var(--vp-c-green-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-green-1)%3B%5Cn%7D%5Cn.badge.aborted%20%7B%5Cn%20%20background%3A%20var(--vp-c-orange-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-orange-1)%3B%5Cn%7D%5Cn.badge.error%20%7B%5Cn%20%20background%3A%20var(--vp-c-red-soft)%3B%5Cn%20%20color%3A%20var(--vp-c-red-1)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:e(_)},d({_:2},[D.value?{name:"vue",fn:r(()=>[n(e(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[12]||(s[12]=i("h3",{id:"修改请求参数",tabindex:"-1"},[a("修改请求参数 "),i("a",{class:"header-anchor",href:"#修改请求参数","aria-label":'Permalink to "修改请求参数"'},"​")],-1)),s[13]||(s[13]=i("p",null,[a("通过插件的 "),i("code",null,"onBeforeRequest"),a(" 钩子在请求前修改 "),i("code",null,"requestBody"),a("（如注入 system 消息、追加 temperature 等参数）。可在 F12 开发者工具的「网络」面板中查看实际发出的请求体，验证修改是否生效。")],-1)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22OnBeforeRequest.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FOnBeforeRequest.ts%22%2C%22code%22%3A%22import%20type%20%7B%20UseMessagePlugin%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F%2F%20%E6%8F%92%E4%BB%B6%EF%BC%9A%E5%9C%A8%20onBeforeRequest%20%E4%B8%AD%E4%BF%AE%E6%94%B9%20requestBody%EF%BC%8C%E6%B3%A8%E5%85%A5%20system%20%E6%B6%88%E6%81%AF%E5%92%8C%20temperature%5Cnconst%20modifyRequestPlugin%3A%20UseMessagePlugin%20%3D%20%7B%5Cn%20%20name%3A%20'modifyRequest'%2C%5Cn%20%20onBeforeRequest(%7B%20requestBody%20%7D)%20%7B%5Cn%20%20%20%20requestBody.messages%20%3D%20%5B%5Cn%20%20%20%20%20%20%7B%20role%3A%20'system'%2C%20content%3A%20'%E4%BD%A0%E6%98%AF%E4%B8%80%E4%B8%AA%E7%AE%80%E6%B4%81%E7%9A%84%E5%8A%A9%E6%89%8B%EF%BC%8C%E8%AF%B7%E7%94%A8%E7%AE%80%E7%9F%AD%E7%9A%84%E8%AF%9D%E5%9B%9E%E5%A4%8D%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20...requestBody.messages%2C%5Cn%20%20%20%20%5D%5Cn%20%20%20%20%3B(requestBody%20as%20Record%3Cstring%2C%20unknown%3E).temperature%20%3D%200.7%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20onBeforeRequest%EF%BC%9A%E6%8F%92%E4%BB%B6%E5%9C%A8%E8%AF%B7%E6%B1%82%E5%89%8D%E4%BF%AE%E6%94%B9%20requestBody%EF%BC%88%E6%B3%A8%E5%85%A5%20system%E3%80%81%E8%BF%BD%E5%8A%A0%E5%8F%82%E6%95%B0%E7%AD%89%EF%BC%89%5Cn%20*%2F%5Cnexport%20function%20useMessageOnBeforeRequest()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20plugins%3A%20%5BmodifyRequestPlugin%5D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%9C%AC%E7%A4%BA%E4%BE%8B%E9%80%9A%E8%BF%87%20onBeforeRequest%20%E6%8F%92%E4%BB%B6%E5%9C%A8%E8%AF%B7%E6%B1%82%E5%89%8D%E6%B3%A8%E5%85%A5%20system%20%E6%B6%88%E6%81%AF%E5%92%8C%20temperature%20%E5%8F%82%E6%95%B0%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22OnBeforeRequest.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FOnBeforeRequest.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageOnBeforeRequest%20%7D%20from%20'.%2FOnBeforeRequest'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageOnBeforeRequest()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:e(I)},d({_:2},[y.value?{name:"vue",fn:r(()=>[n(e(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=i("h3",{id:"错误处理",tabindex:"-1"},[a("错误处理 "),i("a",{class:"header-anchor",href:"#错误处理","aria-label":'Permalink to "错误处理"'},"​")],-1)),s[15]||(s[15]=i("p",null,[a("通过插件的 "),i("code",null,"onError"),a(" 钩子统一处理请求错误，例如向对话中追加一条“出错”的助手消息，避免未捕获异常。")],-1)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22ErrorHandling.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FErrorHandling.ts%22%2C%22code%22%3A%22import%20type%20%7B%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20UseMessagePlugin%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F%2F%20%E6%8F%92%E4%BB%B6%EF%BC%9A%E6%A0%B9%E6%8D%AE%20error.name%20%E5%8C%BA%E5%88%86%E5%A4%84%E7%90%86%EF%BC%9BErrorRenderer%20%E6%97%B6%E8%AE%BE%E7%BD%AE%20state.error%20%E4%BE%9B%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%5Cnconst%20errorHandlingPlugin%3A%20UseMessagePlugin%20%3D%20%7B%5Cn%20%20name%3A%20'errorHandling'%2C%5Cn%20%20onError(%7B%20currentTurn%2C%20error%20%7D)%20%7B%5Cn%20%20%20%20const%20message%20%3D%20error%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%5Cn%20%20%20%20const%20lastMessage%20%3D%20currentTurn.at(-1)!%5Cn%20%20%20%20if%20(error%20instanceof%20Error%20%26%26%20error.name%20%3D%3D%3D%20'ErrorRenderer')%20%7B%5Cn%20%20%20%20%20%20if%20(!lastMessage.state)%20lastMessage.state%20%3D%20%7B%7D%5Cn%20%20%20%20%20%20lastMessage.state.error%20%3D%20%7B%20message%2C%20name%3A%20error.name%20%7D%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20lastMessage.content%20%3D%20%60%E6%8A%B1%E6%AD%89%EF%BC%8C%E5%87%BA%E9%94%99%E4%BA%86%EF%BC%9A%24%7Bmessage%7D%60%5Cn%20%20%20%20%7D%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%EF%BC%9Aplugins%20%E4%B8%AD%20onError%20%E6%A0%B9%E6%8D%AE%20error.name%20%E5%8C%BA%E5%88%86%EF%BC%9BErrorRenderer%20%E6%97%B6%E8%AE%BE%E7%BD%AE%20state.error%20%E4%BE%9B%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%5Cn%20*%2F%5Cnexport%20function%20useMessageErrorHandling()%20%7B%5Cn%20%20const%20responseProvider%20%3D%20async%20(requestBody%3A%20MessageRequestBody%2C%20abortSignal%3A%20AbortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20lastUser%20%3D%20requestBody.messages.filter((m)%20%3D%3E%20m.role%20%3D%3D%3D%20'user').pop()%5Cn%20%20%20%20const%20content%20%3D%20(lastUser%3F.content%20as%20string)%20%7C%7C%20''%5Cn%20%20%20%20if%20(content.trim().toLowerCase()%20%3D%3D%3D%20'error')%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20%20%20%20%20throw%20new%20Error('%E7%A4%BA%E4%BE%8B%EF%BC%9A%E6%A8%A1%E6%8B%9F%20API%20%E9%94%99%E8%AF%AF')%5Cn%20%20%20%20%7D%5Cn%20%20%20%20if%20(content.trim().toLowerCase()%20%3D%3D%3D%20'error-renderer')%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20300))%5Cn%20%20%20%20%20%20const%20err%20%3D%20new%20Error('%E6%B8%B2%E6%9F%93%E9%94%99%E8%AF%AF%E7%A4%BA%E4%BE%8B%EF%BC%9A%E6%AD%A4%E6%B6%88%E6%81%AF%E9%80%9A%E8%BF%87%20state.error%20%E5%8C%B9%E9%85%8D%E8%87%AA%E5%AE%9A%E4%B9%89%20error%20%E6%B8%B2%E6%9F%93%E5%99%A8%E3%80%82')%5Cn%20%20%20%20%20%20err.name%20%3D%20'ErrorRenderer'%5Cn%20%20%20%20%20%20throw%20err%5Cn%20%20%20%20%7D%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%7D%5Cn%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%7D%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20responseProvider%20as%20Parameters%3Ctypeof%20useMessage%3E%5B0%5D%5B'responseProvider'%5D%2C%5Cn%20%20%20%20plugins%3A%20%5BerrorHandlingPlugin%5D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%91%E9%80%81%E4%BB%BB%E6%84%8F%E6%B6%88%E6%81%AF%E5%8F%AF%E6%AD%A3%E5%B8%B8%E5%9B%9E%E5%A4%8D%EF%BC%9B%E8%BE%93%E5%85%A5%E3%80%8Cerror%E3%80%8D%E6%A8%A1%E6%8B%9F%20API%20%E9%94%99%E8%AF%AF%EF%BC%9B%E8%BE%93%E5%85%A5%E3%80%8Cerror-renderer%E3%80%8D%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%20error%20%E6%B8%B2%E6%9F%93%E5%99%A8%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22ErrorHandling.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FErrorHandling.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%E6%8F%92%E4%BB%B6%E7%9A%84%20%3Ccode%3EonError%3C%2Fcode%3E%20%E5%A4%84%E7%90%86%E9%94%99%E8%AF%AF%EF%BC%9B%E8%BE%93%E5%85%A5%E3%80%8Cerror-renderer%E3%80%8D%E9%80%9A%E8%BF%87%20BubbleProvider%20%E7%9A%84%20error%20%E6%B8%B2%E6%9F%93%E5%99%A8%E5%B1%95%E7%A4%BA%E4%B8%8D%E5%90%8C%20UI%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-provider%20%3Abox-renderer-matches%3D%5C%22boxRendererMatches%5C%22%20%3Acontent-renderer-matches%3D%5C%22contentRendererMatches%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3C%2Ftr-bubble-provider%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E8%BE%93%E5%85%A5%E6%B6%88%E6%81%AF%EF%BC%88error%20%2F%20error-renderer%EF%BC%89'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%5Cn%20%20BubbleRenderers%2C%5Cn%20%20TrBubbleList%2C%5Cn%20%20TrBubbleProvider%2C%5Cn%20%20TrSender%2C%5Cn%20%20type%20BubbleBoxRendererMatch%2C%5Cn%20%20type%20BubbleContentRendererMatch%2C%5Cn%20%20type%20BubbleContentRendererProps%2C%5Cn%20%20type%20BubbleRoleConfig%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineComponent%2C%20h%2C%20markRaw%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageErrorHandling%20%7D%20from%20'.%2FErrorHandling'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageErrorHandling()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cn%2F%2F%20Box%20%E5%8C%B9%E9%85%8D%EF%BC%9A%E9%94%99%E8%AF%AF%E6%B6%88%E6%81%AF%E4%BD%BF%E7%94%A8%E8%87%AA%E5%B8%A6%E7%9A%84%20Box%20%E6%B8%B2%E6%9F%93%E5%99%A8%EF%BC%8Cattributes%20%E5%8A%A0%20class%20%E5%8E%BB%E6%8E%89%20padding%EF%BC%8Cdata-shape%20%E4%B8%BA%20none%5Cnconst%20boxRendererMatches%3A%20BubbleBoxRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(messages)%20%3D%3E%20messages%5B0%5D%3F.state%3F.error%20!%3D%20null%2C%5Cn%20%20%20%20renderer%3A%20markRaw(BubbleRenderers.Box)%2C%5Cn%20%20%20%20attributes%3A%20%7B%20class%3A%20'error-box-no-padding'%2C%20'data-shape'%3A%20'none'%20%7D%2C%5Cn%20%20%20%20priority%3A%200%2C%20%2F%2F%20%E9%BB%98%E8%AE%A4%E4%BC%98%E5%85%88%E7%BA%A7%E6%98%AF0%EF%BC%8C%E4%BC%98%E5%85%88%E7%BA%A7%E8%B6%8A%E5%B0%8F%E8%B6%8A%E5%85%88%E5%8C%B9%E9%85%8D%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%20error%20%E5%86%85%E5%AE%B9%E6%B8%B2%E6%9F%93%E5%99%A8%EF%BC%9A%E5%BD%93%20message.state.error%20%E5%AD%98%E5%9C%A8%E6%97%B6%E4%BD%BF%E7%94%A8%EF%BC%8C%E4%BB%8E%20state.error%20%E8%AF%BB%E5%8F%96%E9%94%99%E8%AF%AF%E4%BF%A1%E6%81%AF%5Cnconst%20ErrorContentRenderer%20%3D%20defineComponent%3CBubbleContentRendererProps%3E(%7B%5Cn%20%20props%3A%20%7B%20message%3A%20%7B%20type%3A%20Object%2C%20required%3A%20true%20%7D%2C%20contentIndex%3A%20%7B%20type%3A%20Number%2C%20required%3A%20true%20%7D%20%7D%2C%5Cn%20%20setup(props%3A%20BubbleContentRendererProps)%20%7B%5Cn%20%20%20%20const%20errorInfo%20%3D%20props.message%3F.state%3F.error%20as%20%7B%20message%3F%3A%20string%20%7D%20%7C%20undefined%5Cn%20%20%20%20const%20errorMessage%20%3D%20errorInfo%3F.message%20%3F%3F%20''%5Cn%20%20%20%20return%20()%20%3D%3E%5Cn%20%20%20%20%20%20h(%5Cn%20%20%20%20%20%20%20%20'div'%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20class%3A%20'error-renderer'%2C%5Cn%20%20%20%20%20%20%20%20%20%20style%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20padding%3A%20'12px%2016px'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20'%23fef2f2'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20'%23dc2626'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20borderRadius%3A%20'8px'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20border%3A%20'1px%20solid%20%23fecaca'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20display%3A%20'flex'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20alignItems%3A%20'flex-start'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20gap%3A%20'8px'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20h('span'%2C%20%7B%20style%3A%20%7B%20flexShrink%3A%200%2C%20fontSize%3A%20'18px'%20%7D%20%7D%2C%20'%E2%9A%A0%EF%B8%8F')%2C%5Cn%20%20%20%20%20%20%20%20%20%20h('div'%2C%20%7B%20style%3A%20%7B%20flex%3A%201%20%7D%20%7D%2C%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20h('div'%2C%20%7B%20style%3A%20%7B%20fontWeight%3A%20600%2C%20marginBottom%3A%20'4px'%20%7D%20%7D%2C%20'%E9%94%99%E8%AF%AF')%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20h('div'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'14px'%2C%20opacity%3A%200.9%20%7D%20%7D%2C%20errorMessage)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D)%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20contentRendererMatches%3A%20BubbleContentRendererMatch%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20find%3A%20(message)%20%3D%3E%20message.state%3F.error%20!%3D%20null%2C%5Cn%20%20%20%20renderer%3A%20markRaw(ErrorContentRenderer)%2C%5Cn%20%20%20%20priority%3A%200%2C%20%2F%2F%20%E9%BB%98%E8%AE%A4%E4%BC%98%E5%85%88%E7%BA%A7%E6%98%AF0%EF%BC%8C%E4%BC%98%E5%85%88%E7%BA%A7%E8%B6%8A%E5%B0%8F%E8%B6%8A%E5%85%88%E5%8C%B9%E9%85%8D%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20%23666%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20%23f0f0f0%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%2F*%20Box%20%E5%8C%B9%E9%85%8D%E7%9A%84%20attributes.class%EF%BC%8C%E9%80%9A%E8%BF%87%E5%8F%98%E9%87%8F%E5%8E%BB%E6%8E%89%20padding%20*%2F%5Cn%3Adeep(.error-box-no-padding)%20%7B%5Cn%20%20--tr-bubble-box-padding%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:e(q)},d({_:2},[F.value?{name:"vue",fn:r(()=>[n(e(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[16]||(s[16]=i("h3",{id:"模拟流式",tabindex:"-1"},[a("模拟流式 "),i("a",{class:"header-anchor",href:"#模拟流式","aria-label":'Permalink to "模拟流式"'},"​")],-1)),s[17]||(s[17]=i("p",null,[a("使用不依赖真实 API 的 "),i("code",null,"responseProvider"),a("（如本地 AsyncGenerator）模拟流式响应，便于离线开发与联调。")],-1)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22MockStream.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FMockStream.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F%2F%20%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%EF%BC%9A%E6%8C%89%E5%AD%97%E7%AC%A6%E9%80%90%E4%B8%AA%20yield%20%E5%9B%BA%E5%AE%9A%E5%9B%9E%E5%A4%8D%E5%86%85%E5%AE%B9%5Cnasync%20function*%20mockStream(_requestBody%3A%20MessageRequestBody%2C%20abortSignal%3A%20AbortSignal)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20reply%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E6%9D%A1%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%E5%9B%9E%E5%A4%8D%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%E3%80%82'%5Cn%20%20const%20id%20%3D%20'mock-'%20%2B%20Date.now()%5Cn%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20reply.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%2030))%5Cn%20%20%20%20const%20deltaContent%20%3D%20reply%5Bi%5D%5Cn%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%3A%20deltaContent%20%7D%20%3A%20%7B%20content%3A%20deltaContent%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20reply.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%EF%BC%9AresponseProvider%20%E4%B8%BA%20AsyncGenerator%EF%BC%8C%E4%B8%8D%E4%BE%9D%E8%B5%96%E7%9C%9F%E5%AE%9E%20API%5Cn%20*%2F%5Cnexport%20function%20useMessageMockStream()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20mockStream%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%E7%9A%84%20responseProvider%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%EF%BC%8C%E9%80%82%E5%90%88%E7%A6%BB%E7%BA%BF%E5%BC%80%E5%8F%91%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22MockStream.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FMockStream.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%E6%A8%A1%E6%8B%9F%20%3Ccode%3EresponseProvider%3C%2Fcode%3E%EF%BC%9A%E4%B8%8D%E4%BE%9D%E8%B5%96%E7%9C%9F%E5%AE%9E%20API%EF%BC%8C%E7%94%A8%E4%BA%8E%E5%BC%80%E5%8F%91%E6%97%B6%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%E4%B8%AD...'%20%3A%20'%E8%BE%93%E5%85%A5%E4%BB%BB%E6%84%8F%E5%86%85%E5%AE%B9'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageMockStream%20%7D%20from%20'.%2FMockStream'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageMockStream()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:e(R)},d({_:2},[u.value?{name:"vue",fn:r(()=>[n(e(u))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[18]||(s[18]=i("h3",{id:"自定义-chunk-处理",tabindex:"-1"},[a("自定义 Chunk 处理 "),i("a",{class:"header-anchor",href:"#自定义-chunk-处理","aria-label":'Permalink to "自定义 Chunk 处理"'},"​")],-1)),s[19]||(s[19]=i("p",null,[a("使用 "),i("code",null,"onCompletionChunk"),a(" 在收到每个响应块时做自定义逻辑（如统计、日志、转换），并调用 "),i("code",null,"runDefault()"),a(" 执行默认的内容合并。")],-1)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22CustomChunk.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FCustomChunk.ts%22%2C%22code%22%3A%22import%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E8%87%AA%E5%AE%9A%E4%B9%89%20Chunk%20%E5%A4%84%E7%90%86%EF%BC%9AonCompletionChunk%20%E5%A4%84%E7%90%86%E6%AF%8F%E4%B8%AA%E6%95%B0%E6%8D%AE%E5%9D%97%EF%BC%8C%E8%B0%83%E7%94%A8%20runDefault()%20%E6%89%A7%E8%A1%8C%E9%BB%98%E8%AE%A4%E5%90%88%E5%B9%B6%5Cn%20*%2F%5Cnexport%20function%20useMessageCustomChunk()%20%7B%5Cn%20%20const%20chunkCount%20%3D%20ref(0)%5Cn%5Cn%20%20const%20result%20%3D%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20onCompletionChunk(_context%2C%20runDefault)%20%7B%5Cn%20%20%20%20%20%20chunkCount.value%20%2B%3D%201%5Cn%20%20%20%20%20%20runDefault()%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E4%B8%8A%E6%96%B9%E4%BC%9A%E7%BB%9F%E8%AE%A1%E6%9C%AC%E5%9B%9E%E5%90%88%E6%94%B6%E5%88%B0%E7%9A%84%E6%95%B0%E6%8D%AE%E5%9D%97%E6%95%B0%E9%87%8F%EF%BC%8C%E5%8F%AF%E7%94%A8%20onCompletionChunk%20%E5%81%9A%E6%97%A5%E5%BF%97%E6%88%96%E8%87%AA%E5%AE%9A%E4%B9%89%E5%90%88%E5%B9%B6%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20return%20%7B%20...result%2C%20chunkCount%20%7D%5Cn%7D%5Cn%22%7D%2C%22CustomChunk.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FCustomChunk.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%20%3Ccode%3EonCompletionChunk%3C%2Fcode%3E%20%E5%A4%84%E7%90%86%E6%AF%8F%E4%B8%AA%E6%95%B0%E6%8D%AE%E5%9D%97%EF%BC%88%E5%A6%82%E7%BB%9F%E8%AE%A1%E3%80%81%E8%BD%AC%E6%8D%A2%EF%BC%89%EF%BC%8C%E5%86%8D%E8%B0%83%E7%94%A8%5Cn%20%20%20%20%20%20%3Ccode%3ErunDefault()%3C%2Fcode%3E%20%E6%89%A7%E8%A1%8C%E9%BB%98%E8%AE%A4%E5%90%88%E5%B9%B6%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22chunk-count%5C%22%3E%E6%9C%AC%E5%9B%9E%E5%90%88%E5%B7%B2%E6%94%B6%E5%88%B0%E6%95%B0%E6%8D%AE%E5%9D%97%E6%95%B0%EF%BC%9A%7B%7B%20chunkCount%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%B5%81%E5%BC%8F%E8%BE%93%E5%87%BA%E4%B8%AD...'%20%3A%20'%E5%8F%91%E9%80%81%E4%B8%80%E6%9D%A1%E6%B6%88%E6%81%AF'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageCustomChunk%20%7D%20from%20'.%2FCustomChunk'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%2C%20chunkCount%20%7D%20%3D%20useMessageCustomChunk()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cn%2F%2F%20%E7%94%A8%E6%88%B7%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%EF%BC%88%E6%96%B0%E5%9B%9E%E5%90%88%EF%BC%89%E6%97%B6%E9%87%8D%E7%BD%AE%E6%95%B0%E6%8D%AE%E5%9D%97%E8%AE%A1%E6%95%B0%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20if%20(!content%3F.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%20%20chunkCount.value%20%3D%200%5Cn%20%20sendMessage(content.trim())%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn.chunk-count%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20color%3A%20var(--vp-c-brand-1)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{t.value=!1}),vueCode:e(T)},d({_:2},[B.value?{name:"vue",fn:r(()=>[n(e(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[20]||(s[20]=v("",2)),k(n(e(c),null,null,512),[[C,t.value]]),n(o,null,{default:r(()=>[n(e(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22ToolCall.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FToolCall.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%2C%20Tool%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20toolPlugin%2C%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F%2F%20%E6%A8%A1%E6%8B%9F%E6%B5%81%E5%BC%8F%EF%BC%9A%E8%8B%A5%E6%9C%80%E5%90%8E%E4%B8%80%E6%9D%A1%E6%98%AF%20user%EF%BC%8C%E5%88%99%E8%BF%94%E5%9B%9E%E5%B8%A6%20tool_calls%20%E7%9A%84%20assistant%20%E6%B6%88%E6%81%AF%EF%BC%9B%E5%90%A6%E5%88%99%E8%BF%94%E5%9B%9E%E6%9C%80%E7%BB%88%E6%96%87%E6%9C%AC%E3%80%82%5Cnasync%20function*%20mockStreamWithTools(%5Cn%20%20requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20msgs%20%3D%20requestBody.messages%20%7C%7C%20%5B%5D%5Cn%20%20const%20last%20%3D%20msgs%5Bmsgs.length%20-%201%5D%5Cn%20%20const%20id%20%3D%20'mock-tool-'%20%2B%20Date.now()%5Cn%5Cn%20%20if%20(last%3F.role%20%3D%3D%3D%20'tool')%20%7B%5Cn%20%20%20%20%2F%2F%20%E7%AC%AC%E4%BA%8C%E8%BD%AE%EF%BC%9A%E8%BF%94%E5%9B%9E%E6%9C%80%E7%BB%88%E5%9B%9E%E7%AD%94%EF%BC%88%E6%97%A0%20tool_calls%EF%BC%89%5Cn%20%20%20%20const%20text%20%3D%20'%E6%A0%B9%E6%8D%AE%E5%A4%A9%E6%B0%94%E7%BB%93%E6%9E%9C%EF%BC%8C%E6%80%BB%E7%BB%93%E5%A6%82%E4%B8%8B%EF%BC%9A%E6%99%B4%EF%BC%8C25%C2%B0C%E3%80%82'%5Cn%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20text.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%2060))%5Cn%20%20%20%20%20%20const%20content%20%3D%20text%5Bi%5D%5Cn%20%20%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%20%7D%20%3A%20%7B%20content%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20text.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20return%5Cn%20%20%7D%5Cn%5Cn%20%20%2F%2F%20%E7%AC%AC%E4%B8%80%E8%BD%AE%EF%BC%9A%E8%BF%94%E5%9B%9E%20tool_calls%EF%BC%88get_weather%EF%BC%89%5Cn%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20400))%5Cn%20%20yield%20%7B%5Cn%20%20%20%20id%2C%5Cn%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20tool_calls%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3A%20'call_mock_weather_1'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20'get_weather'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20arguments%3A%20'%7B%5C%22city%5C%22%3A%5C%22Beijing%5C%22%7D'%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'tool_calls'%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20getTools%20%3D%20async%20()%3A%20Promise%3CTool%5B%5D%3E%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'function'%2C%5Cn%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get_weather'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E6%A0%B9%E6%8D%AE%E5%9F%8E%E5%B8%82%E5%90%8D%E7%A7%B0%E6%9F%A5%E8%AF%A2%E5%A4%A9%E6%B0%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20parameters%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20city%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'city'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cn%2F**%5Cn%20*%20useMessage%20%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%9AtoolPlugin%20%E7%9A%84%20getTools%20%2B%20callTool%EF%BC%8CresponseProvider%20%E6%A8%A1%E6%8B%9F%20tool_calls%5Cn%20*%2F%5Cnexport%20function%20useMessageToolCall()%20%7B%5Cn%20%20return%20useMessage(%7B%5Cn%20%20%20%20responseProvider%3A%20mockStreamWithTools%2C%5Cn%20%20%20%20plugins%3A%20%5B%5Cn%20%20%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20%20%20getTools%2C%5Cn%20%20%20%20%20%20%20%20callTool%3A%20async%20(toolCall)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%5Cn%20%20%20%20%20%20%20%20%20%20return%20%60%24%7Bargs.city%7D%20%E5%A4%A9%E6%B0%94%EF%BC%9A%E6%99%B4%EF%BC%8C25%C2%B0C%E3%80%82%60%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20toolCallCancelledContent%3A%20'%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E5%B7%B2%E5%8F%96%E6%B6%88%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20toolCallFailedContent%3A%20'%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E5%A4%B1%E8%B4%A5%E3%80%82'%2C%5Cn%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20'%E5%8F%AF%E8%AF%A2%E9%97%AE%E5%A4%A9%E6%B0%94%EF%BC%88%E5%A6%82%E3%80%8C%E5%8C%97%E4%BA%AC%E5%A4%A9%E6%B0%94%E6%80%8E%E4%B9%88%E6%A0%B7%EF%BC%9F%E3%80%8D%EF%BC%89%EF%BC%8C%E7%A4%BA%E4%BE%8B%E4%BC%9A%E6%A8%A1%E6%8B%9F%E4%B8%80%E6%AC%A1%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%22%7D%2C%22ToolCall.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FToolCall.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22hint%5C%22%3E%5Cn%20%20%20%20%20%20%E4%BD%BF%E7%94%A8%20%3Ccode%3EtoolPlugin%3C%2Fcode%3E%20%E5%81%9A%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%EF%BC%9A%3Ccode%3EgetTools%3C%2Fcode%3E%20%2B%20%3Ccode%3EcallTool%3C%2Fcode%3E%E3%80%82%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E6%A8%A1%E6%8B%9F%20API%20%E8%BF%94%E5%9B%9E%5Cn%20%20%20%20%20%20tool_calls%E3%80%82%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E8%AF%A2%E9%97%AE%E5%A4%A9%E6%B0%94%EF%BC%88%E5%A6%82%EF%BC%9A%E5%8C%97%E4%BA%AC%EF%BC%89'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20useMessageToolCall%20%7D%20from%20'.%2FToolCall'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessageToolCall()%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20userAvatar%20%7D%2C%5Cn%20%20tool%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20aiAvatar%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.hint%20%7B%5Cn%20%20margin-bottom%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2)%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn.hint%20code%20%7B%5Cn%20%20padding%3A%202px%206px%3B%5Cn%20%20background%3A%20var(--vp-c-bg-soft)%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[7]||(s[7]=()=>{t.value=!1}),vueCode:e(P)},d({_:2},[A.value?{name:"vue",fn:r(()=>[n(e(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[21]||(s[21]=v("",48))])}}});export{X as __pageData,G as default};
