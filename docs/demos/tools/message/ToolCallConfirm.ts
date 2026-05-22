import type { ChatCompletion, MessageRequestBody, Tool } from '@opentiny/tiny-robot-kit'
import { toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'

const getTools = async (): Promise<Tool[]> => [
  {
    type: 'function',
    function: {
      name: 'search_private_docs',
      description: '搜索内部文档。',
      parameters: {
        type: 'object',
        properties: { keyword: { type: 'string' } },
        required: ['keyword'],
      },
    },
  },
]

export function useMessageToolCallConfirm() {
  return useMessage({
    responseProvider: mockStreamWithConfirmTools,
    plugins: [
      toolPlugin({
        getTools,
        confirmToolCall() {
          return true
        },
        callTool: async (toolCall) => {
          const args = JSON.parse(toolCall.function?.arguments || '{}')
          return `已搜索内部文档：${args.keyword}`
        },
      }),
    ],
    initialMessages: [
      {
        content: '发送任意消息后，示例会模拟一次需要确认的工具调用。',
        role: 'assistant',
      },
    ],
  })
}

async function* mockStreamWithConfirmTools(
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): AsyncGenerator<ChatCompletion> {
  const msgs = requestBody.messages || []
  const last = msgs[msgs.length - 1]
  const id = 'mock-confirm-tool-' + Date.now()

  if (last?.role === 'tool') {
    const text = '工具调用已处理完成。'
    for (let i = 0; i < text.length && !abortSignal.aborted; i++) {
      await new Promise((resolve) => setTimeout(resolve, 40))
      const content = text[i]
      yield {
        id,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: undefined,
            delta: i === 0 ? { role: 'assistant', content } : { content },
            finish_reason: i === text.length - 1 ? 'stop' : null,
            logprobs: null,
          },
        ],
      }
    }
    return
  }

  await new Promise((resolve) => setTimeout(resolve, 300))
  yield {
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: undefined,
        delta: {
          role: 'assistant',
          content: '这个操作需要确认后再执行。',
          tool_calls: [
            {
              index: 0,
              id: 'call_confirm_search_1',
              type: 'function',
              function: {
                name: 'search_private_docs',
                arguments: '{"keyword":"Q3 roadmap"}',
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
        logprobs: null,
      },
    ],
  }
}
