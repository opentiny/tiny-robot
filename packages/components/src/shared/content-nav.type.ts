import type { Ref } from 'vue'

export interface ContentNavItem {
  id: string
  label: string
  searchText?: string
  tooltipText?: string
  meta?: Record<string, unknown>
}

export interface ContentNavSource {
  items: Readonly<Ref<ContentNavItem[]>>
  resolveTarget: (id: string) => HTMLElement | null
  revision: Readonly<Ref<number>>
}
