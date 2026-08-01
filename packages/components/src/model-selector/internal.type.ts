import type { ModelSelectorOption } from './index.type'

export interface NormalizedModelSelectorOption {
  key: string
  index: number
  value: string
  label: string
  description?: string
  icon?: ModelSelectorOption['icon']
  disabled: boolean
  groupKey: string
  groupLabel: string
  keywords: readonly string[]
  searchText: string
  raw: ModelSelectorOption
}

export interface ModelSelectorOptionGroup {
  key: string
  index: number
  group: string
  label: string
  items: NormalizedModelSelectorOption[]
}

export type ModelSelectorInitialHighlight = 'first' | 'last'
