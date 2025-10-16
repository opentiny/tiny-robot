const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Stream.CKJb5AMJ.js","assets/chunks/theme.CL4NAtuH.js","assets/chunks/framework.CSeOnaMy.js","assets/chunks/index.Y854Y0Ii.js","assets/chunks/Basic.serDBmYU.js"])))=>i.map(i=>d[i]);
import{D as r,v as o,V as d,p as F,C as D,c as m,o as C,a2 as y,af as g,G as i,j as n,ag as c,k as a,w as l,ai as A,a as b}from"./chunks/framework.CSeOnaMy.js";import{L as E,N as u}from"./chunks/index.BlMrQgh7.js";const f=`<script setup lang="ts">
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
`,S=JSON.parse('{"title":"AI模型交互工具类 AIClient","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/ai-client.md","filePath":"tools/ai-client.md"}'),B={name:"tools/ai-client.md"},w=Object.assign(B,{setup(_){const h=r();o(async()=>{h.value=(await d(async()=>{const{default:e}=await import("./chunks/Stream.CKJb5AMJ.js");return{default:e}},__vite__mapDeps([0,1,2,3]))).default});const t=F(!0),p=r();return o(async()=>{p.value=(await d(async()=>{const{default:e}=await import("./chunks/Basic.serDBmYU.js");return{default:e}},__vite__mapDeps([4,1,2,3]))).default}),(e,s)=>{const k=D("ClientOnly");return C(),m("div",null,[s[2]||(s[2]=y('<h1 id="ai模型交互工具类-aiclient" tabindex="-1">AI模型交互工具类 AIClient <a class="header-anchor" href="#ai模型交互工具类-aiclient" aria-label="Permalink to &quot;AI模型交互工具类 AIClient&quot;">​</a></h1><p>客户端类，用于与AI模型交互。</p><h2 id="用法示例" tabindex="-1">用法示例 <a class="header-anchor" href="#用法示例" aria-label="Permalink to &quot;用法示例&quot;">​</a></h2><h3 id="创建客户端并发送消息" tabindex="-1">创建客户端并发送消息 <a class="header-anchor" href="#创建客户端并发送消息" aria-label="Permalink to &quot;创建客户端并发送消息&quot;">​</a></h3>',4)),g(i(a(E),null,null,512),[[c,t.value]]),i(k,null,{default:l(()=>[i(a(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:a(v)},A({_:2},[p.value?{name:"vue",fn:l(()=>[i(a(p))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=n("h3",{id:"使用流式响应",tabindex:"-1"},[b("使用流式响应 "),n("a",{class:"header-anchor",href:"#使用流式响应","aria-label":'Permalink to "使用流式响应"'},"​")],-1)),s[4]||(s[4]=n("ul",null,[n("li",null,"使用chatStream方法实现流式响应"),n("li",null,"signal参数传递 AbortController用于中断请求")],-1)),g(i(a(E),null,null,512),[[c,t.value]]),i(k,null,{default:l(()=>[i(a(u),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),vueCode:a(f)},A({_:2},[h.value?{name:"vue",fn:l(()=>[i(a(h))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[5]||(s[5]=y(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="构造函数" tabindex="-1">构造函数 <a class="header-anchor" href="#构造函数" aria-label="Permalink to &quot;构造函数&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> client</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">AIClient</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config: AIModelConfig)</span></span>
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
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    onDone</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,5))])}}});export{S as __pageData,w as default};
