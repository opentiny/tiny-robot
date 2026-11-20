<template>
  <div class="qa-basic-demo">
    <div id="qa-basic-text" class="qa-basic-demo__article">
      <p>
        云服务器支持按需计费与包年包月两种常见计费模式。请从左向右选中任意词语（例如“按需计费”），点击“智能帮助”入口，输入问题或直接点击推荐问题即可提交。
      </p>
    </div>

    <div v-if="latestRequest" class="qa-basic-demo__result" aria-live="polite">
      <p class="qa-basic-demo__result-title">已提交给 adapter.submit(request)：</p>
      <pre>{{
        JSON.stringify(
          {
            source: latestRequest.source,
            query: latestRequest.query,
            prompt: latestRequest.prompt,
            context: {
              text: latestRequest.context.text,
              nearbyText: latestRequest.context.nearbyText,
            },
            suggestion: latestRequest.suggestion,
          },
          null,
          2,
        )
      }}</pre>
    </div>
    <p v-else class="qa-basic-demo__hint">请从左向右选中上方文字体验完整流程（默认仅正向划词触发）。</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const latestRequest = shallowRef<AIRequest | null>(null)
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-basic-text'],
    adapter: {
      submit(request) {
        // 真实项目中在这里打开应用已有的 AI 对话面板，并将 prompt 与 context 一并发送。
        latestRequest.value = request
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
</script>

<style scoped>
.qa-basic-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-basic-demo__article {
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-basic-demo__article p {
  margin: 0;
}
.qa-basic-demo__hint {
  margin: 12px 0 0;
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
.qa-basic-demo__result {
  margin-top: 14px;
}
.qa-basic-demo__result-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}
.qa-basic-demo__result pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
  font-size: 13px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
