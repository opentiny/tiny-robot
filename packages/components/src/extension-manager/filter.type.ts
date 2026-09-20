import type { ComputedRef, MaybeRefOrGetter, WritableComputedRef } from 'vue'
import type { ExtensionManagerTagOption } from './index.type'

export interface FilterState {
  selectedTag: string
  searchValue: string
}

export interface FilterRules<T extends object> {
  getItemTags?: (item: T) => readonly string[]
  search?: (item: T, query: string) => boolean
}

export interface UseFilterOptions<T extends object> {
  items: MaybeRefOrGetter<readonly T[]>
  tags: MaybeRefOrGetter<readonly ExtensionManagerTagOption[]>
  rules?: FilterRules<T>
  state?: MaybeRefOrGetter<FilterState>
}

export interface FilterControls {
  tags: readonly ExtensionManagerTagOption[]
  selectedTag: string
  searchValue: string
  'onUpdate:selectedTag': (value: string) => void
  'onUpdate:searchValue': (value: string) => void
}

export interface UseFilterResult<T extends object> {
  filteredItems: ComputedRef<readonly T[]>
  selectedTag: WritableComputedRef<string>
  searchValue: WritableComputedRef<string>
  controls: ComputedRef<FilterControls>
}
