<template>
  <div class="demo">
    <p class="desc">
      外层气泡容器是 Box，里面的每一段内容是 Content。点击下方任意 Box 或 Content，可查看该 DOM 节点上的真实 data-*
      属性。
    </p>

    <div class="preview" @click="handleInspect">
      <tr-bubble-provider :box-attributes="boxAttributes" :content-attributes="contentAttributes">
        <tr-bubble-list :messages="messages" :role-configs="roleConfigs" content-render-mode="split"></tr-bubble-list>
      </tr-bubble-provider>
    </div>

    <pre class="output">{{ output }}</pre>
  </div>
</template>

<script setup lang="ts">
import type {
  BubbleBoxAttributesConfig,
  BubbleContentAttributesConfig,
  BubbleMessage,
  BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { TrBubbleList, TrBubbleProvider } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const messages: BubbleMessage[] = [
  { role: 'user', content: '请总结今天会议。' },
  {
    role: 'assistant',
    content: [
      { type: 'text', text: '重点一：支持 BubbleProvider 统一注入 attributes。' },
      { type: 'text', text: '重点二：支持按消息上下文动态生成 attributes。' },
    ],
  },
]

const roleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: {
    avatar: h(IconAi, { style: { fontSize: '28px' } }),
  },
  user: {
    avatar: h(IconUser, { style: { fontSize: '28px' } }),
    placement: 'end',
  },
}

const boxAttributes: BubbleBoxAttributesConfig = (messages, content, contentIndex) => ({
  'data-demo-kind': 'box',
  'data-role': messages[0]?.role || 'unknown',
  'data-message-count': messages.length,
  'data-content-type': content?.type || 'unknown',
  'data-content-index': contentIndex ?? 'unknown',
})

const contentAttributes: BubbleContentAttributesConfig = (message, content, contentIndex) => ({
  'data-demo-kind': 'content',
  'data-role': message.role || 'unknown',
  'data-content-type': content.type,
  'data-content-index': contentIndex,
})

const output = ref('点击预览区域中的节点后，这里会显示该节点上的 data-* 属性。')

const handleInspect = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  const element = target?.closest('[data-demo-kind]') as HTMLElement | null

  if (!element) {
    return
  }

  const dataAttributes = Object.fromEntries(
    element
      .getAttributeNames()
      .filter((name) => name.startsWith('data-') && !name.startsWith('data-v-'))
      .map((name) => [name, element.getAttribute(name)]),
  )

  output.value = JSON.stringify(dataAttributes, null, 2)
}
</script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desc {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.preview {
  padding: 12px;
  border: 1px solid var(--vp-c-divider, #ddd);
  background: var(--vp-c-bg-soft, #f6f6f7);
}

.preview :deep([data-demo-kind]) {
  cursor: pointer;
}

.preview :deep([data-demo-kind='box']) {
  outline: 1px dashed #f59e0b;
}

.preview :deep([data-demo-kind='content']) {
  outline: 1px solid #60a5fa;
}

.output {
  margin: 0;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg-soft, #f5f5f5);
  border: 1px solid var(--vp-c-divider, #ddd);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
