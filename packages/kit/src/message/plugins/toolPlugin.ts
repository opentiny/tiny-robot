/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChatCompletionFunctionTool,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources'
import type { MaybePromise, MaybeStreamableResult } from '../../types'
import type { BasePluginContext, ChatMessage, MessageEnginePlugin, MutateMessageStateFn } from '../types'
import { combineDeltaData, makeAbortable, normalizeToAsyncGenerator } from '../utils'
import { clearTurnSnapshot, loadTurnSnapshots, saveTurnSnapshot, serializeTurnData } from '../core/turnPersistence'

type AssistantMessageWithState = ChatMessage<
  Record<string, unknown>,
  { toolCall?: Record<string, Record<string, unknown>> }
>

const collectPendingToolCallIds = (messages: ChatMessage[]) => {
  const ids = new Set<string>()

  for (const message of messages) {
    if (message.role !== 'assistant' || !Array.isArray(message.tool_calls)) {
      continue
    }

    const toolCallState = (message.state?.toolCall as Record<string, { status?: string }> | undefined) ?? {}
    for (const toolCall of message.tool_calls) {
      const status = toolCallState[toolCall.id]?.status
      if (status === undefined || status === 'awaiting-approval') {
        ids.add(toolCall.id)
      }
    }
  }

  return ids
}

const findPersistedPausedTurn = (messages: ChatMessage[]) => {
  const snapshots = loadTurnSnapshots()
  if (snapshots.length === 0) {
    return undefined
  }

  const messageToolCallIds = collectPendingToolCallIds(messages)
  const matches = snapshots.filter((snapshot) =>
    snapshot.toolCallIds.some((toolCallId) => messageToolCallIds.has(toolCallId)),
  )

  return matches.length === 1 ? matches[0] : undefined
}

const restorePersistedToolCallStates = (messages: ChatMessage[], toolCallIds: string[]) => {
  const toolCallIdSet = new Set(toolCallIds)

  messages.forEach((message) => {
    if (message.role !== 'assistant' || !Array.isArray(message.tool_calls)) {
      return
    }

    const pendingToolCallIds = message.tool_calls
      .map((toolCall) => toolCall.id)
      .filter((toolCallId) => toolCallIdSet.has(toolCallId))

    if (pendingToolCallIds.length === 0) {
      return
    }

    const toolCallState = (message.state?.toolCall as Record<string, Record<string, unknown>> | undefined) ?? {}
    const nextToolCallState = { ...toolCallState }
    let changed = false

    for (const toolCallId of pendingToolCallIds) {
      if (toolCallState[toolCallId]?.status !== undefined) {
        continue
      }

      nextToolCallState[toolCallId] = {
        ...toolCallState[toolCallId],
        status: 'awaiting-approval',
      }
      changed = true
    }

    if (!changed) {
      return
    }

    message.state = {
      ...message.state,
      toolCall: nextToolCallState,
    }
  })

  return messages
}

const restorePersistedTurnMessages = (messages: ChatMessage[], toolCallIds: string[]) => {
  const toolCallIdSet = new Set(toolCallIds)
  const assistantIndex = messages.findIndex(
    (message) =>
      message.role === 'assistant' &&
      Array.isArray(message.tool_calls) &&
      message.tool_calls.some((toolCall) => toolCallIdSet.has(toolCall.id)),
  )

  if (assistantIndex === -1) {
    return []
  }

  let turnStart = assistantIndex
  for (let index = assistantIndex - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') {
      turnStart = index
      break
    }
  }

  return messages.slice(turnStart)
}

/**
 * 工具来源标识，便于区分来自 toolPlugin、其他插件 provider，还是未知来源。
 */
export type ToolSource = { type: 'toolPlugin' } | { type: 'toolProvider'; pluginName?: string } | { type: 'unknown' }

export type ToolCallContext = BasePluginContext & {
  assistantMessage: AssistantMessageWithState
  /**
   * 当前工具消息。
   */
  toolMessage: ChatMessage
  /**
   * 当前工具的来源。
   */
  toolSource: ToolSource
}

