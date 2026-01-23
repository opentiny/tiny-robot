const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/SSEStream.DD1HR77I.js","assets/chunks/theme.ElrMH2Dt.js","assets/chunks/framework.D5IXmigW.js","assets/chunks/index.ZZ10bc7j.js"])))=>i.map(i=>d[i]);
import{aD as p,bQ as h,aZ as C,aL as c,v as k,H as r,bL as d,bB as E,J as n,bk as e,bJ as o,G as g,b7 as m,aU as u}from"./chunks/framework.D5IXmigW.js";import{L as A,N as y}from"./chunks/index.BPwzYTgQ.js";const F=`<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在处理中...' : '请输入消息'"
      :loading="isProcessing"
      @submit="sendMessage"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig, TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { ChatMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '你好！我可以帮你处理流式响应。请发送一条消息试试。',
  },
])

const inputMessage = ref('')
const isProcessing = ref(false)
let abortController: AbortController | null = null

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

const sendMessage = async (content: string) => {
  if (!content.trim() || isProcessing.value) return

  // Add user message
  messages.value.push({
    role: 'user',
    content: content.trim(),
  })

  // Add placeholder for assistant message
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
  }
  messages.value.push(assistantMessage)

  isProcessing.value = true
  abortController = new AbortController()

  try {
    // Make fetch request
    const response = await fetch(\`\${apiUrl}/api/chat/completions\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.value.slice(0, -1).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
      }),
      signal: abortController.signal,
    })

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }

    // Use sseStreamToGenerator to process stream
    for await (const chunk of sseStreamToGenerator(response, { signal: abortController.signal })) {
      const choice = chunk.choices?.[0]
      if (choice?.delta?.content) {
        // Append delta content to assistant message
        assistantMessage.content += choice.delta.content
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request aborted')
      if (assistantMessage.content === '') {
        // Remove empty assistant message if aborted
        messages.value.pop()
      }
    } else {
      console.error('Error:', error)
      assistantMessage.content = \`错误: \${error.message || '未知错误'}\`
    }
  } finally {
    isProcessing.value = false
    abortController = null
  }
}

const abortRequest = () => {
  if (abortController) {
    abortController.abort()
  }
}
<\/script>
`,v=JSON.parse('{"title":"工具函数 Utils","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"tools/utils.md","filePath":"tools/utils.md"}'),b={name:"tools/utils.md"},S=Object.assign(b,{setup(D){const t=u(!0),a=m();return p(async()=>{a.value=(await h(async()=>{const{default:i}=await import("./chunks/SSEStream.DD1HR77I.js");return{default:i}},__vite__mapDeps([0,1,2,3]))).default}),(i,s)=>{const l=C("ClientOnly");return c(),k("div",null,[s[1]||(s[1]=r('<h1 id="工具函数-utils" tabindex="-1">工具函数 Utils <a class="header-anchor" href="#工具函数-utils" aria-label="Permalink to &quot;工具函数 Utils&quot;">​</a></h1><p>工具函数模块提供了一些实用的辅助函数，用于处理流式响应和消息格式化。</p><h2 id="示例" tabindex="-1">示例 <a class="header-anchor" href="#示例" aria-label="Permalink to &quot;示例&quot;">​</a></h2><h3 id="sse-流式响应处理" tabindex="-1">SSE 流式响应处理 <a class="header-anchor" href="#sse-流式响应处理" aria-label="Permalink to &quot;SSE 流式响应处理&quot;">​</a></h3><p><code>sseStreamToGenerator</code> 函数将服务器发送事件（SSE）流式响应转换为异步生成器，方便逐个处理响应数据块：</p>',5)),d(n(e(A),null,null,512),[[E,t.value]]),n(l,null,{default:o(()=>[n(e(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22SSEStream.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftools%2Futils%2FSSEStream.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Ctr-bubble-list%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%20%20%3Ctr-sender%5Cn%20%20%20%20%20%20v-model%3D%5C%22inputMessage%5C%22%5Cn%20%20%20%20%20%20%3Aplaceholder%3D%5C%22isProcessing%20%3F%20'%E6%AD%A3%E5%9C%A8%E5%A4%84%E7%90%86%E4%B8%AD...'%20%3A%20'%E8%AF%B7%E8%BE%93%E5%85%A5%E6%B6%88%E6%81%AF'%5C%22%5Cn%20%20%20%20%20%20%3Aloading%3D%5C%22isProcessing%5C%22%5Cn%20%20%20%20%20%20%40submit%3D%5C%22sendMessage%5C%22%5Cn%20%20%20%20%20%20%40cancel%3D%5C%22abortRequest%5C%22%5Cn%20%20%20%20%3E%3C%2Ftr-sender%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleRoleConfig%2C%20TrBubbleList%2C%20TrSender%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20ChatMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20messages%20%3D%20ref%3CChatMessage%5B%5D%3E(%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E4%BD%A0%E5%A5%BD%EF%BC%81%E6%88%91%E5%8F%AF%E4%BB%A5%E5%B8%AE%E4%BD%A0%E5%A4%84%E7%90%86%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94%E3%80%82%E8%AF%B7%E5%8F%91%E9%80%81%E4%B8%80%E6%9D%A1%E6%B6%88%E6%81%AF%E8%AF%95%E8%AF%95%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D)%5Cn%5Cnconst%20inputMessage%20%3D%20ref('')%5Cnconst%20isProcessing%20%3D%20ref(false)%5Cnlet%20abortController%3A%20AbortController%20%7C%20null%20%3D%20null%5Cn%5Cn%2F%2F%20Get%20BASE_URL%20from%20import.meta%20if%20available%2C%20otherwise%20use%20empty%20string%5Cninterface%20ImportMetaEnv%20%7B%5Cn%20%20BASE_URL%3F%3A%20string%5Cn%7D%5Cninterface%20ImportMetaWithEnv%20extends%20ImportMeta%20%7B%5Cn%20%20env%3F%3A%20ImportMetaEnv%5Cn%7D%5Cnconst%20meta%20%3D%20typeof%20import.meta%20!%3D%3D%20'undefined'%20%3F%20(import.meta%20as%20ImportMetaWithEnv)%20%3A%20null%5Cnconst%20baseUrl%20%3D%20meta%3F.env%3F.BASE_URL%20%7C%7C%20''%5Cnconst%20apiUrl%20%3D%20window.parent%3F.location.origin%20%7C%7C%20location.origin%20%2B%20baseUrl%5Cn%5Cnconst%20sendMessage%20%3D%20async%20(content%3A%20string)%20%3D%3E%20%7B%5Cn%20%20if%20(!content.trim()%20%7C%7C%20isProcessing.value)%20return%5Cn%5Cn%20%20%2F%2F%20Add%20user%20message%5Cn%20%20messages.value.push(%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20content.trim()%2C%5Cn%20%20%7D)%5Cn%5Cn%20%20%2F%2F%20Add%20placeholder%20for%20assistant%20message%5Cn%20%20const%20assistantMessage%3A%20ChatMessage%20%3D%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20''%2C%5Cn%20%20%7D%5Cn%20%20messages.value.push(assistantMessage)%5Cn%5Cn%20%20isProcessing.value%20%3D%20true%5Cn%20%20abortController%20%3D%20new%20AbortController()%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20%2F%2F%20Make%20fetch%20request%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7BapiUrl%7D%2Fapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20headers%3A%20%7B%5Cn%20%20%20%20%20%20%20%20'Content-Type'%3A%20'application%2Fjson'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%5Cn%20%20%20%20%20%20%20%20messages%3A%20messages.value.slice(0%2C%20-1).map((msg)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20role%3A%20msg.role%2C%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20msg.content%2C%5Cn%20%20%20%20%20%20%20%20%7D))%2C%5Cn%20%20%20%20%20%20%20%20stream%3A%20true%2C%5Cn%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20signal%3A%20abortController.signal%2C%5Cn%20%20%20%20%7D)%5Cn%5Cn%20%20%20%20if%20(!response.ok)%20%7B%5Cn%20%20%20%20%20%20throw%20new%20Error(%60HTTP%20error!%20status%3A%20%24%7Bresponse.status%7D%60)%5Cn%20%20%20%20%7D%5Cn%5Cn%20%20%20%20%2F%2F%20Use%20sseStreamToGenerator%20to%20process%20stream%5Cn%20%20%20%20for%20await%20(const%20chunk%20of%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortController.signal%20%7D))%20%7B%5Cn%20%20%20%20%20%20const%20choice%20%3D%20chunk.choices%3F.%5B0%5D%5Cn%20%20%20%20%20%20if%20(choice%3F.delta%3F.content)%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20Append%20delta%20content%20to%20assistant%20message%5Cn%20%20%20%20%20%20%20%20assistantMessage.content%20%2B%3D%20choice.delta.content%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%7D%20catch%20(error)%20%7B%5Cn%20%20%20%20if%20(error.name%20%3D%3D%3D%20'AbortError')%20%7B%5Cn%20%20%20%20%20%20console.log('Request%20aborted')%5Cn%20%20%20%20%20%20if%20(assistantMessage.content%20%3D%3D%3D%20'')%20%7B%5Cn%20%20%20%20%20%20%20%20%2F%2F%20Remove%20empty%20assistant%20message%20if%20aborted%5Cn%20%20%20%20%20%20%20%20messages.value.pop()%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%20else%20%7B%5Cn%20%20%20%20%20%20console.error('Error%3A'%2C%20error)%5Cn%20%20%20%20%20%20assistantMessage.content%20%3D%20%60%E9%94%99%E8%AF%AF%3A%20%24%7Berror.message%20%7C%7C%20'%E6%9C%AA%E7%9F%A5%E9%94%99%E8%AF%AF'%7D%60%5Cn%20%20%20%20%7D%5Cn%20%20%7D%20finally%20%7B%5Cn%20%20%20%20isProcessing.value%20%3D%20false%5Cn%20%20%20%20abortController%20%3D%20null%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20abortRequest%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20if%20(abortController)%20%7B%5Cn%20%20%20%20abortController.abort()%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:e(F)},g({_:2},[a.value?{name:"vue",fn:o(()=>[n(e(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=r(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="ssestreamtogenerator" tabindex="-1">sseStreamToGenerator <a class="header-anchor" href="#ssestreamtogenerator" aria-label="Permalink to &quot;sseStreamToGenerator&quot;">​</a></h3><p>将 SSE 流转换为异步生成器。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function*</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sseStreamToGenerator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Response</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">signal</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AbortSignal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AsyncGenerator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h4 id="参数" tabindex="-1">参数 <a class="header-anchor" href="#参数" aria-label="Permalink to &quot;参数&quot;">​</a></h4><ul><li><code>response</code>: <code>Response</code> - fetch 响应对象</li><li><code>options</code>: <code>{ signal?: AbortSignal }</code> - 配置选项 <ul><li><code>signal</code>: <code>AbortSignal</code> - 可选的取消信号，用于中断流处理</li></ul></li></ul><h4 id="返回值" tabindex="-1">返回值 <a class="header-anchor" href="#返回值" aria-label="Permalink to &quot;返回值&quot;">​</a></h4><p>返回一个异步生成器，产出类型为 <code>T</code> 的数据。</p><h4 id="说明" tabindex="-1">说明 <a class="header-anchor" href="#说明" aria-label="Permalink to &quot;说明&quot;">​</a></h4><ul><li>当取消信号被触发时，会抛出 <code>name</code> 为 <code>&#39;AbortError&#39;</code> 的错误</li><li>自动处理 SSE 格式的数据流，解析 <code>data:</code> 前缀的数据</li><li>当遇到 <code>[DONE]</code> 标记时，生成器会结束</li></ul><h4 id="使用示例" tabindex="-1">使用示例 <a class="header-anchor" href="#使用示例" aria-label="Permalink to &quot;使用示例&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { sseStreamToGenerator } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-kit&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 发起流式请求</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/api/chat/completions&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  method: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;POST&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  body: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">JSON</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stringify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ messages: [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], stream: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  signal: abortSignal,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用生成器处理流式响应</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> chunk</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> of</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> sseStreamToGenerator</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ChatCompletion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(response, { signal: abortSignal })) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 处理每个数据块</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(chunk.choices[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]?.delta?.content)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,12))])}}});export{v as __pageData,S as default};
