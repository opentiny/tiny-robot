import type { ChatCompletionMessageFunctionToolCall, ChatCompletionMessageToolCall } from 'openai/resources'
import {
  appendAskUserContent,
  ASK_USER_TOOL_NAME,
  ASK_USER_SYSTEM_PROMPT,
  ASK_USER_SYSTEM_PROMPT_END,
  ASK_USER_SYSTEM_PROMPT_START,
  AskUserProtocolError,
  createAskUserRuntimeTool,
  parseAskUserToolCallArguments,
  stripAskUserContent,
  toAskUserContent,
  type AskUserToolArguments,
  type AskUserMessageState,
  type AskUserRuntimeMeta,
} from '../tools/askUser'
import type { RuntimeTool, ToolCallContext, ToolCallPreparationContext } from './toolPlugin'
import type { BeforeRequestContext, ChatMessage } from '../types'

type MutableMessage = {
  content?: unknown
  state?: Record<string, unknown>
}

export interface AskUserToolIntegration {
  runtimeTool: RuntimeTool
  getTools: () => [RuntimeTool]
  beforeCallTools: (toolCalls: ChatCompletionMessageToolCall[], context: ToolCallPreparationContext) => Promise<void>
  shouldDeferToolCall: (toolCall: ChatCompletionMessageToolCall) => boolean
  shouldPauseToolCall: (toolCall: ChatCompletionMessageToolCall, context: ToolCallContext) => boolean
  onBeforeRequest: (context: BeforeRequestContext) => void
  onToolCallEnd: (
    toolCall: ChatCompletionMessageToolCall,
    context: ToolCallContext & {
      status: 'success' | 'failed' | 'cancelled' | 'denied' | 'deferred'
      error?: Error
    },
  ) => void
}

export interface AskUserToolIntegrationOptions {
  /** Model-facing instructions. Defaults to ASK_USER_SYSTEM_PROMPT. */
  prompt?: string
}

const getMutableMessage = (message: ChatMessage): MutableMessage => {
  return message as unknown as MutableMessage
}

const formatAskUserSystemPrompt = (prompt: string) =>
  [ASK_USER_SYSTEM_PROMPT_START, prompt, ASK_USER_SYSTEM_PROMPT_END].join('\n')

const appendPromptToSystemContent = (content: unknown, prompt: string): unknown => {
  if (typeof content === 'string') {
    return content.trim().length > 0 ? `${content}\n\n${prompt}` : prompt
  }

  if (Array.isArray(content)) {
    return [...content, { type: 'text', text: `\n\n${prompt}` }]
  }

  return prompt
}

export const appendAskUserSystemPrompt = <T extends ChatMessage>(messages: T[], prompt?: string): T[] => {
  const normalizedPrompt = prompt?.trim() || ASK_USER_SYSTEM_PROMPT
  const markedPrompt = formatAskUserSystemPrompt(normalizedPrompt)
  const systemIndex = messages.findIndex((message) => message.role === 'system')

  if (systemIndex === -1) {
    return [{ role: 'system', content: markedPrompt } as T, ...messages]
  }

  const systemMessage = messages[systemIndex]
  if (String(JSON.stringify(systemMessage.content) ?? '').includes(ASK_USER_SYSTEM_PROMPT_START)) {
    return messages
  }

  return messages.map((message, index) =>
    index === systemIndex
      ? ({ ...message, content: appendPromptToSystemContent(message.content, markedPrompt) } as T)
      : message,
  )
}

const getAskUserMessageState = (message: ChatMessage): AskUserMessageState => {
  const mutableMessage = getMutableMessage(message)
  return (mutableMessage.state ?? {}) as AskUserMessageState
}

const isAskUserToolCall = (
  toolCall: ChatCompletionMessageToolCall,
): toolCall is ChatCompletionMessageFunctionToolCall => {
  return toolCall.type === 'function' && 'function' in toolCall && toolCall.function.name === ASK_USER_TOOL_NAME
}

