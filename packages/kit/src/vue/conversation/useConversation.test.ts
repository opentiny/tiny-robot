import { describe, expect, it, vi } from 'vitest'
import { toolPlugin } from '../message/plugins'
import type { ChatCompletion, ResponseProvider } from '../message/types'
import type { ChatMessage } from '../../message/types'
import type { ConversationStorageStrategy } from '../../storage'
import { useConversation } from './useConversation'

describe('useConversation', () => {
  const responseProvider: ResponseProvider = async () =>
    ({
      id: 'conversation-test',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'mock',
      choices: [],
    }) as ChatCompletion

  it('keeps paused inactive engines while clearing engines that can start a turn', async () => {
    const conversation = useConversation({
      useMessageOptions: { responseProvider },
    })
    const pausedConversation = conversation.createConversation({
      id: 'paused',
      useMessageOptions: {
        plugins: [
          {
            onInit: ({ setRequestState }) => setRequestState('paused'),
          },
        ],
      },
    })
    conversation.createConversation({ id: 'idle' })

    await conversation.switchConversation('paused')
    await conversation.switchConversation('idle')

    expect(pausedConversation.engine.canStartTurn.value).toBe(false)
    expect((await conversation.switchConversation('paused'))?.engine).toBe(pausedConversation.engine)
  })

  it('clears inactive engines that can start a turn', async () => {
    const conversation = useConversation({
      useMessageOptions: { responseProvider },
    })
    const idleConversation = conversation.createConversation({ id: 'idle' })
    conversation.createConversation({ id: 'other' })

    await conversation.switchConversation('idle')
    await conversation.switchConversation('other')

    expect(idleConversation.engine.canStartTurn.value).toBe(true)
    expect((await conversation.switchConversation('idle'))?.engine).not.toBe(idleConversation.engine)
  })

  it('serializes initial and paused message saves', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let releaseInitialSave!: () => void
    const initialSave = new Promise<void>((resolve) => {
      releaseInitialSave = resolve
    })
    let markInitialSaveStarted!: () => void
    const initialSaveStarted = new Promise<void>((resolve) => {
      markInitialSaveStarted = resolve
    })
    const persistedMessages: ChatMessage[][] = []
    let saveCount = 0
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [],
      loadMessages: async () => [],
      saveConversation: vi.fn(),
      saveMessages: vi.fn(async (_id, messages) => {
        const snapshot = JSON.parse(JSON.stringify(messages)) as ChatMessage[]
        if (saveCount === 0) {
          saveCount += 1
          markInitialSaveStarted()
          await initialSave
        }

        persistedMessages.push(snapshot)
      }),
    }
    const responseProvider: ResponseProvider = async () =>
      ({
        id: 'conversation-pause-persistence',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: 'call-conversation-pause',
                  type: 'function',
                  function: { name: 'sensitive_lookup', arguments: '{}' },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
      }) as ChatCompletion

    try {
      const conversation = useConversation({
        autoSaveMessages: true,
        autoSaveThrottle: 0,
        storage,
        useMessageOptions: {
          responseProvider,
          plugins: [
            toolPlugin({
              getTools: async () => [{ type: 'function', function: { name: 'sensitive_lookup' } }],
              callTool: async () => 'should not run',
              shouldPauseToolCall: () => true,
            }),
          ],
        },
      })
      const activeConversation = conversation.createConversation({ id: 'conversation-1' })
      await initialSaveStarted
      const turn = conversation.sendMessage('run sensitive lookup')

      await vi.waitFor(() => expect(activeConversation.engine.processingState.value).toBe('pausing'))

      expect(values.has('__tiny-robot-turn')).toBe(false)
      releaseInitialSave()
      await turn

      expect(persistedMessages).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              role: 'assistant',
              state: expect.objectContaining({
                toolCall: expect.objectContaining({
                  'call-conversation-pause': expect.objectContaining({ status: 'awaiting-approval' }),
                }),
              }),
              content: '',
            }),
          ]),
        ]),
      )

      expect(values.has('__tiny-robot-turn')).toBe(true)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
