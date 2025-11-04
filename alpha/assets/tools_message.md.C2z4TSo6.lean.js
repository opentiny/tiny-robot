const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.FiT72pdX.js","assets/chunks/theme.DMmjAWm2.js","assets/chunks/framework.1ofCZuck.js","assets/chunks/index.CNY1juhk.js"])))=>i.map(i=>d[i]);
import{r as p,s as r,A as d,_ as g,H as E,e as y,o as F,a4 as h,ah as o,J as i,ai as C,x as a,i as l,ak as c}from"./chunks/framework.1ofCZuck.js";import{L as A,N as u}from"./chunks/index.DG7r5IE9.js";const D=`<template>
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
  apiUrl: window.parent?.location.origin || location.origin + import.meta.env.BASE_URL,
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
`,S=JSON.parse('{"title":"消息与数据管理 useMessage","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),B={name:"tools/message.md"},f=Object.assign(B,{setup(m){const t=p(!0),n=r();return d(async()=>{n.value=(await g(async()=>{const{default:e}=await import("./chunks/Basic.FiT72pdX.js");return{default:e}},__vite__mapDeps([0,1,2,3]))).default}),(e,s)=>{const k=E("ClientOnly");return F(),y("div",null,[s[1]||(s[1]=h("",3)),o(i(a(A),null,null,512),[[C,t.value]]),i(k,null,{default:l(()=>[i(a(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22messages%5C%22%20%3Aroles%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22messageState.status%20%3D%3D%3D%20STATUS.PROCESSING%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22GeneratingStatus.includes(messageState.status)%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20AIClient%2C%20GeneratingStatus%2C%20STATUS%2C%20useMessage%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20provider%3A%20'openai'%2C%5Cn%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Falpha%2F'%2C%5Cn%7D)%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20%7B%20messages%2C%20messageState%2C%20inputMessage%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessage(%7B%5Cn%20%20client%2C%5Cn%20%20useStreamByDefault%3A%20true%2C%5Cn%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFAI%E5%8A%A9%E6%89%8B%EF%BC%8C%E6%9C%89%E4%BB%80%E4%B9%88%E5%8F%AF%E4%BB%A5%E5%B8%AE%E5%8A%A9%E4%BD%A0%E7%9A%84%E5%90%97%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%20%20maxWidth%3A%20'80%25'%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:a(D)},c({_:2},[n.value?{name:"vue",fn:l(()=>[i(a(n))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=h("",18))])}}});export{S as __pageData,f as default};
