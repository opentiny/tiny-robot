import type { ChatCompletion, MessageRequestBody, Tool, ToolCall, UseMessageOptions } from '@opentiny/tiny-robot-kit'

type MockToolScene = {
  name: string
  toolName: string
  keywords: string[]
  args: Record<string, string>
}

type MockDelta = {
  role?: string
  content?: string
  tool_calls?: ToolCall[]
}

const toolScenes: MockToolScene[] = [
  {
    name: 'order',
    toolName: 'query_order_status',
    keywords: ['订单', '发货', '没发货', '未发货'],
    args: { orderId: 'MOCK-20260526001' },
  },
  {
    name: 'refund',
    toolName: 'query_refund_status',
    keywords: ['退款', '退钱', '到账'],
    args: { refundId: 'REFUND-20260526001' },
  },
  {
    name: 'logistics',
    toolName: 'query_logistics',
    keywords: ['物流', '快递', '到哪'],
    args: { trackingNo: 'SF1234567890' },
  },
]

export const initialMessages = [
  {
    role: 'assistant',
    content: '您好，我是 AI 智能客服，请问有什么可以帮助您？',
  },
]

export const mockTools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'query_order_status',
      description: '查询订单的付款、发货和处理状态。',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: '订单编号' },
        },
        required: ['orderId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_refund_status',
      description: '查询退款申请的处理进度。',
      parameters: {
        type: 'object',
        properties: {
          refundId: { type: 'string', description: '退款编号' },
        },
        required: ['refundId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_logistics',
      description: '查询包裹的物流轨迹和预计送达时间。',
      parameters: {
        type: 'object',
        properties: {
          trackingNo: { type: 'string', description: '物流单号' },
        },
        required: ['trackingNo'],
      },
    },
  },
]

const normalReply =
  '您好，这类问题我可以先帮您做基础判断。为了更准确地处理，建议您补充订单号、商品名称或当前页面提示信息，我会根据上下文继续给出处理建议。'

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })

const findToolScene = (content: string) => {
  return toolScenes.find((scene) => scene.keywords.some((keyword) => content.includes(keyword)))
}

const findLastUserMessage = (requestBody: MessageRequestBody) => {
  return requestBody.messages.findLast((message) => message.role === 'user')?.content ?? ''
}

const createChunk = (delta: MockDelta, finishReason: string | null): ChatCompletion => ({
  id: 'mock-chat',
  object: 'chat.completion.chunk',
  created: Math.floor(Date.now() / 1000),
  model: 'mock-model',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: undefined,
      delta,
      logprobs: null,
      finish_reason: finishReason,
    },
  ],
})

async function* streamText(text: string, abortSignal: AbortSignal): AsyncGenerator<ChatCompletion> {
  for (const [index, char] of Array.from(text).entries()) {
    await wait(24, abortSignal)
    yield createChunk({ role: index === 0 ? 'assistant' : undefined, content: char }, null)
  }

  yield createChunk({}, 'stop')
}

const createToolCallChunk = (scene: MockToolScene): ChatCompletion => {
  const toolCall: ToolCall = {
    index: 0,
    id: `call_${scene.name}_${Date.now()}`,
    type: 'function',
    function: {
      name: scene.toolName,
      arguments: JSON.stringify(scene.args),
    },
  }

  return createChunk({ role: 'assistant', tool_calls: [toolCall] }, 'tool_calls')
}

const getToolFinalReply = (requestBody: MessageRequestBody) => {
  const toolMessage = requestBody.messages.findLast((message) => message.role === 'tool')
  const content = typeof toolMessage?.content === 'string' ? toolMessage.content : '{}'

  try {
    const result = JSON.parse(content)

    if (result.type === 'order') {
      return `我刚刚查询了订单状态：订单 ${result.orderId} 已付款，目前处于仓库处理中，预计 ${result.estimatedShipTime} 发货。您可以继续等待发货通知，如果超过预计时间仍未发出，可以选择联系人工客服协助催发。`
    }

    if (result.type === 'refund') {
      return `我刚刚查询了退款进度：退款 ${result.refundId} 已提交，目前是 ${result.status}，预计 ${result.estimatedArrival} 到账。不同银行处理时间会略有差异，您也可以在订单售后页查看最新进度。`
    }

    if (result.type === 'logistics') {
      return `我刚刚查询了物流信息：包裹 ${result.trackingNo} 当前状态为 ${result.status}，最新节点是“${result.latestTrace}”，预计 ${result.estimatedDelivery} 送达。`
    }
  } catch {
    return '工具查询已经完成，但结果格式暂时无法解析。您可以稍后重试，或联系人工客服继续处理。'
  }

  return '工具查询已经完成，我会根据查询结果继续为您处理。'
}

async function* createMockResponse(
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): AsyncGenerator<ChatCompletion> {
  await wait(600, abortSignal)

  const lastMessage = requestBody.messages.at(-1)

  if (lastMessage?.role === 'tool') {
    yield* streamText(getToolFinalReply(requestBody), abortSignal)
    return
  }

  const userMessage = findLastUserMessage(requestBody)
  const scene = findToolScene(userMessage)

  if (scene) {
    yield createToolCallChunk(scene)
    return
  }

  if (Math.random() < 0.35) {
    throw new Error('Mock response failed')
  }

  yield* streamText(normalReply, abortSignal)
}

export const mockCallTool = async (toolCall: ToolCall) => {
  await new Promise((resolve) => window.setTimeout(resolve, 2000))

  if (toolCall.function.name === 'query_order_status') {
    const args = JSON.parse(toolCall.function.arguments || '{}')
    return {
      type: 'order',
      orderId: args.orderId,
      status: '仓库处理中',
      paid: true,
      estimatedShipTime: '明天 18:00 前',
    }
  }

  if (toolCall.function.name === 'query_refund_status') {
    const args = JSON.parse(toolCall.function.arguments || '{}')
    return {
      type: 'refund',
      refundId: args.refundId,
      status: '银行处理中',
      estimatedArrival: '1-3 个工作日内',
    }
  }

  if (toolCall.function.name === 'query_logistics') {
    const args = JSON.parse(toolCall.function.arguments || '{}')
    return {
      type: 'logistics',
      trackingNo: args.trackingNo,
      status: '运输中',
      latestTrace: '包裹已到达本地分拨中心',
      estimatedDelivery: '明天',
    }
  }

  return {
    type: 'unknown',
    message: '未匹配到可用工具',
  }
}

export const mockResponseProvider = createMockResponse as UseMessageOptions['responseProvider']
