import type { ChatModelOption } from '@opentiny/tiny-robot-chat'

export type FeatureId = 'thinking' | 'search'
export type ReasoningEffort = 'low' | 'medium' | 'high' | 'max'
export interface FeatureParams {
  enabled?: Record<string, unknown>
  disabled?: Record<string, unknown>
}

export interface ModelDefinition extends Omit<ChatModelOption, 'capabilities'> {
  provider: string
  providerLabel: string
  apiUrl: string
  apiKey?: string
  requestModel: string
  capabilities: Partial<Record<FeatureId, true>>
  featureParams?: Partial<Record<FeatureId, FeatureParams>>
  reasoningEfforts?: readonly ReasoningEffort[]
  defaultReasoningEffort?: ReasoningEffort
  reasoningEffortParam?: string
}

interface ProviderConfig {
  label: string
  apiUrl: string
  apiKey?: string
  modelDefaults?: {
    capabilities?: Partial<Record<FeatureId, true>>
    featureParams?: Partial<Record<FeatureId, FeatureParams>>
    reasoningEfforts?: readonly ReasoningEffort[]
    defaultReasoningEffort?: ReasoningEffort
    reasoningEffortParam?: string
  }
  models: Array<{
    label: string
    requestModel: string
    capabilities?: Partial<Record<FeatureId, true>>
    featureParams?: Partial<Record<FeatureId, FeatureParams>>
    reasoningEfforts?: readonly ReasoningEffort[]
    defaultReasoningEffort?: ReasoningEffort
    reasoningEffortParam?: string
  }>
}

const providerConfigs: Record<string, ProviderConfig> = {
  aliyun: {
    label: 'DashScope',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim(),
    modelDefaults: {
      capabilities: {
        thinking: true,
        search: true,
      },
      featureParams: {
        thinking: {
          enabled: {
            enable_thinking: true,
          },
          disabled: {
            enable_thinking: false,
          },
        },
        search: {
          enabled: {
            enable_search: true,
          },
        },
      },
    },
    models: [
      {
        label: 'Qwen3.7 Flash',
        requestModel: 'qwen3.7-flash',
      },
      {
        label: 'Qwen3.7 Plus',
        requestModel: 'qwen3.7-plus',
      },
      {
        label: 'Qwen3.7 Max',
        requestModel: 'qwen3.7-max',
      },
    ],
  },
  deepseek: {
    label: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim(),
    modelDefaults: {
      capabilities: {
        thinking: true,
      },
      featureParams: {
        thinking: {
          enabled: {
            thinking: {
              type: 'enabled',
            },
          },
          disabled: {
            thinking: {
              type: 'disabled',
            },
          },
        },
      },
      reasoningEfforts: ['high', 'max'],
      defaultReasoningEffort: 'high',
      reasoningEffortParam: 'reasoning_effort',
    },
    models: [
      {
        label: 'DeepSeek V4 Flash',
        requestModel: 'deepseek-v4-flash',
      },
      {
        label: 'DeepSeek V4 Pro',
        requestModel: 'deepseek-v4-pro',
      },
    ],
  },
}

export const modelDefinitions: readonly ModelDefinition[] = Object.entries(providerConfigs).flatMap(
  ([provider, config]) =>
    config.models.map((model) => ({
      id: `${provider}:${model.requestModel}`,
      label: model.label,
      provider,
      providerLabel: config.label,
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      requestModel: model.requestModel,
      capabilities: model.capabilities ?? config.modelDefaults?.capabilities ?? {},
      featureParams: model.featureParams ?? config.modelDefaults?.featureParams,
      reasoningEfforts: model.reasoningEfforts ?? config.modelDefaults?.reasoningEfforts,
      defaultReasoningEffort: model.defaultReasoningEffort ?? config.modelDefaults?.defaultReasoningEffort,
      reasoningEffortParam: model.reasoningEffortParam ?? config.modelDefaults?.reasoningEffortParam,
    })),
)
