import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatRunConfig } from '../../types'
import { CHAT_RUN_CONFIG_CONTEXT_KEY } from '../runConfig'
import { pickModelFeatureValues } from '@opentiny/tiny-robot'
import type { ChatResolvedProviderModel } from './types'

export const CHAT_PROVIDER_MODEL_ID_REQUEST_KEY = '__chat_provider_model_id'

export function createProviderRequestPlugin(
  resolveModel: (modelId: string) => ChatResolvedProviderModel | undefined,
): UseMessagePlugin {
  return {
    name: 'chat-provider-request',
    onBeforeRequest({ customContext, requestBody }) {
      const runConfig = customContext[CHAT_RUN_CONFIG_CONTEXT_KEY] as ChatRunConfig | undefined
      const model = runConfig?.modelId ? resolveModel(runConfig.modelId) : null

      if (runConfig?.modelId && !model) {
        throw new Error(`Unknown model for this turn: ${runConfig.modelId}`)
      }

      if (model?.disabled) {
        throw new Error(`Model is disabled for this turn: ${model.id}`)
      }

      if (!model || !runConfig) {
        return
      }

      requestBody[CHAT_PROVIDER_MODEL_ID_REQUEST_KEY] = model.id
      const values = pickModelFeatureValues(model.features ?? [], runConfig.featureValues)
      Object.assign(requestBody, model.mapFeatureValues?.({ ...values }))
    },
  }
}
