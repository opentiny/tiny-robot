<script setup lang="ts">
import { computed, inject, onErrorCaptured, ref } from 'vue'
import SchemaRenderer from '@opentiny/tiny-schema-renderer'
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { useChatRenderContext } from '@opentiny/tiny-robot-chat'
import { parseSchema } from '../genui/schema'
import { queryContextKey } from '../genui/context'

const props = defineProps<BubbleContentRendererProps>()
const { content } = useMessageContent(props)
const renderContext = useChatRenderContext(props)
const context = inject(queryContextKey)
const renderError = ref('')
const submitError = ref('')
const submitting = ref(false)
const complete = computed(() => content.value.closed === true && renderContext?.streamState.value === 'finished')
const streaming = computed(
  () => renderContext?.streamState.value === 'streaming' || (context?.busy.value && !complete.value),
)
const parsed = computed(() => {
  try {
    return { schema: parseSchema(String(content.value.text ?? ''), complete.value), error: '' }
  } catch (error) {
    return { schema: undefined, error: error instanceof Error ? error.message : 'Schema 解析失败' }
  }
})
const disabled = computed(() => !complete.value || context?.busy.value || submitting.value)
onErrorCaptured(() => {
  renderError.value = '卡片渲染失败，请查看原始数据'
  return false
})

async function submit(event: Event) {
  if (disabled.value || !context) return
  const form = event.target
  if (!(form instanceof HTMLFormElement) || form.dataset.action !== 'order-query') return
  const data = new FormData(form)
  const fields = {
    keyword: String(data.get('keyword') ?? '')
      .trim()
      .slice(0, 80),
    status: String(data.get('status') ?? ''),
  }
  if (!['', 'pending', 'completed'].includes(fields.status)) {
    submitError.value = '订单状态无效'
    return
  }
  submitting.value = true
  submitError.value = ''
  try {
    if (!(await context.submit(fields))) submitError.value = '消息未发送，请重试'
  } catch {
    submitError.value = '提交失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="genui-card" aria-label="生成的界面" @submit.prevent="submit">
    <p v-if="!complete" class="card-status">{{ streaming ? '界面生成中…' : '界面内容未完整生成，请重新发送' }}</p>
    <p v-if="renderError || (complete && parsed.error)" role="alert">{{ renderError || parsed.error }}</p>
    <fieldset v-else-if="parsed.schema" :disabled="disabled">
      <SchemaRenderer :schema="parsed.schema" />
    </fieldset>
    <p v-if="submitError" role="alert">{{ submitError }}</p>
    <details v-if="complete && (parsed.error || renderError)">
      <summary>查看原始 Schema</summary>
      <pre>{{ content.text }}</pre>
    </details>
  </section>
</template>

<style scoped>
.genui-card {
  padding: 18px;
  border: 1px solid var(--tr-border-color, #dbe2ef);
  border-radius: 12px;
  background: var(--tr-bg-color, #fff);
  color: var(--tr-text-primary, #1f2937);
  max-width: 100%;
  overflow-x: auto;
}
fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.genui-card :deep(form),
.genui-card :deep(label) {
  display: grid;
  gap: 10px;
}
.genui-card :deep(form) {
  gap: 16px;
}
.genui-card :deep(input),
.genui-card :deep(select) {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
  width: 100%;
}
.genui-card :deep(button) {
  padding: 10px 16px;
  cursor: pointer;
}
.genui-card :deep(button:disabled) {
  opacity: 0.5;
  cursor: default;
}
.genui-card :deep(table) {
  border-collapse: collapse;
  width: 100%;
}
.genui-card :deep(th),
.genui-card :deep(td) {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}
pre {
  max-width: 100%;
  overflow: auto;
}
[role='alert'] {
  color: #b91c1c;
}
.card-status {
  color: #64748b;
}
</style>
