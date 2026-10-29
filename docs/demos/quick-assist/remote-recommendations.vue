<template>
  <div class="qa-remote-demo">
    <div class="qa-remote-demo__controls">
      <label>
        推荐策略
        <select v-model="strategy" @change="configure">
          <option value="remote-only">仅远程推荐</option>
          <option value="replace">远程整体替换</option>
          <option value="fallback">空结果回退</option>
          <option value="remote-first">远程优先，保留其他静态问题</option>
        </select>
      </label>
      <label>
        模拟响应
        <select v-model="response" @change="configure">
          <option value="success">成功返回问题</option>
          <option value="empty">返回空数组</option>
          <option value="error">请求失败</option>
        </select>
      </label>
    </div>
    <div id="qa-remote-recommendations-text" class="qa-remote-demo__text">
      <p>竞价计费适合可中断的计算任务，实例价格随供需变化。</p>
      <p>请选择上面的计费说明并点击智能帮助，观察一秒后推荐问题如何变化。</p>
    </div>
    <p class="qa-remote-demo__hint" aria-live="polite">{{ status }}</p>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { MergeSuggestions, QuickAssistInstance, QuickAssistSuggestionInput } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

type Strategy = 'remote-only' | 'replace' | 'fallback' | 'remote-first'
const strategy = ref<Strategy>('replace')
const response = ref<'success' | 'empty' | 'error'>('success')
const status = ref('请选择文字并打开智能帮助。')
const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

const staticSuggestions: QuickAssistSuggestionInput[] = [
  {
    id: 'explain',
    getLabel: ({ text }) => `静态：解释“${text}”`,
    getPrompt: ({ text }) => `请解释“${text}”的计费规则`,
  },
  { id: 'compare', label: '静态：比较计费方式', prompt: '请比较竞价计费与按需计费' },
]

const mergeStrategies: Record<Exclude<Strategy, 'remote-only'>, MergeSuggestions> = {
  replace: (_base, incoming) => incoming,
  fallback: (base, incoming) => (incoming.length ? incoming : base),
  'remote-first': (base, incoming) => [...incoming, ...base],
}

function configure() {
  // 重新创建实例，确保“仅远程推荐”模式完全省略 suggestions。
  quickAssist?.destroy()
  submitted.value = ''
  status.value = '配置已更新，请重新选择文字并打开智能帮助。'
  const mode = strategy.value
  const result = response.value
  quickAssist = createQuickAssist({
    include: ['#qa-remote-recommendations-text'],
    ...(mode === 'remote-only' ? {} : { suggestions: staticSuggestions, mergeSuggestions: mergeStrategies[mode] }),
    getSuggestions: async (context, signal) => {
      status.value = '正在模拟远程请求，约一秒后返回。'
      // 接入业务服务时，在这里用 fetch(url, { signal, ... }) 获取 Suggestion[]。
      await new Promise((resolve) => setTimeout(resolve, 1000))
      signal.throwIfAborted()
      if (result === 'error') throw new Error('模拟推荐请求失败')
      status.value =
        result === 'empty' ? '远程返回空数组，已应用当前合并策略。' : '远程问题已返回，已应用当前合并策略。'
      if (result === 'empty') return []
      return [
        { id: 'explain', label: '远程：解释计费规则', prompt: `请结合当前页面解释“${context.text}”的计费规则` },
        { id: 'risk', label: '远程：查看中断风险', prompt: `请说明“${context.text}”的中断风险与应对措施` },
      ]
    },
    maxSuggestions: 3,
    onEvent(event) {
      if (event.type === 'error' && event.stage === 'suggestions') {
        status.value = '远程请求失败，已有静态问题会保留，仍可手动输入提交。'
      }
      if (event.type === 'close') status.value = '会话已关闭，可重新选择文字。'
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
}

onMounted(configure)
onBeforeUnmount(() => quickAssist?.destroy())
</script>

<style scoped>
.qa-remote-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-remote-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 16px;
}
.qa-remote-demo__controls label {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.qa-remote-demo__controls select {
  appearance: auto;
  max-width: 100%;
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  font: inherit;
}
.qa-remote-demo__controls select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
.qa-remote-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-remote-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
