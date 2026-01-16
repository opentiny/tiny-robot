const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.DsMMxno1.js","assets/chunks/theme.DoJc4qWh.js","assets/chunks/framework.BOI_CI0O.js","assets/chunks/index.C0arIK_q.js"])))=>i.map(i=>d[i]);
import{r,s as k,A as o,_ as C,H as d,e as E,o as g,a4 as l,ah as c,J as n,ai as A,x as i,i as p,ak as y}from"./chunks/framework.BOI_CI0O.js";import{L as F,N as B}from"./chunks/index.Ch6cWMVy.js";const D=`<template>
  <div>
    <h1>会话</h1>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import {
  ChatMessage,
  ConversationInfo,
  ConversationStorageStrategy,
  sseStreamToGenerator,
  useConversation,
} from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h } from 'vue'

class MockStorageStrategy implements ConversationStorageStrategy {
  private conversations: ConversationInfo[] = [
    {
      id: 'm9zfbomexdm9pza',
      title: '安排日程',
      createdAt: 1745744706662,
      updatedAt: 1745744717297,
      metadata: {},
    },
    {
      id: 'm9zefqta1rihhpj',
      title: '写段文案',
      createdAt: 1745743216510,
      updatedAt: 1745744704671,
      metadata: {},
    },
  ]

  private messagesMap: Map<string, ChatMessage[]> = new Map([
    [
      'm9zfbomexdm9pza',
      [
        {
          role: 'user',
          content: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
        },
        {
          role: 'assistant',
          content: '这是对 "今天需要我帮你安排日程，规划旅行，还是起草一封邮件？" 的模拟回复。',
        },
      ],
    ],
    [
      'm9zefqta1rihhpj',
      [
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
    ],
  ])

  async loadConversations(): Promise<ConversationInfo[]> {
    return this.conversations || []
  }

  async loadMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.messagesMap.get(conversationId) || []
  }

  async saveConversation(conversation: ConversationInfo): Promise<void> {
    const index = this.conversations.findIndex((c) => c.id === conversation.id)
    if (index >= 0) {
      this.conversations[index] = conversation
    } else {
      this.conversations.push(conversation)
    }
  }

  async saveMessages(conversationId: string, messages: ChatMessage[]): Promise<void> {
    this.messagesMap.set(conversationId, messages)
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

// Get BASE_URL from import.meta if available, otherwise use empty string
interface ImportMetaEnv {
  BASE_URL?: string
}
interface ImportMetaWithEnv extends ImportMeta {
  env?: ImportMetaEnv
}
const meta = typeof import.meta !== 'undefined' ? (import.meta as ImportMetaWithEnv) : null
const baseUrl = meta?.env?.BASE_URL || ''
const apiUrl = window.parent?.location.origin || location.origin + baseUrl

const storage = new MockStorageStrategy()
const { activeConversation, activeConversationId, conversations, createConversation, switchConversation } =
  useConversation({
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
    storage,
  })

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)
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
`,f=JSON.parse('{"title":"对话管理 useConversation","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/conversation.md","filePath":"tools/conversation.md"}'),v={name:"tools/conversation.md"},S=Object.assign(v,{setup(m){const t=r(!0),a=k();return o(async()=>{a.value=(await C(async()=>{const{default:e}=await import("./chunks/Basic.DsMMxno1.js");return{default:e}},__vite__mapDeps([0,1,2,3]))).default}),(e,s)=>{const h=d("ClientOnly");return g(),E("div",null,[s[1]||(s[1]=l('<h1 id="对话管理-useconversation" tabindex="-1">对话管理 useConversation <a class="header-anchor" href="#对话管理-useconversation" aria-label="Permalink to &quot;对话管理 useConversation&quot;">​</a></h1><p><code>useConversation</code> 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。</p><p>默认情况下，<code>useConversation</code> 会使用 LocalStorage 策略来持久化会话和消息数据。如果你需要更大的存储容量或更好的性能，可以切换到 IndexedDB 策略。关于存储策略的详细说明，请参考 <a href="./storage.html">存储策略文档</a>。</p><h2 id="示例" tabindex="-1">示例 <a class="header-anchor" href="#示例" aria-label="Permalink to &quot;示例&quot;">​</a></h2><h3 id="基础示例" tabindex="-1">基础示例 <a class="header-anchor" href="#基础示例" aria-label="Permalink to &quot;基础示例&quot;">​</a></h3>',5)),c(n(i(F),null,null,512),[[A,t.value]]),n(h,null,{default:p(()=>[n(i(B),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fconversation%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ch1%3E%E4%BC%9A%E8%AF%9D%3C%2Fh1%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22actions%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%3Cb%3E%E5%88%87%E6%8D%A2%E4%BC%9A%E8%AF%9D%3C%2Fb%3E%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Ctiny-select%5Cn%20%20%20%20%20%20%20%20%3AmodelValue%3D%5C%22activeConversationId%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aoptions%3D%5C%22options%5C%22%5Cn%20%20%20%20%20%20%20%20%40change%3D%5C%22switchConversation(%24event)%5C%22%5Cn%20%20%20%20%20%20%3E%3C%2Ftiny-select%3E%5Cn%20%20%20%20%20%20%3Ctiny-button%20type%3D%5C%22info%5C%22%20%40click%3D%5C%22createConversation()%5C%22%3E%E5%88%9B%E5%BB%BA%E6%96%B0%E5%AF%B9%E8%AF%9D%3C%2Ftiny-button%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRoleConfig%2C%20TrBubbleList%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%5Cn%20%20ChatMessage%2C%5Cn%20%20ConversationInfo%2C%5Cn%20%20ConversationStorageStrategy%2C%5Cn%20%20sseStreamToGenerator%2C%5Cn%20%20useConversation%2C%5Cn%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinyButton%2C%20TinySelect%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20computed%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnclass%20MockStorageStrategy%20implements%20ConversationStorageStrategy%20%7B%5Cn%20%20private%20conversations%3A%20ConversationInfo%5B%5D%20%3D%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745744706662%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744717297%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20id%3A%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20title%3A%20'%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88'%2C%5Cn%20%20%20%20%20%20createdAt%3A%201745743216510%2C%5Cn%20%20%20%20%20%20updatedAt%3A%201745744704671%2C%5Cn%20%20%20%20%20%20metadata%3A%20%7B%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%5Cn%5Cn%20%20private%20messagesMap%3A%20Map%3Cstring%2C%20ChatMessage%5B%5D%3E%20%3D%20new%20Map(%5B%5Cn%20%20%20%20%5B%5Cn%20%20%20%20%20%20'm9zfbomexdm9pza'%2C%5Cn%20%20%20%20%20%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E4%BB%8A%E5%A4%A9%E9%9C%80%E8%A6%81%E6%88%91%E5%B8%AE%E4%BD%A0%E5%AE%89%E6%8E%92%E6%97%A5%E7%A8%8B%EF%BC%8C%E8%A7%84%E5%88%92%E6%97%85%E8%A1%8C%EF%BC%8C%E8%BF%98%E6%98%AF%E8%B5%B7%E8%8D%89%E4%B8%80%E5%B0%81%E9%82%AE%E4%BB%B6%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%20%20%5B%5Cn%20%20%20%20%20%20'm9zefqta1rihhpj'%2C%5Cn%20%20%20%20%20%20%5B%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E8%BF%99%E6%98%AF%E5%AF%B9%20%5C%22%E6%83%B3%E5%86%99%E6%AE%B5%E6%96%87%E6%A1%88%E3%80%81%E8%B5%B7%E4%B8%AA%E5%90%8D%E5%AD%97%EF%BC%8C%E8%BF%98%E6%98%AF%E6%9D%A5%E7%82%B9%E7%81%B5%E6%84%9F%EF%BC%9F%5C%22%20%E7%9A%84%E6%A8%A1%E6%8B%9F%E5%9B%9E%E5%A4%8D%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'hello'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFTinyRobot%E6%90%AD%E5%BB%BA%E7%9A%84AI%E5%8A%A9%E6%89%8B%E3%80%82%E4%BD%A0%E5%8F%AF%E4%BB%A5%E9%97%AE%E6%88%91%E4%BB%BB%E4%BD%95%E9%97%AE%E9%A2%98%EF%BC%8C%E6%88%91%E4%BC%9A%E5%B0%BD%E5%8A%9B%E5%9B%9E%E7%AD%94%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%5D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%5D)%5Cn%5Cn%20%20async%20loadConversations()%3A%20Promise%3CConversationInfo%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.conversations%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20loadMessages(conversationId%3A%20string)%3A%20Promise%3CChatMessage%5B%5D%3E%20%7B%5Cn%20%20%20%20return%20this.messagesMap.get(conversationId)%20%7C%7C%20%5B%5D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20saveConversation(conversation%3A%20ConversationInfo)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20const%20index%20%3D%20this.conversations.findIndex((c)%20%3D%3E%20c.id%20%3D%3D%3D%20conversation.id)%5Cn%20%20%20%20if%20(index%20%3E%3D%200)%20%7B%5Cn%20%20%20%20%20%20this.conversations%5Bindex%5D%20%3D%20conversation%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20this.conversations.push(conversation)%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20async%20saveMessages(conversationId%3A%20string%2C%20messages%3A%20ChatMessage%5B%5D)%3A%20Promise%3Cvoid%3E%20%7B%5Cn%20%20%20%20this.messagesMap.set(conversationId%2C%20messages)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cn%2F%2F%20Get%20BASE_URL%20from%20import.meta%20if%20available%2C%20otherwise%20use%20empty%20string%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cnconst%20storage%20%3D%20new%20MockStorageStrategy()%5Cnconst%20%7B%20activeConversation%2C%20activeConversationId%2C%20conversations%2C%20createConversation%2C%20switchConversation%20%7D%20%3D%5Cn%20%20useConversation(%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%5Cn%20%20%20%20%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20storage%2C%5Cn%20%20%7D)%5Cn%5Cnconst%20messages%20%3D%20computed(()%20%3D%3E%20activeConversation.value%3F.engine%3F.messages.value%20%7C%7C%20%5B%5D)%5Cn%5Cnconst%20options%20%3D%20computed(()%20%3D%3E%5Cn%20%20conversations.value.map((conversation)%20%3D%3E%20(%7B%5Cn%20%20%20%20label%3A%20conversation.title%2C%5Cn%20%20%20%20value%3A%20conversation.id%2C%5Cn%20%20%7D))%2C%5Cn)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.tiny-select%20%7B%5Cn%20%20width%3A%20280px%3B%5Cn%20%20margin-left%3A%204px%3B%5Cn%7D%5Cn%5Cn.tiny-button%20%7B%5Cn%20%20margin-left%3A%2010px%3B%5Cn%7D%5Cn%5Cn.actions%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20margin-top%3A%2010px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:i(D)},y({_:2},[a.value?{name:"vue",fn:p(()=>[n(i(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=l(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="选项" tabindex="-1">选项 <a class="header-anchor" href="#选项" aria-label="Permalink to &quot;选项&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 所有会话的基础 useMessage 选项。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 传递给 createConversation 的每个会话选项会在此基础上合并。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  useMessageOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseMessageOptions</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 是否在消息变更时自动保存。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> false</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoSaveMessages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> boolean</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 自动保存操作的节流时间（毫秒）。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 确保在流式更新期间，每个时间间隔内最多保存一次消息。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 仅在 autoSaveMessages 为 true 时生效。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 1000</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  autoSaveThrottle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 可选的存储策略，用于会话和消息的持久化。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 如果不提供，默认使用 LocalStorage 策略。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 当提供时，会话列表和消息可以被加载和持久化。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  storage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationStorageStrategy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="返回值" tabindex="-1">返回值 <a class="header-anchor" href="#返回值" aria-label="Permalink to &quot;返回值&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseConversationReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话列表 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  conversations</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ConversationInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 当前会话ID */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  activeConversationId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 当前活跃会话 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  activeConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ComputedRef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 创建新会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  createConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">params</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /** 会话ID，不提供则自动生成 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /** 会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /** 自定义元数据 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /** 覆盖默认的消息选项 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    useMessageOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Partial</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">UseMessageOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 切换会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  switchConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 删除会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  deleteConversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 清空所有会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  clear</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  updateConversationTitle</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 保存指定会话的消息 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  saveMessages</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 发送消息到当前活跃会话 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  sendMessage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">content</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 中止当前活跃会话的请求 */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  abortActiveRequest</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="会话接口" tabindex="-1">会话接口 <a class="header-anchor" href="#会话接口" aria-label="Permalink to &quot;会话接口&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话ID */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 会话标题 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 创建时间 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  createdAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 更新时间 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  updatedAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 自定义元数据 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  metadata</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Conversation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   * 由 useMessage 创建的消息引擎实例。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  engine</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UseMessageReturn</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,7))])}}});export{f as __pageData,S as default};
