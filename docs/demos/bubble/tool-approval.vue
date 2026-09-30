<template>
  <div class="tool-approval-demo">
    <div class="tool-approval-demo__controls">
      <tiny-button class="tool-approval-demo__start-button" :disabled="!canStartTurn" @click="startApproval">
        {{
          canStartTurn ? (requestState === 'completed' ? '再次发起审批' : '发起审批') : isPaused ? '等待审批' : '处理中'
        }}
      </tiny-button>
      <span class="tool-approval-demo__status" role="status" aria-live="polite">{{ statusText }}</span>
    </div>
    <p v-if="errorMessage" class="tool-approval-demo__error" role="alert">{{ errorMessage }}</p>
    <div class="tool-approval-demo__messages">
      <tr-bubble-list :messages="messages" :auto-scroll="true" @bubble-event="handleBubbleEvent"></tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { BubbleEvent } from '@opentiny/tiny-robot'
import { TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND, toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'
import type { ChatCompletion, MessageRequestBody, Tool } from '@opentiny/tiny-robot-kit'
import { computed, onMounted, ref } from 'vue'

let approvalRun = 0
let responseSequence = 0

const createCompletion = (
  message: NonNullable<ChatCompletion['choices'][number]['message']>,
  finishReason: 'stop' | 'tool_calls',
): ChatCompletion => ({
  id: `tool-approval-response-${++responseSequence}`,
  object: 'chat.completion',
  created: responseSequence,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message,
      delta: undefined,
      finish_reason: finishReason,
      logprobs: null,
    },
  ],
})

const responseProvider = async (requestBody: MessageRequestBody, abortSignal: AbortSignal): Promise<ChatCompletion> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (abortSignal.aborted) {
    throw new DOMException('The request was aborted.', 'AbortError')
  }

  const latestMessage = requestBody.messages.at(-1)
  if (latestMessage?.role === 'tool') {
    const wasRejected = latestMessage.content === '工具调用已拒绝。'
    return createCompletion(
      {
        role: 'assistant',
        content: wasRejected ? '你已拒绝发送邮件，邮件未发送。' : '邮件工具已执行，审批流程完成。',
      },
      'stop',
    )
  }

  return createCompletion(
    {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          id: `call-tool-approval-${++approvalRun}`,
          index: 0,
          type: 'function',
          function: {
            name: 'send_email',
            arguments: JSON.stringify({
              to: 'team@example.com',
              subject: '周报',
              body: '本周工作进展请查收。',
            }),
          },
        },
      ],
    },
    'tool_calls',
  )
}

const getTools = async (): Promise<Tool[]> => [
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: '发送邮件，需要用户确认。',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  },
]

const message = useMessage({
  initialMessages: [
    {
      role: 'assistant',
      content: '示例会自动发起一次邮件工具调用，请在工具卡片中选择是否执行。',
    },
  ],
  responseProvider,
  plugins: [
    toolPlugin({
      getTools,
      callTool: async () => '邮件已发送。',
      shouldPauseToolCall: (toolCall) => toolCall.function.name === 'send_email',
      toolCallAwaitingApprovalContent: '发送邮件前需要确认。',
      toolCallFailedContent: '工具调用已拒绝。',
      persistPausedTurn: false,
    }),
  ],
})

const { messages, sendMessage } = message
const { canStartTurn, isPaused, requestState } = message
const errorMessage = ref('')

const statusText = computed(() => {
  if (errorMessage.value || requestState.value === 'error') {
    return '演示失败，可重新发起'
  }

  if (isPaused.value || requestState.value === 'paused') {
    return '等待你选择允许或拒绝'
  }

  if (requestState.value === 'processing') {
    return '正在处理工具调用'
  }

  if (requestState.value === 'completed') {
    return '审批流程完成，可再次发起'
  }

  return '准备发起审批'
})

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const startApproval = async () => {
  if (!canStartTurn.value) {
    return
  }

  errorMessage.value = ''

  try {
    await sendMessage('请发送本周邮件')
  } catch (error) {
    errorMessage.value = `演示失败：${getErrorMessage(error)}`
  }
}

const handleBubbleEvent = async (event: BubbleEvent) => {
  if (event.name !== 'tool-call:resume' && event.name !== 'tool-call:reject') {
    return
  }

  const payload = event.payload
  if (!payload || typeof payload !== 'object' || !('toolCallId' in payload)) {
    return
  }

  const { toolCallId } = payload as { toolCallId?: unknown }
  if (typeof toolCallId !== 'string' || !toolCallId) {
    return
  }

  const command = event.name === 'tool-call:resume' ? TOOL_RESUME_COMMAND : TOOL_REJECT_COMMAND
  try {
    errorMessage.value = ''
    await message.dispatchCommand(command, { toolCallId })
  } catch (error) {
    errorMessage.value = `审批处理失败：${getErrorMessage(error)}`
  }
}

onMounted(() => {
  void startApproval()
})
</script>

<style scoped>
.tool-approval-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-approval-demo__controls {
  align-items: center;
  display: flex;
  gap: 12px;
}

.tool-approval-demo__status {
  color: #666;
  font-size: 13px;
}

.tool-approval-demo__error {
  color: #c00;
  margin: -8px 0 0;
}

.tool-approval-demo__messages {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  height: clamp(260px, 60vh, 420px);
  overflow: hidden;
}

.tool-approval-demo__messages :deep(.tr-bubble-list) {
  height: 100%;
}
</style>
