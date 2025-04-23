export interface HistoryProps {
  tabs: {
    label: string
    value: string
  }[]
  activeTab?: string
  data: Record<string, HistoryGroup[]>
  searchBar?: boolean
  selected?: string
}

export interface HistoryGroup<T = Record<string, unknown>> {
  date: string
  items: HistoryItem<T>[]
}

export interface HistoryItem<T = Record<string, unknown>> {
  id: string
  title: string
  data?: T
}

export interface HistoryEvents {
  (e: 'close'): void
  (e: 'item-click'): void
}
