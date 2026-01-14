const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/IndexedDB.Cj1bUUBz.js","assets/chunks/theme.BKU-i5Nn.js","assets/chunks/framework.CjJItH0B.js","assets/chunks/index.BYfscwls.js","assets/chunks/LocalStorage.ZHH0_oEN.js","assets/chunks/Basic.CNye25Ji.js"])))=>i.map(i=>d[i]);
import{s as o,A as E,_ as d,r as D,H as u,e as v,o as m,a4 as F,ah as C,J as i,q as e,ai as g,x as n,i as l,ak as c,g as B}from"./chunks/framework.CjJItH0B.js";import{L as y,N as A}from"./chunks/index.bQngEf3t.js";const b=`<template>
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
`,T=JSON.parse('{"title":"对话管理 useConversation","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/conversation.md","filePath":"tools/conversation.md"}'),x={name:"tools/conversation.md"},M=Object.assign(x,{setup(I){const p=o();E(async()=>{p.value=(await d(async()=>{const{default:t}=await import("./chunks/IndexedDB.Cj1bUUBz.js");return{default:t}},__vite__mapDeps([0,1,2,3]))).default});const h=o();E(async()=>{h.value=(await d(async()=>{const{default:t}=await import("./chunks/LocalStorage.ZHH0_oEN.js");return{default:t}},__vite__mapDeps([4,1,2,3]))).default});const a=D(!0),r=o();return E(async()=>{r.value=(await d(async()=>{const{default:t}=await import("./chunks/Basic.CNye25Ji.js");return{default:t}},__vite__mapDeps([5,1,2,3]))).default}),(t,s)=>{const k=u("ClientOnly");return m(),v("div",null,[s[3]||(s[3]=F("",5)),C(i(n(y),null,null,512),[[g,a.value]]),i(k,null,{default:l(()=>[i(n(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ch1%3E%E4%BC%9A%E8%AF%9D%3C%2Fh1%3E%5Cn%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%5Cn%20%20%20%20%3E%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20ConversationStorageStrategy%2C%20Conversation%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnclass%20MockStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20mockData%3A%20Conversation%5B%5D%20%3D%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745744706662%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744717297%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745743216510%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744704671%2C%5Cn%20%20%20%20%20%20messages%3A%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'hello'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFTinyRobot%E6%90%AD%E5%BB%BA%E7%9A%84AI%E5%8A%A9%E6%89%8B%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E9%97%AE%E6%88%91%E4%BB%BB%E4%BD%95%E9%97%AE%E9%A2%98%EF%BC%8C%E6%88%91%E4%BC%9A%E5%B0%BD%E5%8A%9B%E5%9B%9E%E7%AD%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%5Cn%5Cn%20%20async%20saveConversations(conversations%3A%20Conversation%5B%5D)%20%7B%5Cn%20%20%20%20this.mockData%20%3D%20conversations%5Cn%20%20%7D%5Cn%5Cn%20%20async%20loadConversations()%3A%20Promise%3CConversation%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.mockData%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Falpha%2F'%2C%5Cn%7D)%5Cn%5Cnconst%20storage%20%3D%20new%20MockStorageStrategy()%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%20%7D%2C%20%2F%2F%20%E4%B8%8E%20useMessage%20%E8%BF%94%E5%9B%9E%E4%B8%80%E8%87%B4%EF%BC%8C%E5%85%B7%E4%BD%93%E6%9F%A5%E7%9C%8BuseMessage%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%20client%2C%20storage%20%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cnconsole.log('state%3A%20'%2C%20state)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{a.value=!1}),vueCode:n(S)},c({_:2},[r.value?{name:"vue",fn:l(()=>[i(n(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=e("h3",{id:"localstorage-策略",tabindex:"-1"},[B("LocalStorage 策略 "),e("a",{class:"header-anchor",href:"#localstorage-策略","aria-label":'Permalink to "LocalStorage 策略"'},"​")],-1)),s[5]||(s[5]=e("p",null,"使用浏览器 LocalStorage 存储会话数据，刷新页面后数据仍然保留：",-1)),C(i(n(y),null,null,512),[[g,a.value]]),i(k,null,{default:l(()=>[i(n(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22LocalStorage.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FLocalStorage.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%B6%88%E6%81%AF%E8%BE%93%E5%85%A5%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isGenerating%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isGenerating%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20GeneratingStatus%2C%20localStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%2C%5Cn%7D)%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%20LocalStorage%20%E7%AD%96%E7%95%A5%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%2C%20inputMessage%2C%20sendMessage%2C%20messageState%2C%20abortRequest%20%7D%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20client%2C%5Cn%20%20storage%3A%20localStorageStrategyFactory(%7B%5Cn%20%20%20%20key%3A%20'demo-conversations-localstorage'%2C%20%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%98%E5%82%A8%E9%94%AE%E5%90%8D%5Cn%20%20%7D)%2C%5Cn%20%20events%3A%20%7B%5Cn%20%20%20%20onLoaded(conversations)%20%7B%5Cn%20%20%20%20%20%20if%20(conversations.length%20%3D%3D%3D%200)%20%7B%5Cn%20%20%20%20%20%20%20%20createConversation()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%98%AF%E5%90%A6%E6%AD%A3%E5%9C%A8%E7%94%9F%E6%88%90%5Cnconst%20isGenerating%20%3D%20computed(()%20%3D%3E%20GeneratingStatus.includes(messageState.status))%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20localStorage.removeItem('demo-conversations-localstorage')%5Cn%20%20%20%20location.reload()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{a.value=!1}),vueCode:n(f)},c({_:2},[h.value?{name:"vue",fn:l(()=>[i(n(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[6]||(s[6]=e("h3",{id:"indexeddb-策略",tabindex:"-1"},[B("IndexedDB 策略 "),e("a",{class:"header-anchor",href:"#indexeddb-策略","aria-label":'Permalink to "IndexedDB 策略"'},"​")],-1)),s[7]||(s[7]=e("p",null,"使用浏览器 IndexedDB 存储会话数据，支持更大容量和更好性能：",-1)),C(i(n(y),null,null,512),[[g,a.value]]),i(k,null,{default:l(()=>[i(n(A),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22IndexedDB.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FIndexedDB.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%5Cn%20%20%20%20%3C!--%20%E6%B6%88%E6%81%AF%E8%BE%93%E5%85%A5%E5%8C%BA%E5%9F%9F%20--%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isGenerating%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isGenerating%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%20%3AmodelValue%3D%5C%22state.currentId%5C%22%20%3Aoptions%3D%5C%22options%5C%22%20%40change%3D%5C%22switchConversation(%24event)%5C%22%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22warning%5C%22%20%40click%3D%5C%22clearStorage%5C%22%3E%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useConversation%2C%20AIClient%2C%20GeneratingStatus%2C%20indexedDBStorageStrategyFactory%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySelect%2C%20TinyButton%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%2C%5Cn%7D)%5Cn%5Cn%2F%2F%20%E4%BD%BF%E7%94%A8%20IndexedDB%20%E7%AD%96%E7%95%A5%5Cnconst%20%7B%5Cn%20%20state%2C%5Cn%20%20messageManager%3A%20%7B%20messages%2C%20inputMessage%2C%20sendMessage%2C%20messageState%2C%20abortRequest%20%7D%2C%5Cn%20%20createConversation%2C%5Cn%20%20switchConversation%2C%5Cn%7D%20%3D%20useConversation(%7B%5Cn%20%20client%2C%5Cn%20%20storage%3A%20indexedDBStorageStrategyFactory(%7B%5Cn%20%20%20%20dbName%3A%20'demo-chat-db'%2C%20%2F%2F%20%E8%87%AA%E5%AE%9A%E4%B9%89%E6%95%B0%E6%8D%AE%E5%BA%93%E5%90%8D%E7%A7%B0%5Cn%20%20%20%20dbVersion%3A%201%2C%20%2F%2F%20%E6%95%B0%E6%8D%AE%E5%BA%93%E7%89%88%E6%9C%AC%5Cn%20%20%7D)%2C%5Cn%20%20events%3A%20%7B%5Cn%20%20%20%20onLoaded(conversations)%20%7B%5Cn%20%20%20%20%20%20if%20(conversations.length%20%3D%3D%3D%200)%20%7B%5Cn%20%20%20%20%20%20%20%20createConversation()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20state.conversations.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%5Cn%2F%2F%20%E6%98%AF%E5%90%A6%E6%AD%A3%E5%9C%A8%E7%94%9F%E6%88%90%5Cnconst%20isGenerating%20%3D%20computed(()%20%3D%3E%20GeneratingStatus.includes(messageState.status))%5Cn%5Cn%2F%2F%20%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%5Cnconst%20clearStorage%20%3D%20async%20()%20%3D%3E%20%7B%5Cn%20%20if%20(confirm('%E7%A1%AE%E5%AE%9A%E8%A6%81%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E4%BC%9A%E8%AF%9D%E6%95%B0%E6%8D%AE%E5%90%97%EF%BC%9F'))%20%7B%5Cn%20%20%20%20try%20%7B%5Cn%20%20%20%20%20%20%2F%2F%20%E5%88%A0%E9%99%A4%20IndexedDB%20%E6%95%B0%E6%8D%AE%E5%BA%93%5Cn%20%20%20%20%20%20indexedDB.deleteDatabase('demo-chat-db')%5Cn%20%20%20%20%20%20location.reload()%5Cn%20%20%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20%20%20console.error('%E6%B8%85%E7%A9%BA%E5%AD%98%E5%82%A8%E5%A4%B1%E8%B4%A5%3A'%2C%20error)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{a.value=!1}),vueCode:n(b)},c({_:2},[p.value?{name:"vue",fn:l(()=>[i(n(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=F("",31))])}}});export{T as __pageData,M as default};
