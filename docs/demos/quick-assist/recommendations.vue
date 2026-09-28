<template>
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
      return [{ id: 'risk', label: '查看注意事项', prompt: `请说明“${context.text}”的注意事项` }]
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
</script>

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
