<template>
  <tr-bubble-provider :content-renderer-matches="contentRendererMatches" :content-attributes="contentAttributes">
    <tr-bubble
      content="最终答案：1 + 1 在二进制中等于 10。"
      reasoning_content="先按十进制理解 1 + 1 = 2，再把 2 转成二进制，结果是 10。"
      :avatar="aiAvatar"
    ></tr-bubble>
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import {
  BubbleRendererMatchPriority,
  type BubbleContentAttributesConfig,
  type BubbleContentRendererMatch,
  TrBubble,
  TrBubbleProvider,
} from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, markRaw } from 'vue'
import RecursiveReasoningRenderer from './RecursiveReasoningRenderer.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => typeof message.reasoning_content === 'string',
    renderer: markRaw(RecursiveReasoningRenderer),
    priority: BubbleRendererMatchPriority.NORMAL - 1,
    attributes: { 'data-renderer': 'custom-recursive-reasoning' },
  },
]

const contentAttributes: BubbleContentAttributesConfig = (message, content, contentIndex) => {
  const isReasoning = typeof message.reasoning_content === 'string' && message.reasoning_content

  return {
    'data-demo-kind': isReasoning ? 'reasoning' : 'content',
    'data-role': message.role || 'assistant',
    'data-content-type': content.type,
    'data-content-index': contentIndex,
  }
}
</script>
