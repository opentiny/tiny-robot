<template>
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
