import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { CHAT_PROVIDER_MODEL_ID_REQUEST_KEY } from './requestPlugin'
import type { ChatResolvedProviderModel } from './types'
import { isChatTokenUsage } from '../usage'

const usageKeys = ['prompt_tokens', 'cached_tokens', 'completion_tokens', 'total_tokens'] as const

function normalizeMappedUsage(mapped: unknown) {
  if (!mapped || typeof mapped !== 'object' || Array.isArray(mapped)) return undefined
  const counters = mapped as Record<string, unknown>
  const usage = Object.fromEntries(
    usageKeys.flatMap((key) => {
      const value = counters[key]
      return value === undefined ? [] : [[key, value]]
    }),
  )
  return isChatTokenUsage(usage) ? usage : undefined
}

export function createProviderResponseProvider(
  resolveModel: (modelId: string) => ChatResolvedProviderModel | undefined,
): ResponseProvider {
  return async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
    const modelId = requestBody[CHAT_PROVIDER_MODEL_ID_REQUEST_KEY]

    if (typeof modelId !== 'string' || !modelId) {
      throw new Error('No model selected for this turn.')
    }

    const currentModel = resolveModel(modelId)

    if (!currentModel) {
      throw new Error(`Unknown model for this turn: ${modelId}`)
    }

    const providerRequestBody = { ...requestBody }
    delete providerRequestBody[CHAT_PROVIDER_MODEL_ID_REQUEST_KEY]

    const timeout = currentModel.timeout
    const timeoutController = timeout === undefined ? undefined : new AbortController()
    const timeoutId = timeoutController
      ? setTimeout(() => timeoutController.abort(new Error(`Provider request timed out after ${timeout}ms.`)), timeout)
      : undefined
    const requestSignal = timeoutController ? AbortSignal.any([abortSignal, timeoutController.signal]) : abortSignal
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...currentModel.headers,
    }
    const hasAuthorization = Object.keys(headers).some((key) => key.toLowerCase() === 'authorization')

    if (currentModel.apiKey && !hasAuthorization) {
      headers.Authorization = `Bearer ${currentModel.apiKey}`
    }

    try {
      const response = await fetch(currentModel.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...providerRequestBody,
          model: currentModel.id,
          stream: true,
          ...(currentModel.includeUsage
            ? {
                stream_options: {
                  ...(providerRequestBody.stream_options as Record<string, unknown> | undefined),
                  include_usage: true,
                },
              }
            : {}),
        }),
        signal: requestSignal,
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(`HTTP ${response.status}: ${response.statusText}${detail ? ` - ${detail}` : ''}`)
      }

      return (async function* () {
        try {
          for await (const rawChunk of sseStreamToGenerator(response, { signal: requestSignal })) {
            if (!currentModel.mapUsage) {
              yield rawChunk
              continue
            }

            const chunk = rawChunk as unknown as Record<string, unknown>
            const { usage, ...rest } = chunk
            try {
              const mapped = normalizeMappedUsage(
                currentModel.mapUsage(usage, { modelId: currentModel.id, chunk: rawChunk }),
              )
              yield {
                ...rest,
                ...(mapped ? { usage: mapped } : {}),
              } as typeof rawChunk
            } catch (error) {
              console.warn(`[ChatProvider] Failed to map usage for model "${currentModel.id}".`, error)
              yield rest as typeof rawChunk
            }
          }
        } finally {
          if (timeoutId !== undefined) clearTimeout(timeoutId)
        }
      })()
    } catch (error) {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      throw error
    }
  }
}
