<template><div ref="container" class="trace-labels-vue-demo" /></template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTrace, type TrajectoryInstance, type TrajectoryItem } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const container = ref<HTMLElement>()
let trace: TrajectoryInstance | undefined
const items: TrajectoryItem[] = [
  { id: 'running', type: 'running', message: '自定义渐变标签', startTime: 0, endTime: 1500 },
  { id: 'done', type: 'done', message: '自定义颜色标签', startTime: 1500, endTime: 3000 },
]

onMounted(() => {
  trace = createTrace({
    container: container.value!,
    durationFormat: 'none',
    labels: {
      running: {
        text: '运行中',
        color: 'linear-gradient(90deg, #a5f3fc, #bfdbfe, #ddd6fe)',
        textColor: 'linear-gradient(90deg, #4f46e5, #db2777)',
      },
      done: { text: '完成', color: '#dcfce7', textColor: '#16a34a' },
    },
    items,
  })
})

onBeforeUnmount(() => trace?.destroy())
</script>

<style scoped>
.trace-labels-vue-demo {
  width: 100%;
}
</style>
