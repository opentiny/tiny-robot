import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import type { ModelDefinition } from './models'

export const CHAT_BASIC_MODEL_ID_REQUEST_KEY = '__chat_basic_model_id'

type ResolveModel = (modelId: string) => ModelDefinition | undefined

export function createResponseProvider(resolveModel: ResolveModel): ResponseProvider {
  return async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
    const modelId = requestBody[CHAT_BASIC_MODEL_ID_REQUEST_KEY]

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
    delete providerRequestBody[CHAT_BASIC_MODEL_ID_REQUEST_KEY]

    const response = await fetch(currentModel.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentModel.apiKey}`,
      },
      body: JSON.stringify({
        ...providerRequestBody,
        model: currentModel.requestModel,
        stream: true,
      }),
      signal: abortSignal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${response.statusText}${detail ? ` - ${detail}` : ''}`)
    }

    return sseStreamToGenerator(response, { signal: abortSignal })
  }
}
