import type { ComputedRef } from 'vue'
import type { ChatMessageActionDefinition, ChatErrorInfo, ChatRuntime } from '@/types'

interface RefreshActionFallbackRuntime {
  lastError: ComputedRef<ChatErrorInfo | null>
  retry: () => Promise<boolean>
  regenerate: (messageIndex?: number) => Promise<boolean>
}

interface RefreshActionOptions {
  label: string
  runtime: ChatRuntime | null
  fallbackRuntime: RefreshActionFallbackRuntime | null
  primaryMessageId: ComputedRef<string | undefined>
  isStreaming: ComputedRef<boolean>
  lastUserContent: ComputedRef<string>
}

export function createRefreshAction(options: RefreshActionOptions): ChatMessageActionDefinition {
  const { label, runtime, fallbackRuntime, primaryMessageId, isStreaming, lastUserContent } = options

  return {
    id: 'refresh',
    label,
    icon: 'refresh',
    placement: 'actions',
    roles: ['assistant'],
    order: 200,
    when: () =>
      Boolean((runtime && primaryMessageId.value) || (fallbackRuntime && !isStreaming.value && lastUserContent.value)),
    onClick: async (context) => {
      if (runtime && context.messageId) {
        const viewState = runtime.message.getViewState(context.messageId)
        if (viewState?.error?.retryable) {
          await runtime.conversation.retry(context.messageId)
          return
        }
        await runtime.conversation.regenerate(context.messageId)
        return
      }

      if (!fallbackRuntime || isStreaming.value || !lastUserContent.value) {
        return
      }

      if (fallbackRuntime.lastError.value?.retryable) {
        await fallbackRuntime.retry()
        return
      }

      await fallbackRuntime.regenerate(context.messageIndex)
    },
  }
}
