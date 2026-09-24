<template>
  <div class="tool-approval-demo">
    <tr-bubble-list :messages="messages" @bubble-event="handleBubbleEvent"></tr-bubble-list>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, type BubbleEvent } from '@opentiny/tiny-robot'
import {
  type ChatCompletion,
  type MessageRequestBody,
  type Tool,
  TOOL_REJECT_COMMAND,
  TOOL_RESUME_COMMAND,
  toolPlugin,
  useMessage,
} from '@opentiny/tiny-robot-kit'
import { onMounted } from 'vue'

const createCompletion = (
  message: ChatCompletion['choices'][number]['message'],
  finishReason: 'stop' | 'tool_calls',
): ChatCompletion => ({
  id: `tool-approval-${Date.now()}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
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

  const toolMessage = requestBody.messages.find((message) => message.role === 'tool')
  if (toolMessage) {
    const wasRejected = toolMessage.content === '工具调用已拒绝。'
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
          id: 'call-tool-approval-demo',
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
  await message.dispatchCommand(command, { toolCallId })
}

onMounted(() => {
  void sendMessage('请发送本周邮件').catch((error) => {
    console.error('Tool approval demo failed:', error)
  })
})
</script>

<style scoped>
.tool-approval-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
