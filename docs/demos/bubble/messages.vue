<template>
  <tr-bubble-provider :message-renderers="{ markdown: markdownRenderer }">
    <tr-bubble :messages="messages" :avatar="aiAvatar" placement="start"></tr-bubble>
  </tr-bubble-provider>
  <hr />
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
    <button @click="addMessage">添加消息</button>
    <button @click="setThinkingContent">设置思考过程</button>
  </div>
</template>

<script setup lang="ts">
import { BubbleMessageProps, TrBubbleProvider, TrBubble, BubbleMarkdownMessageRenderer } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownMessageRenderer()

const thinkingContent = `已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。`

const messages = ref<BubbleMessageProps[]>([
  {
    type: 'text',
    content: '我是普通的文本消息',
  },
  {
    type: 'markdown',
    content: `# 我是Markdown消息`,
  },
  {
    type: 'tool',
    name: 'DayWeather',
    status: 'success',
    params: JSON.stringify({
      city: '西安',
      date: '2025-05-31',
    }),
  },
  {
    type: 'collapse',
    title: '思考过程',
    content: thinkingContent,
  },
])

const addMessage = () => {
  messages.value.push({
    type: 'collapse',
    title: '思考过程',
    content:
      '已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。',
  })
}

const setThinkingContent = () => {
  const message = messages.value[3]
  message.content = ''
  for (let i = 0; i < thinkingContent.length; i += 1) {
    setTimeout(() => {
      message.content += thinkingContent[i]
    }, i * 100)
  }
}
</script>
