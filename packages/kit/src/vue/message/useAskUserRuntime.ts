import type { ChatCompletionMessageFunctionToolCall } from 'openai/resources'
import type { ChatMessage } from '../../types'
import {
  parseAskUserToolCallArguments,
  validateAndNormalizeAnswers,
  type AskUserMessageState,
  type AskUserRuntimeMeta,
  type AskUserState,
} from '../../message/tools/askUser'
import { TOOL_REJECT_COMMAND, TOOL_RESUME_COMMAND, type ToolCallCommandResult } from '../../message/plugins/toolPlugin'
import type { UseMessageReturn } from './types'

export interface AskUserStateChangeEvent {
  key: string
  value: unknown
  messageIndex: number
  contentIndex: number
}

export interface AskUserBubbleEvent {
  name: string
  payload?: unknown
  messageIndex: number
  contentIndex: number
}

type AskUserMessage = ChatMessage & {
  state?: Record<string, unknown>
}

const getAskUserMessageState = (message: AskUserMessage): AskUserMessageState => {
  return (message.state ?? {}) as AskUserMessageState
}

const getToolCallStatus = (message: AskUserMessage, toolCallId: string): string | undefined => {
  const toolCallState = getAskUserMessageState(message).toolCall
  if (!toolCallState || typeof toolCallState !== 'object') {
    return undefined
  }

  const callState = (toolCallState as Record<string, { status?: unknown }>)[toolCallId]
  return typeof callState?.status === 'string' ? callState.status : undefined
}

const isKnownHandledToolCallStatus = (status: string | undefined) => {
  return typeof status === 'string' && status !== 'awaiting-approval'
}

export const useAskUserRuntime = (message: Pick<UseMessageReturn, 'messages' | 'dispatchCommand'>) => {
  const resumePromises = new Map<string, Promise<ToolCallCommandResult>>()
  const cancelPromises = new Map<string, Promise<ToolCallCommandResult>>()

  const setAskUserError = (target: AskUserMessage, state: AskUserState, error: unknown) => {
    const runtime = getAskUserMessageState(target).askUserRuntime
    const retryable = runtime ? getToolCallStatus(target, runtime.toolCallId) === 'awaiting-approval' : false

    target.state = {
      ...target.state,
      askUser: {
        ...state,
        status: 'error',
        retryable,
        error: error instanceof Error ? error.message : String(error),
        updatedAt: Date.now(),
      },
    }
  }

  const resumeToolCall = (toolCallId: string) => {
    const pendingResume = resumePromises.get(toolCallId)
    if (pendingResume) {
      return pendingResume
    }

    const resume = message
      .dispatchCommand<ToolCallCommandResult>(TOOL_RESUME_COMMAND, {
        toolCallId,
      })
      .finally(() => {
        if (resumePromises.get(toolCallId) === resume) {
          resumePromises.delete(toolCallId)
        }
      })
    resumePromises.set(toolCallId, resume)
    return resume
  }

  const rejectToolCall = (toolCallId: string, reason: string) => {
    const pendingCancel = cancelPromises.get(toolCallId)
    if (pendingCancel) {
      return pendingCancel
    }

    const cancel = message
      .dispatchCommand<ToolCallCommandResult>(TOOL_REJECT_COMMAND, {
        toolCallId,
        reason,
      })
      .finally(() => {
        if (cancelPromises.get(toolCallId) === cancel) {
          cancelPromises.delete(toolCallId)
        }
      })
    cancelPromises.set(toolCallId, cancel)
    return cancel
  }

  const ensureResumeSucceeded = (target: AskUserMessage, toolCallId: string, result: ToolCallCommandResult) => {
    if (result.status !== 'missing') {
      return
    }

    const currentState = getAskUserMessageState(target).askUser
    if (!currentState || currentState.status !== 'submitted') {
      return
    }

    if (isKnownHandledToolCallStatus(getToolCallStatus(target, toolCallId))) {
      return
    }

    throw new Error('ask_user tool call cannot be resumed')
  }

  const handleStateChange = ({ messageIndex, key, value }: AskUserStateChangeEvent) => {
    const target = message.messages.value[messageIndex] as AskUserMessage | undefined
    if (!target) {
      return
    }

    target.state = {
      ...target.state,
      [key]: value,
    }
  }

  const handleBubbleEvent = async (event: AskUserBubbleEvent) => {
    const target = message.messages.value[event.messageIndex] as AskUserMessage | undefined
    if (!target) {
      return
    }

    const messageState = getAskUserMessageState(target)
    const state = messageState.askUser
    const runtime = messageState.askUserRuntime as AskUserRuntimeMeta | undefined

    if (event.name === 'ask-user:cancel') {
      if (!state || state.status !== 'active' || !runtime?.toolCallId) {
        return
      }

      if (getToolCallStatus(target, runtime.toolCallId) !== 'awaiting-approval') {
        setAskUserError(target, state, new Error('ask_user tool call cannot be cancelled'))
        return
      }

      const reason =
        typeof event.payload === 'string' && event.payload.trim().length > 0
          ? event.payload.trim()
          : 'User cancelled the ask_user form.'

      try {
        const result = await rejectToolCall(runtime.toolCallId, reason)
        if (result.status === 'missing') {
          throw new Error('ask_user tool call cannot be cancelled')
        }

        target.state = {
          ...target.state,
          askUser: {
            ...getAskUserMessageState(target).askUser,
            status: 'cancelled',
            retryable: false,
            error: reason,
            updatedAt: Date.now(),
          },
        }
      } catch (error) {
        setAskUserError(target, getAskUserMessageState(target).askUser ?? state, error)
      }
      return
    }

    if (event.name === 'ask-user:retry') {
      if (!state || !runtime?.toolCallId) {
        return
      }

      if (getToolCallStatus(target, runtime.toolCallId) !== 'awaiting-approval') {
        setAskUserError(target, state, new Error('ask_user tool call cannot be retried'))
        return
      }

      target.state = {
        ...target.state,
        askUser: {
          ...state,
          status: 'active',
          retryable: undefined,
          error: undefined,
          updatedAt: Date.now(),
        },
      }
      return
    }

    if (event.name !== 'ask-user:submit') {
      return
    }

    if (!state || state.status !== 'submitted' || !runtime?.toolCallId) {
      return
    }

    try {
      const toolCall = target.tool_calls?.find((call) => call.id === runtime.toolCallId)
      if (!toolCall || toolCall.type !== 'function') {
        throw new Error('ask_user tool call not found')
      }

      const toolCallStatus = getToolCallStatus(target, runtime.toolCallId)
      if (toolCallStatus === 'denied' || toolCallStatus === 'cancelled' || toolCallStatus === 'failed') {
        throw new Error('ask_user tool call cannot be resumed')
      }

      const args = parseAskUserToolCallArguments(toolCall as unknown as ChatCompletionMessageFunctionToolCall)
      const answers = validateAndNormalizeAnswers(args.questions, state.answers)

      target.state = {
        ...target.state,
        askUser: {
          ...state,
          answers,
          status: 'submitted',
          updatedAt: Date.now(),
        },
      }

      const result = await resumeToolCall(runtime.toolCallId)
      ensureResumeSucceeded(target, runtime.toolCallId, result)
    } catch (error) {
      setAskUserError(target, getAskUserMessageState(target).askUser ?? state, error)
    }
  }

  return {
    handleStateChange,
    handleBubbleEvent,
  }
}
