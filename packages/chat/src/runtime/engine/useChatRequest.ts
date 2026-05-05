import { computed, shallowRef, watchEffect } from 'vue'
import type { ComputedRef, ShallowRef } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type { ChatErrorInfo, ChatStatus, ResponseProvider, UseMessageResponseProvider } from '@/types'
import { ChatProviderError } from '@/runtime/transport/openaiCompatibleTransport'

interface UseChatRequestOptions {
  conversation: Pick<UseConversationReturn, 'activeConversation' | 'abortActiveRequest'>
  responseProviderRef: ShallowRef<UseMessageResponseProvider>
}

function extractStatusCode(message: string): number | undefined {
  const matched = message.match(/\b(401|403|408|429|5\d{2})\b/)
  return matched ? Number(matched[1]) : undefined
}

function normalizeChatError(error: unknown): ChatErrorInfo {
  const normalizedError = error instanceof Error ? error : new Error(String(error))
  const message = normalizedError.message || 'Unknown error'
  const httpStatus =
    error instanceof ChatProviderError
      ? error.httpStatus
      : typeof (error as { httpStatus?: unknown })?.httpStatus === 'number'
        ? (error as { httpStatus: number }).httpStatus
        : typeof (error as { statusCode?: unknown })?.statusCode === 'number'
          ? (error as { statusCode: number }).statusCode
          : extractStatusCode(message)
  const statusCode = httpStatus
  const code =
    error instanceof ChatProviderError
      ? error.code
      : typeof (error as { code?: unknown })?.code === 'string'
        ? (error as { code: string }).code
        : undefined
  const providerId =
    error instanceof ChatProviderError
      ? error.providerId
      : typeof (error as { providerId?: unknown })?.providerId === 'string'
        ? (error as { providerId: string }).providerId
        : undefined
  const lowerCasedMessage = message.toLowerCase()
  const retryable =
    error instanceof ChatProviderError && typeof error.retryable === 'boolean' ? error.retryable : undefined

  if (statusCode === 401 || statusCode === 403 || lowerCasedMessage.includes('api key') || code === 'invalid_api_key') {
    return {
      type: 'auth',
      message,
      retryable: retryable ?? false,
      httpStatus,
      statusCode,
      code,
      providerId,
      originalError: error,
    }
  }

  if (statusCode === 429 || lowerCasedMessage.includes('rate limit') || code === 'rate_limit_exceeded') {
    return {
      type: 'rate_limit',
      message,
      retryable: retryable ?? true,
      httpStatus,
      statusCode,
      code,
      providerId,
      originalError: error,
    }
  }

  if (statusCode && statusCode >= 500) {
    return {
      type: 'server',
      message,
      retryable: retryable ?? true,
      httpStatus,
      statusCode,
      code,
      providerId,
      originalError: error,
    }
  }

  if (lowerCasedMessage.includes('timeout') || lowerCasedMessage.includes('econnaborted')) {
    return {
      type: 'timeout',
      message,
      retryable: retryable ?? true,
      httpStatus,
      statusCode,
      code,
      providerId,
      originalError: error,
    }
  }

  if (
    lowerCasedMessage.includes('failed to fetch') ||
    lowerCasedMessage.includes('network') ||
    lowerCasedMessage.includes('fetch')
  ) {
    return {
      type: 'network',
      message,
      retryable: retryable ?? true,
      httpStatus,
      statusCode,
      code,
      providerId,
      originalError: error,
    }
  }

  if (lowerCasedMessage.includes('provider')) {
    return {
      type: 'provider',
      message,
      retryable: retryable ?? true,
      httpStatus,
      statusCode,
      code,
      providerId,
      originalError: error,
    }
  }

  return {
    type: 'unknown',
    message,
    retryable: retryable ?? true,
    httpStatus,
    statusCode,
    code,
    providerId,
    originalError: error,
  }
}

export function useChatRequest(options: UseChatRequestOptions) {
  const lastError = shallowRef<ChatErrorInfo | null>(null)

  const status = computed<ChatStatus>(() => {
    const engine = options.conversation.activeConversation.value?.engine
    if (!engine) return 'ready'

    const requestState = engine.requestState.value
    const processingState = engine.processingState.value

    if (requestState === 'error') return 'error'
    if (requestState === 'processing') {
      return processingState === 'completing' ? 'streaming' : 'submitted'
    }

    return 'ready'
  })

  function updateResponseProvider(provider: ResponseProvider): void {
    options.responseProviderRef.value = provider as UseMessageResponseProvider
  }

  function captureError(error: unknown): ChatErrorInfo {
    const normalizedError = normalizeChatError(error)
    lastError.value = normalizedError
    return normalizedError
  }

  function clearLastError(): void {
    lastError.value = null
  }

  watchEffect(() => {
    const engine = options.conversation.activeConversation.value?.engine
    if (engine) {
      engine.responseProvider.value = options.responseProviderRef.value
    }
  })

  async function abort(): Promise<void> {
    await options.conversation.abortActiveRequest()
  }

  return {
    status,
    lastError: computed(() => lastError.value) as ComputedRef<ChatErrorInfo | null>,
    updateResponseProvider,
    captureError,
    clearLastError,
    abort,
  }
}
