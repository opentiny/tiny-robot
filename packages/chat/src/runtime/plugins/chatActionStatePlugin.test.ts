import { describe, expect, it } from 'vitest'
import { useConversation, useMessage, type ChatCompletion, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import { createChatActionStatePlugin } from './chatActionStatePlugin'
import { CHAT_ACTION_METADATA_KEY, useChatRuntimeFromConversation } from '../useChatRuntimeFromConversation'
import { CHAT_RUN_CONFIG_METADATA_KEY } from '../runConfig'
import { shallowRef } from 'vue'

const completion = (content: string): ChatCompletion => ({
  id: 'completion',
  object: 'chat.completion',
  created: 1,
  model: 'model-a',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

describe('chat action state plugin with an external conversation', () => {
  it.each(['completed', 'error', 'aborted'] as const)(
    'tracks streaming and %s states without changing history',
    async (outcome) => {
      let release!: () => void
      const nextChunk = new Promise<void>((resolve) => {
        release = resolve
      })
      let received!: () => void
      const firstChunk = new Promise<void>((resolve) => {
        received = resolve
      })
      const responseProvider: ResponseProvider = async function* (_body, signal) {
        yield completion('first')
        await nextChunk
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        if (outcome === 'error') throw new Error('provider failed')
        yield completion('second')
      }
      const conversation = useConversation({
        storage: {
          loadConversations: () => [],
          loadMessages: () => [],
          saveConversation: () => undefined,
          saveMessages: () => undefined,
        },
        useMessageOptions: {
          initialMessages: [
            {
              role: 'user',
              content: 'history',
              metadata: {
                [CHAT_RUN_CONFIG_METADATA_KEY]: { modelId: 'model-a' },
                [CHAT_ACTION_METADATA_KEY]: { id: 'old-user', turnState: 'completed' },
              },
            },
            {
              role: 'assistant',
              content: 'old answer',
              metadata: {
                [CHAT_ACTION_METADATA_KEY]: { id: 'old-assistant', userMessageId: 'old-user', turnState: 'completed' },
              },
            },
          ],
          responseProvider,
          plugins: [createChatActionStatePlugin(), { onCompletionChunk: () => received() }],
        },
      })
      const runtime = useChatRuntimeFromConversation({
        conversation,
        composer: {
          model: {
            options: shallowRef([{ id: 'model-a', label: 'Model A' }]),
            selectedId: shallowRef('model-a'),
            select: () => undefined,
          },
        },
      })
      const pending = runtime.actions.send({ text: 'question' })
      const finished =
        outcome === 'error' ? expect(pending).rejects.toThrow('provider failed') : expect(pending).resolves.toBe(true)
      await firstChunk
      const active = conversation.activeConversation.value!
      const seededHistory = active.engine.messages.value.slice(0, 2).map((message) => ({
        content: message.content,
        metadata: JSON.stringify(message.metadata),
      }))
      const user = active.engine.messages.value.at(-2)!
      const assistant = active.engine.messages.value.at(-1)!
      const action = assistant.metadata?.[CHAT_ACTION_METADATA_KEY] as {
        id: string
        userMessageId: string
        turnState: string
      }
      const target = { conversationId: active.id, userMessageId: action.id }
      let aborted: Promise<void> | undefined
      try {
        expect(action).toMatchObject({
          userMessageId: user.metadata?.[CHAT_ACTION_METADATA_KEY].id,
          turnState: 'processing',
        })
        expect(runtime.actions.getMessageCapabilities!(target)).toEqual({
          canEdit: false,
          canRegenerate: false,
          turnState: 'processing',
        })
        expect(active.engine.messages.value[1].metadata?.[CHAT_ACTION_METADATA_KEY]).toMatchObject({
          turnState: 'completed',
        })
        if (outcome === 'aborted') aborted = conversation.abortActiveRequest()
      } finally {
        release()
        await aborted
        await finished
      }
      expect(assistant.metadata?.[CHAT_ACTION_METADATA_KEY]).toMatchObject({ id: action.id, turnState: outcome })
      expect(user.metadata?.[CHAT_ACTION_METADATA_KEY]).toMatchObject({ turnState: outcome })
      expect(
        active.engine.messages.value.slice(0, 2).map((message) => ({
          content: message.content,
          metadata: JSON.stringify(message.metadata),
        })),
      ).toEqual(seededHistory)
      expect(runtime.actions.getMessageCapabilities!(target)).toMatchObject({ canRegenerate: true, turnState: outcome })
    },
  )

  it('marks a paused turn aborted when it is cancelled after pausing', async () => {
    const engine = useMessage({
      responseProvider: async function* () {
        yield completion('waiting')
      },
      plugins: [
        createChatActionStatePlugin(),
        { onAfterRequest: async ({ setRequestState }) => setRequestState('processing', 'pausing') },
      ],
    })
    await engine.send({
      role: 'user',
      content: 'question',
      metadata: { [CHAT_ACTION_METADATA_KEY]: { id: 'user-1' } },
    })
    expect(engine.requestState.value).toBe('paused')
    for (const message of engine.messages.value) {
      expect(message.metadata?.[CHAT_ACTION_METADATA_KEY]).toMatchObject({ turnState: 'paused' })
    }
    await engine.abortRequest()
    expect(engine.requestState.value).toBe('aborted')
    for (const message of engine.messages.value) {
      expect(message.metadata?.[CHAT_ACTION_METADATA_KEY]).toMatchObject({ turnState: 'aborted' })
    }
  })
})
