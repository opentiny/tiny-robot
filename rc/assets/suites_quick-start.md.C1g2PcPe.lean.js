const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.w52Oq8Mt.js","assets/chunks/index.B76-WB34.js","assets/chunks/framework.BHsLpWB3.js","assets/chunks/theme.CMKvQdvk.js","assets/chunks/index.DIbYKDkv.js"])))=>i.map(i=>d[i]);
import{aD as o,bQ as r,aZ as d,aL as k,v as c,H as l,bL as E,bB as y,J as i,bk as a,bJ as h,G as C,b7 as g,aU as m}from"./chunks/framework.BHsLpWB3.js";import{L as u,N as F}from"./chunks/index.-rWMcHyn.js";const b=`<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'

const runtimeOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    // 文档通过模拟服务返回回答；接入项目时替换为实际服务地址
    apiUrl: new URL(\`\${import.meta.env.BASE_URL}api\`, runtimeOrigin).toString(),
    models: [
      {
        id: 'your-model-id',
        label: '应用助手',
      },
    ],
  },
]

const runtime = useChatRuntime({ modelProviders })
<\/script>

<template>
  <div class="chat-basic-demo">
    <TrChat :runtime="runtime" />
  </div>
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
`,_=JSON.parse('{"title":"快速上手","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/quick-start.md","filePath":"suites/quick-start.md"}'),A={name:"suites/quick-start.md"},f=Object.assign(A,{setup(v){const n=m(!0),t=g();return o(async()=>{t.value=(await r(async()=>{const{default:e}=await import("./chunks/basic.w52Oq8Mt.js");return{default:e}},__vite__mapDeps([0,1,2,3,4]))).default}),(e,s)=>{const p=d("ClientOnly");return k(),c("div",null,[s[1]||(s[1]=l("",15)),E(i(a(u),null,null,512),[[y,n.value]]),i(p,null,{default:h(()=>[i(a(F),{title:"完整聊天页面",description:"输入消息并发送，查看模拟服务返回的回答。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot%2Fdist%2Fstyle.css'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'openai'%2C%5Cn%20%20%20%20%2F%2F%20%E6%96%87%E6%A1%A3%E9%80%9A%E8%BF%87%E6%A8%A1%E6%8B%9F%E6%9C%8D%E5%8A%A1%E8%BF%94%E5%9B%9E%E5%9B%9E%E7%AD%94%EF%BC%9B%E6%8E%A5%E5%85%A5%E9%A1%B9%E7%9B%AE%E6%97%B6%E6%9B%BF%E6%8D%A2%E4%B8%BA%E5%AE%9E%E9%99%85%E6%9C%8D%E5%8A%A1%E5%9C%B0%E5%9D%80%5Cn%20%20%20%20apiUrl%3A%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'your-model-id'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'%E5%BA%94%E7%94%A8%E5%8A%A9%E6%89%8B'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%20modelProviders%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-basic-demo%5C%22%3E%5Cn%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-basic-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-basic-demo%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:a(b)},C({_:2},[t.value?{name:"vue",fn:h(()=>[i(a(t))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=l("",3))])}}});export{_ as __pageData,f as default};
