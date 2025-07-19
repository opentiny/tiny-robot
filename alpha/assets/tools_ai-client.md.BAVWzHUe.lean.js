const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Stream.C4uZHbQK.js","assets/chunks/index.DrOP9VmC.js","assets/chunks/framework.Dsng2_7o.js","assets/chunks/loading.CaA-rOal.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/tiny-robot-svgs.wPOeRNoc.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index3.BDwkJsQh.js","assets/chunks/index.Usu0lL2P.js","assets/chunks/index6.BeXFBk5S.js","assets/chunks/index2.BME1Z_Z8.js","assets/chunks/index5.CmFqHahF.js","assets/chunks/index.6eCcQI53.js","assets/chunks/Basic.DLDWzxZO.js"])))=>i.map(i=>d[i]);
import{D as r,v as o,V as d,p as F,C as D,c as m,o as C,ah as y,ag as g,G as i,j as n,ai as c,k as a,w as e,aj as A,a as b}from"./chunks/framework.Dsng2_7o.js";import{O as E,E as u}from"./chunks/index.BxQo2396.js";const f=`<script setup lang="ts">
import { TrBubble, TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import { AIClient } from '@opentiny/tiny-robot-kit'

const message = ref('')
const content = ref('hello')

let controller: AbortController | null

// 发送消息并获取响应
async function chat(content) {
  // 创建客户端
  const client = new AIClient({
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    apiUrl: location.origin + import.meta.env.BASE_URL,
    // apiKey: 'your-api-key',
  })
  try {
    controller = new AbortController()
    await client.chatStream(
      {
        messages: [{ role: 'user', content }],
        options: {
          signal: controller.signal, // 传递 AbortController 的 signal用于中断请求
          temperature: 0.7,
        },
      },
      {
        onData: (data) => {
          // 处理流式数据
          const content = data.choices[0]?.delta?.content || ''
          message.value += content
        },
        onError: (error) => {
          console.error('流式响应错误:', error)
          controller = null
        },
        onDone: () => {
          console.log('\\n流式响应完成')
          controller = null
        },
      },
    )
  } catch (error) {
    console.error('聊天出错:', error)
  }
}

function abortRequest() {
  if (controller) {
    controller.abort()
    controller = null
  }
}
<\/script>

<template>
  <tr-bubble v-if="message" :content="message"></tr-bubble>
  <tr-sender v-model="content" @submit="chat(content)" @cancel="abortRequest"></tr-sender>
</template>
`,v=`<script setup lang="ts">
import { TrBubble, TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import { AIClient } from '@opentiny/tiny-robot-kit'

const message = ref('')
const content = ref('hello')

// 发送消息并获取响应
async function chat(content) {
  // 创建客户端
  const client = new AIClient({
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    apiUrl: location.origin + import.meta.env.BASE_URL,
    // apiKey: 'your-api-key',
  })
  try {
    const response = await client.chat({
      messages: [{ role: 'user', content }],
      options: {
        temperature: 0.7,
      },
    })

    message.value = response.choices[0].message.content
  } catch (error) {
    console.error('聊天出错:', error)
  }
}
<\/script>

<template>
  <tr-bubble v-if="message" :content="message"></tr-bubble>
  <tr-sender v-model="content" @submit="chat(content)"></tr-sender>
</template>
`,S=JSON.parse('{"title":"AI模型交互工具类 AIClient","description":"","frontmatter":{},"headers":[],"relativePath":"tools/ai-client.md","filePath":"tools/ai-client.md"}'),B={name:"tools/ai-client.md"},q=Object.assign(B,{setup(_){const h=r();o(async()=>{h.value=(await d(async()=>{const{default:l}=await import("./chunks/Stream.C4uZHbQK.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12]))).default});const t=F(!0),p=r();return o(async()=>{p.value=(await d(async()=>{const{default:l}=await import("./chunks/Basic.DLDWzxZO.js");return{default:l}},__vite__mapDeps([13,1,2,3,4,5,6,7,8,9,10,11,12]))).default}),(l,s)=>{const k=D("ClientOnly");return C(),m("div",null,[s[2]||(s[2]=y("",4)),g(i(a(E),null,null,512),[[c,t.value]]),i(k,null,{default:e(()=>[i(a(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:a(v)},A({_:2},[p.value?{name:"vue",fn:e(()=>[i(a(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=n("h3",{id:"使用流式响应",tabindex:"-1"},[b("使用流式响应 "),n("a",{class:"header-anchor",href:"#使用流式响应","aria-label":'Permalink to "使用流式响应"'},"​")],-1)),s[4]||(s[4]=n("ul",null,[n("li",null,"使用chatStream方法实现流式响应"),n("li",null,"signal参数传递 AbortController用于中断请求")],-1)),g(i(a(E),null,null,512),[[c,t.value]]),i(k,null,{default:e(()=>[i(a(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:a(f)},A({_:2},[h.value?{name:"vue",fn:e(()=>[i(a(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[5]||(s[5]=y("",5))])}}});export{S as __pageData,q as default};
