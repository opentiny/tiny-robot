const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.DqbAwnRz.js","assets/chunks/theme.CZz-Z-qX.js","assets/chunks/framework.DeWfoKqf.js","assets/chunks/index.HJcx0HA8.js"])))=>i.map(i=>d[i]);
import{p as r,D as d,v as g,V as o,C as y,c as E,o as F,j as i,af as c,G as a,a2 as A,a as l,ag as C,k as n,w as k,ai as D}from"./chunks/framework.DeWfoKqf.js";import{R as u,k as v}from"./chunks/index.DAHaZP3X.js";const B=`<template>
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
  apiUrl: location.origin + import.meta.env.BASE_URL,
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

<style lang="less" scoped>
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
`,S=JSON.parse('{"title":"对话管理 useConversation","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/conversation.md","filePath":"tools/conversation.md"}'),m={name:"tools/conversation.md"},x=Object.assign(m,{setup(b){const h=r(!0),t=d();return g(async()=>{t.value=(await o(async()=>{const{default:e}=await import("./chunks/Basic.DqbAwnRz.js");return{default:e}},__vite__mapDeps([0,1,2,3]))).default}),(e,s)=>{const p=y("ClientOnly");return F(),E("div",null,[s[1]||(s[1]=i("h1",{id:"对话管理-useconversation",tabindex:"-1"},[l("对话管理 useConversation "),i("a",{class:"header-anchor",href:"#对话管理-useconversation","aria-label":'Permalink to "对话管理 useConversation"'},"​")],-1)),s[2]||(s[2]=i("p",null,[i("code",null,"useConversation"),l(" 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。")],-1)),s[3]||(s[3]=i("h2",{id:"示例",tabindex:"-1"},[l("示例 "),i("a",{class:"header-anchor",href:"#示例","aria-label":'Permalink to "示例"'},"​")],-1)),c(a(n(u),null,null,512),[[C,h.value]]),a(p,null,{default:k(()=>[a(n(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:s[0]||(s[0]=()=>{h.value=!1}),vueCode:n(B)},D({_:2},[t.value?{name:"vue",fn:k(()=>[a(n(t))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=A("",12))])}}});export{S as __pageData,x as default};
