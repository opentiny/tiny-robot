import type { ChatCompletionMessageFunctionToolCall, ChatCompletionMessageToolCall } from 'openai/resources'
import {
  appendAskUserContent,
  ASK_USER_TOOL_NAME,
  ASK_USER_SYSTEM_PROMPT,
  ASK_USER_SYSTEM_PROMPT_END,
  ASK_USER_SYSTEM_PROMPT_START,
  createAskUserRuntimeTool,
  parseAskUserToolCallArguments,
  stripAskUserContent,
  toAskUserContent,
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
  shouldPauseToolCall: (toolCall: ChatCompletionMessageToolCall) => boolean
  onBeforeRequest: (context: BeforeRequestContext) => void
  onToolCallEnd: (
    toolCall: ChatCompletionMessageToolCall,
    context: ToolCallContext & {
      status: 'success' | 'failed' | 'cancelled' | 'denied'
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

const hasPendingInteraction = (context: ToolCallPreparationContext, interactionId: string) => {
  return context.getState().messages.some((message) => {
    if (message.role !== 'assistant') {
      return false
    }

    const state = getAskUserMessageState(message)
    const runtime = state.askUserRuntime
    const toolCallState = state.toolCall as Record<string, { status?: string }> | undefined

    return (
      runtime?.interactionId === interactionId && toolCallState?.[runtime.toolCallId]?.status === 'awaiting-approval'
    )
  })
}

const setAskUserError = (context: ToolCallContext, error: string) => {
  const assistantMessage = getMutableMessage(context.assistantMessage)
  const state = getAskUserMessageState(context.assistantMessage)
  if (!state.askUser || !state.askUserRuntime) {
    return
  }

  context.mutate('messages', () => {
    assistantMessage.state = {
      ...assistantMessage.state,
      askUser: {
        ...state.askUser,
        status: 'error',
        error,
        updatedAt: Date.now(),
      },
      askUserRuntime: state.askUserRuntime,
    }
  })
}

export const createAskUserToolIntegration = (options: AskUserToolIntegrationOptions = {}): AskUserToolIntegration => {
  const runtimeTool = createAskUserRuntimeTool()

  return {
    runtimeTool,
    getTools: () => [runtimeTool],
    beforeCallTools: async (toolCalls, context) => {
      const askUserCalls = toolCalls.filter(isAskUserToolCall)
      if (askUserCalls.length === 0) {
        return
      }
      if (askUserCalls.length > 1) {
        throw new Error('Only one ask_user call is supported per assistant response')
      }

      const toolCall = askUserCalls[0]
      const args = parseAskUserToolCallArguments(toolCall)
      if (hasPendingInteraction(context, args.id)) {
        throw new Error(`An unfinished ask_user interaction already uses id "${args.id}"`)
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
        interactionId: args.id,
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
    shouldPauseToolCall: isAskUserToolCall,
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
      if (!isAskUserToolCall(toolCall) || context.status !== 'failed') {
        return
      }

      setAskUserError(context, context.error?.message ?? 'ask_user tool failed')
    },
  }
}
