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
  const seenIds = new Set<string>()
  const normalizedOptions: NormalizedModelSelectorOption[] = []

  models.forEach((model, index) => {
    if (seenIds.has(model.id)) {
      return
    }

    seenIds.add(model.id)

    const label = normalizeText(model.label) || model.id
    const description = normalizeText(model.description) || undefined
    const group = normalizeText(model.group)
    const groupKey = group ? `group:${group}` : DEFAULT_GROUP_KEY
    const icon = typeof model.icon === 'string' ? model.icon : model.icon ? toRaw(model.icon) : undefined

    normalizedOptions.push({
      key: `id:${model.id}`,
      index,
      id: model.id,
      label,
      description,
      icon,
      disabled: Boolean(model.disabled),
      groupKey,
      searchText: createSearchText([label, model.id, description, group]),
      raw: model,
    })
  })

  return normalizedOptions
}

export function getDuplicateModelIds(models: readonly ModelSelectorOption[]) {
  const seenIds = new Set<string>()
  const duplicateIds = new Set<string>()

  models.forEach((model) => {
    if (seenIds.has(model.id)) {
      duplicateIds.add(model.id)
    } else {
      seenIds.add(model.id)
    }
  })

  return [...duplicateIds]
}
