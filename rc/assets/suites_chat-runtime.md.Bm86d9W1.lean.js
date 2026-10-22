const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/runtime-adapter.CPZXyqqu.js","assets/chunks/index.DIbYKDkv.js","assets/chunks/framework.BHsLpWB3.js","assets/chunks/index.BFmY00BT.js","assets/chunks/theme.GyRgNn_q.js","assets/chunks/runtime-send.K-KyAaCj.js","assets/chunks/runtime-conversations.BRbxFr2j.js","assets/chunks/modelProviders.C73j7yOV.js","assets/chunks/mockConversationStorage.DyixNYcK.js","assets/chunks/runtime-composer.D2ojq5Mx.js","assets/chunks/runtime-before-send.CiBjwuOL.js","assets/chunks/runtime-actions.BO7AH0o-.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as l,aZ as B,aL as D,v as b,H as o,bL as c,bB as h,J as t,bk as n,bJ as a,G as p,b7 as C,aU as F}from"./chunks/framework.BHsLpWB3.js";import{L as u,N as m}from"./chunks/index.-rWMcHyn.js";const f=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ChatMessage, ConversationStorageStrategy, ResponseProvider } from '@opentiny/tiny-robot-kit'
import {
  TrChatUI,
  useChatRuntimeAdapter,
  useChatRuntimeFromConversation,
  type ChatHistoryActionPayload,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const messagesByConversation = new Map<string, ChatMessage[]>()

const memoryStorage: ConversationStorageStrategy = {
  loadConversations: () => [],
  loadMessages: (conversationId) => [...(messagesByConversation.get(conversationId) ?? [])],
  saveConversation: () => undefined,
  saveMessages: (conversationId, messages) => {
    messagesByConversation.set(conversationId, [...messages])
  },
  deleteConversation: (conversationId) => {
    messagesByConversation.delete(conversationId)
  },
}

let responseIndex = 0

const responseProvider: ResponseProvider = async (requestBody) => {
  const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')
  responseIndex += 1

  return {
    id: \`runtime-adapter-demo-\${responseIndex}\`,
    object: 'chat.completion',
    created: responseIndex,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: \`Runtime 已收到：\${text}\` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const conversation = useConversation({
  storage: memoryStorage,
  autoSaveMessages: true,
  autoSaveThrottle: 0,
  useMessageOptions: { responseProvider },
})
const runtime = useChatRuntimeFromConversation({ conversation })
const actionStatus = shallowRef('动作状态：正常')
const adapter = useChatRuntimeAdapter({
  runtime,
  onActionError({ action }) {
    actionStatus.value = \`动作失败：\${action}\`
  },
})

function handleHistoryAction(payload: ChatHistoryActionPayload) {
  if (payload.action.id === 'delete' && !payload.defaultPrevented) {
    adapter.deleteConversation(payload.conversation.id)
  }
}
<\/script>

<template>
  <section class="runtime-adapter-demo">
    <p class="runtime-adapter-demo__status" aria-live="polite">{{ actionStatus }}</p>
    <div class="runtime-adapter-demo__chat">
      <TrChatUI
        :data="adapter.data.value"
        :input-value="adapter.inputValue.value"
        @update:input-value="adapter.setInputValue"
        @submit="adapter.send"
        @cancel="adapter.abort"
        @clear="() => adapter.setInputValue('')"
        @create-conversation="adapter.clearActiveConversation"
        @switch-conversation="({ conversationId }) => adapter.switchConversation(conversationId)"
        @rename-conversation="({ conversationId, title }) => adapter.renameConversation(conversationId, title)"
        @history-action="handleHistoryAction"
      />
    </div>
  </section>
</template>

<style scoped>
.runtime-adapter-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.runtime-adapter-demo__status {
  margin: 0;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.runtime-adapter-demo__chat {
  box-sizing: border-box;
  width: min(100%, 720px);
  height: min(620px, calc(100vh - 280px));
  min-height: 480px;
  min-width: 0;
}

.runtime-adapter-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.runtime-adapter-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .runtime-adapter-demo__chat {
    height: 560px;
  }
}
</style>
`,_=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const defaultResult = shallowRef('尚未发送')
const customResult = shallowRef('尚未发送')
const responseProvider: ResponseProvider = async () => ({
  id: 'runtime-send-demo',
  object: 'chat.completion',
  created: 0,
  model: 'runtime-send-demo',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: '' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

function createDemoConversation() {
  return useConversation({
    useMessageOptions: { responseProvider },
  })
}

const defaultRuntime = useChatRuntimeFromConversation({ conversation: createDemoConversation() })
const customRuntime = useChatRuntimeFromConversation({
  conversation: createDemoConversation(),
  send: ({ text }) => {
    customResult.value = \`自定义 send 收到 text: \${JSON.stringify(text)}\`
  },
})

async function sendDefaultEmptyText() {
  defaultResult.value = String(await defaultRuntime.actions.send({ text: '' }))
}

async function sendCustomEmptyText() {
  const sent = await customRuntime.actions.send({ text: '' })
  customResult.value = \`\${customResult.value}，结果: \${sent}\`
}
<\/script>

<template>
  <section class="runtime-send-demo">
    <div class="runtime-send-demo__item">
      <h3>默认发送</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendDefaultEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ defaultResult }}</p>
    </div>
    <div class="runtime-send-demo__item">
      <h3>自定义 send</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendCustomEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ customResult }}</p>
    </div>
  </section>
</template>

<style scoped>
.runtime-send-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.runtime-send-demo__item {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--tr-common-border-color);
}

.runtime-send-demo__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 1px solid #2f6fad;
  border-radius: 6px;
  padding: 6px 12px;
  color: #fff;
  background: #2f6fad;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}

.runtime-send-demo__button:hover {
  border-color: #24598d;
  background: #24598d;
}

.runtime-send-demo__button:focus-visible {
  outline: 2px solid #8ab8df;
  outline-offset: 2px;
}

.runtime-send-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.runtime-send-demo__item h3,
.runtime-send-demo__item p {
  margin: 0 0 12px;
}

@media (max-width: 640px) {
  .runtime-send-demo {
    grid-template-columns: 1fr;
  }
}
</style>
`,R=`<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'
import { createMockConversationStorage } from './shared/mockConversationStorage'

const ready = shallowRef(false)
const pending = shallowRef(false)
const title = shallowRef('项目问答')
const actionError = shallowRef('')
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: createMockConversationStorage('tiny-robot-demo-runtime-conversations-v1', [
      {
        title: '项目介绍',
        messages: [
          { role: 'user', content: '这个项目提供什么功能？' },
          { role: 'assistant', content: '这里展示项目问答。切换到“使用帮助”，可查看另一组历史消息。' },
        ],
      },
      {
        title: '使用帮助',
        messages: [
          { role: 'user', content: '如何管理历史会话？' },
          { role: 'assistant', content: '点击左侧会话名称切换，通过会话菜单重命名或删除。' },
        ],
      },
    ]),
    // 本地示例即时保存，避免快速切换会话时丢失刚生成的消息。
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        if (conversations.length) await runtime.actions.switchConversation(conversations[0].id)
      } catch (error) {
        actionError.value = \`恢复会话失败：\${error instanceof Error ? error.message : String(error)}\`
      } finally {
        ready.value = true
      }
    },
  },
  composer: { disabled: computed(() => !ready.value || pending.value) },
})
const ui: ChatUIOptions = {
  layout: { leftAside: { width: 240, defaultOpen: true }, rightAside: false },
  history: { showRenameControls: true },
  welcome: false,
  prompts: false,
  model: false,
}
const active = computed(() => runtime.activeConversation.value)
const processing = computed(() => active.value?.requestState === 'processing')
const busy = computed(() => !ready.value || pending.value || processing.value)

async function createConversation() {
  if (busy.value) return
  pending.value = true
  actionError.value = ''
  try {
    await runtime.actions.createConversation({ title: title.value.trim() || '新对话' })
  } catch (error) {
    actionError.value = \`操作失败：\${error instanceof Error ? error.message : String(error)}\`
  } finally {
    pending.value = false
  }
}

function handleActionError({ error }: ChatRuntimeActionErrorPayload) {
  actionError.value = \`操作失败：\${error instanceof Error ? error.message : String(error)}\`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
<\/script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <label class="runtime-demo__label">
        会话标题
        <input v-model="title" class="runtime-demo__input" :disabled="busy" />
      </label>
      <button class="runtime-demo__button" type="button" :disabled="busy" @click="createConversation">
        立即创建会话
      </button>
    </div>
    <p v-if="actionError" class="runtime-demo__status" role="alert">{{ actionError }}</p>
    <div class="runtime-demo__chat runtime-conversations-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>

<style scoped>
.runtime-conversations-demo__chat {
  --tr-history-item-selected-bg: var(--tr-color-primary-light);
  --tr-history-item-selected-color: var(--tr-color-primary);
}
</style>
`,x=`<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const mode = shallowRef<'normal' | 'disabled' | 'submit-disabled'>('normal')
const disabled = computed(() => mode.value === 'disabled')
const submitDisabled = computed(() => mode.value === 'submit-disabled')
const error = shallowRef('')
const ready = shallowRef(false)
const presetControls = shallowRef<HTMLDivElement | null>(null)
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'tiny-robot-demo-runtime-composer-v1' }),
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        if (latest) await runtime.actions.switchConversation(latest.id)
      } catch (cause) {
        error.value = \`恢复会话失败：\${cause instanceof Error ? cause.message : String(cause)}\`
      } finally {
        ready.value = true
      }
    },
  },
  composer: { disabled, submitDisabled },
  beforeSend() {
    error.value = ''
    return 'continue'
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  header: false,
  welcome: false,
  prompts: false,
  model: false,
}
const processing = computed(() => runtime.activeConversation.value?.requestState === 'processing')
const description = computed(() => {
  if (disabled.value) return '无法编辑或发送。'
  if (submitDisabled.value) return '可以编辑和清空，但不能发送。'
  return processing.value ? '正在生成回答，可点击停止按钮取消。' : '可以编辑，内容非空时可发送。'
})

function handleActionError({ error: cause }: ChatRuntimeActionErrorPayload) {
  error.value = \`操作失败：\${cause instanceof Error ? cause.message : String(cause)}\`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
<\/script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <div ref="presetControls" class="runtime-demo__controls"></div>
      <label class="runtime-demo__label"
        ><input v-model="mode" type="radio" value="normal" :disabled="processing" /> 正常</label
      >
      <label class="runtime-demo__label"
        ><input v-model="mode" type="radio" value="disabled" :disabled="processing" /> 禁用输入区</label
      >
      <label class="runtime-demo__label"
        ><input v-model="mode" type="radio" value="submit-disabled" :disabled="processing" /> 仅禁用提交</label
      >
    </div>
    <p class="runtime-demo__status" role="status">
      <code>composer: { disabled: {{ disabled }}, submitDisabled: {{ submitDisabled }} }</code>
      — {{ description }}
    </p>
    <p v-if="error" class="runtime-demo__status" role="alert">{{ error }}</p>
    <div class="runtime-demo__chat">
      <TrChat v-if="ready" :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError">
        <template #composer-before="{ disabled: inputDisabled, loading, setInputValue }">
          <Teleport v-if="presetControls" :to="presetControls">
            <button
              class="runtime-demo__button"
              type="button"
              :disabled="inputDisabled || loading"
              @click="setInputValue('介绍一下这个项目')"
            >
              填入预设问题
            </button>
          </Teleport>
        </template>
      </TrChat>
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
`,P=`<script setup lang="ts">
import { onUnmounted, shallowRef } from 'vue'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const loggedIn = shallowRef(false)
const ready = shallowRef(false)
const status = shallowRef('先输入问题并发送，再勾选“已登录”重试。')
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'tiny-robot-demo-runtime-before-send-v1' }),
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        if (latest) await runtime.actions.switchConversation(latest.id)
      } catch (error) {
        status.value = \`恢复会话失败：\${error instanceof Error ? error.message : String(error)}\`
      } finally {
        ready.value = true
      }
    },
  },
  beforeSend() {
    if (!loggedIn.value) {
      status.value = '检查返回 reject：请先登录；输入保留，不追加消息。'
      return 'reject'
    }
    status.value = '检查返回 continue：允许发送。'
    return 'continue'
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
  model: false,
}

function handleActionError({ error }: ChatRuntimeActionErrorPayload) {
  status.value = \`操作失败：\${error instanceof Error ? error.message : String(error)}\`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
<\/script>

<template>
  <section class="runtime-demo">
    <label class="runtime-demo__label"><input v-model="loggedIn" type="checkbox" /> 已登录（模拟）</label>
    <p class="runtime-demo__status" role="status">{{ status }}</p>
    <div class="runtime-demo__chat">
      <TrChat v-if="ready" :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
`,w=`<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const ready = shallowRef(false)
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'tiny-robot-demo-runtime-actions-v1' }),
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        if (latest) await runtime.actions.switchConversation(latest.id)
      } catch (error) {
        actionError.value = \`恢复会话失败：\${error instanceof Error ? error.message : String(error)}\`
      } finally {
        ready.value = true
      }
    },
  },
  beforeSend() {
    actionError.value = ''
    return 'continue'
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
  model: false,
}
const actionError = shallowRef('')
const pending = shallowRef(false)
const processing = computed(() => runtime.activeConversation.value?.requestState === 'processing')
const status = computed(() => {
  switch (runtime.activeConversation.value?.requestState) {
    case 'processing':
      return '正在生成'
    case 'completed':
      return '已完成'
    case 'aborted':
      return '已停止'
    case 'error':
      return '请求失败'
    default:
      return '等待发送'
  }
})

async function send(text: string) {
  if (!ready.value || pending.value || processing.value) return
  pending.value = true
  try {
    await runtime.actions.send({ text })
  } catch (error) {
    actionError.value = \`发送失败：\${error instanceof Error ? error.message : String(error)}\`
  } finally {
    pending.value = false
  }
}

async function stop() {
  actionError.value = ''
  try {
    await runtime.actions.abort?.()
  } catch (error) {
    actionError.value = \`停止失败：\${error instanceof Error ? error.message : String(error)}\`
  }
}

function handleActionError({ error }: ChatRuntimeActionErrorPayload) {
  actionError.value = \`界面操作失败：\${error instanceof Error ? error.message : String(error)}\`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
<\/script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <button
        class="runtime-demo__button"
        type="button"
        :disabled="!ready || pending || processing"
        @click="send('介绍一下这个项目')"
      >
        发送预设问题
      </button>
      <button class="runtime-demo__button" type="button" :disabled="!processing" @click="stop">停止回答</button>
    </div>
    <p class="runtime-demo__status" role="status">{{ status }}</p>
    <p v-if="actionError" class="runtime-demo__status" role="alert">{{ actionError }}</p>
    <div class="runtime-demo__chat">
      <TrChat v-if="ready" :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
`,M=JSON.parse('{"title":"数据与逻辑配置","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat-runtime.md","filePath":"suites/chat-runtime.md"}'),S={name:"suites/chat-runtime.md"},U=Object.assign(S,{setup(I){const E=C();r(async()=>{E.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-adapter.CPZXyqqu.js");return{default:i}},__vite__mapDeps([0,1,2,3,4]))).default});const k=C();r(async()=>{k.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-send.K-KyAaCj.js");return{default:i}},__vite__mapDeps([5,1,2,3,4]))).default});const g=C();r(async()=>{g.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-conversations.BRbxFr2j.js");return{default:i}},__vite__mapDeps([6,2,3,4,1,7,8]))).default});const y=C();r(async()=>{y.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-composer.D2ojq5Mx.js");return{default:i}},__vite__mapDeps([9,2,1,3,4,7]))).default});const A=C();r(async()=>{A.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-before-send.CiBjwuOL.js");return{default:i}},__vite__mapDeps([10,2,1,3,4,7]))).default});const s=F(!0),v=C();return r(async()=>{v.value=(await l(async()=>{const{default:i}=await import("./chunks/runtime-actions.BO7AH0o-.js");return{default:i}},__vite__mapDeps([11,1,2,3,4,7]))).default}),(i,e)=>{const d=B("ClientOnly");return D(),b("div",null,[e[6]||(e[6]=o("",40)),c(t(n(u),null,null,512),[[h,s.value]]),t(d,null,{default:a(()=>[t(n(m),{title:"通过外部按钮发送与取消",description:"点击外部按钮发送预设问题，在回答生成过程中停止请求。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-actions.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-actions.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onUnmounted%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20TrChat%2C%5Cn%20%20useChatRuntime%2C%5Cn%20%20type%20ChatRuntimeActionErrorPayload%2C%5Cn%20%20type%20ChatUIOptions%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20ready%20%3D%20shallowRef(false)%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20storage%3A%20localStorageStrategyFactory(%7B%20key%3A%20'tiny-robot-demo-runtime-actions-v1'%20%7D)%2C%5Cn%20%20%20%20autoSaveThrottle%3A%200%2C%5Cn%20%20%20%20async%20onLoad(conversations)%20%7B%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20const%20latest%20%3D%20%5B...conversations%5D.sort((a%2C%20b)%20%3D%3E%20b.updatedAt%20-%20a.updatedAt)%5B0%5D%5Cn%20%20%20%20%20%20%20%20if%20(latest)%20await%20runtime.actions.switchConversation(latest.id)%5Cn%20%20%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20%20%20actionError.value%20%3D%20%60%E6%81%A2%E5%A4%8D%E4%BC%9A%E8%AF%9D%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%20%20%20%20%20%20%7D%20finally%20%7B%5Cn%20%20%20%20%20%20%20%20ready.value%20%3D%20true%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20beforeSend()%20%7B%5Cn%20%20%20%20actionError.value%20%3D%20''%5Cn%20%20%20%20return%20'continue'%5Cn%20%20%7D%2C%5Cn%7D)%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%2C%20rightAside%3A%20false%20%7D%2C%5Cn%20%20welcome%3A%20false%2C%5Cn%20%20prompts%3A%20false%2C%5Cn%20%20model%3A%20false%2C%5Cn%7D%5Cnconst%20actionError%20%3D%20shallowRef('')%5Cnconst%20pending%20%3D%20shallowRef(false)%5Cnconst%20processing%20%3D%20computed(()%20%3D%3E%20runtime.activeConversation.value%3F.requestState%20%3D%3D%3D%20'processing')%5Cnconst%20status%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20switch%20(runtime.activeConversation.value%3F.requestState)%20%7B%5Cn%20%20%20%20case%20'processing'%3A%5Cn%20%20%20%20%20%20return%20'%E6%AD%A3%E5%9C%A8%E7%94%9F%E6%88%90'%5Cn%20%20%20%20case%20'completed'%3A%5Cn%20%20%20%20%20%20return%20'%E5%B7%B2%E5%AE%8C%E6%88%90'%5Cn%20%20%20%20case%20'aborted'%3A%5Cn%20%20%20%20%20%20return%20'%E5%B7%B2%E5%81%9C%E6%AD%A2'%5Cn%20%20%20%20case%20'error'%3A%5Cn%20%20%20%20%20%20return%20'%E8%AF%B7%E6%B1%82%E5%A4%B1%E8%B4%A5'%5Cn%20%20%20%20default%3A%5Cn%20%20%20%20%20%20return%20'%E7%AD%89%E5%BE%85%E5%8F%91%E9%80%81'%5Cn%20%20%7D%5Cn%7D)%5Cn%5Cnasync%20function%20send(text%3A%20string)%20%7B%5Cn%20%20if%20(!ready.value%20%7C%7C%20pending.value%20%7C%7C%20processing.value)%20return%5Cn%20%20pending.value%20%3D%20true%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20runtime.actions.send(%7B%20text%20%7D)%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20actionError.value%20%3D%20%60%E5%8F%91%E9%80%81%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%20%20%7D%20finally%20%7B%5Cn%20%20%20%20pending.value%20%3D%20false%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnasync%20function%20stop()%20%7B%5Cn%20%20actionError.value%20%3D%20''%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20runtime.actions.abort%3F.()%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20actionError.value%20%3D%20%60%E5%81%9C%E6%AD%A2%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20handleActionError(%7B%20error%20%7D%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionError.value%20%3D%20%60%E7%95%8C%E9%9D%A2%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%7D%5Cn%5CnonUnmounted(()%20%3D%3E%20%7B%5Cn%20%20void%20Promise.resolve(runtime.actions.abort%3F.()).catch(()%20%3D%3E%20undefined)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20class%3D%5C%22runtime-demo__button%5C%22%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%3Adisabled%3D%5C%22!ready%20%7C%7C%20pending%20%7C%7C%20processing%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22send('%E4%BB%8B%E7%BB%8D%E4%B8%80%E4%B8%8B%E8%BF%99%E4%B8%AA%E9%A1%B9%E7%9B%AE')%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%E5%8F%91%E9%80%81%E9%A2%84%E8%AE%BE%E9%97%AE%E9%A2%98%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%3Adisabled%3D%5C%22!processing%5C%22%20%40click%3D%5C%22stop%5C%22%3E%E5%81%9C%E6%AD%A2%E5%9B%9E%E7%AD%94%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-demo__status%5C%22%20role%3D%5C%22status%5C%22%3E%7B%7B%20status%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20v-if%3D%5C%22actionError%5C%22%20class%3D%5C%22runtime-demo__status%5C%22%20role%3D%5C%22alert%5C%22%3E%7B%7B%20actionError%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20v-if%3D%5C%22ready%5C%22%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%40runtime-action-error%3D%5C%22handleActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%20src%3D%5C%22.%2Fshared%2Fruntime-demo.css%5C%22%3E%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%2C%22runtime-demo.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2Fruntime-demo.css%22%2C%22code%22%3A%22.runtime-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%2C%5Cn.runtime-demo__input%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%20%7B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Adisabled%2C%5Cn.runtime-demo__input%3Adisabled%20%7B%5Cn%20%20opacity%3A%200.5%3B%5Cn%20%20cursor%3A%20not-allowed%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Afocus-visible%2C%5Cn.runtime-demo__input%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20var(--tr-color-primary)%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%2C%5Cn.runtime-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__input%20%7B%5Cn%20%20width%3A%20min(100%25%2C%20220px)%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{s.value=!1}),vueCode:n(w)},p({_:2},[v.value?{name:"vue",fn:a(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[7]||(e[7]=o("",7)),c(t(n(u),null,null,512),[[h,s.value]]),t(d,null,{default:a(()=>[t(n(m),{title:"发送前检查登录状态",description:"切换“已登录”开关，比较阻止发送与正常发送；不执行真实登录。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-before-send.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-before-send.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20onUnmounted%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20TrChat%2C%5Cn%20%20useChatRuntime%2C%5Cn%20%20type%20ChatRuntimeActionErrorPayload%2C%5Cn%20%20type%20ChatUIOptions%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20loggedIn%20%3D%20shallowRef(false)%5Cnconst%20ready%20%3D%20shallowRef(false)%5Cnconst%20status%20%3D%20shallowRef('%E5%85%88%E8%BE%93%E5%85%A5%E9%97%AE%E9%A2%98%E5%B9%B6%E5%8F%91%E9%80%81%EF%BC%8C%E5%86%8D%E5%8B%BE%E9%80%89%E2%80%9C%E5%B7%B2%E7%99%BB%E5%BD%95%E2%80%9D%E9%87%8D%E8%AF%95%E3%80%82')%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20storage%3A%20localStorageStrategyFactory(%7B%20key%3A%20'tiny-robot-demo-runtime-before-send-v1'%20%7D)%2C%5Cn%20%20%20%20autoSaveThrottle%3A%200%2C%5Cn%20%20%20%20async%20onLoad(conversations)%20%7B%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20const%20latest%20%3D%20%5B...conversations%5D.sort((a%2C%20b)%20%3D%3E%20b.updatedAt%20-%20a.updatedAt)%5B0%5D%5Cn%20%20%20%20%20%20%20%20if%20(latest)%20await%20runtime.actions.switchConversation(latest.id)%5Cn%20%20%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20%20%20status.value%20%3D%20%60%E6%81%A2%E5%A4%8D%E4%BC%9A%E8%AF%9D%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%20%20%20%20%20%20%7D%20finally%20%7B%5Cn%20%20%20%20%20%20%20%20ready.value%20%3D%20true%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20beforeSend()%20%7B%5Cn%20%20%20%20if%20(!loggedIn.value)%20%7B%5Cn%20%20%20%20%20%20status.value%20%3D%20'%E6%A3%80%E6%9F%A5%E8%BF%94%E5%9B%9E%20reject%EF%BC%9A%E8%AF%B7%E5%85%88%E7%99%BB%E5%BD%95%EF%BC%9B%E8%BE%93%E5%85%A5%E4%BF%9D%E7%95%99%EF%BC%8C%E4%B8%8D%E8%BF%BD%E5%8A%A0%E6%B6%88%E6%81%AF%E3%80%82'%5Cn%20%20%20%20%20%20return%20'reject'%5Cn%20%20%20%20%7D%5Cn%20%20%20%20status.value%20%3D%20'%E6%A3%80%E6%9F%A5%E8%BF%94%E5%9B%9E%20continue%EF%BC%9A%E5%85%81%E8%AE%B8%E5%8F%91%E9%80%81%E3%80%82'%5Cn%20%20%20%20return%20'continue'%5Cn%20%20%7D%2C%5Cn%7D)%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%2C%20rightAside%3A%20false%20%7D%2C%5Cn%20%20welcome%3A%20false%2C%5Cn%20%20prompts%3A%20false%2C%5Cn%20%20model%3A%20false%2C%5Cn%7D%5Cn%5Cnfunction%20handleActionError(%7B%20error%20%7D%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20status.value%20%3D%20%60%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%7D%5Cn%5CnonUnmounted(()%20%3D%3E%20%7B%5Cn%20%20void%20Promise.resolve(runtime.actions.abort%3F.()).catch(()%20%3D%3E%20undefined)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-demo%5C%22%3E%5Cn%20%20%20%20%3Clabel%20class%3D%5C%22runtime-demo__label%5C%22%3E%3Cinput%20v-model%3D%5C%22loggedIn%5C%22%20type%3D%5C%22checkbox%5C%22%20%2F%3E%20%E5%B7%B2%E7%99%BB%E5%BD%95%EF%BC%88%E6%A8%A1%E6%8B%9F%EF%BC%89%3C%2Flabel%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-demo__status%5C%22%20role%3D%5C%22status%5C%22%3E%7B%7B%20status%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20v-if%3D%5C%22ready%5C%22%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%40runtime-action-error%3D%5C%22handleActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%20src%3D%5C%22.%2Fshared%2Fruntime-demo.css%5C%22%3E%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%2C%22runtime-demo.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2Fruntime-demo.css%22%2C%22code%22%3A%22.runtime-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%2C%5Cn.runtime-demo__input%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%20%7B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Adisabled%2C%5Cn.runtime-demo__input%3Adisabled%20%7B%5Cn%20%20opacity%3A%200.5%3B%5Cn%20%20cursor%3A%20not-allowed%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Afocus-visible%2C%5Cn.runtime-demo__input%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20var(--tr-color-primary)%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%2C%5Cn.runtime-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__input%20%7B%5Cn%20%20width%3A%20min(100%25%2C%20220px)%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{s.value=!1}),vueCode:n(P)},p({_:2},[A.value?{name:"vue",fn:a(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=o("",7)),c(t(n(u),null,null,512),[[h,s.value]]),t(d,null,{default:a(()=>[t(n(m),{title:"禁用输入区与仅禁用提交",description:"点击“填入预设问题”，切换禁用状态，比较输入编辑和发送按钮的变化。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-composer.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-composer.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onUnmounted%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20TrChat%2C%5Cn%20%20useChatRuntime%2C%5Cn%20%20type%20ChatRuntimeActionErrorPayload%2C%5Cn%20%20type%20ChatUIOptions%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20mode%20%3D%20shallowRef%3C'normal'%20%7C%20'disabled'%20%7C%20'submit-disabled'%3E('normal')%5Cnconst%20disabled%20%3D%20computed(()%20%3D%3E%20mode.value%20%3D%3D%3D%20'disabled')%5Cnconst%20submitDisabled%20%3D%20computed(()%20%3D%3E%20mode.value%20%3D%3D%3D%20'submit-disabled')%5Cnconst%20error%20%3D%20shallowRef('')%5Cnconst%20ready%20%3D%20shallowRef(false)%5Cnconst%20presetControls%20%3D%20shallowRef%3CHTMLDivElement%20%7C%20null%3E(null)%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20storage%3A%20localStorageStrategyFactory(%7B%20key%3A%20'tiny-robot-demo-runtime-composer-v1'%20%7D)%2C%5Cn%20%20%20%20autoSaveThrottle%3A%200%2C%5Cn%20%20%20%20async%20onLoad(conversations)%20%7B%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20const%20latest%20%3D%20%5B...conversations%5D.sort((a%2C%20b)%20%3D%3E%20b.updatedAt%20-%20a.updatedAt)%5B0%5D%5Cn%20%20%20%20%20%20%20%20if%20(latest)%20await%20runtime.actions.switchConversation(latest.id)%5Cn%20%20%20%20%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20%20%20%20%20error.value%20%3D%20%60%E6%81%A2%E5%A4%8D%E4%BC%9A%E8%AF%9D%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Bcause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%7D%60%5Cn%20%20%20%20%20%20%7D%20finally%20%7B%5Cn%20%20%20%20%20%20%20%20ready.value%20%3D%20true%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20composer%3A%20%7B%20disabled%2C%20submitDisabled%20%7D%2C%5Cn%20%20beforeSend()%20%7B%5Cn%20%20%20%20error.value%20%3D%20''%5Cn%20%20%20%20return%20'continue'%5Cn%20%20%7D%2C%5Cn%7D)%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20false%2C%20rightAside%3A%20false%20%7D%2C%5Cn%20%20header%3A%20false%2C%5Cn%20%20welcome%3A%20false%2C%5Cn%20%20prompts%3A%20false%2C%5Cn%20%20model%3A%20false%2C%5Cn%7D%5Cnconst%20processing%20%3D%20computed(()%20%3D%3E%20runtime.activeConversation.value%3F.requestState%20%3D%3D%3D%20'processing')%5Cnconst%20description%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20if%20(disabled.value)%20return%20'%E6%97%A0%E6%B3%95%E7%BC%96%E8%BE%91%E6%88%96%E5%8F%91%E9%80%81%E3%80%82'%5Cn%20%20if%20(submitDisabled.value)%20return%20'%E5%8F%AF%E4%BB%A5%E7%BC%96%E8%BE%91%E5%92%8C%E6%B8%85%E7%A9%BA%EF%BC%8C%E4%BD%86%E4%B8%8D%E8%83%BD%E5%8F%91%E9%80%81%E3%80%82'%5Cn%20%20return%20processing.value%20%3F%20'%E6%AD%A3%E5%9C%A8%E7%94%9F%E6%88%90%E5%9B%9E%E7%AD%94%EF%BC%8C%E5%8F%AF%E7%82%B9%E5%87%BB%E5%81%9C%E6%AD%A2%E6%8C%89%E9%92%AE%E5%8F%96%E6%B6%88%E3%80%82'%20%3A%20'%E5%8F%AF%E4%BB%A5%E7%BC%96%E8%BE%91%EF%BC%8C%E5%86%85%E5%AE%B9%E9%9D%9E%E7%A9%BA%E6%97%B6%E5%8F%AF%E5%8F%91%E9%80%81%E3%80%82'%5Cn%7D)%5Cn%5Cnfunction%20handleActionError(%7B%20error%3A%20cause%20%7D%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20error.value%20%3D%20%60%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Bcause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%7D%60%5Cn%7D%5Cn%5CnonUnmounted(()%20%3D%3E%20%7B%5Cn%20%20void%20Promise.resolve(runtime.actions.abort%3F.()).catch(()%20%3D%3E%20undefined)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22presetControls%5C%22%20class%3D%5C%22runtime-demo__controls%5C%22%3E%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22runtime-demo__label%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%3Cinput%20v-model%3D%5C%22mode%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22normal%5C%22%20%3Adisabled%3D%5C%22processing%5C%22%20%2F%3E%20%E6%AD%A3%E5%B8%B8%3C%2Flabel%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22runtime-demo__label%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%3Cinput%20v-model%3D%5C%22mode%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22disabled%5C%22%20%3Adisabled%3D%5C%22processing%5C%22%20%2F%3E%20%E7%A6%81%E7%94%A8%E8%BE%93%E5%85%A5%E5%8C%BA%3C%2Flabel%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22runtime-demo__label%5C%22%5Cn%20%20%20%20%20%20%20%20%3E%3Cinput%20v-model%3D%5C%22mode%5C%22%20type%3D%5C%22radio%5C%22%20value%3D%5C%22submit-disabled%5C%22%20%3Adisabled%3D%5C%22processing%5C%22%20%2F%3E%20%E4%BB%85%E7%A6%81%E7%94%A8%E6%8F%90%E4%BA%A4%3C%2Flabel%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-demo__status%5C%22%20role%3D%5C%22status%5C%22%3E%5Cn%20%20%20%20%20%20%3Ccode%3Ecomposer%3A%20%7B%20disabled%3A%20%7B%7B%20disabled%20%7D%7D%2C%20submitDisabled%3A%20%7B%7B%20submitDisabled%20%7D%7D%20%7D%3C%2Fcode%3E%5Cn%20%20%20%20%20%20%E2%80%94%20%7B%7B%20description%20%7D%7D%5Cn%20%20%20%20%3C%2Fp%3E%5Cn%20%20%20%20%3Cp%20v-if%3D%5C%22error%5C%22%20class%3D%5C%22runtime-demo__status%5C%22%20role%3D%5C%22alert%5C%22%3E%7B%7B%20error%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20v-if%3D%5C%22ready%5C%22%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%40runtime-action-error%3D%5C%22handleActionError%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctemplate%20%23composer-before%3D%5C%22%7B%20disabled%3A%20inputDisabled%2C%20loading%2C%20setInputValue%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CTeleport%20v-if%3D%5C%22presetControls%5C%22%20%3Ato%3D%5C%22presetControls%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20class%3D%5C%22runtime-demo__button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Adisabled%3D%5C%22inputDisabled%20%7C%7C%20loading%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%40click%3D%5C%22setInputValue('%E4%BB%8B%E7%BB%8D%E4%B8%80%E4%B8%8B%E8%BF%99%E4%B8%AA%E9%A1%B9%E7%9B%AE')%5C%22%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E5%A1%AB%E5%85%A5%E9%A2%84%E8%AE%BE%E9%97%AE%E9%A2%98%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2FTeleport%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3C%2FTrChat%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%20src%3D%5C%22.%2Fshared%2Fruntime-demo.css%5C%22%3E%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%2C%22runtime-demo.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2Fruntime-demo.css%22%2C%22code%22%3A%22.runtime-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%2C%5Cn.runtime-demo__input%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%20%7B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Adisabled%2C%5Cn.runtime-demo__input%3Adisabled%20%7B%5Cn%20%20opacity%3A%200.5%3B%5Cn%20%20cursor%3A%20not-allowed%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Afocus-visible%2C%5Cn.runtime-demo__input%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20var(--tr-color-primary)%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%2C%5Cn.runtime-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__input%20%7B%5Cn%20%20width%3A%20min(100%25%2C%20220px)%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{s.value=!1}),vueCode:n(x)},p({_:2},[y.value?{name:"vue",fn:a(()=>[t(n(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[9]||(e[9]=o("",11)),c(t(n(u),null,null,512),[[h,s.value]]),t(d,null,{default:a(()=>[t(n(m),{title:"使用内置历史列表管理会话",description:"在历史列表中切换、重命名和删除会话，对比两种新建方式。会话保存在浏览器中，刷新后保留。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-conversations.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-conversations.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onUnmounted%2C%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%5Cn%20%20TrChat%2C%5Cn%20%20useChatRuntime%2C%5Cn%20%20type%20ChatRuntimeActionErrorPayload%2C%5Cn%20%20type%20ChatUIOptions%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cnimport%20%7B%20createMockConversationStorage%20%7D%20from%20'.%2Fshared%2FmockConversationStorage'%5Cn%5Cnconst%20ready%20%3D%20shallowRef(false)%5Cnconst%20pending%20%3D%20shallowRef(false)%5Cnconst%20title%20%3D%20shallowRef('%E9%A1%B9%E7%9B%AE%E9%97%AE%E7%AD%94')%5Cnconst%20actionError%20%3D%20shallowRef('')%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20conversation%3A%20%7B%5Cn%20%20%20%20storage%3A%20createMockConversationStorage('tiny-robot-demo-runtime-conversations-v1'%2C%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20title%3A%20'%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D'%2C%5Cn%20%20%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20role%3A%20'user'%2C%20content%3A%20'%E8%BF%99%E4%B8%AA%E9%A1%B9%E7%9B%AE%E6%8F%90%E4%BE%9B%E4%BB%80%E4%B9%88%E5%8A%9F%E8%83%BD%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20role%3A%20'assistant'%2C%20content%3A%20'%E8%BF%99%E9%87%8C%E5%B1%95%E7%A4%BA%E9%A1%B9%E7%9B%AE%E9%97%AE%E7%AD%94%E3%80%82%E5%88%87%E6%8D%A2%E5%88%B0%E2%80%9C%E4%BD%BF%E7%94%A8%E5%B8%AE%E5%8A%A9%E2%80%9D%EF%BC%8C%E5%8F%AF%E6%9F%A5%E7%9C%8B%E5%8F%A6%E4%B8%80%E7%BB%84%E5%8E%86%E5%8F%B2%E6%B6%88%E6%81%AF%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20title%3A%20'%E4%BD%BF%E7%94%A8%E5%B8%AE%E5%8A%A9'%2C%5Cn%20%20%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20role%3A%20'user'%2C%20content%3A%20'%E5%A6%82%E4%BD%95%E7%AE%A1%E7%90%86%E5%8E%86%E5%8F%B2%E4%BC%9A%E8%AF%9D%EF%BC%9F'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7B%20role%3A%20'assistant'%2C%20content%3A%20'%E7%82%B9%E5%87%BB%E5%B7%A6%E4%BE%A7%E4%BC%9A%E8%AF%9D%E5%90%8D%E7%A7%B0%E5%88%87%E6%8D%A2%EF%BC%8C%E9%80%9A%E8%BF%87%E4%BC%9A%E8%AF%9D%E8%8F%9C%E5%8D%95%E9%87%8D%E5%91%BD%E5%90%8D%E6%88%96%E5%88%A0%E9%99%A4%E3%80%82'%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D)%2C%5Cn%20%20%20%20%2F%2F%20%E6%9C%AC%E5%9C%B0%E7%A4%BA%E4%BE%8B%E5%8D%B3%E6%97%B6%E4%BF%9D%E5%AD%98%EF%BC%8C%E9%81%BF%E5%85%8D%E5%BF%AB%E9%80%9F%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%E6%97%B6%E4%B8%A2%E5%A4%B1%E5%88%9A%E7%94%9F%E6%88%90%E7%9A%84%E6%B6%88%E6%81%AF%E3%80%82%5Cn%20%20%20%20autoSaveThrottle%3A%200%2C%5Cn%20%20%20%20async%20onLoad(conversations)%20%7B%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20if%20(conversations.length)%20await%20runtime.actions.switchConversation(conversations%5B0%5D.id)%5Cn%20%20%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20%20%20actionError.value%20%3D%20%60%E6%81%A2%E5%A4%8D%E4%BC%9A%E8%AF%9D%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%20%20%20%20%20%20%7D%20finally%20%7B%5Cn%20%20%20%20%20%20%20%20ready.value%20%3D%20true%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20composer%3A%20%7B%20disabled%3A%20computed(()%20%3D%3E%20!ready.value%20%7C%7C%20pending.value)%20%7D%2C%5Cn%7D)%5Cnconst%20ui%3A%20ChatUIOptions%20%3D%20%7B%5Cn%20%20layout%3A%20%7B%20leftAside%3A%20%7B%20width%3A%20240%2C%20defaultOpen%3A%20true%20%7D%2C%20rightAside%3A%20false%20%7D%2C%5Cn%20%20history%3A%20%7B%20showRenameControls%3A%20true%20%7D%2C%5Cn%20%20welcome%3A%20false%2C%5Cn%20%20prompts%3A%20false%2C%5Cn%20%20model%3A%20false%2C%5Cn%7D%5Cnconst%20active%20%3D%20computed(()%20%3D%3E%20runtime.activeConversation.value)%5Cnconst%20processing%20%3D%20computed(()%20%3D%3E%20active.value%3F.requestState%20%3D%3D%3D%20'processing')%5Cnconst%20busy%20%3D%20computed(()%20%3D%3E%20!ready.value%20%7C%7C%20pending.value%20%7C%7C%20processing.value)%5Cn%5Cnasync%20function%20createConversation()%20%7B%5Cn%20%20if%20(busy.value)%20return%5Cn%20%20pending.value%20%3D%20true%5Cn%20%20actionError.value%20%3D%20''%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20runtime.actions.createConversation(%7B%20title%3A%20title.value.trim()%20%7C%7C%20'%E6%96%B0%E5%AF%B9%E8%AF%9D'%20%7D)%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20actionError.value%20%3D%20%60%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%20%20%7D%20finally%20%7B%5Cn%20%20%20%20pending.value%20%3D%20false%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20handleActionError(%7B%20error%20%7D%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionError.value%20%3D%20%60%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Berror%20instanceof%20Error%20%3F%20error.message%20%3A%20String(error)%7D%60%5Cn%7D%5Cn%5CnonUnmounted(()%20%3D%3E%20%7B%5Cn%20%20void%20Promise.resolve(runtime.actions.abort%3F.()).catch(()%20%3D%3E%20undefined)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__controls%5C%22%3E%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22runtime-demo__label%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E4%BC%9A%E8%AF%9D%E6%A0%87%E9%A2%98%5Cn%20%20%20%20%20%20%20%20%3Cinput%20v-model%3D%5C%22title%5C%22%20class%3D%5C%22runtime-demo__input%5C%22%20%3Adisabled%3D%5C%22busy%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%3Adisabled%3D%5C%22busy%5C%22%20%40click%3D%5C%22createConversation%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E7%AB%8B%E5%8D%B3%E5%88%9B%E5%BB%BA%E4%BC%9A%E8%AF%9D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20v-if%3D%5C%22actionError%5C%22%20class%3D%5C%22runtime-demo__status%5C%22%20role%3D%5C%22alert%5C%22%3E%7B%7B%20actionError%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-demo__chat%20runtime-conversations-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%3Aui%3D%5C%22ui%5C%22%20%40runtime-action-error%3D%5C%22handleActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%20src%3D%5C%22.%2Fshared%2Fruntime-demo.css%5C%22%3E%3C%2Fstyle%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-conversations-demo__chat%20%7B%5Cn%20%20--tr-history-item-selected-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%20%20--tr-history-item-selected-color%3A%20var(--tr-color-primary)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20defaultApiUrl%20%3D%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%2C%22mockConversationStorage.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmockConversationStorage.ts%22%2C%22code%22%3A%22import%20%7B%5Cn%20%20localStorageStrategyFactory%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20interface%20MockConversationSeed%20%7B%5Cn%20%20title%3A%20string%5Cn%20%20metadata%3F%3A%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20messages%3A%20readonly%20ChatMessage%5B%5D%5Cn%7D%5Cn%5Cnexport%20function%20createMockConversationStorage(%5Cn%20%20storageKey%3A%20string%2C%5Cn%20%20seeds%3A%20readonly%20MockConversationSeed%5B%5D%2C%5Cn)%3A%20ConversationStorageStrategy%20%7B%5Cn%20%20const%20storage%20%3D%20localStorageStrategyFactory(%7B%20key%3A%20storageKey%20%7D)%5Cn%20%20const%20initializedKey%20%3D%20%60%24%7BstorageKey%7D%3Ainitialized%60%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20async%20loadConversations()%20%7B%5Cn%20%20%20%20%20%20const%20conversations%20%3D%20await%20storage.loadConversations()%5Cn%20%20%20%20%20%20let%20initialized%3A%20string%20%7C%20null%20%3D%20null%5Cn%5Cn%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20initialized%20%3D%20localStorage.getItem(initializedKey)%5Cn%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20markInitialized%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20localStorage.setItem(initializedKey%2C%20'true')%5Cn%20%20%20%20%20%20%20%20%7D%20catch%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20The%20marker%20is%20best%20effort.%5Cn%20%20%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(conversations.length%20%26%26%20!initialized)%20%7B%5Cn%20%20%20%20%20%20%20%20markInitialized()%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20if%20(initialized%20%7C%7C%20conversations.length%20%7C%7C%20!seeds.length)%20%7B%5Cn%20%20%20%20%20%20%20%20return%20conversations%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20const%20now%20%3D%20Date.now()%5Cn%20%20%20%20%20%20const%20seededConversations%3A%20ConversationInfo%5B%5D%20%3D%20seeds.map((seed%2C%20index)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20%60tiny-robot-mock-conversation-%24%7Bindex%20%2B%201%7D%60%2C%5Cn%20%20%20%20%20%20%20%20title%3A%20seed.title%2C%5Cn%20%20%20%20%20%20%20%20createdAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20updatedAt%3A%20now%20-%20(seeds.length%20-%20index)%20*%201000%2C%5Cn%20%20%20%20%20%20%20%20metadata%3A%20seed.metadata%2C%5Cn%20%20%20%20%20%20%7D))%5Cn%5Cn%20%20%20%20%20%20for%20(const%20%5Bindex%2C%20conversation%5D%20of%20seededConversations.entries())%20%7B%5Cn%20%20%20%20%20%20%20%20await%20storage.saveConversation(conversation)%5Cn%20%20%20%20%20%20%20%20await%20storage.saveMessages(conversation.id%2C%20%5B...seeds%5Bindex%5D.messages%5D)%5Cn%20%20%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%20%20markInitialized()%5Cn%5Cn%20%20%20%20%20%20return%20seededConversations%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20storage.loadMessages(conversationId)%2C%5Cn%20%20%20%20saveConversation%3A%20(conversation)%20%3D%3E%20storage.saveConversation(conversation)%2C%5Cn%20%20%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20storage.saveMessages(conversationId%2C%20messages)%2C%5Cn%20%20%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20storage.deleteConversation%3F.(conversationId)%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22runtime-demo.css%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2Fruntime-demo.css%22%2C%22code%22%3A%22.runtime-demo%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__controls%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%2C%5Cn.runtime-demo__input%20%7B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20padding%3A%204px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-primary)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default)%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%20%7B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Adisabled%2C%5Cn.runtime-demo__input%3Adisabled%20%7B%5Cn%20%20opacity%3A%200.5%3B%5Cn%20%20cursor%3A%20not-allowed%3B%5Cn%7D%5Cn%5Cn.runtime-demo__button%3Afocus-visible%2C%5Cn.runtime-demo__input%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20var(--tr-color-primary)%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__label%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%206px%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%2C%5Cn.runtime-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary)%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-demo__input%20%7B%5Cn%20%20width%3A%20min(100%25%2C%20220px)%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{s.value=!1}),vueCode:n(R)},p({_:2},[g.value?{name:"vue",fn:a(()=>[t(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[10]||(e[10]=o("",33)),c(t(n(u),null,null,512),[[h,s.value]]),t(d,null,{default:a(()=>[t(n(m),{title:"默认发送与自定义发送",description:"比较两种发送方式对空文本的处理。示例仅展示这一差异，不包含实际请求和消息保存。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-send.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-send.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20useConversation%2C%20type%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useChatRuntimeFromConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20defaultResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20customResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20()%20%3D%3E%20(%7B%5Cn%20%20id%3A%20'runtime-send-demo'%2C%5Cn%20%20object%3A%20'chat.completion'%2C%5Cn%20%20created%3A%200%2C%5Cn%20%20model%3A%20'runtime-send-demo'%2C%5Cn%20%20system_fingerprint%3A%20null%2C%5Cn%20%20choices%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20''%20%7D%2C%5Cn%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnfunction%20createDemoConversation()%20%7B%5Cn%20%20return%20useConversation(%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cnconst%20defaultRuntime%20%3D%20useChatRuntimeFromConversation(%7B%20conversation%3A%20createDemoConversation()%20%7D)%5Cnconst%20customRuntime%20%3D%20useChatRuntimeFromConversation(%7B%5Cn%20%20conversation%3A%20createDemoConversation()%2C%5Cn%20%20send%3A%20(%7B%20text%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20customResult.value%20%3D%20%60%E8%87%AA%E5%AE%9A%E4%B9%89%20send%20%E6%94%B6%E5%88%B0%20text%3A%20%24%7BJSON.stringify(text)%7D%60%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnasync%20function%20sendDefaultEmptyText()%20%7B%5Cn%20%20defaultResult.value%20%3D%20String(await%20defaultRuntime.actions.send(%7B%20text%3A%20''%20%7D))%5Cn%7D%5Cn%5Cnasync%20function%20sendCustomEmptyText()%20%7B%5Cn%20%20const%20sent%20%3D%20await%20customRuntime.actions.send(%7B%20text%3A%20''%20%7D)%5Cn%20%20customResult.value%20%3D%20%60%24%7BcustomResult.value%7D%EF%BC%8C%E7%BB%93%E6%9E%9C%3A%20%24%7Bsent%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-send-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E9%BB%98%E8%AE%A4%E5%8F%91%E9%80%81%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendDefaultEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20defaultResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E8%87%AA%E5%AE%9A%E4%B9%89%20send%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendCustomEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20customResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-send-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(2%2C%20minmax(0%2C%201fr))%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-common-border-color)%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20border%3A%201px%20solid%20%232f6fad%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20padding%3A%206px%2012px%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20%232f6fad%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Ahover%20%7B%5Cn%20%20border-color%3A%20%2324598d%3B%5Cn%20%20background%3A%20%2324598d%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20%238ab8df%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20h3%2C%5Cn.runtime-send-demo__item%20p%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-send-demo%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{s.value=!1}),vueCode:n(_)},p({_:2},[k.value?{name:"vue",fn:a(()=>[t(n(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[11]||(e[11]=o("",7)),c(t(n(u),null,null,512),[[h,s.value]]),t(d,null,{default:a(()=>[t(n(m),{title:"在 TrChatUI 中复用 Runtime",description:"展示输入、发送及会话切换、重命名、删除的绑定方式。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-adapter.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-adapter.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20ChatMessage%2C%20ConversationStorageStrategy%2C%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%5Cn%20%20TrChatUI%2C%5Cn%20%20useChatRuntimeAdapter%2C%5Cn%20%20useChatRuntimeFromConversation%2C%5Cn%20%20type%20ChatHistoryActionPayload%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20messagesByConversation%20%3D%20new%20Map%3Cstring%2C%20ChatMessage%5B%5D%3E()%5Cn%5Cnconst%20memoryStorage%3A%20ConversationStorageStrategy%20%3D%20%7B%5Cn%20%20loadConversations%3A%20()%20%3D%3E%20%5B%5D%2C%5Cn%20%20loadMessages%3A%20(conversationId)%20%3D%3E%20%5B...(messagesByConversation.get(conversationId)%20%3F%3F%20%5B%5D)%5D%2C%5Cn%20%20saveConversation%3A%20()%20%3D%3E%20undefined%2C%5Cn%20%20saveMessages%3A%20(conversationId%2C%20messages)%20%3D%3E%20%7B%5Cn%20%20%20%20messagesByConversation.set(conversationId%2C%20%5B...messages%5D)%5Cn%20%20%7D%2C%5Cn%20%20deleteConversation%3A%20(conversationId)%20%3D%3E%20%7B%5Cn%20%20%20%20messagesByConversation.delete(conversationId)%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnlet%20responseIndex%20%3D%200%5Cn%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20(requestBody)%20%3D%3E%20%7B%5Cn%20%20const%20text%20%3D%20String(requestBody.messages.filter((message)%20%3D%3E%20message.role%20%3D%3D%3D%20'user').at(-1)%3F.content%20%3F%3F%20'')%5Cn%20%20responseIndex%20%2B%3D%201%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20id%3A%20%60runtime-adapter-demo-%24%7BresponseIndex%7D%60%2C%5Cn%20%20%20%20object%3A%20'chat.completion'%2C%5Cn%20%20%20%20created%3A%20responseIndex%2C%5Cn%20%20%20%20model%3A%20'local-demo'%2C%5Cn%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20%60Runtime%20%E5%B7%B2%E6%94%B6%E5%88%B0%EF%BC%9A%24%7Btext%7D%60%20%7D%2C%5Cn%20%20%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20conversation%20%3D%20useConversation(%7B%5Cn%20%20storage%3A%20memoryStorage%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%5Cn%20%20autoSaveThrottle%3A%200%2C%5Cn%20%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%2C%5Cn%7D)%5Cnconst%20runtime%20%3D%20useChatRuntimeFromConversation(%7B%20conversation%20%7D)%5Cnconst%20actionStatus%20%3D%20shallowRef('%E5%8A%A8%E4%BD%9C%E7%8A%B6%E6%80%81%EF%BC%9A%E6%AD%A3%E5%B8%B8')%5Cnconst%20adapter%20%3D%20useChatRuntimeAdapter(%7B%5Cn%20%20runtime%2C%5Cn%20%20onActionError(%7B%20action%20%7D)%20%7B%5Cn%20%20%20%20actionStatus.value%20%3D%20%60%E5%8A%A8%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Baction%7D%60%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnfunction%20handleHistoryAction(payload%3A%20ChatHistoryActionPayload)%20%7B%5Cn%20%20if%20(payload.action.id%20%3D%3D%3D%20'delete'%20%26%26%20!payload.defaultPrevented)%20%7B%5Cn%20%20%20%20adapter.deleteConversation(payload.conversation.id)%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-adapter-demo%5C%22%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22runtime-adapter-demo__status%5C%22%20aria-live%3D%5C%22polite%5C%22%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-adapter-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChatUI%5Cn%20%20%20%20%20%20%20%20%3Adata%3D%5C%22adapter.data.value%5C%22%5Cn%20%20%20%20%20%20%20%20%3Ainput-value%3D%5C%22adapter.inputValue.value%5C%22%5Cn%20%20%20%20%20%20%20%20%40update%3Ainput-value%3D%5C%22adapter.setInputValue%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22adapter.send%5C%22%5Cn%20%20%20%20%20%20%20%20%40cancel%3D%5C%22adapter.abort%5C%22%5Cn%20%20%20%20%20%20%20%20%40clear%3D%5C%22()%20%3D%3E%20adapter.setInputValue('')%5C%22%5Cn%20%20%20%20%20%20%20%20%40create-conversation%3D%5C%22adapter.clearActiveConversation%5C%22%5Cn%20%20%20%20%20%20%20%20%40switch-conversation%3D%5C%22(%7B%20conversationId%20%7D)%20%3D%3E%20adapter.switchConversation(conversationId)%5C%22%5Cn%20%20%20%20%20%20%20%20%40rename-conversation%3D%5C%22(%7B%20conversationId%2C%20title%20%7D)%20%3D%3E%20adapter.renameConversation(conversationId%2C%20title)%5C%22%5Cn%20%20%20%20%20%20%20%20%40history-action%3D%5C%22handleHistoryAction%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-adapter-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__status%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%20%20overflow-wrap%3A%20anywhere%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__chat%20%7B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20width%3A%20min(100%25%2C%20720px)%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20280px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.runtime-adapter-demo__chat%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-adapter-demo__chat%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{s.value=!1}),vueCode:n(f)},p({_:2},[E.value?{name:"vue",fn:a(()=>[t(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[12]||(e[12]=o("",75))])}}});export{M as __pageData,U as default};
