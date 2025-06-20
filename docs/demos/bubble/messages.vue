<template>
  <tr-bubble-provider :message-renderers="messageRenderers">
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

// function renderer
const customTextRenderer = (props: BubbleMessageProps) => {
  return h('div', { style: { color: 'red', fontStyle: 'italic' } }, props.content)
}

// class renderer
const markdownRenderer = new BubbleMarkdownMessageRenderer()

// register renderer
const messageRenderers = {
  'custom-text': customTextRenderer,
  markdown: markdownRenderer,
}

const thinkingContent = `已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。`

const messages = ref<BubbleMessageProps[]>([
  {
    type: 'text',
    content: '我使用默认的文本渲染器（组件渲染器）',
    style: {
      fontWeight: 'bold',
    },
    'data-id': 'test-id-1',
    onClick: () => {
      alert('点击了文本消息')
    },
  },
  {
    type: 'custom-text',
    content: '我使用自定义的文本渲染器（函数渲染器）',
  },
  {
    type: 'markdown',
    content: `# 我使用Markdown渲染器（类渲染器）`,
  },
  {
    type: 'tool',
    name: 'DayWeather（工具渲染器）',
    status: 'success',
    params: JSON.stringify({
      city: '西安',
      date: '2025-05-31',
      number: 123,
      boolean: true,
      null: null,
      object: {
        a: 1,
      },
    }),
    formatPretty: true,
  },
  {
    type: 'collapse',
    title: '思考过程（折叠消息渲染器）',
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
  const message = messages.value.find((m) => m.type === 'collapse')
  if (!message) {
    return
  }
  message.content = ''
  for (let i = 0; i < thinkingContent.length; i += 1) {
    setTimeout(() => {
      message.content += thinkingContent[i]
    }, i * 100)
  }
}
</script>
