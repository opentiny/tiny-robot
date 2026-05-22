/* eslint-disable @typescript-eslint/no-explicit-any */
import { toolPlugin as createCoreToolPlugin } from '../../../message/plugins'
import { normalizeToAsyncGenerator } from '../../../message/utils'
import { ChatMessage, MaybePromise, ToolCall } from '../../../types'
import type { VueMessagePluginRuntime } from '../types.internal'
import { BasePluginContext, Tool, UseMessagePlugin } from '../types'

export interface UseMessageToolActionContext extends BasePluginContext {
  assistantMessage: ChatMessage
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
    getTools: () => Promise<Tool[]>
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
    ) => Promise<string | Record<string, any>> | AsyncGenerator<string | Record<string, any>>
    /**
     * 判断当前工具调用是否需要外部确认。
     *
     * 返回 true 时，工具调用会停在 `awaiting-approval` 状态。业务侧确认后应调用
     * `submitToolResult` 提交对应的 `role: 'tool'` 结果消息。
     */
    confirmToolCall?: (toolCall: ToolCall, context: UseMessageToolActionContext) => MaybePromise<boolean>
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
     * @param context.status - 工具调用状态：'success' | 'failed' | 'cancelled' | 'denied'
     * @param context.error - 当状态为 'failed' 或 'cancelled' 时，可能包含错误信息
     */
    onToolCallEnd?: (
      toolCall: ToolCall,
      context: UseMessageToolCallContext & {
        status: 'success' | 'failed' | 'cancelled' | 'denied'
        error?: Error
      },
    ) => void
    /**
     * 当请求被中止时用于工具调用取消的消息内容。
     */
    toolCallCancelledContent?: string
    /**
     * 当工具调用执行失败（抛错或拒绝）时使用的消息内容。
     */
    toolCallFailedContent?: string
    /**
     * 当工具调用被拒绝时使用的默认消息内容。
     */
    toolCallDeniedContent?: string
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
    confirmToolCall,
    onToolCallStart,
    onToolCallEnd,
    toolCallCancelledContent = 'Tool call cancelled.',
    toolCallFailedContent = 'Tool call failed.',
    toolCallDeniedContent = 'Tool call denied.',
    autoFillMissingToolMessages = false,
    ...restOptions
  } = options

  return {
    name: 'tool',
    __corePluginFactory(runtime: VueMessagePluginRuntime) {
      const wrappedRestOptions = runtime.createCorePlugin(restOptions)

      return createCoreToolPlugin({
        ...wrappedRestOptions,
        getTools: async () => (await getTools()) as any,
        beforeCallTools: beforeCallTools
          ? async (toolCalls, context) => {
              const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)

              await beforeCallTools(toolCalls as unknown as ToolCall[], {
                ...runtime.createVueBaseContext(context),
                assistantMessage,
                currentMessage: assistantMessage,
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
            } as UseMessageCallToolContext,
          )

          for await (const chunk of normalizeToAsyncGenerator(result)) {
            yield chunk
          }
        },
        confirmToolCall: confirmToolCall
          ? (toolCall, context) => {
              const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)

              return confirmToolCall(toolCall as unknown as ToolCall, {
                ...runtime.createVueBaseContext(context),
                assistantMessage,
                currentMessage: assistantMessage,
              })
            }
          : undefined,
        onToolCallStart: onToolCallStart
          ? (toolCall, context) => {
              const assistantMessage = runtime.resolveReactiveMessage(context.assistantMessage as ChatMessage)
              const toolMessage = runtime.resolveReactiveMessage(context.toolMessage as ChatMessage)

              onToolCallStart(toolCall as unknown as ToolCall, {
                ...runtime.createVueBaseContext(context),
                assistantMessage,
                primaryMessage: assistantMessage,
                toolMessage,
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
                status: context.status,
                error: context.error,
              })
            }
          : undefined,
        toolCallCancelledContent,
        toolCallFailedContent,
        toolCallDeniedContent,
        autoFillMissingToolMessages,
      })
    },
  } as UseMessagePlugin
}
