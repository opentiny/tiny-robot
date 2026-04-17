/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources/index'
import { MaybePromise } from '../../types'

export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T

// Define different states for the request process
export type RequestState = 'idle' | 'processing' | 'completed' | 'aborted' | 'error'
export type RequestProcessingState = 'requesting' | 'completing' | string

export type ChatMessage<
  Metadata extends object = Record<string, unknown>,
  State extends object = Record<string, unknown>,
> = ChatCompletionMessageParam & {
  tool_calls?: Array<ChatCompletionMessageToolCall>
  loading?: boolean
  metadata?: Metadata
  state?: State
  [key: string]: any
  [key: symbol]: any
}

export interface MessageRequestBody {
  messages: Array<ChatMessage>
  [key: string]: any
}

export type ResponseProvider<T extends ChatCompletion | ChatCompletionChunk = ChatCompletion | ChatCompletionChunk> = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>

export interface PublicMessageState {
  requestState: RequestState
  processingState?: RequestProcessingState
  messages: ChatMessage[]
  isProcessing: boolean
}

export interface InternalMessageState {
  requestState: RequestState
  processingState?: RequestProcessingState
  messages: ChatMessage[]
}

export interface MessageRuntime {
  currentTurn: ChatMessage[]
  customContext: Record<string, unknown>
  abortController: AbortController | null
  responseProvider: ResponseProvider
}

export interface MessageEngine {
  getState(): PublicMessageState
  subscribe(listener: (state: PublicMessageState) => void): () => void
  subscribe(kinds: MessageUpdateKinds, listener: (state: PublicMessageState) => void): () => void
  sendMessage(content: string): Promise<void>
  send(...msgs: ChatMessage[]): Promise<void>
  abort(): Promise<void>
  setResponseProvider(provider: ResponseProvider): void
}

export type MessageUpdateKind = 'messages' | 'requestState'
export type MessageUpdateKinds = MessageUpdateKind | MessageUpdateKind[]
export type MessageMutationRecipe = (draft: InternalMessageState, skipNotify: () => void) => void

export interface MutateMessageStateFn {
  (kinds: MessageUpdateKinds, recipe: MessageMutationRecipe): void
}

export interface BasePluginContext {
  getState(): PublicMessageState
  mutate: MutateMessageStateFn
  abortSignal: AbortSignal
  currentTurn: ChatMessage[]
  customContext: Record<string, unknown>
  setRequestState: (state: RequestState, processingState?: RequestProcessingState) => void
  setCustomContext: (data: Record<string, unknown>) => void
}

export interface BeforeRequestContext extends BasePluginContext {
  requestBody: MessageRequestBody
}

export interface AfterRequestContext extends BasePluginContext {
  currentMessage: DeepReadonly<ChatMessage>
  lastChoice?: ChatCompletion.Choice | ChatCompletionChunk.Choice
  appendMessage: (message: ChatMessage | ChatMessage[]) => void
  requestNext: () => void
}

export interface CompletionChunkContext extends BasePluginContext {
  currentMessage: DeepReadonly<ChatMessage>
  updateCurrentMessage: (recipe: (message: ChatMessage) => void) => void
  choice: ChatCompletion.Choice | ChatCompletionChunk.Choice
  chunk: ChatCompletion | ChatCompletionChunk
}

export interface MessageEnginePlugin {
  /**
   * 插件名称。
   */
  name?: string
  /**
   * 是否禁用插件。
   */
  disabled?: boolean | ((context: BasePluginContext) => boolean)
  /**
   * 一次对话回合（turn）开始钩子：用户消息入队后、正式发起请求之前触发。
   * 按插件注册顺序串行执行，便于做有序初始化/校验；出错则中断流程。
   */
  onTurnStart?: (context: BasePluginContext) => MaybePromise<void>
  /**
   * 一次对话回合（turn）结束的生命周期钩子。
   * 触发时机：本轮对话完成（成功、被中止）后。
   * 执行策略：按插件注册顺序串行执行，有错误则中断流程。
   */
  onTurnEnd?: (context: BasePluginContext) => MaybePromise<void>
  /**
   * 请求开始前的生命周期钩子。
   * 触发时机：已组装 requestBody，正式发起请求之前。
   * 执行策略：按插件注册顺序串行执行，避免并发修改 requestBody 产生冲突。
   */
  onBeforeRequest?: (context: BeforeRequestContext) => MaybePromise<void>
  /**
   * 请求完成后的生命周期钩子。
   * 触发时机：本次请求（含流式）结束后。
   * 执行策略：并行执行（Promise.all）。
   */
  onAfterRequest?: (context: AfterRequestContext) => MaybePromise<void>
  /**
   * 数据块处理钩子，在接收到每个响应数据块时触发。
   * 无论是流式响应（多个增量数据块）还是非流式响应（单个完整数据块），都会触发此钩子。
   */
  onCompletionChunk?: (context: CompletionChunkContext) => void
  onError?: (context: BasePluginContext & { error: unknown }) => void
  onFinally?: (context: BasePluginContext) => void
}

export interface CreateMessageEngineOptions {
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
  responseProvider?: ResponseProvider
  /**
   * 全局的数据块处理钩子，在接收到每个响应数据块时触发。
   * 注意：此钩子与插件中的 onCompletionChunk 有区别。
   * 如果传入了此参数，默认的 chunk 处理逻辑不会自动执行，需要手动调用 runDefault 来执行默认处理逻辑。
   */
  onCompletionChunk?: (context: CompletionChunkContext, runDefault: () => void) => void
  plugins?: MessageEnginePlugin[]
}
