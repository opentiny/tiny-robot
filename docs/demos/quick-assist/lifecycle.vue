<template>
  <div class="qa-feature-demo">
    <div class="qa-feature-demo__controls">
      <button type="button" @click="enable">启用划词</button>
      <button type="button" @click="disable">停用划词</button>
      <button type="button" @click="close">模拟路由切换</button>
    </div>
    <p id="qa-lifecycle-text">选中这段文字，然后用上方按钮观察当前划词入口或输入浮层如何关闭。</p>
    <p class="qa-feature-demo__status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const status = ref('划词已启用')
let quickAssist: QuickAssistInstance | undefined

function enable() {
  quickAssist?.enable()
  status.value = '划词已启用，可以重新选中文字'
}

function disable() {
  quickAssist?.disable()
  status.value = '划词已停用，当前界面已关闭'
}

function close() {
  quickAssist?.close()
  status.value = '已模拟路由切换并关闭当前会话，划词功能仍保持原有启停状态'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-lifecycle-text'],
    adapter: {
      submit(request) {
        status.value = `已提交：${request.prompt}`
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
.qa-feature-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  padding: 7px 12px;
  border: 1px solid #cbd3dd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
#qa-lifecycle-text {
  padding: 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
.qa-feature-demo__status {
  color: #536171;
  font-size: 13px;
}
</style>
