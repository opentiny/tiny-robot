import { computed, reactive, shallowRef, watch } from 'vue'
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
  const valuesByModel = reactive(new Map<string, ModelSelectorFeatureValues>())

  const selectedModel = computed(() => models.find((item) => item.id === selectedModelId.value))

  function resolveModel(modelId: string) {
    return models.find((item) => item.id === modelId)
  }

  watch(
    selectedModel,
    (current) => {
      if (current && !valuesByModel.has(current.id)) {
        valuesByModel.set(current.id, resolveModelFeatureValues(getChatModelFields(current)))
      }
    },
    { immediate: true, flush: 'sync' },
  )

  const featureValues = computed(() =>
    resolveModelFeatureValues(
      getChatModelFields(selectedModel.value),
      selectedModel.value ? valuesByModel.get(selectedModel.value.id) : undefined,
    ),
  )

  const model: ChatModelRuntime = {
    options: computed<readonly ChatModelOption[]>(() =>
      models.map(({ id, label, description, icon, disabled, group, fields }) => ({
        id,
        label,
        description,
        icon,
        disabled,
        group,
        fields,
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
      const cached = valuesByModel.get(modelId) ?? resolveModelFeatureValues(getChatModelFields(target))
      valuesByModel.set(modelId, { ...cached, [key]: value })
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
