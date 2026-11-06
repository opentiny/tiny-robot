<template>
  <div class="qa-feature-demo">
    <div id="qa-build-prompt-text" class="qa-feature-demo__text">
      <p>云服务器支持多种<span id="qa-build-prompt-term">计费模式</span>，可根据业务负载选择包年包月或按需计费。</p>
    </div>
    <p class="qa-feature-demo__hint">
      选中“计费模式”后打开智能帮助：输入“如何选择？”并发送，或直接点击“解释
      计费模式”。两种方式都会补充选中内容和业务上下文。
    </p>
    <div v-if="submitted" class="qa-prompt-result" aria-live="polite">
      <p>发送方式：{{ submitted.suggestion ? '点击推荐项' : '手动输入' }}</p>
      <dl>
        <dt>query · 展示的问题</dt>
        <dd>{{ submitted.query }}</dd>
        <dt>prompt · 最终发送内容</dt>
        <dd>
          <pre>{{ submitted.prompt }}</pre>
        </dd>
        <dt>context.text · 选中内容</dt>
        <dd>{{ submitted.context.text }}</dd>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref<AIRequest>()
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-build-prompt-text'],
    getContext: () => ({ product: '云服务器', scenario: '生产环境' }),
    suggestions: [
      {
        id: 'explain',
        getLabel: (context) => `解释 ${context.text}`,
        getPrompt: (context) => `请解释“${context.text}”的含义，并比较常见选项。`,
      },
    ],
    // 两种发送入口共用此钩子；query 保留展示文案，只加工最终 prompt。
    buildPrompt: ({ query, context, suggestion }) => {
      const question = suggestion?.prompt ?? query
      return [
        `产品：${context.businessContext?.product}`,
        `业务场景：${context.businessContext?.scenario}`,
        `参考内容：${context.text}`,
        `用户问题：${question}`,
      ].join('\n\n')
    },
    adapter: {
      submit(request) {
        // 实际接入时用 query 展示用户问题，用 prompt 调用模型。
        submitted.value = request
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
.qa-feature-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
dt {
  margin-top: 12px;
  font-weight: 600;
}
dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}
pre {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
