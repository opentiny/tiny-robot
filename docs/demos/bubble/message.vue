<template>
  <tr-bubble :messages="messages" :avatar="aiAvatar" placement="start"></tr-bubble>
  <hr />
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
    <button @click="addToolCallMessage">添加工具调用消息</button>
    <button @click="setThinkingContent">设置思考过程</button>
  </div>
</template>

<script setup lang="ts">
import { TrBubble, BubbleMessageProps, BubbleStepGroupMessageProps, BubbleTextStepItem } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const thinkingContent = `已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。`

const messages = ref<BubbleMessageProps[]>([
  {
    type: 'text',
    content: '我是普通的文本消息',
  },
  {
    type: 'text',
    content: '下面是 markdown 消息',
  },
  {
    type: 'markdown',
    content: `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,
  },
  {
    type: 'text',
    content: '下面是 step-group 消息',
  },
  {
    type: 'step-group',
    data: {
      title: '已接收到你的任务，我将立即开始处理...',
      status: 'running',
      steps: [
        {
          type: 'tool',
          name: 'DayWeather',
          status: 'success',
        },
        {
          type: 'text',
          title: '思考过程',
          content: thinkingContent,
        },
        {
          type: 'tool',
          name: 'maps_geo',
          status: 'running',
        },
      ],
    },
  } satisfies BubbleStepGroupMessageProps,
])

const addToolCallMessage = () => {
  ;(messages.value[4] as BubbleStepGroupMessageProps).data.steps.push({
    type: 'text',
    title: '思考过程',
    content:
      '已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。',
  })
}

const setThinkingContent = () => {
  const step = (messages.value[4] as BubbleStepGroupMessageProps).data.steps[1] as BubbleTextStepItem
  step.content = ''
  for (let i = 0; i < thinkingContent.length; i += 1) {
    setTimeout(() => {
      step.content += thinkingContent[i]
    }, i * 100)
  }
}
</script>
