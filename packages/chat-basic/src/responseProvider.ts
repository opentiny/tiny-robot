import type { Ref } from 'vue'
import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import type { ModelDefinition } from './models'

export function createResponseProvider(selectedModel: Ref<ModelDefinition | undefined>): ResponseProvider {
  return async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
    const currentModel = selectedModel.value

    if (!currentModel) {
      throw new Error('No model selected.')
    }

    if (!currentModel.apiKey) {
      throw new Error(`Missing API key for provider "${currentModel.providerLabel}".`)
    }

    const response = await fetch(currentModel.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentModel.apiKey}`,
      },
      body: JSON.stringify({
        ...requestBody,
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
