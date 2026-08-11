import type { ChatModelOption, ChatReasoningEffort } from '../types'

export type ChatProviderType = 'openai' | 'deepseek' | 'qwen'

export interface ChatProviderFeatureBody {
  enabled?: Record<string, unknown>
  disabled?: Record<string, unknown>
}

export interface ChatProviderReasoningConfig {
  efforts?: readonly ChatReasoningEffort[]
  defaultEffort?: ChatReasoningEffort
  effortParam?: string
}

export interface ChatProviderModelConfig extends Omit<ChatModelOption, 'metadata'> {
  featureBody?: Record<string, ChatProviderFeatureBody>
  reasoning?: ChatProviderReasoningConfig
}

export interface ChatProviderConfig {
  type: ChatProviderType
  label?: string
  apiUrl?: string
  apiKey?: string
  headers?: Record<string, string>
  models: ChatProviderModelConfig[]
}

export interface ChatResolvedProviderModel extends ChatProviderModelConfig {
  providerType: ChatProviderType
  providerLabel: string
  apiUrl: string
  apiKey?: string
  headers?: Record<string, string>
}
