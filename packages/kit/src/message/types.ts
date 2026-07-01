/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionTool,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources'
import type { AsyncStreamableResult, MaybePromise } from '../types'

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
}

export interface MessageRequestBody {
  messages: Array<ChatMessage>
  tools?: Array<ChatCompletionTool>
  [key: string]: any
}

export type ResponseProvider<T extends ChatCompletion | ChatCompletionChunk = ChatCompletion | ChatCompletionChunk> = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => AsyncStreamableResult<T>

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
  /**
   * 在受控上下文中修改消息状态，并按声明的更新类型分发状态变更通知。
   *
   * 这里的“通知”语义对应 `subscribe` 订阅链路，用于驱动依赖 engine 状态快照的观察者；
   * 它并不等同于具体框架的响应式更新机制。对于 Vue 等运行时，界面更新可能同时依赖
   * 框架自身的响应式追踪与 `subscribe` 侧的状态通知，两者职责不同，不应混用。
   */
  (kinds: MessageUpdateKinds, recipe: MessageMutationRecipe): void
}

export interface MessageStateAdapter {
  initialize(initialState: InternalMessageState): void
  getState(): PublicMessageState
  /**
   * 创建一条适配当前运行时的消息对象。
   *
   * engine 和 core 插件里凡是“新建消息”的入口，都应统一走这个方法，
   * 以便不同平台注入各自的运行时能力。
   *
   * 例如：
   * - native/纯 TS 场景：直接返回原对象即可
   *   `createMessage(message) { return message }`
   * - Vue 场景：返回 reactive proxy，使后续对 message.content / message.state 的原地修改能够被追踪
   *   `createMessage(message) { return reactive(message) }`
   */
  createMessage<T extends ChatMessage>(message: T): T
  mutate: MutateMessageStateFn
  subscribe(listener: (state: PublicMessageState) => void): () => void
  subscribe(kinds: MessageUpdateKinds, listener: (state: PublicMessageState) => void): () => void
}

export interface BasePluginContext {
  getState(): PublicMessageState
  /**
   * 创建一条适配当前运行时的消息对象。
   *
   * 插件在运行过程中如果需要主动创建并追加消息，应统一通过此接口构造消息实例，
   * 而不是直接持有普通对象字面量。这样可以确保消息对象具备当前平台所要求的运行时能力。
   *
   * 对于采用响应式机制的平台（例如 Vue），该接口通常会返回带有响应式包装的消息实例。
   * 如果插件绕过此接口直接创建普通对象，再参与后续的状态更新或原地字段修改，
   * 可能导致消息内容、状态字段等变更无法被正确追踪。
   */
  createMessage<T extends ChatMessage>(message: T): T
  /**
   * 在受控上下文中修改状态，并触发与 `subscribe` 对应的状态更新通知。
   *
   * 该通知机制面向 engine 的订阅接口，而不是具体框架的响应式系统本身。
   * 因此，在需要让 `subscribe` 观察者感知到变更时，应通过此接口完成状态写入。
   */
  mutate: MutateMessageStateFn
  abortSignal: AbortSignal
  currentTurn: ChatMessage[]
  /**
   * 当前 engine 中已注册的插件列表。
   *
   * 插件可基于该列表发现其他插件暴露的轻量协议，例如 toolPlugin 收集 provideTools。
   */
  plugins: readonly MessageEnginePlugin[]
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
  /**
   * 使用 appendMessage 函数追加消息，可触发消息更新通知。
   */
  appendMessage: (message: ChatMessage | ChatMessage[]) => void
  requestNext: () => void
}

export interface CompletionChunkContext extends BasePluginContext {
  /**
   * 当前消息，只读。需要使用 updateCurrentMessage 函数修改当前消息，才能正常触发消息更新通知。
   */
  currentMessage: DeepReadonly<ChatMessage>
  /**
   * 使用 updateCurrentMessage 函数修改当前消息，才能正常触发消息更新通知。
   */
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
