import { describe, expect, it, vi } from 'vitest'
import { effectScope, reactive, ref } from 'vue'
import {
  canSetModelFieldValue,
  normalizeModelFields,
  pickModelFeatureValues,
  resolveModelFeatureValues,
} from '../../../components/src/model-selector/featureFields'
import type { ModelSelectorField } from '../../../components/src/model-selector/index.type'
import { createProviderModelRuntime } from './provider/modelRuntime'
import { resolveProviderModels } from './provider/presets'
import { createProviderRequestPlugin } from './provider/requestPlugin'
import {
  CHAT_RUN_CONFIG_CONTEXT_KEY,
  CHAT_RUN_CONFIG_METADATA_KEY,
  cloneRunConfig,
  readRunConfigFromMessage,
  resolveComposerRunConfig,
} from './runConfig'
import { useChatRuntimeAdapter } from '../composables/useChatRuntimeAdapter'
import type { ChatRuntime, ChatRunConfig } from '../types'

const fields: ModelSelectorField[] = [
  {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    summary: true,
    defaultValue: 'off',
    options: [
      { value: 'off', label: '关闭', summary: false },
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'blocked', label: '禁用', disabled: true },
    ],
  },
  { key: 'search', label: '联网搜索', type: 'switch' },
  { key: 'format', label: '格式', type: 'select', options: [{ value: 'json', label: 'JSON' }] },
]

function createModels() {
  return resolveProviderModels([
    {
      type: 'qwen',
      models: [
        { id: 'a', label: 'A', fields },
        { id: 'b', label: 'B', fields: [{ ...fields[0], defaultValue: 'low' } as ModelSelectorField] },
      ],
    },
  ])
}

