/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatCompletionFunctionTool,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageToolCall,
} from 'openai/resources'
import type { MaybePromise } from '../../types'
import type { BasePluginContext, ChatMessage, MessageEnginePlugin, MutateMessageStateFn } from '../types'
import { combineDeltaData, normalizeToAsyncGenerator } from '../utils'

type AssistantMessageWithState = ChatMessage<
  Record<string, unknown>,
  { toolCall?: Record<string, Record<string, unknown>> }
>

export type ToolSource = { type: 'toolPlugin' } | { type: 'toolProvider'; pluginName?: string } | { type: 'unknown' }

export type ToolCallContext = BasePluginContext & {
  assistantMessage: AssistantMessageWithState
  toolMessage: ChatMessage
  /**
   * 当前工具的来源。
   */
  toolSource: ToolSource
}

type ToolCallResult = string | Record<string, any>
type ToolCallReturn = ToolCallResult | Promise<ToolCallResult> | AsyncGenerator<ToolCallResult>

export interface RuntimeTool {
  tool: ChatCompletionFunctionTool
  handler: (toolCall: ChatCompletionMessageFunctionToolCall, context: ToolCallContext) => ToolCallReturn
}

export type ToolProviderItem = ChatCompletionFunctionTool | RuntimeTool

export interface ToolProvider {
  provideTools: (context: BasePluginContext) => MaybePromise<ToolProviderItem[]>
}

/**
 * 补全缺失的工具消息
 * 遍历所有 messages，找到所有 role 为 assistant 并且 tool_calls 数组不为空的 message。
 * 对每条这样的消息，检查其后是否存在对应的 tool 消息（通过 tool_call_id 匹配）。
 * 如果某个 tool_call_id 没有对应的 tool 消息，则在该 assistant 消息之后插入一条"工具调用已取消"的 tool 消息。
 * 插入操作从后往前执行，确保不影响已记录的索引位置。
 */
function fillMissingToolMessages({
  messages,
  cancelledContent,
  createMessage,
  mutate,
}: {
  messages: ChatMessage[]
  cancelledContent: string
  createMessage: BasePluginContext['createMessage']
  mutate: MutateMessageStateFn
}): void {
  // 第一阶段：从首位开始遍历，收集需要插入的信息
  interface InsertInfo {
    // 在哪个 assistant 消息之后插入（索引位置）
    insertAfterIndex: number
    // 需要插入的 tool_call_id 列表（保持原始顺序）
    missingToolCallIds: string[]
  }
  const insertInfos: InsertInfo[] = []

  // 从首位开始遍历 messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]

    // 找到 role 为 assistant 并且 tool_calls 数组不为空的 message
    if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
      // 获取 tool_calls 数组中的 tool_call_id 集合
      const toolCallIds = new Set(msg.tool_calls.map((tc) => tc.id))

      // 在这条 message 之后查找对应的 tool 消息，记录已找到的 tool_call_id
      const foundToolCallIds = new Set<string>()

      // 从当前 assistant 消息之后的位置开始遍历
      for (let j = i + 1; j < messages.length; j++) {
        const toolMsg = messages[j]
        // 检查是否是 tool 消息，并且 tool_call_id 在当前 assistant 消息的 tool_call_id 集合中
        if (toolMsg.role === 'tool' && toolMsg.tool_call_id && toolCallIds.has(toolMsg.tool_call_id)) {
          foundToolCallIds.add(toolMsg.tool_call_id)
        }
      }

      // 找出缺失的 tool_call_id，并按照 tool_calls 数组中的顺序保留
      const missingToolCallIds = msg.tool_calls.map((tc) => tc.id).filter((id) => !foundToolCallIds.has(id))

      // 如果存在缺失的 tool_call_id，记录插入信息
      if (missingToolCallIds.length > 0) {
        insertInfos.push({
          insertAfterIndex: i,
          missingToolCallIds,
        })
      }
    }
  }

  if (insertInfos.length === 0) {
    return
  }

  // 第二阶段：从后往前插入，这样不会影响已记录的索
  mutate('messages', (draft) => {
    for (let i = insertInfos.length - 1; i >= 0; i--) {
      const { insertAfterIndex, missingToolCallIds } = insertInfos[i]
      const cancelledMessages: ChatMessage[] = missingToolCallIds.map((toolCallId) =>
        createMessage({
          role: 'tool',
          tool_call_id: toolCallId,
          content: cancelledContent,
        }),
      )

      // 在 assistant 消息之后插入所有取消消息
      draft.messages.splice(insertAfterIndex + 1, 0, ...cancelledMessages)
    }
  })
}

