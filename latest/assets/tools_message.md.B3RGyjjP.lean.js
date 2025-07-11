const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.DQJfELnM.js","assets/chunks/index.BF_PQeJ7.js","assets/chunks/framework.kTfunus-.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/index.D6XacYRe.js","assets/chunks/index5.B63c_vYG.js","assets/chunks/index4.UhD4dyzc.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index.DiRjSv6i.js","assets/chunks/tiny-robot-svgs.Ct4S-7ct.js"])))=>i.map(i=>d[i]);
import{p as h,v as d,V as g,C as o,c as E,o as y,j as i,ah as c,G as a,ag as F,a as p,ai as A,k as n,w as k}from"./chunks/framework.kTfunus-.js";import{O as u,E as C}from"./chunks/index.Bs5OpVoR.js";const D=`<template>
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
  apiUrl: location.origin + '/cdocs/tiny-robot/',
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
`,f=JSON.parse('{"title":"消息与数据管理 useMessage","description":"","frontmatter":{},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),m={name:"tools/message.md"},M=Object.assign(m,{setup(b){const t=h(!0),e=h();return d(async()=>{e.value=(await g(async()=>{const{default:l}=await import("./chunks/Basic.DQJfELnM.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]))).default}),(l,s)=>{const r=o("ClientOnly");return y(),E("div",null,[s[1]||(s[1]=i("h1",{id:"消息与数据管理-usemessage",tabindex:"-1"},[p("消息与数据管理 useMessage "),i("a",{class:"header-anchor",href:"#消息与数据管理-usemessage","aria-label":'Permalink to "消息与数据管理 useMessage"'},"​")],-1)),s[2]||(s[2]=i("h2",{id:"示例",tabindex:"-1"},[p("示例 "),i("a",{class:"header-anchor",href:"#示例","aria-label":'Permalink to "示例"'},"​")],-1)),c(a(n(u),null,null,512),[[A,t.value]]),a(r,null,{default:k(()=>[a(n(C),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:n(D)},{vue:k(()=>[a(n(e))]),_:1},8,["vueCode"])]),_:1}),s[3]||(s[3]=F("",10))])}}});export{f as __pageData,M as default};