export type ToolCallPreparationContext = BasePluginContext & {
  /**
   * 当前 assistant 消息。
   */
  assistantMessage: AssistantMessageWithState
}

export const TOOL_RESUME_COMMAND = 'tool.resume'
export const TOOL_REJECT_COMMAND = 'tool.reject'

export type ToolResumeCommandPayload = {
  /**
   * 需要恢复或拒绝的 tool call id。
   */
  toolCallId: string
  /**
   * 恢复或拒绝时附带的说明。
   */
  reason?: string
}

/**
 * 恢复或拒绝工具调用的命令执行结果。
 */
export type ToolResumeCommandResult =
  | { status: 'resumed'; toolCallId: string }
  | { status: 'denied'; toolCallId: string }
  | { status: 'missing'; toolCallId: string }

export interface RuntimeTool {
  /**
   * runtime tool 的 schema 描述。
   */
  tool: ChatCompletionFunctionTool
  /**
   * runtime tool 的执行函数。
   */
  handler: (
    toolCall: ChatCompletionMessageFunctionToolCall,
    context: ToolCallContext,
  ) => MaybeStreamableResult<string | Record<string, any>>
}

export type ToolProviderItem = ChatCompletionTool | RuntimeTool

export interface ToolProvider {
  /**
   * 向 toolPlugin 提供工具列表。
   */
  provideTools: (context: BasePluginContext) => MaybePromise<ToolProviderItem[]>
}

