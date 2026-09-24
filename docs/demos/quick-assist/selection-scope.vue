<template>
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
</script>

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
