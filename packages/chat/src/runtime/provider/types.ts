import type { ChatBuiltInModelFeature, ChatModelOption } from '../../types'

export type ChatProviderType = 'openai' | 'deepseek' | 'qwen'

export interface ChatProviderFeatureBody {
  enabled?: Record<string, unknown>
  disabled?: Record<string, unknown>
}

export interface ChatProviderModelConfig extends Omit<ChatModelOption, 'metadata'> {
  featureBody?: Partial<Record<ChatBuiltInModelFeature, ChatProviderFeatureBody>>
  effortParam?: string
}

export interface ChatProviderConfig {
  type: ChatProviderType
  label?: string
  apiUrl?: string
  apiKey?: string
  headers?: Record<string, string>
  timeout?: number
  models: ChatProviderModelConfig[]
}

export interface ChatResolvedProviderModel extends ChatProviderModelConfig {
  providerType: ChatProviderType
  providerLabel: string
  apiUrl: string
  apiKey?: string
  headers?: Record<string, string>
  timeout?: number
}
