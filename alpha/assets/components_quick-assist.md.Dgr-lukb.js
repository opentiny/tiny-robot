const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/lifecycle.BWirtyMt.js","assets/chunks/style.DL38KgCd.js","assets/chunks/framework.BxUN6Jop.js","assets/chunks/selection-scope.C_Bdw6Z_.js","assets/chunks/context.DChDa1Lu.js","assets/chunks/recommendations.BEmB5XYh.js","assets/chunks/trigger-delay.S0_VrXMQ.js","assets/chunks/vue-chat.DEoPnWvq.js","assets/chunks/theme.DFIyBece.js"])))=>i.map(i=>d[i]);
import{aD as k,bQ as c,aZ as x,aL as C,v as q,H as u,bL as p,bB as o,J as i,bk as t,bJ as a,G as E,w as l,I as y,b7 as g,aU as _}from"./chunks/framework.BxUN6Jop.js";import{L as h,N as r}from"./chunks/index.DtYzv2Q1.js";const B=`<template>
  <div class="qa-feature-demo">
    <div class="qa-feature-demo__controls">
      <button type="button" @click="enable">启用划词</button>
      <button type="button" @click="disable">停用划词</button>
      <button type="button" @click="close">模拟路由切换</button>
    </div>
    <p id="qa-lifecycle-text">选中这段文字，然后用上方按钮观察当前划词入口或输入浮层如何关闭。</p>
    <p class="qa-feature-demo__status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const status = ref('划词已启用')
let quickAssist: QuickAssistInstance | undefined

function enable() {
  quickAssist?.enable()
  status.value = '划词已启用，可以重新选中文字'
}

function disable() {
  quickAssist?.disable()
  status.value = '划词已停用，当前界面已关闭'
}

function close() {
  quickAssist?.close()
  status.value = '已模拟路由切换并关闭当前会话，划词功能仍保持原有启停状态'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-lifecycle-text'],
    adapter: {
      submit(request) {
        status.value = \`已提交：\${request.prompt}\`
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  padding: 7px 12px;
  border: 1px solid #cbd3dd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
#qa-lifecycle-text {
  padding: 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
.qa-feature-demo__status {
  color: #536171;
  font-size: 13px;
}
</style>
`,D=`<template>
  <div class="qa-feature-demo">
    <div id="qa-scope-allowed" class="qa-feature-demo__allowed">
      <p>可选择区域：ECS、VPC 和 QoS 都是有效的短技术词。</p>
      <p>这段文字明显超过本示例设置的二十四字上限，整句选中时不会出现智能帮助入口。</p>
      <p data-qa-ignore>排除区域：即使文字很短，也不会出现智能帮助入口。</p>
    </div>
    <p class="qa-feature-demo__outside">范围外：这里的文字没有包含在生效区域内。</p>
    <p class="qa-feature-demo__hint">分别选择短词、整句和排除区域，对比入口是否出现。</p>
    <pre v-if="submitted">已提交：{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-scope-allowed'],
    exclude: ['[data-qa-ignore]'],
    selection: { maxTextLength: 24 },
    adapter: {
      submit(request) {
        submitted.value = request.prompt
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__allowed {
  padding: 8px 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
[data-qa-ignore] {
  padding: 8px;
  border-radius: 6px;
  background: #fff4e5;
}
.qa-feature-demo__outside {
  padding: 8px 14px;
  border: 1px dashed #cbd3dd;
  border-radius: 8px;
}
.qa-feature-demo__hint {
  color: #536171;
  font-size: 13px;
}
pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,w=`<template>
  <div class="qa-feature-demo">
    <div id="qa-context-text" class="qa-feature-demo__text">
      <p>安全组控制云服务器的入站和出站流量。生产环境应遵循最小权限原则。</p>
      <p data-sensitive="true">敏感区域：tenantId=tenant-demo-4812（无法触发划词）。</p>
    </div>
    <p class="qa-feature-demo__hint">选中第一段并提交，查看业务上下文中的租户编号如何被替换。</p>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-context-text'],
    getContext: () => ({ product: '云服务器', tenantId: 'tenant-demo-4812' }),
    sanitizeContext: (context) => ({
      ...context,
      businessContext: { ...context.businessContext, tenantId: '[已脱敏]' },
    }),
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify({ 提交内容: request.prompt, 上下文: request.context }, null, 2)
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
[data-sensitive] {
  padding: 8px;
  border-radius: 6px;
  background: #fff4e5;
}
.qa-feature-demo__hint {
  color: #536171;
  font-size: 13px;
}
pre {
  max-height: 260px;
  overflow: auto;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,T=`<template>
  <div class="qa-feature-demo">
    <div id="qa-recommendations-text" class="qa-feature-demo__text">
      <p>包年包月适合长期稳定的工作负载，按需计费适合短期或波动较大的任务。</p>
      <p>选中一种计费方式，打开智能帮助，观察推荐问题从静态内容扩展为异步内容。</p>
    </div>
    <p class="qa-feature-demo__hint">点击推荐问题后会直接提交，无需再次按发送。</p>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-recommendations-text'],
    suggestions: [
      { id: 'explain', label: '解释这个概念', prompt: '请解释选中的计费方式' },
      { id: 'compare', label: '比较计费方式', prompt: '请比较选中的计费方式与其他方式' },
    ],
    getSuggestions: async (context, signal) => {
      await new Promise((resolve) => setTimeout(resolve, 700))
      if (signal.aborted) return []
      return [{ id: 'risk', label: '查看注意事项', prompt: \`请说明“\${context.text}”的注意事项\` }]
    },
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify(
          { 推荐项: request.suggestion?.label ?? '手动输入', 提交内容: request.prompt },
          null,
          2,
        )
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
.qa-feature-demo__hint {
  color: #536171;
  font-size: 13px;
}
pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,S=`<template>
  <div class="qa-delay-demo">
    <div class="qa-delay-demo__controls">
      <button type="button" :aria-pressed="delay === 0" @click="setDelay(0)">立即显示</button>
      <button type="button" :aria-pressed="delay === 300" @click="setDelay(300)">延迟 300 毫秒</button>
    </div>
    <p id="qa-delay-text">选中这段云服务器配置说明，比较立即显示与延迟显示的划词入口。</p>
    <p class="qa-delay-demo__status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const delay = ref(300)
const status = ref('当前延迟 300 毫秒；选中文字后观察入口。')
let quickAssist: QuickAssistInstance | undefined

function setDelay(value: number) {
  delay.value = value
  quickAssist?.updateOptions({ trigger: { showDelay: value } })
  status.value = value ? \`当前延迟 \${value} 毫秒；选中文字后观察入口。\` : '当前立即显示；选中文字后观察入口。'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-delay-text'],
    trigger: { showDelay: delay.value },
    adapter: {
      submit(request) {
        status.value = \`已提交：\${request.prompt}\`
      },
    },
    onEvent(event) {
      if (event.type === 'selection') status.value = '选区已确认，等待显示入口…'
      if (event.type === 'trigger_show') status.value = '划词入口已显示'
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-delay-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-delay-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  padding: 7px 12px;
  border: 1px solid #cbd3dd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
button[aria-pressed='true'] {
  border-color: #2175c4;
  background: #e8f2ff;
}
#qa-delay-text {
  padding: 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
.qa-delay-demo__status {
  color: #536171;
  font-size: 13px;
}
</style>
`,Q=`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QuickAssist HTML 接入示例</title>
    <style>
      body {
        margin: 0;
        padding: 32px;
        color: #222b36;
        font:
          15px/1.7 system-ui,
          sans-serif;
        background: #f5f7fa;
      }
      main {
        max-width: 900px;
        margin: 0 auto;
      }
      article,
      aside {
        padding: 20px;
        border: 1px solid #dfe3e8;
        border-radius: 12px;
        background: #fff;
      }
      article {
        margin: 20px 0;
      }
      article p {
        max-width: 72ch;
      }
      [data-sensitive],
      [data-ai-selection='false'] {
        padding: 8px 10px;
        border-radius: 6px;
        color: #744c12;
        background: #fff4e5;
      }
      aside {
        position: sticky;
        bottom: 16px;
        box-shadow: 0 8px 28px #20304018;
      }
      aside[hidden] {
        display: none;
      }
      pre {
        max-height: 280px;
        overflow: auto;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      button {
        padding: 7px 12px;
        border: 1px solid #cbd3dd;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
      }
      .status {
        min-height: 1.4em;
        color: #536171;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>QuickAssist HTML 接入示例</h1>
      <p>选中下面正文中的一个概念，点击“智能帮助”，查看组件如何把请求交给模拟对话面板。</p>

      <article id="guide-content" aria-label="可选择的产品帮助内容">
        <h2>云服务器配置</h2>
        <p>
          包年包月适合长期、稳定运行的工作负载。按需计费适合临时任务和用量变化较大的业务，用户可以根据预期使用时长调整预算。
        </p>
        <p>
          竞价计费使用闲置计算资源来降低成本，但实例可能因供需变化被回收。生产系统应评估业务中断容忍度，并为重要数据配置独立的持久化存储。
        </p>
        <p>安全组用于管理云服务器的入站和出站访问规则。建议遵循最小权限原则，只开放业务实际需要的端口。</p>
        <p data-sensitive="true">敏感示例：access token = demo-secret-abc123（不可选择，也不会放入附近上下文）。</p>
        <p data-ai-selection="false">此内容通过 data-ai-selection 标记排除。</p>
      </article>

      <aside id="assistant-panel" aria-label="模拟 AI 对话面板" hidden>
        <h2>模拟 AI 对话面板</h2>
        <p>适配器收到请求后立即打开此面板。此示例不会连接模型。</p>
        <pre id="request-output"></pre>
        <div><button id="close-assistant" type="button">关闭面板</button></div>
      </aside>
      <p class="status" id="event-status" aria-live="polite"></p>
    </main>

    <script>
      ;(async () => {
        const output = document.querySelector('#request-output')
        const panel = document.querySelector('#assistant-panel')
        const status = document.querySelector('#event-status')

        // 文档预览在 iframe 中运行，资源地址由文档页面提供；单独打开此文件时从仓库构建产物加载。
        const previewUmdUrl = window.parent === window ? undefined : window.parent.__tinyRobotVanillaDemoUmdUrl
        const localUmdUrl = new URL('../../../packages/components/dist/vanilla/vanilla.umd.js', document.baseURI)
        const script = document.createElement('script')
        script.src = previewUmdUrl ?? localUmdUrl.href
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = () => reject(new Error('无框架组件脚本加载失败'))
          document.head.appendChild(script)
        })

        const quickAssist = window.TinyRobotVanilla.createQuickAssist({
          include: ['#guide-content'],
          selection: { maxTextLength: 240 },
          getContext: () => ({ product: '云服务器', section: '实例配置', accountId: 'account-demo-0481' }),
          sanitizeContext: (context) => ({
            ...context,
            businessContext: {
              ...context.businessContext,
              accountId: '[已脱敏]',
            },
          }),
          suggestions: [
            {
              id: 'compare',
              getLabel: ({ text }) => \`比较“\${text}”\`,
              getPrompt: ({ text }) => \`请结合页面上下文比较“\${text}”与相关选项\`,
            },
          ],
          getSuggestions: async (context, signal) => {
            await new Promise((resolve) => setTimeout(resolve, 650))
            if (signal.aborted) return []
            return [
              {
                id: 'risk',
                label: \`查看“\${context.text}”的注意事项\`,
                prompt: \`请结合页面上下文说明“\${context.text}”的注意事项\`,
              },
            ]
          },
          adapter: {
            submit(request) {
              panel.hidden = false
              // 使用 textContent 展示完整请求；实际接入时应把 prompt 和 context
              // 一起交给应用的对话层，而不是把上下文拼到页面 HTML 中。
              output.textContent = JSON.stringify(
                {
                  source: request.source,
                  query: request.query,
                  prompt: request.prompt,
                  context: request.context,
                  suggestion: request.suggestion,
                },
                null,
                2,
              )
            },
          },
          onEvent(event) {
            status.textContent = event.type === 'error' ? \`QuickAssist 错误：\${event.stage}\` : \`最近事件：\${event.type}\`
          },
        })

        document.querySelector('#close-assistant').addEventListener('click', () => {
          panel.hidden = true
        })
        window.addEventListener('pagehide', () => quickAssist.destroy(), { once: true })
        document.documentElement.dataset.quickAssistReady = 'true'
      })().catch((error) => {
        document.querySelector('#event-status').textContent = \`组件初始化失败：\${error.message}\`
        console.error(error)
      })
    <\/script>
  </body>
</html>
`,I=`<template>
  <div class="qa-demo">
    <section class="qa-demo__page" aria-labelledby="qa-page-title">
      <h3 id="qa-page-title">创建云服务器：选择一段文字试试</h3>
      <p>计费模式决定了云服务器资源的付费方式。包年包月适合长期、稳定运行的业务，按需计费适合临时或波动的工作负载。</p>
      <p>
        竞价计费通过使用闲置计算资源降低成本，但实例可能因资源供需变化而被回收。请结合业务中断容忍度、数据持久性和预算来选择。
      </p>
      <p>
        网络安全组用于控制云服务器的入站和出站访问规则。生产环境中应遵循最小权限原则，只开放业务必需的端口和来源地址。
      </p>
      <p data-sensitive="true">演示敏感区域：tenantId=tenant-demo-4812（此处不应触发 QuickAssist）。</p>
      <p data-ai-selection="false">这个区域通过 data-ai-selection 标记排除。</p>
      <button class="qa-demo__open" type="button" @click="openAssistantPanel">打开 AI 对话</button>
    </section>

    <aside v-if="panelOpen" class="qa-demo__assistant" aria-label="TinyRobot 模拟对话面板">
      <header class="qa-demo__assistant-head">
        <div>
          <h3>AI 对话面板</h3>
          <p>QuickAssist 提交后在此打开并自动发送</p>
        </div>
        <span class="qa-demo__badge">模拟后端</span>
      </header>

      <div class="qa-demo__messages">
        <TrBubbleList v-if="messages.length" :messages="messages" :role-configs="roleConfigs" auto-scroll />
        <p v-else class="qa-demo__empty">在左侧内容中选中文字，点击“智能帮助”；也可以在上方打开面板后输入问题。</p>
      </div>

      <details v-if="latestRequest" class="qa-demo__context">
        <summary>本次提交的 prompt 与脱敏 Context</summary>
        <pre>{{ JSON.stringify({ prompt: latestRequest.prompt, context: latestRequest.context }, null, 2) }}</pre>
      </details>

      <TrSender v-model="draft" mode="multiple" placeholder="也可以在这里输入问题" @submit="handleManualSubmit" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const messages = ref<BubbleMessage[]>([])
const draft = ref('')
const latestRequest = ref<AIRequest | null>(null)
const panelOpen = ref(false)
const roleConfigs = {
  user: { placement: 'end' as const },
  assistant: { placement: 'start' as const },
}

let quickAssist: QuickAssistInstance | undefined
let nextMessageId = 0

function appendMessage(role: 'user' | 'assistant', content: string) {
  messages.value.push({
    id: \`quick-assist-\${++nextMessageId}\`,
    role,
    content,
  })
}

async function sendMockRequest(request: AIRequest) {
  latestRequest.value = request
  appendMessage('user', request.prompt)

  // 模拟宿主的 AI 接口；prompt 与完整 Context 一起进入发送函数。
  const contextSummary = [
    request.context.nearbyText,
    request.context.businessContext?.product,
    request.context.businessContext?.section,
  ]
    .filter(Boolean)
    .join(' / ')
  await new Promise((resolve) => setTimeout(resolve, 450))
  appendMessage(
    'assistant',
    \`这是本地模拟回复。已收到问题“\${request.query}”，并结合 \${contextSummary || '当前页面上下文'} 处理。真实项目可在这里调用现有对话 API。\`,
  )
}

function openAssistantPanel() {
  panelOpen.value = true
}

function handleManualSubmit(value: string) {
  const content = value.trim()
  if (!content) return
  draft.value = ''
  void sendMockRequest({
    source: 'chat',
    query: content,
    prompt: content,
    context: { source: 'chat', text: content },
  })
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['.qa-demo__page'],
    selection: { maxTextLength: 240 },
    getContext: () => ({
      product: '云服务器',
      section: '创建实例',
      tenantId: 'tenant-demo-4812',
    }),
    sanitizeContext: (context) => ({
      ...context,
      businessContext: {
        ...context.businessContext,
        tenantId: '[已脱敏]',
      },
    }),
    adapter: {
      submit: (request) => {
        panelOpen.value = true
        return sendMockRequest(request)
      },
    },
    onEvent: (event) => {
      if (event.type === 'error') console.error('[QuickAssist]', event.stage, event.error)
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  min-height: 430px;
  padding: 18px;
  border: 1px solid var(--tr-border-color, #dfe3e8);
  border-radius: 12px;
  background: var(--tr-bg-color, #fff);
}

.qa-demo__page {
  min-width: 0;
  line-height: 1.75;
}

.qa-demo__page h3,
.qa-demo__assistant h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.qa-demo__page p {
  margin: 0 0 14px;
}

.qa-demo__page [data-sensitive],
.qa-demo__page [data-ai-selection='false'] {
  padding: 8px 10px;
  border-radius: 6px;
  background: #fff4e5;
  color: #744c12;
}

.qa-demo__open {
  padding: 8px 12px;
  border: 1px solid #cbd3dd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.qa-demo__assistant {
  display: flex;
  min-height: 390px;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--tr-border-color, #dfe3e8);
  border-radius: 10px;
  background: var(--tr-container-bg-default, #fafbfc);
}

.qa-demo__assistant-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.qa-demo__assistant-head p {
  margin: 0;
  color: #697586;
  font-size: 12px;
}

.qa-demo__badge {
  flex: none;
  padding: 3px 7px;
  border-radius: 999px;
  background: #e8f2ff;
  color: #1768ac;
  font-size: 11px;
}

.qa-demo__messages {
  min-height: 160px;
  flex: 1;
  overflow: auto;
}

.qa-demo__empty {
  color: #697586;
  font-size: 13px;
}

.qa-demo__context {
  max-height: 150px;
  overflow: auto;
  font-size: 12px;
}

.qa-demo__context pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 700px) {
  .qa-demo {
    grid-template-columns: 1fr;
  }
}
</style>
`,W="/tiny-robot/alpha/assets/vanilla.umd.B5-bIzRE.js",Z=JSON.parse('{"title":"QuickAssist 智能帮助","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/quick-assist.md","filePath":"components/quick-assist.md"}'),R={name:"components/quick-assist.md"},V=Object.assign(R,{setup(P){const m=g();k(async()=>{m.value=(await c(async()=>{const{default:e}=await import("./chunks/lifecycle.BWirtyMt.js");return{default:e}},__vite__mapDeps([0,1,2]))).default});const b=g();k(async()=>{b.value=(await c(async()=>{const{default:e}=await import("./chunks/selection-scope.C_Bdw6Z_.js");return{default:e}},__vite__mapDeps([3,1,2]))).default});const F=g();k(async()=>{F.value=(await c(async()=>{const{default:e}=await import("./chunks/context.DChDa1Lu.js");return{default:e}},__vite__mapDeps([4,1,2]))).default});const f=g();k(async()=>{f.value=(await c(async()=>{const{default:e}=await import("./chunks/recommendations.BEmB5XYh.js");return{default:e}},__vite__mapDeps([5,1,2]))).default});const v=g();k(async()=>{v.value=(await c(async()=>{const{default:e}=await import("./chunks/trigger-delay.S0_VrXMQ.js");return{default:e}},__vite__mapDeps([6,1,2]))).default});const n=_(!0),A=g();return k(async()=>{A.value=(await c(async()=>{const{default:e}=await import("./chunks/vue-chat.DEoPnWvq.js");return{default:e}},__vite__mapDeps([7,8,2,1]))).default}),typeof window<"u"&&(window.__tinyRobotVanillaDemoUmdUrl=W),(e,s)=>{const d=x("ClientOnly");return C(),q("div",null,[s[7]||(s[7]=u(`<h1 id="quickassist-智能帮助" tabindex="-1">QuickAssist 智能帮助 <a class="header-anchor" href="#quickassist-智能帮助" aria-label="Permalink to &quot;QuickAssist 智能帮助&quot;">​</a></h1><p>QuickAssist 是一个与框架无关的智能帮助组件，可以用在需要在页面中进行轻量AI交互的场景。当前提供了“划词”触发和输入交互，用户选中页面中的文字后，可以查看推荐问题、编辑问题，并把问题和有限上下文交给应用已有的 AI 对话面板。它只负责划词触发和输入交互，不包含回答展示、模型调用或完整聊天界面。</p><h2 id="安装与引入" tabindex="-1">安装与引入 <a class="header-anchor" href="#安装与引入" aria-label="Permalink to &quot;安装与引入&quot;">​</a></h2><h3 id="npm-方式" tabindex="-1">NPM 方式 <a class="header-anchor" href="#npm-方式" aria-label="Permalink to &quot;NPM 方式&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span></span></code></pre></div><p>从 TinyRobot NPM 包的<code>/vanilla</code> 子路径导入，并显式加载组件样式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span></code></pre></div><p>QuickAssist 的运行时代码不依赖 Vue、Angular 等框架或其他界面组件。可以在任何技术栈项目中单独使用该组件，且产物不会包含任何框架运行时。</p><h3 id="umd-方式" tabindex="-1">UMD 方式 <a class="header-anchor" href="#umd-方式" aria-label="Permalink to &quot;UMD 方式&quot;">​</a></h3><p>将 <code>node_modules/@opentiny/tiny-robot/dist/vanilla/vanilla.umd.js</code> 部署到应用的静态资源目录或者CDN，通过全局对象 <code>TinyRobotVanilla</code> 调用。此文件是整个无框架组件集合的入口；以后新增组件也会从同一全局对象导出。下例中以jsdelivr cdn地址为例：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@0.5.2-alpha.19/dist/vanilla/vanilla.umd.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> window.TinyRobotVanilla.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request.prompt, request.context)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>UMD 入口会自动向所在文档注入组件样式。如果内容安全策略禁止动态注入 <code>&lt;style&gt;</code>，可以使用上文的 NPM/ESM 入口并显式加载 CSS。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h3><p>使用 <code>createQuickAssist</code> 可以创建选词智能帮助的UI实例。支持通过传入参数来进行各类自定义配置。<br><code>adapter</code> 参数负责连接应用现有的 AI 对话能力，例如用户发送问题后或者点击推荐问题后显示下一步AI对话窗口。提交时应处理 <code>prompt</code> 和 <code>context</code>；只发送 <code>query</code> 会丢掉推荐问题和页面上下文。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 替换为应用自己的“打开面板并自动发送”逻辑。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      assistantPanel.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      assistantChat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        content: request.prompt,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        context: request.context,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 可在宿主接入埋点；事件不包含默认选区文本或完整上下文。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">debug</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[QuickAssist]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, event.type)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 单页应用在路由离开当前页面时调用 quickAssist.close()。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 页面/应用销毁时调用：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// quickAssist.destroy()</span></span></code></pre></div><p><code>adapter</code> 收到的 <code>AIRequest</code> 包含 <code>source</code>、<code>query</code>、<code>prompt</code> 和脱敏后的 <code>context</code>；点击推荐项时还包含 <code>suggestion</code>。组件先关闭划词界面，再调用 <code>adapter</code>；异步提交失败会通过 <code>error</code> 事件报告，不会重新打开已关闭的界面。</p><p>下面的示例使用 TinyRobot 的 <code>TrBubbleList</code> 与 <code>TrSender</code> 呈现对话界面，并用本地模拟回复代替后端。QuickAssist 的 <code>adapter</code> 会打开面板，并把 <code>prompt</code> 与脱敏后的 <code>context</code> 一起交给对话函数。</p>`,18)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"Vue 对话面板接入",description:"划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:t(I)},E({_:2},[A.value?{name:"vue",fn:a(()=>[i(t(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=l("h3",{id:"html-接入",tabindex:"-1"},[y("HTML 接入 "),l("a",{class:"header-anchor",href:"#html-接入","aria-label":'Permalink to "HTML 接入"'},"​")],-1)),s[9]||(s[9]=l("p",null,"下面的 HTML 示例把请求对象安全地显示在模拟对话面板中，不连接实际模型服务。",-1)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"HTML 接入",description:"划词后查看提交给应用的请求内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{n.value=!1}),htmlCode:t(Q)},null,8,["htmlCode"])]),_:1}),s[10]||(s[10]=l("h3",{id:"延迟显示入口",tabindex:"-1"},[y("延迟显示入口 "),l("a",{class:"header-anchor",href:"#延迟显示入口","aria-label":'Permalink to "延迟显示入口"'},"​")],-1)),s[11]||(s[11]=l("p",null,[y("设置 "),l("code",null,"trigger.showDelay"),y(" 可在选区稳定后延迟显示划词入口，单位为毫秒；默认 "),l("code",null,"0"),y("，保持立即显示。连续拖选时从最后一次有效选区重新计时，并等待鼠标松开；选区失效、关闭、停用或销毁时会取消待显示的入口。延迟只影响入口，不影响点击后打开输入浮层。")],-1)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"延迟显示划词入口",description:"切换立即显示与延迟 300 毫秒，对比划词体验。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{n.value=!1}),vueCode:t(S)},E({_:2},[v.value?{name:"vue",fn:a(()=>[i(t(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[12]||(s[12]=u(`<div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trigger: { showDelay: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h3 id="推荐问题" tabindex="-1">推荐问题 <a class="header-anchor" href="#推荐问题" aria-label="Permalink to &quot;推荐问题&quot;">​</a></h3><p>选中示例中的文字后点击划词入口，可以先看到静态推荐，再看到异步返回的推荐；点击任一推荐可查看提交结果。</p>`,3)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"静态与异步推荐",description:"查看推荐加载、合并和点击后直接提交的效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{n.value=!1}),vueCode:t(T)},E({_:2},[f.value?{name:"vue",fn:a(()=>[i(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[13]||(s[13]=u(`<p>QuickAssist 支持四种推荐模式：</p><table tabindex="0"><thead><tr><th>配置方式</th><th>打开输入浮层后的行为</th></tr></thead><tbody><tr><td>省略 <code>suggestions</code> 与 <code>getSuggestions</code></td><td>立即显示“解释”和“适用场景”两个默认模板</td></tr><tr><td>仅配置 <code>suggestions</code></td><td>立即显示静态推荐；显式传 <code>[]</code> 表示不显示默认模板</td></tr><tr><td>仅配置 <code>getSuggestions</code></td><td>立即打开输入区，推荐区域显示加载状态；推荐函数返回后展示结果</td></tr><tr><td>两者都配置</td><td>先显示静态模板，再合并异步推荐；默认保留模板，按 ID 去重，最后由 <code>maxSuggestions</code> 裁剪</td></tr></tbody></table><p>下面用业务接口示意异步推荐；<code>/api/quick-assist/suggestions</code> 是应用自行提供的服务路径。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  suggestions: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;explain&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;解释这个选项&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      prompt: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;请结合当前页面上下文解释这个选项的含义&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;compare&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      getLabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`比较“\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">text</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}”\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      getPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`请结合当前页面上下文比较“\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">text</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}”和相关选项\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getSuggestions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">signal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/api/quick-assist/suggestions&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      method: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;POST&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      headers: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;content-type&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;application/json&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      body: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">JSON</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stringify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      signal,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">response.ok) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;推荐请求失败&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> response.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  maxSuggestions: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p><code>Suggestion</code> 包含稳定的 <code>id</code>、展示用 <code>label</code> 和提交用 <code>prompt</code>。点击推荐项会直接提交，无须再次点击发送。手动输入则把编辑后的内容作为 <code>query</code>；可用 <code>buildPrompt</code> 自定义最终发送内容。</p><h3 id="页面上下文与敏感数据" tabindex="-1">页面上下文与敏感数据 <a class="header-anchor" href="#页面上下文与敏感数据" aria-label="Permalink to &quot;页面上下文与敏感数据&quot;">​</a></h3><p>示例会在提交后展示最终上下文：业务字段中的租户编号已脱敏，标为敏感的文字不能触发划词，也不会进入附近文本。</p>`,7)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"上下文与脱敏",description:"选中文字并提交，查看允许交给应用的上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{n.value=!1}),vueCode:t(w)},E({_:2},[F.value?{name:"vue",fn:a(()=>[i(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=u(`<p>默认上下文包含：</p><ul><li><code>source: &#39;selection&#39;</code>、<code>text</code> 和 <code>selection.text</code>；</li><li>页面标题与 URL；URL 只包含域名和路径，不采集查询参数或片段标识；</li><li>限长的 <code>nearbyText</code>，从选区附近的有限语义块提取；找不到语义块时最多退回选中文字。</li></ul><p>可以通过 <code>getContext</code> 添加业务字段，通过 <code>getNearbyContext</code> 定制附近文本，并通过 <code>sanitizeContext</code> 返回最终允许外发的完整上下文。<code>sanitizeContext</code> 在业务上下文构造后执行；脱敏完成前不会调用推荐函数或 <code>adapter</code>。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">_context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">signal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> currentPage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> loadCurrentPageContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ signal })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      product: currentPage.product,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      section: currentPage.section,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tenantId: currentPage.tenantId,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  sanitizeContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    businessContext: {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context.businessContext,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tenantId: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[redacted]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>默认采集不会读取整页 <code>body.innerText</code> 或表单值。选区与附近文本会跳过常见编辑区和敏感标记，但通用规则不能识别所有业务秘密。请通过 <code>sanitizeContext</code> 删除访问密钥、令牌、用户或租户 ID、订单数据等，并在页面上为敏感区域添加 <code>data-sensitive</code> 或 <code>data-ai-selection=&quot;false&quot;</code>。不要把 DOM、<code>Range</code> 或选区快照序列化后传给模型。</p><h3 id="生效范围与选择长度" tabindex="-1">生效范围与选择长度 <a class="header-anchor" href="#生效范围与选择长度" aria-label="Permalink to &quot;生效范围与选择长度&quot;">​</a></h3><p>试着选择示例中允许的文字、排除区域，以及超过长度限制的句子，比较划词入口是否出现。</p>`,7)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"可选择区域与长度限制",description:"仅指定区域和有效长度的选区会显示划词入口。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{n.value=!1}),vueCode:t(D)},E({_:2},[b.value?{name:"vue",fn:a(()=>[i(t(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[15]||(s[15]=u(`<div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 配置后，选区中的每个文本节点都必须位于匹配区域</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  exclude: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[data-qa-ignore]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.private-value&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在内置排除项上追加</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  selection: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxTextLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">snapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> snapshot.text.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>默认拒绝空白、纯数字、纯标点/符号、明显 URL、UUID 和超出长度的选区；不会用固定最短长度过滤 <code>ECS</code>、<code>VPC</code>、<code>QoS</code> 等短技术词。<code>selection.validate</code> 自定义文本判断，但仍不能绕过最大长度、<code>include</code> / <code>exclude</code>、编辑器和敏感区域检查。超长选区会被拒绝，不会悄悄截断后发送。</p><p>默认排除 <code>input</code>、<code>textarea</code>、<code>select</code>、<code>contenteditable</code>、Monaco、CodeMirror、QuickAssist 自身界面，以及 <code>[data-ai-selection=&quot;false&quot;]</code>、<code>[data-sensitive]</code>、<code>[data-secret]</code>、<code>[data-password]</code> 等标记。</p><div class="tip custom-block"><p class="custom-block-title">支持范围</p><p>当前版本暂不支持移动端长按选择，以及 iframe 和 Shadow DOM 内的选区。</p></div><h3 id="生命周期与路由" tabindex="-1">生命周期与路由 <a class="header-anchor" href="#生命周期与路由" aria-label="Permalink to &quot;生命周期与路由&quot;">​</a></h3><p>以下示例可直接启用或停用划词，并模拟路由切换时调用 <code>close()</code>；组件卸载时应调用 <code>destroy()</code>。</p>`,6)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"启停与关闭会话",description:"通过按钮控制划词功能，并模拟页面切换。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{n.value=!1}),vueCode:t(B)},E({_:2},[m.value?{name:"vue",fn:a(()=>[i(t(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[16]||(s[16]=u(`<h4 id="angular" tabindex="-1">Angular <a class="header-anchor" href="#angular" aria-label="Permalink to &quot;Angular&quot;">​</a></h4><p>在视图创建后初始化实例，并在组件销毁时调用 <code>destroy()</code>。QuickAssist 会自动响应浏览器 <code>popstate</code> 与 <code>hashchange</code>；Angular Router 通常通过 <code>pushState</code> 导航，不一定产生这两个事件，因此应在路由导航开始时调用 <code>close()</code>。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { AfterViewInit, Component, OnDestroy, inject } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@angular/core&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { NavigationStart, Router } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@angular/router&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { filter, Subscription } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;rxjs&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { QuickAssistInstance } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ selector: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;app-shell&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, template: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&lt;main id=&quot;app&quot;&gt;...&lt;/main&gt;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppShellComponent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AfterViewInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OnDestroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> router</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> inject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Router)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> routeSubscription</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Subscription</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistInstance</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ngAfterViewInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.quickAssist </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request.prompt, request.context)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.routeSubscription </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.router.events</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pipe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> is</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NavigationStart</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">instanceof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NavigationStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">subscribe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ngOnDestroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.routeSubscription?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unsubscribe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">destroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 接入应用已有面板与发送方法；不要只把 prompt 留在输入框里。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>如果 Angular 应用启用 SSR，请只在浏览器生命周期中创建实例。<code>root</code> 可传入 <code>Document</code>，不能传 <code>ShadowRoot</code>。</p><h4 id="vue" tabindex="-1">Vue <a class="header-anchor" href="#vue" aria-label="Permalink to &quot;Vue&quot;">​</a></h4><p>在 <code>onMounted</code> 中创建，在卸载前 <code>destroy()</code>。Vue Router 的 SPA 导航也建议用 <code>afterEach</code> 或路由监听调用 <code>close()</code>。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { onBeforeUnmount, onMounted } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { useRouter } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue-router&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> router</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useRouter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ReturnType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> createQuickAssist&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> removeAfterEach</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onMounted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ adapter })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  removeAfterEach </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> router.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">afterEach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onBeforeUnmount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  removeAfterEach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">?.()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">destroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>在全局布局组件统一创建可覆盖多页面；如果 QuickAssist 只属于某个视图，则在该视图的挂载/卸载边界创建和销毁。</p><h2 id="交互与限制" tabindex="-1">交互与限制 <a class="header-anchor" href="#交互与限制" aria-label="Permalink to &quot;交互与限制&quot;">​</a></h2><ul><li>划词入口默认出现在选区下方居中，空间不足时会翻转或调整位置；打开输入浮层后仍会根据选区重新定位。</li><li>点击入口后输入框立即打开并聚焦，默认填入选中文字；按 Enter 发送，按 Shift+Enter 换行，输入法组合期间不会误发。</li><li>等待业务上下文构造或脱敏时，仍可编辑输入，但暂时不能提交；脱敏完成前不会调用推荐函数。</li><li>点击推荐项或手动发送后，组件先关闭划词界面，再调用 <code>adapter</code>。</li><li>新选区会替换旧会话。点击外部、按 Esc、锚点失效、显著滚动、路由变化或调用生命周期方法时，会清理当前界面。</li><li>浏览器的 <code>popstate</code> 和 <code>hashchange</code> 会自动关闭界面；其他单页应用导航应由路由钩子调用 <code>close()</code>。</li></ul><div class="tip custom-block"><p class="custom-block-title">功能边界</p><p>输入浮层不显示 AI 答案，也不提供流式渲染、重试、多轮对话或模型管理；这些仍由应用已有的 AI 面板负责。</p></div><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>root</code></td><td><code>Document</code></td><td><code>document</code></td><td>所在文档；不接受 <code>ShadowRoot</code></td></tr><tr><td><code>enabled</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否启用划词监听</td></tr><tr><td><code>adapter</code></td><td><code>AIAdapter</code></td><td>—</td><td>必填；由 <code>submit(request)</code> 交给应用已有的对话能力</td></tr><tr><td><code>include</code></td><td><code>string[]</code></td><td>—</td><td>限定可触发的页面区域</td></tr><tr><td><code>exclude</code></td><td><code>string[]</code></td><td>—</td><td>在内置排除规则上追加页面区域</td></tr><tr><td><code>selection.maxTextLength</code></td><td><code>number</code></td><td><code>300</code></td><td>可选文字的最大长度，必须为正整数</td></tr><tr><td><code>selection.validate</code></td><td><code>(snapshot) =&gt; boolean</code></td><td>内置校验</td><td>替代默认的文本内容校验</td></tr><tr><td><code>trigger.label</code></td><td><code>string</code></td><td><code>智能帮助</code></td><td>划词入口文案</td></tr><tr><td><code>trigger.showDelay</code></td><td><code>number</code></td><td><code>0</code></td><td>选区稳定后延迟显示入口，单位为毫秒，须为非负整数</td></tr><tr><td><code>trigger.offset</code></td><td><code>number</code></td><td><code>8</code></td><td>入口与选区的间距，单位为像素</td></tr><tr><td><code>trigger.placement</code></td><td><code>&#39;auto&#39; | &#39;top&#39; | &#39;bottom&#39;</code></td><td><code>&#39;auto&#39;</code></td><td>入口的优先位置；空间不足时调整</td></tr><tr><td><code>nearbyContext.maxLength</code></td><td><code>number</code></td><td><code>500</code></td><td>附近文本的最大字符数</td></tr><tr><td><code>nearbyContext.blockSelectors</code></td><td><code>string[]</code></td><td>内置选择器</td><td>在默认语义块之外增加候选块</td></tr><tr><td><code>getNearbyContext</code></td><td><code>(snapshot) =&gt; string | undefined</code></td><td>—</td><td>自定义附近文本；<code>snapshot</code> 含 DOM <code>Range</code></td></tr><tr><td><code>getContext</code></td><td><code>(context, signal) =&gt; Record | Promise&lt;Record&gt;</code></td><td>—</td><td>返回业务字段，合并到 <code>businessContext</code></td></tr><tr><td><code>sanitizeContext</code></td><td><code>(context, signal) =&gt; QuickAssistContext | Promise&lt;QuickAssistContext&gt;</code></td><td>—</td><td>返回最终允许外发的完整上下文</td></tr><tr><td><code>suggestions</code></td><td><code>QuickAssistSuggestionInput[]</code></td><td>默认推荐</td><td>静态推荐或推荐生成函数</td></tr><tr><td><code>getSuggestions</code></td><td><code>(context, signal) =&gt; Suggestion[] | Promise&lt;Suggestion[]&gt;</code></td><td>—</td><td>使用脱敏后的上下文获取异步推荐</td></tr><tr><td><code>mergeSuggestions</code></td><td><code>(base, incoming, context) =&gt; Suggestion[]</code></td><td>内置合并</td><td>自定义推荐合并；最终仍按 <code>id</code> 去重并受数量上限约束</td></tr><tr><td><code>maxSuggestions</code></td><td><code>number</code></td><td><code>3</code></td><td>最多展示的推荐数，必须为正整数</td></tr><tr><td><code>buildPrompt</code></td><td><code>(input) =&gt; string</code></td><td>内置构造</td><td>自定义提交内容</td></tr><tr><td><code>attrs</code></td><td><code>QuickAssistAttrs</code></td><td>—</td><td>为组件内部元素追加安全的 DOM 属性</td></tr><tr><td><code>messages</code></td><td><code>QuickAssistMessages</code></td><td>内置中文文案</td><td>覆盖界面文案和默认推荐的展示文字</td></tr><tr><td><code>onEvent</code></td><td><code>(event) =&gt; void</code></td><td>—</td><td>事件回调；回调异常不会打断组件清理</td></tr></tbody></table><p><code>attrs.suggestion</code> 可以是属性对象，也可以是按推荐项返回属性对象的函数。事件处理器、<code>style</code>、写入 HTML 的属性、<code>value</code>、<code>disabled</code>、<code>type</code>、<code>id</code> 等会被忽略；<code>class</code> 只能追加，不能覆盖组件内部行为。</p><p>样式限制在 <code>.tr-quick-assist</code> 命名空间内。组件变量以 <code>--tr-quick-assist-*</code> 命名，并映射现有 TinyRobot 设计变量；未提供应用主题变量时，使用组件自身的默认值。ESM 模式须显式加载 CSS；UMD 入口会自动注入样式。</p><h2 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h2><table tabindex="0"><thead><tr><th>方法名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>enable</code></td><td>—</td><td>启动划词和全局事件监听；重复调用无副作用</td></tr><tr><td><code>disable</code></td><td>—</td><td>关闭当前输入浮层并停止监听；之后可再次调用 <code>enable()</code></td></tr><tr><td><code>close</code></td><td>—</td><td>关闭当前会话，不销毁实例</td></tr><tr><td><code>updateOptions</code></td><td><code>partial: Partial&lt;QuickAssistOptions&gt;</code></td><td>关闭当前会话、废弃旧异步结果并重建配置；顶层浅合并，嵌套对象整体替换</td></tr><tr><td><code>destroy</code></td><td>—</td><td>关闭并释放监听器与 DOM；重复调用无副作用</td></tr></tbody></table><p><code>root</code> 创建后不可更换；<code>updateOptions({ root: anotherDocument })</code> 会抛出错误，应先销毁旧实例再创建新实例。更新时省略 <code>enabled</code> 会保留实例当前启用/停用状态；显式传入时使用新值。</p><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>selection</code></td><td>—</td><td>接受新的合法选区</td></tr><tr><td><code>trigger_show</code></td><td>—</td><td>展示划词入口</td></tr><tr><td><code>trigger_click</code></td><td>—</td><td>点击入口</td></tr><tr><td><code>popover_show</code></td><td>—</td><td>展示输入浮层</td></tr><tr><td><code>suggestion_click</code></td><td><code>suggestionId</code></td><td>点击推荐项</td></tr><tr><td><code>submit</code></td><td>—</td><td>提交请求；事件不包含选区文字或发送内容</td></tr><tr><td><code>close</code></td><td><code>reason</code></td><td><code>outside</code>、<code>escape</code>、<code>scroll</code>、<code>anchor-invalid</code>、<code>route</code>、<code>submit</code>、<code>disable</code>、<code>destroy</code>、<code>update</code>、<code>manual</code> 或 <code>reselection</code></td></tr><tr><td><code>error</code></td><td><code>stage</code>、<code>error</code></td><td>异步上下文、推荐、提交内容构造、适配器或配置发生错误</td></tr></tbody></table><p><code>sessionId</code> 是组件实例内的划词会话编号：每次接受新的有效选区时递增，同一次划词从入口显示到关闭的事件使用相同编号，便于关联事件。它不是登录会话、用户 ID 或跨实例持久化的业务标识。配置错误发生在划词前，此时 <code>sessionId</code> 为 <code>0</code>。表中只列出部分事件的其他字段。事件不包含选区原文、<code>query</code>、<code>prompt</code> 或完整上下文；错误对象由应用按自己的日志规则处理。</p>`,21))])}}});export{Z as __pageData,V as default};
