<template>
  <div ref="container" class="trace-basic-demo" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTrace, type TrajectoryInstance, type TrajectoryItem } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const container = ref<HTMLElement>()
let trace: TrajectoryInstance | undefined

const items: TrajectoryItem[] = [
  {
    id: 'prepare',
    type: 'info',
    label: '准备',
    message: '开始准备执行环境',
    startTime: 1_000,
    endTime: 1_420,
  },
  {
    id: 'complete',
    type: 'success',
    label: '完成',
    message: '数据加载完成',
    startTime: 1_420,
    endTime: 2_850,
  },
]

onMounted(() => {
  trace = createTrace({
    container: container.value!,
    items,
  })
})

onBeforeUnmount(() => trace?.destroy())
</script>

<style scoped>
.trace-basic-demo {
  width: 100%;
}
</style>
