import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatRunConfig } from '../types'
import type { ChatResolvedProviderModel } from './types'

export const CHAT_PROVIDER_MODEL_ID_REQUEST_KEY = '__chat_provider_model_id'

export function createProviderRequestPlugin(
  resolveModel: (modelId: string) => ChatResolvedProviderModel | undefined,
): UseMessagePlugin {
  return {
    name: 'chat-provider-request',
    onBeforeRequest({ customContext, requestBody }) {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const model = runConfig?.modelId ? resolveModel(runConfig.modelId) : null

      if (runConfig?.modelId && !model) {
        throw new Error(`Unknown model for this turn: ${runConfig.modelId}`)
      }

      if (!model || !runConfig) {
        return
      }

      requestBody[CHAT_PROVIDER_MODEL_ID_REQUEST_KEY] = model.id
      const currentRunConfig = runConfig

      Object.entries(model.featureBody ?? {}).forEach(([id, body]) => {
        const enabled =
          id === 'thinking'
            ? (currentRunConfig.reasoning?.enabled ?? currentRunConfig.features?.[id])
            : currentRunConfig.features?.[id]
        const featureBody = enabled ? body.enabled : body.disabled

        if (featureBody) {
          Object.assign(requestBody, featureBody)
        }
      })

      if (
        runConfig?.reasoning?.effort &&
        model.reasoning?.effortParam &&
        model.reasoning.efforts?.includes(runConfig.reasoning.effort)
      ) {
        Object.assign(requestBody, {
          [model.reasoning.effortParam]: runConfig.reasoning.effort,
        })
      }
    },
  }
}
