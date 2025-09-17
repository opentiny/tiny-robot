const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic._1mSV1sp.js","assets/chunks/theme._H8bWvfQ.js","assets/chunks/framework.BUZiD9tj.js","assets/chunks/index.BDSou5L4.js"])))=>i.map(i=>d[i]);
import{p,D as r,v as d,V as g,C as E,c as y,o as F,a2 as e,af as o,G as i,ag as c,k as a,w as l,ai as C}from"./chunks/framework.BUZiD9tj.js";import{R as A,k as u}from"./chunks/index.Cg2BcbKQ.js";const D=`<template>
  <tr-bubble-list :items="messages" :roles="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="messageState.status === STATUS.PROCESSING ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="GeneratingStatus.includes(messageState.status)"
    @submit="sendMessage"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { AIClient, GeneratingStatus, STATUS, useMessage } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: location.origin + import.meta.env.BASE_URL,
})

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, messageState, inputMessage, sendMessage, abortRequest } = useMessage({
  client,
  useStreamByDefault: true,
  initialMessages: [
    {
      content: '你好！我是AI助手，有什么可以帮助你的吗？',
      role: 'assistant',
    },
  ],
})

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
<\/script>
`,S=JSON.parse('{"title":"消息与数据管理 useMessage","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),B={name:"tools/message.md"},f=Object.assign(B,{setup(m){const t=p(!0),n=r();return d(async()=>{n.value=(await g(async()=>{const{default:h}=await import("./chunks/Basic._1mSV1sp.js");return{default:h}},__vite__mapDeps([0,1,2,3]))).default}),(h,s)=>{const k=E("ClientOnly");return F(),y("div",null,[s[1]||(s[1]=e("",3)),o(i(a(A),null,null,512),[[c,t.value]]),i(k,null,{default:l(()=>[i(a(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:a(D)},C({_:2},[n.value?{name:"vue",fn:l(()=>[i(a(n))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=e("",18))])}}});export{S as __pageData,f as default};
