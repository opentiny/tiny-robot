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
`,W="/tiny-robot/alpha/assets/vanilla.umd.B5-bIzRE.js",Z=JSON.parse('{"title":"QuickAssist 智能帮助","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/quick-assist.md","filePath":"components/quick-assist.md"}'),R={name:"components/quick-assist.md"},V=Object.assign(R,{setup(P){const m=g();k(async()=>{m.value=(await c(async()=>{const{default:e}=await import("./chunks/lifecycle.BWirtyMt.js");return{default:e}},__vite__mapDeps([0,1,2]))).default});const b=g();k(async()=>{b.value=(await c(async()=>{const{default:e}=await import("./chunks/selection-scope.C_Bdw6Z_.js");return{default:e}},__vite__mapDeps([3,1,2]))).default});const F=g();k(async()=>{F.value=(await c(async()=>{const{default:e}=await import("./chunks/context.DChDa1Lu.js");return{default:e}},__vite__mapDeps([4,1,2]))).default});const f=g();k(async()=>{f.value=(await c(async()=>{const{default:e}=await import("./chunks/recommendations.BEmB5XYh.js");return{default:e}},__vite__mapDeps([5,1,2]))).default});const v=g();k(async()=>{v.value=(await c(async()=>{const{default:e}=await import("./chunks/trigger-delay.S0_VrXMQ.js");return{default:e}},__vite__mapDeps([6,1,2]))).default});const n=_(!0),A=g();return k(async()=>{A.value=(await c(async()=>{const{default:e}=await import("./chunks/vue-chat.DEoPnWvq.js");return{default:e}},__vite__mapDeps([7,8,2,1]))).default}),typeof window<"u"&&(window.__tinyRobotVanillaDemoUmdUrl=W),(e,s)=>{const d=x("ClientOnly");return C(),q("div",null,[s[7]||(s[7]=u("",18)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"Vue 对话面板接入",description:"划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:t(I)},E({_:2},[A.value?{name:"vue",fn:a(()=>[i(t(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[8]||(s[8]=l("h3",{id:"html-接入",tabindex:"-1"},[y("HTML 接入 "),l("a",{class:"header-anchor",href:"#html-接入","aria-label":'Permalink to "HTML 接入"'},"​")],-1)),s[9]||(s[9]=l("p",null,"下面的 HTML 示例把请求对象安全地显示在模拟对话面板中，不连接实际模型服务。",-1)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"HTML 接入",description:"划词后查看提交给应用的请求内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{n.value=!1}),htmlCode:t(Q)},null,8,["htmlCode"])]),_:1}),s[10]||(s[10]=l("h3",{id:"延迟显示入口",tabindex:"-1"},[y("延迟显示入口 "),l("a",{class:"header-anchor",href:"#延迟显示入口","aria-label":'Permalink to "延迟显示入口"'},"​")],-1)),s[11]||(s[11]=l("p",null,[y("设置 "),l("code",null,"trigger.showDelay"),y(" 可在选区稳定后延迟显示划词入口，单位为毫秒；默认 "),l("code",null,"0"),y("，保持立即显示。连续拖选时从最后一次有效选区重新计时，并等待鼠标松开；选区失效、关闭、停用或销毁时会取消待显示的入口。延迟只影响入口，不影响点击后打开输入浮层。")],-1)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"延迟显示划词入口",description:"切换立即显示与延迟 300 毫秒，对比划词体验。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{n.value=!1}),vueCode:t(S)},E({_:2},[v.value?{name:"vue",fn:a(()=>[i(t(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[12]||(s[12]=u("",3)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"静态与异步推荐",description:"查看推荐加载、合并和点击后直接提交的效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{n.value=!1}),vueCode:t(T)},E({_:2},[f.value?{name:"vue",fn:a(()=>[i(t(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[13]||(s[13]=u("",7)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"上下文与脱敏",description:"选中文字并提交，查看允许交给应用的上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{n.value=!1}),vueCode:t(w)},E({_:2},[F.value?{name:"vue",fn:a(()=>[i(t(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=u("",7)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"可选择区域与长度限制",description:"仅指定区域和有效长度的选区会显示划词入口。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{n.value=!1}),vueCode:t(D)},E({_:2},[b.value?{name:"vue",fn:a(()=>[i(t(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[15]||(s[15]=u("",6)),p(i(t(h),null,null,512),[[o,n.value]]),i(d,null,{default:a(()=>[i(t(r),{title:"启停与关闭会话",description:"通过按钮控制划词功能，并模拟页面切换。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{n.value=!1}),vueCode:t(B)},E({_:2},[m.value?{name:"vue",fn:a(()=>[i(t(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[16]||(s[16]=u("",21))])}}});export{Z as __pageData,V as default};
