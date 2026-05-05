import { computed, toValue, watchEffect, type MaybeRefOrGetter, type Ref } from 'vue'
import type { ModelOption } from '@/types'
import { getProviderIcon } from '@/shared/utils/iconMap'

export interface UseModelSelectorOptions {
  currentModel: Ref<string>
  models: MaybeRefOrGetter<ModelOption[]>
  onChange?: (model: ModelOption) => void
}

interface CommitModelOptions {
  notifyChange?: boolean
}

export function useModelSelector(options: UseModelSelectorOptions) {
  const models = computed(() => toValue(options.models))

  const currentModelOption = computed(() => {
    return models.value.find((model) => model.value === options.currentModel.value)
  })

  const currentProvider = computed(() => {
    return currentModelOption.value ? getProviderIcon(currentModelOption.value) : null
  })

  function canSelectModel(model: ModelOption) {
    return !model.disabled
  }

  function commitModel(model: ModelOption, commitOptions: CommitModelOptions = {}) {
    const { notifyChange = true } = commitOptions

    if (!canSelectModel(model)) {
      return false
    }

    options.currentModel.value = model.value

    if (notifyChange) {
      options.onChange?.(model)
    }

    return true
  }

  watchEffect(() => {
    if (models.value.length === 0) {
      return
    }

    const selectedModel = currentModelOption.value
    const isCurrentModelSelectable = selectedModel ? canSelectModel(selectedModel) : false

    if (!isCurrentModelSelectable) {
      const fallbackModel = models.value.find((model) => canSelectModel(model))
      if (fallbackModel) {
        commitModel(fallbackModel)
      }
    }
  })

  function selectModel(model: ModelOption, options?: CommitModelOptions) {
    commitModel(model, options)
  }

  return {
    currentModelOption,
    currentProvider,
    selectModel,
  }
}
