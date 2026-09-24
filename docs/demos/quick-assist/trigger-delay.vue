<template>
  <div class="qa-delay-demo">
    <div class="qa-delay-demo__controls">
      <button type="button" :aria-pressed="delay === 0" @click="setDelay(0)">立即显示</button>
      <button type="button" :aria-pressed="delay === 300" @click="setDelay(300)">延迟 300 毫秒</button>
    </div>
    <p id="qa-delay-text">选中这段云服务器配置说明，比较立即显示与延迟显示的划词入口。</p>
    <p class="qa-delay-demo__status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const delay = ref(300)
const status = ref('当前延迟 300 毫秒；选中文字后观察入口。')
let quickAssist: QuickAssistInstance | undefined

function setDelay(value: number) {
  delay.value = value
  quickAssist?.updateOptions({ trigger: { showDelay: value } })
  status.value = value ? `当前延迟 ${value} 毫秒；选中文字后观察入口。` : '当前立即显示；选中文字后观察入口。'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-delay-text'],
    trigger: { showDelay: delay.value },
    adapter: {
      submit(request) {
        status.value = `已提交：${request.prompt}`
      },
    },
    onEvent(event) {
      if (event.type === 'selection') status.value = '选区已确认，等待显示入口…'
      if (event.type === 'trigger_show') status.value = '划词入口已显示'
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
</script>

<style scoped>
.qa-delay-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.7;
}
.qa-delay-demo__controls {
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
button[aria-pressed='true'] {
  border-color: #2175c4;
  background: #e8f2ff;
}
#qa-delay-text {
  padding: 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
.qa-delay-demo__status {
  color: #536171;
  font-size: 13px;
}
</style>
