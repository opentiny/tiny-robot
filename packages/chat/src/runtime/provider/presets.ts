import type { ModelSelectorFeatureValues } from '@opentiny/tiny-robot'
import type { ChatProviderConfig, ChatProviderType, ChatResolvedProviderModel } from './types'

interface ChatProviderPreset {
  label: string
  apiUrl: string
  mapFeatureValues: (values: ModelSelectorFeatureValues, modelId: string) => Record<string, unknown>
}

export function usesQwenThinkingBudget(modelId: string) {
  return /^qwen3\.[567]-(flash|plus|max)(-|$)/.test(modelId)
}

function mapQwenReasoningEffort(reasoning: string, modelId: string) {
  if (reasoning === 'off' || reasoning === 'on') return {}

  if (usesQwenThinkingBudget(modelId)) {
    // Omitting the budget uses the model's maximum thinking length.
    if (reasoning === 'low') return { thinking_budget: 1024 }
    if (reasoning === 'high') return { thinking_budget: 8192 }
    return {}
  }

  return /^qwen3\.8-(max|flash|2\.4t-a95b|27b)(-|$)/.test(modelId) ? { reasoning_effort: reasoning } : {}
}

const providerPresets: Record<ChatProviderType, ChatProviderPreset> = {
  openai: {
    label: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    mapFeatureValues: (values) =>
      typeof values.reasoning === 'string' && !['off', 'on'].includes(values.reasoning)
        ? { reasoning_effort: values.reasoning }
        : {},
  },
  deepseek: {
    label: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    mapFeatureValues: (values) =>
      typeof values.reasoning === 'string'
        ? {
            thinking: { type: values.reasoning === 'off' ? 'disabled' : 'enabled' },
            ...(values.reasoning !== 'off' && values.reasoning !== 'on' ? { reasoning_effort: values.reasoning } : {}),
          }
        : {},
  },
  qwen: {
    label: 'DashScope',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    mapFeatureValues: (values, modelId) => ({
      ...(typeof values.reasoning === 'string'
        ? {
            enable_thinking: values.reasoning !== 'off',
            ...mapQwenReasoningEffort(values.reasoning, modelId),
          }
        : {}),
      ...(typeof values.search === 'boolean' ? { enable_search: values.search } : {}),
    }),
  },
}

export function normalizeChatCompletionsUrl(apiUrl: string) {
  const url = new URL(apiUrl.trim())
  const pathname = url.pathname.replace(/\/+$/, '')
  url.pathname = pathname.endsWith('/chat/completions') ? pathname : `${pathname}/chat/completions`
  return url.toString()
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
        mapFeatureValues: model.mapFeatureValues ?? ((values) => preset.mapFeatureValues(values, model.id)),
      }
    })
  })
}
