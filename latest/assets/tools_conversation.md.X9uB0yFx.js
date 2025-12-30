const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/IndexedDB.D0Pzx8jm.js","assets/chunks/theme.BUO7p23S.js","assets/chunks/framework.rwg-_Kqy.js","assets/chunks/index.kfWdIXEf.js","assets/chunks/LocalStorage.B2nCdL4H.js","assets/chunks/Basic.BmoFNH30.js"])))=>i.map(i=>d[i]);
import{s as o,A as E,_ as d,r as D,H as u,e as v,o as m,a4 as F,ah as C,J as i,q as e,ai as g,x as n,i as l,ak as c,g as B}from"./chunks/framework.rwg-_Kqy.js";import{L as y,N as A}from"./chunks/index.dOuRpsuE.js";const b=`<template>
  <div>
    <tr-bubble-list :items="messages" :roles="roles"></tr-bubble-list>

    <!-- 消息输入区域 -->
    <tr-sender
      v-model="inputMessage"
      :placeholder="isGenerating ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isGenerating"
      @submit="sendMessage"
      @cancel="abortRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select :modelValue="state.currentId" :options="options" @change="switchConversation($event)"></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, AIClient, GeneratingStatus, indexedDBStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const client = new AIClient({
  provider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: window.parent?.location.origin || location.origin,
})

// 使用 IndexedDB 策略
const {
  state,
  messageManager: { messages, inputMessage, sendMessage, messageState, abortRequest },
  createConversation,
  switchConversation,
} = useConversation({
  client,
  storage: indexedDBStorageStrategyFactory({
    dbName: 'demo-chat-db', // 自定义数据库名称
    dbVersion: 1, // 数据库版本
  }),
  events: {
    onLoaded(conversations) {
      if (conversations.length === 0) {
        createConversation()
      }
    },
  },
})

const options = computed(() =>
  state.conversations.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)

// 是否正在生成
const isGenerating = computed(() => GeneratingStatus.includes(messageState.status))

// 清空存储
const clearStorage = async () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    try {
      // 删除 IndexedDB 数据库
      indexedDB.deleteDatabase('demo-chat-db')
      location.reload()
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
`,f=`<template>
  <div>
    <tr-bubble-list :items="messages" :roles="roles"></tr-bubble-list>

    <!-- 消息输入区域 -->
    <tr-sender
      v-model="inputMessage"
      :placeholder="isGenerating ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isGenerating"
      @submit="sendMessage"
      @cancel="abortRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select :modelValue="state.currentId" :options="options" @change="switchConversation($event)"></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, AIClient, GeneratingStatus, localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const client = new AIClient({
  provider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: window.parent?.location.origin || location.origin,
})

// 使用 LocalStorage 策略
const {
  state,
  messageManager: { messages, inputMessage, sendMessage, messageState, abortRequest },
  createConversation,
  switchConversation,
} = useConversation({
  client,
  storage: localStorageStrategyFactory({
    key: 'demo-conversations-localstorage', // 自定义存储键名
  }),
  events: {
    onLoaded(conversations) {
      if (conversations.length === 0) {
        createConversation()
      }
    },
  },
})

const options = computed(() =>
  state.conversations.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)

// 是否正在生成
const isGenerating = computed(() => GeneratingStatus.includes(messageState.status))

// 清空存储
const clearStorage = () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    localStorage.removeItem('demo-conversations-localstorage')
    location.reload()
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
  <h1>会话</h1>
  <tr-bubble-list :items="messages" :roles="roles"></tr-bubble-list>
  <div class="actions">
    <span><b>切换会话</b></span
    ><tiny-select :modelValue="state.currentId" :options="options" @change="switchConversation($event)"></tiny-select>
    <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, AIClient, ConversationStorageStrategy, Conversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h } from 'vue'

class MockStorageStrategy implements ConversationStorageStrategy {
  mockData: Conversation[] = [
    {
      id: 'm9zfbomexdm9pza',
      title: '安排日程',
      createdAt: 1745744706662,
      updatedAt: 1745744717297,
      messages: [
        {
          role: 'user',
          content: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
        },
        {
          role: 'assistant',
          content: '这是对 "今天需要我帮你安排日程，规划旅行，还是起草一封邮件？" 的模拟回复。',
        },
      ],
      metadata: {},
    },
    {
      id: 'm9zefqta1rihhpj',
      title: '写段文案',
      createdAt: 1745743216510,
      updatedAt: 1745744704671,
      messages: [
        {
          role: 'user',
          content: '想写段文案、起个名字，还是来点灵感？',
        },
        {
          role: 'assistant',
          content: '这是对 "想写段文案、起个名字，还是来点灵感？" 的模拟回复。',
        },
        {
          role: 'user',
          content: 'hello',
        },
        {
          role: 'assistant',
          content: '你好！我是TinyRobot搭建的AI助手。你可以问我任何问题，我会尽力回答。',
        },
      ],
      metadata: {},
    },
  ]

  async saveConversations(conversations: Conversation[]) {
    this.mockData = conversations
  }

  async loadConversations(): Promise<Conversation[]> {
    return this.mockData || []
  }
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: window.parent?.location.origin || location.origin + import.meta.env.BASE_URL,
})

const storage = new MockStorageStrategy()
const {
  state,
  messageManager: { messages }, // 与 useMessage 返回一致，具体查看useMessage
  createConversation,
  switchConversation,
} = useConversation({ client, storage })

const options = computed(() =>
  state.conversations.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)

console.log('state: ', state)
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
`,T=JSON.parse('{"title":"对话管理 useConversation","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/conversation.md","filePath":"tools/conversation.md"}'),x={name:"tools/conversation.md"},M=Object.assign(x,{setup(I){const p=o();E(async()=>{p.value=(await d(async()=>{const{default:t}=await import("./chunks/IndexedDB.D0Pzx8jm.js");return{default:t}},__vite__mapDeps([0,1,2,3]))).default});const h=o();E(async()=>{h.value=(await d(async()=>{const{default:t}=await import("./chunks/LocalStorage.B2nCdL4H.js");return{default:t}},__vite__mapDeps([4,1,2,3]))).default});const a=D(!0),r=o();return E(async()=>{r.value=(await d(async()=>{const{default:t}=await import("./chunks/Basic.BmoFNH30.js");return{default:t}},__vite__mapDeps([5,1,2,3]))).default}),(t,s)=>{const k=u("ClientOnly");return m(),v("div",null,[s[3]||(s[3]=F('<h1 id="对话管理-useconversation" tabindex="-1">对话管理 useConversation <a class="header-anchor" href="#对话管理-useconversation" aria-label="Permalink to &quot;对话管理 useConversation&quot;">​</a></h1><p><code>useConversation</code> 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。</p><h2 id="示例" tabindex="-1">示例 <a class="header-anchor" href="#示例" aria-label="Permalink to &quot;示例&quot;">​</a></h2><h3 id="基础示例" tabindex="-1">基础示例 <a class="header-anchor" href="#基础示例" aria-label="Permalink to &quot;基础示例&quot;">​</a></h3><p>使用 Mock 存储策略的基础示例，适合快速了解功能：</p>',5)),C(i(n(y),null,null,512),[[g,a.value]]),i(k,null,{default:l(()=>[i(n(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ch1%3E%E4%BC%9A%E8%AF%9D%3C%2Fh1%3E%5Cn%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%5Cn%20%20%20%20%3E%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20ConversationStorageStrategy%2C%20Conversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnclass%20MockStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20mockData%3A%20Conversation%5B%5D%20%3D%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745744706662%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744717297%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745743216510%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744704671%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'hello'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFTinyRobot%E6%90%AD%E5%BB%BA%E7%9A%84AI%E5%8A%A9%E6%89%8B%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E9%97%AE%E6%88%91%E4%BB%BB%E4%BD%95%E9%97%AE%E9%A2%98%EF%BC%8C%E6%88%91%E4%BC%9A%E5%B0%BD%E5%8A%9B%E5%9B%9E%E7%AD%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%5Cn%5Cn%20%20async%20saveConversations(conversations%3A%20Conversation%5B%5D)%20%7B%5Cn%20%20%20%20this.mockData%20%3D%20conversations%5Cn%20%20%7D%5Cn%5Cn%20%20async%20loadConversations()%3A%20Promise%3CConversation%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.mockData%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Flatest%2F'%2C%5Cn%7D)%5Cn%5Cnconst%20storage%20%3D%20new%20MockStorageStrategy()%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%20%7D%2C%20%2F%2F%20%E4%B8%8E%20useMessage%20%E8%BF%94%E5%9B%9E%E4%B8%80%E8%87%B4%EF%BC%8C%E5%85%B7%E4%BD%93%E6%9F%A5%E7%9C%8BuseMessage%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%20client%2C%20storage%20%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconsole.log('state%3A%20'%2C%20state)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{a.value=!1}),vueCode:n(S)},c({_:2},[r.value?{name:"vue",fn:l(()=>[i(n(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=e("h3",{id:"localstorage-策略",tabindex:"-1"},[B("LocalStorage 策略 "),e("a",{class:"header-anchor",href:"#localstorage-策略","aria-label":'Permalink to "LocalStorage 策略"'},"​")],-1)),s[5]||(s[5]=e("p",null,"使用浏览器 LocalStorage 存储会话数据，刷新页面后数据仍然保留：",-1)),C(i(n(y),null,null,512),[[g,a.value]]),i(k,null,{default:l(()=>[i(n(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22LocalStorage.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FLocalStorage.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%B6%88%E6%81%AF%E8%BE%93%E5%85%A5%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isGenerating%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isGenerating%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20GeneratingStatus%2C%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%2C%5Cn%7D)%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%20LocalStorage%20%E7%AD%96%E7%95%A5%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%2C%20inputMessage%2C%20sendMessage%2C%20messageState%2C%20abortRequest%20%7D%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20client%2C%5Cn%20%20storage%3A%20localStorageStrategyFactory(%7B%5Cn%20%20%20%20key%3A%20'demo-conversations-localstorage'%2C%20%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E9%94%AE%E5%90%8D%5Cn%20%20%7D)%2C%5Cn%20%20events%3A%20%7B%5Cn%20%20%20%20onLoaded(conversations)%20%7B%5Cn%20%20%20%20%20%20if%20(conversations.length%20%3D%3D%3D%200)%20%7B%5Cn%20%20%20%20%20%20%20%20createConversation()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%98%AF%E5%90%A6%E6%AD%A3%E5%9C%A8%E7%94%9F%E6%88%90%5Cnconst%20isGenerating%20%3D%20computed(()%20%3D%3E%20GeneratingStatus.includes(messageState.status))%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20localStorage.removeItem('demo-conversations-localstorage')%5Cn%20%20%20%20location.reload()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{a.value=!1}),vueCode:n(f)},c({_:2},[h.value?{name:"vue",fn:l(()=>[i(n(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[6]||(s[6]=e("h3",{id:"indexeddb-策略",tabindex:"-1"},[B("IndexedDB 策略 "),e("a",{class:"header-anchor",href:"#indexeddb-策略","aria-label":'Permalink to "IndexedDB 策略"'},"​")],-1)),s[7]||(s[7]=e("p",null,"使用浏览器 IndexedDB 存储会话数据，支持更大容量和更好性能：",-1)),C(i(n(y),null,null,512),[[g,a.value]]),i(k,null,{default:l(()=>[i(n(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22IndexedDB.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FIndexedDB.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%B6%88%E6%81%AF%E8%BE%93%E5%85%A5%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isGenerating%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isGenerating%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20GeneratingStatus%2C%20indexedDBStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%2C%5Cn%7D)%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%20IndexedDB%20%E7%AD%96%E7%95%A5%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%2C%20inputMessage%2C%20sendMessage%2C%20messageState%2C%20abortRequest%20%7D%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20client%2C%5Cn%20%20storage%3A%20indexedDBStorageStrategyFactory(%7B%5Cn%20%20%20%20dbName%3A%20'demo-chat-db'%2C%20%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E6%95%B0%E6%8D%AE%E5%BA%93%E5%90%8D%E7%A7%B0%5Cn%20%20%20%20dbVersion%3A%201%2C%20%2F%2F%20%E6%95%B0%E6%8D%AE%E5%BA%93%E7%89%88%E6%9C%AC%5Cn%20%20%7D)%2C%5Cn%20%20events%3A%20%7B%5Cn%20%20%20%20onLoaded(conversations)%20%7B%5Cn%20%20%20%20%20%20if%20(conversations.length%20%3D%3D%3D%200)%20%7B%5Cn%20%20%20%20%20%20%20%20createConversation()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%98%AF%E5%90%A6%E6%AD%A3%E5%9C%A8%E7%94%9F%E6%88%90%5Cnconst%20isGenerating%20%3D%20computed(()%20%3D%3E%20GeneratingStatus.includes(messageState.status))%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%A0%E9%99%A4%20IndexedDB%20%E6%95%B0%E6%8D%AE%E5%BA%93%5Cn%20%20%20%20%20%20indexedDB.deleteDatabase('demo-chat-db')%5Cn%20%20%20%20%20%20location.reload()%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20console.error('%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%E5%A4%B1%E8%B4%A5%3A'%2C%20error)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{a.value=!1}),vueCode:n(b)},c({_:2},[p.value?{name:"vue",fn:l(()=>[i(n(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=F(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="选项" tabindex="-1">选项 <a class="header-anchor" href="#选项" aria-label="Permalink to &quot;选项&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** AI客户端实例 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  client</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIClient</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 存储策略（可选，默认使用 LocalStorage） */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  storage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否自动保存 (default: true) */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoSave</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否允许空会话 (default: false) */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  allowEmpty</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否默认使用流式响应 (default: true)*/</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  useStreamByDefault</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 错误消息模板 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  errorMessage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 事件回调 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  events</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationEvents</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="事件类型" tabindex="-1">事件类型 <a class="header-anchor" href="#事件类型" aria-label="Permalink to &quot;事件类型&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationEvents</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseMessageOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;events&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话加载完成回调 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onLoaded</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="返回值" tabindex="-1">返回值 <a class="header-anchor" href="#返回值" aria-label="Permalink to &quot;返回值&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话状态 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  state</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 消息管理 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messageManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseMessageReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 创建新会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  createConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 切换会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  switchConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 删除会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  deleteConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  updateTitle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新会话元数据 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  updateMetadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 保存会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 加载会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  loadConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 生成会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  generateTitle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 获取当前会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getCurrentConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="会话状态" tabindex="-1">会话状态 <a class="header-anchor" href="#会话状态" aria-label="Permalink to &quot;会话状态&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationState</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 当前会话ID */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  currentId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 是否正在加载 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  loading</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="会话接口" tabindex="-1">会话接口 <a class="header-anchor" href="#会话接口" aria-label="Permalink to &quot;会话接口&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话ID */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 创建时间 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  createdAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新时间 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  updatedAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 自定义元数据 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 消息 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  messages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[];</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="存储策略" tabindex="-1">存储策略 <a class="header-anchor" href="#存储策略" aria-label="Permalink to &quot;存储策略&quot;">​</a></h3><h4 id="使用-localstorage-默认" tabindex="-1">使用 LocalStorage（默认） <a class="header-anchor" href="#使用-localstorage-默认" aria-label="Permalink to &quot;使用 LocalStorage（默认）&quot;">​</a></h4><p>默认情况下，会话数据存储在浏览器的 LocalStorage 中：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> conversationManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useConversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  client,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 默认使用 LocalStorage，无需配置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h4 id="使用-localstorage-自定义配置" tabindex="-1">使用 LocalStorage 自定义配置 <a class="header-anchor" href="#使用-localstorage-自定义配置" aria-label="Permalink to &quot;使用 LocalStorage 自定义配置&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { localStorageStrategyFactory } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-kit&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> conversationManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useConversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  client,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  storage: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">localStorageStrategyFactory</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    key: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;my-app-conversations&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h4 id="使用-indexeddb" tabindex="-1">使用 IndexedDB <a class="header-anchor" href="#使用-indexeddb" aria-label="Permalink to &quot;使用 IndexedDB&quot;">​</a></h4><p>IndexedDB 相比 LocalStorage 具有更大的存储容量（&gt;50MB）和更好的性能，适合存储大量会话数据：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { indexedDBStorageStrategyFactory } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-kit&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> conversationManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useConversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  client,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  storage: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">indexedDBStorageStrategyFactory</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    dbName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;my-chat-app-db&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    dbVersion: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h4 id="存储策略对比" tabindex="-1">存储策略对比 <a class="header-anchor" href="#存储策略对比" aria-label="Permalink to &quot;存储策略对比&quot;">​</a></h4><table tabindex="0"><thead><tr><th>特性</th><th>LocalStorage</th><th>IndexedDB</th></tr></thead><tbody><tr><td>存储容量</td><td>~5-10MB</td><td>&gt;50MB</td></tr><tr><td>性能</td><td>同步操作</td><td>异步操作，不阻塞主线程</td></tr><tr><td>数据类型</td><td>仅字符串（需 JSON 序列化）</td><td>支持对象、数组、二进制</td></tr><tr><td>查询能力</td><td>简单 key-value</td><td>支持索引和复杂查询</td></tr><tr><td>浏览器支持</td><td>所有现代浏览器</td><td>所有现代浏览器（不支持 IE）</td></tr><tr><td>隐私模式</td><td>✅ 支持</td><td>⚠️ 受限（见下方说明）</td></tr><tr><td>适用场景</td><td>少量会话（&lt;100个）</td><td>大量会话或长对话历史</td></tr></tbody></table><h4 id="重要提示-隐私-无痕模式限制" tabindex="-1">重要提示：隐私/无痕模式限制 <a class="header-anchor" href="#重要提示-隐私-无痕模式限制" aria-label="Permalink to &quot;重要提示：隐私/无痕模式限制&quot;">​</a></h4><p><strong>IndexedDB 在隐私模式下的行为</strong>：</p><p>不同浏览器在隐私/无痕模式下对 IndexedDB 的支持有所不同：</p><ul><li><strong>Chrome/Edge 隐私模式</strong>：IndexedDB 可用，但数据在关闭浏览器后会被清除</li><li><strong>Firefox 隐私模式</strong>：IndexedDB 可用，但存储配额较小</li><li><strong>Safari 隐私模式</strong>：IndexedDB <strong>完全不可用</strong>，会抛出错误</li></ul><h4 id="自定义存储策略" tabindex="-1">自定义存储策略 <a class="header-anchor" href="#自定义存储策略" aria-label="Permalink to &quot;自定义存储策略&quot;">​</a></h4><p>你也可以实现自定义的存储策略，例如将数据保存到远程服务器：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ConversationStorageStrategy, Conversation } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@tiny-robot/kit&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 远程存储策略示例</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> RemoteStorageStrategy</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> apiUrl</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  constructor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">apiUrl</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.apiUrl </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> apiUrl;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  async</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> saveConversations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[])</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\${</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">apiUrl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}/conversations\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      method: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;POST&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      headers: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Content-Type&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;application/json&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      body: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">JSON</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stringify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(conversations)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  async</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadConversations</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt; {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\${</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">apiUrl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}/conversations\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> response.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  async</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> clear</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\${</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">apiUrl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}/conversations\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, { method: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;DELETE&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用自定义存储策略</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> conversationManager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useConversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  client,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  storage: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> RemoteStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://api.example.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h3 id="存储策略接口" tabindex="-1">存储策略接口 <a class="header-anchor" href="#存储策略接口" aria-label="Permalink to &quot;存储策略接口&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 保存会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 加载会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  loadConversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[];</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 清空所有会话（可选） */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  clear</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,31))])}}});export{T as __pageData,M as default};
