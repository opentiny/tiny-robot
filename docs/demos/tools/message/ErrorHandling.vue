<template>
  <div>
    <p class="hint">
      使用插件的 <code>onError</code> 处理错误；输入「error-renderer」通过 BubbleProvider 的 error 渲染器展示不同 UI。
    </p>
    <tr-bubble-provider :box-renderer-matches="boxRendererMatches" :content-renderer-matches="contentRendererMatches">
      <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    </tr-bubble-provider>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '输入消息（error / error-renderer）'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import {
  BubbleRenderers,
  TrBubbleList,
  TrBubbleProvider,
  TrSender,
  type BubbleBoxRendererMatch,
  type BubbleContentRendererMatch,
  type BubbleContentRendererProps,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { defineComponent, h, markRaw, ref } from 'vue'
import { useMessageErrorHandling } from './ErrorHandling'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageErrorHandling()

const inputMessage = ref('')

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}

// Box 匹配：错误消息使用自带的 Box 渲染器，attributes 加 class 去掉 padding，data-shape 为 none
const boxRendererMatches: BubbleBoxRendererMatch[] = [
  {
    find: (messages) => messages[0]?.state?.error != null,
    renderer: markRaw(BubbleRenderers.Box),
    attributes: { class: 'error-box-no-padding', 'data-shape': 'none' },
    priority: 0, // 默认优先级是0，优先级越小越先匹配
  },
]

// 自定义 error 内容渲染器：当 message.state.error 存在时使用，从 state.error 读取错误信息
const ErrorContentRenderer = defineComponent<BubbleContentRendererProps>({
  props: { message: { type: Object, required: true }, contentIndex: { type: Number, required: true } },
  setup(props: BubbleContentRendererProps) {
    const errorInfo = props.message?.state?.error as { message?: string } | undefined
    const errorMessage = errorInfo?.message ?? ''
    return () =>
      h(
        'div',
        {
          class: 'error-renderer',
          style: {
            padding: '12px 16px',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          },
        },
        [
          h('span', { style: { flexShrink: 0, fontSize: '18px' } }, '⚠️'),
          h('div', { style: { flex: 1 } }, [
            h('div', { style: { fontWeight: 600, marginBottom: '4px' } }, '错误'),
            h('div', { style: { fontSize: '14px', opacity: 0.9 } }, errorMessage),
          ]),
        ],
      )
  },
})

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => message.state?.error != null,
    renderer: markRaw(ErrorContentRenderer),
    priority: 0, // 默认优先级是0，优先级越小越先匹配
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
</script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
}
/* Box 匹配的 attributes.class，通过变量去掉 padding */
:deep(.error-box-no-padding) {
  --tr-bubble-box-padding: 0;
}
</style>
