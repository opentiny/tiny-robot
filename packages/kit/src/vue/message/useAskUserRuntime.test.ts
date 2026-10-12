import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { TOOL_RESUME_COMMAND, type ToolCallCommandResult } from '../../message/plugins/toolPlugin'
import type { ChatMessage } from '../../types'
import { useAskUserRuntime } from './useAskUserRuntime'

const createMessage = (
  answers: Record<string, unknown>,
  toolCallStatus = 'awaiting-approval',
  askUserStatus: 'active' | 'submitted' = 'submitted',
) => {
  return {
    role: 'assistant',
    content: '',
    tool_calls: [
      {
        index: 0,
        id: 'call-ask-user',
        type: 'function' as const,
        function: {
          name: 'ask_user',
          arguments: JSON.stringify({
            id: 'profile',
            steps: [
              {
                id: 'name',
                title: '姓名',
                summary: '姓名',
                type: 'text',
                required: true,
              },
            ],
          }),
        },
      },
    ],
    state: {
      askUser: {
        status: askUserStatus,
        currentStep: 0,
        answers,
        completedStepIds: ['name'],
      },
      askUserRuntime: {
        interactionId: 'profile',
        toolCallId: 'call-ask-user',
      },
      toolCall: {
        'call-ask-user': {
          status: toolCallStatus,
        },
      },
    },
  } satisfies ChatMessage
}

describe('useAskUserRuntime', () => {
  it('persists state changes and resumes the matching tool call', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' })])
    const dispatchCommand = vi.fn().mockResolvedValue({ status: 'resumed', toolCallId: 'call-ask-user' })
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    runtime.handleStateChange({
      key: 'askUser',
      value: {
        status: 'submitted',
        currentStep: 0,
        answers: { name: 'Ada Lovelace' },
        completedStepIds: ['name'],
      },
      messageIndex: 0,
      contentIndex: 0,
    })
    await runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })

    expect(messages.value[0]?.state?.askUserRuntime).toEqual({
      interactionId: 'profile',
      toolCallId: 'call-ask-user',
    })
    expect(messages.value[0]?.state?.askUser).toMatchObject({ answers: { name: 'Ada Lovelace' } })
    expect(dispatchCommand).toHaveBeenCalledWith(TOOL_RESUME_COMMAND, { toolCallId: 'call-ask-user' })
  })

  it('resumes the tool call when a required answer is empty', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: '' })])
    const dispatchCommand = vi.fn().mockResolvedValue({ status: 'resumed', toolCallId: 'call-ask-user' })
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    await runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })

    expect(dispatchCommand).toHaveBeenCalledWith(TOOL_RESUME_COMMAND, { toolCallId: 'call-ask-user' })
    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'submitted',
      answers: { name: '' },
    })
  })

  it('does not resume a denied ask_user call after a stale submit event', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' }, 'denied', 'active')])
    const dispatchCommand = vi.fn().mockResolvedValue({ status: 'missing', toolCallId: 'call-ask-user' })
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    runtime.handleStateChange({
      key: 'askUser',
      value: {
        status: 'submitted',
        currentStep: 0,
        answers: { name: 'Ada' },
        completedStepIds: ['name'],
      },
      messageIndex: 0,
      contentIndex: 0,
    })
    await runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })

    expect(dispatchCommand).not.toHaveBeenCalled()
    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'error',
      retryable: false,
      error: 'ask_user tool call cannot be resumed',
    })
  })

  it('reopens a retryable ask_user error while the tool call is still pending', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' }, 'awaiting-approval', 'active')])
    messages.value[0]!.state!.askUser = {
      ...messages.value[0]!.state!.askUser,
      status: 'error',
      retryable: true,
      error: 'invalid answer',
    }
    const dispatchCommand = vi.fn()
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    await runtime.handleBubbleEvent({ name: 'ask-user:retry', messageIndex: 0, contentIndex: 0 })

    expect(dispatchCommand).not.toHaveBeenCalled()
    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'active',
      retryable: undefined,
      error: undefined,
    })
  })

  it('keeps a terminal ask_user error non-retryable', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' }, 'denied', 'active')])
    messages.value[0]!.state!.askUser = {
      ...messages.value[0]!.state!.askUser,
      status: 'error',
      retryable: true,
      error: 'rejected',
    }
    const dispatchCommand = vi.fn()
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    await runtime.handleBubbleEvent({ name: 'ask-user:retry', messageIndex: 0, contentIndex: 0 })

    expect(dispatchCommand).not.toHaveBeenCalled()
    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'error',
      retryable: false,
      error: 'ask_user tool call cannot be retried',
    })
  })

  it('marks the ask_user state as error when a pending resume cannot be found', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' })])
    const dispatchCommand = vi.fn().mockResolvedValue({ status: 'missing', toolCallId: 'call-ask-user' })
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    await runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })

    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'error',
      error: 'ask_user tool call cannot be resumed',
    })
  })

  it('does not treat a missing resume as an error when the tool call was already handled', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' })])
    const dispatchCommand = vi.fn().mockImplementation(async () => {
      const toolCall = messages.value[0]?.state?.toolCall as Record<string, { status?: string }> | undefined
      if (toolCall?.['call-ask-user']) {
        toolCall['call-ask-user'].status = 'success'
      }

      return { status: 'missing', toolCallId: 'call-ask-user' }
    })
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    await runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })

    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'submitted',
      answers: { name: 'Ada' },
    })
  })

  it('reuses the in-flight resume command for duplicate submit events', async () => {
    const messages = ref<ChatMessage[]>([createMessage({ name: 'Ada' })])
    let resolveResume!: (result: ToolCallCommandResult) => void
    const resume = new Promise<ToolCallCommandResult>((resolve) => {
      resolveResume = resolve
    })
    const dispatchCommand = vi.fn().mockReturnValue(resume)
    const runtime = useAskUserRuntime({ messages, dispatchCommand })

    const firstSubmit = runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })
    const secondSubmit = runtime.handleBubbleEvent({ name: 'ask-user:submit', messageIndex: 0, contentIndex: 0 })

    expect(dispatchCommand).toHaveBeenCalledOnce()

    resolveResume({ status: 'resumed', toolCallId: 'call-ask-user' })
    await Promise.all([firstSubmit, secondSubmit])

    expect(messages.value[0]?.state?.askUser).toMatchObject({
      status: 'submitted',
      answers: { name: 'Ada' },
    })
  })
})
