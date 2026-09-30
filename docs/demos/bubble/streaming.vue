<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <button :disabled="streaming" @click="resetStreamContent">
      {{ streaming ? '正在输出…' : '点击展示流式文本' }}
    </button>
    <tr-bubble :content="streamContent" :avatar="aiAvatar" />
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, onBeforeUnmount, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const fullText = '这是一段流式输出的文本内容。'
const streamContent = ref('点击上方按钮开始流式输出文本')
const streaming = ref(false)
let runId = 0

const resetStreamContent = async () => {
  const currentRunId = ++runId
  streaming.value = true
  streamContent.value = ''
  for (const char of fullText) {
    if (currentRunId !== runId) return
    streamContent.value += char
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (currentRunId === runId) streaming.value = false
}

onBeforeUnmount(() => {
  runId += 1
})
</script>
