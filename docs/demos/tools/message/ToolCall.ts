import type { ChatCompletion, MessageRequestBody, Tool } from '@opentiny/tiny-robot-kit'
import { toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'

// 模拟流式：若最后一条是 user，则返回带 tool_calls 的 assistant 消息；否则返回最终文本。
async function* mockStreamWithTools(
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): AsyncGenerator<ChatCompletion> {
  const msgs = requestBody.messages || []
  const last = msgs[msgs.length - 1]
  const id = 'mock-tool-' + Date.now()

  if (last?.role === 'tool') {
    // 第二轮：返回最终回答（无 tool_calls）
    const text = '根据天气结果，总结如下：晴，25°C。'
    for (let i = 0; i < text.length && !abortSignal.aborted; i++) {
      await new Promise((r) => setTimeout(r, 60))
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

  // 第一轮：返回 tool_calls（get_weather）
  await new Promise((r) => setTimeout(r, 400))
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
          tool_calls: [
            {
              index: 0,
              id: 'call_mock_weather_1',
              type: 'function',
              function: {
                name: 'get_weather',
                arguments: '{"city":"Beijing"}',
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

const getTools = async (): Promise<Tool[]> => [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '根据城市名称查询天气。',
      parameters: {
        type: 'object',
        properties: { city: { type: 'string' } },
        required: ['city'],
      },
    },
  },
]

/**
 * useMessage 工具调用：toolPlugin 的 getTools + callTool，responseProvider 模拟 tool_calls
 */
export function useMessageToolCall() {
  return useMessage({
    responseProvider: mockStreamWithTools,
    plugins: [
      toolPlugin({
        getTools,
        callTool: async (toolCall) => {
          const args = JSON.parse(toolCall.function?.arguments || '{}')
          return `${args.city} 天气：晴，25°C。`
        },
        toolCallCancelledContent: '工具调用已取消。',
        toolCallFailedContent: '工具调用失败。',
      }),
    ],
    initialMessages: [
      {
        content: '可询问天气（如「北京天气怎么样？」），示例会模拟一次工具调用。',
        role: 'assistant',
      },
    ],
  })
}
