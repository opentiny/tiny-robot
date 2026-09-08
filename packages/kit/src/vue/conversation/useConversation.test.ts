import { describe, expect, it, vi } from 'vitest'
import { isProxy } from 'vue'
import { toolPlugin } from '../message/plugins'
import type { ChatCompletion, ResponseProvider } from '../message/types'
import type { ChatMessage } from '../../message/types'
import type { ConversationStorageStrategy } from '../../storage'
import { useConversation } from './useConversation'

describe('useConversation', () => {
  it('persists a stable paused message snapshot before the tool snapshot is written', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let releasePauseSave!: () => void
    const pauseSave = new Promise<void>((resolve) => {
      releasePauseSave = resolve
    })
    let markPauseSaveStarted!: () => void
    const pauseSaveStarted = new Promise<void>((resolve) => {
      markPauseSaveStarted = resolve
    })
    const persistedMessages: ChatMessage[][] = []
    let pauseSaveBlocked = false
    const storage: ConversationStorageStrategy = {
      loadConversations: () => [],
      loadMessages: async () => [],
      saveConversation: vi.fn(),
      saveMessages: vi.fn(async (_id, messages) => {
        if (isProxy(messages)) {
          return
        }

        const hasAwaitingTool = messages.some((message) => {
          if (message.role !== 'assistant') {
            return false
          }

          const toolCallState = message.state?.toolCall as Record<string, { status?: string }> | undefined
          return Object.values(toolCallState ?? {}).some((toolCall) => toolCall.status === 'awaiting-approval')
        })

        if (hasAwaitingTool && !pauseSaveBlocked) {
          pauseSaveBlocked = true
          markPauseSaveStarted()
          await pauseSave
        }

        persistedMessages.push(JSON.parse(JSON.stringify(messages)) as ChatMessage[])
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
      const turn = conversation.sendMessage('run sensitive lookup')

      await vi.waitFor(() => expect(activeConversation.engine.requestState.value).toBe('paused'))
      await pauseSaveStarted

      expect(values.has('__tiny-robot-turn')).toBe(false)

      const assistantMessage = activeConversation.engine.messages.value.find((message) => message.role === 'assistant')
      expect(assistantMessage).toBeDefined()
      assistantMessage!.content = 'mutated while saving'

      releasePauseSave()
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
