<template>
  <div class="qa-position-demo">
    <div class="qa-position-demo__controls">
      <label><input v-model="forwardOnly" type="checkbox" @change="update" />仅正向划词触发</label>
      <label>
        入口位置
        <select v-model="placement" @change="update">
          <option value="bottom-end">右下（默认）</option>
          <option value="bottom-start">左下</option>
          <option value="bottom">下方居中</option>
          <option value="top-end">右上</option>
          <option value="top-start">左上</option>
          <option value="top">上方居中</option>
          <option value="auto">自动</option>
        </select>
      </label>
    </div>
    <p id="qa-position-text">
      选中这段云服务器配置说明，<b>包括加粗文字</b>，观察入口位置。<br />
      最后一行较短。
    </p>
    <p aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { QuickAssistInstance, QuickAssistPlacement } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const forwardOnly = ref(true)
const placement = ref<QuickAssistPlacement>('bottom-end')
const status = ref('试着正向、反向及跨行选择上面的文字。')
let quickAssist: QuickAssistInstance | undefined

function update() {
  quickAssist?.updateOptions({
    selection: { forwardOnly: forwardOnly.value },
    trigger: { placement: placement.value },
  })
  status.value = '配置已更新，请重新选择文字。'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-position-text'],
    selection: { forwardOnly: forwardOnly.value },
    trigger: { placement: placement.value },
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
.qa-position-demo {
  padding: 18px;
  border: 1px solid #dfe3e8;
  border-radius: 10px;
  line-height: 1.8;
}
.qa-position-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
select {
  padding: 4px 8px;
}
#qa-position-text {
  padding: 14px;
  border-radius: 8px;
  background: #f5f7fa;
}
</style>
