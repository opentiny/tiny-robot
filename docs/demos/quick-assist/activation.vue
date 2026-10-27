<template>
  <section id="qa-manual-activation" class="qa-activation-demo">
    <label class="qa-activation-demo__setting">
      <input v-model="directOpen" type="checkbox" @change="closeCurrent" />
      直接显示输入框（跳过“智能帮助”按钮）
    </label>
    <div class="qa-activation-demo__example">
      <h4>按钮作为锚点</h4>
      <p>点击按钮解释指定术语，使用实例的默认推荐；上方开关控制是否直接显示输入框。</p>
      <button type="button" @click="activateButton">解释“按需计费”</button>
    </div>
    <div class="qa-activation-demo__example">
      <h4>悬停指标，自定义内容与推荐</h4>
      <p>悬停或聚焦指标，按指标数值定位并提供专属推荐。浮层打开后可移入其中操作，也支持点击。</p>
      <div class="qa-activation-demo__metrics">
        <button
          v-for="metric in metrics"
          :key="metric.id"
          type="button"
          class="qa-activation-demo__metric"
          :aria-pressed="selectedMetric === metric.id"
          @pointerenter="activateMetric($event, metric)"
          @focus="activateMetric($event, metric)"
          @click="activateMetric($event, metric)"
        >
          <span>{{ metric.label }}</span>
          <strong data-metric-value>{{ metric.value }}</strong>
        </button>
      </div>
    </div>
    <aside v-if="lastRequest" class="qa-activation-demo__result" aria-live="polite">
      <strong>示例助手已收到请求</strong>
      <p>{{ lastRequest.prompt }}</p>
      <dl>
        <dt>内容</dt>
        <dd>{{ lastRequest.context.text }}</dd>
        <dt>来源</dt>
        <dd>{{ lastRequest.source }}</dd>
        <dt>业务字段</dt>
        <dd>{{ JSON.stringify(lastRequest.context.meta) }}</dd>
      </dl>
      <small>本示例只展示实际收到的请求，不调用模型。</small>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type {
  AIRequest,
  QuickAssistInstance,
  QuickAssistActivationInput,
  QuickAssistAnchorShortcut,
} from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const metrics = [
  { id: 'availability', label: '服务可用性', value: '99.95%' },
  { id: 'latency', label: '平均响应时间', value: '128 ms' },
]
const selectedMetric = ref('')
const directOpen = ref(true)
const lastRequest = shallowRef<AIRequest>()
let quickAssist: QuickAssistInstance | undefined
let switchingActivation = false

function activate(input: QuickAssistActivationInput | QuickAssistAnchorShortcut) {
  switchingActivation = true
  try {
    quickAssist?.activate(input)
  } finally {
    switchingActivation = false
  }
}

function closeCurrent() {
  quickAssist?.close()
  selectedMetric.value = ''
}

function activateButton(event: MouseEvent) {
  selectedMetric.value = ''
  lastRequest.value = undefined
  activate({
    text: '按需计费',
    anchor: event.currentTarget as HTMLButtonElement,
    open: directOpen.value ? 'popover' : 'trigger',
    meta: { product: '云服务器', feature: 'billing' },
  })
}

function activateMetric(event: Event, metric: (typeof metrics)[number]) {
  if (event.type === 'pointerenter' && (event as PointerEvent).pointerType === 'touch') return
  // Esc 恢复卡片焦点时不自动重开；重新悬停或显式点击仍可打开。
  if (event.type === 'focus' && (switchingActivation || selectedMetric.value === metric.id)) return
  const button = event.currentTarget as HTMLButtonElement
  const value = button.querySelector<HTMLElement>('[data-metric-value]')!
  selectedMetric.value = metric.id
  lastRequest.value = undefined
  activate({
    source: 'dashboard',
    open: directOpen.value ? 'popover' : 'trigger',
    text: `${metric.label}：${metric.value}`,
    suggestions: [
      {
        id: 'metric-explain',
        getLabel: () => '解读这个指标',
        getPrompt: (context) => `请解读运行指标：${context.text}`,
      },
      {
        id: 'metric-investigate',
        getLabel: () => '异常时如何排查',
        getPrompt: (context) => `如果${context.text}出现异常，应如何排查？`,
      },
    ],
    anchorElement: value,
    getRect: () => (value.isConnected && value.getClientRects().length ? value.getBoundingClientRect() : null),
    verify: () => selectedMetric.value === metric.id,
    meta: { metric: metric.id, value: metric.value },
    getNearbyText: () => '应用服务最近 24 小时的运行指标',
    onInvalidate(notify) {
      const observer = new ResizeObserver(notify)
      observer.observe(button)
      return () => observer.disconnect()
    },
  })
}

onMounted(() => {
  quickAssist = createQuickAssist({
    // 此 Demo 只演示 API 激活；旧 validate 只影响原生 DOM 划词。
    include: ['#qa-manual-activation'],
    selection: { validate: () => false },
    suggestions: [
      { id: 'term-explain', getLabel: () => '解释术语', getPrompt: (context) => `请解释：${context.text}` },
      { id: 'term-scenario', getLabel: () => '适用场景', getPrompt: (context) => `请说明${context.text}的适用场景` },
    ],
    adapter: {
      submit: (request) => {
        lastRequest.value = request
      },
    },
  })
})
onBeforeUnmount(() => quickAssist?.destroy())
</script>

<style scoped>
.qa-activation-demo {
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 10px;
  color: var(--vp-c-text-1, #213547);
}
.qa-activation-demo__example + .qa-activation-demo__example {
  margin-top: 22px;
}
.qa-activation-demo__setting {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}
h4 {
  margin: 0 0 8px;
}
p {
  margin: 8px 0 12px;
}
button {
  padding: 8px 14px;
  border: 1px solid var(--vp-c-divider, #ccc);
  border-radius: 8px;
  color: inherit;
  background: var(--vp-c-bg, #fff);
  font: inherit;
  cursor: pointer;
}
button:hover,
button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1, #3451b2);
  background: var(--vp-c-bg-soft, #f5f7fa);
}
button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #3451b2);
  outline-offset: 2px;
}
.qa-activation-demo__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.qa-activation-demo__metric {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 160px;
}
.qa-activation-demo__metric strong {
  font-size: 22px;
}
.qa-activation-demo__result {
  margin-top: 18px;
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
  overflow-wrap: anywhere;
}
dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 12px 0;
  font-size: 13px;
}
dd {
  margin: 0;
}
dt,
small {
  color: var(--vp-c-text-2, #555);
}
</style>
