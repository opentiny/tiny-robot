const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Stream.DvWl5UfQ.js","assets/chunks/theme.BWggOwba.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/index.JkrMKQ49.js","assets/chunks/Basic.DJeZcONR.js"])))=>i.map(i=>d[i]);
import{aD as k,bQ as o,aZ as F,aL as D,v as u,H as d,bL as c,bB as C,J as i,bk as n,bJ as l,G as E,w as a,I as m,b7 as g,aU as B}from"./chunks/framework.CUa_Cx66.js";import{L as A,N as y}from"./chunks/index.C4PESc4f.js";const b=`<script setup lang="ts">
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
    apiUrl: window.parent?.location.origin || location.origin + import.meta.env.BASE_URL,
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
`,f=`<script setup lang="ts">
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
    apiUrl: window.parent?.location.origin || location.origin + import.meta.env.BASE_URL,
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
`,T=JSON.parse('{"title":"AIClient 模型交互工具类","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/ai-client.md","filePath":"tools/ai-client.md"}'),v={name:"tools/ai-client.md"},S=Object.assign(v,{setup(_){const r=g();k(async()=>{r.value=(await o(async()=>{const{default:e}=await import("./chunks/Stream.DvWl5UfQ.js");return{default:e}},__vite__mapDeps([0,1,2,3]))).default});const t=B(!0),p=g();return k(async()=>{p.value=(await o(async()=>{const{default:e}=await import("./chunks/Basic.DJeZcONR.js");return{default:e}},__vite__mapDeps([4,1,2,3]))).default}),(e,s)=>{const h=F("ClientOnly");return D(),u("div",null,[s[2]||(s[2]=d('<h1 id="aiclient-模型交互工具类" tabindex="-1">AIClient 模型交互工具类 <a class="header-anchor" href="#aiclient-模型交互工具类" aria-label="Permalink to &quot;AIClient 模型交互工具类&quot;">​</a></h1><div class="danger custom-block"><p class="custom-block-title">重大版本升级 v0.4</p><p><code>AIClient</code> 已废弃，推荐使用 <code>useMessage</code> + <code>responseProvider</code>。</p><p><strong>从 v0.3.x 升级？</strong> 请查看 <a href="./../migration/use-message-migration.html">useMessage 迁移</a>。</p></div><p>客户端类，用于与 AI 模型交互（已废弃，仅作兼容保留）。</p><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><h3 id="创建客户端并发送消息" tabindex="-1">创建客户端并发送消息 <a class="header-anchor" href="#创建客户端并发送消息" aria-label="Permalink to &quot;创建客户端并发送消息&quot;">​</a></h3>',5)),c(i(n(A),null,null,512),[[C,t.value]]),i(h,null,{default:l(()=>[i(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fclient%2FBasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubble%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20AIClient%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnconst%20message%20%3D%20ref('')%5Cnconst%20content%20%3D%20ref('hello')%5Cn%5Cn%2F%2F%20%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E5%B9%B6%E8%8E%B7%E5%8F%96%E5%93%8D%E5%BA%94%5Cnasync%20function%20chat(content)%20%7B%5Cn%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E5%AE%A2%E6%88%B7%E7%AB%AF%5Cn%20%20const%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20%20%20provider%3A%20'openai'%2C%5Cn%20%20%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Falpha%2F'%2C%5Cn%20%20%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20%7D)%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20response%20%3D%20await%20client.chat(%7B%5Cn%20%20%20%20%20%20messages%3A%20%5B%7B%20role%3A%20'user'%2C%20content%20%7D%5D%2C%5Cn%20%20%20%20%20%20options%3A%20%7B%5Cn%20%20%20%20%20%20%20%20temperature%3A%200.7%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20message.value%20%3D%20response.choices%5B0%5D.message.content%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20console.error('%E8%81%8A%E5%A4%A9%E5%87%BA%E9%94%99%3A'%2C%20error)%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble%20v-if%3D%5C%22message%5C%22%20%3Acontent%3D%5C%22message%5C%22%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3Ctr-sender%20v-model%3D%5C%22content%5C%22%20%40submit%3D%5C%22chat(content)%5C%22%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:n(f)},E({_:2},[p.value?{name:"vue",fn:l(()=>[i(n(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=a("h3",{id:"使用流式响应",tabindex:"-1"},[m("使用流式响应 "),a("a",{class:"header-anchor",href:"#使用流式响应","aria-label":'Permalink to "使用流式响应"'},"​")],-1)),s[4]||(s[4]=a("ul",null,[a("li",null,"使用chatStream方法实现流式响应"),a("li",null,"signal参数传递 AbortController用于中断请求")],-1)),c(i(n(A),null,null,512),[[C,t.value]]),i(h,null,{default:l(()=>[i(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Stream.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Fclient%2FStream.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrBubble%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20AIClient%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cn%5Cnconst%20message%20%3D%20ref('')%5Cnconst%20content%20%3D%20ref('hello')%5Cn%5Cnlet%20controller%3A%20AbortController%20%7C%20null%5Cn%5Cn%2F%2F%20%E5%8F%91%E9%80%81%E6%B6%88%E6%81%AF%E5%B9%B6%E8%8E%B7%E5%8F%96%E5%93%8D%E5%BA%94%5Cnasync%20function%20chat(content)%20%7B%5Cn%20%20%2F%2F%20%E5%88%9B%E5%BB%BA%E5%AE%A2%E6%88%B7%E7%AB%AF%5Cn%20%20const%20client%20%3D%20new%20AIClient(%7B%5Cn%20%20%20%20provider%3A%20'openai'%2C%5Cn%20%20%20%20defaultModel%3A%20'gpt-3.5-turbo'%2C%5Cn%20%20%20%20apiUrl%3A%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20'%2Ftiny-robot%2Falpha%2F'%2C%5Cn%20%20%20%20%2F%2F%20apiKey%3A%20'your-api-key'%2C%5Cn%20%20%7D)%5Cn%20%20try%20%7B%5Cn%20%20%20%20controller%20%3D%20new%20AbortController()%5Cn%20%20%20%20await%20client.chatStream(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20messages%3A%20%5B%7B%20role%3A%20'user'%2C%20content%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20options%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20signal%3A%20controller.signal%2C%20%2F%2F%20%E4%BC%A0%E9%80%92%20AbortController%20%E7%9A%84%20signal%E7%94%A8%E4%BA%8E%E4%B8%AD%E6%96%AD%E8%AF%B7%E6%B1%82%5Cn%20%20%20%20%20%20%20%20%20%20temperature%3A%200.7%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20onData%3A%20(data)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%2F%2F%20%E5%A4%84%E7%90%86%E6%B5%81%E5%BC%8F%E6%95%B0%E6%8D%AE%5Cn%20%20%20%20%20%20%20%20%20%20const%20content%20%3D%20data.choices%5B0%5D%3F.delta%3F.content%20%7C%7C%20''%5Cn%20%20%20%20%20%20%20%20%20%20message.value%20%2B%3D%20content%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20onError%3A%20(error)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20console.error('%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94%E9%94%99%E8%AF%AF%3A'%2C%20error)%5Cn%20%20%20%20%20%20%20%20%20%20controller%20%3D%20null%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20onDone%3A%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20console.log('%5C%5Cn%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94%E5%AE%8C%E6%88%90')%5Cn%20%20%20%20%20%20%20%20%20%20controller%20%3D%20null%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20console.error('%E8%81%8A%E5%A4%A9%E5%87%BA%E9%94%99%3A'%2C%20error)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnfunction%20abortRequest()%20%7B%5Cn%20%20if%20(controller)%20%7B%5Cn%20%20%20%20controller.abort()%5Cn%20%20%20%20controller%20%3D%20null%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Ctr-bubble%20v-if%3D%5C%22message%5C%22%20%3Acontent%3D%5C%22message%5C%22%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3Ctr-sender%20v-model%3D%5C%22content%5C%22%20%40submit%3D%5C%22chat(content)%5C%22%20%40cancel%3D%5C%22abortRequest%5C%22%3E%3C%2Ftr-sender%3E%5Cn%3C%2Ftemplate%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:n(b)},E({_:2},[r.value?{name:"vue",fn:l(()=>[i(n(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[5]||(s[5]=d(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="构造函数" tabindex="-1">构造函数 <a class="header-anchor" href="#构造函数" aria-label="Permalink to &quot;构造函数&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> client</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AIClient</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config: AIModelConfig)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * AI模型配置接口</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIModelConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  provider</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIProvider</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  apiKey</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  apiUrl</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  apiVersion</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultModel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  defaultOptions</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatCompletionOptions</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="方法" tabindex="-1">方法 <a class="header-anchor" href="#方法" aria-label="Permalink to &quot;方法&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * AIClient类</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 发送聊天请求并获取响应</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> request</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 聊天请求参数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@returns</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 聊天响应</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    chat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatCompletionRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ChatCompletionResponse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 发送流式聊天请求并通过处理器处理响应</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> request</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 聊天请求参数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> handler</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 流式响应处理器</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    chatStream</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatCompletionRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">handler</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StreamHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 获取当前配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@returns</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> AI模型配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    getConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIModelConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 更新配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 新的AI模型配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    updateConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Partial</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AIModelConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> * 流式响应处理器</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StreamHandler</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    onData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatCompletionStreamResponse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    onError</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">error</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIAdapterError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    onDone</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">finishReason</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,5))])}}});export{T as __pageData,S as default};
