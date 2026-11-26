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
`,S=JSON.parse('{"title":"MCP Adapter 与 WebMCP","description":"","frontmatter":{"outline":[1,3],"pageClass":"demo-container-page-bg"},"headers":[],"relativePath":"best-practices/webmcp-chat-integration.md","filePath":"best-practices/webmcp-chat-integration.md"}'),x={name:"best-practices/webmcp-chat-integration.md"},_=Object.assign(x,{setup(T){const a=E();d(async()=>{a.value=(await p(async()=>{const{default:r}=await import("./chunks/combined.D_c0Tx-9.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).default});const C=E();d(async()=>{C.value=(await p(async()=>{const{default:r}=await import("./chunks/basic.BNuLRDlo.js");return{default:r}},__vite__mapDeps([8,1,2,3,4,5,6,7]))).default});const o=y(!0),l=E();return d(async()=>{l.value=(await p(async()=>{const{default:r}=await import("./chunks/kit.BsSeqIP8.js");return{default:r}},__vite__mapDeps([9,1,2,4,6,5]))).default}),(r,e)=>{const c=h("ClientOnly");return B(),b("div",null,[e[3]||(e[3]=i("",25)),g(t(n(A),null,null,512),[[m,o.value]]),t(c,null,{default:s(()=>[t(n(D),{title:"Kit 接入 WebMCP",description:"不依赖 Chat 套件，使用公共 Adapter、组件和 Kit 完成工具发现、启停与模型调用。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22kit.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fkit.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20h%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrBubbleList%2C%20TrMcpExtensionDetail%2C%20TrSender%2C%20type%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20createWebMcpAdapter%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20toolPlugin%2C%20useMessage%2C%20sseStreamToGenerator%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20type%20%7B%20ChatCompletionMessageToolCall%2C%20MessageRequestBody%20%7D%20from%20'%40opentiny%2Ftiny-robot-kit'%5Cnimport%20%7B%20createSdkPageTools%20%7D%20from%20'.%2Fsdk-page-tools'%5Cn%5Cnconst%20pageTools%20%3D%20createSdkPageTools()%5Cnconst%20adapter%20%3D%20createWebMcpAdapter(%7B%5Cn%20%20getContext%3A%20pageTools.context%2C%5Cn%20%20server%3A%20%7B%20id%3A%20'page-webmcp'%2C%20name%3A%20'%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%7D%2C%5Cn%7D)%5Cnconst%20input%20%3D%20ref('')%5Cnconst%20statusToolAdded%20%3D%20pageTools.statusToolAdded%5Cnconst%20registrationError%20%3D%20pageTools.registrationError%5Cnconst%20pageServer%20%3D%20computed(()%20%3D%3E%20adapter.runtime.servers.value.find((server)%20%3D%3E%20server.id%20%3D%3D%3D%20'page-webmcp'))%5Cnconst%20pageToolsInKit%20%3D%20computed(()%20%3D%3E%20adapter.runtime.tools.value%5B'page-webmcp'%5D%20%3F%3F%20%5B%5D)%5Cnconst%20error%20%3D%20ref('')%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20pageTools.dispose()%5Cn%20%20void%20adapter.close%3F.()%5Cn%7D)%5Cn%5Cnconst%20message%20%3D%20useMessage(%7B%5Cn%20%20responseProvider%3A%20async%20(requestBody%3A%20MessageRequestBody%2C%20abortSignal)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20response%20%3D%20await%20fetch(%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%2Fchat%2Fcompletions%60%2C%20%7B%5Cn%20%20%20%20%20%20method%3A%20'POST'%2C%5Cn%20%20%20%20%20%20headers%3A%20%7B%20'Content-Type'%3A%20'application%2Fjson'%20%7D%2C%5Cn%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20...requestBody%2C%20stream%3A%20true%20%7D)%2C%5Cn%20%20%20%20%20%20signal%3A%20abortSignal%2C%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20if%20(!response.ok)%20throw%20new%20Error(%60HTTP%20%24%7Bresponse.status%7D%3A%20%24%7Bresponse.statusText%7D%60)%5Cn%20%20%20%20return%20sseStreamToGenerator(response%2C%20%7B%20signal%3A%20abortSignal%20%7D)%5Cn%20%20%7D%2C%5Cn%20%20plugins%3A%20%5B%5Cn%20%20%20%20toolPlugin(%7B%5Cn%20%20%20%20%20%20getTools%3A%20async%20()%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20await%20adapter.refresh%3F.()%5Cn%20%20%20%20%20%20%20%20const%20server%20%3D%20adapter.runtime.servers.value%5B0%5D%5Cn%20%20%20%20%20%20%20%20const%20tools%20%3D%20pageToolsInKit.value.filter((tool)%20%3D%3E%20tool.enabled)%5Cn%20%20%20%20%20%20%20%20if%20(!server%3F.enabled)%20return%20%5B%5D%5Cn%20%20%20%20%20%20%20%20const%20definitions%20%3D%20await%20adapter.listTools(%5B'page-webmcp'%5D%2C%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20'page-webmcp'%3A%20tools.map((tool)%20%3D%3E%20tool.id)%2C%5Cn%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%20%20return%20definitions.map((tool)%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20type%3A%20'function'%20as%20const%2C%5Cn%20%20%20%20%20%20%20%20%20%20function%3A%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20name%3A%20tool.name%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20description%3A%20tool.description%20%3F%3F%20''%2C%5Cn%20%20%20%20%20%20%20%20%20%20%20%20parameters%3A%20tool.inputSchema%20%3F%3F%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D))%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20callTool%3A%20async%20(toolCall%3A%20ChatCompletionMessageToolCall)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20%20%20const%20name%20%3D%20toolCall.function%3F.name%20%3F%3F%20''%5Cn%20%20%20%20%20%20%20%20const%20definition%20%3D%20(%5Cn%20%20%20%20%20%20%20%20%20%20await%20adapter.listTools(%5B'page-webmcp'%5D%2C%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20%20%20'page-webmcp'%3A%20pageToolsInKit.value.filter((tool)%20%3D%3E%20tool.enabled).map((tool)%20%3D%3E%20tool.id)%2C%5Cn%20%20%20%20%20%20%20%20%20%20%7D)%5Cn%20%20%20%20%20%20%20%20).find((tool)%20%3D%3E%20tool.name%20%3D%3D%3D%20name)%5Cn%20%20%20%20%20%20%20%20if%20(!definition)%20throw%20new%20Error(%60Tool%20is%20not%20enabled%3A%20%24%7Bname%7D%60)%5Cn%20%20%20%20%20%20%20%20const%20args%20%3D%20JSON.parse(toolCall.function%3F.arguments%20%7C%7C%20'%7B%7D')%20as%20Record%3Cstring%2C%20unknown%3E%5Cn%20%20%20%20%20%20%20%20return%20adapter.callTool(definition.serverId%2C%20definition.originalName%2C%20args)%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20%5D%2C%5Cn%7D)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%2C%20avatar%3A%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%20%7D%2C%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%2C%20avatar%3A%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'28px'%20%7D%20%7D)%20%7D%2C%5Cn%7D%5Cn%5Cnasync%20function%20handleSubmit(text%3A%20string)%20%7B%5Cn%20%20if%20(!text.trim())%20return%5Cn%20%20error.value%20%3D%20''%5Cn%20%20input.value%20%3D%20''%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20message.sendMessage(text)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20error.value%20%3D%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnasync%20function%20handleServerToggle()%20%7B%5Cn%20%20const%20server%20%3D%20pageServer.value%5Cn%20%20if%20(!server%20%7C%7C%20server.loading)%20return%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20adapter.runtime.setServerEnabled(server.id%2C%20!server.enabled)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20error.value%20%3D%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnasync%20function%20handleToolToggle(%7B%20toolId%2C%20enabled%20%7D%3A%20%7B%20toolId%3A%20string%3B%20enabled%3A%20boolean%20%7D)%20%7B%5Cn%20%20try%20%7B%5Cn%20%20%20%20await%20adapter.runtime.setToolEnabled('page-webmcp'%2C%20toolId%2C%20enabled)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20error.value%20%3D%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22webmcp-kit-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-kit-demo__tools%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrMcpExtensionDetail%5Cn%20%20%20%20%20%20%20%20id%3D%5C%22page-webmcp%5C%22%5Cn%20%20%20%20%20%20%20%20name%3D%5C%22%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%5C%22%5Cn%20%20%20%20%20%20%20%20description%3D%5C%22%E7%94%B1%20OpenTiny%20WebMCP%20SDK%20%E6%B3%A8%E5%86%8C%E7%9A%84%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%5C%22%5Cn%20%20%20%20%20%20%20%20%3Atools%3D%5C%22pageToolsInKit%5C%22%5Cn%20%20%20%20%20%20%20%20%40tool-toggle%3D%5C%22handleToolToggle%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3Cbutton%20type%3D%5C%22button%5C%22%20%3Adisabled%3D%5C%22!pageServer%20%7C%7C%20pageServer.loading%5C%22%20%40click%3D%5C%22handleServerToggle%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20pageServer%3F.enabled%20%3F%20'%E7%A6%81%E7%94%A8%E9%A1%B5%E9%9D%A2%20MCP%20Server'%20%3A%20'%E5%90%AF%E7%94%A8%E9%A1%B5%E9%9D%A2%20MCP%20Server'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22statusToolAdded%20%3F%20pageTools.unregisterStatusTool()%20%3A%20pageTools.registerStatusTool()%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20statusToolAdded%20%3F%20'%E6%B3%A8%E9%94%80%E5%8A%A8%E6%80%81%E5%B7%A5%E5%85%B7'%20%3A%20'%E6%B3%A8%E5%86%8C%E5%8A%A8%E6%80%81%E5%B7%A5%E5%85%B7'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%20%20%3Cp%20v-if%3D%5C%22registrationError%5C%22%20role%3D%5C%22alert%5C%22%3E%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E6%B3%A8%E5%86%8C%E5%A4%B1%E8%B4%A5%EF%BC%9A%7B%7B%20registrationError%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%20%20%3Cp%20v-if%3D%5C%22error%5C%22%20role%3D%5C%22alert%5C%22%3E%7B%7B%20error%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-kit-demo__messages%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrBubbleList%20%3Amessages%3D%5C%22message.messages.value%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3CTrSender%5Cn%20%20%20%20%20%20%20%20v-model%3D%5C%22input%5C%22%5Cn%20%20%20%20%20%20%20%20%3Aloading%3D%5C%22message.isProcessing.value%5C%22%5Cn%20%20%20%20%20%20%20%20placeholder%3D%5C%22%E8%AE%A9%E6%A8%A1%E5%9E%8B%E8%AF%BB%E5%8F%96%E6%88%96%E5%88%87%E6%8D%A2%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%5C%22%5Cn%20%20%20%20%20%20%20%20%40submit%3D%5C%22handleSubmit%5C%22%5Cn%20%20%20%20%20%20%20%20%40cancel%3D%5C%22message.abortRequest%5C%22%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.webmcp-kit-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20minmax(240px%2C%20320px)%20minmax(0%2C%201fr)%3B%5Cn%20%20gap%3A%2016px%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__messages%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20min-height%3A%20520px%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__messages%20%3Adeep(.tr-bubble-list)%20%7B%5Cn%20%20flex%3A%201%3B%5Cn%20%20min-height%3A%200%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__tools%20button%20%7B%5Cn%20%20margin-top%3A%2012px%3B%5Cn%7D%5Cn%5Cn.webmcp-kit-demo__tools%20p%20%7B%5Cn%20%20color%3A%20%23c0392b%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22sdk-page-tools.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fsdk-page-tools.ts%22%2C%22code%22%3A%22import%20%7B%20initializeBuiltinWebMCP%20%7D%20from%20'%40opentiny%2Fnext-sdk'%5Cnimport%20%7B%20ref%2C%20type%20Ref%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20WebMcpContext%2C%20WebMcpToolDescriptor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20SdkToolContext%20%3D%20WebMcpContext%20%26%20%7B%5Cn%20%20registerTool%3A%20(%5Cn%20%20%20%20definition%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20string%5Cn%20%20%20%20%20%20description%3F%3A%20string%5Cn%20%20%20%20%20%20inputSchema%3F%3A%20unknown%5Cn%20%20%20%20%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20options%3F%3A%20%7B%20signal%3F%3A%20AbortSignal%20%7D%2C%5Cn%20%20)%20%3D%3E%20unknown%5Cn%7D%5Cn%5Cninterface%20SharedRegistration%20%7B%5Cn%20%20controller%3A%20AbortController%5Cn%20%20refs%3A%20number%5Cn%20%20listeners%3A%20Set%3C(cause%3A%20unknown)%20%3D%3E%20void%3E%5Cn%7D%5Cn%5Cninterface%20ContextRegistry%20%7B%5Cn%20%20section%3A%20Ref%3Cstring%3E%5Cn%20%20registrations%3A%20Map%3Cstring%2C%20SharedRegistration%3E%5Cn%7D%5Cn%5Cnconst%20GLOBAL_STATE_KEY%20%3D%20'__opentinyTinyRobotWebMcpSdkDemoState__'%5Cnconst%20globalState%20%3D%20(()%20%3D%3E%20%7B%5Cn%20%20const%20target%20%3D%20globalThis%20as%20typeof%20globalThis%20%26%20%7B%20%5Bkey%3A%20string%5D%3A%20unknown%20%7D%5Cn%20%20const%20existing%20%3D%20target%5BGLOBAL_STATE_KEY%5D%20as%20%7B%20contexts%3A%20WeakMap%3Cobject%2C%20ContextRegistry%3E%20%7D%20%7C%20undefined%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20created%20%3D%20%7B%20contexts%3A%20new%20WeakMap%3Cobject%2C%20ContextRegistry%3E()%20%7D%5Cn%20%20target%5BGLOBAL_STATE_KEY%5D%20%3D%20created%5Cn%20%20return%20created%5Cn%7D)()%5Cn%5Cnfunction%20getContextRegistry(context%3A%20SdkToolContext)%20%7B%5Cn%20%20const%20existing%20%3D%20globalState.contexts.get(context)%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20registry%3A%20ContextRegistry%20%3D%20%7B%5Cn%20%20%20%20section%3A%20ref('overview')%2C%5Cn%20%20%20%20registrations%3A%20new%20Map()%2C%5Cn%20%20%7D%5Cn%20%20globalState.contexts.set(context%2C%20registry)%5Cn%20%20return%20registry%5Cn%7D%5Cn%5Cnfunction%20readContext()%20%7B%5Cn%20%20return%20(document%20as%20Document%20%26%20%7B%20modelContext%3F%3A%20SdkToolContext%20%7D).modelContext%5Cn%7D%5Cn%5Cnfunction%20acquireRegistration(%5Cn%20%20context%3A%20SdkToolContext%2C%5Cn%20%20descriptor%3A%20WebMcpToolDescriptor%2C%5Cn%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20existing%20%3D%20registry.registrations.get(descriptor.name)%5Cn%20%20if%20(existing)%20%7B%5Cn%20%20%20%20existing.refs%20%2B%3D%201%5Cn%20%20%20%20existing.listeners.add(onError)%5Cn%20%20%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20existing%2C%20onError)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20entry%3A%20SharedRegistration%20%3D%20%7B%5Cn%20%20%20%20controller%3A%20new%20AbortController()%2C%5Cn%20%20%20%20refs%3A%201%2C%5Cn%20%20%20%20listeners%3A%20new%20Set(%5BonError%5D)%2C%5Cn%20%20%7D%5Cn%20%20registry.registrations.set(descriptor.name%2C%20entry)%5Cn%5Cn%20%20const%20handleError%20%3D%20(cause%3A%20unknown)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(entry.controller.signal.aborted)%20return%5Cn%20%20%20%20if%20(registry.registrations.get(descriptor.name)%20%3D%3D%3D%20entry)%20registry.registrations.delete(descriptor.name)%5Cn%20%20%20%20entry.listeners.forEach((listener)%20%3D%3E%20listener(cause))%5Cn%20%20%7D%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20registration%20%3D%20context.registerTool(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20name%3A%20descriptor.name%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20descriptor.description%2C%5Cn%20%20%20%20%20%20%20%20inputSchema%3A%20descriptor.inputSchema%2C%5Cn%20%20%20%20%20%20%20%20execute%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20signal%3A%20entry.controller.signal%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20void%20Promise.resolve(registration).catch(handleError)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20handleError(cause)%5Cn%20%20%20%20throw%20cause%5Cn%20%20%7D%5Cn%5Cn%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20entry%2C%20onError)%5Cn%7D%5Cn%5Cnfunction%20releaseRegistration(%5Cn%20%20registry%3A%20ContextRegistry%2C%5Cn%20%20name%3A%20string%2C%5Cn%20%20entry%3A%20SharedRegistration%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20if%20(registry.registrations.get(name)%20!%3D%3D%20entry)%20return%5Cn%20%20entry.listeners.delete(onError)%5Cn%20%20entry.refs%20-%3D%201%5Cn%20%20if%20(entry.refs%20%3E%200)%20return%5Cn%20%20registry.registrations.delete(name)%5Cn%20%20entry.controller.abort()%5Cn%7D%5Cn%5Cnexport%20function%20createSdkPageTools()%20%7B%5Cn%20%20initializeBuiltinWebMCP()%5Cn%5Cn%20%20const%20context%20%3D%20readContext()%5Cn%20%20if%20(!context)%20throw%20new%20Error('WebMCP%20modelContext%20is%20unavailable')%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20section%20%3D%20registry.section%5Cn%20%20const%20statusToolAdded%20%3D%20ref(false)%5Cn%20%20const%20registrationError%20%3D%20ref%3Cstring%20%7C%20undefined%3E()%5Cn%20%20const%20releases%20%3D%20new%20Map%3Cstring%2C%20()%20%3D%3E%20void%3E()%5Cn%20%20const%20tools%20%3D%20new%20Map%3Cstring%2C%20WebMcpToolDescriptor%3E()%5Cn%5Cn%20%20function%20getErrorMessage(cause%3A%20unknown)%20%7B%5Cn%20%20%20%20return%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%5Cn%20%20function%20removeRegistration(name%3A%20string)%20%7B%5Cn%20%20%20%20releases.get(name)%3F.()%5Cn%20%20%20%20releases.delete(name)%5Cn%20%20%20%20tools.delete(name)%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'get-demo-status')%20statusToolAdded.value%20%3D%20false%5Cn%20%20%7D%5Cn%5Cn%20%20function%20register(descriptor%3A%20WebMcpToolDescriptor%2C%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E)%20%7B%5Cn%20%20%20%20registrationError.value%20%3D%20undefined%5Cn%20%20%20%20const%20release%20%3D%20acquireRegistration(context%2C%20descriptor%2C%20execute%2C%20(cause)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20removeRegistration(descriptor.name)%5Cn%20%20%20%20%20%20registrationError.value%20%3D%20getErrorMessage(cause)%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20releases.set(descriptor.name%2C%20release)%5Cn%20%20%20%20tools.set(descriptor.name%2C%20descriptor)%5Cn%20%20%7D%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get-page-info'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98%E5%92%8C%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20JSON.stringify(%7B%20title%3A%20'WebMCP%20SDK%20Demo'%2C%20section%3A%20section.value%20%7D)%20%7D%5D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'set-page-section'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20section%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'section'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20(args)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(typeof%20args.section%20!%3D%3D%20'string'%20%7C%7C%20!args.section.trim())%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('section%20is%20required')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20section.value%20%3D%20args.section%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E5%B7%B2%E5%88%87%E6%8D%A2%E4%B8%BA%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20context%3A%20()%20%3D%3E%20context%2C%5Cn%20%20%20%20section%2C%5Cn%20%20%20%20statusToolAdded%2C%5Cn%20%20%20%20registrationError%2C%5Cn%20%20%20%20tools%2C%5Cn%20%20%20%20registerStatusTool()%20%7B%5Cn%20%20%20%20%20%20if%20(releases.has('get-demo-status'))%20return%5Cn%20%20%20%20%20%20register(%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'get-demo-status'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%20WebMCP%20SDK%20Demo%20%E7%8A%B6%E6%80%81%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20true%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20unregisterStatusTool()%20%7B%5Cn%20%20%20%20%20%20removeRegistration('get-demo-status')%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20dispose()%20%7B%5Cn%20%20%20%20%20%20for%20(const%20name%20of%20%5B...releases.keys()%5D)%20removeRegistration(name)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:n(v)},u({_:2},[l.value?{name:"vue",fn:s(()=>[t(n(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=i("",3)),g(t(n(A),null,null,512),[[m,o.value]]),t(c,null,{default:s(()=>[t(n(D),{title:"Chat 接入 WebMCP",description:"使用 OpenTiny WebMCP SDK，演示工具发现、动态注册、注销和 toolchange 同步。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22basic.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fbasic.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20computed%2C%20onBeforeUnmount%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20createWebMcpAdapter%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatRuntimeActionErrorPayload%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20createSdkPageTools%20%7D%20from%20'.%2Fsdk-page-tools'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'..%2F..%2Fchat%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20pageTools%20%3D%20createSdkPageTools()%5Cnconst%20webmcpAdapter%20%3D%20createWebMcpAdapter(%7B%5Cn%20%20getContext%3A%20pageTools.context%2C%5Cn%20%20server%3A%20%7B%5Cn%20%20%20%20id%3A%20'page-webmcp'%2C%5Cn%20%20%20%20name%3A%20'%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%2C%5Cn%20%20%20%20description%3A%20'%E5%BD%93%E5%89%8D%20Demo%20%E6%8F%90%E4%BE%9B%E7%9A%84%E9%A1%B5%E9%9D%A2%20WebMCP%20%E5%B7%A5%E5%85%B7'%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20mcp%3A%20%7B%20adapters%3A%20%5BwebmcpAdapter%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20actionStatus%20%3D%20ref('%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E5%B7%B2%E6%8E%A5%E5%85%A5%EF%BC%8C%E7%AD%89%E5%BE%85%20Chat%20%E8%B0%83%E7%94%A8%E3%80%82')%5Cnconst%20section%20%3D%20pageTools.section%5Cnconst%20statusToolAdded%20%3D%20pageTools.statusToolAdded%5Cnconst%20registrationError%20%3D%20pageTools.registrationError%5Cnconst%20pageToolsInChat%20%3D%20computed(()%20%3D%3E%20runtime.composer.mcp%3F.tools.value%5B'page-webmcp'%5D%20%3F%3F%20%5B%5D)%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20pageTools.dispose()%5Cn%20%20void%20webmcpAdapter.close%3F.()%5Cn%7D)%5Cn%5Cnfunction%20handleRuntimeActionError(payload%3A%20ChatRuntimeActionErrorPayload)%20%7B%5Cn%20%20actionStatus.value%20%3D%20%60%E8%BF%90%E8%A1%8C%E6%97%B6%E6%93%8D%E4%BD%9C%E5%A4%B1%E8%B4%A5%EF%BC%9A%24%7Bpayload.action%7D%60%5Cn%7D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22webmcp-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%7B%7B%20section%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cbutton%5Cn%20%20%20%20%20%20%20%20type%3D%5C%22button%5C%22%5Cn%20%20%20%20%20%20%20%20%40click%3D%5C%22statusToolAdded%20%3F%20pageTools.unregisterStatusTool()%20%3A%20pageTools.registerStatusTool()%5C%22%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%7B%7B%20statusToolAdded%20%3F%20'%E9%87%8D%E7%BD%AE%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%3A%20'%E6%B3%A8%E5%86%8C%E4%B8%80%E4%B8%AA%E6%96%B0%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%7D%7D%5Cn%20%20%20%20%20%20%3C%2Fbutton%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__status%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%7B%7B%20actionStatus%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%3E%E5%B7%B2%E5%8F%91%E7%8E%B0%20%7B%7B%20pageToolsInChat.length%20%7D%7D%20%E4%B8%AA%E5%B7%A5%E5%85%B7%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3Cspan%20v-if%3D%5C%22registrationError%5C%22%20role%3D%5C%22alert%5C%22%3E%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E6%B3%A8%E5%86%8C%E5%A4%B1%E8%B4%A5%EF%BC%9A%7B%7B%20registrationError%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cul%20class%3D%5C%22webmcp-demo__tools%5C%22%3E%5Cn%20%20%20%20%20%20%3Cli%20v-for%3D%5C%22tool%20in%20pageToolsInChat%5C%22%20%3Akey%3D%5C%22tool.id%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ccode%3E%7B%7B%20tool.name%20%7D%7D%3C%2Fcode%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%7B%7B%20tool.description%20%7C%7C%20'%E6%9A%82%E6%97%A0%E6%8F%8F%E8%BF%B0'%20%7D%7D%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%3C%2Fli%3E%5Cn%20%20%20%20%3C%2Ful%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%40runtime-action-error%3D%5C%22handleRuntimeActionError%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.webmcp-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__toolbar%20button%20%7B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23d9d9d9)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20padding%3A%206px%2010px%3B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23191919)%3B%5Cn%20%20background%3A%20var(--tr-container-bg-default%2C%20%23fff)%3B%5Cn%20%20cursor%3A%20pointer%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__status%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20justify-content%3A%20space-between%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__tools%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20grid-template-columns%3A%20repeat(auto-fit%2C%20minmax(220px%2C%201fr))%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20margin%3A%200%3B%5Cn%20%20padding%3A%200%3B%5Cn%20%20list-style%3A%20none%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__tools%20li%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%204px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%20%20padding%3A%208px%2010px%3B%5Cn%20%20border%3A%201px%20solid%20var(--tr-border-color-default%2C%20%23d9d9d9)%3B%5Cn%20%20border-radius%3A%206px%3B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2012px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__tools%20code%20%7B%5Cn%20%20color%3A%20var(--tr-text-primary%2C%20%23191919)%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20clamp(420px%2C%2058vh%2C%20520px)%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22sdk-page-tools.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fsdk-page-tools.ts%22%2C%22code%22%3A%22import%20%7B%20initializeBuiltinWebMCP%20%7D%20from%20'%40opentiny%2Fnext-sdk'%5Cnimport%20%7B%20ref%2C%20type%20Ref%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20WebMcpContext%2C%20WebMcpToolDescriptor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20SdkToolContext%20%3D%20WebMcpContext%20%26%20%7B%5Cn%20%20registerTool%3A%20(%5Cn%20%20%20%20definition%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20string%5Cn%20%20%20%20%20%20description%3F%3A%20string%5Cn%20%20%20%20%20%20inputSchema%3F%3A%20unknown%5Cn%20%20%20%20%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20options%3F%3A%20%7B%20signal%3F%3A%20AbortSignal%20%7D%2C%5Cn%20%20)%20%3D%3E%20unknown%5Cn%7D%5Cn%5Cninterface%20SharedRegistration%20%7B%5Cn%20%20controller%3A%20AbortController%5Cn%20%20refs%3A%20number%5Cn%20%20listeners%3A%20Set%3C(cause%3A%20unknown)%20%3D%3E%20void%3E%5Cn%7D%5Cn%5Cninterface%20ContextRegistry%20%7B%5Cn%20%20section%3A%20Ref%3Cstring%3E%5Cn%20%20registrations%3A%20Map%3Cstring%2C%20SharedRegistration%3E%5Cn%7D%5Cn%5Cnconst%20GLOBAL_STATE_KEY%20%3D%20'__opentinyTinyRobotWebMcpSdkDemoState__'%5Cnconst%20globalState%20%3D%20(()%20%3D%3E%20%7B%5Cn%20%20const%20target%20%3D%20globalThis%20as%20typeof%20globalThis%20%26%20%7B%20%5Bkey%3A%20string%5D%3A%20unknown%20%7D%5Cn%20%20const%20existing%20%3D%20target%5BGLOBAL_STATE_KEY%5D%20as%20%7B%20contexts%3A%20WeakMap%3Cobject%2C%20ContextRegistry%3E%20%7D%20%7C%20undefined%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20created%20%3D%20%7B%20contexts%3A%20new%20WeakMap%3Cobject%2C%20ContextRegistry%3E()%20%7D%5Cn%20%20target%5BGLOBAL_STATE_KEY%5D%20%3D%20created%5Cn%20%20return%20created%5Cn%7D)()%5Cn%5Cnfunction%20getContextRegistry(context%3A%20SdkToolContext)%20%7B%5Cn%20%20const%20existing%20%3D%20globalState.contexts.get(context)%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20registry%3A%20ContextRegistry%20%3D%20%7B%5Cn%20%20%20%20section%3A%20ref('overview')%2C%5Cn%20%20%20%20registrations%3A%20new%20Map()%2C%5Cn%20%20%7D%5Cn%20%20globalState.contexts.set(context%2C%20registry)%5Cn%20%20return%20registry%5Cn%7D%5Cn%5Cnfunction%20readContext()%20%7B%5Cn%20%20return%20(document%20as%20Document%20%26%20%7B%20modelContext%3F%3A%20SdkToolContext%20%7D).modelContext%5Cn%7D%5Cn%5Cnfunction%20acquireRegistration(%5Cn%20%20context%3A%20SdkToolContext%2C%5Cn%20%20descriptor%3A%20WebMcpToolDescriptor%2C%5Cn%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20existing%20%3D%20registry.registrations.get(descriptor.name)%5Cn%20%20if%20(existing)%20%7B%5Cn%20%20%20%20existing.refs%20%2B%3D%201%5Cn%20%20%20%20existing.listeners.add(onError)%5Cn%20%20%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20existing%2C%20onError)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20entry%3A%20SharedRegistration%20%3D%20%7B%5Cn%20%20%20%20controller%3A%20new%20AbortController()%2C%5Cn%20%20%20%20refs%3A%201%2C%5Cn%20%20%20%20listeners%3A%20new%20Set(%5BonError%5D)%2C%5Cn%20%20%7D%5Cn%20%20registry.registrations.set(descriptor.name%2C%20entry)%5Cn%5Cn%20%20const%20handleError%20%3D%20(cause%3A%20unknown)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(entry.controller.signal.aborted)%20return%5Cn%20%20%20%20if%20(registry.registrations.get(descriptor.name)%20%3D%3D%3D%20entry)%20registry.registrations.delete(descriptor.name)%5Cn%20%20%20%20entry.listeners.forEach((listener)%20%3D%3E%20listener(cause))%5Cn%20%20%7D%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20registration%20%3D%20context.registerTool(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20name%3A%20descriptor.name%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20descriptor.description%2C%5Cn%20%20%20%20%20%20%20%20inputSchema%3A%20descriptor.inputSchema%2C%5Cn%20%20%20%20%20%20%20%20execute%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20signal%3A%20entry.controller.signal%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20void%20Promise.resolve(registration).catch(handleError)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20handleError(cause)%5Cn%20%20%20%20throw%20cause%5Cn%20%20%7D%5Cn%5Cn%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20entry%2C%20onError)%5Cn%7D%5Cn%5Cnfunction%20releaseRegistration(%5Cn%20%20registry%3A%20ContextRegistry%2C%5Cn%20%20name%3A%20string%2C%5Cn%20%20entry%3A%20SharedRegistration%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20if%20(registry.registrations.get(name)%20!%3D%3D%20entry)%20return%5Cn%20%20entry.listeners.delete(onError)%5Cn%20%20entry.refs%20-%3D%201%5Cn%20%20if%20(entry.refs%20%3E%200)%20return%5Cn%20%20registry.registrations.delete(name)%5Cn%20%20entry.controller.abort()%5Cn%7D%5Cn%5Cnexport%20function%20createSdkPageTools()%20%7B%5Cn%20%20initializeBuiltinWebMCP()%5Cn%5Cn%20%20const%20context%20%3D%20readContext()%5Cn%20%20if%20(!context)%20throw%20new%20Error('WebMCP%20modelContext%20is%20unavailable')%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20section%20%3D%20registry.section%5Cn%20%20const%20statusToolAdded%20%3D%20ref(false)%5Cn%20%20const%20registrationError%20%3D%20ref%3Cstring%20%7C%20undefined%3E()%5Cn%20%20const%20releases%20%3D%20new%20Map%3Cstring%2C%20()%20%3D%3E%20void%3E()%5Cn%20%20const%20tools%20%3D%20new%20Map%3Cstring%2C%20WebMcpToolDescriptor%3E()%5Cn%5Cn%20%20function%20getErrorMessage(cause%3A%20unknown)%20%7B%5Cn%20%20%20%20return%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%5Cn%20%20function%20removeRegistration(name%3A%20string)%20%7B%5Cn%20%20%20%20releases.get(name)%3F.()%5Cn%20%20%20%20releases.delete(name)%5Cn%20%20%20%20tools.delete(name)%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'get-demo-status')%20statusToolAdded.value%20%3D%20false%5Cn%20%20%7D%5Cn%5Cn%20%20function%20register(descriptor%3A%20WebMcpToolDescriptor%2C%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E)%20%7B%5Cn%20%20%20%20registrationError.value%20%3D%20undefined%5Cn%20%20%20%20const%20release%20%3D%20acquireRegistration(context%2C%20descriptor%2C%20execute%2C%20(cause)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20removeRegistration(descriptor.name)%5Cn%20%20%20%20%20%20registrationError.value%20%3D%20getErrorMessage(cause)%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20releases.set(descriptor.name%2C%20release)%5Cn%20%20%20%20tools.set(descriptor.name%2C%20descriptor)%5Cn%20%20%7D%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get-page-info'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98%E5%92%8C%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20JSON.stringify(%7B%20title%3A%20'WebMCP%20SDK%20Demo'%2C%20section%3A%20section.value%20%7D)%20%7D%5D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'set-page-section'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20section%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'section'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20(args)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(typeof%20args.section%20!%3D%3D%20'string'%20%7C%7C%20!args.section.trim())%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('section%20is%20required')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20section.value%20%3D%20args.section%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E5%B7%B2%E5%88%87%E6%8D%A2%E4%B8%BA%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20context%3A%20()%20%3D%3E%20context%2C%5Cn%20%20%20%20section%2C%5Cn%20%20%20%20statusToolAdded%2C%5Cn%20%20%20%20registrationError%2C%5Cn%20%20%20%20tools%2C%5Cn%20%20%20%20registerStatusTool()%20%7B%5Cn%20%20%20%20%20%20if%20(releases.has('get-demo-status'))%20return%5Cn%20%20%20%20%20%20register(%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'get-demo-status'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%20WebMCP%20SDK%20Demo%20%E7%8A%B6%E6%80%81%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20true%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20unregisterStatusTool()%20%7B%5Cn%20%20%20%20%20%20removeRegistration('get-demo-status')%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20dispose()%20%7B%5Cn%20%20%20%20%20%20for%20(const%20name%20of%20%5B...releases.keys()%5D)%20removeRegistration(name)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:n(f)},u({_:2},[C.value?{name:"vue",fn:s(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=i("",8)),g(t(n(A),null,null,512),[[m,o.value]]),t(c,null,{default:s(()=>[t(n(D),{title:"WebMCP 与外部 MCP 共存",description:"页面工具通过 adapters 接入，外部 MCP Server 通过 servers 接入。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22combined.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fcombined.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20onBeforeUnmount%20%7D%20from%20'vue'%5Cnimport%20%7B%20createWebMcpAdapter%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20TrChat%2C%20useChatRuntime%2C%20type%20ChatMcpServers%20%7D%20from%20'%40opentiny%2Ftiny-robot-chat'%5Cnimport%20'%40opentiny%2Ftiny-robot-chat%2Fdist%2Fstyle.css'%5Cnimport%20%7B%20createSdkPageTools%20%7D%20from%20'.%2Fsdk-page-tools'%5Cnimport%20%7B%20modelProviders%20%7D%20from%20'..%2F..%2Fchat%2Fshared%2FmodelProviders'%5Cn%5Cnconst%20pageTools%20%3D%20createSdkPageTools()%5Cnconst%20webmcpAdapter%20%3D%20createWebMcpAdapter(%7B%5Cn%20%20getContext%3A%20pageTools.context%2C%5Cn%20%20server%3A%20%7B%20id%3A%20'page-webmcp'%2C%20name%3A%20'%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7'%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20externalMcpServers%3A%20ChatMcpServers%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20id%3A%20'project-knowledge'%2C%5Cn%20%20%20%20name%3A%20'%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E5%BA%93'%2C%5Cn%20%20%20%20description%3A%20'%E5%A4%96%E9%83%A8%20MCP%20%E9%A1%B9%E7%9B%AE%E7%9F%A5%E8%AF%86%E5%BA%93%E3%80%82'%2C%5Cn%20%20%20%20baseUrl%3A%20%60%24%7B'%2Ftiny-robot%2Frc%2F'%7Dapi%2Fmcp%2Fproject-knowledge%60%2C%5Cn%20%20%20%20installed%3A%20false%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20runtime%20%3D%20useChatRuntime(%7B%5Cn%20%20modelProviders%2C%5Cn%20%20mcp%3A%20%7B%5Cn%20%20%20%20servers%3A%20externalMcpServers%2C%5Cn%20%20%20%20adapters%3A%20%5BwebmcpAdapter%5D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20registrationError%20%3D%20pageTools.registrationError%5Cn%5CnonBeforeUnmount(()%20%3D%3E%20%7B%5Cn%20%20pageTools.dispose()%5Cn%20%20void%20webmcpAdapter.close%3F.()%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Csection%20class%3D%5C%22webmcp-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__hint%5C%22%3E%E9%A1%B5%E9%9D%A2%20WebMCP%20%E4%B8%8E%E5%A4%96%E9%83%A8%20MCP%20%E4%BD%8D%E4%BA%8E%E5%90%8C%E4%B8%80%E4%B8%AA%20MCP%20%E9%9D%A2%E6%9D%BF%E4%B8%AD%E3%80%82%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20v-if%3D%5C%22registrationError%5C%22%20class%3D%5C%22webmcp-demo__error%5C%22%20role%3D%5C%22alert%5C%22%3E%E9%A1%B5%E9%9D%A2%E5%B7%A5%E5%85%B7%E6%B3%A8%E5%86%8C%E5%A4%B1%E8%B4%A5%EF%BC%9A%7B%7B%20registrationError%20%7D%7D%3C%2Fp%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22webmcp-demo__chat%5C%22%3E%5Cn%20%20%20%20%20%20%3CTrChat%20%3Aruntime%3D%5C%22runtime%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fsection%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.webmcp-demo%20%7B%5Cn%20%20--tr-layout-height%3A%20100%25%3B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-direction%3A%20column%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20min-width%3A%200%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__hint%20%7B%5Cn%20%20color%3A%20var(--tr-text-secondary%2C%20%23575d6c)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__error%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--tr-color-danger%2C%20%23c0392b)%3B%5Cn%20%20font-size%3A%2013px%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%7B%5Cn%20%20width%3A%20100%25%3B%5Cn%20%20height%3A%20clamp(420px%2C%2058vh%2C%20520px)%3B%5Cn%7D%5Cn%5Cn.webmcp-demo__chat%20%3Adeep(.tr-chat-ui)%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20min-height%3A%200%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22sdk-page-tools.ts%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbest-practices%2Fwebmcp-chat-integration%2Fsdk-page-tools.ts%22%2C%22code%22%3A%22import%20%7B%20initializeBuiltinWebMCP%20%7D%20from%20'%40opentiny%2Fnext-sdk'%5Cnimport%20%7B%20ref%2C%20type%20Ref%20%7D%20from%20'vue'%5Cnimport%20type%20%7B%20WebMcpContext%2C%20WebMcpToolDescriptor%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cntype%20SdkToolContext%20%3D%20WebMcpContext%20%26%20%7B%5Cn%20%20registerTool%3A%20(%5Cn%20%20%20%20definition%3A%20%7B%5Cn%20%20%20%20%20%20name%3A%20string%5Cn%20%20%20%20%20%20description%3F%3A%20string%5Cn%20%20%20%20%20%20inputSchema%3F%3A%20unknown%5Cn%20%20%20%20%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20options%3F%3A%20%7B%20signal%3F%3A%20AbortSignal%20%7D%2C%5Cn%20%20)%20%3D%3E%20unknown%5Cn%7D%5Cn%5Cninterface%20SharedRegistration%20%7B%5Cn%20%20controller%3A%20AbortController%5Cn%20%20refs%3A%20number%5Cn%20%20listeners%3A%20Set%3C(cause%3A%20unknown)%20%3D%3E%20void%3E%5Cn%7D%5Cn%5Cninterface%20ContextRegistry%20%7B%5Cn%20%20section%3A%20Ref%3Cstring%3E%5Cn%20%20registrations%3A%20Map%3Cstring%2C%20SharedRegistration%3E%5Cn%7D%5Cn%5Cnconst%20GLOBAL_STATE_KEY%20%3D%20'__opentinyTinyRobotWebMcpSdkDemoState__'%5Cnconst%20globalState%20%3D%20(()%20%3D%3E%20%7B%5Cn%20%20const%20target%20%3D%20globalThis%20as%20typeof%20globalThis%20%26%20%7B%20%5Bkey%3A%20string%5D%3A%20unknown%20%7D%5Cn%20%20const%20existing%20%3D%20target%5BGLOBAL_STATE_KEY%5D%20as%20%7B%20contexts%3A%20WeakMap%3Cobject%2C%20ContextRegistry%3E%20%7D%20%7C%20undefined%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20created%20%3D%20%7B%20contexts%3A%20new%20WeakMap%3Cobject%2C%20ContextRegistry%3E()%20%7D%5Cn%20%20target%5BGLOBAL_STATE_KEY%5D%20%3D%20created%5Cn%20%20return%20created%5Cn%7D)()%5Cn%5Cnfunction%20getContextRegistry(context%3A%20SdkToolContext)%20%7B%5Cn%20%20const%20existing%20%3D%20globalState.contexts.get(context)%5Cn%20%20if%20(existing)%20return%20existing%5Cn%5Cn%20%20const%20registry%3A%20ContextRegistry%20%3D%20%7B%5Cn%20%20%20%20section%3A%20ref('overview')%2C%5Cn%20%20%20%20registrations%3A%20new%20Map()%2C%5Cn%20%20%7D%5Cn%20%20globalState.contexts.set(context%2C%20registry)%5Cn%20%20return%20registry%5Cn%7D%5Cn%5Cnfunction%20readContext()%20%7B%5Cn%20%20return%20(document%20as%20Document%20%26%20%7B%20modelContext%3F%3A%20SdkToolContext%20%7D).modelContext%5Cn%7D%5Cn%5Cnfunction%20acquireRegistration(%5Cn%20%20context%3A%20SdkToolContext%2C%5Cn%20%20descriptor%3A%20WebMcpToolDescriptor%2C%5Cn%20%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20existing%20%3D%20registry.registrations.get(descriptor.name)%5Cn%20%20if%20(existing)%20%7B%5Cn%20%20%20%20existing.refs%20%2B%3D%201%5Cn%20%20%20%20existing.listeners.add(onError)%5Cn%20%20%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20existing%2C%20onError)%5Cn%20%20%7D%5Cn%5Cn%20%20const%20entry%3A%20SharedRegistration%20%3D%20%7B%5Cn%20%20%20%20controller%3A%20new%20AbortController()%2C%5Cn%20%20%20%20refs%3A%201%2C%5Cn%20%20%20%20listeners%3A%20new%20Set(%5BonError%5D)%2C%5Cn%20%20%7D%5Cn%20%20registry.registrations.set(descriptor.name%2C%20entry)%5Cn%5Cn%20%20const%20handleError%20%3D%20(cause%3A%20unknown)%20%3D%3E%20%7B%5Cn%20%20%20%20if%20(entry.controller.signal.aborted)%20return%5Cn%20%20%20%20if%20(registry.registrations.get(descriptor.name)%20%3D%3D%3D%20entry)%20registry.registrations.delete(descriptor.name)%5Cn%20%20%20%20entry.listeners.forEach((listener)%20%3D%3E%20listener(cause))%5Cn%20%20%7D%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20const%20registration%20%3D%20context.registerTool(%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20name%3A%20descriptor.name%2C%5Cn%20%20%20%20%20%20%20%20description%3A%20descriptor.description%2C%5Cn%20%20%20%20%20%20%20%20inputSchema%3A%20descriptor.inputSchema%2C%5Cn%20%20%20%20%20%20%20%20execute%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20signal%3A%20entry.controller.signal%20%7D%2C%5Cn%20%20%20%20)%5Cn%20%20%20%20void%20Promise.resolve(registration).catch(handleError)%5Cn%20%20%7D%20catch%20(cause)%20%7B%5Cn%20%20%20%20handleError(cause)%5Cn%20%20%20%20throw%20cause%5Cn%20%20%7D%5Cn%5Cn%20%20return%20()%20%3D%3E%20releaseRegistration(registry%2C%20descriptor.name%2C%20entry%2C%20onError)%5Cn%7D%5Cn%5Cnfunction%20releaseRegistration(%5Cn%20%20registry%3A%20ContextRegistry%2C%5Cn%20%20name%3A%20string%2C%5Cn%20%20entry%3A%20SharedRegistration%2C%5Cn%20%20onError%3A%20(cause%3A%20unknown)%20%3D%3E%20void%2C%5Cn)%20%7B%5Cn%20%20if%20(registry.registrations.get(name)%20!%3D%3D%20entry)%20return%5Cn%20%20entry.listeners.delete(onError)%5Cn%20%20entry.refs%20-%3D%201%5Cn%20%20if%20(entry.refs%20%3E%200)%20return%5Cn%20%20registry.registrations.delete(name)%5Cn%20%20entry.controller.abort()%5Cn%7D%5Cn%5Cnexport%20function%20createSdkPageTools()%20%7B%5Cn%20%20initializeBuiltinWebMCP()%5Cn%5Cn%20%20const%20context%20%3D%20readContext()%5Cn%20%20if%20(!context)%20throw%20new%20Error('WebMCP%20modelContext%20is%20unavailable')%5Cn%20%20const%20registry%20%3D%20getContextRegistry(context)%5Cn%20%20const%20section%20%3D%20registry.section%5Cn%20%20const%20statusToolAdded%20%3D%20ref(false)%5Cn%20%20const%20registrationError%20%3D%20ref%3Cstring%20%7C%20undefined%3E()%5Cn%20%20const%20releases%20%3D%20new%20Map%3Cstring%2C%20()%20%3D%3E%20void%3E()%5Cn%20%20const%20tools%20%3D%20new%20Map%3Cstring%2C%20WebMcpToolDescriptor%3E()%5Cn%5Cn%20%20function%20getErrorMessage(cause%3A%20unknown)%20%7B%5Cn%20%20%20%20return%20cause%20instanceof%20Error%20%3F%20cause.message%20%3A%20String(cause)%5Cn%20%20%7D%5Cn%5Cn%20%20function%20removeRegistration(name%3A%20string)%20%7B%5Cn%20%20%20%20releases.get(name)%3F.()%5Cn%20%20%20%20releases.delete(name)%5Cn%20%20%20%20tools.delete(name)%5Cn%20%20%20%20if%20(name%20%3D%3D%3D%20'get-demo-status')%20statusToolAdded.value%20%3D%20false%5Cn%20%20%7D%5Cn%5Cn%20%20function%20register(descriptor%3A%20WebMcpToolDescriptor%2C%20execute%3A%20(args%3A%20Record%3Cstring%2C%20unknown%3E)%20%3D%3E%20Promise%3Cunknown%3E)%20%7B%5Cn%20%20%20%20registrationError.value%20%3D%20undefined%5Cn%20%20%20%20const%20release%20%3D%20acquireRegistration(context%2C%20descriptor%2C%20execute%2C%20(cause)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20removeRegistration(descriptor.name)%5Cn%20%20%20%20%20%20registrationError.value%20%3D%20getErrorMessage(cause)%5Cn%20%20%20%20%7D)%5Cn%20%20%20%20releases.set(descriptor.name%2C%20release)%5Cn%20%20%20%20tools.set(descriptor.name%2C%20descriptor)%5Cn%20%20%7D%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'get-page-info'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E6%A0%87%E9%A2%98%E5%92%8C%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20JSON.stringify(%7B%20title%3A%20'WebMCP%20SDK%20Demo'%2C%20section%3A%20section.value%20%7D)%20%7D%5D%2C%5Cn%20%20%20%20%7D)%2C%5Cn%20%20)%5Cn%5Cn%20%20register(%5Cn%20%20%20%20%7B%5Cn%20%20%20%20%20%20name%3A%20'set-page-section'%2C%5Cn%20%20%20%20%20%20description%3A%20'%E5%88%87%E6%8D%A2%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%B1%95%E7%A4%BA%E5%8C%BA%E5%9F%9F%E3%80%82'%2C%5Cn%20%20%20%20%20%20inputSchema%3A%20%7B%5Cn%20%20%20%20%20%20%20%20type%3A%20'object'%2C%5Cn%20%20%20%20%20%20%20%20properties%3A%20%7B%20section%3A%20%7B%20type%3A%20'string'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20required%3A%20%5B'section'%5D%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20async%20(args)%20%3D%3E%20%7B%5Cn%20%20%20%20%20%20if%20(typeof%20args.section%20!%3D%3D%20'string'%20%7C%7C%20!args.section.trim())%20%7B%5Cn%20%20%20%20%20%20%20%20throw%20new%20Error('section%20is%20required')%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%20%20section.value%20%3D%20args.section%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%E5%B7%B2%E5%88%87%E6%8D%A2%E4%B8%BA%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%2C%5Cn%20%20)%5Cn%5Cn%20%20return%20%7B%5Cn%20%20%20%20context%3A%20()%20%3D%3E%20context%2C%5Cn%20%20%20%20section%2C%5Cn%20%20%20%20statusToolAdded%2C%5Cn%20%20%20%20registrationError%2C%5Cn%20%20%20%20tools%2C%5Cn%20%20%20%20registerStatusTool()%20%7B%5Cn%20%20%20%20%20%20if%20(releases.has('get-demo-status'))%20return%5Cn%20%20%20%20%20%20register(%5Cn%20%20%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20%20%20name%3A%20'get-demo-status'%2C%5Cn%20%20%20%20%20%20%20%20%20%20description%3A%20'%E8%AF%BB%E5%8F%96%E5%BD%93%E5%89%8D%20WebMCP%20SDK%20Demo%20%E7%8A%B6%E6%80%81%E3%80%82'%2C%5Cn%20%20%20%20%20%20%20%20%20%20inputSchema%3A%20%7B%20type%3A%20'object'%2C%20properties%3A%20%7B%7D%20%7D%2C%5Cn%20%20%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%20%20async%20()%20%3D%3E%20(%7B%5Cn%20%20%20%20%20%20%20%20%20%20content%3A%20%5B%7B%20type%3A%20'text'%2C%20text%3A%20%60%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E5%8C%BA%E5%9F%9F%EF%BC%9A%24%7Bsection.value%7D%60%20%7D%5D%2C%5Cn%20%20%20%20%20%20%20%20%7D)%2C%5Cn%20%20%20%20%20%20)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20true%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20unregisterStatusTool()%20%7B%5Cn%20%20%20%20%20%20removeRegistration('get-demo-status')%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%20%20dispose()%20%7B%5Cn%20%20%20%20%20%20for%20(const%20name%20of%20%5B...releases.keys()%5D)%20removeRegistration(name)%5Cn%20%20%20%20%20%20statusToolAdded.value%20%3D%20false%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%5Cn%7D%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:n(k)},u({_:2},[a.value?{name:"vue",fn:s(()=>[t(n(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=i("",33))])}}});export{S as __pageData,_ as default};
