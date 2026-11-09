import { normalizeModelFields, resolveModelFeatureValues } from '@opentiny/tiny-robot'
import type { ModelSelectorField, ModelSelectorFeatureValues } from '@opentiny/tiny-robot'
import type { ChatModelOption, ChatModelRuntime } from './types'

export function getChatModelFields(model?: ChatModelOption): readonly ModelSelectorField[] {
  return normalizeModelFields(model?.features)
}

export function getChatModelFeatureValues(model: ChatModelRuntime): ModelSelectorFeatureValues {
  const option = model.options.value.find((item) => item.id === model.selectedId.value)
  return resolveModelFeatureValues(option?.features, model.featureValues?.value)
}
