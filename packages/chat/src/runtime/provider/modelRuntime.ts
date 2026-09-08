import { computed, reactive, shallowRef } from 'vue'
import type { ComputedRef } from 'vue'
import { CHAT_BUILT_IN_MODEL_FEATURES } from '../../types/runtime'
import type { ChatBuiltInModelFeature, ChatModelOption, ChatModelRuntime } from '../../types'
import type { ChatResolvedProviderModel } from './types'

export interface ChatProviderModelRuntime {
  model: ChatModelRuntime
  selectedModel: ComputedRef<ChatResolvedProviderModel | undefined>
  resolveModel: (modelId: string) => ChatResolvedProviderModel | undefined
}

export function createProviderModelRuntime(models: readonly ChatResolvedProviderModel[]): ChatProviderModelRuntime {
  const selectedModelId = shallowRef<string | null>(models[0]?.id ?? null)
  const reasoningEffort = shallowRef<string | undefined>(getDefaultEffort(models[0]))
  const featureState = reactive<Partial<Record<ChatBuiltInModelFeature, boolean>>>({
    thinking: models[0]?.thinkingRequired === true,
  })

  const selectedModel = computed(() => models.find((item) => item.id === selectedModelId.value))

  function resolveModel(modelId: string) {
    return models.find((item) => item.id === modelId)
  }

  function getDefaultEffort(model: ChatResolvedProviderModel | undefined) {
    if (!model?.efforts?.length) {
      return undefined
    }

    return model.efforts.some((option) => option.value === model.defaultEffort)
      ? model.defaultEffort
      : model.efforts[0]?.value
  }

  function resetUnsupportedFeatures(modelId: string | null) {
    const model = modelId ? resolveModel(modelId) : undefined

    CHAT_BUILT_IN_MODEL_FEATURES.forEach((id) => {
      if (!model?.capabilities?.[id]) {
        featureState[id] = false
      } else if (id === 'thinking' && model.thinkingRequired) {
        featureState[id] = true
      }
    })

    if (!model?.efforts?.some((option) => option.value === reasoningEffort.value)) {
      reasoningEffort.value = getDefaultEffort(model)
    }
  }

  const model: ChatModelRuntime = {
    options: computed<readonly ChatModelOption[]>(() =>
      models.map(({ id, label, icon, efforts, defaultEffort, thinkingRequired, capabilities }) => ({
        id,
        label,
        icon,
        efforts,
        defaultEffort,
        thinkingRequired,
        capabilities,
      })),
    ),

    selectedId: computed(() => selectedModelId.value),

    features: computed(() =>
      Object.fromEntries(
        CHAT_BUILT_IN_MODEL_FEATURES.map((id) => [
          id,
          Boolean(selectedModel.value?.capabilities?.[id] && featureState[id]),
        ]),
      ),
    ),

    reasoning: computed(() => {
      const currentModel = selectedModel.value
      const enabled = Boolean(currentModel?.capabilities?.thinking && featureState.thinking)

      const effort = currentModel?.efforts?.some((option) => option.value === reasoningEffort.value)
        ? reasoningEffort.value
        : undefined

      return { enabled, effort: enabled ? effort : undefined }
    }),

    select(id) {
      if (id !== null && !resolveModel(id)) {
        throw new Error(`Unknown model: ${id}`)
      }

      selectedModelId.value = id
      resetUnsupportedFeatures(id)
    },

    setFeature(id: ChatBuiltInModelFeature, enabled) {
      if (id === 'thinking' && !enabled && selectedModel.value?.thinkingRequired) {
        throw new Error('Current model requires thinking')
      }

      if (enabled) {
        if (!Object.prototype.hasOwnProperty.call(selectedModel.value?.capabilities ?? {}, id)) {
          throw new Error(`Unknown model feature: ${id}`)
        }

        if (!selectedModel.value?.capabilities?.[id]) {
          throw new Error(`Current model does not support ${id}`)
        }
      }

      featureState[id] = enabled
    },

    setReasoningEffort(effort) {
      const currentModel = selectedModel.value

      if (effort === null) {
        reasoningEffort.value = getDefaultEffort(currentModel)
        return
      }

      if (!currentModel?.efforts?.some((option) => option.value === effort)) {
        throw new Error(`Current model does not support reasoning effort: ${effort}`)
      }

      reasoningEffort.value = effort
    },
  }

  return {
    model,
    selectedModel,
    resolveModel,
  }
}
