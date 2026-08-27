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
    icon: 'model-a-icon' as never,
    capabilities: { thinking: true, search: true },
    efforts: [
      { value: 'low', label: 'Low' },
      { value: 'high', label: 'High' },
    ],
    defaultEffort: 'low',
  },
  {
    id: 'model-b',
    label: 'Model B',
    providerType: 'openai',
    providerLabel: 'OpenAI',
    apiUrl: 'url',
    apiKey: 'key',
    capabilities: { thinking: false, search: false },
    efforts: [{ value: 'max', label: 'Max' }],
    defaultEffort: 'max',
  },
]

describe('createProviderModelRuntime', () => {
  it('selects the first model and hides its reasoning effort until thinking is enabled', () => {
    const runtime = createProviderModelRuntime(models)
    expect(runtime.model.selectedId.value).toBe('model-a')
    expect(runtime.model.options.value[0]?.icon).toBe('model-a-icon')
    expect(runtime.model.options.value[0]?.efforts).toEqual([
      { value: 'low', label: 'Low' },
      { value: 'high', label: 'High' },
    ])
    expect(runtime.model.reasoning?.value).toEqual({ enabled: false, effort: undefined })

    runtime.model.setFeature('thinking', true)
    expect(runtime.model.reasoning?.value).toEqual({ enabled: true, effort: 'low' })
  })

  it('switches models and resets unsupported features and effort', () => {
    const runtime = createProviderModelRuntime(models)
    runtime.model.setFeature('thinking', true)
    runtime.model.setFeature('search', true)
    runtime.model.select('model-b')

    expect(runtime.model.features.value).toEqual({ thinking: false, search: false })
    expect(runtime.model.reasoning?.value.effort).toBeUndefined()
  })

  it('sets supported efforts and rejects unsupported efforts', () => {
    const runtime = createProviderModelRuntime(models)

    runtime.model.setFeature('thinking', true)
    runtime.model.setReasoningEffort('high')
    expect(runtime.model.reasoning?.value.effort).toBe('high')
    expect(() => runtime.model.setReasoningEffort('max')).toThrow('does not support reasoning effort')
  })

  it('hides and restores the selected reasoning effort with thinking', () => {
    const runtime = createProviderModelRuntime(models)

    runtime.model.setFeature('thinking', true)
    runtime.model.setReasoningEffort('high')
    runtime.model.setFeature('thinking', false)
    expect(runtime.model.reasoning?.value).toEqual({ enabled: false, effort: undefined })

    runtime.model.setFeature('thinking', true)
    expect(runtime.model.reasoning?.value).toEqual({ enabled: true, effort: 'high' })
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
    expect(() => runtime.model.setFeature('thinking', false)).not.toThrow()
    expect(() => runtime.model.setFeature('thinking', true)).toThrow('does not support')
  })

  it('allows disabling features without a selected model', () => {
    const runtime = createProviderModelRuntime([])
    expect(() => runtime.model.setFeature('thinking', false)).not.toThrow()
    expect(() => runtime.model.setFeature('thinking', true)).toThrow('Unknown model feature')
  })
})
