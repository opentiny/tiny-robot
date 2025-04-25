import { CSSProperties } from 'vue'

interface BaseHistoryProps {
  activeTab?: string
  searchBar?: boolean
  searchQuery?: string
  searchPlaceholder?: string
  searchFn?: (query: string, item: HistoryItem) => boolean
  selected?: string
}

export type SingleTabHistoryProps = {
  tabTitle: string
  data: HistoryGroup[]
} & BaseHistoryProps

export type MultiTabHistoryProps = {
  tabs: {
    title: string
    id: string
  }[]
  data: Record<string, HistoryGroup[]>
} & BaseHistoryProps

export type HistoryProps = SingleTabHistoryProps | MultiTabHistoryProps

export interface HistoryGroup<T = Record<string, unknown>> {
  date: string
  items: HistoryItem<T>[]
}

export interface HistoryItemTagProps {
  text: string
  type?: 'success' | 'warning' | 'error' | 'info' | 'default'
  style?: CSSProperties
}

export interface HistoryItem<T = Record<string, unknown>> {
  id: string
  title: string
  tag?: HistoryItemTagProps
  data?: T
}

export interface HistoryEvents {
  (e: 'close'): void
  (e: 'item-click', item: HistoryItem): void
  (e: 'item-title-change', newTitle: string, rawData: HistoryItem): void
  (e: 'item-delete', item: HistoryItem): void
}
