import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { TOOL_RESUME_COMMAND, type ToolCallCommandResult } from '../../message/plugins/toolPlugin'
import type { ChatMessage } from '../../types'
import { useAskUserRuntime } from './useAskUserRuntime'

const createMessage = (answers: Record<string, unknown>, toolCallStatus = 'awaiting-approval') => {
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
        status: 'submitted' as const,
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
