<template>
  <div class="qa-demo-container">
    <div class="qa-demo">
      <section class="qa-demo__page" aria-labelledby="qa-page-title">
        <h3 id="qa-page-title">创建云服务器：选择一段文字试试</h3>
        <p>
          计费模式决定了云服务器资源的付费方式。包年包月适合长期、稳定运行的业务，按需计费适合临时或波动的工作负载。
        </p>
        <p>
          竞价计费通过使用闲置计算资源降低成本，但实例可能因资源供需变化而被回收。请结合业务中断容忍度、数据持久性和预算来选择。
        </p>
        <p>
          网络安全组用于控制云服务器的入站和出站访问规则。生产环境中应遵循最小权限原则，只开放业务必需的端口和来源地址。
        </p>
        <p data-sensitive="true">演示敏感区域：tenantId=tenant-demo-4812（此处不应触发 QuickAssist）。</p>
        <p data-ai-selection="false">这个区域通过 data-ai-selection 标记排除。</p>
        <p class="qa-demo__note">本示例将最大划词长度设为 240 字，并脱敏业务上下文中的租户编号。</p>
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
          <pre>{{
            JSON.stringify(
              {
                query: latestRequest.query,
                prompt: latestRequest.prompt,
                context: latestRequest.context,
                suggestion: latestRequest.suggestion,
              },
              null,
              2,
            )
          }}</pre>
        </details>

        <TrSender v-model="draft" mode="multiple" placeholder="也可以在这里输入问题" @submit="handleManualSubmit" />
      </aside>

      <div v-else class="qa-demo__placeholder" aria-label="AI 对话面板占位提示">
        <p class="qa-demo__placeholder-title">AI 对话面板未打开</p>
        <p class="qa-demo__placeholder-desc">
          在示例正文中选中一段文字并提交问题，或点击“打开 AI 对话”按钮，模拟对话面板会在此处展开。
        </p>
      </div>
    </div>
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
    id: `quick-assist-${++nextMessageId}`,
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
    `这是本地模拟回复。已收到问题“${request.query}”，并结合 ${contextSummary || '当前页面上下文'} 处理。真实项目可在这里调用现有对话 API。`,
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
</script>

<style scoped>
.qa-demo-container {
  container-type: inline-size;
}

.qa-demo {
  color: var(--vp-c-text-1, #213547);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 360px);
  gap: 18px;
  min-height: 430px;
  height: 560px;
  max-height: 560px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 12px;
  background: var(--vp-c-bg, #fff);
}

.qa-demo__page {
  min-width: 0;
  min-height: 0;
  overflow: auto;
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
  background: var(--vp-c-warning-soft, #fff4e5);
  color: var(--vp-c-warning-1, #744c12);
}

.qa-demo__open {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.qa-demo__assistant {
  display: flex;
  min-height: 390px;
  min-width: 0;
  max-height: 100%;
  overflow: hidden;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  background: var(--vp-c-bg-soft, #fafbfc);
}

.qa-demo__assistant-head {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.qa-demo__assistant-head p {
  margin: 0;
  color: var(--vp-c-text-2, #697586);
  font-size: 12px;
}

.qa-demo__badge {
  flex: none;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft, #e8f2ff);
  color: var(--vp-c-brand-1, #1768ac);
  font-size: 11px;
}

.qa-demo__messages {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.qa-demo__empty {
  color: var(--vp-c-text-2, #697586);
  font-size: 13px;
}

.qa-demo__context {
  max-height: 150px;
  flex-shrink: 0;
  overflow: auto;
  font-size: 12px;
}

.qa-demo__context pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.qa-demo__assistant > :last-child {
  flex-shrink: 0;
}

@container (max-width: 760px) {
  .qa-demo {
    grid-template-columns: minmax(0, 1.1fr) minmax(240px, 0.9fr);
    gap: 14px;
    padding: 14px;
  }

  .qa-demo__assistant {
    padding: 12px;
  }
}

@container (max-width: 540px) {
  .qa-demo {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(0, 2fr);
    height: 860px;
    max-height: 900px;
  }

  .qa-demo__assistant {
    min-height: 0;
  }
}

@media (max-width: 700px) {
  .qa-demo {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(0, 2fr);
    height: 900px;
    max-height: 900px;
  }

  .qa-demo__assistant {
    min-height: 0;
  }
}

.qa-demo__note {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}

.qa-demo__placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 1px dashed var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  background: var(--vp-c-bg-soft, #fafbfc);
  text-align: center;
}

.qa-demo__placeholder-title {
  margin: 0;
  color: var(--vp-c-text-1, #213547);
  font-size: 14px;
  font-weight: 600;
}

.qa-demo__placeholder-desc {
  margin: 0;
  max-width: 26ch;
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
  line-height: 1.6;
}

.qa-demo__open:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
.qa-demo__open:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
</style>