const setAskUserTerminalResult = (
  context: ToolCallContext & {
    status: 'success' | 'failed' | 'cancelled' | 'denied' | 'deferred'
    error?: Error
  },
) => {
  if (context.status === 'success') {
    return
  }

  const state = getAskUserMessageState(context.assistantMessage)
  const cancelled = context.status === 'cancelled' || context.status === 'denied'
  const outcome = cancelled ? 'cancelled' : 'failed'
  const reason = context.error?.message ?? `ask_user tool ${context.status}`

  context.mutate('messages', () => {
    if (state.askUser && state.askUserRuntime) {
      const assistantMessage = getMutableMessage(context.assistantMessage)
      assistantMessage.state = {
        ...assistantMessage.state,
        askUser: {
          ...state.askUser,
          status: cancelled ? 'cancelled' : 'error',
          retryable: false,
          error: reason,
          updatedAt: Date.now(),
        },
        askUserRuntime: state.askUserRuntime,
      }
    }
    if (context.toolMessage) {
      context.toolMessage.content = JSON.stringify({ outcome, reason })
      context.toolMessage.metadata ??= {}
      context.toolMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
    }
  })
}

export const createAskUserToolIntegration = (options: AskUserToolIntegrationOptions = {}): AskUserToolIntegration => {
  const runtimeTool = createAskUserRuntimeTool()
  const deferredToolCallIds = new Set<string>()

  return {
    runtimeTool,
    getTools: () => [runtimeTool],
    beforeCallTools: async (toolCalls, context) => {
      deferredToolCallIds.clear()
      const askUserCalls = toolCalls.filter(isAskUserToolCall)
      if (askUserCalls.length === 0) {
        return
      }
      if (askUserCalls.length > 1) {
        throw new Error('Only one ask_user call is supported per assistant response')
      }

      const toolCall = askUserCalls[0]
      const siblingToolCalls = toolCalls.filter((call) => !isAskUserToolCall(call))
      for (const siblingToolCall of siblingToolCalls) {
        deferredToolCallIds.add(siblingToolCall.id)
      }

      let args: AskUserToolArguments
      try {
        args = parseAskUserToolCallArguments(toolCall)
      } catch (error) {
        if (error instanceof AskUserProtocolError) {
          return
        }
        throw error
      }

      const assistantMessage = getMutableMessage(context.assistantMessage as unknown as ChatMessage)
      const initialState = {
        status: 'active' as const,
        currentStep: 0,
        answers: {},
        completedStepIds: [],
        updatedAt: Date.now(),
      }
      const runtime: AskUserRuntimeMeta = {
        toolCallId: toolCall.id,
      }

      context.mutate('messages', () => {
        assistantMessage.content = appendAskUserContent(assistantMessage.content, toAskUserContent(args))
        assistantMessage.state = {
          ...assistantMessage.state,
          askUser: initialState,
          askUserRuntime: runtime,
        }
      })
    },
    shouldDeferToolCall: (toolCall) => deferredToolCallIds.delete(toolCall.id),
    shouldPauseToolCall: (toolCall, context) => {
      if (!isAskUserToolCall(toolCall)) {
        return false
      }

      const state = getAskUserMessageState(context.assistantMessage)
      return state.askUserRuntime?.toolCallId === toolCall.id && Boolean(state.askUser)
    },
    onBeforeRequest: (context) => {
      const messages = context.requestBody.messages.map((message) => {
        return {
          ...message,
          content: stripAskUserContent(message.content) as ChatMessage['content'],
        }
      }) as unknown as ChatMessage[]
      context.requestBody.messages = appendAskUserSystemPrompt(messages, options.prompt)
    },
    onToolCallEnd: (toolCall, context) => {
      if (!isAskUserToolCall(toolCall) || context.status === 'success') {
        return
      }

      setAskUserTerminalResult(context)
    },
  }
}
