import type { ChatModelOption } from '../../types'
import type { ModelSelectorFeatureValues } from '@opentiny/tiny-robot'
import type { ChatTokenUsage } from '@opentiny/tiny-robot-kit'

export interface ChatUsageMapContext {
  readonly modelId: string
  readonly chunk: unknown
}

export type ChatProviderType = 'openai' | 'deepseek' | 'qwen'

export interface ChatProviderModelConfig extends Omit<ChatModelOption, 'metadata'> {
  mapFeatureValues?: (values: ModelSelectorFeatureValues) => Record<string, unknown>
  includeUsage?: boolean
  mapUsage?: (usage: unknown, context: ChatUsageMapContext) => ChatTokenUsage | undefined
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
