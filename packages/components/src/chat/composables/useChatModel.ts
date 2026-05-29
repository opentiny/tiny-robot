import { computed, type Ref, watch } from 'vue'
import type { ChatModelOption } from '../index.type'
import { resolveChatModelIcon } from '../components/icons'

export function useChatModel(getModelOptions: () => ChatModelOption[], selectedModelId: Ref<string>) {
  const normalizedModelOptions = computed(() =>
    getModelOptions().map((item) => ({
      ...item,
      apiKey: item.apiKey?.trim(),
      icon: item.icon || resolveChatModelIcon(item.provider),
    })),
  )
  const fallbackSelectedModelId = computed(
    () => normalizedModelOptions.value.find((item) => item.apiKey)?.id || normalizedModelOptions.value[0]?.id || '',
  )
  const selectedModel = computed(() => normalizedModelOptions.value.find((item) => item.id === selectedModelId.value))
  const hasApiConfig = computed(() => Boolean(selectedModel.value?.apiUrl && selectedModel.value?.apiKey))
  const availableModelCount = computed(() => normalizedModelOptions.value.filter((item) => item.apiKey).length)

  watch(
    [normalizedModelOptions, selectedModelId],
    (modelOptions) => {
      if (modelOptions[0].some((item) => item.id === selectedModelId.value)) {
        return
      }

      selectedModelId.value = fallbackSelectedModelId.value
    },
    { immediate: true },
  )

  return {
    modelOptions: normalizedModelOptions,
    selectedModelId,
    selectedModel,
    hasApiConfig,
    availableModelCount,
  }
}
