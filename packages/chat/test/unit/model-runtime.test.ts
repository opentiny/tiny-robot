import { describe, expect, it } from 'vitest'
import { createProviderModelRuntime } from '../../src/runtime/provider/modelRuntime'
import { CHAT_BUILT_IN_MODEL_FEATURES } from '../../src/types/runtime'
import type { ChatResolvedProviderModel } from '../../src/runtime/provider/types'

const models: ChatResolvedProviderModel[] = [
  {
    id: 'model-a',
    label: 'Model A',
    providerType: 'openai',
    providerLabel: 'OpenAI',
    apiUrl: 'url',
    apiKey: 'key',
    capabilities: { thinking: true, search: true },
    reasoning: { efforts: ['low', 'high'] as const, defaultEffort: 'low' as const },
  },
  {
    id: 'model-b',
    label: 'Model B',
    providerType: 'openai',
    providerLabel: 'OpenAI',
    apiUrl: 'url',
    apiKey: 'key',
    capabilities: { thinking: false, search: false },
    reasoning: { efforts: ['max'] as const, defaultEffort: 'max' as const },
  },
]

describe('createProviderModelRuntime', () => {
  it('selects the first model and its default reasoning effort', () => {
    const runtime = createProviderModelRuntime(models)
    expect(runtime.model.selectedId.value).toBe('model-a')
    expect(runtime.model.reasoning?.value).toMatchObject({ enabled: false, effort: undefined })
  })

  it('switches models and resets unsupported features and effort', () => {
    const runtime = createProviderModelRuntime(models)
    runtime.model.setFeature('thinking', true)
    runtime.model.setFeature('search', true)
    runtime.model.select('model-b')

    expect(runtime.model.features.value).toEqual({ thinking: false, search: false })
    expect(runtime.model.reasoning?.value.effort).toBeUndefined()
  })

  it('supports built-in features only', () => {
    const runtime = createProviderModelRuntime(models)
    expect(Object.keys(runtime.model.features.value)).toEqual([...CHAT_BUILT_IN_MODEL_FEATURES])
    expect(() => runtime.model.select('missing')).toThrow('Unknown model')
    expect(() => runtime.model.setFeature('thinking', true)).not.toThrow()
    expect(() => runtime.model.setFeature('search', true)).not.toThrow()
  })

  it('rejects unsupported and unknown features', () => {
    const runtime = createProviderModelRuntime(models)
    runtime.model.select('model-b')
    expect(() => runtime.model.setFeature('thinking', true)).toThrow('does not support')
  })
})
