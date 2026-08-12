import { nextTick, shallowRef } from 'vue'
import { describe, expect, it } from 'vitest'
import type { ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useConversation } from '../../../kit/src/vue/conversation/useConversation'
import { useKitChatRuntime } from '../../src/runtime/useKitChatRuntime'
import type { ChatComposerRuntime } from '../../src/types'
import { createMemoryStorage } from '../fixtures/storage'
import {
  createCancellableResponseProvider,
  createRejectingResponseProvider,
  createResponseProvider,
} from '../fixtures/response'

function createConversation(responseProvider: ResponseProvider) {
  const storage = createMemoryStorage()
  const conversation = useConversation({
    storage,
    useMessageOptions: { responseProvider },
  })

  return { conversation, storage }
}

function createComposer(): ChatComposerRuntime {
  return {
    model: {
      options: shallowRef([{ id: 'model-a', label: 'Model A', capabilities: { thinking: true, search: true } }]),
      selectedId: shallowRef<string | null>('model-a'),
      features: shallowRef({ thinking: true, search: false }),
      reasoning: shallowRef({ enabled: true, effort: 'high' as const }),
      select: () => {},
      setFeature: () => {},
    },
  }
}

describe('useKitChatRuntime integration', () => {
  it('creates a titled conversation and stores an isolated runConfig metadata snapshot', async () => {
    const { conversation, storage } = createConversation(createResponseProvider('reply'))
    const composer = createComposer()
    const runtime = useKitChatRuntime({
      conversation,
      titleGenerator: (text) => `Title: ${text}`,
      composer,
    })

    await expect(runtime.actions.send({ text: '  hello  ' })).resolves.toBe(true)
    await nextTick()

    const active = runtime.activeConversation.value
    expect(active?.title).toBe('Title: hello')
    expect(active?.messages.map((message) => message.content)).toEqual(['hello', 'reply'])
    expect(active?.messages[0].metadata?.run_config_metadata).toEqual({
      modelId: 'model-a',
      features: { thinking: true, search: false },
      reasoning: { enabled: true, effort: 'high' },
    })

    expect(composer.model!.features.value.thinking).toBe(true)
    expect(active?.messages[0].metadata?.run_config_metadata).toEqual({
      modelId: 'model-a',
      features: { thinking: true, search: false },
      reasoning: { enabled: true, effort: 'high' },
    })
    expect(storage.conversations).toHaveLength(1)
    conversation.saveMessages(active!.id)
    expect(storage.messages.get(active!.id)?.[0]?.metadata?.run_config_metadata).toEqual(
      active?.messages[0].metadata?.run_config_metadata,
    )
  })

  it('returns false for empty, disabled, and submit-disabled sends', async () => {
    const { conversation } = createConversation(createResponseProvider())
    const runtime = useKitChatRuntime({
      conversation,
      composer: {
        disabled: shallowRef(false),
        submitDisabled: shallowRef(false),
      },
    })

    await expect(runtime.actions.send({ text: '   ' })).resolves.toBe(false)
    expect(runtime.conversations.value).toHaveLength(0)

    const disabled = shallowRef(true)
    const submitDisabled = shallowRef(false)
    const disabledRuntime = useKitChatRuntime({
      conversation: createConversation(createResponseProvider()).conversation,
      composer: { disabled, submitDisabled },
    })
    await expect(disabledRuntime.actions.send({ text: 'hello' })).resolves.toBe(false)

    disabled.value = false
    submitDisabled.value = true
    await expect(disabledRuntime.actions.send({ text: 'hello' })).resolves.toBe(false)
    expect(conversation.activeConversation.value).toBeNull()
  })

  it('stores and mirrors provider errors, then clears them after a successful send', async () => {
    const error = new Error('provider failed')
    let responseProvider = createRejectingResponseProvider(error)
    const errorRef = shallowRef<unknown | null>(null)
    const { conversation } = createConversation(responseProvider)
    const runtime = useKitChatRuntime({ conversation, lastError: errorRef })

    await expect(runtime.actions.send({ text: 'first' })).rejects.toBe(error)
    await nextTick()
    expect(runtime.activeConversation.value?.lastError).toBe(error)
    expect(errorRef.value).toBe(error)
    expect(runtime.activeConversation.value?.requestState).toBe('error')

    responseProvider = createResponseProvider('second')
    const engine = runtime.activeConversation.value
    expect(engine).not.toBeNull()
    conversation.activeConversation.value!.engine.responseProvider.value = responseProvider

    await expect(runtime.actions.send({ text: 'second' })).resolves.toBe(true)
    await nextTick()
    expect(runtime.activeConversation.value?.lastError).toBeNull()
    expect(errorRef.value).toBeNull()
  })

  it('aborts an active request and drives conversation CRUD and storage', async () => {
    const cancellable = createCancellableResponseProvider()
    const { conversation, storage } = createConversation(cancellable.provider)
    const runtime = useKitChatRuntime({ conversation })

    const sendTask = runtime.actions.send({ text: 'pending' })
    await nextTick()
    const id = runtime.activeConversation.value?.id
    expect(id).toBeTruthy()
    await runtime.actions.abort?.()
    await expect(sendTask).resolves.toBe(true)
    expect(runtime.activeConversation.value?.requestState).toBe('aborted')

    await runtime.actions.createConversation({ title: 'Second' })
    const secondId = runtime.activeConversation.value?.id
    expect(secondId).not.toBe(id)
    await runtime.actions.renameConversation(secondId!, 'Renamed')
    expect(runtime.activeConversation.value?.title).toBe('Renamed')
    await runtime.actions.switchConversation(id!)
    expect(runtime.activeConversation.value?.id).toBe(id)
    await runtime.actions.deleteConversation(id!)
    expect(runtime.activeConversation.value).toBeNull()
    expect(runtime.conversations.value.map((item) => item.title)).toEqual(['Renamed'])
    expect(storage.messages.has(id!)).toBe(false)
  })
})
