import type { ModelSelectorEffortOption, ModelSelectorEfforts } from './index.type'

const DEFAULT_MODEL_SELECTOR_EFFORTS: readonly ModelSelectorEffortOption[] = Object.freeze([
  Object.freeze({ value: 'low', label: 'Low' }),
  Object.freeze({ value: 'medium', label: 'Medium' }),
  Object.freeze({ value: 'high', label: 'High' }),
])

export function normalizeModelEfforts(efforts: ModelSelectorEfforts | undefined): readonly ModelSelectorEffortOption[] {
  if (!efforts) {
    return []
  }

  if (efforts === true) {
    return DEFAULT_MODEL_SELECTOR_EFFORTS
  }

  const values = new Set<string>()
  const normalized: ModelSelectorEffortOption[] = []

  for (const option of efforts) {
    if (values.has(option.value)) {
      continue
    }

    values.add(option.value)
    normalized.push(option)
  }

  return normalized
}

export function getDuplicateModelEffortValues(efforts: ModelSelectorEfforts | undefined): string[] {
  if (!efforts || efforts === true) {
    return []
  }

  const values = new Set<string>()
  const duplicates = new Set<string>()

  for (const option of efforts) {
    if (values.has(option.value)) {
      duplicates.add(option.value)
    } else {
      values.add(option.value)
    }
  }

  return Array.from(duplicates)
}
