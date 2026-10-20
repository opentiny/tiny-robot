<template>
  <div class="qa-validation-demo">
    <div class="qa-validation-demo__controls">
      <label>
        远程数据
        <select v-model="response" @change="configure">
          <option value="mixed">有效与异常问题混合</option>
          <option value="invalid">全部异常问题</option>
        </select>
      </label>
      <label><input v-model="enabled" type="checkbox" @change="configure" />启用业务校验</label>
    </div>
    <p class="qa-validation-demo__text">
      请选择 <strong id="qa-validation-text">竞价计费</strong> 并打开智能帮助，观察校验前后的问题变化。
    </p>
    <p>业务规则：标题 ≤ 40 字、问题 ≤ 1000 字，且问题包含选中文字。空白字段始终由基础校验过滤。</p>
    <p aria-live="polite">{{ status }}</p>
    <div v-if="finished" class="qa-validation-demo__comparison">
      <section>
        <h4>远程原始问题（{{ incoming.length }} 条）</h4>
        <ul>
          <li v-for="item in incoming" :key="item.id">
            <span class="qa-validation-demo__label" :title="item.label">{{ item.label }}</span>
            <span :class="kept(item.id) ? 'qa-validation-demo__kept' : 'qa-validation-demo__rejected'">
              {{ kept(item.id) ? '保留' : rejectionReasons[item.id] || '基础校验过滤：问题为空白' }}
            </span>
          </li>
        </ul>
      </section>
      <section>
        <h4>最终展示问题（{{ displayed.length }} 条）</h4>
        <ul>
          <li v-for="item in displayed" :key="item.id">
            <span>{{ item.label }}</span>
            <small>{{ item.prompt }}</small>
          </li>
        </ul>
        <p v-if="failed">远程问题全部无效，保留静态问题。</p>
      </section>
    </div>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { QuickAssistInstance, Suggestion, ValidateSuggestion } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const response = ref<'mixed' | 'invalid'>('mixed')
const enabled = ref(true)
const incoming = ref<Suggestion[]>([])
const accepted = ref<Suggestion[]>([])
const displayed = ref<Suggestion[]>([])
const rejectionReasons = ref<Record<string, string>>({})
const finished = ref(false)
const failed = ref(false)
const status = ref('请选择“竞价计费”并打开智能帮助。')
const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

const staticSuggestions: Suggestion[] = [
  { id: 'static', label: '静态：了解竞价计费', prompt: '请介绍竞价计费的基本规则' },
]

const validateSuggestion: ValidateSuggestion = (suggestion, context) => {
  let reason = ''
  if (suggestion.label.length > 40) reason = '业务校验过滤：标题超过 40 字'
  else if (suggestion.prompt.length > 1000) reason = '业务校验过滤：问题超过 1000 字'
  else if (!suggestion.prompt.includes(context.text)) reason = '业务校验过滤：与选中文字无关'
  if (reason) rejectionReasons.value[suggestion.id] = reason
  return !reason
}

const kept = (id: string) => accepted.value.some((item) => item.id === id)

function configure() {
  quickAssist?.destroy()
  incoming.value = []
  accepted.value = []
  displayed.value = []
  rejectionReasons.value = {}
  finished.value = false
  failed.value = false
  submitted.value = ''
  status.value = '配置已更新，请选择“竞价计费”并打开智能帮助。'
  const result = response.value
  quickAssist = createQuickAssist({
    include: ['#qa-validation-text'],
    suggestions: staticSuggestions,
    getSuggestions: async (context, signal) => {
      status.value = '正在模拟远程请求…'
      await new Promise((resolve) => setTimeout(resolve, 600))
      signal.throwIfAborted()
      const invalid: Suggestion[] = [
        { id: 'blank', label: '空白问题', prompt: ' ' },
        { id: 'long', label: '请详细解释竞价计费规则及相关注意事项'.repeat(4), prompt: `解释“${context.text}”` },
        { id: 'unrelated', label: '今天晚餐吃什么？', prompt: '请推荐今天的晚餐' },
      ]
      incoming.value =
        result === 'invalid'
          ? invalid
          : [
              { id: 'valid', label: '竞价计费有哪些中断风险？', prompt: `请说明“${context.text}”的中断风险` },
              ...invalid,
            ]
      return incoming.value
    },
    validateSuggestion: enabled.value ? validateSuggestion : undefined,
    // 只展示通过校验的远程问题，避免静态问题占位影响对比。
    mergeSuggestions: (_base, valid) => {
      accepted.value = valid
      displayed.value = valid
      finished.value = true
      status.value = `远程返回 ${incoming.value.length} 条，保留 ${valid.length} 条，过滤 ${incoming.value.length - valid.length} 条。`
      return valid
    },
    maxSuggestions: 6,
    onEvent(event) {
      if (event.type === 'error' && event.stage === 'suggestions') {
        accepted.value = []
        displayed.value = staticSuggestions
        failed.value = true
        finished.value = true
        status.value = `远程返回 ${incoming.value.length} 条，全部被过滤，已回退到静态问题。`
      }
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
.qa-validation-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-validation-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.qa-validation-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
select {
  appearance: auto;
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  font: inherit;
}
select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
.qa-validation-demo__text {
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-validation-demo__comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
section {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 8px;
}
h4 {
  margin: 0 0 12px;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
li + li {
  margin-top: 12px;
}
li span,
small {
  display: block;
  overflow-wrap: anywhere;
}
.qa-validation-demo__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qa-validation-demo__kept {
  color: var(--vp-c-green-1, #187347);
  font-size: 13px;
}
.qa-validation-demo__rejected {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
@media (max-width: 640px) {
  .qa-validation-demo__comparison {
    grid-template-columns: 1fr;
  }
}
</style>
