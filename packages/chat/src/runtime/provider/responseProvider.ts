import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { CHAT_PROVIDER_MODEL_ID_REQUEST_KEY } from './requestPlugin'
import type { ChatResolvedProviderModel } from './types'

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

    if (!currentModel.apiKey) {
      throw new Error(`Missing API key for provider "${currentModel.providerLabel}".`)
    }

    const providerRequestBody = { ...requestBody }
    delete providerRequestBody[CHAT_PROVIDER_MODEL_ID_REQUEST_KEY]

    const timeout = currentModel.timeout
    const timeoutController = timeout === undefined ? undefined : new AbortController()
    const timeoutId = timeoutController
      ? setTimeout(() => timeoutController.abort(new Error(`Provider request timed out after ${timeout}ms.`)), timeout)
      : undefined
    const requestSignal = timeoutController ? AbortSignal.any([abortSignal, timeoutController.signal]) : abortSignal

    try {
      const response = await fetch(currentModel.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...currentModel.headers,
          Authorization: `Bearer ${currentModel.apiKey}`,
        },
        body: JSON.stringify({
          ...providerRequestBody,
          model: currentModel.id,
          stream: true,
        }),
        signal: requestSignal,
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(`HTTP ${response.status}: ${response.statusText}${detail ? ` - ${detail}` : ''}`)
      }

      return sseStreamToGenerator(response, { signal: abortSignal })
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }
}
