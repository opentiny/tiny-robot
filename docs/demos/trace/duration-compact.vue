<template><div ref="container" class="trace-duration-vue-demo" /></template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTrace, type TrajectoryInstance, type TrajectoryItem } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const container = ref<HTMLElement>()
let trace: TrajectoryInstance | undefined
const items: TrajectoryItem[] = [
  { id: 'fast', type: 'info', label: '短任务', message: '快速完成参数校验', startTime: 0, endTime: 420 },
  { id: 'normal', type: 'success', label: '普通任务', message: '加载上下文并准备请求', startTime: 420, endTime: 1620 },
  { id: 'long', type: 'analysis', label: '长任务', message: '执行长耗时数据分析', startTime: 1620, endTime: 66620 },
]
onMounted(() => {
  trace = createTrace({ container: container.value!, durationFormat: 'compact', items })
})
onBeforeUnmount(() => trace?.destroy())
</script>

<style scoped>
.trace-duration-vue-demo {
  width: 100%;
}
</style>
