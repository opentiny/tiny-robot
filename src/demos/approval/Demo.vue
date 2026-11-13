<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { TrBubbleList, TrSender, type BubbleEvent, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import {
  toolPlugin,
  useMessage,
  TOOL_REJECT_COMMAND,
  TOOL_RESUME_COMMAND,
  type ChatCompletion,
  type ChatMessage,
  type ResponseProvider,
} from '@opentiny/tiny-robot-kit'

const error = ref('')
const input = ref('')
const roleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: { avatar: IconAi },
  user: { avatar: IconUser, placement: 'end' },
}
const pausedMessagesKey = 'tinyrobot-v1-demos:approval-messages'
const savedMessages = sessionStorage.getItem(pausedMessagesKey)
const clearPausedMessages = () => sessionStorage.removeItem(pausedMessagesKey)
const initialMessages: ChatMessage[] = savedMessages
  ? JSON.parse(savedMessages)
  : [
      {
        role: 'assistant',
        content:
          '本周产品进展\n\n聊天界面、扩展管理与工具确认已完成体验梳理。\n\n需要将这份周报保存到团队工作区吗？',
      },
    ]
let sequence = 0
const completion = (
  message: NonNullable<ChatCompletion['choices'][number]['message']>,
  finishReason: 'stop' | 'tool_calls',
): ChatCompletion => ({
  id: `demo-${++sequence}`,
  object: 'chat.completion',
  created: 0,
  model: 'demo-model',
  system_fingerprint: null,
  choices: [{ index: 0, message, delta: undefined, finish_reason: finishReason, logprobs: null }],
})
const responseProvider: ResponseProvider = async (body, signal) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  const last = body.messages.at(-1)
  if (last?.role === 'tool') {
    return completion(
      {
        role: 'assistant',
        content:
          last.content === '用户已拒绝本次保存。'
            ? '已取消保存，周报内容保留在当前对话中。'
            : '周报已保存到演示工作区。',
      },
      'stop',
    )
  }
  return completion(
    {
      role: 'assistant',
      content: '周报已经整理好，准备保存到工作区。',
      tool_calls: [
        {
          id: `save-${crypto.randomUUID()}`,
          index: 0,
          type: 'function',
          function: {
            name: '保存周报',
            arguments: JSON.stringify({ title: '本周产品进展', folder: '团队周报' }),
          },
        },
      ],
    },
    'tool_calls',
  )
}
const message = useMessage({
  initialMessages,
  responseProvider,
  plugins: [
    toolPlugin({
      getTools: () => [
        {
          type: 'function',
          function: {
            name: '保存周报',
            description: '将周报保存到团队工作区，需要用户确认。',
            parameters: {
              type: 'object',
              properties: { title: { type: 'string' }, folder: { type: 'string' } },
              required: ['title', 'folder'],
            },
          },
        },
      ],
      callTool: async () => '演示文档已保存。',
      shouldPauseToolCall: () => true,
      toolCallAwaitingApprovalContent: '保存前需要你的确认。',
      toolCallFailedContent: '用户已拒绝本次保存。',
      persistPausedTurn: true,
      onTurnPause: (context) =>
        sessionStorage.setItem(pausedMessagesKey, JSON.stringify(context.getState().messages)),
      onTurnEnd: clearPausedMessages,
      onTurnAbort: clearPausedMessages,
      maxToolRounds: 1,
    }),
  ],
})
const { messages, canStartTurn } = message
async function submit(text: string) {
  const request = text.trim()
  if (!request || !canStartTurn.value) return
  input.value = ''
  try {
    error.value = ''
    await message.sendMessage(request)
  } catch (cause) {
    error.value = String(cause)
  }
}
async function handleBubbleEvent(event: BubbleEvent) {
  if (event.name !== 'tool-call:resume' && event.name !== 'tool-call:reject') return
  const payload = event.payload as { toolCallId?: string } | undefined
  if (!payload?.toolCallId) return
  clearPausedMessages()
  try {
    await message.dispatchCommand(
      event.name === 'tool-call:resume' ? TOOL_RESUME_COMMAND : TOOL_REJECT_COMMAND,
      {
        toolCallId: payload.toolCallId,
      },
    )
  } catch (cause) {
    if (message.isPaused.value) {
      sessionStorage.setItem(pausedMessagesKey, JSON.stringify(messages.value))
    }
    error.value = String(cause)
  }
}
onUnmounted(() => {
  if (!message.isPaused.value) void message.abortRequest().catch(() => undefined)
})
defineExpose({ reset: message.abortRequest })
</script>

<template>
  <section class="feature-scene approval-scene">
    <div class="conversation-panel">
      <div class="conversation-toolbar">TinyRobot · 工作助手</div>
      <p v-if="error" role="alert" class="error-message">{{ error }}</p>
      <TrBubbleList
        :messages="messages"
        :role-configs="roleConfigs"
        :auto-scroll="true"
        @bubble-event="handleBubbleEvent"
      />
      <TrSender v-model="input" :disabled="!canStartTurn" placeholder="给工作助手发消息" @submit="submit" />
    </div>
  </section>
</template>
