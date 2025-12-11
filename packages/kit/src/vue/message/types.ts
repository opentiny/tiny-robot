/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybePromise } from '../../types'
import { ComputedRef, Ref } from 'vue'

export interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    /**
     * function 的输入参数，以 JSON Schema 对象描述
     */
    parameters: any
  }
  [key: string]: any
}

// Message metadata interface
export interface MessageMetadata {
  createdAt?: number
  updatedAt?: number
  id?: string
  model?: string
  [key: string]: any
}

// Base message interface
export interface ChatMessage {
  role: string
  content: string
  metadata?: MessageMetadata
  tool_calls?: ToolCall[]
  tool_call_id?: string
  [key: string]: any
  [key: symbol]: any
}

// Request body for plugins - only contains messages and additional parameters
export interface MessageRequestBody {
  messages: Partial<ChatMessage>[]
  [key: string]: any
}

// Define different states for the request process
export type RequestState = 'idle' | 'processing' | 'completed' | 'aborted' | 'error'
export type RequestProcessingState = 'requesting' | 'streaming' | string

export interface ToolCall {
  index: number
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string // JSON string
    result?: string
  }
}

// Usage information for API response
export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  prompt_tokens_details?: {
    cached_tokens: number
  }
  prompt_cache_hit_tokens?: number
  prompt_cache_miss_tokens?: number
}

// Delta content for streaming responses
export interface Delta {
  role?: string
  content?: string
  tool_calls?: ToolCall[]
  [key: string]: any
}

// Choice item in streaming response
export interface Choice {
  index: number
  delta: Delta
  logprobs: any
  finish_reason: string | null
}

// SSE chunk data structure for streaming responses
export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string | null
  choices: Choice[]
  usage?: Usage
}

export interface useMessageOptions {
  initialMessages?: ChatMessage[]
  requestMessageFields?: (keyof ChatMessage)[]
  plugins?: useMessagePlugin[]
  responseProvider: <T = StreamChunk>(
    requestBody: MessageRequestBody,
    abortSignal: AbortSignal,
  ) => Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>
  onStreamChunk?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      chunk: StreamChunk
    },
    runDefault: () => void,
  ) => void
}

export interface UseMessageReturn {
  requestState: Ref<RequestState>
  processingState: Ref<RequestProcessingState | undefined>
  messages: Ref<ChatMessage[]>
  isProcessing: ComputedRef<boolean>
  sendMessage: (content: string) => Promise<void>
  send: (...msgs: ChatMessage[]) => Promise<void>
  abortRequest: () => void
  setResponseProvider: (provider: useMessageOptions['responseProvider']) => void
}

export interface BasePluginContext {
  messages: ChatMessage[]
  currentTurn: ChatMessage[]
  requestState: RequestState
  processingState?: RequestProcessingState
  requestMessageFields: (keyof ChatMessage)[]
  plugins: useMessagePlugin[]
  setRequestState: (state: RequestState, processingState?: RequestProcessingState) => void
  abortSignal: AbortSignal
}

export interface useMessagePlugin {
  /**
   * 插件名称。
   */
  name?: string
  /**
   * 一次对话回合（turn）开始钩子：用户消息入队后、正式发起请求之前触发。
   * 按插件注册顺序串行执行，便于做有序初始化/校验；出错则中断流程。
   */
  onTurnStart?: (context: BasePluginContext) => MaybePromise<void>
  /**
   * 一次对话回合（turn）结束的生命周期钩子。
   * 触发时机：本轮对话完成（成功、被中止）后
   * 执行策略：按插件注册顺序串行执行，有错误则中断流程
   */
  onTurnEnd?: (context: BasePluginContext) => MaybePromise<void>
  /**
   * 请求开始前的生命周期钩子。
   * 触发时机：已组装 requestBody，正式发起请求之前。
   * 执行策略：按插件注册顺序串行执行，避免并发修改 requestBody 产生冲突。
   * 用途：增补 tools、注入上下文参数、进行参数校验等。
   */
  onBeforeRequest?: (
    context: BasePluginContext & {
      requestBody: MessageRequestBody
    },
  ) => MaybePromise<void>
  /**
   * 请求完成后的生命周期钩子（如收到 AI 响应或需要处理 tool_calls 等）。
   * 触发时机：本次请求（含流式）结束后。
   * 执行策略：并行执行（Promise.all），各插件通过 appendMessage 追加消息。
   */
  onAfterRequest?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      lastChoiceChunk?: Choice
      appendMessage: (message: ChatMessage | ChatMessage[]) => void
      requestNext: () => void
    },
  ) => MaybePromise<void>
  /**
   * SSE 数据块处理钩子，在接收到每个数据块时触发。
   * 用途：自定义增量合并、实时 UI 效果等。
   */
  onStreamChunk?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      chunk: StreamChunk
    },
  ) => void
  onError?: (context: BasePluginContext & { error: unknown }) => void
}
