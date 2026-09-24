import {
  useMessage,
  type MessageRequestBody,
  type ResponseProvider,
  type UseMessagePlugin,
} from '@opentiny/tiny-robot-kit'

const errorStateObserver: UseMessagePlugin = {
  name: 'demo-error-state-observer',
  onError({ currentTurn, error }) {
    const assistantMessage = [...currentTurn].reverse().find((message) => message.role === 'assistant')

    if (!assistantMessage) return

    assistantMessage.state = {
      ...assistantMessage.state,
      error: {
        name: error instanceof Error ? error.name : 'Error',
        message: error instanceof Error ? error.message : String(error),
      },
    }
  },
}

let responseIndex = 0

const responseProvider: ResponseProvider = async (requestBody: MessageRequestBody) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')

  if (text.includes('失败')) {
    throw new Error('示例请求失败：onError 已把这段信息写入 assistant 消息的 state.error。')
  }

  responseIndex += 1
  return {
    id: `message-error-demo-${responseIndex}`,
    object: 'chat.completion',
    created: responseIndex,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: `请求成功：${text || '本地响应'}` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

export function useMessageErrorHandling() {
  return useMessage({
    responseProvider,
    plugins: [errorStateObserver],
    initialMessages: [
      {
        role: 'assistant',
        content: '输入包含“失败”的内容触发错误；输入其他内容可继续发送并恢复。',
      },
    ],
  })
}
