const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.Q_ohlUtY.js","assets/chunks/theme.CasEpupN.js","assets/chunks/framework.CANJ19-G.js","assets/chunks/index.Ca6bO3dH.js"])))=>i.map(i=>d[i]);
import{aD as k,bQ as r,aZ as d,aL as g,v as o,H as l,bL as E,bB as y,J as i,bk as a,bJ as h,G as F,b7 as c,aU as C}from"./chunks/framework.CANJ19-G.js";import{L as A,N as D}from"./chunks/index.B4BgU4UV.js";const B=`<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="isProcessing"
    @submit="sendMessage"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

const { messages, isProcessing, sendMessage, abortRequest } = useMessage({
  responseProvider: async (requestBody, abortSignal) => {
    const response = await fetch(\`\${apiUrl}/api/chat/completions\`, {
      method: 'POST',
      body: JSON.stringify({ ...requestBody, stream: true }),
      signal: abortSignal,
    })
    return sseStreamToGenerator(response, { signal: abortSignal })
  },
  initialMessages: [
    {
      content: '你好！我是AI助手，有什么可以帮助你的吗？',
      role: 'assistant',
    },
  ],
})

const inputMessage = ref('')

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
`,f=JSON.parse('{"title":"消息与数据管理 useMessage","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),u={name:"tools/message.md"},M=Object.assign(u,{setup(m){const t=C(!0),n=c();return k(async()=>{n.value=(await r(async()=>{const{default:e}=await import("./chunks/Basic.Q_ohlUtY.js");return{default:e}},__vite__mapDeps([0,1,2,3]))).default}),(e,s)=>{const p=d("ClientOnly");return g(),o("div",null,[s[1]||(s[1]=l("",4)),E(i(a(A),null,null,512),[[y,t.value]]),i(p,null,{default:h(()=>[i(a(D),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fmessage%2FBasic.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Ctr-sender%5Cn%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E6%80%9D%E8%80%83%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%82%A8%E7%9A%84%E9%97%AE%E9%A2%98'%5C%22%5Cn%20%20%20%20%3Aclearable%3D%5C%22true%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cn%2F%2F%20Get%20BASE_URL%20from%20import.meta%20if%20available%2C%20otherwise%20use%20empty%20string%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cnconst%20%7B%20messages%2C%20isProcessing%2C%20sendMessage%2C%20abortRequest%20%7D%20%3D%20useMessage(%7B%5Cn%20%20responseProvider%3A%20async%20(requestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%7D%2C%5Cn%20%20initialMessages%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E6%98%AFAI%E5%8A%A9%E6%89%8B%EF%BC%8C%E6%9C%89%E4%BB%80%E4%B9%88%E5%8F%AF%E4%BB%A5%E5%B8%AE%E5%8A%A9%E4%BD%A0%E7%9A%84%E5%90%97%EF%BC%9F'%2C%5Cn%20%20%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:a(B)},F({_:2},[n.value?{name:"vue",fn:h(()=>[i(a(n))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=l("",14))])}}});export{f as __pageData,M as default};
