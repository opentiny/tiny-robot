const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Basic.DgpTCQTZ.js","assets/chunks/theme.C60ze_6n.js","assets/chunks/framework.B9XM8ZV2.js","assets/chunks/index.D1EM65BN.js","assets/chunks/index.BFHowHkJ.js"])))=>i.map(i=>d[i]);
import{aD as o,bQ as p,aZ as r,aL as c,v as k,H as n,bL as E,bB as g,J as t,bk as i,bJ as h,G as y,b7 as u,aU as C}from"./chunks/framework.B9XM8ZV2.js";import{L as F,N as m}from"./chunks/index.E_LeY779.js";const b=`<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { TrChat, useLocalChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const apiUrl = \`\${import.meta.env.BASE_URL}api\`

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl,
    models: [
      { id: 'qwen3.7-flash', label: 'Qwen3.7 Flash', capabilities: { thinking: true, search: true } },
      { id: 'qwen3.7-plus', label: 'Qwen3.7 Plus', capabilities: { thinking: true, search: true } },
      { id: 'qwen3.7-max', label: 'Qwen3.7 Max', capabilities: { thinking: true, search: true } },
    ],
  },
  {
    type: 'deepseek',
    apiUrl,
    models: [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', capabilities: { thinking: true } },
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', capabilities: { thinking: true } },
    ],
  },
]

const runtime = useLocalChatRuntime({ modelProviders })
<\/script>

<template>
  <TrTheme>
    <div class="chat-basic-demo">
      <TrChat :runtime="runtime" />
    </div>
  </TrTheme>
</template>

<style scoped>
.chat-basic-demo {
  --tr-layout-height: 100%;
  box-sizing: border-box;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.chat-basic-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.chat-basic-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .chat-basic-demo {
    height: 560px;
  }
}
</style>
`,P=JSON.parse('{"title":"Chat 聊天套件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat.md","filePath":"suites/chat.md"}'),v={name:"suites/chat.md"},D=Object.assign(v,{setup(B){const e=C(!0),a=u();return o(async()=>{a.value=(await p(async()=>{const{default:d}=await import("./chunks/Basic.DgpTCQTZ.js");return{default:d}},__vite__mapDeps([0,1,2,3,4]))).default}),(d,s)=>{const l=r("ClientOnly");return c(),k("div",null,[s[1]||(s[1]=n("",20)),E(t(i(F),null,null,512),[[g,e.value]]),t(l,null,{default:h(()=>[t(i(m),{title:"完整聊天页面",description:"使用 Runtime 和模型服务配置完成一次可运行的聊天接入。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2FBasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrThemeProvider%20as%20TrTheme%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20useLocalChatRuntime%2C%20type%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20apiUrl%20%3D%20%60%24%7B'%2Ftiny-robot%2Fbeta%2F'%7Dapi%60%5Cn%5Cnconst%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'qwen3.7-flash'%2C%20label%3A%20'Qwen3.7%20Flash'%2C%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'qwen3.7-plus'%2C%20label%3A%20'Qwen3.7%20Plus'%2C%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'qwen3.7-max'%2C%20label%3A%20'Qwen3.7%20Max'%2C%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20id%3A%20'deepseek-v4-flash'%2C%20label%3A%20'DeepSeek%20V4%20Flash'%2C%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20id%3A%20'deepseek-v4-pro'%2C%20label%3A%20'DeepSeek%20V4%20Pro'%2C%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20runtime%20%3D%20useLocalChatRuntime(%7B%20modelProviders%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrTheme%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22chat-basic-demo%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2FTrTheme%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-basic-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-basic-demo%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{e.value=!1}),vueCode:i(b)},y({_:2},[a.value?{name:"vue",fn:h(()=>[t(i(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=n("",98))])}}});export{P as __pageData,D as default};