/**
 * 修复历史消息中 assistant/tool 的配对关系。
 *
 * 当 assistant 已经发出了 tool_calls，但后续 tool 消息因为异常中断、人工拒绝、
 * 或外部流程提前结束而没有补齐时，这里会自动插入“工具调用已取消”的占位消息，
 * 让后续请求看到一条完整的消息链。
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
    beforeCallTools?: (toolCalls: ChatCompletionMessageToolCall[], context: ToolCallPreparationContext) => Promise<void>
    /**
     * 在每个工具调用正式执行前判断是否需要等待外部确认。
     * 返回 true 时当前工具会进入 awaiting-approval，其他工具仍可继续执行。
     */
    shouldPauseToolCall?: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallContext,
    ) => boolean | Promise<boolean>
    /**
     * 执行单个工具调用并返回其文本结果的函数。
     */
    callTool: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallContext,
    ) => MaybeStreamableResult<string | Record<string, any>>
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
     * @param context.error - 当状态为 'failed'、'cancelled' 或 'denied' 时，可能包含错误信息
     */
    onToolCallEnd?: (
      toolCall: ChatCompletionMessageToolCall,
      context: ToolCallContext & {
        status: 'success' | 'failed' | 'cancelled' | 'denied'
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
     * 当工具调用被用户拒绝或取消当前回合而被标记为 denied 时使用的消息内容。
     */
    toolCallDeniedContent?: string
    /**
     * 当工具调用执行失败（抛错）时使用的消息内容。
     */
    toolCallFailedContent?: string
    /**
     * 是否在浏览器 localStorage 中持久化暂停的工具回合。默认：true。
     */
    persistPausedTurn?: boolean
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
    shouldPauseToolCall,
    callTool,
    onToolCallStart,
    onToolCallEnd,
    toolCallPausedContent = 'Tool call awaiting confirmation.',
    toolCallCancelledContent = 'Tool call cancelled.',
    toolCallDeniedContent = 'Tool call denied.',
    toolCallFailedContent = 'Tool call failed.',
    persistPausedTurn = true,
    autoFillMissingToolMessages = false,
    ...restOptions
  } = options

  const persistPausedTurnState = (context: BasePluginContext) => {
    if (!persistPausedTurn || !context.turnId) {
      return
    }

    const state = context.getState()
    const toolCallIds = Array.from(
      new Set(
        state.messages.flatMap((message) => {
          if (message.role !== 'assistant' || !Array.isArray(message.tool_calls)) {
            return []
          }

          const toolCallState = (message.state?.toolCall as Record<string, { status?: string }> | undefined) ?? {}
          return message.tool_calls
            .filter((toolCall) => toolCallState[toolCall.id]?.status === 'awaiting-approval')
            .map((toolCall) => toolCall.id)
        }),
      ),
    )

    if (toolCallIds.length === 0) {
      return
    }

    const customContext = serializeTurnData(context.customContext)
    if (!customContext || typeof customContext !== 'object') {
      return
    }

    saveTurnSnapshot({
      version: 1,
      turnId: context.turnId,
      requestState: 'paused',
      processingState: state.processingState,
      toolCallIds,
      customContext: customContext as Record<string, unknown>,
      pausedAt: Date.now(),
    })
  }

  const ensureToolCallState = (assistantMessage: AssistantMessageWithState, toolCallId: string) => {
    assistantMessage.state ??= {}
    assistantMessage.state.toolCall ??= {}
    assistantMessage.state.toolCall[toolCallId] ??= {}
    return assistantMessage as AssistantMessageWithState & {
      state: { toolCall: Record<string, Record<string, unknown>> }
    }
  }

  const setToolCallState = (
    assistantMessage: AssistantMessageWithState,
    toolCallId: string,
    patch: Record<string, unknown>,
    mutate: MutateMessageStateFn,
  ) => {
    mutate('messages', () => {
      const message = ensureToolCallState(assistantMessage, toolCallId)
      Object.assign(message.state.toolCall[toolCallId], patch)
    })
  }

  const toolCallStart = (...args: Parameters<NonNullable<typeof onToolCallStart>>) => {
    const [toolCall, { assistantMessage, mutate }] = args

    const toolCallStatus = assistantMessage.state?.toolCall?.[toolCall.id]?.status
    if (toolCallStatus !== 'awaiting-approval') {
      setToolCallState(assistantMessage, toolCall.id, { status: 'running' }, mutate)
    }
    onToolCallStart?.(...args)
  }

  const toolCallEnd = (...args: Parameters<NonNullable<typeof onToolCallEnd>>) => {
    const [toolCall, { status, assistantMessage, mutate }] = args
    setToolCallState(assistantMessage, toolCall.id, { status }, mutate)
    onToolCallEnd?.(...args)
  }

  const isFunctionToolCall = (
    toolCall: ChatCompletionMessageToolCall,
  ): toolCall is ChatCompletionMessageFunctionToolCall => {
    return toolCall.type === 'function' && 'function' in toolCall
  }

  const isFunctionTool = (tool: ChatCompletionTool): tool is ChatCompletionFunctionTool => {
    return tool.type === 'function' && 'function' in tool
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

  type ResolvedTools = {
    tools: ChatCompletionTool[]
    runtimeToolMap: Map<string, RuntimeTool>
    toolSourceMap: Map<string, ToolSource>
  }

  let currentToolResolution: ResolvedTools | undefined

  const hasMeaningfulToolContent = (content: unknown) => {
    if (typeof content === 'string') {
      return content.trim().length > 0
    }

    if (Array.isArray(content)) {
      return content.some((item) => {
        if (typeof item === 'string') {
          return item.trim().length > 0
        }

        if (item && typeof item === 'object' && 'text' in item && typeof item.text === 'string') {
          return item.text.trim().length > 0
        }

        return Boolean(item)
      })
    }

    if (content && typeof content === 'object') {
      return Object.keys(content).length > 0
    }

    return Boolean(content)
  }

  const findPendingToolCall = (messages: ChatMessage[]) => {
    let i = messages.length - 1
    const toolMessages: ChatMessage[] = []

    while (i >= 0 && messages[i].role === 'tool') {
      toolMessages.unshift(messages[i])
      i--
    }

    const assistantMessage = messages[i]
    if (!assistantMessage || assistantMessage.role !== 'assistant') {
      return null
    }

    if (!Array.isArray(assistantMessage.tool_calls) || assistantMessage.tool_calls.length === 0) {
      return null
    }

    return {
      assistantMessage,
      toolMessages: toolMessages as Extract<ChatMessage, { role: 'tool' }>[],
    }
  }

  const isAllToolCallsCompleted = (
    assistantMessage: Extract<ChatMessage, { role: 'assistant' }> & AssistantMessageWithState,
    toolMessages: Extract<ChatMessage, { role: 'tool' }>[],
  ): boolean => {
    const toolMessageMap = new Map(toolMessages.map((msg) => [msg.tool_call_id, msg]))
    const toolCallState = assistantMessage.state?.toolCall as Record<string, Record<string, unknown>> | undefined

    return (
      assistantMessage.tool_calls?.every((toolCall) => {
        const toolMessage = toolMessageMap.get(toolCall.id)
        const toolCallStatus = toolCallState?.[toolCall.id]?.status

        if (!toolMessage || toolCallStatus === 'running' || toolCallStatus === 'awaiting-approval') {
          return false
        }

        return typeof toolCallStatus === 'string' || hasMeaningfulToolContent(toolMessage.content)
      }) ?? false
    )
  }

  const parsePauseCommandPayload = (payload: unknown): ToolResumeCommandPayload => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Tool pause/resume commands require an object payload with toolCallId.')
    }

    const { toolCallId, reason } = payload as { toolCallId?: unknown; reason?: unknown }

    if (typeof toolCallId !== 'string' || !toolCallId) {
      throw new Error('Tool pause/resume commands require a non-empty toolCallId.')
    }

    return {
      toolCallId,
      ...(typeof reason === 'string' && reason.length > 0 ? { reason } : {}),
    }
  }

  const findPendingToolCallFromContext = (context: BasePluginContext) => {
    const pendingFromTurn = context.currentTurn.length > 0 ? findPendingToolCall(context.currentTurn) : null

    return pendingFromTurn ?? findPendingToolCall(context.getState().messages)
  }

  const markToolCallAwaiting = (
    assistantMessage: AssistantMessageWithState,
    toolCallId: string,
    mutate: MutateMessageStateFn,
    toolMessage?: ChatMessage,
  ) => {
    const now = Math.floor(Date.now() / 1000)
    const content = toolCallPausedContent

    setToolCallState(
      assistantMessage,
      toolCallId,
      {
        status: 'awaiting-approval',
        content,
      },
      mutate,
    )

    if (toolMessage) {
      mutate('messages', () => {
        toolMessage.content = content
        toolMessage.metadata ??= {}
        toolMessage.metadata.updatedAt = now
      })
    }
  }

  const processToolCall = async (
    toolCall: ChatCompletionMessageToolCall,
    contextWithToolMessage: ToolCallContext,
    runtimeToolMap: Map<string, RuntimeTool>,
    options: { skipStartHook?: boolean } = {},
  ) => {
    const { toolMessage: _toolMessage, abortSignal, mutate } = contextWithToolMessage
    const toolMessage = _toolMessage as Extract<ChatMessage, { role: 'tool' }>
    let hasMeaningfulResult = false

    const functionToolCall = isFunctionToolCall(toolCall) ? toolCall : undefined
    const runtimeTool = functionToolCall ? runtimeToolMap.get(functionToolCall.function.name) : undefined

    if (options.skipStartHook) {
      const assistantMessage = contextWithToolMessage.assistantMessage
      setToolCallState(assistantMessage, toolCall.id, { status: 'running' }, mutate)
    } else {
      toolCallStart(toolCall, contextWithToolMessage)
    }
    try {
      const result =
        runtimeTool && functionToolCall
          ? runtimeTool.handler(functionToolCall, contextWithToolMessage)
          : callTool(toolCall, contextWithToolMessage)

      const iterator = normalizeToAsyncGenerator(result)

      for await (const chunk of iterator) {
        mutate('messages', () => {
          if (
            (typeof chunk === 'string' && chunk.length > 0) ||
            (chunk && typeof chunk === 'object' && Object.keys(chunk).length > 0)
          ) {
            hasMeaningfulResult = true
          }

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

          toolMessage.metadata ??= {}
          toolMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
        })
      }

      toolCallEnd(toolCall, { ...contextWithToolMessage, status: 'success' })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      if (abortSignal.aborted) {
        toolCallEnd(toolCall, { ...contextWithToolMessage, status: 'cancelled', error: err })
        return
      }

      console.error(error)

      if (!hasMeaningfulResult) {
        mutate('messages', () => {
          toolMessage.content = toolCallFailedContent
          toolMessage.metadata ??= {}
          toolMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
        })
      }

      toolCallEnd(toolCall, { ...contextWithToolMessage, status: 'failed', error: err })
    }
  }

  const resolveTools = async (
    context: BasePluginContext,
    existingTools: ChatCompletionTool[] = [],
  ): Promise<ResolvedTools> => {
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
    const tools: ChatCompletionTool[] = []
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

    existingTools.filter(isFunctionTool).forEach(registerToolName)

    for (const { item: toolItem, source } of toolItems) {
      const tool = isRuntimeTool(toolItem) ? toolItem.tool : toolItem

      if (isFunctionTool(tool)) {
        registerToolName(tool)
        toolSourceMap.set(tool.function.name, source)
      }

      if (isRuntimeTool(toolItem)) {
        tools.push(toolItem.tool)
        runtimeToolMap.set(toolItem.tool.function.name, toolItem)
      } else {
        tools.push(toolItem)
      }
    }

    return { tools, runtimeToolMap, toolSourceMap }
  }

  const ensureToolMessage = ({
    toolCall,
    toolMessages,
    createMessage,
    appendMessage,
  }: {
    toolCall: ChatCompletionMessageToolCall
    toolMessages: Extract<ChatMessage, { role: 'tool' }>[]
    createMessage: BasePluginContext['createMessage']
    appendMessage: (message: ChatMessage | ChatMessage[]) => void
  }) => {
    let toolMessage = toolMessages.find((message) => message.tool_call_id === toolCall.id)

    if (!toolMessage) {
      const now = Math.floor(Date.now() / 1000)
      toolMessage = createMessage({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: '',
        metadata: {
          createdAt: now,
          updatedAt: now,
        },
      }) as Extract<ChatMessage, { role: 'tool' }>
      appendMessage(toolMessage)
    }

    return toolMessage
  }

  const getToolSource = (toolCall: ChatCompletionMessageToolCall, toolSourceMap: Map<string, ToolSource>) => {
    const functionToolCall = isFunctionToolCall(toolCall) ? toolCall : undefined
    return functionToolCall
      ? (toolSourceMap.get(functionToolCall.function.name) ?? { type: 'unknown' as const })
      : { type: 'unknown' as const }
  }

  return {
    name: 'tool',
    ...restOptions,
    onInit: (context) => {
      const restResult = restOptions.onInit?.(context)
      const persistedPausedTurn = persistPausedTurn ? findPersistedPausedTurn(context.initialMessages) : undefined

      if (!persistedPausedTurn) {
        return restResult
      }

      const restoredMessages = restorePersistedToolCallStates(context.initialMessages, persistedPausedTurn.toolCallIds)
      return {
        ...(restResult ?? {}),
        requestState: 'paused',
        processingState: persistedPausedTurn.processingState,
        turnId: persistedPausedTurn.turnId,
        currentTurn: restorePersistedTurnMessages(restoredMessages, persistedPausedTurn.toolCallIds),
        customContext: persistedPausedTurn.customContext,
      }
    },
    onResumed: async (context) => {
      if (persistPausedTurn && context.turnId) {
        clearTurnSnapshot(context.turnId)
      }
      await restOptions.onResumed?.(context)
    },
    onTurnEnd: async (context) => {
      if (persistPausedTurn && context.turnId) {
        clearTurnSnapshot(context.turnId)
      }
      await restOptions.onTurnEnd?.(context)
    },
    onPaused: async (context) => {
      persistPausedTurnState(context)
      await restOptions.onPaused?.(context)
    },
    commands: {
      [TOOL_RESUME_COMMAND]: async (payload, context) => {
        const { toolCallId, reason } = parsePauseCommandPayload(payload)
        const { createMessage, appendMessage, requestNext, setRequestState, mutate } = context

        const pending = findPendingToolCallFromContext(context)

        if (!pending) {
          return { status: 'missing', toolCallId } satisfies ToolResumeCommandResult
        }

        const assistantMessage = pending.assistantMessage as Extract<ChatMessage, { role: 'assistant' }> &
          AssistantMessageWithState
        const toolCall = assistantMessage.tool_calls?.find((call) => call.id === toolCallId)

        if (!toolCall) {
          return { status: 'missing', toolCallId } satisfies ToolResumeCommandResult
        }

        const toolCallStatus = assistantMessage.state?.toolCall?.[toolCallId]?.status
        if (toolCallStatus !== 'awaiting-approval') {
          return { status: 'missing', toolCallId } satisfies ToolResumeCommandResult
        }

        const toolMessage = ensureToolMessage({
          toolCall,
          toolMessages: pending.toolMessages,
          createMessage,
          appendMessage,
        })

        if (reason) {
          setToolCallState(assistantMessage, toolCallId, { reason }, mutate)
        }

        setRequestState('processing', 'calling-tools')
        const { runtimeToolMap, toolSourceMap } = await resolveTools(context, [])
        const toolSource = getToolSource(toolCall, toolSourceMap)

        mutate('messages', () => {
          toolMessage.content = ''
          toolMessage.metadata ??= {}
          toolMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
        })

        await processToolCall(
          toolCall,
          {
            ...context,
            assistantMessage,
            toolMessage,
            toolSource,
          },
          runtimeToolMap,
          { skipStartHook: true },
        )

        const latestPending = findPendingToolCallFromContext(context)
        const latestToolMessages = latestPending?.toolMessages ?? []

        if (isAllToolCallsCompleted(assistantMessage, latestToolMessages)) {
          requestNext(true)
        } else {
          setRequestState('paused')
        }

        return { status: 'resumed', toolCallId } satisfies ToolResumeCommandResult
      },
      [TOOL_REJECT_COMMAND]: async (payload, context) => {
        const { toolCallId, reason } = parsePauseCommandPayload(payload)
        const { createMessage, appendMessage, requestNext, setRequestState, mutate } = context

        const pending = findPendingToolCallFromContext(context)

        if (!pending) {
          return { status: 'missing', toolCallId } satisfies ToolResumeCommandResult
        }

        const assistantMessage = pending.assistantMessage as Extract<ChatMessage, { role: 'assistant' }> &
          AssistantMessageWithState
        const toolCall = assistantMessage.tool_calls?.find((call) => call.id === toolCallId)

        if (!toolCall) {
          return { status: 'missing', toolCallId } satisfies ToolResumeCommandResult
        }

        const toolCallStatus = assistantMessage.state?.toolCall?.[toolCallId]?.status
        if (toolCallStatus !== 'awaiting-approval') {
          return { status: 'missing', toolCallId } satisfies ToolResumeCommandResult
        }

        const toolMessage = ensureToolMessage({
          toolCall,
          toolMessages: pending.toolMessages,
          createMessage,
          appendMessage,
        })

        if (reason) {
          setToolCallState(assistantMessage, toolCallId, { reason }, mutate)
        }

        setRequestState('processing', 'calling-tools')
        const { toolSourceMap } = await resolveTools(context, [])
        const toolSource = getToolSource(toolCall, toolSourceMap)

        mutate('messages', () => {
          toolMessage.content = toolCallDeniedContent
          toolMessage.metadata ??= {}
          toolMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
        })

        toolCallEnd(toolCall, {
          ...context,
          assistantMessage,
          toolMessage,
          toolSource,
          status: 'denied',
          error: new Error(reason ?? 'Tool call rejected.'),
        })

        const latestPending = findPendingToolCallFromContext(context)
        const latestToolMessages = latestPending?.toolMessages ?? []

        if (isAllToolCallsCompleted(assistantMessage, latestToolMessages)) {
          requestNext(true)
        } else {
          setRequestState('paused')
        }

        return { status: 'denied', toolCallId } satisfies ToolResumeCommandResult
      },
      ...restOptions.commands,
    },
    onTurnStart: (context) => {
      const { getState, createMessage, mutate } = context
      const messages = getState().messages

      if (autoFillMissingToolMessages) {
        fillMissingToolMessages({ messages, cancelledContent: toolCallCancelledContent, createMessage, mutate })
      }

      return restOptions.onTurnStart?.(context)
    },
    onTurnAbort: (context) => {
      if (persistPausedTurn && context.turnId) {
        clearTurnSnapshot(context.turnId)
      }

      const pending = findPendingToolCallFromContext(context)

      if (pending) {
        const assistantMessage = pending.assistantMessage as Extract<ChatMessage, { role: 'assistant' }> &
          AssistantMessageWithState
        const toolCallState = assistantMessage.state?.toolCall ?? {}

        for (const toolCall of assistantMessage.tool_calls ?? []) {
          if (toolCallState[toolCall.id]?.status !== 'awaiting-approval') {
            continue
          }

          const toolMessage = pending.toolMessages.find((message) => message.tool_call_id === toolCall.id)
          setToolCallState(
            assistantMessage,
            toolCall.id,
            { status: 'denied', reason: 'Tool call cancelled by user.' },
            context.mutate,
          )

          if (toolMessage) {
            context.mutate('messages', () => {
              toolMessage.content = toolCallDeniedContent
              toolMessage.metadata ??= {}
              toolMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
            })

            const functionToolCall = isFunctionToolCall(toolCall) ? toolCall : undefined
            const toolSource = functionToolCall
              ? (currentToolResolution?.toolSourceMap.get(functionToolCall.function.name) ?? {
                  type: 'unknown' as const,
                })
              : { type: 'unknown' as const }

            toolCallEnd(toolCall, {
              ...context,
              assistantMessage,
              toolMessage,
              toolSource,
              status: 'denied',
              error: new Error('Tool call cancelled by user.'),
            })
          }
        }
      }

      return restOptions.onTurnAbort?.(context)
    },
    onBeforeRequest: async (context) => {
      const { requestBody } = context

      const existingTools = Array.isArray(requestBody.tools) ? requestBody.tools : []
      const resolvedTools = await resolveTools(context, existingTools)
      currentToolResolution = resolvedTools
      const { tools } = resolvedTools
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
        return restOptions.onAfterRequest?.(context)
      }

      setRequestState('processing', 'calling-tools')
      const assistantMessage = currentMessage as AssistantMessageWithState

      await beforeCallTools?.(currentMessage.tool_calls as ChatCompletionMessageToolCall[], {
        ...context,
        assistantMessage,
      })

      const { runtimeToolMap, toolSourceMap } = currentToolResolution ?? {
        runtimeToolMap: new Map<string, RuntimeTool>(),
        toolSourceMap: new Map<string, ToolSource>(),
      }

      let hasAwaitingApprovalToolCall = false
      const toolCallPromises = currentMessage.tool_calls.map(async (toolCall) => {
        const now = Math.floor(Date.now() / 1000)
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
          assistantMessage,
          toolMessage,
          toolSource,
        }

        if (shouldPauseToolCall && (await shouldPauseToolCall(toolCall, contextWithToolMessage))) {
          markToolCallAwaiting(assistantMessage, toolCall.id, mutate, toolMessage)
          hasAwaitingApprovalToolCall = true
          return
        }

        toolCallStart(toolCall, contextWithToolMessage)

        await processToolCall(toolCall, contextWithToolMessage, runtimeToolMap)
      })

      await makeAbortable(Promise.all(toolCallPromises), abortSignal)
      if (!abortSignal.aborted) {
        if (hasAwaitingApprovalToolCall) {
          setRequestState('paused')
        } else {
          requestNext()
        }
      }

      return restOptions.onAfterRequest?.(context)
    },
    onFinally: (context) => {
      try {
        restOptions.onFinally?.(context)
      } finally {
        currentToolResolution = undefined
      }
    },
  }
}
