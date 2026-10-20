<template>
  <div class="qa-feature-demo">
    <div id="qa-context-text" class="qa-feature-demo__text">
      <p>安全组控制云服务器的入站和出站流量。生产环境应遵循最小权限原则。</p>
      <p>虚构租户编号：<span id="qa-context-tenant">tenant-demo-4812</span>（可划词，提交前脱敏）。</p>
      <p data-sensitive="true">敏感区域：accessToken=demo-secret（无法触发划词，也不采集附近文本）。</p>
    </div>
    <p class="qa-feature-demo__hint">选中虚构租户编号并提交，查看选区、附近文本和业务上下文中的编号如何被替换。</p>
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

const redactTenant = (text: string) => text.replaceAll('tenant-demo-4812', '[已脱敏]')

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-context-text'],
    getContext: () => ({ product: '云服务器', tenantId: 'tenant-demo-4812' }),
    sanitizeContext: (context) => ({
      ...context,
      text: redactTenant(context.text),
      selection: context.selection ? { ...context.selection, text: redactTenant(context.selection.text) } : undefined,
      nearbyText: context.nearbyText ? redactTenant(context.nearbyText) : undefined,
      businessContext: { ...context.businessContext, tenantId: '[已脱敏]' },
    }),
    // 输入框保留用户选中的原文；发送前也要对最终问题做脱敏。
    buildPrompt: ({ query, suggestion }) => redactTenant(suggestion?.prompt ?? query),
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
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
[data-sensitive] {
  padding: 8px;
  border-radius: 6px;
  background: var(--vp-c-warning-soft, #fff4e5);
  color: var(--vp-c-warning-1, #744c12);
}
.qa-feature-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  max-height: 260px;
  overflow: auto;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