export const toolPlugin = (
  options: MessageEnginePlugin & {
    /**
     * 获取本轮可用工具。可以返回普通 tool schema，也可以返回带执行函数的 runtime tool。
     */
    getTools: (context: BasePluginContext) => MaybePromise<ToolProviderItem[]>
    /**
     * 在处理包含 tool_calls 的响应前调用。
     */
    beforeCallTools?: (
      toolCalls: ChatCompletionMessageToolCall[],
      context: BasePluginContext & { assistantMessage: AssistantMessageWithState },
    ) => Promise<void>
    /**
     * 执行单个工具调用并返回其文本结果的函数。
     */
    callTool: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallContext,
    ) => Promise<ToolCallResult> | AsyncGenerator<ToolCallResult>
    /**
     * 工具调用开始时的回调函数。
     * 触发时机：工具消息已创建并追加后，调用 callTool 之前触发。
     * @param toolCall - 工具调用对象
     * @param context - 插件上下文，包含当前工具消息
     */
    onToolCallStart?: (toolCall: ChatCompletionMessageToolCall, context: ToolCallContext) => void
    /**
     * 工具调用结束时的回调函数。
     * 触发时机：工具调用完成（成功、失败或取消）时触发。
     * @param toolCall - 工具调用对象
     * @param context - 插件上下文，包含当前工具消息、状态和错误信息
     * @param context.status - 工具调用状态：'success' | 'failed' | 'cancelled'
     * @param context.error - 当状态为 'failed' 或 'cancelled' 时，可能包含错误信息
     */
    onToolCallEnd?: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallContext & {
        status: 'success' | 'failed' | 'cancelled'
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
     * 是否在请求前自动补充缺失的 tool 消息。
     * 当 assistant 响应了 tool_calls 但未追加对应的 tool 消息时，
     * 插件将自动补充"工具调用已取消"的 tool 消息。默认：false。
     */
    autoFillMissingToolMessages?: boolean
  },
): MessageEnginePlugin => {
  const {
    getTools,
    beforeCallTools,
    callTool,
    onToolCallStart,
    onToolCallEnd,
    toolCallCancelledContent = 'Tool call cancelled.',
    toolCallFailedContent = 'Tool call failed.',
    autoFillMissingToolMessages = false,
    ...restOptions
  } = options

  const ensureToolCallState = (assistantMessage: AssistantMessageWithState, toolCallId: string) => {
    assistantMessage.state ??= {}
    assistantMessage.state.toolCall ??= {}
    assistantMessage.state.toolCall[toolCallId] ??= {}
    return assistantMessage as AssistantMessageWithState & {
      state: { toolCall: Record<string, Record<string, unknown>> }
    }
  }

  const toolCallStart = (...args: Parameters<NonNullable<typeof onToolCallStart>>) => {
    const [toolCall, { assistantMessage, mutate }] = args

    mutate('messages', () => {
      const message = ensureToolCallState(assistantMessage, toolCall.id)
      message.state.toolCall[toolCall.id].status = 'running'
    })

    onToolCallStart?.(...args)
  }

  const toolCallEnd = (...args: Parameters<NonNullable<typeof onToolCallEnd>>) => {
    const [toolCall, { status, assistantMessage, mutate }] = args

    mutate('messages', () => {
      const message = ensureToolCallState(assistantMessage, toolCall.id)
      message.state.toolCall[toolCall.id].status = status
    })

    onToolCallEnd?.(...args)
  }

  const isFunctionToolCall = (
    toolCall: ChatCompletionMessageToolCall,
  ): toolCall is ChatCompletionMessageFunctionToolCall => {
    return toolCall.type === 'function' && 'function' in toolCall
  }

  const isRuntimeTool = (tool: ToolProviderItem): tool is RuntimeTool => {
    return Boolean(tool && typeof tool === 'object' && 'tool' in tool && 'handler' in tool)
  }

  const getToolProvider = (plugin: MessageEnginePlugin): ToolProvider | undefined => {
    const toolProvider = plugin as Partial<ToolProvider>
    return typeof toolProvider.provideTools === 'function' ? (toolProvider as ToolProvider) : undefined
  }

  const isPluginDisabled = (plugin: MessageEnginePlugin, context: BasePluginContext) => {
    return typeof plugin.disabled === 'function' ? plugin.disabled(context) : Boolean(plugin.disabled)
  }

  const resolveTools = async (context: BasePluginContext, existingTools: ChatCompletionFunctionTool[] = []) => {
    const providedToolItems: Array<{ item: ToolProviderItem; source: ToolSource }> = []

    for (const plugin of context.plugins) {
      const toolProvider = getToolProvider(plugin)
      if (!isPluginDisabled(plugin, context) && toolProvider) {
        providedToolItems.push(
          ...(await toolProvider.provideTools(context)).map((item) => ({
            item,
            source: {
              type: 'toolProvider' as const,
              pluginName: plugin.name,
            },
          })),
        )
      }
    }

    const toolItems = [
      ...providedToolItems,
      ...(await getTools(context)).map((item) => ({
        item,
        source: { type: 'toolPlugin' as const },
      })),
    ]
    const tools: ChatCompletionFunctionTool[] = []
    const runtimeToolMap = new Map<string, RuntimeTool>()
    const toolSourceMap = new Map<string, ToolSource>()
    const seenToolNames = new Set<string>()

    const registerToolName = (tool: ChatCompletionFunctionTool) => {
      const toolName = tool.function.name

      if (seenToolNames.has(toolName)) {
        throw new Error(
          `Duplicate tool name "${toolName}" detected. Tool names must be unique because tool calls are routed by function.name.`,
        )
      }

      seenToolNames.add(toolName)
    }

    existingTools.forEach(registerToolName)

    for (const { item: toolItem, source } of toolItems) {
      const tool = isRuntimeTool(toolItem) ? toolItem.tool : toolItem

      registerToolName(tool)
      toolSourceMap.set(tool.function.name, source)

      if (isRuntimeTool(toolItem)) {
        tools.push(toolItem.tool)
        runtimeToolMap.set(toolItem.tool.function.name, toolItem)
      } else {
        tools.push(toolItem)
      }
    }

    return { tools, runtimeToolMap, toolSourceMap }
  }

  return {
    name: 'tool',
    ...restOptions,
    onTurnStart: (context) => {
      const { getState, createMessage, mutate } = context
      const messages = getState().messages

      if (autoFillMissingToolMessages) {
        fillMissingToolMessages({ messages, cancelledContent: toolCallCancelledContent, createMessage, mutate })
      }

      return restOptions.onTurnStart?.(context)
    },
    onBeforeRequest: async (context) => {
      const { requestBody } = context

      const existingTools = Array.isArray(requestBody.tools) ? requestBody.tools : []
      const { tools } = await resolveTools(context, existingTools)
      if (tools && tools.length > 0) {
        requestBody.tools = existingTools.length ? [...existingTools, ...tools] : tools
      }

      return restOptions.onBeforeRequest?.(context)
    },
    onAfterRequest: async (context) => {
      const {
        currentMessage,
        lastChoice,
        appendMessage,
        abortSignal,
        setRequestState,
        requestNext,
        mutate,
        createMessage,
      } = context

      if (lastChoice?.finish_reason !== 'tool_calls' || !currentMessage.tool_calls?.length) {
        return
      }

      setRequestState('processing', 'calling-tools')
      await beforeCallTools?.(currentMessage.tool_calls as ChatCompletionMessageToolCall[], {
        ...context,
        assistantMessage: currentMessage as AssistantMessageWithState,
      })

      const { runtimeToolMap, toolSourceMap } = await resolveTools(context)

      const toolCallPromises = currentMessage.tool_calls.map(async (toolCall) => {
        const now = Math.floor(Date.now() / 1000)
        let hasMeaningfulResult = false
        const toolMessage: ChatMessage = createMessage({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: '',
          metadata: {
            createdAt: now,
            updatedAt: now,
          },
        })

        appendMessage(toolMessage)

        const functionToolCall = isFunctionToolCall(toolCall) ? toolCall : undefined
        const toolSource = functionToolCall
          ? (toolSourceMap.get(functionToolCall.function.name) ?? { type: 'unknown' as const })
          : { type: 'unknown' as const }

        const contextWithToolMessage: ToolCallContext = {
          ...context,
          assistantMessage: currentMessage as AssistantMessageWithState,
          toolMessage,
          toolSource,
        }

        toolCallStart(toolCall, contextWithToolMessage)
        try {
          const runtimeTool = functionToolCall ? runtimeToolMap.get(functionToolCall.function.name) : undefined
          const result =
            runtimeTool && functionToolCall
              ? runtimeTool.handler(functionToolCall, contextWithToolMessage)
              : callTool(toolCall, contextWithToolMessage)

          // 将 Promise 或异步迭代器统一转换为异步生成器
          const iterator = normalizeToAsyncGenerator(result)

          // 迭代并逐步拼接内容到 content
          for await (const chunk of iterator) {
            mutate('messages', () => {
              if (
                (typeof chunk === 'string' && chunk.length > 0) ||
                (chunk && typeof chunk === 'object' && Object.keys(chunk).length > 0)
              ) {
                hasMeaningfulResult = true
              }

              // 字符串拼接或 JSON 合并
              if (typeof chunk === 'string') {
                toolMessage.content += chunk
              } else {
                let parsedContent: Record<string, any> = {}
                try {
                  const content = Array.isArray(toolMessage.content)
                    ? toolMessage.content.map((item) => item.text).join('')
                    : toolMessage.content
                  parsedContent = JSON.parse(content || '{}')
                } catch (error) {
                  console.warn(error)
                }
                toolMessage.content = JSON.stringify(combineDeltaData(parsedContent, chunk))
              }

              toolMessage.metadata!.updatedAt = Math.floor(Date.now() / 1000)
            })
          }

          toolCallEnd(toolCall, { ...contextWithToolMessage, status: 'success' })
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error))

          // 如果被 abort ，则抛出错误，主流程会处理状态
          // 也可以不抛出错误，直接返回，主流程会自动处理 abort 场景
          if (abortSignal.aborted) {
            toolCallEnd(toolCall, { ...contextWithToolMessage, status: 'cancelled', error: err })
            // throw error
            return
          }

          // 其他错误视为工具调用失败，则将工具消息内容设置为失败内容
          console.error(error)

          if (!hasMeaningfulResult) {
            mutate('messages', () => {
              toolMessage.content = toolCallFailedContent
              toolMessage.metadata!.updatedAt = Math.floor(Date.now() / 1000)
            })
          }

          toolCallEnd(toolCall, { ...contextWithToolMessage, status: 'failed', error: err })
        }
      })

      await Promise.all(toolCallPromises)
      if (!abortSignal.aborted) {
        requestNext()
      }

      return restOptions.onAfterRequest?.(context)
    },
  }
}
