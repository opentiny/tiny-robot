<template>
  <tr-bubble
    :content="streamContent"
    :avatar="aiAvatar"
    :actions="['refresh', 'copy']"
    @refresh="handleRefresh"
    @copy="handleCopy"
  />
</template>

<script setup lang="ts">
// import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const content = 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。'

const streamContent = ref(content)

const resetStreamContent = async () => {
  streamContent.value = ''

  const chunks: string[] = []
  for (let i = 0; i < content.length; i += 3) {
    chunks.push(content.slice(i, i + 3))
  }

  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent.value = streamContent.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const handleRefresh = () => {
  resetStreamContent()
}

const handleCopy = () => {
  alert('copied')
}
</script>
