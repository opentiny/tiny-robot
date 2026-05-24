/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatCompletionMessageToolCall, ChatCompletionTool } from 'openai/resources/index'
import type { MaybePromise } from '../../types'
import type { BasePluginContext, ChatMessage, MessageEnginePlugin, MutateMessageStateFn } from '../types'
import { combineDeltaData, normalizeToAsyncGenerator } from '../utils'

type AssistantMessageWithState = ChatMessage<
  Record<string, unknown>,
  { toolCall?: Record<string, Record<string, unknown>> }
>

type ToolCallContext = BasePluginContext & {
  assistantMessage: AssistantMessageWithState
  toolMessage: ChatMessage
}

type ToolCallConfirmContext = BasePluginContext & {
  assistantMessage: AssistantMessageWithState
}

export type ToolCallDecision =
  | {
      /**
       * 允许当前工具调用继续执行。
       *
       * 后续可扩展的候选动作：
       * - `{ action: 'allow_session' }`：允许当前会话中匹配的工具调用。
       * - `{ action: 'respond'; message: string }`：跳过工具执行，并将引导信息返回给模型。
       */
      action: 'allow'
    }
  | {
      /**
       * 拒绝当前工具调用，并可将 message 作为工具结果返回给模型。
       */
      action: 'deny'
      message?: string
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
     * 获取工具列表的函数。会在请求大模型前调用。
     */
    getTools: () => Promise<ChatCompletionTool[]>
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
    ) => Promise<string | Record<string, any>> | AsyncGenerator<string | Record<string, any>>
    /**
     * 判断当前工具调用是否需要外部确认。
     *
     * 传入该函数时，工具调用会停在 `awaiting-approval` 状态，不会创建空的 tool message，也不会执行 `callTool`。
     * 业务侧确认后应调用 `submitToolResult` 补齐对应的 `role: 'tool'` 结果消息；当上一个 assistant message
     * 的全部 `tool_calls` 都有结果后，kit 会继续下一轮请求。
     *
     * 未传入时默认不需要确认，会直接执行 `callTool`。返回值保留用于业务侧兼容，但不再控制是否暂停。
     *
     * TODO(v2): 当前只支持“本次允许/拒绝并提交结果”。后续可在消息状态和提交 API 上扩展
     * allow_session、respond/tell ai how to do 等动作，并支持按会话持久化授权策略。
     */
    confirmToolCall?: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallConfirmContext,
    ) => MaybePromise<boolean>
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
     * @param context.status - 工具调用状态：'success' | 'failed' | 'cancelled' | 'denied'
     * @param context.error - 当状态为 'failed' 或 'cancelled' 时，可能包含错误信息
     */
    onToolCallEnd?: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallContext & {
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
): MessageEnginePlugin => {
  const {
    getTools,
    beforeCallTools,
    callTool,
    confirmToolCall,
    onToolCallStart,
    onToolCallEnd,
    toolCallCancelledContent = 'Tool call cancelled.',
    toolCallFailedContent = 'Tool call failed.',
    toolCallDeniedContent: _toolCallDeniedContent = 'Tool call denied.',
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

  const toolCallAwaitApproval = (toolCall: ChatCompletionMessageToolCall, context: ToolCallConfirmContext) => {
    const { assistantMessage, mutate } = context

    mutate('messages', () => {
      const message = ensureToolCallState(assistantMessage, toolCall.id)
      message.state.toolCall[toolCall.id].status = 'awaiting-approval'
    })
  }

  const toolCallEnd = (...args: Parameters<NonNullable<typeof onToolCallEnd>>) => {
    const [toolCall, { status, assistantMessage, mutate }] = args

    mutate('messages', () => {
      const message = ensureToolCallState(assistantMessage, toolCall.id)
      message.state.toolCall[toolCall.id].status = status
    })

    onToolCallEnd?.(...args)
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

      const tools = await getTools()
      if (tools && tools.length > 0) {
        requestBody.tools = tools
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
      const assistantMessage = currentMessage as AssistantMessageWithState
      const contextWithAssistant = {
        ...context,
        assistantMessage,
      }

      await beforeCallTools?.(currentMessage.tool_calls as ChatCompletionMessageToolCall[], {
        ...context,
        assistantMessage,
      })

      const toolCallPromises = currentMessage.tool_calls.map(async (toolCall) => {
        const now = Math.floor(Date.now() / 1000)
        let hasMeaningfulResult = false
        let toolMessage: ChatMessage | undefined
        let contextWithToolMessage: ToolCallContext | undefined

        try {
          if (confirmToolCall) {
            await Promise.resolve(confirmToolCall(toolCall, contextWithAssistant))
            toolCallAwaitApproval(toolCall, contextWithAssistant)
            return 'pending' as const
          }

          toolMessage = createMessage({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: '',
            metadata: {
              createdAt: now,
              updatedAt: now,
            },
          })

          appendMessage(toolMessage)

          contextWithToolMessage = {
            ...context,
            assistantMessage,
            toolMessage,
          }
          const activeToolMessage = toolMessage
          const activeContextWithToolMessage = contextWithToolMessage

          toolCallStart(toolCall, activeContextWithToolMessage)

          const result = callTool(toolCall, activeContextWithToolMessage)

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
                activeToolMessage.content += chunk
              } else {
                let parsedContent: Record<string, any> = {}
                try {
                  const content = Array.isArray(activeToolMessage.content)
                    ? activeToolMessage.content.map((item: any) => item.text).join('')
                    : activeToolMessage.content
                  parsedContent = JSON.parse(content || '{}')
                } catch (error) {
                  console.warn(error)
                }
                activeToolMessage.content = JSON.stringify(combineDeltaData(parsedContent, chunk))
              }

              activeToolMessage.metadata!.updatedAt = Math.floor(Date.now() / 1000)
            })
          }

          toolCallEnd(toolCall, { ...activeContextWithToolMessage, status: 'success' })
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error))

          if (!toolMessage || !contextWithToolMessage) {
            console.error(error)
            mutate('messages', () => {
              const message = ensureToolCallState(assistantMessage, toolCall.id)
              message.state.toolCall[toolCall.id].status = 'failed'
            })
            return 'handled' as const
          }
          const activeToolMessage = toolMessage
          const activeContextWithToolMessage = contextWithToolMessage

          // 如果被 abort ，则抛出错误，主流程会处理状态
          // 也可以不抛出错误，直接返回，主流程会自动处理 abort 场景
          if (abortSignal.aborted) {
            if (!hasMeaningfulResult) {
              mutate('messages', () => {
                activeToolMessage.content = toolCallCancelledContent
                activeToolMessage.metadata!.updatedAt = Math.floor(Date.now() / 1000)
              })
            }

            toolCallEnd(toolCall, { ...activeContextWithToolMessage, status: 'cancelled', error: err })
            // throw error
            return 'handled' as const
          }

          // 其他错误视为工具调用失败，则将工具消息内容设置为失败内容
          console.error(error)

          if (!hasMeaningfulResult) {
            mutate('messages', () => {
              activeToolMessage.content = toolCallFailedContent
              activeToolMessage.metadata!.updatedAt = Math.floor(Date.now() / 1000)
            })
          }

          toolCallEnd(toolCall, { ...activeContextWithToolMessage, status: 'failed', error: err })
        }

        return 'handled' as const
      })

      const toolCallResults = await Promise.all(toolCallPromises)
      if (abortSignal.aborted) {
        return restOptions.onAfterRequest?.(context)
      }

      if (toolCallResults.some((result) => result === 'pending')) {
        setRequestState('processing', 'awaiting-tool-results')
      } else {
        requestNext()
      }

      return restOptions.onAfterRequest?.(context)
    },
  }
}
