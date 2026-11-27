<template><div ref="container" class="trace-labels-vue-demo" /></template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTrace, type TrajectoryInstance, type TrajectoryItem } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const container = ref<HTMLElement>()
let trace: TrajectoryInstance | undefined
const items: TrajectoryItem[] = [
  { id: 'info', type: 'info', message: '普通信息', startTime: 0, endTime: 1000 },
  { id: 'success', type: 'success', message: '执行成功', startTime: 1000, endTime: 2000 },
  { id: 'warning', type: 'warning', message: '需要注意', startTime: 2000, endTime: 3000 },
  { id: 'error', type: 'error', message: '执行失败', startTime: 3000, endTime: 4000 },
  { id: 'analysis', type: 'analysis', message: '正在分析', startTime: 4000, endTime: 5000 },
]

onMounted(() => {
  trace = createTrace({ container: container.value!, durationFormat: 'none', items })
})

onBeforeUnmount(() => trace?.destroy())
</script>

<style scoped>
.trace-labels-vue-demo {
  width: 100%;
}
</style>
