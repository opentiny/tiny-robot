<script setup lang="ts">
import { computed, ref } from 'vue'
import { BubbleRenderers, TrBubble, TrBubbleProvider } from '@opentiny/tiny-robot'
import type { BubbleErrorInfo } from '@opentiny/tiny-robot'

const error = ref<BubbleErrorInfo | null>({
  message: '请求失败，请稍后重试',
  code: 'REQUEST_FAILED',
})

const state = computed(() => ({ error: error.value }))

const toggleError = () => {
  error.value = error.value
    ? null
    : {
        message: '请求失败，请稍后重试',
        code: 'REQUEST_FAILED',
      }
}
</script>

<template>
  <div class="error-demo">
    <button type="button" @click="toggleError">
      {{ error ? '清除错误' : '模拟请求失败' }}
    </button>

    <tr-bubble-provider :error-renderer="BubbleRenderers.Error">
      <tr-bubble role="assistant" content="已生成的部分回答" :state="state" />
    </tr-bubble-provider>
  </div>
</template>

<style scoped>
.error-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
</style>
