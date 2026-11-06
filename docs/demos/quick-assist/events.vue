<template>
  <div class="qa-events-demo">
    <div class="qa-events-demo__controls">
      <label><input v-model="failSubmit" type="checkbox" /> 模拟提交失败</label>
      <button type="button" @click="logs = []">清空日志</button>
    </div>
    <p id="qa-events-text">云服务器支持按需计费。选中这段文字，点击智能帮助，再点击推荐问题或手动发送。</p>
    <p class="qa-events-demo__hint">按 Esc 可观察关闭事件；勾选“模拟提交失败”后提交，可观察 adapter 错误事件。</p>
    <p class="qa-events-demo__status" role="status">{{ status }}</p>
    <div class="qa-events-demo__log" role="region" aria-label="事件日志" tabindex="0" data-ai-selection="false">
      <table v-if="logs.length">
        <thead>
          <tr>
            <th>序号</th>
            <th>sessionId</th>
            <th>事件</th>
            <th>附加字段</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in logs" :key="entry.id">
            <td>{{ entry.id }}</td>
            <td>{{ entry.sessionId }}</td>
            <td>
              <code>{{ entry.type }}</code>
            </td>
            <td>{{ entry.detail || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>暂无事件，请选中上方文字开始操作。</p>
    </div>
    <p class="qa-events-demo__hint">按发生顺序保留最近 40 条事件，仅显示事件元数据，不记录选区或发送内容。</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { QuickAssistEvent, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const failSubmit = ref(false)
const status = ref('等待划词操作。')
const logs = ref<Array<{ id: number; sessionId: number; type: QuickAssistEvent['type']; detail: string }>>([])
let nextId = 0
let quickAssist: QuickAssistInstance | undefined

function onEvent(event: QuickAssistEvent) {
  let detail = ''
  if (event.type === 'suggestion_click') detail = `suggestionId: ${event.suggestionId}`
  if (event.type === 'close') detail = `reason: ${event.reason}`
  // 本例只展示自己构造的模拟错误；业务中应按应用的日志规则处理错误对象。
  if (event.type === 'error') detail = `stage: ${event.stage}; error: ${event.error.message}`
  logs.value = [...logs.value, { id: ++nextId, sessionId: event.sessionId, type: event.type, detail }].slice(-40)
  status.value = `最近事件：${event.type}，会话 ${event.sessionId}${detail ? `，${detail}` : ''}`
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-events-text'],
    onEvent,
    adapter: {
      async submit() {
        if (failSubmit.value) throw new Error('模拟提交失败')
        // 接入应用时，在此发送 request.prompt 与 request.context。
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
</script>

<style scoped>
.qa-events-demo {
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  line-height: 1.7;
}
.qa-events-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.qa-events-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
input {
  appearance: auto;
}
button {
  padding: 7px 12px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
button:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
button:focus-visible,
input:focus-visible,
.qa-events-demo__log:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
#qa-events-text {
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-events-demo__hint,
.qa-events-demo__status {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
.qa-events-demo__log {
  max-height: 300px;
  overflow: auto;
}
.qa-events-demo__log table {
  min-width: 500px;
  margin: 0;
  font-size: 13px;
}
.qa-events-demo__log th,
.qa-events-demo__log td:nth-child(-n + 3) {
  white-space: nowrap;
}
.qa-events-demo__log td {
  overflow-wrap: anywhere;
}
</style>
