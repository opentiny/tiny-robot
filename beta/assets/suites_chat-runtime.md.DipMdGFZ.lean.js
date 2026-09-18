const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/runtime-send.BpUZtq14.js","assets/chunks/index.DnDfvJyJ.js","assets/chunks/framework.U4597d8b.js","assets/chunks/index.CsNWoLl9.js","assets/chunks/theme.FnYQa60I.js","assets/chunks/Basic.CQ-CQ9Lx.js","assets/chunks/modelProviders.CQEIWUPr.js"])))=>i.map(i=>d[i]);
import{aD as l,bQ as h,aZ as E,aL as b,v as y,H as r,bL as p,bB as C,J as t,bk as n,bJ as s,G as u,b7 as m,aU as f}from"./chunks/framework.U4597d8b.js";import{T as v}from"./chunks/Basic.DwDGQmZQ.js";import{L as k,N as g}from"./chunks/index.iUw3Fsxy.js";const A=`<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime } from '@opentiny/tiny-robot-chat'

const defaultResult = shallowRef('尚未发送')
const customResult = shallowRef('尚未发送')
const responseProvider: ResponseProvider = async () => ({
  id: 'runtime-send-demo',
  object: 'chat.completion',
  created: 0,
  model: 'runtime-send-demo',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: '' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

function createDemoConversation() {
  return useConversation({
    useMessageOptions: { responseProvider },
  })
}

const defaultRuntime = useKitChatRuntime({ conversation: createDemoConversation() })
const customRuntime = useKitChatRuntime({
  conversation: createDemoConversation(),
  send: ({ text }) => {
    customResult.value = \`自定义 send 收到 text: \${JSON.stringify(text)}\`
  },
})

async function sendDefaultEmptyText() {
  defaultResult.value = String(await defaultRuntime.actions.send({ text: '' }))
}

async function sendCustomEmptyText() {
  const sent = await customRuntime.actions.send({ text: '' })
  customResult.value = \`\${customResult.value}，结果: \${sent}\`
}
<\/script>

<template>
  <section class="runtime-send-demo">
    <div class="runtime-send-demo__item">
      <h3>默认发送</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendDefaultEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ defaultResult }}</p>
    </div>
    <div class="runtime-send-demo__item">
      <h3>自定义 send</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendCustomEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ customResult }}</p>
    </div>
  </section>
</template>

<style scoped>
.runtime-send-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.runtime-send-demo__item {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--tr-common-border-color);
}

.runtime-send-demo__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 1px solid #2f6fad;
  border-radius: 6px;
  padding: 6px 12px;
  color: #fff;
  background: #2f6fad;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}

.runtime-send-demo__button:hover {
  border-color: #24598d;
  background: #24598d;
}

.runtime-send-demo__button:focus-visible {
  outline: 2px solid #8ab8df;
  outline-offset: 2px;
}

.runtime-send-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.runtime-send-demo__item h3,
.runtime-send-demo__item p {
  margin: 0 0 12px;
}

@media (max-width: 640px) {
  .runtime-send-demo {
    grid-template-columns: 1fr;
  }
}
</style>
`,x=JSON.parse('{"title":"Chat 运行时","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/chat-runtime.md","filePath":"suites/chat-runtime.md"}'),B={name:"suites/chat-runtime.md"},P=Object.assign(B,{setup(D){const i=m();l(async()=>{i.value=(await h(async()=>{const{default:a}=await import("./chunks/runtime-send.BpUZtq14.js");return{default:a}},__vite__mapDeps([0,1,2,3,4]))).default});const o=f(!0),d=m();return l(async()=>{d.value=(await h(async()=>{const{default:a}=await import("./chunks/Basic.CQ-CQ9Lx.js");return{default:a}},__vite__mapDeps([5,3,2,4,1,6]))).default}),(a,e)=>{const c=E("ClientOnly");return b(),y("div",null,[e[2]||(e[2]=r("",6)),p(t(n(k),null,null,512),[[C,o.value]]),t(c,null,{default:s(()=>[t(n(g),{title:"创建运行时",description:"配置模型服务后创建 Runtime，发送消息并获得回答。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2FBasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%2C%20useLocalChatRuntime%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'.%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20runtime%20%3D%20useLocalChatRuntime(%7B%20modelProviders%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-basic-demo%5C%22%3E%5Cn%20%20%20%20%3Ctr-chat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-basic-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-basic-demo%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22modelProviders.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fshared%2FmodelProviders.ts%22%2C%22code%22%3A%22import%20type%20%7B%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20%7B%20IconBailian%2C%20IconDeepseek%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cn%5Cnconst%20defaultApiUrl%20%3D%20%60%24%7B'%2Ftiny-robot%2Fbeta%2F'%7Dapi%60%5Cn%5Cnexport%20const%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'qwen'%2C%5Cn%20%20%20%20label%3A%20'DashScope'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-plus'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Plus'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'qwen3.7-max'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'Qwen3.7%20Max'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconBailian%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%2C%20search%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'deepseek'%2C%5Cn%20%20%20%20apiUrl%3A%20defaultApiUrl%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-flash'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Flash'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'deepseek-v4-pro'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'DeepSeek%20V4%20Pro'%2C%5Cn%20%20%20%20%20%20%20%20icon%3A%20IconDeepseek%2C%5Cn%20%20%20%20%20%20%20%20capabilities%3A%20%7B%20thinking%3A%20true%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:n(v)},u({_:2},[d.value?{name:"vue",fn:s(()=>[t(n(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[3]||(e[3]=r("",13)),p(t(n(k),null,null,512),[[C,o.value]]),t(c,null,{default:s(()=>[t(n(g),{title:"自定义发送",description:"比较默认发送与自定义 send 对空文本的处理结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22runtime-send.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fruntime-send.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20shallowRef%20%7D%20from%20'vue'%5Cnimport%20%7B%20useConversation%2C%20type%20ResponseProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20useKitChatRuntime%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cn%5Cnconst%20defaultResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20customResult%20%3D%20shallowRef('%E5%B0%9A%E6%9C%AA%E5%8F%91%E9%80%81')%5Cnconst%20responseProvider%3A%20ResponseProvider%20%3D%20async%20()%20%3D%3E%20(%7B%5Cn%20%20id%3A%20'runtime-send-demo'%2C%5Cn%20%20object%3A%20'chat.completion'%2C%5Cn%20%20created%3A%200%2C%5Cn%20%20model%3A%20'runtime-send-demo'%2C%5Cn%20%20system_fingerprint%3A%20null%2C%5Cn%20%20choices%3A%20%5B%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20index%3A%200%2C%5Cn%20%20%20%20%20%20message%3A%20%7B%20role%3A%20'assistant'%2C%20content%3A%20''%20%7D%2C%5Cn%20%20%20%20%20%20delta%3A%20undefined%2C%5Cn%20%20%20%20%20%20logprobs%3A%20null%2C%5Cn%20%20%20%20%20%20finish_reason%3A%20'stop'%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnfunction%20createDemoConversation()%20%7B%5Cn%20%20return%20useConversation(%7B%5Cn%20%20%20%20useMessageOptions%3A%20%7B%20responseProvider%20%7D%2C%5Cn%20%20%7D)%5Cn%7D%5Cn%5Cnconst%20defaultRuntime%20%3D%20useKitChatRuntime(%7B%20conversation%3A%20createDemoConversation()%20%7D)%5Cnconst%20customRuntime%20%3D%20useKitChatRuntime(%7B%5Cn%20%20conversation%3A%20createDemoConversation()%2C%5Cn%20%20send%3A%20(%7B%20text%20%7D)%20%3D%3E%20%7B%5Cn%20%20%20%20customResult.value%20%3D%20%60%E8%87%AA%E5%AE%9A%E4%B9%89%20send%20%E6%94%B6%E5%88%B0%20text%3A%20%24%7BJSON.stringify(text)%7D%60%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnasync%20function%20sendDefaultEmptyText()%20%7B%5Cn%20%20defaultResult.value%20%3D%20String(await%20defaultRuntime.actions.send(%7B%20text%3A%20''%20%7D))%5Cn%7D%5Cn%5Cnasync%20function%20sendCustomEmptyText()%20%7B%5Cn%20%20const%20sent%20%3D%20await%20customRuntime.actions.send(%7B%20text%3A%20''%20%7D)%5Cn%20%20customResult.value%20%3D%20%60%24%7BcustomResult.value%7D%EF%BC%8C%E7%BB%93%E6%9E%9C%3A%20%24%7Bsent%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22runtime-send-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E9%BB%98%E8%AE%A4%E5%8F%91%E9%80%81%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendDefaultEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20defaultResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22runtime-send-demo__item%5C%22%3E%5Cn%20%20%20%20%20%20%3Ch3%3E%E8%87%AA%E5%AE%9A%E4%B9%89%20send%3C%2Fh3%3E%5Cn%20%20%20%20%20%20%3Cbutton%20class%3D%5C%22runtime-send-demo__button%5C%22%20type%3D%5C%22button%5C%22%20%40click%3D%5C%22sendCustomEmptyText%5C%22%3E%E5%8F%91%E9%80%81%E7%A9%BA%E6%96%87%E6%9C%AC%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20aria-live%3D%5C%22polite%5C%22%3E%E7%BB%93%E6%9E%9C%EF%BC%9A%7B%7B%20customResult%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.runtime-send-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(2%2C%20minmax(0%2C%201fr))%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20%7B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-common-border-color)%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%20%20min-height%3A%2032px%3B%5Cn%20%20border%3A%201px%20solid%20%232f6fad%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20padding%3A%206px%2012px%3B%5Cn%20%20color%3A%20%23fff%3B%5Cn%20%20background%3A%20%232f6fad%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%20%20font%3A%20inherit%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Ahover%20%7B%5Cn%20%20border-color%3A%20%2324598d%3B%5Cn%20%20background%3A%20%2324598d%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__button%3Afocus-visible%20%7B%5Cn%20%20outline%3A%202px%20solid%20%238ab8df%3B%5Cn%20%20outline-offset%3A%202px%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn.runtime-send-demo__item%20h3%2C%5Cn.runtime-send-demo__item%20p%20%7B%5Cn%20%20margin%3A%200%200%2012px%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.runtime-send-demo%20%7B%5Cn%20%20%20%20grid-template-columns%3A%201fr%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:n(A)},u({_:2},[i.value?{name:"vue",fn:s(()=>[t(n(i))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=r("",33))])}}});export{x as __pageData,P as default};
