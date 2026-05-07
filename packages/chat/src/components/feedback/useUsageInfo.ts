import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'

export interface UsageInfo {
  model?: string
  finishReason?: string | null
  createdAt?: number
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

interface UseUsageInfoOptions {
  role?: string
  primaryMessage: ComputedRef<ChatMessage | undefined>
  isStreaming: ComputedRef<boolean>
}

export function useUsageInfo(options: UseUsageInfoOptions): ComputedRef<UsageInfo | null> {
  return computed(() => {
    if (options.role !== 'assistant') return null

    if (options.isStreaming.value) return null

    const message = options.primaryMessage.value
    if (!message) return null

    const metadata = message.metadata
    if (!metadata) return null

    const usage = metadata.usage as
      | { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
      | undefined
    if (!usage) return null

    return {
      model: metadata.model as string | undefined,
      finishReason: (metadata.choices as Array<{ finish_reason?: string | null }> | undefined)?.[0]?.finish_reason,
      createdAt: metadata.createdAt as number | undefined,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    }
  })
}
