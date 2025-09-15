export interface HistoryItem {
  id?: string
  title: string
  [x: string]: unknown
}

export interface HistoryGroup<T extends HistoryItem> {
  group: string | symbol
  items: T[]
}

export type HistoryData<T extends HistoryItem> = T[] | HistoryGroup<T>[]

export type HistoryProps<T extends HistoryItem = HistoryItem> = {
  data: HistoryData<T>
  selected?: string
  showRenameControls?: boolean
  renameControlOnClickOutside?: 'confirm' | 'cancel' | 'none'
}
