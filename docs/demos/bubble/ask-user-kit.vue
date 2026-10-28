<template>
  <div class="ask-user-kit-demo">
    <div class="ask-user-kit-demo__controls">
      <TinyButton :disabled="!canStartTurn" @click="startTurn">
        {{ canStartTurn ? (requestState === 'completed' ? '再次发起 AskUser' : '发起 AskUser') : '等待回答中' }}
      </TinyButton>
      <span class="ask-user-kit-demo__status" role="status" aria-live="polite">{{ statusText }}</span>
    </div>

    <p v-if="errorMessage" class="ask-user-kit-demo__error" role="alert">{{ errorMessage }}</p>

    <div class="ask-user-kit-demo__messages">
      <TrBubbleList
        :messages="messages"
        :auto-scroll="true"
        @state-change="askUserRuntime.handleStateChange"
        @bubble-event="askUserRuntime.handleBubbleEvent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import { toolPlugin, useAskUserRuntime, useMessage } from '@opentiny/tiny-robot-kit'
import type { ChatCompletion, MessageRequestBody, Tool } from '@opentiny/tiny-robot-kit'
import { computed, onMounted, ref } from 'vue'

let callSequence = 0
let responseSequence = 0

const createCompletion = (
  message: NonNullable<ChatCompletion['choices'][number]['message']>,
  finishReason: 'stop' | 'tool_calls',
): ChatCompletion => ({
  id: `ask-user-kit-response-${++responseSequence}`,
  object: 'chat.completion',
  created: responseSequence,
  model: 'ask-user-demo-mock',
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
  await new Promise((resolve) => setTimeout(resolve, 350))

  if (abortSignal.aborted) {
    throw new DOMException('The request was aborted.', 'AbortError')
  }

  const latestMessage = requestBody.messages.at(-1)
  if (latestMessage?.role === 'tool') {
    return createCompletion(
      {
        role: 'assistant',
        content: `AskUser 工具已恢复，模型收到的结构化答案如下：\n\n${String(latestMessage.content ?? '{}')}`,
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
          id: `call-ask-user-demo-${++callSequence}`,
          index: 0,
          type: 'function',
          function: {
            name: 'ask_user',
            arguments: JSON.stringify({
              heading: '生产发布确认',
              questions: [
                {
                  id: 'environment',
                  question: '本次变更发布到哪个环境？',
                  options: [
                    { label: '预发布环境', description: '先完成验证' },
                    { label: '生产环境', description: '直接面向线上用户' },
                  ],
                  multiSelect: false,
                  allowCustom: true,
                },
                {
                  id: 'services',
                  question: '本次发布涉及哪些服务？',
                  options: [{ label: '订单服务' }, { label: '库存服务' }, { label: '支付服务' }],
                  multiSelect: true,
                  allowCustom: true,
                },
                {
                  id: 'changeSummary',
                  question: '请简要说明本次变更内容。',
                },
                {
                  id: 'confirmDeploy',
                  question: '发布后是否需要收到巡检摘要？',
                  options: [{ label: '需要' }, { label: '不需要' }],
                  multiSelect: false,
                  allowCustom: false,
                },
              ],
            }),
          },
        },
      ],
    },
    'tool_calls',
  )
}

const getTools = async (): Promise<Tool[]> => []

const message = useMessage({
  initialMessages: [
    {
      role: 'assistant',
      content:
        '此示例会通过 Kit 发起 AskUser 工具调用。请填写发布环境和涉及服务，再在“变更说明”步骤点击“跳过”，观察工具结果保留已填答案并将未填问题标记为 skipped。',
    },
  ],
  responseProvider,
  plugins: [
    toolPlugin({
      askUser: true,
      getTools,
      callTool: async () => '普通工具结果',
      persistPausedTurn: false,
    }),
  ],
})

const askUserRuntime = useAskUserRuntime(message)
const { canStartTurn, isPaused, messages, requestState, sendMessage } = message
const errorMessage = ref('')

const statusText = computed(() => {
  if (errorMessage.value || requestState.value === 'error') {
    return '演示失败，可重新发起'
  }
  if (isPaused.value || requestState.value === 'paused') {
    return 'AskUser 工具已暂停，等待表单提交'
  }
  if (requestState.value === 'processing') {
    return 'Kit 正在处理请求'
  }
  if (requestState.value === 'completed') {
    return '回答已返回给模型，可再次发起'
  }
  return '准备发起 AskUser 工具调用'
})

const startTurn = async () => {
  if (!canStartTurn.value) {
    return
  }

  errorMessage.value = ''
  try {
    await sendMessage('请收集发布环境、涉及服务、可选的变更说明，以及发布后是否需要巡检摘要。')
  } catch (error) {
    errorMessage.value = `演示失败：${error instanceof Error ? error.message : String(error)}`
  }
}

onMounted(() => {
  void startTurn()
})
</script>

<style scoped>
.ask-user-kit-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ask-user-kit-demo__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ask-user-kit-demo__status {
  color: #666;
  font-size: 13px;
}

.ask-user-kit-demo__error {
  margin: 0;
  color: #c00;
}

.ask-user-kit-demo__messages {
  height: clamp(320px, 65vh, 520px);
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.ask-user-kit-demo__messages :deep(.tr-bubble-list) {
  height: 100%;
}
</style>
