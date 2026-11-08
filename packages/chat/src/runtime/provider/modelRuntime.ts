import { computed, shallowRef, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { canSetModelFieldValue, resolveModelFeatureValues } from '@opentiny/tiny-robot'
import type { ModelSelectorFeatureValues } from '@opentiny/tiny-robot'
import type { ChatModelOption, ChatModelRuntime } from '../../types'
import type { ChatResolvedProviderModel } from './types'
import { getChatModelFields } from '../../modelFeatures'

export interface ChatProviderModelRuntime {
  model: ChatModelRuntime
  selectedModel: ComputedRef<ChatResolvedProviderModel | undefined>
  resolveModel: (modelId: string) => ChatResolvedProviderModel | undefined
}

export function createProviderModelRuntime(models: readonly ChatResolvedProviderModel[]): ChatProviderModelRuntime {
  const initialModel = models.find((model) => !model.disabled)
  const selectedModelId = shallowRef<string | null>(initialModel?.id ?? null)
  const storedFeatureValues = shallowRef<ModelSelectorFeatureValues>({})

  const selectedModel = computed(() => models.find((item) => item.id === selectedModelId.value))

  function resolveModel(modelId: string) {
    return models.find((item) => item.id === modelId)
  }

  const featureValues = computed(() =>
    resolveModelFeatureValues(getChatModelFields(selectedModel.value), storedFeatureValues.value),
  )

  watch(
    featureValues,
    (values) => {
      if (Object.entries(values).some(([key, value]) => storedFeatureValues.value[key] !== value)) {
        storedFeatureValues.value = { ...storedFeatureValues.value, ...values }
      }
    },
    { immediate: true, flush: 'sync' },
  )

  const model: ChatModelRuntime = {
    options: computed<readonly ChatModelOption[]>(() =>
      models.map(({ id, label, description, icon, disabled, group, features }) => ({
        id,
        label,
        description,
        icon,
        disabled,
        group,
        features,
      })),
    ),

    selectedId: computed(() => selectedModelId.value),
    featureValues,

    setFeatureValue({ modelId, key, value }) {
      const target = resolveModel(modelId)
      const field = getChatModelFields(target).find((item) => item.key === key)
      if (!target || target.disabled || !field || !canSetModelFieldValue(field, value)) {
        throw new Error(`Invalid model field value: ${modelId}.${key}`)
      }

      const nextValues = { ...storedFeatureValues.value, [key]: value }
      const activeModel = selectedModel.value
      if (activeModel && activeModel !== target) {
        const activeField = getChatModelFields(activeModel).find((item) => item.key === key)
        const effectiveValue = activeField && resolveModelFeatureValues([activeField], nextValues)[key]
        if (effectiveValue !== undefined && effectiveValue !== value) {
          throw new Error(`Model field ${modelId}.${key} is incompatible with active model: ${activeModel.id}`)
        }
      }
      storedFeatureValues.value = nextValues
    },

    select(id) {
      const nextModel = id === null ? undefined : resolveModel(id)

      if (id !== null && !nextModel) {
        throw new Error(`Unknown model: ${id}`)
      }

      if (nextModel?.disabled) {
        throw new Error(`Model is disabled: ${id}`)
      }

      selectedModelId.value = id
    },
  }

  return {
    model,
    selectedModel,
    resolveModel,
  }
}
