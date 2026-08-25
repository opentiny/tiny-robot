/* eslint-disable @typescript-eslint/no-explicit-any */
import { toolPlugin as createCoreToolPlugin } from '../../../message/plugins'
import type { ToolCallPauseOptions, ToolProviderItem, ToolSource } from '../../../message/plugins'
import { normalizeToAsyncGenerator } from '../../../message/utils'
import type { ChatMessage, MaybePromise, MaybeStreamableResult, ToolCall } from '../../../types'
import type { VueMessagePluginRuntime } from '../types.internal'
import type { BasePluginContext, UseMessagePlugin } from '../types'

export { TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND } from '../../../message/plugins'
export type { ToolCallPauseOptions, ToolResumeCommandPayload, ToolResumeCommandResult } from '../../../message/plugins'

export interface UseMessageToolActionContext extends BasePluginContext {
  assistantMessage: ChatMessage
  /**
   * 当前工具的来源。
   */
  toolSource?: ToolSource
  /**
   * 在工具正式执行前挂起当前 tool call。
   */
  pauseToolCall: (toolCallId: string, options?: ToolCallPauseOptions) => void
  /**
   * @deprecated use `assistantMessage` instead
   */
  currentMessage: ChatMessage
}

export interface UseMessageCallToolContext extends UseMessageToolActionContext {
  toolMessage: ChatMessage
}

export interface UseMessageToolCallContext extends BasePluginContext {
  assistantMessage: ChatMessage
  /**
   * 当前工具的来源。
   */
  toolSource: ToolSource
  /**
   * 在工具正式执行前挂起当前 tool call。
   */
  pauseToolCall: (toolCallId: string, options?: ToolCallPauseOptions) => void
  /**
   * @deprecated use `assistantMessage` instead
   */
  primaryMessage: ChatMessage
  toolMessage: ChatMessage
}

export const toolPlugin = (
  options: UseMessagePlugin & {
    /**
     * 获取工具列表的函数。
     */
    getTools: (context: BasePluginContext) => MaybePromise<ToolProviderItem[]>
    /**
     * 在处理包含 tool_calls 的响应前调用。
     */
    beforeCallTools?: (toolCalls: ToolCall[], context: UseMessageToolActionContext) => Promise<void>
    /**
     * 执行单个工具调用并返回其文本结果的函数。
     */
    callTool: (
      toolCall: ToolCall,
      context: UseMessageCallToolContext,
    ) => MaybeStreamableResult<string | Record<string, any>>
    /**
     * 工具调用开始时的回调函数。
     * 触发时机：工具消息已创建并追加后，调用 callTool 之前触发。
     * @param toolCall - 工具调用对象
     * @param context - 插件上下文，包含当前工具消息
     */
    onToolCallStart?: (toolCall: ToolCall, context: UseMessageToolCallContext) => void
    /**
     * 工具调用结束时的回调函数。
     * 触发时机：工具调用完成（成功、失败或取消）时触发。
     * @param toolCall - 工具调用对象
     * @param context - 插件上下文，包含当前工具消息、状态和错误信息
     * @param context.status - 工具调用状态：'success' | 'failed' | 'cancelled'
     * @param context.error - 当状态为 'failed' 或 'cancelled' 时，可能包含错误信息
     */
    onToolCallEnd?: (
      toolCall: ToolCall,
      context: UseMessageToolCallContext & {
        status: 'success' | 'failed' | 'cancelled'
        error?: Error
      },
    ) => void
    /**
     * 工具调用进入等待确认时使用的消息内容。
     */
    toolCallPausedContent?: string
    /**
     * 当请求被中止时用于工具调用取消的消息内容。
     */
    toolCallCancelledContent?: string
    /**
     * 当工具调用执行失败（抛错或拒绝）时使用的消息内容。
     */
    toolCallFailedContent?: string
    /**
     * 是否在请求前自动补充缺失的 tool 消息。
     * 当 assistant 响应了 tool_calls 但未追加对应的 tool 消息时，
     * 插件将自动补充"工具调用已取消"的 tool 消息。默认：false。
     */
    autoFillMissingToolMessages?: boolean
  },
): UseMessagePlugin => {
  const {
    getTools,
    beforeCallTools,
    callTool,
    onToolCallStart,
    onToolCallEnd,
    toolCallPausedContent,
    toolCallCancelledContent = 'Tool call cancelled.',
    toolCallFailedContent = 'Tool call failed.',
    autoFillMissingToolMessages = false,
    ...restOptions
  } = options

  return {
    name: 'tool',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      const wrappedRestOptions = runtime.createCorePlugin(restOptions)

      return createCoreToolPlugin({
        ...wrappedRestOptions,
        getTools: async (context) => getTools(runtime.createVueBaseContext(context)),
        beforeCallTools: beforeCallTools
          ? async (toolCalls, context) => {
              const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)

              await beforeCallTools(toolCalls as unknown as ToolCall[], {
                ...runtime.createVueBaseContext(context),
                assistantMessage,
                currentMessage: assistantMessage,
                pauseToolCall: context.pauseToolCall,
              })
            }
          : undefined,
        callTool: async function* (toolCall, context) {
          const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)
          const toolMessage = runtime.resolveReactiveMessage(context.toolMessage as ChatMessage)

          const result = callTool(
            toolCall as unknown as ToolCall,
            {
              ...runtime.createVueBaseContext(context),
              assistantMessage,
              currentMessage: assistantMessage,
              toolMessage,
              toolSource: context.toolSource,
              pauseToolCall: context.pauseToolCall,
            } as UseMessageCallToolContext,
          )

          for await (const chunk of normalizeToAsyncGenerator(result)) {
            yield chunk
          }
        },
        onToolCallStart: onToolCallStart
          ? (toolCall, context) => {
              const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)
              const toolMessage = runtime.resolveReactiveMessage(context.toolMessage as ChatMessage)

              onToolCallStart(toolCall as unknown as ToolCall, {
                ...runtime.createVueBaseContext(context),
                assistantMessage,
                primaryMessage: assistantMessage,
                toolMessage,
                toolSource: context.toolSource,
                pauseToolCall: context.pauseToolCall,
              })
            }
          : undefined,
        onToolCallEnd: onToolCallEnd
          ? (toolCall, context) => {
              const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)
              const toolMessage = runtime.resolveReactiveMessage(context.toolMessage as ChatMessage)

              onToolCallEnd(toolCall as unknown as ToolCall, {
                ...runtime.createVueBaseContext(context),
                assistantMessage,
                primaryMessage: assistantMessage,
                toolMessage,
                toolSource: context.toolSource,
                pauseToolCall: context.pauseToolCall,
                status: context.status,
                error: context.error,
              })
            }
          : undefined,
        toolCallPausedContent,
        toolCallCancelledContent,
        toolCallFailedContent,
        autoFillMissingToolMessages,
      })
    },
  } as UseMessagePlugin
}
