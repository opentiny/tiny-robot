import { computed, reactive, shallowRef } from 'vue'
import type { ComputedRef } from 'vue'
import type { ChatModelOption, ChatModelRuntime, ChatReasoningEffort } from '../types'
import type { ChatResolvedProviderModel } from './types'

export interface ChatProviderModelRuntime {
  model: ChatModelRuntime
  selectedModel: ComputedRef<ChatResolvedProviderModel | undefined>
  resolveModel: (modelId: string) => ChatResolvedProviderModel | undefined
}

export function createProviderModelRuntime(models: readonly ChatResolvedProviderModel[]): ChatProviderModelRuntime {
  const selectedModelId = shallowRef<string | null>(models[0]?.id ?? null)
  const reasoningEffort = shallowRef<ChatReasoningEffort>(models[0]?.reasoning?.defaultEffort ?? 'high')
  const featureState = reactive<Record<string, boolean>>({})

  const selectedModel = computed(() => models.find((item) => item.id === selectedModelId.value))

  function resolveModel(modelId: string) {
    return models.find((item) => item.id === modelId)
  }

  function resetUnsupportedFeatures(modelId: string | null) {
    const model = modelId ? resolveModel(modelId) : undefined

    Object.keys(featureState).forEach((id) => {
      if (!model?.capabilities?.[id]) {
        featureState[id] = false
      }
    })

    if (!model?.reasoning?.efforts?.includes(reasoningEffort.value)) {
      reasoningEffort.value = model?.reasoning?.defaultEffort ?? model?.reasoning?.efforts?.[0] ?? 'high'
    }
  }

  const model: ChatModelRuntime = {
    options: computed<readonly ChatModelOption[]>(() =>
      models.map(({ id, label, capabilities }) => ({
        id,
        label,
        capabilities,
      })),
    ),

    selectedId: computed(() => selectedModelId.value),

    features: computed(() =>
      Object.fromEntries(
        Object.entries(selectedModel.value?.capabilities ?? {}).map(([id, supported]) => [
          id,
          Boolean(supported && featureState[id]),
        ]),
      ),
    ),

    reasoning: computed(() => {
      const currentModel = selectedModel.value
      const enabled = Boolean(currentModel?.capabilities?.thinking && featureState.thinking)

      return {
        enabled,
        effort:
          enabled && currentModel?.reasoning?.efforts?.includes(reasoningEffort.value)
            ? reasoningEffort.value
            : undefined,
      }
    }),

    select(id) {
      if (id !== null && !resolveModel(id)) {
        throw new Error(`Unknown model: ${id}`)
      }

      selectedModelId.value = id
      resetUnsupportedFeatures(id)
    },

    setFeature(id, enabled) {
      if (!Object.prototype.hasOwnProperty.call(selectedModel.value?.capabilities ?? {}, id)) {
        throw new Error(`Unknown model feature: ${id}`)
      }

      if (enabled && !selectedModel.value?.capabilities?.[id]) {
        throw new Error(`Current model does not support ${id}`)
      }

      featureState[id] = enabled
    },
  }

  return {
    model,
    selectedModel,
    resolveModel,
  }
}
