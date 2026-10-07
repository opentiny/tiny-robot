const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Custom.CytWU115.js","assets/chunks/theme.DWoXJ9L5.js","assets/chunks/framework.CSCYUGUn.js","assets/chunks/index.DXEx-_iz.js","assets/chunks/IndexedDB.C_5dWp_T.js","assets/chunks/mockResponseProvider.DAFbiug9.js","assets/chunks/LocalStorage.7KljxP8I.js","assets/chunks/Basic.CSRsfjeG.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as c,aZ as y,aL as b,v as F,H as m,bL as l,bB as E,J as e,bk as t,bJ as i,G as p,w as o,I as r,b7 as A,aU as k}from"./chunks/framework.CSCYUGUn.js";import{L as v,N as B}from"./chunks/index.Dr3IFbIi.js";const f=`<template>
  <div>
    <div class="info">
      <p><strong>自定义存储策略示例</strong></p>
      <p>此示例展示如何实现自定义存储策略。在实际应用中，你可以将数据保存到远程服务器。</p>
      <p>本示例使用内存存储作为演示，刷新页面后数据会丢失。</p>
    </div>

    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createNewConversation">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { BubbleRoleConfig } from '@opentiny/tiny-robot'
import {
  type ConversationStorageStrategy,
  type ConversationInfo,
  type ChatMessage,
  useConversation,
} from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'

// 自定义存储策略：使用内存存储（仅作为示例）
class MemoryStorageStrategy implements ConversationStorageStrategy {
  private conversations: ConversationInfo[] = []
  private messagesMap: Map<string, ChatMessage[]> = new Map()

  loadConversations(): ConversationInfo[] {
    return [...this.conversations]
  }

  loadMessages(conversationId: string): ChatMessage[] {
    return [...(this.messagesMap.get(conversationId) || [])]
  }

  saveConversation(conversation: ConversationInfo): void {
    const index = this.conversations.findIndex((c) => c.id === conversation.id)
    if (index >= 0) {
      this.conversations[index] = conversation
    } else {
      this.conversations.unshift(conversation)
    }
  }

  saveMessages(conversationId: string, messages: ChatMessage[]): void {
    this.messagesMap.set(conversationId, [...messages])
  }

  deleteConversation(conversationId: string): void {
    const index = this.conversations.findIndex((c) => c.id === conversationId)
    if (index >= 0) {
      this.conversations.splice(index, 1)
    }
    this.messagesMap.delete(conversationId)
  }
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

// 使用自定义存储策略
const customStorage = new MemoryStorageStrategy()

const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  abortActiveRequest,
  clear,
} = useConversation({
  useMessageOptions: {
    responseProvider: mockResponseProvider,
  },
  storage: customStorage,
  autoSaveMessages: true, // 启用自动保存消息
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const handleSubmit = (content: string) => {
  const conversation = activeConversation.value ?? createNewConversation()
  conversation.engine.sendMessage(content)
  inputMessage.value = ''
}

const createNewConversation = () => createConversation({ title: \`新会话 \${conversations.value.length + 1}\` })

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title || \`会话 \${conversation.id.slice(0, 8)}\`,
    value: conversation.id,
  })),
)

// 清空存储
const clearStorage = () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    clear()
  }
}
<\/script>

<style scoped>
.info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.info p {
  margin: 4px 0;
  font-size: 14px;
  color: #0369a1;
}

.tiny-select {
  width: 280px;
  margin-left: 4px;
}

.tiny-button {
  margin-left: 10px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
</style>
`,S=`<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <!-- 消息输入区域 -->
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createNewConversation">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { BubbleRoleConfig } from '@opentiny/tiny-robot'
import { indexedDBStorageStrategyFactory, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  deleteConversation,
  switchConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: mockResponseProvider,
  },
  storage: indexedDBStorageStrategyFactory({
    dbName: 'demo-chat-db',
    dbVersion: 1,
  }),
  autoSaveMessages: true,
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const handleSubmit = (content: string) => {
  const conversation = activeConversation.value ?? createNewConversation()
  conversation.engine.sendMessage(content)
  inputMessage.value = ''
}

const createNewConversation = () => createConversation({ title: \`新会话 \${conversations.value.length + 1}\` })

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title || \`会话 \${conversation.id.slice(0, 8)}\`,
    value: conversation.id,
  })),
)

// 清空存储
const clearStorage = async () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    try {
      const ids = conversations.value.map(({ id }) => id)
      for (const id of ids) {
        await deleteConversation(id)
      }
    } catch (error) {
      console.error('清空存储失败:', error)
    }
  }
}
<\/script>

<style scoped>
.tiny-select {
  width: 280px;
  margin-left: 4px;
}

.tiny-button {
  margin-left: 10px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
</style>
`,x=`<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <!-- 消息输入区域 -->
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createNewConversation">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { BubbleRoleConfig } from '@opentiny/tiny-robot'
import { localStorageStrategyFactory, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

// 使用 LocalStorage 策略
const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  deleteConversation,
  switchConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: mockResponseProvider,
  },
  storage: localStorageStrategyFactory({
    key: 'demo-conversations-localstorage', // 自定义存储键名
  }),
  autoSaveMessages: true,
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const handleSubmit = (content: string) => {
  const conversation = activeConversation.value ?? createNewConversation()
  conversation.engine.sendMessage(content)
  inputMessage.value = ''
}

const createNewConversation = () => createConversation({ title: \`新会话 \${conversations.value.length + 1}\` })

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title || \`会话 \${conversation.id.slice(0, 8)}\`,
    value: conversation.id,
  })),
)

// 清空存储
const clearStorage = async () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    try {
      const ids = conversations.value.map(({ id }) => id)
      for (const id of ids) {
        await deleteConversation(id)
      }
    } catch (error) {
      console.error('清空存储失败:', error)
    }
  }
}
<\/script>

<style scoped>
.tiny-select {
  width: 280px;
  margin-left: 4px;
}

.tiny-button {
  margin-left: 10px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
</style>
`,I=`<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '模拟回复中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortActiveRequest"
    ></tr-sender>
    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createNewConversation">创建新对话</tiny-button>
      <tiny-button type="danger" :disabled="!activeConversationId" @click="handleDeleteConversation">
        删除当前会话
      </tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig, TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { UseMessageOptions } from '@opentiny/tiny-robot-kit'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'
import { MockStorageStrategy } from './mockStorageStrategy'

// useConversation basic usage: useMessageOptions.responseProvider + storage
const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  deleteConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: mockResponseProvider as UseMessageOptions['responseProvider'],
  },
  storage: new MockStorageStrategy(),
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value ?? false)
const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title || \`会话 \${conversation.id.slice(0, 8)}\`,
    value: conversation.id,
  })),
)

const inputMessage = ref('')

function handleSubmit(content: string) {
  // Auto-create conversation if none exists
  const conversation = activeConversation.value ?? createNewConversation()
  conversation?.engine?.sendMessage(content)
  inputMessage.value = ''
}

function createNewConversation() {
  return createConversation({ title: \`新会话 \${conversations.value.length + 1}\` })
}

async function handleDeleteConversation() {
  const id = activeConversationId.value
  if (!id) return
  await deleteConversation(id)
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

<style scoped>
.tiny-select {
  width: 280px;
  margin-left: 4px;
}

.tiny-button {
  margin-left: 10px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
`,_=JSON.parse('{"title":"useConversation 会话数据管理","description":"","frontmatter":{"outline":[1,4]},"headers":[],"relativePath":"tools/conversation.md","filePath":"tools/conversation.md"}'),M={name:"tools/conversation.md"},T=Object.assign(M,{setup(P){const g=A();d(async()=>{g.value=(await c(async()=>{const{default:a}=await import("./chunks/Custom.CytWU115.js");return{default:a}},__vite__mapDeps([0,1,2,3]))).default});const u=A();d(async()=>{u.value=(await c(async()=>{const{default:a}=await import("./chunks/IndexedDB.C_5dWp_T.js");return{default:a}},__vite__mapDeps([4,1,2,3,5]))).default});const D=A();d(async()=>{D.value=(await c(async()=>{const{default:a}=await import("./chunks/LocalStorage.7KljxP8I.js");return{default:a}},__vite__mapDeps([6,1,2,3,5]))).default});const s=k(!0),h=A();return d(async()=>{h.value=(await c(async()=>{const{default:a}=await import("./chunks/Basic.CSRsfjeG.js");return{default:a}},__vite__mapDeps([7,1,2,3,5]))).default}),(a,n)=>{const C=y("ClientOnly");return b(),F("div",null,[n[4]||(n[4]=m('<h1 id="useconversation-会话数据管理" tabindex="-1">useConversation 会话数据管理 <a class="header-anchor" href="#useconversation-会话数据管理" aria-label="Permalink to &quot;useConversation 会话数据管理&quot;">​</a></h1><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><p><code>useConversation</code> 管理多个对话的元数据、当前会话和各会话对应的 <code>useMessage</code> 引擎，并通过存储策略加载或持久化消息。它适合需要创建、切换、删除和恢复多个 AI 会话的 Vue 应用。</p><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>应用需要维护多个相互独立的消息历史；</li><li>切换会话后，后台请求仍需继续运行；</li><li>会话元数据和消息需要保存到 LocalStorage、IndexedDB 或自定义存储；</li><li>所有会话共享一组 <code>useMessage</code> 基础配置，但允许在创建会话时局部覆盖。</li></ul><p>如果只管理单个消息流，直接使用 <a href="./message.html"><code>useMessage</code></a> 即可。<code>useConversation</code> 不负责渲染会话列表、消息气泡或输入框，这些界面仍由应用组合。</p><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><h3 id="管理多个会话" tabindex="-1">管理多个会话 <a class="header-anchor" href="#管理多个会话" aria-label="Permalink to &quot;管理多个会话&quot;">​</a></h3><p>传入消息引擎配置和存储策略后，可以创建、切换和删除会话。示例使用确定性的内存存储与本地模拟响应；切换会话不会中止仍在运行的后台请求。</p>',9)),l(e(t(v),null,null,512),[[E,s.value]]),e(C,null,{default:i(()=>[e(t(B),{title:"多会话管理",description:"使用本地 mock 演示会话切换、创建、删除和独立消息引擎。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createNewConversation%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22danger%5C%22%20%3Adisabled%3D%5C%22!activeConversationId%5C%22%20%40click%3D%5C%22handleDeleteConversation%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%E5%88%A0%E9%99%A4%E5%BD%93%E5%89%8D%E4%BC%9A%E8%AF%9D%5Cn%20%20%20%20%20%20%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRoleConfig%2C%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20UseMessageOptions%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinyButton%2C%20TinySelect%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20mockResponseProvider%20%7D%20from%20'.%2FmockResponseProvider'%5Cnimport%20%7B%20MockStorageStrategy%20%7D%20from%20'.%2FmockStorageStrategy'%5Cn%5Cn%2F%2F%20useConversation%20basic%20usage%3A%20useMessageOptions.responseProvider%20%2B%20storage%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20deleteConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20mockResponseProvider%20as%20UseMessageOptions%5B'responseProvider'%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20new%20MockStorageStrategy()%2C%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value%20%3F%3F%20false)%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnfunction%20handleSubmit(content%3A%20string)%20%7B%5Cn%20%20%2F%2F%20Auto-create%20conversation%20if%20none%20exists%5Cn%20%20const%20conversation%20%3D%20activeConversation.value%20%3F%3F%20createNewConversation()%5Cn%20%20conversation%3F.engine%3F.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnfunction%20createNewConversation()%20%7B%5Cn%20%20return%20createConversation(%7B%20title%3A%20%60%E6%96%B0%E4%BC%9A%E8%AF%9D%20%24%7Bconversations.value.length%20%2B%201%7D%60%20%7D)%5Cn%7D%5Cn%5Cnasync%20function%20handleDeleteConversation()%20%7B%5Cn%20%20const%20id%20%3D%20activeConversationId.value%5Cn%20%20if%20(!id)%20return%5Cn%20%20await%20deleteConversation(id)%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2012px%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%208px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22mockResponseProvider.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FmockResponseProvider.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F**%5Cn%20*%20Mock%20stream%3A%20simulates%20AI%20response%20without%20real%20API%5Cn%20*%2F%5Cnexport%20async%20function*%20mockResponseProvider(%5Cn%20%20_requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20reply%20%3D%20'%E8%BF%99%E6%98%AF%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%E3%80%81%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%E4%BD%93%E9%AA%8C%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E3%80%82'%5Cn%20%20const%20id%20%3D%20'mock-'%20%2B%20Date.now()%5Cn%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20reply.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20150))%5Cn%20%20%20%20if%20(abortSignal.aborted)%20return%5Cn%20%20%20%20const%20deltaContent%20%3D%20reply%5Bi%5D%5Cn%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%3A%20deltaContent%20%7D%20%3A%20%7B%20content%3A%20deltaContent%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20reply.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%2C%22mockStorageStrategy.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FmockStorageStrategy.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatMessage%2C%20ConversationInfo%2C%20ConversationStorageStrategy%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F**%5Cn%20*%20Mock%20storage%3A%20pre-loaded%20conversations%20and%20messages%2C%20no%20real%20persistence%5Cn%20*%2F%5Cnexport%20class%20MockStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20private%20conversations%3A%20ConversationInfo%5B%5D%20%3D%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745744706662%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744717297%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745743216510%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744704671%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%5Cn%5Cn%20%20private%20messagesMap%3A%20Map%3Cstring%2C%20ChatMessage%5B%5D%3E%20%3D%20new%20Map(%5B%5Cn%20%20%20%20%5B%5Cn%20%20%20%20%20%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20%5B%5Cn%20%20%20%20%20%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'hello'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFTinyRobot%E6%90%AD%E5%BB%BA%E7%9A%84AI%E5%8A%A9%E6%89%8B%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E9%97%AE%E6%88%91%E4%BB%BB%E4%BD%95%E9%97%AE%E9%A2%98%EF%BC%8C%E6%88%91%E4%BC%9A%E5%B0%BD%E5%8A%9B%E5%9B%9E%E7%AD%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%5D)%5Cn%5Cn%20%20async%20loadConversations()%3A%20Promise%3CConversationInfo%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.conversations%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20loadMessages(conversationId%3A%20string)%3A%20Promise%3CChatMessage%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.messagesMap.get(conversationId)%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20saveConversation(conversation%3A%20ConversationInfo)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversation.id)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations%5Bindex%5D%20%3D%20conversation%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20this.conversations.push(conversation)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20saveMessages(conversationId%3A%20string%2C%20messages%3A%20ChatMessage%5B%5D)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.messagesMap.set(conversationId%2C%20messages)%5Cn%20%20%7D%5Cn%5Cn%20%20async%20deleteConversation(conversationId%3A%20string)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversationId)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations.splice(index%2C%201)%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.messagesMap.delete(conversationId)%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[0]||(n[0]=()=>{s.value=!1}),vueCode:t(I)},p({_:2},[h.value?{name:"vue",fn:i(()=>[e(t(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[5]||(n[5]=m('<p><code>activeConversation</code> 只有在当前会话的消息引擎已经创建后才有值。初始存储加载只恢复 <code>conversations</code>；应用需要调用 <code>switchConversation(id)</code>，才能按需加载该会话的消息并创建引擎。</p><h3 id="选择存储策略" tabindex="-1">选择存储策略 <a class="header-anchor" href="#选择存储策略" aria-label="Permalink to &quot;选择存储策略&quot;">​</a></h3><p>未传入 <code>storage</code> 时，<code>useConversation</code> 默认使用 LocalStorage。存储策略拥有会话元数据和消息的持久化责任；Composable 只协调加载、保存和删除时机。</p><h4 id="localstorage" tabindex="-1">LocalStorage <a class="header-anchor" href="#localstorage" aria-label="Permalink to &quot;LocalStorage&quot;">​</a></h4><p>LocalStorage 适合数据量较小、只需保存在当前浏览器中的会话。默认存储键为 <code>tiny-robot-ai-conversations</code>。</p>',5)),l(e(t(v),null,null,512),[[E,s.value]]),e(C,null,{default:i(()=>[e(t(B),{title:"LocalStorage 持久化",description:"在浏览器本地保存会话和消息，刷新页面后仍可恢复。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22LocalStorage.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FLocalStorage.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%B6%88%E6%81%AF%E8%BE%93%E5%85%A5%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createNewConversation%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20localStorageStrategyFactory%2C%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20mockResponseProvider%20%7D%20from%20'.%2FmockResponseProvider'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%20LocalStorage%20%E7%AD%96%E7%95%A5%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20deleteConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20mockResponseProvider%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20localStorageStrategyFactory(%7B%5Cn%20%20%20%20key%3A%20'demo-conversations-localstorage'%2C%20%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E9%94%AE%E5%90%8D%5Cn%20%20%7D)%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20handleSubmit%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20const%20conversation%20%3D%20activeConversation.value%20%3F%3F%20createNewConversation()%5Cn%20%20conversation.engine.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20createNewConversation%20%3D%20()%20%3D%3E%20createConversation(%7B%20title%3A%20%60%E6%96%B0%E4%BC%9A%E8%AF%9D%20%24%7Bconversations.value.length%20%2B%201%7D%60%20%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20ids%20%3D%20conversations.value.map((%7B%20id%20%7D)%20%3D%3E%20id)%5Cn%20%20%20%20%20%20for%20(const%20id%20of%20ids)%20%7B%5Cn%20%20%20%20%20%20%20%20await%20deleteConversation(id)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20console.error('%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%E5%A4%B1%E8%B4%A5%3A'%2C%20error)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22mockResponseProvider.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FmockResponseProvider.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F**%5Cn%20*%20Mock%20stream%3A%20simulates%20AI%20response%20without%20real%20API%5Cn%20*%2F%5Cnexport%20async%20function*%20mockResponseProvider(%5Cn%20%20_requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20reply%20%3D%20'%E8%BF%99%E6%98%AF%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%E3%80%81%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%E4%BD%93%E9%AA%8C%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E3%80%82'%5Cn%20%20const%20id%20%3D%20'mock-'%20%2B%20Date.now()%5Cn%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20reply.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20150))%5Cn%20%20%20%20if%20(abortSignal.aborted)%20return%5Cn%20%20%20%20const%20deltaContent%20%3D%20reply%5Bi%5D%5Cn%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%3A%20deltaContent%20%7D%20%3A%20%7B%20content%3A%20deltaContent%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20reply.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[1]||(n[1]=()=>{s.value=!1}),vueCode:t(x)},p({_:2},[D.value?{name:"vue",fn:i(()=>[e(t(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[6]||(n[6]=o("h4",{id:"indexeddb",tabindex:"-1"},[r("IndexedDB "),o("a",{class:"header-anchor",href:"#indexeddb","aria-label":'Permalink to "IndexedDB"'},"​")],-1)),n[7]||(n[7]=o("p",null,[r("IndexedDB 适合消息较多或单条内容较大的会话。默认数据库名为 "),o("code",null,"tiny-robot-ai-db"),r("，版本为 "),o("code",null,"1"),r("。")],-1)),l(e(t(v),null,null,512),[[E,s.value]]),e(C,null,{default:i(()=>[e(t(B),{title:"IndexedDB 持久化",description:"使用 IndexedDB 保存容量较大的会话数据。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22IndexedDB.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FIndexedDB.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%B6%88%E6%81%AF%E8%BE%93%E5%85%A5%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createNewConversation%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20indexedDBStorageStrategyFactory%2C%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinyButton%2C%20TinySelect%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20mockResponseProvider%20%7D%20from%20'.%2FmockResponseProvider'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20deleteConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20mockResponseProvider%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20indexedDBStorageStrategyFactory(%7B%5Cn%20%20%20%20dbName%3A%20'demo-chat-db'%2C%5Cn%20%20%20%20dbVersion%3A%201%2C%5Cn%20%20%7D)%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20handleSubmit%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20const%20conversation%20%3D%20activeConversation.value%20%3F%3F%20createNewConversation()%5Cn%20%20conversation.engine.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20createNewConversation%20%3D%20()%20%3D%3E%20createConversation(%7B%20title%3A%20%60%E6%96%B0%E4%BC%9A%E8%AF%9D%20%24%7Bconversations.value.length%20%2B%201%7D%60%20%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20const%20ids%20%3D%20conversations.value.map((%7B%20id%20%7D)%20%3D%3E%20id)%5Cn%20%20%20%20%20%20for%20(const%20id%20of%20ids)%20%7B%5Cn%20%20%20%20%20%20%20%20await%20deleteConversation(id)%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20console.error('%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%E5%A4%B1%E8%B4%A5%3A'%2C%20error)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22mockResponseProvider.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FmockResponseProvider.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cn%2F**%5Cn%20*%20Mock%20stream%3A%20simulates%20AI%20response%20without%20real%20API%5Cn%20*%2F%5Cnexport%20async%20function*%20mockResponseProvider(%5Cn%20%20_requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20reply%20%3D%20'%E8%BF%99%E6%98%AF%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%EF%BC%8C%E6%97%A0%E9%9C%80%E7%9C%9F%E5%AE%9E%20API%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%E3%80%81%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%E4%BD%93%E9%AA%8C%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E3%80%82'%5Cn%20%20const%20id%20%3D%20'mock-'%20%2B%20Date.now()%5Cn%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20reply.length%20%26%26%20!abortSignal.aborted%3B%20i%2B%2B)%20%7B%5Cn%20%20%20%20await%20new%20Promise((r)%20%3D%3E%20setTimeout(r%2C%20150))%5Cn%20%20%20%20if%20(abortSignal.aborted)%20return%5Cn%20%20%20%20const%20deltaContent%20%3D%20reply%5Bi%5D%5Cn%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20id%2C%5Cn%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20created%3A%20Math.floor(Date.now()%20%2F%201000)%2C%5Cn%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20delta%3A%20i%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%3A%20deltaContent%20%7D%20%3A%20%7B%20content%3A%20deltaContent%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20i%20%3D%3D%3D%20reply.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[2]||(n[2]=()=>{s.value=!1}),vueCode:t(S)},p({_:2},[u.value?{name:"vue",fn:i(()=>[e(t(u))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[8]||(n[8]=o("h4",{id:"自定义存储",tabindex:"-1"},[r("自定义存储 "),o("a",{class:"header-anchor",href:"#自定义存储","aria-label":'Permalink to "自定义存储"'},"​")],-1)),n[9]||(n[9]=o("p",null,[r("实现 "),o("code",null,"ConversationStorageStrategy"),r(" 可以接入远程服务或应用自己的数据层。远程实现需要自行处理鉴权、冲突、离线状态和重试；存储方法抛出的错误会按对应动作的规则传播或记录。")],-1)),l(e(t(v),null,null,512),[[E,s.value]]),e(C,null,{default:i(()=>[e(t(B),{title:"自定义存储策略",description:"使用内存实现展示存储接口；刷新页面后数据会丢失。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Custom.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fstorage%2FCustom.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22info%5C%22%3E%5Cn%20%20%20%20%20%20%3Cp%3E%3Cstrong%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%E7%A4%BA%E4%BE%8B%3C%2Fstrong%3E%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3Cp%3E%E6%AD%A4%E7%A4%BA%E4%BE%8B%E5%B1%95%E7%A4%BA%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%E3%80%82%E5%9C%A8%E5%AE%9E%E9%99%85%E5%BA%94%E7%94%A8%E4%B8%AD%EF%BC%8C%E4%BD%A0%E5%8F%AF%E4%BB%A5%E5%B0%86%E6%95%B0%E6%8D%AE%E4%BF%9D%E5%AD%98%E5%88%B0%E8%BF%9C%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3Cp%3E%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E5%86%85%E5%AD%98%E5%AD%98%E5%82%A8%E4%BD%9C%E4%B8%BA%E6%BC%94%E7%A4%BA%EF%BC%8C%E5%88%B7%E6%96%B0%E9%A1%B5%E9%9D%A2%E5%90%8E%E6%95%B0%E6%8D%AE%E4%BC%9A%E4%B8%A2%E5%A4%B1%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createNewConversation%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20useConversation%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinyButton%2C%20TinySelect%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20mockResponseProvider%20%7D%20from%20'.%2FmockResponseProvider'%5Cn%5Cn%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%EF%BC%9A%E4%BD%BF%E7%94%A8%E5%86%85%E5%AD%98%E5%AD%98%E5%82%A8%EF%BC%88%E4%BB%85%E4%BD%9C%E4%B8%BA%E7%A4%BA%E4%BE%8B%EF%BC%89%5Cnclass%20MemoryStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20private%20conversations%3A%20ConversationInfo%5B%5D%20%3D%20%5B%5D%5Cn%20%20private%20messagesMap%3A%20Map%3Cstring%2C%20ChatMessage%5B%5D%3E%20%3D%20new%20Map()%5Cn%5Cn%20%20loadConversations()%3A%20ConversationInfo%5B%5D%20%7B%5Cn%20%20%20%20return%20%5B...this.conversations%5D%5Cn%20%20%7D%5Cn%5Cn%20%20loadMessages(conversationId%3A%20string)%3A%20ChatMessage%5B%5D%20%7B%5Cn%20%20%20%20return%20%5B...(this.messagesMap.get(conversationId)%20%7C%7C%20%5B%5D)%5D%5Cn%20%20%7D%5Cn%5Cn%20%20saveConversation(conversation%3A%20ConversationInfo)%3A%20void%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversation.id)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations%5Bindex%5D%20%3D%20conversation%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20this.conversations.unshift(conversation)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20saveMessages(conversationId%3A%20string%2C%20messages%3A%20ChatMessage%5B%5D)%3A%20void%20%7B%5Cn%20%20%20%20this.messagesMap.set(conversationId%2C%20%5B...messages%5D)%5Cn%20%20%7D%5Cn%5Cn%20%20deleteConversation(conversationId%3A%20string)%3A%20void%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversationId)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations.splice(index%2C%201)%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.messagesMap.delete(conversationId)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%5Cnconst%20customStorage%20%3D%20new%20MemoryStorageStrategy()%5Cn%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%20%20clear%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20mockResponseProvider%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20customStorage%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%20%2F%2F%20%E5%90%AF%E7%94%A8%E8%87%AA%E5%8A%A8%E4%BF%9D%E5%AD%98%E6%B6%88%E6%81%AF%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20handleSubmit%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20const%20conversation%20%3D%20activeConversation.value%20%3F%3F%20createNewConversation()%5Cn%20%20conversation.engine.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20createNewConversation%20%3D%20()%20%3D%3E%20createConversation(%7B%20title%3A%20%60%E6%96%B0%E4%BC%9A%E8%AF%9D%20%24%7Bconversations.value.length%20%2B%201%7D%60%20%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20clear()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.info%20%7B%5Cn%20%20background%3A%20%23f0f9ff%3B%5Cn%20%20border%3A%201px%20solid%20%23bae6fd%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20margin-bottom%3A%2016px%3B%5Cn%7D%5Cn%5Cn.info%20p%20%7B%5Cn%20%20margin%3A%204px%200%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20color%3A%20%230369a1%3B%5Cn%7D%5Cn%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22mockResponseProvider.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fstorage%2FmockResponseProvider.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatCompletion%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnexport%20async%20function*%20mockResponseProvider(%5Cn%20%20_requestBody%3A%20MessageRequestBody%2C%5Cn%20%20abortSignal%3A%20AbortSignal%2C%5Cn)%3A%20AsyncGenerator%3CChatCompletion%3E%20%7B%5Cn%20%20const%20reply%20%3D%20'%E8%BF%99%E6%98%AF%E4%B8%80%E6%9D%A1%E6%9C%AC%E5%9C%B0%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%EF%BC%8C%E5%8F%AF%E4%BB%A5%E7%9B%B4%E6%8E%A5%E8%A7%82%E5%AF%9F%E6%B6%88%E6%81%AF%E4%BF%9D%E5%AD%98%E7%BB%93%E6%9E%9C%E3%80%82'%5Cn%5Cn%20%20for%20(let%20index%20%3D%200%3B%20index%20%3C%20reply.length%20%26%26%20!abortSignal.aborted%3B%20index%20%2B%3D%201)%20%7B%5Cn%20%20%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%2030))%5Cn%20%20%20%20if%20(abortSignal.aborted)%20return%5Cn%20%20%20%20const%20content%20%3D%20reply%5Bindex%5D%5Cn%5Cn%20%20%20%20yield%20%7B%5Cn%20%20%20%20%20%20id%3A%20'storage-demo-response'%2C%5Cn%20%20%20%20%20%20object%3A%20'chat.completion.chunk'%2C%5Cn%20%20%20%20%20%20created%3A%200%2C%5Cn%20%20%20%20%20%20model%3A%20'mock'%2C%5Cn%20%20%20%20%20%20system_fingerprint%3A%20null%2C%5Cn%20%20%20%20%20%20choices%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20%20%20%20%20message%3A%20undefined%2C%5Cn%20%20%20%20%20%20%20%20%20%20delta%3A%20index%20%3D%3D%3D%200%20%3F%20%7B%20role%3A%20'assistant'%2C%20content%20%7D%20%3A%20%7B%20content%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20finish_reason%3A%20index%20%3D%3D%3D%20reply.length%20-%201%20%3F%20'stop'%20%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:n[3]||(n[3]=()=>{s.value=!1}),vueCode:t(f)},p({_:2},[g.value?{name:"vue",fn:i(()=>[e(t(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),n[10]||(n[10]=m(`<h3 id="自动保存消息" tabindex="-1">自动保存消息 <a class="header-anchor" href="#自动保存消息" aria-label="Permalink to &quot;自动保存消息&quot;">​</a></h3><p>设置 <code>autoSaveMessages: true</code> 后，已加载引擎的 <code>messages</code> 变化会触发节流保存。默认节流时间为 <code>1000ms</code>，节流窗口的开始和结束都可能执行保存。工具调用让回合进入暂停状态时，也会执行一次保存，以便后续恢复。</p><p>自动保存只监听当前仍保留在内存中的引擎。对于尚未打开、已经回收或仅存在于存储中的会话，调用 <code>saveMessages(id)</code> 不会重新加载引擎，也不会写入数据。</p><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p><code>useConversation</code> 及本页列出的类型和存储工厂均从 <code>@opentiny/tiny-robot-kit</code> 导入。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useConversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(options: UseConversationOptions): UseConversationReturn</span></span></code></pre></div><h3 id="配置" tabindex="-1">配置 <a class="header-anchor" href="#配置" aria-label="Permalink to &quot;配置&quot;">​</a></h3><table tabindex="0"><thead><tr><th>配置项</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>useMessageOptions</code></td><td><code>UseMessageOptions</code></td><td>是</td><td>—</td><td>所有会话共享的消息引擎基础配置。<code>createConversation</code> 的同名配置会在其上做浅合并。</td></tr><tr><td><code>storage</code></td><td><code>ConversationStorageStrategy</code></td><td>否</td><td><code>localStorageStrategyFactory()</code></td><td>加载和持久化会话元数据与消息。</td></tr><tr><td><code>autoSaveMessages</code></td><td><code>boolean</code></td><td>否</td><td><code>false</code></td><td>是否监听已加载引擎的消息变化并自动保存。</td></tr><tr><td><code>autoSaveThrottle</code></td><td><code>number</code></td><td>否</td><td><code>1000</code></td><td>自动保存节流时间，单位为毫秒；仅在开启自动保存后生效。</td></tr><tr><td><code>onLoad</code></td><td><code>(items: ConversationInfo[]) =&gt; void</code></td><td>否</td><td>—</td><td>初始会话列表成功加载并与加载期间创建的内存会话合并后调用。最终没有会话时传入空数组；加载失败时不调用。</td></tr></tbody></table><p><code>useMessageOptions</code> 和创建单个会话时的覆盖项都只在该引擎创建时读取。覆盖采用浅合并；例如传入新的 <code>plugins</code> 数组会替换基础配置中的整个数组，而不是自动拼接。</p><h3 id="状态" tabindex="-1">状态 <a class="header-anchor" href="#状态" aria-label="Permalink to &quot;状态&quot;">​</a></h3><table tabindex="0"><thead><tr><th>返回字段</th><th>类型</th><th>更新方</th><th>说明</th></tr></thead><tbody><tr><td><code>conversations</code></td><td><code>Ref&lt;ConversationInfo[]&gt;</code></td><td>Composable</td><td>当前会话元数据列表。创建会话时插入列表开头；初始存储加载完成后与已创建的内存会话合并，内存数据优先。</td></tr><tr><td><code>activeConversationId</code></td><td><code>Ref&lt;string | null&gt;</code></td><td>Composable / 应用</td><td>当前会话 ID。应用可以读取；应优先通过 <code>switchConversation</code>、<code>createConversation</code> 和删除动作改变当前会话。</td></tr><tr><td><code>activeConversation</code></td><td><code>ComputedRef&lt;Conversation | null&gt;</code></td><td>Composable</td><td>当前会话元数据与消息引擎。ID 不存在或引擎尚未加载时为 <code>null</code>。</td></tr></tbody></table><p>虽然这些字段以 Vue Ref 暴露，应用不应直接改写 <code>conversations</code> 的结构，否则存储、引擎缓存和当前会话可能失去同步。</p><h3 id="动作" tabindex="-1">动作 <a class="header-anchor" href="#动作" aria-label="Permalink to &quot;动作&quot;">​</a></h3><table tabindex="0"><thead><tr><th>动作</th><th>签名</th><th>结果与副作用</th></tr></thead><tbody><tr><td><code>createConversation</code></td><td><code>(params?) =&gt; Conversation</code></td><td>同步创建元数据和消息引擎、设为当前会话，并异步保存初始数据。未传 <code>id</code> 时生成 ID；异步初始保存失败会记录到控制台，不会让本方法抛错。</td></tr><tr><td><code>switchConversation</code></td><td><code>(id: string) =&gt; Promise&lt;Conversation | null&gt;</code></td><td>找到会话时按需加载消息并切换；空 ID 或未知 ID 返回 <code>null</code>。存储加载消息向外抛错时记录错误，并使用基础配置中的初始消息创建引擎。</td></tr><tr><td><code>deleteConversation</code></td><td><code>(id: string) =&gt; Promise&lt;void&gt;</code></td><td>先中止该会话请求、移除内存状态，再等待存储删除。未知 ID 直接完成；存储删除失败会拒绝 Promise。删除当前会话后不会自动选择另一个会话。</td></tr><tr><td><code>clear</code></td><td><code>() =&gt; void</code></td><td>清空内存中的全部会话、中止所有已加载引擎，并触发各会话的存储删除。它不等待异步删除完成，也不汇总删除错误。</td></tr><tr><td><code>updateConversationTitle</code></td><td><code>(id: string, title?: string) =&gt; void</code></td><td>更新内存标题和 <code>updatedAt</code>，随后异步保存元数据。未知 ID 无操作；保存失败记录到控制台。</td></tr><tr><td><code>saveMessages</code></td><td><code>(id?: string) =&gt; Promise&lt;void&gt;</code></td><td>保存指定会话或当前会话中已加载引擎的消息，同时更新元数据时间。没有目标 ID、引擎未加载或存储不支持保存时直接完成；策略向外抛错时会拒绝 Promise。</td></tr><tr><td><code>sendMessage</code></td><td><code>(content: string) =&gt; Promise&lt;void&gt;</code></td><td>通过当前会话引擎发送文本；没有当前会话时直接完成。请求错误按 <code>useMessage.sendMessage</code> 的规则传播。</td></tr><tr><td><code>abortActiveRequest</code></td><td><code>() =&gt; Promise&lt;void&gt;</code></td><td>中止当前会话正在处理或暂停的回合；没有当前会话时直接完成。</td></tr></tbody></table><h4 id="创建参数" tabindex="-1">创建参数 <a class="header-anchor" href="#创建参数" aria-label="Permalink to &quot;创建参数&quot;">​</a></h4><table tabindex="0"><thead><tr><th>参数</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>否</td><td>自动生成</td><td>会话唯一标识。调用方提供 ID 时，需要自行保证当前列表中不重复。</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td>否</td><td>—</td><td>会话标题。</td></tr><tr><td><code>metadata</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>否</td><td>—</td><td>应用自定义元数据。</td></tr><tr><td><code>useMessageOptions</code></td><td><code>Partial&lt;UseMessageOptions&gt;</code></td><td>否</td><td>—</td><td>当前会话的消息引擎覆盖配置，与基础配置浅合并。</td></tr></tbody></table><h3 id="引擎生命周期与并发" tabindex="-1">引擎生命周期与并发 <a class="header-anchor" href="#引擎生命周期与并发" aria-label="Permalink to &quot;引擎生命周期与并发&quot;">​</a></h3><p>每个会话拥有独立的 <code>useMessage</code> 引擎。切换会话时：</p><ul><li>正在处理或暂停的后台引擎会保留，因此多个会话可以并行处理请求；</li><li>可以开始新回合的非活动引擎会被回收；再次切回时，从存储重新加载消息并创建新引擎；</li><li>存储未及时保存的内存状态可能在引擎回收后丢失。自动保存采用节流，不保证引擎回收前完成最后一次保存；需要保证最新状态时，应在切换前等待 <code>saveMessages(id)</code>；</li><li>同一会话的保存、改名和删除会按调用顺序串行进入持久化队列，避免较早的写入在删除后才完成。</li></ul><h3 id="存储策略" tabindex="-1">存储策略 <a class="header-anchor" href="#存储策略" aria-label="Permalink to &quot;存储策略&quot;">​</a></h3><p>以下是 <code>ConversationStorageStrategy</code> 的完整定义：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  loadConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaybePromise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConversationInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  loadMessages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversationId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaybePromise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ChatMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaybePromise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveMessages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversationId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaybePromise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  deleteConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversationId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaybePromise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>deleteConversation</code> 是可选方法。策略未实现它时，Composable 仍会删除内存状态，但无法删除持久化数据。</p><h4 id="存储工厂" tabindex="-1">存储工厂 <a class="header-anchor" href="#存储工厂" aria-label="Permalink to &quot;存储工厂&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">localStorageStrategyFactory</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LocalStorageConfig): ConversationStorageStrategy</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">indexedDBStorageStrategyFactory</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> IndexedDBConfig): ConversationStorageStrategy</span></span></code></pre></div><table tabindex="0"><thead><tr><th>配置</th><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>LocalStorageConfig</code></td><td><code>key</code></td><td><code>string</code></td><td><code>&#39;tiny-robot-ai-conversations&#39;</code></td><td>LocalStorage 存储键。</td></tr><tr><td><code>IndexedDBConfig</code></td><td><code>dbName</code></td><td><code>string</code></td><td><code>&#39;tiny-robot-ai-db&#39;</code></td><td>IndexedDB 数据库名。</td></tr><tr><td><code>IndexedDBConfig</code></td><td><code>dbVersion</code></td><td><code>number</code></td><td><code>1</code></td><td>IndexedDB 数据库版本。</td></tr></tbody></table><h4 id="直接创建策略实例" tabindex="-1">直接创建策略实例 <a class="header-anchor" href="#直接创建策略实例" aria-label="Permalink to &quot;直接创建策略实例&quot;">​</a></h4><p>工厂是推荐入口。包根还导出两个策略类，适合已经在应用中集中管理实例的场景：</p><table tabindex="0"><thead><tr><th>入口</th><th>构造签名</th><th>构造函数默认值</th></tr></thead><tbody><tr><td><code>LocalStorageStrategy</code></td><td><code>new LocalStorageStrategy(storageKey?)</code></td><td><code>storageKey = &#39;tiny-robot-ai-conversations&#39;</code></td></tr><tr><td><code>IndexedDBStrategy</code></td><td><code>new IndexedDBStrategy(dbName?, dbVersion?)</code></td><td><code>dbName = &#39;tiny-robot-ai-db&#39;</code>、<code>dbVersion = 3</code></td></tr></tbody></table><p>注意：<code>indexedDBStorageStrategyFactory()</code> 当前传入的默认版本是 <code>1</code>，而直接调用 <code>new IndexedDBStrategy()</code> 的默认版本是 <code>3</code>。已有数据库升级前应明确指定版本，避免依赖两个入口不同的默认值。</p><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><table tabindex="0"><thead><tr><th>类型名</th><th>类别 / 用途</th><th>说明</th></tr></thead><tbody><tr><td><code>UseConversationOptions</code></td><td>配置</td><td><code>useConversation</code> 的初始化配置。</td></tr><tr><td><code>UseConversationReturn</code></td><td>返回值</td><td>响应式状态和会话动作集合。</td></tr><tr><td><code>ConversationInfo</code></td><td>数据模型</td><td>可持久化的会话元数据，包含 <code>id</code>、可选 <code>title</code>、时间戳和可选 <code>metadata</code>。</td></tr><tr><td><code>Conversation</code></td><td>运行时对象</td><td><code>ConversationInfo</code> 加上当前内存中的 <code>UseMessageReturn</code> 引擎。</td></tr><tr><td><code>ConversationStorageStrategy</code></td><td>扩展接口</td><td>会话和消息的加载、保存与删除协议。</td></tr><tr><td><code>LocalStorageConfig</code></td><td>存储配置</td><td>LocalStorage 工厂配置。</td></tr><tr><td><code>IndexedDBConfig</code></td><td>存储配置</td><td>IndexedDB 工厂配置。</td></tr><tr><td><code>MaybePromise&lt;T&gt;</code></td><td>工具类型</td><td><code>T | Promise&lt;T&gt;</code>，允许存储方法同步或异步实现。</td></tr><tr><td><code>UseMessageOptions</code></td><td>关联配置</td><td>每个会话消息引擎的配置，详见 <a href="./message.html#配置"><code>useMessage</code></a>。</td></tr><tr><td><code>UseMessageReturn</code></td><td>关联返回值</td><td><code>Conversation.engine</code> 的类型，详见 <a href="./message.html#状态"><code>useMessage</code></a>。</td></tr></tbody></table><p><code>ConversationInfo.createdAt</code> 和 <code>updatedAt</code> 都是毫秒时间戳。<code>useConversation</code> 创建或保存会话时会更新这些字段；自定义存储不应擅自改变会话 ID。</p><h2 id="迁移与弃用" tabindex="-1">迁移与弃用 <a class="header-anchor" href="#迁移与弃用" aria-label="Permalink to &quot;迁移与弃用&quot;">​</a></h2><p>本页描述当前公开 API。仍在使用 <code>client</code>、<code>state</code> 或单一 <code>messageManager</code> 的项目，可参考 <a href="./../migration/use-conversation-migration.html">useConversation 迁移</a> 进入以 <code>useMessageOptions</code>、独立会话引擎和存储策略为核心的当前架构；迁移后请以本页 API 为准。</p>`,35))])}}});export{_ as __pageData,T as default};
