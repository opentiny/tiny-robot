<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble :content="codeMessage" :avatar="aiAvatar" :fallback-content-renderer="CodeBlockRenderer"></tr-bubble>
    <tr-bubble :content="normalMessage" :avatar="aiAvatar"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { BubbleContentRendererProps, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineComponent, h } from 'vue'
import { useMessageContent } from '@opentiny/tiny-robot'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

// 定义代码消息类型
interface CodeMessage {
  type: 'code'
  language: string
  code: string
}

const codeMessage: CodeMessage[] = [
  {
    type: 'code',
    language: 'javascript',
    code: `function hello() {
  console.log('Hello, World!')
}`,
  },
]

const normalMessage = '这是一条普通消息'

// 自定义代码块渲染器
const CodeBlockRenderer = defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
    contentIndex: Number,
  },
  setup(props: BubbleContentRendererProps) {
    // 使用 useMessageContent 来正确处理数组内容和 contentIndex
    const { content: contentItem } = useMessageContent(props)

    return () => {
      const content = contentItem.value as unknown as CodeMessage

      if (!content || content.type !== 'code') {
        return h('div', '无效的代码内容')
      }

      return h('div', { class: 'code-block-wrapper' }, [
        h(
          'div',
          {
            class: 'code-block-header',
            style: {
              padding: '8px 12px',
              background: '#2d2d2d',
              color: '#fff',
              fontSize: '12px',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
            },
          },
          content.language || 'code',
        ),
        h(
          'pre',
          {
            class: 'code-block-content',
            style: {
              margin: 0,
              padding: '12px',
              background: '#1e1e1e',
              color: '#d4d4d4',
              fontSize: '14px',
              fontFamily: 'monospace',
              borderBottomLeftRadius: '6px',
              borderBottomRightRadius: '6px',
              overflow: 'auto',
            },
          },
          h('code', {}, content.code),
        ),
      ])
    }
  },
})
</script>

<style scoped>
.code-block-wrapper {
  width: 100%;
  max-width: 100%;
}
</style>
