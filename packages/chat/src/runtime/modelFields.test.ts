import { describe, expect, it, vi } from 'vitest'
import { effectScope, reactive, ref, shallowRef } from 'vue'
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
    defaultValue: 'off',
    options: [
      { value: 'off', label: '关闭' },
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
        { id: 'a', label: 'A', features: fields },
        { id: 'b', label: 'B', features: [{ ...fields[0], defaultValue: 'low' } as ModelSelectorField] },
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

  it('stores automatic fallbacks and carries values across models', () => {
    const models = reactive(createModels())
    const scope = effectScope()
    const runtime = scope.run(() => createProviderModelRuntime(models))!
    const model = runtime.model
    model.setFeatureValue!({ modelId: 'a', key: 'reasoning', value: 'high' })
    model.select('b')
    expect(model.featureValues?.value).toEqual({ reasoning: 'high' })
    model.setFeatureValue!({ modelId: 'a', key: 'search', value: true })
    expect(model.featureValues?.value).toEqual({ reasoning: 'high' })
    const target = models[1].features![0]
    if (target.type !== 'select') throw new Error('select expected')
    target.options = target.options.filter((option) => option.value !== 'high')
    expect(model.featureValues?.value).toEqual({ reasoning: 'low' })
    model.select('a')
    expect(model.featureValues?.value).toMatchObject({ reasoning: 'low', search: true })
    model.setFeatureValue!({ modelId: 'a', key: 'reasoning', value: 'high' })
    expect(model.featureValues?.value.reasoning).toBe('high')
    const first = models[0].features![0]
    if (first.type !== 'select') throw new Error('select expected')
    const options = first.options
    first.options = options.filter((option) => option.value !== 'high')
    expect(model.featureValues?.value.reasoning).toBe('off')
    model.setFeatureValue!({ modelId: 'a', key: 'search', value: false })
    first.options = options
    expect(model.featureValues?.value.reasoning).toBe('off')
    scope.stop()
  })

  it('rejects a setting for another model when the active model would overwrite it', () => {
    const models = createModels()
    const target = models[1].features![0]
    if (target.type !== 'select') throw new Error('select expected')
    target.options = [...target.options, { value: 'max', label: '最高' }]
    const scope = effectScope()
    const { model } = scope.run(() => createProviderModelRuntime(models))!

    expect(() => model.setFeatureValue!({ modelId: 'b', key: 'reasoning', value: 'max' })).toThrow(
      /incompatible with active model: a/,
    )
    model.select('b')
    model.setFeatureValue!({ modelId: 'b', key: 'reasoning', value: 'max' })
    expect(model.featureValues?.value.reasoning).toBe('max')
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
    })
    models[0].mapFeatureValues = (values) => ({ response_format: values.format })
    expect(request({ modelId: 'a', featureValues: { format: 'json', injected: true } })).toEqual({
      __chat_provider_model_id: 'a',
      response_format: 'json',
    })
    models[0].features = []
    models[0].mapFeatureValues = undefined
    expect(request({ modelId: 'a', featureValues: { reasoning: 'high' } })).toEqual({ __chat_provider_model_id: 'a' })
  })

  it('uses the same reasoning values across DeepSeek and budget-based Qwen models', () => {
    const deepseekId = 'deepseek-v4-pro'
    const qwenIds = ['qwen3.7-flash', 'qwen3.7-plus', 'qwen3.7-max', 'qwen3.6-plus', 'qwen3.5-plus']
    const models = resolveProviderModels([
      { type: 'deepseek', models: [{ id: deepseekId, label: 'DeepSeek', features: fields.slice(0, 1) }] },
      { type: 'qwen', models: qwenIds.map((id) => ({ id, label: id, features: fields })) },
    ])
    const scope = effectScope()
    const { model, resolveModel } = scope.run(() => createProviderModelRuntime(models))!
    const plugin = createProviderRequestPlugin(resolveModel)
    function request(config: ChatRunConfig) {
      const requestBody: Record<string, unknown> = {}
      plugin.onBeforeRequest!({
        customContext: { [CHAT_RUN_CONFIG_CONTEXT_KEY]: config },
        requestBody,
      } as unknown as Parameters<NonNullable<typeof plugin.onBeforeRequest>>[0])
      return requestBody
    }

    model.setFeatureValue!({ modelId: deepseekId, key: 'reasoning', value: 'high' })
    const original = resolveComposerRunConfig({ model })!
    for (const modelId of qwenIds) {
      model.select(modelId)
      expect(model.featureValues?.value.reasoning).toBe('high')
      expect(request({ modelId, featureValues: { reasoning: 'high', search: true } })).toEqual({
        __chat_provider_model_id: modelId,
        enable_thinking: true,
        thinking_budget: 8192,
        enable_search: true,
      })
    }
    const modelId = qwenIds.at(-1)!
    model.setFeatureValue!({ modelId, key: 'reasoning', value: 'off' })
    expect(request(resolveComposerRunConfig({ model })!)).toEqual({
      __chat_provider_model_id: modelId,
      enable_thinking: false,
      enable_search: false,
    })

    const message = { role: 'user', content: 'test', metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: original } }
    expect(request(readRunConfigFromMessage(message)!)).toEqual({
      __chat_provider_model_id: deepseekId,
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
    })
    scope.stop()
  })

  it('sends explicit OpenAI reasoning choices for GPT-5.4 and GPT-5.5', () => {
    const models = resolveProviderModels([
      {
        type: 'openai',
        models: ['gpt-5.4', 'gpt-5.5', 'custom-model'].map((id) => ({ id, label: id })),
      },
    ])
    const [gpt54, gpt55, custom] = models
    expect(gpt54.mapFeatureValues?.({ reasoning: 'on' })).toEqual({ reasoning_effort: 'medium' })
    expect(gpt55.mapFeatureValues?.({ reasoning: 'off' })).toEqual({ reasoning_effort: 'none' })
    expect(gpt55.mapFeatureValues?.({})).toEqual({})
    expect(custom.mapFeatureValues?.({ reasoning: 'off' })).toEqual({})
  })

  it('only sends reasoning_effort for Qwen models that support it', () => {
    const models = resolveProviderModels([
      {
        type: 'qwen',
        models: ['qwen3.8-flash', 'qwen3.8-omni-flash', 'qwen-custom'].map((id) => ({
          id,
          label: id,
          features: fields,
        })),
      },
    ])
    expect(models.map((model) => model.mapFeatureValues?.({ reasoning: 'low' }))).toEqual([
      { enable_thinking: true, reasoning_effort: 'low' },
      { enable_thinking: true, reasoning_effort: 'low' },
      { enable_thinking: true },
    ])
  })

  it('validates runtime writes and legacy requests against the same deduplicated options', () => {
    const modelId = 'deepseek-v4-pro'
    const features: ModelSelectorField[] = [
      {
        key: 'reasoning',
        type: 'select',
        label: '思考强度',
        defaultValue: 'off',
        options: [
          { value: 'off', label: '关闭' },
          { value: 'high', label: '不可用', disabled: true },
          { value: 'high', label: '高' },
        ],
      },
    ]
    const models = resolveProviderModels([{ type: 'deepseek', models: [{ id: modelId, label: 'DeepSeek', features }] }])
    const scope = effectScope()
    try {
      const { model, resolveModel } = scope.run(() => createProviderModelRuntime(models))!
      expect(() => model.setFeatureValue!({ modelId, key: 'reasoning', value: 'high' })).toThrow(/Invalid model field/)

      const message = {
        role: 'user',
        content: 'retry',
        metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: { modelId, reasoning: { enabled: true, effort: 'high' } } },
      }
      const retry = readRunConfigFromMessage(message, resolveModel)
      const requestBody: Record<string, unknown> = {}
      const plugin = createProviderRequestPlugin(resolveModel)
      plugin.onBeforeRequest!({
        customContext: { [CHAT_RUN_CONFIG_CONTEXT_KEY]: retry },
        requestBody,
      } as unknown as Parameters<NonNullable<typeof plugin.onBeforeRequest>>[0])
      expect(requestBody).toEqual({ __chat_provider_model_id: modelId, thinking: { type: 'disabled' } })
    } finally {
      scope.stop()
    }
  })

  it('replays legacy Qwen thinking without imposing a new token budget', () => {
    const reasoning = fields[0]
    if (reasoning.type !== 'select') throw new Error('select expected')
    const features = [{ ...reasoning, options: [...reasoning.options, { value: 'max', label: '最高' }] }]
    const [model] = resolveProviderModels([
      { type: 'qwen', models: [{ id: 'qwen3.7-flash', label: 'Qwen', features }] },
    ])
    const message = {
      role: 'user',
      content: 'retry',
      metadata: {
        [CHAT_RUN_CONFIG_METADATA_KEY]: {
          modelId: model.id,
          features: { thinking: true },
          reasoning: { enabled: true },
        },
      },
    }
    const retry = readRunConfigFromMessage(message, () => model)!
    const requestBody: Record<string, unknown> = {}
    const plugin = createProviderRequestPlugin(() => model)
    plugin.onBeforeRequest!({
      customContext: { [CHAT_RUN_CONFIG_CONTEXT_KEY]: retry },
      requestBody,
    } as unknown as Parameters<NonNullable<typeof plugin.onBeforeRequest>>[0])
    expect(requestBody).toEqual({ __chat_provider_model_id: model.id, enable_thinking: true })
  })

  it('preserves the original model and MCP settings when a legacy snapshot has no model schema', () => {
    const mcp = { serverIds: ['server'], toolIds: { server: ['tool'] } }
    const message = {
      role: 'user',
      content: 'test',
      metadata: { [CHAT_RUN_CONFIG_METADATA_KEY]: { modelId: 'a', reasoning: { enabled: true }, mcp } },
    }
    expect(readRunConfigFromMessage(message)).toMatchObject({ modelId: 'a', mcp })
  })

  it('required reasoning has no off value and disabled values cannot be selected', () => {
    const models = resolveProviderModels([
      {
        type: 'deepseek',
        models: [
          {
            id: 'required',
            label: 'Required',
            features: [
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
        { type: 'qwen', models: [{ id: 'legacy', label: scenario.name, features: scenario.fields }] },
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

  it('keeps shared fields pending across model switches and reports async failures', async () => {
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
    const activeRuntime = shallowRef(runtime)
    const adapter = scope.run(() => useChatRuntimeAdapter({ runtime: activeRuntime, onActionError }))!
    const pending = adapter.setModelFeatureValue({ modelId: 'a', key: 'reasoning', value: 'high' })
    expect(adapter.data.value.model?.pendingFeatureKeys).toEqual(['reasoning'])
    await adapter.setModelFeatureValue({ modelId: 'a', key: 'reasoning', value: 'low' })
    expect(model.setFeatureValue).toHaveBeenCalledTimes(1)
    model.select('b')
    expect(adapter.data.value.model?.pendingFeatureKeys).toEqual(['reasoning'])
    activeRuntime.value = { ...runtime, composer: {} }
    activeRuntime.value = runtime
    expect(adapter.data.value.model?.pendingFeatureKeys).toEqual(['reasoning'])
    await adapter.setModelFeatureValue({ modelId: 'b', key: 'reasoning', value: 'off' })
    expect(model.setFeatureValue).toHaveBeenCalledTimes(1)
    finish()
    await pending
    expect(model.featureValues?.value.reasoning).toBe('high')
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
