const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/combined.D_c0Tx-9.js","assets/chunks/theme.BG3R3r23.js","assets/chunks/framework.V2e55FFV.js","assets/chunks/index.C4MDnCoT.js","assets/chunks/index._E8rXUUF.js","assets/chunks/index.BkEWL1A4.js","assets/chunks/sdk-page-tools.jUiToEM7.js","assets/chunks/modelProviders.CZn4zHSh.js","assets/chunks/basic.BNuLRDlo.js","assets/chunks/kit.BsSeqIP8.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as p,aZ as h,aL as B,v as b,H as i,bL as g,bB as m,J as t,bk as n,bJ as s,G as u,b7 as E,aU as y}from"./chunks/framework.V2e55FFV.js";import{L as A,N as D}from"./chunks/index.D4H-2xaJ.js";const k=`<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { createWebMcpAdapter } from '@opentiny/tiny-robot'
import { TrChat, useChatRuntime, type ChatMcpServers } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { createSdkPageTools } from './sdk-page-tools'
import { modelProviders } from '../../chat/shared/modelProviders'

const pageTools = createSdkPageTools()
const webmcpAdapter = createWebMcpAdapter({
  getContext: pageTools.context,
  server: { id: 'page-webmcp', name: '页面工具' },
})

const externalMcpServers: ChatMcpServers = [
  {
    id: 'project-knowledge',
    name: '项目知识库',
    description: '外部 MCP 项目知识库。',
    baseUrl: \`\${import.meta.env.BASE_URL}api/mcp/project-knowledge\`,
    installed: false,
  },
]

const runtime = useChatRuntime({
  modelProviders,
  mcp: {
    servers: externalMcpServers,
    adapters: [webmcpAdapter],
  },
})

const registrationError = pageTools.registrationError

onBeforeUnmount(() => {
  pageTools.dispose()
  void webmcpAdapter.close?.()
})
<\/script>

<template>
  <section class="webmcp-demo">
    <div class="webmcp-demo__hint">页面 WebMCP 与外部 MCP 位于同一个 MCP 面板中。</div>
    <p v-if="registrationError" class="webmcp-demo__error" role="alert">页面工具注册失败：{{ registrationError }}</p>
    <div class="webmcp-demo__chat">
      <TrChat :runtime="runtime" />
    </div>
  </section>
</template>

<style scoped>
.webmcp-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.webmcp-demo__hint {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.webmcp-demo__error {
  margin: 0;
  color: var(--tr-color-danger, #c0392b);
  font-size: 13px;
}

.webmcp-demo__chat {
  width: 100%;
  height: clamp(420px, 58vh, 520px);
}

.webmcp-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
`,f=`<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { createWebMcpAdapter } from '@opentiny/tiny-robot'
import { TrChat, useChatRuntime, type ChatRuntimeActionErrorPayload } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { createSdkPageTools } from './sdk-page-tools'
import { modelProviders } from '../../chat/shared/modelProviders'

const pageTools = createSdkPageTools()
const webmcpAdapter = createWebMcpAdapter({
  getContext: pageTools.context,
  server: {
    id: 'page-webmcp',
    name: '页面工具',
    description: '当前 Demo 提供的页面 WebMCP 工具',
  },
})

const runtime = useChatRuntime({
  modelProviders,
  mcp: { adapters: [webmcpAdapter] },
})

const actionStatus = ref('页面工具已接入，等待 Chat 调用。')
const section = pageTools.section
const statusToolAdded = pageTools.statusToolAdded
const registrationError = pageTools.registrationError
const pageToolsInChat = computed(() => runtime.composer.mcp?.tools.value['page-webmcp'] ?? [])

onBeforeUnmount(() => {
  pageTools.dispose()
  void webmcpAdapter.close?.()
})

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionStatus.value = \`运行时操作失败：\${payload.action}\`
}
<\/script>

<template>
  <section class="webmcp-demo">
    <div class="webmcp-demo__toolbar">
      <span>当前页面区域：{{ section }}</span>
      <button
        type="button"
        @click="statusToolAdded ? pageTools.unregisterStatusTool() : pageTools.registerStatusTool()"
      >
        {{ statusToolAdded ? '重置页面工具' : '注册一个新页面工具' }}
      </button>
    </div>
    <div class="webmcp-demo__status">
      <span>{{ actionStatus }}</span>
      <span>已发现 {{ pageToolsInChat.length }} 个工具</span>
      <span v-if="registrationError" role="alert">页面工具注册失败：{{ registrationError }}</span>
    </div>
    <ul class="webmcp-demo__tools">
      <li v-for="tool in pageToolsInChat" :key="tool.id">
        <code>{{ tool.name }}</code>
        <span>{{ tool.description || '暂无描述' }}</span>
      </li>
    </ul>
    <div class="webmcp-demo__chat">
      <TrChat :runtime="runtime" @runtime-action-error="handleRuntimeActionError" />
    </div>
  </section>
</template>

<style scoped>
.webmcp-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.webmcp-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.webmcp-demo__toolbar button {
  border: 1px solid var(--tr-border-color-default, #d9d9d9);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--tr-text-primary, #191919);
  background: var(--tr-container-bg-default, #fff);
  cursor: pointer;
}

.webmcp-demo__status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 12px;
}

.webmcp-demo__tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.webmcp-demo__tools li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--tr-border-color-default, #d9d9d9);
  border-radius: 6px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 12px;
}

.webmcp-demo__tools code {
  color: var(--tr-text-primary, #191919);
}

.webmcp-demo__chat {
  width: 100%;
  height: clamp(420px, 58vh, 520px);
}

.webmcp-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
`,v=`<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref } from 'vue'
import { TrBubbleList, TrMcpExtensionDetail, TrSender, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { createWebMcpAdapter } from '@opentiny/tiny-robot'
import { toolPlugin, useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { ChatCompletionMessageToolCall, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import { createSdkPageTools } from './sdk-page-tools'

const pageTools = createSdkPageTools()
const adapter = createWebMcpAdapter({
  getContext: pageTools.context,
  server: { id: 'page-webmcp', name: '页面工具' },
})
const input = ref('')
const statusToolAdded = pageTools.statusToolAdded
const registrationError = pageTools.registrationError
const pageServer = computed(() => adapter.runtime.servers.value.find((server) => server.id === 'page-webmcp'))
const pageToolsInKit = computed(() => adapter.runtime.tools.value['page-webmcp'] ?? [])
const error = ref('')

onBeforeUnmount(() => {
  pageTools.dispose()
  void adapter.close?.()
})

const message = useMessage({
  responseProvider: async (requestBody: MessageRequestBody, abortSignal) => {
    const response = await fetch(\`\${import.meta.env.BASE_URL}api/chat/completions\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...requestBody, stream: true }),
      signal: abortSignal,
    })
    if (!response.ok) throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
    return sseStreamToGenerator(response, { signal: abortSignal })
  },
  plugins: [
    toolPlugin({
      getTools: async () => {
        await adapter.refresh?.()
        const server = adapter.runtime.servers.value[0]
        const tools = pageToolsInKit.value.filter((tool) => tool.enabled)
        if (!server?.enabled) return []
        const definitions = await adapter.listTools(['page-webmcp'], {
          'page-webmcp': tools.map((tool) => tool.id),
        })
        return definitions.map((tool) => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description ?? '',
            parameters: tool.inputSchema ?? { type: 'object', properties: {} },
          },
        }))
      },
      callTool: async (toolCall: ChatCompletionMessageToolCall) => {
        const name = toolCall.function?.name ?? ''
        const definition = (
          await adapter.listTools(['page-webmcp'], {
            'page-webmcp': pageToolsInKit.value.filter((tool) => tool.enabled).map((tool) => tool.id),
          })
        ).find((tool) => tool.name === name)
        if (!definition) throw new Error(\`Tool is not enabled: \${name}\`)
        const args = JSON.parse(toolCall.function?.arguments || '{}') as Record<string, unknown>
        return adapter.callTool(definition.serverId, definition.originalName, args)
      },
    }),
  ],
})

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: h(IconAi, { style: { fontSize: '28px' } }) },
  user: { placement: 'end', avatar: h(IconUser, { style: { fontSize: '28px' } }) },
}

async function handleSubmit(text: string) {
  if (!text.trim()) return
  error.value = ''
  input.value = ''
  try {
    await message.sendMessage(text)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}

async function handleServerToggle() {
  const server = pageServer.value
  if (!server || server.loading) return

  try {
    await adapter.runtime.setServerEnabled(server.id, !server.enabled)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}

async function handleToolToggle({ toolId, enabled }: { toolId: string; enabled: boolean }) {
  try {
    await adapter.runtime.setToolEnabled('page-webmcp', toolId, enabled)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}
<\/script>

<template>
  <section class="webmcp-kit-demo">
    <div class="webmcp-kit-demo__tools">
      <TrMcpExtensionDetail
        id="page-webmcp"
        name="页面工具"
        description="由 OpenTiny WebMCP SDK 注册的页面工具"
        :tools="pageToolsInKit"
        @tool-toggle="handleToolToggle"
      />
      <button type="button" :disabled="!pageServer || pageServer.loading" @click="handleServerToggle">
        {{ pageServer?.enabled ? '禁用页面 MCP Server' : '启用页面 MCP Server' }}
      </button>
      <button
        type="button"
        @click="statusToolAdded ? pageTools.unregisterStatusTool() : pageTools.registerStatusTool()"
      >
        {{ statusToolAdded ? '注销动态工具' : '注册动态工具' }}
      </button>
      <p v-if="registrationError" role="alert">页面工具注册失败：{{ registrationError }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </div>
    <div class="webmcp-kit-demo__messages">
      <TrBubbleList :messages="message.messages.value" :role-configs="roles" />
      <TrSender
        v-model="input"
        :loading="message.isProcessing.value"
        placeholder="让模型读取或切换页面区域"
        @submit="handleSubmit"
        @cancel="message.abortRequest"
      />
    </div>
  </section>
</template>

<style scoped>
.webmcp-kit-demo {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 16px;
  min-height: 520px;
}

.webmcp-kit-demo__messages {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 520px;
}

.webmcp-kit-demo__messages :deep(.tr-bubble-list) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.webmcp-kit-demo__tools button {
  margin-top: 12px;
}

.webmcp-kit-demo__tools p {
  color: #c0392b;
}
</style>
`,S=JSON.parse('{"title":"MCP Adapter 与 WebMCP","description":"","frontmatter":{"outline":[1,3],"pageClass":"demo-container-page-bg"},"headers":[],"relativePath":"best-practices/webmcp-chat-integration.md","filePath":"best-practices/webmcp-chat-integration.md"}'),x={name:"best-practices/webmcp-chat-integration.md"},_=Object.assign(x,{setup(T){const a=E();d(async()=>{a.value=(await p(async()=>{const{default:r}=await import("./chunks/combined.D_c0Tx-9.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).default});const C=E();d(async()=>{C.value=(await p(async()=>{const{default:r}=await import("./chunks/basic.BNuLRDlo.js");return{default:r}},__vite__mapDeps([8,1,2,3,4,5,6,7]))).default});const o=y(!0),l=E();return d(async()=>{l.value=(await p(async()=>{const{default:r}=await import("./chunks/kit.BsSeqIP8.js");return{default:r}},__vite__mapDeps([9,1,2,4,6,5]))).default}),(r,e)=>{const c=h("ClientOnly");return B(),b("div",null,[e[3]||(e[3]=i(`<h1 id="mcp-adapter-与-webmcp" tabindex="-1">MCP Adapter 与 WebMCP <a class="header-anchor" href="#mcp-adapter-与-webmcp" aria-label="Permalink to &quot;MCP Adapter 与 WebMCP&quot;">​</a></h1><p>WebMCP Adapter 将页面工具接入 TinyRobot 的统一 MCP 管理接口。应用通过 WebMCP SDK 初始化 Context、注册工具并实现业务逻辑；Adapter 负责工具发现、状态同步和调用转发。</p><h2 id="包职责与公共-api" tabindex="-1">包职责与公共 API <a class="header-anchor" href="#包职责与公共-api" aria-label="Permalink to &quot;包职责与公共 API&quot;">​</a></h2><table tabindex="0"><thead><tr><th>使用场景</th><th>推荐包</th><th>说明</th></tr></thead><tbody><tr><td>WebMCP Adapter 或 MCP 管理能力</td><td>@opentiny/tiny-robot</td><td>导出公共 Adapter、MCP 状态契约和组合管理器。</td></tr><tr><td>自己管理消息和模型工具调用</td><td>@opentiny/tiny-robot + @opentiny/tiny-robot-kit</td><td>业务使用公共 Adapter，并用 Kit 完成模型工具调用。</td></tr><tr><td>使用完整聊天页面</td><td>@opentiny/tiny-robot-chat</td><td>Chat Runtime 复用同一个 Adapter，并负责连接界面和会话。</td></tr></tbody></table><p>公共 API 参考见 <a href="./../components/mcp-extension.html#mcp-adapter-公共-api">MCP Adapter 公共 API</a>。完整接入示例包含组件 + Kit、Chat，以及 WebMCP 与外部 MCP 共存三种场景。</p><div class="important custom-block github-alert"><p class="custom-block-title">IMPORTANT</p><p><code>createWebMcpAdapter</code> 不负责初始化 WebMCP Polyfill，也不负责注册页面工具。应用需要通过 SDK 或其他方式准备 Context，并负责工具权限和业务副作用。</p></div><h2 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h2><p>选择 WebMCP 接入时，工具通常满足以下特征：</p><ul><li>工具依赖当前页面、当前路由或当前用户会话；</li><li>工具执行需要浏览器环境中的状态或页面能力；</li><li>工具不需要单独部署为外部 MCP 服务；</li><li>工具的权限确认和业务副作用可以由页面应用控制。</li></ul><p>如果工具主要访问服务端数据、需要跨页面复用，或者需要独立的鉴权和部署边界，应优先使用外部 MCP Server。WebMCP 和外部 MCP 可以同时接入同一个工具运行时或 Chat Runtime。</p><h2 id="接入边界" tabindex="-1">接入边界 <a class="header-anchor" href="#接入边界" aria-label="Permalink to &quot;接入边界&quot;">​</a></h2><table tabindex="0"><thead><tr><th>能力</th><th>应用侧负责</th><th>TinyRobot 负责</th></tr></thead><tbody><tr><td>页面工具</td><td>注册工具、实现工具逻辑和返回结果</td><td>不负责注册页面工具</td></tr><tr><td>权限与副作用</td><td>登录态、权限校验、用户确认和业务操作</td><td>不替代业务鉴权</td></tr><tr><td>WebMCP Context</td><td>初始化 <code>document.modelContext</code> 或提供自定义 Context</td><td>通过 <code>getContext</code> 接入 Context</td></tr><tr><td>工具变化</td><td>工具增删或更新后触发 <code>toolchange</code></td><td>刷新工具列表并更新运行时状态</td></tr><tr><td>Server 信息</td><td>提供稳定的 <code>id</code>、<code>name</code> 和描述</td><td>在 MCP 面板中展示 Server 和 Tool 状态</td></tr><tr><td>组件与 Kit</td><td>将 Adapter 接入 <code>toolPlugin</code> 和自定义工具面板</td><td>提供统一状态和调用契约</td></tr><tr><td>Chat 接入</td><td>将 Adapter 传入 <code>useChatRuntime</code></td><td>完成工具适配、路由和调用结果处理</td></tr></tbody></table><p>公共 Adapter 的完整参数和生命周期见 <a href="./../components/mcp-extension.html#mcp-adapter-公共-api">MCP Adapter 公共 API</a>。</p><p>业务不需要在标准接入中直接实现工具路由；组件、Kit 和 Chat 分别负责自己的展示与调用链。</p><h2 id="环境准备与体验前提" tabindex="-1">环境准备与体验前提 <a class="header-anchor" href="#环境准备与体验前提" aria-label="Permalink to &quot;环境准备与体验前提&quot;">​</a></h2><p>示例使用 <code>@opentiny/next-sdk@0.4.11</code> 初始化 WebMCP Polyfill 并注册页面工具。文档站可以直接体验工具发现、动态注册/注销、Server/Tool 开关和 <code>toolchange</code> 同步。</p><p>初始化顺序是先调用 <code>initializeBuiltinWebMCP()</code>，再从 <code>document.modelContext</code> 获取 Context，通过 <code>context.registerTool</code> 注册工具；工具注册返回的 <code>AbortController</code> 信号用于注销。示例已将这段流程封装在 <code>sdk-page-tools.ts</code> 的 <code>createSdkPageTools</code> 中。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { initializeBuiltinWebMCP } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/next-sdk&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">initializeBuiltinWebMCP</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> document.modelContext</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> controller</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AbortController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">registerTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;get-page-info&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;读取当前页面信息。&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    inputSchema: { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;object&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, properties: {} },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    execute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ content: [{ type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;text&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, text: document.title }] }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { signal: controller.signal },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 页面卸载或工具移除时注销</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">controller.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">abort</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span></code></pre></div><p>文档站当前的模型接口是演示用 Mock，默认只返回文本，不保证返回真实 <code>tool_calls</code>。要验证模型实际选择并调用页面工具，请在自己的 Vue 应用中配置支持 Tool Calling 的模型服务，并发送“读取当前页面区域”或“切换到 details”等请求，检查工具结果和页面状态。</p><p>真实模型服务需要支持 OpenAI 兼容的 <code>tools</code> 请求和 <code>assistant.tool_calls</code> 响应：第一轮返回工具调用后，Kit/Chat 执行 <code>callTool</code> 并追加 <code>tool</code> 消息，再发起下一轮请求获得最终文本。</p><p>共存示例中的 <code>api/mcp/project-knowledge</code> 是占位地址。接入真实外部 MCP 时，请替换为实际 SSE 或 Streamable HTTP 地址，并确保浏览器 CORS 或服务端代理、认证和权限策略已配置。</p><h2 id="完整接入示例" tabindex="-1">完整接入示例 <a class="header-anchor" href="#完整接入示例" aria-label="Permalink to &quot;完整接入示例&quot;">​</a></h2><p>本节包含三个可在文档站查看的接入场景：不使用 Chat 的 Kit 接入、Chat 接入，以及 WebMCP 与外部 MCP 共存。三个场景使用同一组页面工具，并通过 OpenTiny WebMCP SDK 完成初始化、注册和注销；真实模型工具调用和外部 MCP 连接需要按“环境准备与体验前提”配置。</p><h3 id="示例一-kit-接入-webmcp" tabindex="-1">示例一：Kit 接入 WebMCP <a class="header-anchor" href="#示例一-kit-接入-webmcp" aria-label="Permalink to &quot;示例一：Kit 接入 WebMCP&quot;">​</a></h3><p>这个示例不依赖 @opentiny/tiny-robot-chat，使用公共 WebMCP Adapter、TinyRobot 组件和 Kit 的 useMessage/toolPlugin 完成工具管理和模型调用。</p>`,25)),g(t(n(A),null,null,512),[[m,o.value]]),t(c,null,{default:s(()=>[t(n(D),{title:"Kit 接入 WebMCP",description:"不依赖 Chat 套件，使用公共 Adapter、组件和 Kit 完成工具发现、启停与模型调用。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22kit.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fkit.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20h%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrBubbleList%2C%20TrMcpExtensionDetail%2C%20TrSender%2C%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20createWebMcpAdapter%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20toolPlugin%2C%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20ChatCompletionMessageToolCall%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20createSdkPageTools%20%7D%20from%20'.%2Fsdk-page-tools'%5Cn%5Cnconst%20pageTools%20%3D%20createSdkPageTools()%5Cnconst%20adapter%20%3D%20createWebMcpAdapter(%7B%5Cn%20%20getContext%3A%20pageTools.context%2C%5Cn%20%20server%3A%20%7B%20id%3A%20'page-webmcp'%2C%20name%3A%20'%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%7D%2C%5Cn%7D)%5Cnconst%20input%20%3D%20ref('')%5Cnconst%20statusToolAdded%20%3D%20pageTools.statusToolAdded%5Cnconst%20registrationError%20%3D%20pageTools.registrationError%5Cnconst%20pageServer%20%3D%20computed(()%20%3D%3E%20adapter.runtime.servers.value.find((server)%20%3D%3E%20server.id%20%3D%3D%3D%20'page-webmcp'))%5Cnconst%20pageToolsInKit%20%3D%20computed(()%20%3D%3E%20adapter.runtime.tools.value%5B'page-webmcp'%5D%20%3F%3F%20%5B%5D)%5Cnconst%20error%20%3D%20ref('')%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20pageTools.dispose()%5Cn%20%20void%20adapter.close%3F.()%5Cn%7D)%5Cn%5Cnconst%20message%20%3D%20useMessage(%7B%5Cn%20%20responseProvider%3A%20async%20(requestBody%3A%20MessageRequestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20if%20(!response.ok)%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%7D%2C%5Cn%20%20plugins%3A%20%5B%5Cn%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20getTools%3A%20async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20await%20adapter.refresh%3F.()%5Cn%20%20%20%20%20%20%20%20const%20server%20%3D%20adapter.runtime.servers.value%5B0%5D%5Cn%20%20%20%20%20%20%20%20const%20tools%20%3D%20pageToolsInKit.value.filter((tool)%20%3D%3E%20tool.enabled)%5Cn%20%20%20%20%20%20%20%20if%20(!server%3F.enabled)%20return%20%5B%5D%5Cn%20%20%20%20%20%20%20%20const%20definitions%20%3D%20await%20adapter.listTools(%5B'page-webmcp'%5D%2C%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20'page-webmcp'%3A%20tools.map((tool)%20%3D%3E%20tool.id)%2C%5Cn%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%20%20return%20definitions.map((tool)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%20as%20const%2C%5Cn%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20tool.name%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20description%3A%20tool.description%20%3F%3F%20''%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20parameters%3A%20tool.inputSchema%20%3F%3F%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D))%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20callTool%3A%20async%20(toolCall%3A%20ChatCompletionMessageToolCall)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20name%20%3D%20toolCall.function%3F.name%20%3F%3F%20''%5Cn%20%20%20%20%20%20%20%20const%20definition%20%3D%20(%5Cn%20%20%20%20%20%20%20%20%20%20await%20adapter.listTools(%5B'page-webmcp'%5D%2C%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20'page-webmcp'%3A%20pageToolsInKit.value.filter((tool)%20%3D%3E%20tool.enabled).map((tool)%20%3D%3E%20tool.id)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%20%20).find((tool)%20%3D%3E%20tool.name%20%3D%3D%3D%20name)%5Cn%20%20%20%20%20%20%20%20if%20(!definition)%20throw%20new%20Error(%60Tool%20is%20not%20enabled%3A%20%24%7Bname%7D%60)%5Cn%20%20%20%20%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%20as%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20%20%20%20%20%20%20return%20adapter.callTool(definition.serverId%2C%20definition.originalName%2C%20args)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%20%7D%2C%5Cn%7D%5Cn%5Cnasync%20function%20handleSubmit(text%3A%20string)%20%7B%5Cn%20%20if%20(!text.trim())%20return%5Cn%20%20error.value%20%3D%20''%5Cn%20%20input.value%20%3D%20''%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20message.sendMessage(text)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20error.value%20%3D%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnasync%20function%20handleServerToggle()%20%7B%5Cn%20%20const%20server%20%3D%20pageServer.value%5Cn%20%20if%20(!server%20%7C%7C%20server.loading)%20return%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20adapter.runtime.setServerEnabled(server.id%2C%20!server.enabled)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20error.value%20%3D%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnasync%20function%20handleToolToggle(%7B%20toolId%2C%20enabled%20%7D%3A%20%7B%20toolId%3A%20string%3B%20enabled%3A%20boolean%20%7D)%20%7B%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20adapter.runtime.setToolEnabled('page-webmcp'%2C%20toolId%2C%20enabled)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20error.value%20%3D%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22webmcp-kit-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-kit-demo__tools%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrMcpExtensionDetail%5Cn%20%20%20%20%20%20%20%20id%3D%5C%22page-webmcp%5C%22%5Cn%20%20%20%20%20%20%20%20name%3D%5C%22%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%5C%22%5Cn%20%20%20%20%20%20%20%20description%3D%5C%22%E7%94%B1%20OpenTiny%20WebMCP%20SDK%20%E6%B3%A8%E5%86%8C%E7%9A%84%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%5C%22%5Cn%20%20%20%20%20%20%20%20%3Atools%3D%5C%22pageToolsInKit%5C%22%5Cn%20%20%20%20%20%20%20%20%40tool-toggle%3D%5C%22handleToolToggle%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%3Adisabled%3D%5C%22!pageServer%20%7C%7C%20pageServer.loading%5C%22%20%40click%3D%5C%22handleServerToggle%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20pageServer%3F.enabled%20%3F%20'%E7%A6%81%E7%94%A8%E9%A1%B5%E9%9D%A2%20MCP%20Server'%20%3A%20'%E5%90%AF%E7%94%A8%E9%A1%B5%E9%9D%A2%20MCP%20Server'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22statusToolAdded%20%3F%20pageTools.unregisterStatusTool()%20%3A%20pageTools.registerStatusTool()%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20statusToolAdded%20%3F%20'%E6%B3%A8%E9%94%80%E5%8A%A8%E6%80%81%E5%B7%A5%E5%85%B7'%20%3A%20'%E6%B3%A8%E5%86%8C%E5%8A%A8%E6%80%81%E5%B7%A5%E5%85%B7'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20v-if%3D%5C%22registrationError%5C%22%20role%3D%5C%22alert%5C%22%3E%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E6%B3%A8%E5%86%8C%E5%A4%B1%E8%B4%A5%EF%BC%9A%7B%7B%20registrationError%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3Cp%20v-if%3D%5C%22error%5C%22%20role%3D%5C%22alert%5C%22%3E%7B%7B%20error%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-kit-demo__messages%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrBubbleList%20%3Amessages%3D%5C%22message.messages.value%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3CTrSender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22input%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22message.isProcessing.value%5C%22%5Cn%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%AE%A9%E6%A8%A1%E5%9E%8B%E8%AF%BB%E5%8F%96%E6%88%96%E5%88%87%E6%8D%A2%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%20%20%40cancel%3D%5C%22message.abortRequest%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.webmcp-kit-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20minmax(240px%2C%20320px)%20minmax(0%2C%201fr)%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__messages%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__messages%20%3Adeep(.tr-bubble-list)%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__tools%20button%20%7B%5Cn%20%20margin-top%3A%2012px%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__tools%20p%20%7B%5Cn%20%20color%3A%20%23c0392b%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22sdk-page-tools.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fsdk-page-tools.ts%22%2C%22code%22%3A%22import%20%7B%20initializeBuiltinWebMCP%20%7D%20from%20'%40opentiny%2Fnext-sdk'%5Cnimport%20%7B%20ref%2C%20type%20Ref%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20WebMcpContext%2C%20WebMcpToolDescriptor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20SdkToolContext%20%3D%20WebMcpContext%20%26%20%7B%5Cn%20%20registerTool%3A%20(%5Cn%20%20%20%20definition%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20string%5Cn%20%20%20%20%20%20description%3F%3A%20string%5Cn%20%20%20%20%20%20inputSchema%3F%3A%20unknown%5Cn%20%20%20%20%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20options%3F%3A%20%7B%20signal%3F%3A%20AbortSignal%20%7D%2C%5Cn%20%20)%20%3D%3E%20unknown%5Cn%7D%5Cn%5Cninterface%20SharedRegistration%20%7B%5Cn%20%20controller%3A%20AbortController%5Cn%20%20refs%3A%20number%5Cn%20%20listeners%3A%20Set%3C(cause%3A%20unknown)%20%3D%3E%20void%3E%5Cn%7D%5Cn%5Cninterface%20ContextRegistry%20%7B%5Cn%20%20section%3A%20Ref%3Cstring%3E%5Cn%20%20registrations%3A%20Map%3Cstring%2C%20SharedRegistration%3E%5Cn%7D%5Cn%5Cnconst%20GLOBAL_STATE_KEY%20%3D%20'__opentinyTinyRobotWebMcpSdkDemoState__'%5Cnconst%20globalState%20%3D%20(()%20%3D%3E%20%7B%5Cn%20%20const%20target%20%3D%20globalThis%20as%20typeof%20globalThis%20%26%20%7B%20%5Bkey%3A%20string%5D%3A%20unknown%20%7D%5Cn%20%20const%20existing%20%3D%20target%5BGLOBAL_STATE_KEY%5D%20as%20%7B%20contexts%3A%20WeakMap%3Cobject%2C%20ContextRegistry%3E%20%7D%20%7C%20undefined%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20created%20%3D%20%7B%20contexts%3A%20new%20WeakMap%3Cobject%2C%20ContextRegistry%3E()%20%7D%5Cn%20%20target%5BGLOBAL_STATE_KEY%5D%20%3D%20created%5Cn%20%20return%20created%5Cn%7D)()%5Cn%5Cnfunction%20getContextRegistry(context%3A%20SdkToolContext)%20%7B%5Cn%20%20const%20existing%20%3D%20globalState.contexts.get(context)%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20registry%3A%20ContextRegistry%20%3D%20%7B%5Cn%20%20%20%20section%3A%20ref('overview')%2C%5Cn%20%20%20%20registrations%3A%20new%20Map()%2C%5Cn%20%20%7D%5Cn%20%20globalState.contexts.set(context%2C%20registry)%5Cn%20%20return%20registry%5Cn%7D%5Cn%5Cnfunction%20readContext()%20%7B%5Cn%20%20return%20(document%20as%20Document%20%26%20%7B%20modelContext%3F%3A%20SdkToolContext%20%7D).modelContext%5Cn%7D%5Cn%5Cnfunction%20acquireRegistration(%5Cn%20%20context%3A%20SdkToolContext%2C%5Cn%20%20descriptor%3A%20WebMcpToolDescriptor%2C%5Cn%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20existing%20%3D%20registry.registrations.get(descriptor.name)%5Cn%20%20if%20(existing)%20%7B%5Cn%20%20%20%20existing.refs%20%2B%3D%201%5Cn%20%20%20%20existing.listeners.add(onError)%5Cn%20%20%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20existing%2C%20onError)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20entry%3A%20SharedRegistration%20%3D%20%7B%5Cn%20%20%20%20controller%3A%20new%20AbortController()%2C%5Cn%20%20%20%20refs%3A%201%2C%5Cn%20%20%20%20listeners%3A%20new%20Set(%5BonError%5D)%2C%5Cn%20%20%7D%5Cn%20%20registry.registrations.set(descriptor.name%2C%20entry)%5Cn%5Cn%20%20const%20handleError%20%3D%20(cause%3A%20unknown)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(entry.controller.signal.aborted)%20return%5Cn%20%20%20%20if%20(registry.registrations.get(descriptor.name)%20%3D%3D%3D%20entry)%20registry.registrations.delete(descriptor.name)%5Cn%20%20%20%20entry.listeners.forEach((listener)%20%3D%3E%20listener(cause))%5Cn%20%20%7D%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20registration%20%3D%20context.registerTool(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20name%3A%20descriptor.name%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20descriptor.description%2C%5Cn%20%20%20%20%20%20%20%20inputSchema%3A%20descriptor.inputSchema%2C%5Cn%20%20%20%20%20%20%20%20execute%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20signal%3A%20entry.controller.signal%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20void%20Promise.resolve(registration).catch(handleError)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20handleError(cause)%5Cn%20%20%20%20throw%20cause%5Cn%20%20%7D%5Cn%5Cn%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20entry%2C%20onError)%5Cn%7D%5Cn%5Cnfunction%20releaseRegistration(%5Cn%20%20registry%3A%20ContextRegistry%2C%5Cn%20%20name%3A%20string%2C%5Cn%20%20entry%3A%20SharedRegistration%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20if%20(registry.registrations.get(name)%20!%3D%3D%20entry)%20return%5Cn%20%20entry.listeners.delete(onError)%5Cn%20%20entry.refs%20-%3D%201%5Cn%20%20if%20(entry.refs%20%3E%200)%20return%5Cn%20%20registry.registrations.delete(name)%5Cn%20%20entry.controller.abort()%5Cn%7D%5Cn%5Cnexport%20function%20createSdkPageTools()%20%7B%5Cn%20%20initializeBuiltinWebMCP()%5Cn%5Cn%20%20const%20context%20%3D%20readContext()%5Cn%20%20if%20(!context)%20throw%20new%20Error('WebMCP%20modelContext%20is%20unavailable')%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20section%20%3D%20registry.section%5Cn%20%20const%20statusToolAdded%20%3D%20ref(false)%5Cn%20%20const%20registrationError%20%3D%20ref%3Cstring%20%7C%20undefined%3E()%5Cn%20%20const%20releases%20%3D%20new%20Map%3Cstring%2C%20()%20%3D%3E%20void%3E()%5Cn%20%20const%20tools%20%3D%20new%20Map%3Cstring%2C%20WebMcpToolDescriptor%3E()%5Cn%5Cn%20%20function%20getErrorMessage(cause%3A%20unknown)%20%7B%5Cn%20%20%20%20return%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%5Cn%20%20function%20removeRegistration(name%3A%20string)%20%7B%5Cn%20%20%20%20releases.get(name)%3F.()%5Cn%20%20%20%20releases.delete(name)%5Cn%20%20%20%20tools.delete(name)%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'get-demo-status')%20statusToolAdded.value%20%3D%20false%5Cn%20%20%7D%5Cn%5Cn%20%20function%20register(descriptor%3A%20WebMcpToolDescriptor%2C%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E)%20%7B%5Cn%20%20%20%20registrationError.value%20%3D%20undefined%5Cn%20%20%20%20const%20release%20%3D%20acquireRegistration(context%2C%20descriptor%2C%20execute%2C%20(cause)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20removeRegistration(descriptor.name)%5Cn%20%20%20%20%20%20registrationError.value%20%3D%20getErrorMessage(cause)%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20releases.set(descriptor.name%2C%20release)%5Cn%20%20%20%20tools.set(descriptor.name%2C%20descriptor)%5Cn%20%20%7D%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get-page-info'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98%E5%92%8C%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20JSON.stringify(%7B%20title%3A%20'WebMCP%20SDK%20Demo'%2C%20section%3A%20section.value%20%7D)%20%7D%5D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'set-page-section'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20section%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'section'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20(args)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(typeof%20args.section%20!%3D%3D%20'string'%20%7C%7C%20!args.section.trim())%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('section%20is%20required')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20section.value%20%3D%20args.section%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E5%B7%B2%E5%88%87%E6%8D%A2%E4%B8%BA%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20context%3A%20()%20%3D%3E%20context%2C%5Cn%20%20%20%20section%2C%5Cn%20%20%20%20statusToolAdded%2C%5Cn%20%20%20%20registrationError%2C%5Cn%20%20%20%20tools%2C%5Cn%20%20%20%20registerStatusTool()%20%7B%5Cn%20%20%20%20%20%20if%20(releases.has('get-demo-status'))%20return%5Cn%20%20%20%20%20%20register(%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'get-demo-status'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%20WebMCP%20SDK%20Demo%20%E7%8A%B6%E6%80%81%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20true%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20unregisterStatusTool()%20%7B%5Cn%20%20%20%20%20%20removeRegistration('get-demo-status')%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20dispose()%20%7B%5Cn%20%20%20%20%20%20for%20(const%20name%20of%20%5B...releases.keys()%5D)%20removeRegistration(name)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:n(v)},u({_:2},[l.value?{name:"vue",fn:s(()=>[t(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=i('<h3 id="示例二-chat-接入" tabindex="-1">示例二：Chat 接入 <a class="header-anchor" href="#示例二-chat-接入" aria-label="Permalink to &quot;示例二：Chat 接入&quot;">​</a></h3><p>这个示例使用 OpenTiny WebMCP SDK，展示页面 WebMCP 的基础接入链路：</p><ol><li>页面提供 <code>get-page-info</code> 和 <code>set-page-section</code> 两个工具；</li><li>点击按钮后动态注册 <code>get-demo-status</code>；</li><li>再次点击后移除动态工具，恢复初始工具列表；</li><li>每次工具变化都触发 <code>toolchange</code>，Chat 中的工具列表同步更新；</li><li>页面展示当前已发现的工具和 Runtime 操作状态。</li></ol>',3)),g(t(n(A),null,null,512),[[m,o.value]]),t(c,null,{default:s(()=>[t(n(D),{title:"Chat 接入 WebMCP",description:"使用 OpenTiny WebMCP SDK，演示工具发现、动态注册、注销和 toolchange 同步。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fbasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20createWebMcpAdapter%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatRuntimeActionErrorPayload%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20createSdkPageTools%20%7D%20from%20'.%2Fsdk-page-tools'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'..%2F..%2Fchat%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20pageTools%20%3D%20createSdkPageTools()%5Cnconst%20webmcpAdapter%20%3D%20createWebMcpAdapter(%7B%5Cn%20%20getContext%3A%20pageTools.context%2C%5Cn%20%20server%3A%20%7B%5Cn%20%20%20%20id%3A%20'page-webmcp'%2C%5Cn%20%20%20%20name%3A%20'%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%2C%5Cn%20%20%20%20description%3A%20'%E5%BD%93%E5%89%8D%20Demo%20%E6%8F%90%E4%BE%9B%E7%9A%84%E9%A1%B5%E9%9D%A2%20WebMCP%20%E5%B7%A5%E5%85%B7'%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20mcp%3A%20%7B%20adapters%3A%20%5BwebmcpAdapter%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20actionStatus%20%3D%20ref('%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E5%B7%B2%E6%8E%A5%E5%85%A5%EF%BC%8C%E7%AD%89%E5%BE%85%20Chat%20%E8%B0%83%E7%94%A8%E3%80%82')%5Cnconst%20section%20%3D%20pageTools.section%5Cnconst%20statusToolAdded%20%3D%20pageTools.statusToolAdded%5Cnconst%20registrationError%20%3D%20pageTools.registrationError%5Cnconst%20pageToolsInChat%20%3D%20computed(()%20%3D%3E%20runtime.composer.mcp%3F.tools.value%5B'page-webmcp'%5D%20%3F%3F%20%5B%5D)%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20pageTools.dispose()%5Cn%20%20void%20webmcpAdapter.close%3F.()%5Cn%7D)%5Cn%5Cnfunction%20handleRuntimeActionError(payload%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionStatus.value%20%3D%20%60%E8%BF%90%E8%A1%8C%E6%97%B6%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Bpayload.action%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22webmcp-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%7B%7B%20section%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22statusToolAdded%20%3F%20pageTools.unregisterStatusTool()%20%3A%20pageTools.registerStatusTool()%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20statusToolAdded%20%3F%20'%E9%87%8D%E7%BD%AE%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%3A%20'%E6%B3%A8%E5%86%8C%E4%B8%80%E4%B8%AA%E6%96%B0%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__status%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%E5%B7%B2%E5%8F%91%E7%8E%B0%20%7B%7B%20pageToolsInChat.length%20%7D%7D%20%E4%B8%AA%E5%B7%A5%E5%85%B7%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20v-if%3D%5C%22registrationError%5C%22%20role%3D%5C%22alert%5C%22%3E%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E6%B3%A8%E5%86%8C%E5%A4%B1%E8%B4%A5%EF%BC%9A%7B%7B%20registrationError%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cul%20class%3D%5C%22webmcp-demo__tools%5C%22%3E%5Cn%20%20%20%20%20%20%3Cli%20v-for%3D%5C%22tool%20in%20pageToolsInChat%5C%22%20%3Akey%3D%5C%22tool.id%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ccode%3E%7B%7B%20tool.name%20%7D%7D%3C%2Fcode%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%7B%7B%20tool.description%20%7C%7C%20'%E6%9A%82%E6%97%A0%E6%8F%8F%E8%BF%B0'%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Fli%3E%5Cn%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%40runtime-action-error%3D%5C%22handleRuntimeActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.webmcp-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__toolbar%20button%20%7B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23d9d9d9)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20padding%3A%206px%2010px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23191919)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__status%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__tools%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(auto-fit%2C%20minmax(220px%2C%201fr))%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin%3A%200%3B%5Cn%20%20padding%3A%200%3B%5Cn%20%20list-style%3A%20none%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__tools%20li%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%204px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%208px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23d9d9d9)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__tools%20code%20%7B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23191919)%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20clamp(420px%2C%2058vh%2C%20520px)%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22sdk-page-tools.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fsdk-page-tools.ts%22%2C%22code%22%3A%22import%20%7B%20initializeBuiltinWebMCP%20%7D%20from%20'%40opentiny%2Fnext-sdk'%5Cnimport%20%7B%20ref%2C%20type%20Ref%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20WebMcpContext%2C%20WebMcpToolDescriptor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20SdkToolContext%20%3D%20WebMcpContext%20%26%20%7B%5Cn%20%20registerTool%3A%20(%5Cn%20%20%20%20definition%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20string%5Cn%20%20%20%20%20%20description%3F%3A%20string%5Cn%20%20%20%20%20%20inputSchema%3F%3A%20unknown%5Cn%20%20%20%20%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20options%3F%3A%20%7B%20signal%3F%3A%20AbortSignal%20%7D%2C%5Cn%20%20)%20%3D%3E%20unknown%5Cn%7D%5Cn%5Cninterface%20SharedRegistration%20%7B%5Cn%20%20controller%3A%20AbortController%5Cn%20%20refs%3A%20number%5Cn%20%20listeners%3A%20Set%3C(cause%3A%20unknown)%20%3D%3E%20void%3E%5Cn%7D%5Cn%5Cninterface%20ContextRegistry%20%7B%5Cn%20%20section%3A%20Ref%3Cstring%3E%5Cn%20%20registrations%3A%20Map%3Cstring%2C%20SharedRegistration%3E%5Cn%7D%5Cn%5Cnconst%20GLOBAL_STATE_KEY%20%3D%20'__opentinyTinyRobotWebMcpSdkDemoState__'%5Cnconst%20globalState%20%3D%20(()%20%3D%3E%20%7B%5Cn%20%20const%20target%20%3D%20globalThis%20as%20typeof%20globalThis%20%26%20%7B%20%5Bkey%3A%20string%5D%3A%20unknown%20%7D%5Cn%20%20const%20existing%20%3D%20target%5BGLOBAL_STATE_KEY%5D%20as%20%7B%20contexts%3A%20WeakMap%3Cobject%2C%20ContextRegistry%3E%20%7D%20%7C%20undefined%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20created%20%3D%20%7B%20contexts%3A%20new%20WeakMap%3Cobject%2C%20ContextRegistry%3E()%20%7D%5Cn%20%20target%5BGLOBAL_STATE_KEY%5D%20%3D%20created%5Cn%20%20return%20created%5Cn%7D)()%5Cn%5Cnfunction%20getContextRegistry(context%3A%20SdkToolContext)%20%7B%5Cn%20%20const%20existing%20%3D%20globalState.contexts.get(context)%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20registry%3A%20ContextRegistry%20%3D%20%7B%5Cn%20%20%20%20section%3A%20ref('overview')%2C%5Cn%20%20%20%20registrations%3A%20new%20Map()%2C%5Cn%20%20%7D%5Cn%20%20globalState.contexts.set(context%2C%20registry)%5Cn%20%20return%20registry%5Cn%7D%5Cn%5Cnfunction%20readContext()%20%7B%5Cn%20%20return%20(document%20as%20Document%20%26%20%7B%20modelContext%3F%3A%20SdkToolContext%20%7D).modelContext%5Cn%7D%5Cn%5Cnfunction%20acquireRegistration(%5Cn%20%20context%3A%20SdkToolContext%2C%5Cn%20%20descriptor%3A%20WebMcpToolDescriptor%2C%5Cn%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20existing%20%3D%20registry.registrations.get(descriptor.name)%5Cn%20%20if%20(existing)%20%7B%5Cn%20%20%20%20existing.refs%20%2B%3D%201%5Cn%20%20%20%20existing.listeners.add(onError)%5Cn%20%20%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20existing%2C%20onError)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20entry%3A%20SharedRegistration%20%3D%20%7B%5Cn%20%20%20%20controller%3A%20new%20AbortController()%2C%5Cn%20%20%20%20refs%3A%201%2C%5Cn%20%20%20%20listeners%3A%20new%20Set(%5BonError%5D)%2C%5Cn%20%20%7D%5Cn%20%20registry.registrations.set(descriptor.name%2C%20entry)%5Cn%5Cn%20%20const%20handleError%20%3D%20(cause%3A%20unknown)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(entry.controller.signal.aborted)%20return%5Cn%20%20%20%20if%20(registry.registrations.get(descriptor.name)%20%3D%3D%3D%20entry)%20registry.registrations.delete(descriptor.name)%5Cn%20%20%20%20entry.listeners.forEach((listener)%20%3D%3E%20listener(cause))%5Cn%20%20%7D%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20registration%20%3D%20context.registerTool(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20name%3A%20descriptor.name%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20descriptor.description%2C%5Cn%20%20%20%20%20%20%20%20inputSchema%3A%20descriptor.inputSchema%2C%5Cn%20%20%20%20%20%20%20%20execute%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20signal%3A%20entry.controller.signal%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20void%20Promise.resolve(registration).catch(handleError)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20handleError(cause)%5Cn%20%20%20%20throw%20cause%5Cn%20%20%7D%5Cn%5Cn%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20entry%2C%20onError)%5Cn%7D%5Cn%5Cnfunction%20releaseRegistration(%5Cn%20%20registry%3A%20ContextRegistry%2C%5Cn%20%20name%3A%20string%2C%5Cn%20%20entry%3A%20SharedRegistration%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20if%20(registry.registrations.get(name)%20!%3D%3D%20entry)%20return%5Cn%20%20entry.listeners.delete(onError)%5Cn%20%20entry.refs%20-%3D%201%5Cn%20%20if%20(entry.refs%20%3E%200)%20return%5Cn%20%20registry.registrations.delete(name)%5Cn%20%20entry.controller.abort()%5Cn%7D%5Cn%5Cnexport%20function%20createSdkPageTools()%20%7B%5Cn%20%20initializeBuiltinWebMCP()%5Cn%5Cn%20%20const%20context%20%3D%20readContext()%5Cn%20%20if%20(!context)%20throw%20new%20Error('WebMCP%20modelContext%20is%20unavailable')%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20section%20%3D%20registry.section%5Cn%20%20const%20statusToolAdded%20%3D%20ref(false)%5Cn%20%20const%20registrationError%20%3D%20ref%3Cstring%20%7C%20undefined%3E()%5Cn%20%20const%20releases%20%3D%20new%20Map%3Cstring%2C%20()%20%3D%3E%20void%3E()%5Cn%20%20const%20tools%20%3D%20new%20Map%3Cstring%2C%20WebMcpToolDescriptor%3E()%5Cn%5Cn%20%20function%20getErrorMessage(cause%3A%20unknown)%20%7B%5Cn%20%20%20%20return%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%5Cn%20%20function%20removeRegistration(name%3A%20string)%20%7B%5Cn%20%20%20%20releases.get(name)%3F.()%5Cn%20%20%20%20releases.delete(name)%5Cn%20%20%20%20tools.delete(name)%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'get-demo-status')%20statusToolAdded.value%20%3D%20false%5Cn%20%20%7D%5Cn%5Cn%20%20function%20register(descriptor%3A%20WebMcpToolDescriptor%2C%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E)%20%7B%5Cn%20%20%20%20registrationError.value%20%3D%20undefined%5Cn%20%20%20%20const%20release%20%3D%20acquireRegistration(context%2C%20descriptor%2C%20execute%2C%20(cause)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20removeRegistration(descriptor.name)%5Cn%20%20%20%20%20%20registrationError.value%20%3D%20getErrorMessage(cause)%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20releases.set(descriptor.name%2C%20release)%5Cn%20%20%20%20tools.set(descriptor.name%2C%20descriptor)%5Cn%20%20%7D%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get-page-info'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98%E5%92%8C%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20JSON.stringify(%7B%20title%3A%20'WebMCP%20SDK%20Demo'%2C%20section%3A%20section.value%20%7D)%20%7D%5D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'set-page-section'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20section%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'section'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20(args)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(typeof%20args.section%20!%3D%3D%20'string'%20%7C%7C%20!args.section.trim())%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('section%20is%20required')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20section.value%20%3D%20args.section%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E5%B7%B2%E5%88%87%E6%8D%A2%E4%B8%BA%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20context%3A%20()%20%3D%3E%20context%2C%5Cn%20%20%20%20section%2C%5Cn%20%20%20%20statusToolAdded%2C%5Cn%20%20%20%20registrationError%2C%5Cn%20%20%20%20tools%2C%5Cn%20%20%20%20registerStatusTool()%20%7B%5Cn%20%20%20%20%20%20if%20(releases.has('get-demo-status'))%20return%5Cn%20%20%20%20%20%20register(%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'get-demo-status'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%20WebMCP%20SDK%20Demo%20%E7%8A%B6%E6%80%81%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20true%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20unregisterStatusTool()%20%7B%5Cn%20%20%20%20%20%20removeRegistration('get-demo-status')%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20dispose()%20%7B%5Cn%20%20%20%20%20%20for%20(const%20name%20of%20%5B...releases.keys()%5D)%20removeRegistration(name)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:n(f)},u({_:2},[C.value?{name:"vue",fn:s(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=i(`<h4 id="实际接入配置" tabindex="-1">实际接入配置 <a class="header-anchor" href="#实际接入配置" aria-label="Permalink to &quot;实际接入配置&quot;">​</a></h4><p>实际接入通常只需要创建 WebMCP Adapter，并将它放入 <code>useChatRuntime</code> 的 <code>mcp.adapters</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> webmcpAdapter</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createWebMcpAdapter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;page-webmcp&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;页面工具&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;当前页面提供的 WebMCP 工具&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> runtime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useChatRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  modelProviders,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mcp: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    adapters: [webmcpAdapter],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>应用侧需要关注的只有三件事：</p><ul><li>在创建 Runtime 前确保 <code>document.modelContext</code> 已完成初始化；</li><li>为页面工具配置稳定且唯一的 Server ID；</li><li>工具注册、权限确认和业务副作用仍由页面应用自己管理。</li></ul><p>示例中的 <code>sdk-page-tools.ts</code> 使用 OpenTiny WebMCP SDK 初始化 Polyfill，并通过 <code>registerTool</code> 注册工具；工具注销通过 <code>AbortController.abort()</code> 完成。实际项目如果已经初始化了 WebMCP Context，也可以省略 <code>getContext</code>，让 Adapter 读取默认的 <code>document.modelContext</code>。</p><h3 id="示例三-webmcp-与外部-mcp-共存" tabindex="-1">示例三：WebMCP 与外部 MCP 共存 <a class="header-anchor" href="#示例三-webmcp-与外部-mcp-共存" aria-label="Permalink to &quot;示例三：WebMCP 与外部 MCP 共存&quot;">​</a></h3><p>当页面工具和外部 MCP 都需要提供给同一个 Chat 时，使用统一的 <code>mcp</code> 配置：</p>`,8)),g(t(n(A),null,null,512),[[m,o.value]]),t(c,null,{default:s(()=>[t(n(D),{title:"WebMCP 与外部 MCP 共存",description:"页面工具通过 adapters 接入，外部 MCP Server 通过 servers 接入。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22combined.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fcombined.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20onBeforeUnmount%20%7D%20from%20'vue'%5Cnimport%20%7B%20createWebMcpAdapter%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20createSdkPageTools%20%7D%20from%20'.%2Fsdk-page-tools'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'..%2F..%2Fchat%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20pageTools%20%3D%20createSdkPageTools()%5Cnconst%20webmcpAdapter%20%3D%20createWebMcpAdapter(%7B%5Cn%20%20getContext%3A%20pageTools.context%2C%5Cn%20%20server%3A%20%7B%20id%3A%20'page-webmcp'%2C%20name%3A%20'%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20externalMcpServers%3A%20ChatMcpServers%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'project-knowledge'%2C%5Cn%20%20%20%20name%3A%20'%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E5%BA%93'%2C%5Cn%20%20%20%20description%3A%20'%E5%A4%96%E9%83%A8%20MCP%20%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E5%BA%93%E3%80%82'%2C%5Cn%20%20%20%20baseUrl%3A%20%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%2Fmcp%2Fproject-knowledge%60%2C%5Cn%20%20%20%20installed%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20mcp%3A%20%7B%5Cn%20%20%20%20servers%3A%20externalMcpServers%2C%5Cn%20%20%20%20adapters%3A%20%5BwebmcpAdapter%5D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20registrationError%20%3D%20pageTools.registrationError%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20pageTools.dispose()%5Cn%20%20void%20webmcpAdapter.close%3F.()%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22webmcp-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__hint%5C%22%3E%E9%A1%B5%E9%9D%A2%20WebMCP%20%E4%B8%8E%E5%A4%96%E9%83%A8%20MCP%20%E4%BD%8D%E4%BA%8E%E5%90%8C%E4%B8%80%E4%B8%AA%20MCP%20%E9%9D%A2%E6%9D%BF%E4%B8%AD%E3%80%82%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20v-if%3D%5C%22registrationError%5C%22%20class%3D%5C%22webmcp-demo__error%5C%22%20role%3D%5C%22alert%5C%22%3E%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E6%B3%A8%E5%86%8C%E5%A4%B1%E8%B4%A5%EF%BC%9A%7B%7B%20registrationError%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.webmcp-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__error%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-color-danger%2C%20%23c0392b)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20clamp(420px%2C%2058vh%2C%20520px)%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22sdk-page-tools.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fsdk-page-tools.ts%22%2C%22code%22%3A%22import%20%7B%20initializeBuiltinWebMCP%20%7D%20from%20'%40opentiny%2Fnext-sdk'%5Cnimport%20%7B%20ref%2C%20type%20Ref%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20WebMcpContext%2C%20WebMcpToolDescriptor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20SdkToolContext%20%3D%20WebMcpContext%20%26%20%7B%5Cn%20%20registerTool%3A%20(%5Cn%20%20%20%20definition%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20string%5Cn%20%20%20%20%20%20description%3F%3A%20string%5Cn%20%20%20%20%20%20inputSchema%3F%3A%20unknown%5Cn%20%20%20%20%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20options%3F%3A%20%7B%20signal%3F%3A%20AbortSignal%20%7D%2C%5Cn%20%20)%20%3D%3E%20unknown%5Cn%7D%5Cn%5Cninterface%20SharedRegistration%20%7B%5Cn%20%20controller%3A%20AbortController%5Cn%20%20refs%3A%20number%5Cn%20%20listeners%3A%20Set%3C(cause%3A%20unknown)%20%3D%3E%20void%3E%5Cn%7D%5Cn%5Cninterface%20ContextRegistry%20%7B%5Cn%20%20section%3A%20Ref%3Cstring%3E%5Cn%20%20registrations%3A%20Map%3Cstring%2C%20SharedRegistration%3E%5Cn%7D%5Cn%5Cnconst%20GLOBAL_STATE_KEY%20%3D%20'__opentinyTinyRobotWebMcpSdkDemoState__'%5Cnconst%20globalState%20%3D%20(()%20%3D%3E%20%7B%5Cn%20%20const%20target%20%3D%20globalThis%20as%20typeof%20globalThis%20%26%20%7B%20%5Bkey%3A%20string%5D%3A%20unknown%20%7D%5Cn%20%20const%20existing%20%3D%20target%5BGLOBAL_STATE_KEY%5D%20as%20%7B%20contexts%3A%20WeakMap%3Cobject%2C%20ContextRegistry%3E%20%7D%20%7C%20undefined%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20created%20%3D%20%7B%20contexts%3A%20new%20WeakMap%3Cobject%2C%20ContextRegistry%3E()%20%7D%5Cn%20%20target%5BGLOBAL_STATE_KEY%5D%20%3D%20created%5Cn%20%20return%20created%5Cn%7D)()%5Cn%5Cnfunction%20getContextRegistry(context%3A%20SdkToolContext)%20%7B%5Cn%20%20const%20existing%20%3D%20globalState.contexts.get(context)%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20registry%3A%20ContextRegistry%20%3D%20%7B%5Cn%20%20%20%20section%3A%20ref('overview')%2C%5Cn%20%20%20%20registrations%3A%20new%20Map()%2C%5Cn%20%20%7D%5Cn%20%20globalState.contexts.set(context%2C%20registry)%5Cn%20%20return%20registry%5Cn%7D%5Cn%5Cnfunction%20readContext()%20%7B%5Cn%20%20return%20(document%20as%20Document%20%26%20%7B%20modelContext%3F%3A%20SdkToolContext%20%7D).modelContext%5Cn%7D%5Cn%5Cnfunction%20acquireRegistration(%5Cn%20%20context%3A%20SdkToolContext%2C%5Cn%20%20descriptor%3A%20WebMcpToolDescriptor%2C%5Cn%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20existing%20%3D%20registry.registrations.get(descriptor.name)%5Cn%20%20if%20(existing)%20%7B%5Cn%20%20%20%20existing.refs%20%2B%3D%201%5Cn%20%20%20%20existing.listeners.add(onError)%5Cn%20%20%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20existing%2C%20onError)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20entry%3A%20SharedRegistration%20%3D%20%7B%5Cn%20%20%20%20controller%3A%20new%20AbortController()%2C%5Cn%20%20%20%20refs%3A%201%2C%5Cn%20%20%20%20listeners%3A%20new%20Set(%5BonError%5D)%2C%5Cn%20%20%7D%5Cn%20%20registry.registrations.set(descriptor.name%2C%20entry)%5Cn%5Cn%20%20const%20handleError%20%3D%20(cause%3A%20unknown)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(entry.controller.signal.aborted)%20return%5Cn%20%20%20%20if%20(registry.registrations.get(descriptor.name)%20%3D%3D%3D%20entry)%20registry.registrations.delete(descriptor.name)%5Cn%20%20%20%20entry.listeners.forEach((listener)%20%3D%3E%20listener(cause))%5Cn%20%20%7D%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20registration%20%3D%20context.registerTool(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20name%3A%20descriptor.name%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20descriptor.description%2C%5Cn%20%20%20%20%20%20%20%20inputSchema%3A%20descriptor.inputSchema%2C%5Cn%20%20%20%20%20%20%20%20execute%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20signal%3A%20entry.controller.signal%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20void%20Promise.resolve(registration).catch(handleError)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20handleError(cause)%5Cn%20%20%20%20throw%20cause%5Cn%20%20%7D%5Cn%5Cn%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20entry%2C%20onError)%5Cn%7D%5Cn%5Cnfunction%20releaseRegistration(%5Cn%20%20registry%3A%20ContextRegistry%2C%5Cn%20%20name%3A%20string%2C%5Cn%20%20entry%3A%20SharedRegistration%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20if%20(registry.registrations.get(name)%20!%3D%3D%20entry)%20return%5Cn%20%20entry.listeners.delete(onError)%5Cn%20%20entry.refs%20-%3D%201%5Cn%20%20if%20(entry.refs%20%3E%200)%20return%5Cn%20%20registry.registrations.delete(name)%5Cn%20%20entry.controller.abort()%5Cn%7D%5Cn%5Cnexport%20function%20createSdkPageTools()%20%7B%5Cn%20%20initializeBuiltinWebMCP()%5Cn%5Cn%20%20const%20context%20%3D%20readContext()%5Cn%20%20if%20(!context)%20throw%20new%20Error('WebMCP%20modelContext%20is%20unavailable')%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20section%20%3D%20registry.section%5Cn%20%20const%20statusToolAdded%20%3D%20ref(false)%5Cn%20%20const%20registrationError%20%3D%20ref%3Cstring%20%7C%20undefined%3E()%5Cn%20%20const%20releases%20%3D%20new%20Map%3Cstring%2C%20()%20%3D%3E%20void%3E()%5Cn%20%20const%20tools%20%3D%20new%20Map%3Cstring%2C%20WebMcpToolDescriptor%3E()%5Cn%5Cn%20%20function%20getErrorMessage(cause%3A%20unknown)%20%7B%5Cn%20%20%20%20return%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%5Cn%20%20function%20removeRegistration(name%3A%20string)%20%7B%5Cn%20%20%20%20releases.get(name)%3F.()%5Cn%20%20%20%20releases.delete(name)%5Cn%20%20%20%20tools.delete(name)%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'get-demo-status')%20statusToolAdded.value%20%3D%20false%5Cn%20%20%7D%5Cn%5Cn%20%20function%20register(descriptor%3A%20WebMcpToolDescriptor%2C%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E)%20%7B%5Cn%20%20%20%20registrationError.value%20%3D%20undefined%5Cn%20%20%20%20const%20release%20%3D%20acquireRegistration(context%2C%20descriptor%2C%20execute%2C%20(cause)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20removeRegistration(descriptor.name)%5Cn%20%20%20%20%20%20registrationError.value%20%3D%20getErrorMessage(cause)%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20releases.set(descriptor.name%2C%20release)%5Cn%20%20%20%20tools.set(descriptor.name%2C%20descriptor)%5Cn%20%20%7D%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get-page-info'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98%E5%92%8C%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20JSON.stringify(%7B%20title%3A%20'WebMCP%20SDK%20Demo'%2C%20section%3A%20section.value%20%7D)%20%7D%5D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'set-page-section'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20section%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'section'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20(args)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(typeof%20args.section%20!%3D%3D%20'string'%20%7C%7C%20!args.section.trim())%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('section%20is%20required')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20section.value%20%3D%20args.section%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E5%B7%B2%E5%88%87%E6%8D%A2%E4%B8%BA%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20context%3A%20()%20%3D%3E%20context%2C%5Cn%20%20%20%20section%2C%5Cn%20%20%20%20statusToolAdded%2C%5Cn%20%20%20%20registrationError%2C%5Cn%20%20%20%20tools%2C%5Cn%20%20%20%20registerStatusTool()%20%7B%5Cn%20%20%20%20%20%20if%20(releases.has('get-demo-status'))%20return%5Cn%20%20%20%20%20%20register(%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'get-demo-status'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%20WebMCP%20SDK%20Demo%20%E7%8A%B6%E6%80%81%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20true%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20unregisterStatusTool()%20%7B%5Cn%20%20%20%20%20%20removeRegistration('get-demo-status')%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20dispose()%20%7B%5Cn%20%20%20%20%20%20for%20(const%20name%20of%20%5B...releases.keys()%5D)%20removeRegistration(name)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:n(k)},u({_:2},[a.value?{name:"vue",fn:s(()=>[t(n(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=i(`<div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> runtime</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useChatRuntime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  modelProviders,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mcp: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    servers: externalMcpServers,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    adapters: [webmcpAdapter],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>其中：</p><ul><li><code>mcp.servers</code> 用于配置外部 MCP Server；</li><li><code>mcp.adapters</code> 用于接入 WebMCP、业务 Adapter 或 SDK Adapter；</li><li>TinyRobot 会把它们合并到同一个 MCP Runtime 和 MCP 面板；</li><li>WebMCP 工具在模型侧通常使用 <code>\${serverId}__\${toolName}</code> 命名空间；名称过长时使用稳定短别名，避免超过模型 API 限制并保持原始工具调用映射。</li></ul><h2 id="接入流程" tabindex="-1">接入流程 <a class="header-anchor" href="#接入流程" aria-label="Permalink to &quot;接入流程&quot;">​</a></h2><p>三个示例都遵循以下接入流程；Kit 示例把“创建 Runtime”替换为创建 Kit 的 <code>useMessage</code> 和 <code>toolPlugin</code> 调用链：</p><table tabindex="0"><thead><tr><th>步骤</th><th>接入操作</th></tr></thead><tbody><tr><td>1. 初始化</td><td>注册页面工具，并确保 <code>document.modelContext</code> 或自定义 Context 已可用。</td></tr><tr><td>2. 创建 Adapter</td><td>使用 <code>createWebMcpAdapter</code> 配置 Server 的 <code>id</code>、<code>name</code> 和 Context。</td></tr><tr><td>3. 创建调用链</td><td>Chat 将 Adapter 放入 <code>useChatRuntime</code> 的 <code>mcp.adapters</code>；Kit 使用 <code>toolPlugin</code> 接入 Adapter。</td></tr><tr><td>4. 发现工具</td><td>TinyRobot 读取页面工具列表，并在 MCP 面板或自定义工具面板中展示。</td></tr><tr><td>5. 同步变化</td><td>工具增删或更新后触发 <code>toolchange</code>，让 Adapter 刷新工具列表。</td></tr><tr><td>6. 执行调用</td><td>Chat 或 Kit 调用工具后，由工具实现完成权限校验和具体逻辑。</td></tr></tbody></table><p>工具发现发生在 Adapter 初始化和后续刷新阶段。业务只需要维护工具注册和 <code>toolchange</code> 通知，不需要自行实现 Adapter 的工具路由。</p><h3 id="动态-mcp-server-注册和事件兼容" tabindex="-1">动态 MCP Server 注册和事件兼容 <a class="header-anchor" href="#动态-mcp-server-注册和事件兼容" aria-label="Permalink to &quot;动态 MCP Server 注册和事件兼容&quot;">​</a></h3><p>Chat 内置 Runtime 提供 <code>registerMcpServer</code> 时，MCP 表单提交会先交给 Runtime 完成连接和工具发现，再通过 <code>mcp-create-server</code> 通知应用已注册的 <code>serverId</code>。应用仍负责权限校验、认证信息补充、配置持久化和服务端策略。</p><p>如果自定义 Runtime 没有提供 <code>registerMcpServer</code>，Chat 会继续直接触发 <code>mcp-create-server</code>，由应用接管连接、错误处理和列表更新。已有通过该事件接入 MCP 的业务可以继续使用；迁移到内置 Runtime 时，应避免重复连接同一个 Server。</p><p>Adapter 的 <code>refreshServer</code> 用于按 Server 刷新。一个 Adapter 如果管理多个 Server，建议实现该方法；否则组合 Adapter 只能退回调用整个 Adapter 的 <code>refresh</code>，可能让其他禁用 Server 的刷新错误影响当前请求。</p><h2 id="页面工具实现建议" tabindex="-1">页面工具实现建议 <a class="header-anchor" href="#页面工具实现建议" aria-label="Permalink to &quot;页面工具实现建议&quot;">​</a></h2><p>页面工具会被模型根据名称、描述和 Schema 选择，因此建议在注册工具时遵循以下约定：</p><table tabindex="0"><thead><tr><th>设计项</th><th>建议</th></tr></thead><tbody><tr><td>工具名称</td><td>使用稳定、能表达动作的英文名称，例如 <code>get-page-info</code>、<code>set-page-section</code>；不要把临时 ID 或用户数据放入名称</td></tr><tr><td>工具描述</td><td>说明工具能做什么、作用范围和重要限制，避免只写“执行操作”</td></tr><tr><td>输入 Schema</td><td>提供 <code>object</code> 类型和明确的 <code>properties</code>、<code>required</code>；字段含义应与业务校验一致</td></tr><tr><td>权限和副作用</td><td>读取工具尽量保持无副作用；修改页面或提交数据前，由应用侧完成权限校验和必要的用户确认</td></tr><tr><td>返回结果</td><td>返回可序列化、能解释执行结果的内容；失败时返回明确错误，不要静默吞掉异常</td></tr><tr><td>动态工具同步</td><td>工具增删或 Schema 变化后触发 <code>toolchange</code>，让 Chat 重新发现工具</td></tr></tbody></table><h2 id="接入注意事项" tabindex="-1">接入注意事项 <a class="header-anchor" href="#接入注意事项" aria-label="Permalink to &quot;接入注意事项&quot;">​</a></h2><p>接入时，重点关注工具初始化、权限控制、生命周期和动态状态同步。</p><h3 id="初始化顺序" tabindex="-1">初始化顺序 <a class="header-anchor" href="#初始化顺序" aria-label="Permalink to &quot;初始化顺序&quot;">​</a></h3><p>建议先完成 WebMCP Context 或 Polyfill 初始化，再创建 Adapter 和 Chat Runtime。这样首次工具发现可以拿到完整列表，避免 Runtime 初始化时工具为空。</p><p>如果 Context 的初始化依赖异步业务数据，应在初始化完成后再挂载 Chat；如果工具列表是在 Runtime 创建后变化，则必须触发 <code>toolchange</code>。</p><h3 id="权限与敏感操作" tabindex="-1">权限与敏感操作 <a class="header-anchor" href="#权限与敏感操作" aria-label="Permalink to &quot;权限与敏感操作&quot;">​</a></h3><p>TinyRobot 只负责转发工具调用，不判断当前用户是否有权执行具体操作。以下逻辑应在工具实现内部处理：</p><ul><li>登录态和资源权限校验；</li><li>删除、提交、发送等敏感操作的用户确认；</li><li>请求参数校验和数据范围限制；</li><li>相关 API 的错误处理和审计记录。</li></ul><p>不要把长期有效的 API Key、Cookie 或 Authorization 直接写入页面工具配置。需要访问受保护资源时，应通过业务已有的服务端鉴权或受控的 API 代理完成。</p><h3 id="生命周期和状态" tabindex="-1">生命周期和状态 <a class="header-anchor" href="#生命周期和状态" aria-label="Permalink to &quot;生命周期和状态&quot;">​</a></h3><p><code>removeServer(id)</code> 会将 Server 设为未安装、禁用，清空工具并停止监听；Server 仍保留在状态列表中，可通过 <code>addServer(id)</code> 重新安装。它不会注销应用侧的页面工具。</p><p><code>removeAdapter(adapter)</code> 会从组合 Adapter 中移除指定实例并调用其 <code>close()</code>。页面卸载时，应用还应注销 SDK 工具（例如调用 <code>AbortController.abort()</code>），再关闭 Adapter。</p><p>如果业务允许用户切换页面、账号或工作区，需要同步更新工具列表和工具执行上下文，并在变化后触发 <code>toolchange</code>，避免 Chat 继续看到旧工具或使用旧业务状态。</p><h3 id="何时使用自定义-tool-source" tabindex="-1">何时使用自定义 Tool Source <a class="header-anchor" href="#何时使用自定义-tool-source" aria-label="Permalink to &quot;何时使用自定义 Tool Source&quot;">​</a></h3><p>只要业务使用 <code>document.modelContext</code>，通常不需要实现 <code>WebMcpToolSource</code>。以下情况才考虑传入自定义 <code>source</code>：</p><ul><li>项目没有 <code>document.modelContext</code>，但已经有一套兼容的工具目录和调用接口；</li><li>需要把多个非浏览器工具源组合成一个 WebMCP Server；</li><li>需要自定义工具发现、调用结果或订阅变化的实现方式。</li></ul><p>自定义 Source 至少需要实现 <code>listTools</code> 和 <code>callTool</code>；如果工具列表会变化，还应实现 <code>subscribe</code>。</p><h2 id="接入检查清单" tabindex="-1">接入检查清单 <a class="header-anchor" href="#接入检查清单" aria-label="Permalink to &quot;接入检查清单&quot;">​</a></h2><ul><li>创建 Chat Runtime 前，确保 <code>document.modelContext</code> 或自定义 Context 已可用；</li><li>WebMCP Server 使用稳定且唯一的 <code>id</code>；</li><li>工具名称、描述和输入 Schema 足够明确；</li><li>工具执行函数包含业务权限校验和错误处理；</li><li>工具列表动态变化后触发 <code>toolchange</code>；</li><li>页面工具与外部 MCP 同时接入时，统一使用 <code>mcp: { servers, adapters }</code>；</li><li>未把长期凭证直接暴露在浏览器配置或工具参数中；</li><li>确认 <code>removeServer</code> 与 <code>removeAdapter</code> 的作用对象不同，并在页面卸载时注销 SDK 工具和关闭 Adapter。</li></ul>`,33))])}}});export{S as __pageData,_ as default};
