import { describe, expect, it, vi } from 'vitest'
import type { ChatMessage, ConversationInfo, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import type { ModelSelectorField } from '@opentiny/tiny-robot'
import { errorStatePlugin } from './plugins/errorStatePlugin'
import { CHAT_RUN_CONFIG_METADATA_KEY } from './runConfig'
import { useChatRuntime } from './useChatRuntime'

const createMemoryStorage = (): ConversationStorageStrategy => {
  const conversations = new Map<string, ConversationInfo>()
  const messages = new Map<string, ChatMessage[]>()
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

  return {
    loadConversations: () => clone([...conversations.values()]),
    loadMessages: (id) => clone(messages.get(id) ?? []),
    saveConversation: (conversation) => {
      conversations.set(conversation.id, clone(conversation))
    },
    saveMessages: (id, nextMessages) => {
      messages.set(id, clone(nextMessages))
    },
    deleteConversation: (id) => {
      conversations.delete(id)
      messages.delete(id)
    },
  }
}

describe('useChatRuntime error state', () => {
  it('stores provider failures on the generated assistant message by default', async () => {
    const providerError = new Error('provider failed')
    const runtime = useChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw providerError
          },
        },
      },
    })

    await expect(runtime.actions.send({ text: 'fail' })).rejects.toBe(providerError)

    const activeConversation = runtime.activeConversation.value
    expect(activeConversation?.requestState).toBe('error')
    expect(activeConversation?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      state: {
        error: {
          name: 'Error',
          message: 'provider failed',
        },
      },
    })
  })

  it('lets a same-name user plugin disable default error state writes', async () => {
    const providerError = new Error('provider failed')
    const runtime = useChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw providerError
          },
          plugins: [errorStatePlugin({ disabled: true })],
        },
      },
    })

    await expect(runtime.actions.send({ text: 'fail' })).rejects.toBe(providerError)

    const activeConversation = runtime.activeConversation.value
    expect(activeConversation?.requestState).toBe('error')
    expect(activeConversation?.messages.at(-1)?.state?.error).toBeUndefined()
  })
})

it('sends provider-specific requests and keeps the original message configuration when the composer changes', async () => {
  const reasoning: ModelSelectorField = {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    options: [
      { value: 'off', label: '关闭' },
      { value: 'high', label: '高' },
    ],
  }
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () =>
        new Response(
          'data: {"choices":[{"index":0,"delta":{"content":"OK"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
        ),
    )
  try {
    const runtime = useChatRuntime({
      conversation: { storage: createMemoryStorage() },
      modelProviders: [
        {
          type: 'qwen',
          models: [
            {
              id: 'qwen3.7-flash',
              label: 'Qwen',
              features: [reasoning, { key: 'search', label: '联网搜索', type: 'switch' }],
            },
          ],
        },
        { type: 'deepseek', models: [{ id: 'deepseek-v4-pro', label: 'DeepSeek', features: [reasoning] }] },
      ],
    })
    const model = runtime.composer.model!
    model.setFeatureValue!({ modelId: 'qwen3.7-flash', key: 'reasoning', value: 'high' })
    model.setFeatureValue!({ modelId: 'qwen3.7-flash', key: 'search', value: true })
    await expect(runtime.actions.send({ text: 'First question' })).resolves.toBe(true)

    model.select('deepseek-v4-pro')
    await expect(runtime.actions.send({ text: 'Second question' })).resolves.toBe(true)

    const [qwenRequest, deepseekRequest] = fetch.mock.calls.map(([, init]) => JSON.parse(init!.body as string))
    expect(qwenRequest).toMatchObject({
      model: 'qwen3.7-flash',
      enable_thinking: true,
      thinking_budget: 8192,
      enable_search: true,
    })
    expect(deepseekRequest).toMatchObject({
      model: 'deepseek-v4-pro',
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
    })
    expect(runtime.activeConversation.value?.messages[0].metadata?.[CHAT_RUN_CONFIG_METADATA_KEY]).toMatchObject({
      modelId: 'qwen3.7-flash',
      featureValues: { reasoning: 'high', search: true },
    })
  } finally {
    fetch.mockRestore()
  }
})
