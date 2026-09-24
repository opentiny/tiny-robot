<script setup lang="ts">
import {
  TrBubbleList,
  TrBubbleProvider,
  TrSender,
  type BubbleErrorRendererProps,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { defineComponent, h, markRaw, ref, type PropType } from 'vue'
import { useMessageErrorHandling } from './ErrorHandling'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
const { messages, isProcessing, sendMessage, abortRequest } = useMessageErrorHandling()

const inputMessage = ref('')
const useCustomRenderer = ref(false)
const submitStatus = ref('尚未发送')

const CustomErrorRenderer = markRaw(
  defineComponent({
    name: 'DemoCustomErrorRenderer',
    props: {
      message: {
        type: Object as PropType<BubbleErrorRendererProps['message']>,
        required: true,
      },
    },
    setup(props) {
      return () => {
        const error = props.message.state?.error as { message?: string } | undefined
        return h(
          'div',
          {
            role: 'alert',
            style: {
              maxWidth: '100%',
              minWidth: 0,
              padding: '12px 16px',
              color: 'var(--tr-color-error)',
              background: 'var(--tr-color-error-light)',
              border: '2px dashed var(--tr-color-error)',
              borderRadius: '8px',
              overflowWrap: 'anywhere',
            },
          },
          `自定义错误视图：${error?.message ?? String(props.message.state?.error)}`,
        )
      }
    },
  }),
)

async function handleSubmit(content: string) {
  const text = content.trim()
  if (!text || isProcessing.value) return

  inputMessage.value = ''
  submitStatus.value = '请求处理中'

  try {
    await sendMessage(text)
    submitStatus.value = '请求成功，可继续发送'
  } catch {
    submitStatus.value = '请求 Promise 已 reject；错误详情已写入所属消息'
  }
}

async function triggerFailure(custom: boolean) {
  useCustomRenderer.value = custom
  await handleSubmit('触发失败')
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
</script>

<template>
  <section class="message-error-demo">
    <p class="message-error-demo__hint">
      同一个消息错误既可使用默认渲染器，也可由 BubbleProvider 统一替换；两种路径都可以重复触发。
    </p>
    <div class="message-error-demo__actions">
      <button type="button" :disabled="isProcessing" @click="triggerFailure(false)">默认错误视图</button>
      <button type="button" :disabled="isProcessing" @click="triggerFailure(true)">自定义错误视图</button>
      <button type="button" :disabled="isProcessing" @click="handleSubmit('恢复成功')">发送成功消息</button>
    </div>
    <p class="message-error-demo__status" aria-live="polite">{{ submitStatus }}</p>
    <tr-bubble-provider :error-renderer="useCustomRenderer ? CustomErrorRenderer : undefined">
      <tr-bubble-list :messages="messages" :role-configs="roles" />
    </tr-bubble-provider>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '输入内容；包含“失败”会触发错误'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    />
  </section>
</template>

<style scoped>
.message-error-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.message-error-demo__hint,
.message-error-demo__status {
  margin: 0;
  overflow-wrap: anywhere;
}

.message-error-demo__hint,
.message-error-demo__status {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 14px;
}

.message-error-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.message-error-demo__actions button {
  min-height: 32px;
  padding: 6px 12px;
  border: 1px solid var(--tr-color-primary, #1476ff);
  border-radius: 6px;
  color: var(--tr-color-primary, #1476ff);
  background: var(--tr-container-bg-default, #fff);
  cursor: pointer;
  font: inherit;
}

.message-error-demo__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
