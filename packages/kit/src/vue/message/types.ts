/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, Ref } from 'vue'
import { ChatMessage, MaybePromise, ToolCall } from '../../types'

export interface Tool {
  type: 'function'
  function: {
    name: string
    description?: string
    /**
     * function 的输入参数，以 JSON Schema 对象描述
     */
    parameters?: any
    inputSchema?: any
  }
  [key: string]: any
}

// Request body for plugins - only contains messages and additional parameters
export interface MessageRequestBody {
  messages: Partial<ChatMessage>[]
  [key: string]: any
}

// Define different states for the request process
export type RequestState = 'idle' | 'processing' | 'completed' | 'aborted' | 'error'
export type RequestProcessingState = 'requesting' | 'completing' | string

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

// Choice item with complete message in response
export interface Choice {
  index: number
  message: {
    role: string
    content?: string
    tool_calls?: ToolCall[]
    [key: string]: any
  }
  delta: undefined
  logprobs: any
  finish_reason: string | null
}

export interface DeltaChoice {
  index: number
  message: undefined
  delta: {
    role?: string
    content?: string
    tool_calls?: ToolCall[]
    [key: string]: any
  }
  logprobs: any
  finish_reason: string | null
}

export type CompletionChoice = Choice | DeltaChoice

export interface ChatCompletion {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string | null
  choices: CompletionChoice[]
  usage?: Usage
}

export type ResponseProvider<T = ChatCompletion> = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>

export interface UseMessageOptions {
  initialMessages?: ChatMessage[]
  /**
   * 请求消息时，要包含的字段（白名单）。默认包含所有字段。
   * 如果 `requestMessageFieldsExclude` 存在，会先取 `requestMessageFields` 中的字段，再排除 `requestMessageFieldsExclude` 中的字段
   */
  requestMessageFields?: string[]
  /**
   * 请求消息时，要排除的字段（黑名单）。默认会排除 `state`、`metadata`、`loading` 字段（这几个字段是给UI展示用的）。
   * 如果 `requestMessageFields` 存在，会先取 `requestMessageFields` 中的字段，再排除 `requestMessageFieldsExclude` 中的字段
   */
  requestMessageFieldsExclude?: string[]
  plugins?: UseMessagePlugin[]
  responseProvider: ResponseProvider
  /**
   * 全局的数据块处理钩子，在接收到每个响应数据块时触发。
   * 注意：此钩子与插件中的 onCompletionChunk 有区别。
   * 如果传入了此参数，默认的 chunk 处理逻辑不会自动执行，需要手动调用 runDefault 来执行默认处理逻辑。
   */
  onCompletionChunk?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      choice: CompletionChoice
      chunk: ChatCompletion
    },
    runDefault: () => void,
  ) => void
}

export interface UseMessageReturn {
  requestState: Ref<RequestState>
  processingState: Ref<RequestProcessingState | undefined>
  messages: Ref<ChatMessage[]>
  responseProvider: Ref<UseMessageOptions['responseProvider']>
  isProcessing: ComputedRef<boolean>
  sendMessage: (content: string) => Promise<void>
  send: (...msgs: ChatMessage[]) => Promise<void>
  abortRequest: () => Promise<void>
}

export interface BasePluginContext {
  messages: ChatMessage[]
  currentTurn: ChatMessage[]
  requestState: RequestState
  processingState?: RequestProcessingState
  plugins: UseMessagePlugin[]
  setRequestState: (state: RequestState, processingState?: RequestProcessingState) => void
  abortSignal: AbortSignal
  /**
   * Custom context data that can be set by plugins
   */
  customContext: Record<string, unknown>
  /**
   * Set custom context data. Can be used to store plugin-specific data that needs to be shared across hooks.
   */
  setCustomContext: (data: Record<string, unknown>) => void
}

export interface UseMessagePlugin {
  /**
   * 插件名称。
   */
  name?: string
  /**
   * 是否禁用插件。useMessage 可能会内置一些默认插件，如果需要禁用，可以设置为 true。
   */
  disabled?: boolean | ((context: BasePluginContext) => boolean)
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
      lastChoice?: CompletionChoice
      appendMessage: (message: ChatMessage | ChatMessage[]) => void
      requestNext: () => void
    },
  ) => MaybePromise<void>
  /**
   * 数据块处理钩子，在接收到每个响应数据块时触发。
   * 无论是流式响应（多个增量数据块）还是非流式响应（单个完整数据块），都会触发此钩子。
   * 用途：自定义增量合并、实时 UI 效果等。
   */
  onCompletionChunk?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      choice?: CompletionChoice
      chunk: ChatCompletion
    },
  ) => void
  onError?: (context: BasePluginContext & { error: unknown }) => void
  onFinally?: (context: BasePluginContext) => void
}
