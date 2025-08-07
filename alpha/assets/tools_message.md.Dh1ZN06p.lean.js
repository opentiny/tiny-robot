const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.c3Al7i_E.js","assets/chunks/index.DECttPsh.js","assets/chunks/framework.WjEkGhiu.js","assets/chunks/loading.CaA-rOal.js","assets/chunks/utils.ayD70Qgn.js","assets/chunks/index3.BnOquABP.js","assets/chunks/tiny-robot-svgs.Dnkbi6us.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.YzMcp4sl.js","assets/chunks/index6.BlLyDml4.js","assets/chunks/index2.DE8fSCLV.js","assets/chunks/index5.BgPA3y6E.js","assets/chunks/index.gWkj5hhe.js","assets/chunks/tiny-robot-svgs.B2XD9sQ_.js"])))=>i.map(i=>d[i]);
import{p as r,D as d,v as g,V as y,C as o,c as E,o as c,j as i,ag as F,G as a,ah as A,a as h,ai as u,k as n,w as p,aj as C}from"./chunks/framework.WjEkGhiu.js";import{R as m,k as D}from"./chunks/index.C4nH5rc5.js";const B=`<template>
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
`,_=JSON.parse('{"title":"消息与数据管理 useMessage","description":"","frontmatter":{},"headers":[],"relativePath":"tools/message.md","filePath":"tools/message.md"}'),b={name:"tools/message.md"},M=Object.assign(b,{setup(v){const t=r(!0),e=d();return g(async()=>{e.value=(await y(async()=>{const{default:l}=await import("./chunks/Basic.c3Al7i_E.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13]))).default}),(l,s)=>{const k=o("ClientOnly");return c(),E("div",null,[s[1]||(s[1]=i("h1",{id:"消息与数据管理-usemessage",tabindex:"-1"},[h("消息与数据管理 useMessage "),i("a",{class:"header-anchor",href:"#消息与数据管理-usemessage","aria-label":'Permalink to "消息与数据管理 useMessage"'},"​")],-1)),s[2]||(s[2]=i("h2",{id:"示例",tabindex:"-1"},[h("示例 "),i("a",{class:"header-anchor",href:"#示例","aria-label":'Permalink to "示例"'},"​")],-1)),F(a(n(m),null,null,512),[[u,t.value]]),a(k,null,{default:p(()=>[a(n(D),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:n(B)},C({_:2},[e.value?{name:"vue",fn:p(()=>[a(n(e))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=A("",10))])}}});export{_ as __pageData,M as default};
