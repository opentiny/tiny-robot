const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Custom.koHA3wTd.js","assets/chunks/theme._Dysf0_I.js","assets/chunks/framework.D5IXmigW.js","assets/chunks/index.ZZ10bc7j.js","assets/chunks/IndexedDB.BBcUe2tp.js","assets/chunks/LocalStorage.CUI7PxeK.js"])))=>i.map(i=>d[i]);
import{aD as k,bQ as C,aZ as u,aL as B,v as D,H as F,bL as d,bB as E,J as n,bk as i,bJ as e,G as c,w as l,I as v,b7 as g,aU as m}from"./chunks/framework.D5IXmigW.js";import{L as y,N as A}from"./chunks/index.BPwzYTgQ.js";const b=`<template>
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
      @submit="sendMessage"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import {
  type ConversationStorageStrategy,
  type ConversationInfo,
  type ChatMessage,
  sseStreamToGenerator,
  useConversation,
} from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'

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

const apiUrl = window.parent?.location.origin || location.origin

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
    responseProvider: async (requestBody, abortSignal) => {
      const response = await fetch(\`\${apiUrl}/api/chat/completions\`, {
        method: 'POST',
        body: JSON.stringify({ ...requestBody, stream: true }),
        signal: abortSignal,
      })
      return sseStreamToGenerator(response, { signal: abortSignal })
    },
  },
  storage: customStorage,
  autoSaveMessages: true, // 启用自动保存消息
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const sendMessage = (content: string) => {
  activeConversation.value?.engine?.sendMessage(content)
  inputMessage.value = ''
}

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
`,f=`<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="sendMessage"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { indexedDBStorageStrategyFactory, sseStreamToGenerator, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'

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

const apiUrl = window.parent?.location.origin || location.origin

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
    responseProvider: async (requestBody, abortSignal) => {
      const response = await fetch(\`\${apiUrl}/api/chat/completions\`, {
        method: 'POST',
        body: JSON.stringify({ ...requestBody, stream: true }),
        signal: abortSignal,
      })
      return sseStreamToGenerator(response, { signal: abortSignal })
    },
  },
  storage: indexedDBStorageStrategyFactory({
    dbName: 'demo-chat-db',
    dbVersion: 1,
  }),
  autoSaveMessages: true, // 启用自动保存消息
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const sendMessage = (content: string) => {
  activeConversation.value?.engine?.sendMessage(content)
  inputMessage.value = ''
}

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

    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="sendMessage"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, localStorageStrategyFactory, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h, ref } from 'vue'

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

const apiUrl = window.parent?.location.origin || location.origin

// 使用 LocalStorage 策略
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
    responseProvider: async (requestBody, abortSignal) => {
      const response = await fetch(\`\${apiUrl}/api/chat/completions\`, {
        method: 'POST',
        body: JSON.stringify({ ...requestBody, stream: true }),
        signal: abortSignal,
      })
      return sseStreamToGenerator(response, { signal: abortSignal })
    },
  },
  storage: localStorageStrategyFactory({
    key: 'demo-conversations-localstorage', // 自定义存储键名
  }),
  autoSaveMessages: true, // 启用自动保存消息
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const sendMessage = (content: string) => {
  activeConversation.value?.engine?.sendMessage(content)
  inputMessage.value = ''
}

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
`,T=JSON.parse('{"title":"存储策略 Storage","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/storage.md","filePath":"tools/storage.md"}'),x={name:"tools/storage.md"},w=Object.assign(x,{setup(I){const r=g();k(async()=>{r.value=(await C(async()=>{const{default:t}=await import("./chunks/Custom.koHA3wTd.js");return{default:t}},__vite__mapDeps([0,1,2,3]))).default});const o=g();k(async()=>{o.value=(await C(async()=>{const{default:t}=await import("./chunks/IndexedDB.BBcUe2tp.js");return{default:t}},__vite__mapDeps([4,1,2,3]))).default});const a=m(!0),p=g();return k(async()=>{p.value=(await C(async()=>{const{default:t}=await import("./chunks/LocalStorage.CUI7PxeK.js");return{default:t}},__vite__mapDeps([5,1,2,3]))).default}),(t,s)=>{const h=u("ClientOnly");return B(),D("div",null,[s[3]||(s[3]=F("",5)),d(n(i(y),null,null,512),[[E,a.value]]),n(h,null,{default:e(()=>[n(i(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22LocalStorage.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fstorage%2FLocalStorage.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20localStorageStrategyFactory%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%20LocalStorage%20%E7%AD%96%E7%95%A5%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%20%20clear%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20localStorageStrategyFactory(%7B%5Cn%20%20%20%20key%3A%20'demo-conversations-localstorage'%2C%20%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E9%94%AE%E5%90%8D%5Cn%20%20%7D)%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%20%2F%2F%20%E5%90%AF%E7%94%A8%E8%87%AA%E5%8A%A8%E4%BF%9D%E5%AD%98%E6%B6%88%E6%81%AF%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20sendMessage%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20activeConversation.value%3F.engine%3F.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20clear()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{a.value=!1}),vueCode:i(S)},c({_:2},[p.value?{name:"vue",fn:e(()=>[n(i(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=l("h3",{id:"indexeddb-策略",tabindex:"-1"},[v("IndexedDB 策略 "),l("a",{class:"header-anchor",href:"#indexeddb-策略","aria-label":'Permalink to "IndexedDB 策略"'},"​")],-1)),s[5]||(s[5]=l("p",null,"使用浏览器 IndexedDB 存储会话数据，支持更大容量和更好性能：",-1)),d(n(i(y),null,null,512),[[E,a.value]]),n(h,null,{default:e(()=>[n(i(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22IndexedDB.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fstorage%2FIndexedDB.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20indexedDBStorageStrategyFactory%2C%20sseStreamToGenerator%2C%20useConversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinyButton%2C%20TinySelect%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%5Cn%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%20%20clear%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20indexedDBStorageStrategyFactory(%7B%5Cn%20%20%20%20dbName%3A%20'demo-chat-db'%2C%5Cn%20%20%20%20dbVersion%3A%201%2C%5Cn%20%20%7D)%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%20%2F%2F%20%E5%90%AF%E7%94%A8%E8%87%AA%E5%8A%A8%E4%BF%9D%E5%AD%98%E6%B6%88%E6%81%AF%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20sendMessage%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20activeConversation.value%3F.engine%3F.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20clear()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{a.value=!1}),vueCode:i(f)},c({_:2},[o.value?{name:"vue",fn:e(()=>[n(i(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[6]||(s[6]=l("h3",{id:"自定义存储策略",tabindex:"-1"},[v("自定义存储策略 "),l("a",{class:"header-anchor",href:"#自定义存储策略","aria-label":'Permalink to "自定义存储策略"'},"​")],-1)),s[7]||(s[7]=l("p",null,"实现自定义存储策略，例如将数据保存到远程服务器：",-1)),d(n(i(y),null,null,512),[[E,a.value]]),n(h,null,{default:e(()=>[n(i(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Custom.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fstorage%2FCustom.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22info%5C%22%3E%5Cn%20%20%20%20%20%20%3Cp%3E%3Cstrong%3E%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%E7%A4%BA%E4%BE%8B%3C%2Fstrong%3E%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3Cp%3E%E6%AD%A4%E7%A4%BA%E4%BE%8B%E5%B1%95%E7%A4%BA%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%E3%80%82%E5%9C%A8%E5%AE%9E%E9%99%85%E5%BA%94%E7%94%A8%E4%B8%AD%EF%BC%8C%E4%BD%A0%E5%8F%AF%E4%BB%A5%E5%B0%86%E6%95%B0%E6%8D%AE%E4%BF%9D%E5%AD%98%E5%88%B0%E8%BF%9C%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3Cp%3E%E6%9C%AC%E7%A4%BA%E4%BE%8B%E4%BD%BF%E7%94%A8%E5%86%85%E5%AD%98%E5%AD%98%E5%82%A8%E4%BD%9C%E4%B8%BA%E6%BC%94%E7%A4%BA%EF%BC%8C%E5%88%B7%E6%96%B0%E9%A1%B5%E9%9D%A2%E5%90%8E%E6%95%B0%E6%8D%AE%E4%BC%9A%E4%B8%A2%E5%A4%B1%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortActiveRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20type%20ConversationStorageStrategy%2C%5Cn%20%20type%20ConversationInfo%2C%5Cn%20%20type%20ChatMessage%2C%5Cn%20%20sseStreamToGenerator%2C%5Cn%20%20useConversation%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinyButton%2C%20TinySelect%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cn%5Cn%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%EF%BC%9A%E4%BD%BF%E7%94%A8%E5%86%85%E5%AD%98%E5%AD%98%E5%82%A8%EF%BC%88%E4%BB%85%E4%BD%9C%E4%B8%BA%E7%A4%BA%E4%BE%8B%EF%BC%89%5Cnclass%20MemoryStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20private%20conversations%3A%20ConversationInfo%5B%5D%20%3D%20%5B%5D%5Cn%20%20private%20messagesMap%3A%20Map%3Cstring%2C%20ChatMessage%5B%5D%3E%20%3D%20new%20Map()%5Cn%5Cn%20%20loadConversations()%3A%20ConversationInfo%5B%5D%20%7B%5Cn%20%20%20%20return%20%5B...this.conversations%5D%5Cn%20%20%7D%5Cn%5Cn%20%20loadMessages(conversationId%3A%20string)%3A%20ChatMessage%5B%5D%20%7B%5Cn%20%20%20%20return%20%5B...(this.messagesMap.get(conversationId)%20%7C%7C%20%5B%5D)%5D%5Cn%20%20%7D%5Cn%5Cn%20%20saveConversation(conversation%3A%20ConversationInfo)%3A%20void%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversation.id)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations%5Bindex%5D%20%3D%20conversation%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20this.conversations.unshift(conversation)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20saveMessages(conversationId%3A%20string%2C%20messages%3A%20ChatMessage%5B%5D)%3A%20void%20%7B%5Cn%20%20%20%20this.messagesMap.set(conversationId%2C%20%5B...messages%5D)%5Cn%20%20%7D%5Cn%5Cn%20%20deleteConversation(conversationId%3A%20string)%3A%20void%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversationId)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations.splice(index%2C%201)%5Cn%20%20%20%20%7D%5Cn%20%20%20%20this.messagesMap.delete(conversationId)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E7%AD%96%E7%95%A5%5Cnconst%20customStorage%20%3D%20new%20MemoryStorageStrategy()%5Cn%5Cnconst%20%7B%5Cn%20%20activeConversation%2C%5Cn%20%20activeConversationId%2C%5Cn%20%20conversations%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%20%20abortActiveRequest%2C%5Cn%20%20clear%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%20%20storage%3A%20customStorage%2C%5Cn%20%20autoSaveMessages%3A%20true%2C%20%2F%2F%20%E5%90%AF%E7%94%A8%E8%87%AA%E5%8A%A8%E4%BF%9D%E5%AD%98%E6%B6%88%E6%81%AF%5Cn%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cnconst%20isProcessing%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.isProcessing.value)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20sendMessage%20%3D%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20activeConversation.value%3F.engine%3F.sendMessage(content)%5Cn%20%20inputMessage.value%20%3D%20''%5Cn%7D%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%20%7C%7C%20%60%E4%BC%9A%E8%AF%9D%20%24%7Bconversation.id.slice(0%2C%208)%7D%60%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20clear()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.info%20%7B%5Cn%20%20background%3A%20%23f0f9ff%3B%5Cn%20%20border%3A%201px%20solid%20%23bae6fd%3B%5Cn%20%20border-radius%3A%204px%3B%5Cn%20%20padding%3A%2012px%3B%5Cn%20%20margin-bottom%3A%2016px%3B%5Cn%7D%5Cn%5Cn.info%20p%20%7B%5Cn%20%20margin%3A%204px%200%3B%5Cn%20%20font-size%3A%2014px%3B%5Cn%20%20color%3A%20%230369a1%3B%5Cn%7D%5Cn%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{a.value=!1}),vueCode:i(b)},c({_:2},[r.value?{name:"vue",fn:e(()=>[n(i(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=F("",40))])}}});export{T as __pageData,w as default};
