import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { ModelConfigs, type ModelConfigItem } from '../models'

export interface ModelOption {
  id: string
  provider: string
  name: string
  model: string
  icon: Component
  apiUrl: string
  apiKey?: string
  capabilities?: ModelConfigItem['capabilities']
}

function createModelStore() {
  const modelOptions: ModelOption[] = Object.entries(ModelConfigs).flatMap(([provider, config]) =>
    config.models.map((modelItem) => ({
      id: `${provider}:${modelItem.model}`,
      provider,
      name: modelItem.name,
      model: modelItem.model,
      icon: config.icon,
      apiUrl: config.apiUrl,
      apiKey: config.apiKey?.trim(),
      capabilities: modelItem.capabilities,
    })),
  )

  const selectedModelId = ref(modelOptions[0]?.id || '')
  const selectedModel = computed<ModelOption | undefined>(() =>
    modelOptions.find((item) => item.id === selectedModelId.value),
  )

  const thinkingEnabled = ref(false)
  const searchEnabled = ref(false)

  const supportsThinking = computed(() => Boolean(selectedModel.value?.capabilities?.thinking))
  const supportsSearch = computed(() => Boolean(selectedModel.value?.capabilities?.search))

  const hasApiConfig = computed(() => {
    const current = selectedModel.value
    return Boolean(current?.apiUrl && current?.apiKey)
  })

  function getSelectedModelParams(): Record<string, unknown> {
    const current = selectedModel.value
    if (!current) {
      return {}
    }

    const { thinking, search } = current.capabilities ?? {}

    return {
      model: current.model,
      ...(thinkingEnabled.value && thinking ? thinking : {}),
      ...(searchEnabled.value && search ? search : {}),
    }
  }

  return {
    modelOptions,
    selectedModelId,
    selectedModel,
    thinkingEnabled,
    searchEnabled,
    supportsThinking,
    supportsSearch,
    hasApiConfig,
    getSelectedModelParams,
  }
}

type ModelStore = ReturnType<typeof createModelStore>
let modelStore: ModelStore | null = null

export function useModel() {
  if (!modelStore) {
    modelStore = createModelStore()
  }
  return modelStore
}
