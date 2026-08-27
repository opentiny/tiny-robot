import { toRaw } from 'vue'
import type { ModelSelectorOption } from './index.type'
import type { NormalizedModelSelectorOption } from './internal.type'

const DEFAULT_GROUP_KEY = '__tr-model-selector-ungrouped__'

function normalizeText(value?: string) {
  return value?.trim() ?? ''
}

function createSearchText(parts: Array<string | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .toLocaleLowerCase()
}

export function normalizeModelOptions(models: readonly ModelSelectorOption[]): NormalizedModelSelectorOption[] {
  const seenValues = new Set<string>()
  const normalizedOptions: NormalizedModelSelectorOption[] = []

  models.forEach((model, index) => {
    if (seenValues.has(model.value)) {
      return
    }

    seenValues.add(model.value)

    const label = normalizeText(model.label) || model.value
    const description = normalizeText(model.description) || undefined
    const group = normalizeText(model.group)
    const groupKey = group || DEFAULT_GROUP_KEY
    const icon = typeof model.icon === 'string' ? model.icon : model.icon ? toRaw(model.icon) : undefined

    normalizedOptions.push({
      key: `value:${model.value}`,
      index,
      value: model.value,
      label,
      description,
      icon,
      disabled: Boolean(model.disabled),
      groupKey,
      searchText: createSearchText([label, model.value, description, group]),
      raw: model,
    })
  })

  return normalizedOptions
}

export function getDuplicateModelValues(models: readonly ModelSelectorOption[]) {
  const seenValues = new Set<string>()
  const duplicateValues = new Set<string>()

  models.forEach((model) => {
    if (seenValues.has(model.value)) {
      duplicateValues.add(model.value)
    } else {
      seenValues.add(model.value)
    }
  })

  return [...duplicateValues]
}
