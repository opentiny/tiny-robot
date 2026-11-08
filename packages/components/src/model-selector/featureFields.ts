import type { ModelSelectorFeatureValue, ModelSelectorFeatureValues, ModelSelectorField } from './index.type'

export function normalizeModelFields(fields: readonly ModelSelectorField[] = []): readonly ModelSelectorField[] {
  const keys = new Set<string>()
  return fields
    .filter((field) => {
      if (keys.has(field.key)) return false
      keys.add(field.key)
      return true
    })
    .map((field) => {
      if (field.type === 'switch') return field
      const values = new Set<string>()
      return {
        ...field,
        options: field.options.filter((option) => {
          if (values.has(option.value)) return false
          values.add(option.value)
          return true
        }),
      }
    })
}

export function isModelFieldValue(field: ModelSelectorField, value: unknown): value is ModelSelectorFeatureValue {
  return field.type === 'switch'
    ? typeof value === 'boolean'
    : typeof value === 'string' && field.options.some((option) => option.value === value && !option.disabled)
}

export function canSetModelFieldValue(field: ModelSelectorField, value: unknown): value is ModelSelectorFeatureValue {
  return (
    !field.disabled &&
    isModelFieldValue(field, value) &&
    (field.type === 'switch' || field.options.some((option) => option.value === value && !option.disabled))
  )
}

export function resolveModelFeatureValues(
  fields: readonly ModelSelectorField[] = [],
  values: ModelSelectorFeatureValues = {},
): ModelSelectorFeatureValues {
  return Object.fromEntries(
    normalizeModelFields(fields).flatMap((field) => {
      const current = Object.prototype.hasOwnProperty.call(values, field.key) ? values[field.key] : undefined
      if (isModelFieldValue(field, current)) return [[field.key, current]]
      if (field.type === 'switch') return [[field.key, field.defaultValue ?? false]]
      const fallback =
        field.options.find((option) => option.value === field.defaultValue && !option.disabled) ??
        field.options.find((option) => !option.disabled)
      return fallback ? [[field.key, fallback.value]] : []
    }),
  )
}

export function pickModelFeatureValues(
  fields: readonly ModelSelectorField[],
  values: ModelSelectorFeatureValues = {},
): ModelSelectorFeatureValues {
  return Object.fromEntries(
    normalizeModelFields(fields).flatMap((field) =>
      Object.prototype.hasOwnProperty.call(values, field.key) && isModelFieldValue(field, values[field.key])
        ? [[field.key, values[field.key]]]
        : [],
    ),
  )
}