describe('model feature fields', () => {
  it('uses one resolution rule for defaults, unavailable values and disabled controls', () => {
    expect(resolveModelFeatureValues(fields)).toEqual({ reasoning: 'off', search: false, format: 'json' })
    expect(resolveModelFeatureValues(fields, { reasoning: 'missing', extra: true })).toEqual({
      reasoning: 'off',
      search: false,
      format: 'json',
    })
    expect(resolveModelFeatureValues(fields, { reasoning: 'blocked' }).reasoning).toBe('off')
    expect(canSetModelFieldValue(fields[0], 'blocked')).toBe(false)
    expect(canSetModelFieldValue({ ...fields[1], disabled: true }, true)).toBe(false)
    expect(resolveModelFeatureValues([{ key: 'empty', label: 'Empty', type: 'select', options: [] }])).toEqual({})
    expect(pickModelFeatureValues(fields, { reasoning: 'blocked', search: true, extra: true })).toEqual({
      search: true,
    })
    expect(normalizeModelFields([...fields, fields[0]])).toHaveLength(3)
  })

  it('restores each model and preserves unavailable choices when another key changes', () => {
    const models = reactive(createModels())
    const scope = effectScope()
    const runtime = scope.run(() => createProviderModelRuntime(models))!
    const model = runtime.model
    model.setFeatureValue!({ modelId: 'a', key: 'reasoning', value: 'high' })
    model.select('b')
    expect(model.featureValues?.value.reasoning).toBe('low')
    model.setFeatureValue!({ modelId: 'a', key: 'search', value: true })
    expect(model.featureValues?.value).toEqual({ reasoning: 'low' })
    model.select('a')
    expect(model.featureValues?.value.reasoning).toBe('high')
    const first = models[0].fields![0]
    if (first.type !== 'select') throw new Error('select expected')
    const options = first.options
    first.options = options.filter((option) => option.value !== 'high')
    expect(model.featureValues?.value.reasoning).toBe('off')
    model.setFeatureValue!({ modelId: 'a', key: 'search', value: false })
    first.options = options
    expect(model.featureValues?.value.reasoning).toBe('high')
    scope.stop()
  })

  it('maps only valid declared fields and omits effort when off', () => {
    const models = createModels()
    const plugin = createProviderRequestPlugin((id) => models.find((model) => model.id === id))
    function request(config: ChatRunConfig) {
      const requestBody: Record<string, unknown> = {}
      plugin.onBeforeRequest!({
        customContext: { [CHAT_RUN_CONFIG_CONTEXT_KEY]: config },
        requestBody,
      } as unknown as Parameters<NonNullable<typeof plugin.onBeforeRequest>>[0])
      return requestBody
    }
    expect(request({ modelId: 'a', featureValues: { reasoning: 'off', search: true, injected: 'bad' } })).toEqual({
      __chat_provider_model_id: 'a',
      enable_thinking: false,
      enable_search: true,
    })
    expect(request({ modelId: 'a', featureValues: { reasoning: 'high' } })).toMatchObject({
      enable_thinking: true,
      reasoning_effort: 'high',
    })
    models[0].mapFeatureValues = (values) => ({ response_format: values.format })
    expect(request({ modelId: 'a', featureValues: { format: 'json', injected: true } })).toEqual({
      __chat_provider_model_id: 'a',
      response_format: 'json',
    })
    models[0].fields = []
    models[0].mapFeatureValues = undefined
    expect(request({ modelId: 'a', featureValues: { reasoning: 'high' } })).toEqual({ __chat_provider_model_id: 'a' })
  })

  it('required reasoning has no off value and disabled values cannot be selected', () => {
    const models = resolveProviderModels([
      {
        type: 'deepseek',
        models: [
          {
            id: 'required',
            label: 'Required',
            fields: [
              {
                key: 'reasoning',
                label: '思考强度',
                type: 'select',
                defaultValue: 'high',
                options: [
                  { value: 'low', label: '低' },
                  { value: 'high', label: '高' },
                ],
              },
            ],
          },
        ],
      },
    ])
    const scope = effectScope()
    const { model } = scope.run(() => createProviderModelRuntime(models))!
    expect(model.featureValues?.value.reasoning).toBe('high')
    expect(() => model.setFeatureValue!({ modelId: 'required', key: 'reasoning', value: 'off' })).toThrow()
    scope.stop()
  })

  it('copies send snapshots and reads legacy snapshots at the boundary', () => {
    const scope = effectScope()
    const { model } = scope.run(() => createProviderModelRuntime(createModels()))!
    const snapshot = resolveComposerRunConfig({ model })!
    model.setFeatureValue!({ modelId: 'a', key: 'reasoning', value: 'high' })
    model.select('b')
    expect(snapshot.modelId).toBe('a')
    expect(snapshot.featureValues?.reasoning).toBe('off')
    const message = { role: 'user', content: 'test', metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: snapshot } }
    const retry = readRunConfigFromMessage(message)!
    expect(retry).toEqual(cloneRunConfig(snapshot))
    expect(retry.featureValues).not.toBe(snapshot.featureValues)
    const resolveModel = (id: string) => createModels().find((model) => model.id === id)
    const legacy = readRunConfigFromMessage(
      {
        ...message,
        metadata: {
          [CHAT_RUN_CONFIG_METADATA_KEY]: {
            modelId: 'a',
            features: { thinking: true, search: true },
            reasoning: { enabled: true, effort: 'high' },
          },
        },
      },
      resolveModel,
    )
    expect(legacy?.featureValues).toEqual({ reasoning: 'high', search: true })
    expect(
      readRunConfigFromMessage(
        { ...message, metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: { modelId: 'a', features: { thinking: true } } } },
        resolveModel,
      )?.featureValues?.reasoning,
    ).toBe('low')
    expect(
      readRunConfigFromMessage({
        ...message,
        metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: { featureValues: { invalid: 1 } } },
      }),
    ).toBeUndefined()
    scope.stop()
  })

  it('converts obsolete legacy choices into valid retry values', () => {
    const scenarios: {
      name: string
      fields: ModelSelectorField[]
      features: Record<string, boolean>
      reasoning?: { enabled: boolean; effort?: string }
      expected: Record<string, boolean | string>
    }[] = [
      {
        name: 'still valid effort',
        fields,
        features: { thinking: true },
        reasoning: { enabled: true, effort: 'high' },
        expected: { reasoning: 'high' },
      },
      {
        name: 'off removed from required model',
        fields: [
          {
            ...fields[0],
            defaultValue: 'high',
            options: [
              { value: 'low', label: '低' },
              { value: 'high', label: '高' },
            ],
          } as ModelSelectorField,
        ],
        features: { thinking: false },
        expected: { reasoning: 'high' },
      },
      {
        name: 'disabled effort',
        fields,
        features: { thinking: true },
        reasoning: { enabled: true, effort: 'blocked' },
        expected: { reasoning: 'off' },
      },
      {
        name: 'unknown effort',
        fields,
        features: { thinking: true },
        reasoning: { enabled: true, effort: 'obsolete' },
        expected: { reasoning: 'off' },
      },
      {
        name: 'invalid effort uses effective default',
        fields: [
          {
            ...fields[0],
            defaultValue: 'blocked',
            options: [
              { value: 'blocked', label: '禁用', disabled: true },
              { value: 'low', label: '低' },
              { value: 'high', label: '高' },
            ],
          } as ModelSelectorField,
        ],
        features: { thinking: true },
        reasoning: { enabled: true, effort: 'obsolete' },
        expected: { reasoning: 'low' },
      },
      {
        name: 'removed fields',
        fields: [],
        features: { thinking: true, search: true },
        reasoning: { enabled: true, effort: 'obsolete' },
        expected: {},
      },
    ]

    for (const scenario of scenarios) {
      const model = resolveProviderModels([
        { type: 'qwen', models: [{ id: 'legacy', label: scenario.name, fields: scenario.fields }] },
      ])[0]
      const snapshot = { modelId: model.id, features: scenario.features, reasoning: scenario.reasoning }
      const message = { role: 'user', content: 'retry', metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: snapshot } }
      const retry = readRunConfigFromMessage(message, () => model)!
      expect(retry.featureValues, scenario.name).toEqual(scenario.expected)

      const requestBody: Record<string, unknown> = {}
      createProviderRequestPlugin(() => model).onBeforeRequest!({
        customContext: { [CHAT_RUN_CONFIG_CONTEXT_KEY]: retry },
        requestBody,
      } as unknown as Parameters<NonNullable<ReturnType<typeof createProviderRequestPlugin>['onBeforeRequest']>>[0])
      expect(requestBody, scenario.name).toEqual({
        __chat_provider_model_id: 'legacy',
        ...model.mapFeatureValues?.(scenario.expected),
      })
    }
  })

  it('isolates pending fields by model and reports async failures', async () => {
    const scope = effectScope()
    const { model } = scope.run(() => createProviderModelRuntime(createModels()))!
    const original = model.setFeatureValue!
    let finish!: () => void
    model.setFeatureValue = vi.fn(async (change) => {
      await new Promise<void>((resolve) => {
        finish = resolve
      })
      original(change)
    })
    const onActionError = vi.fn()
    const runtime: ChatRuntime = {
      conversations: ref([]),
      activeConversation: ref(null),
      composer: { model },
      actions: {
        send: async () => true,
        clearActiveConversation() {},
        createConversation() {},
        switchConversation() {},
        renameConversation() {},
        deleteConversation() {},
      },
    }
    const adapter = scope.run(() => useChatRuntimeAdapter({ runtime, onActionError }))!
    const pending = adapter.setModelFeatureValue({ modelId: 'a', key: 'reasoning', value: 'high' })
    expect(adapter.data.value.model?.pendingFeatureKeys).toEqual(['reasoning'])
    await adapter.setModelFeatureValue({ modelId: 'a', key: 'reasoning', value: 'low' })
    expect(model.setFeatureValue).toHaveBeenCalledTimes(1)
    model.select('b')
    expect(adapter.data.value.model?.pendingFeatureKeys).toEqual([])
    finish()
    await pending
    expect(model.featureValues?.value.reasoning).toBe('low')
    model.select('a')
    expect(model.featureValues?.value.reasoning).toBe('high')
    model.setFeatureValue = async () => {
      throw new Error('failed')
    }
    await adapter.setModelFeatureValue({ modelId: 'a', key: 'search', value: true })
    expect(onActionError).toHaveBeenCalledWith(expect.objectContaining({ action: 'set-model-feature-value' }))
    expect(adapter.data.value.model?.pendingFeatureKeys).toEqual([])
    expect(model.featureValues?.value.search).toBe(false)
    scope.stop()
  })
})
