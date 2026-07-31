import { computed, reactive, ref } from 'vue'
import type { ChatModelOption, ChatModelRuntime } from '@opentiny/tiny-robot-chat'
import { modelDefinitions, type FeatureId, type ReasoningEffort } from './models'

export function useModel() {
  const selectedModelId = ref<string | null>(modelDefinitions[0]?.id ?? null)
  const reasoningEffort = ref<ReasoningEffort>(modelDefinitions[0]?.defaultReasoningEffort ?? 'high')
  const featureState = reactive<Record<FeatureId, boolean>>({
    thinking: false,
    search: false,
  })

  const selectedModel = computed(() => modelDefinitions.find((item) => item.id === selectedModelId.value))

  function resetUnsupportedFeatures(modelId: string | null) {
    const model = modelDefinitions.find((item) => item.id === modelId)

    if (!model?.capabilities.thinking) {
      featureState.thinking = false
    }

    if (!model?.capabilities.search) {
      featureState.search = false
    }

    if (!model?.reasoningEfforts?.includes(reasoningEffort.value)) {
      reasoningEffort.value = model?.defaultReasoningEffort ?? model?.reasoningEfforts?.[0] ?? 'high'
    }
  }

  const reasoning = computed(() => ({
    enabled: Boolean(selectedModel.value?.capabilities.thinking && featureState.thinking),
    effort:
      selectedModel.value?.capabilities.thinking &&
      featureState.thinking &&
      selectedModel.value.reasoningEfforts?.includes(reasoningEffort.value)
        ? reasoningEffort.value
        : undefined,
  }))

  const model: ChatModelRuntime = {
    options: computed<readonly ChatModelOption[]>(() =>
      modelDefinitions.map(({ id, label, capabilities }) => ({
        id,
        label,
        capabilities,
      })),
    ),

    selectedId: computed(() => selectedModelId.value),

    select(id) {
      if (id !== null && !modelDefinitions.some((item) => item.id === id)) {
        throw new Error(`Unknown model: ${id}`)
      }

      selectedModelId.value = id
      resetUnsupportedFeatures(id)
    },

    features: computed(() => ({
      thinking: Boolean(selectedModel.value?.capabilities.thinking && featureState.thinking),
      search: Boolean(selectedModel.value?.capabilities.search && featureState.search),
    })),

    setFeature(id, enabled) {
      if (id !== 'thinking' && id !== 'search') {
        throw new Error(`Unknown model feature: ${id}`)
      }

      if (enabled && !selectedModel.value?.capabilities[id]) {
        throw new Error(`Current model does not support ${id}`)
      }

      featureState[id] = enabled
    },
  }

  function resolveModel(modelId: string) {
    return modelDefinitions.find((item) => item.id === modelId)
  }

  return {
    model,
    selectedModel,
    reasoning,
    reasoningEffort,
    resolveModel,
  }
}
