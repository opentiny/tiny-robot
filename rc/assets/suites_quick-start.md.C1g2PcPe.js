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
`,_=JSON.parse('{"title":"快速上手","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"suites/quick-start.md","filePath":"suites/quick-start.md"}'),A={name:"suites/quick-start.md"},f=Object.assign(A,{setup(v){const n=m(!0),t=g();return o(async()=>{t.value=(await r(async()=>{const{default:e}=await import("./chunks/basic.w52Oq8Mt.js");return{default:e}},__vite__mapDeps([0,1,2,3,4]))).default}),(e,s)=>{const p=d("ClientOnly");return k(),c("div",null,[s[1]||(s[1]=l(`<h1 id="快速上手" tabindex="-1">快速上手 <a class="header-anchor" href="#快速上手" aria-label="Permalink to &quot;快速上手&quot;">​</a></h1><p><code>TrChat</code> 是用于 Vue 应用的 AI 聊天页面组件，提供会话列表、消息展示和输入区，可接入模型服务发送消息，适用于独立聊天页面和应用内嵌 AI 助手。</p><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to &quot;安装&quot;">​</a></h2><p>在 Vue 3.3.11 及以上的 Vue 3 项目中安装 Chat 套件及基础组件包，后者用于引入基础组件样式。</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-nyLiE" id="tab-QVybej1" checked><label data-title="pnpm" for="tab-QVybej1">pnpm</label><input type="radio" name="group-nyLiE" id="tab-f0KRktt"><label data-title="yarn" for="tab-f0KRktt">yarn</label><input type="radio" name="group-nyLiE" id="tab-mO2RkZm"><label data-title="npm" for="tab-mO2RkZm">npm</label></div><div class="blocks"><div class="language-bash vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span></span></code></pre></div><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot-chat</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span></span></code></pre></div></div></div><h2 id="引入样式" tabindex="-1">引入样式 <a class="header-anchor" href="#引入样式" aria-label="Permalink to &quot;引入样式&quot;">​</a></h2><p>在应用入口（如 <code>main.ts</code>）引入基础组件和 Chat 的样式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/dist/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat/dist/style.css&#39;</span></span></code></pre></div><h2 id="基础案例" tabindex="-1">基础案例 <a class="header-anchor" href="#基础案例" aria-label="Permalink to &quot;基础案例&quot;">​</a></h2><p><code>TrChat</code> 推荐通过 <code>useChatRuntime</code> 接入模型服务。<a href="./chat-runtime.html#usechatruntime-配置"><code>useChatRuntime</code></a> 是 Chat 套件提供的聊天功能配置函数，负责连接模型服务、管理会话和发送请求，无需自行编写这些聊天逻辑。</p><p>通过 <code>modelProviders</code> 数组配置服务地址和模型列表，将其传给 <code>useChatRuntime</code>，再将返回的 <code>runtime</code> 对象传给 <code>TrChat</code>，即可使用发送消息、取消请求和切换会话等功能。</p><p>下面的 <code>App.vue</code> 包含组件和样式导入、模型服务配置及界面绑定。替换服务地址和模型 ID 后即可使用，示例中的占位值不能直接使用：</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrChat, useChatRuntime, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ChatProviderConfig } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/dist/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot-chat/dist/style.css&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> modelProviders</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatProviderConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 接入兼容 OpenAI /chat/completions 接口的服务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;openai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 替换为实际服务地址或兼容该接口的后端转发地址</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    apiUrl: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://your-service.example.com/v1/chat/completions&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    models: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;your-model-id&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 替换为服务支持的模型 ID</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;应用助手&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模型在界面中显示的名称</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> runtime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useChatRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ modelProviders })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrChat</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> :runtime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;runtime&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><div class="warning custom-block"><p class="custom-block-title">服务认证</p><p>需要 API Key 的服务，可在配置对象中添加与 <code>models</code> 同级的 <code>apiKey</code>，前端配置密钥仅限本地临时体验，生产环境应由服务端保管密钥并转发请求。服务类型、默认地址及认证配置见 <a href="./chat-runtime.html#模型服务">模型服务</a>。</p></div><p>外层容器样式仅用于限制文档中的展示高度，接入项目时仍需配置真实服务：</p>`,15)),E(i(a(u),null,null,512),[[y,n.value]]),i(p,null,{default:h(()=>[i(a(F),{title:"完整聊天页面",description:"输入消息并发送，查看模拟服务返回的回答。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fchat%2Fbasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatProviderConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot%2Fdist%2Fstyle.css'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cn%5Cnconst%20runtimeOrigin%20%3D%20typeof%20window%20%3D%3D%3D%20'undefined'%20%3F%20'http%3A%2F%2Flocalhost'%20%3A%20window.location.origin%5Cnconst%20modelProviders%3A%20ChatProviderConfig%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20type%3A%20'openai'%2C%5Cn%20%20%20%20%2F%2F%20%E6%96%87%E6%A1%A3%E9%80%9A%E8%BF%87%E6%A8%A1%E6%8B%9F%E6%9C%8D%E5%8A%A1%E8%BF%94%E5%9B%9E%E5%9B%9E%E7%AD%94%EF%BC%9B%E6%8E%A5%E5%85%A5%E9%A1%B9%E7%9B%AE%E6%97%B6%E6%9B%BF%E6%8D%A2%E4%B8%BA%E5%AE%9E%E9%99%85%E6%9C%8D%E5%8A%A1%E5%9C%B0%E5%9D%80%5Cn%20%20%20%20apiUrl%3A%20new%20URL(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%60%2C%20runtimeOrigin).toString()%2C%5Cn%20%20%20%20models%3A%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20id%3A%20'your-model-id'%2C%5Cn%20%20%20%20%20%20%20%20label%3A%20'%E5%BA%94%E7%94%A8%E5%8A%A9%E6%89%8B'%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%20modelProviders%20%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22chat-basic-demo%5C%22%3E%5Cn%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.chat-basic-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20box-sizing%3A%20border-box%3B%5Cn%20%20height%3A%20min(620px%2C%20calc(100vh%20-%20240px))%3B%5Cn%20%20min-height%3A%20480px%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%5Cn.chat-basic-demo%20%3Adeep(.tr-welcome__title-wrapper)%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20center%3B%5Cn%7D%5Cn%5Cn%40media%20(max-width%3A%20640px)%20%7B%5Cn%20%20.chat-basic-demo%20%7B%5Cn%20%20%20%20height%3A%20560px%3B%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:a(b)},C({_:2},[t.value?{name:"vue",fn:h(()=>[i(a(t))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[2]||(s[2]=l('<p>项目已使用 TinyRobot Kit 的会话管理工具 <code>useConversation</code> 时，可以保留原有会话和请求配置，并接入 <code>TrChat</code>，详见<a href="./chat-runtime.html#复用已有会话">复用已有会话</a>。</p><h2 id="下一步" tabindex="-1">下一步 <a class="header-anchor" href="#下一步" aria-label="Permalink to &quot;下一步&quot;">​</a></h2><ul><li><a href="./chat.html">界面与交互配置</a>：调整布局、输入区和消息展示，使用插槽定制界面。</li><li><a href="./chat-runtime.html">数据与逻辑配置</a>：配置模型服务、管理会话和接入 MCP 工具。</li></ul>',3))])}}});export{_ as __pageData,f as default};
