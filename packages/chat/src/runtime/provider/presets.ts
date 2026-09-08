import type { ChatProviderConfig, ChatProviderModelConfig, ChatProviderType, ChatResolvedProviderModel } from './types'

interface ChatProviderPreset {
  label: string
  apiUrl: string
  featureBody?: ChatProviderModelConfig['featureBody']
  efforts?: ChatProviderModelConfig['efforts']
  defaultEffort?: ChatProviderModelConfig['defaultEffort']
  effortParam?: ChatProviderModelConfig['effortParam']
}

const providerPresets: Record<ChatProviderType, ChatProviderPreset> = {
  openai: {
    label: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
  },
  deepseek: {
    label: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    featureBody: {
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
    efforts: [
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'max', label: '最高' },
    ],
    defaultEffort: 'high',
    effortParam: 'reasoning_effort',
  },
  qwen: {
    label: 'DashScope',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    featureBody: {
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
}

export function normalizeChatCompletionsUrl(apiUrl: string) {
  const trimmedUrl = apiUrl.trim().replace(/\/+$/, '')

  return trimmedUrl.endsWith('/chat/completions') ? trimmedUrl : `${trimmedUrl}/chat/completions`
}

export function resolveProviderModels(providers: readonly ChatProviderConfig[]): readonly ChatResolvedProviderModel[] {
  const ids = new Set<string>()

  return providers.flatMap((provider) => {
    const preset = providerPresets[provider.type]
    if (!preset) {
      throw new Error(`Unknown provider type: ${String(provider.type)}`)
    }
    const providerLabel = provider.label ?? preset.label
    const apiUrl = normalizeChatCompletionsUrl(provider.apiUrl ?? preset.apiUrl)

    return provider.models.map((model) => {
      if (ids.has(model.id)) {
        throw new Error(`Duplicate model id: ${model.id}`)
      }

      ids.add(model.id)

      return {
        ...model,
        providerType: provider.type,
        providerLabel,
        apiUrl,
        apiKey: provider.apiKey,
        headers: provider.headers,
        timeout: provider.timeout,
        featureBody: {
          ...preset.featureBody,
          ...model.featureBody,
        },
        efforts: model.efforts ?? preset.efforts,
        defaultEffort: model.defaultEffort ?? preset.defaultEffort,
        effortParam: model.effortParam ?? preset.effortParam,
      }
    })
  })
}
