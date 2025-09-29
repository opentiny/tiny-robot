/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component, VNode } from 'vue'

export interface HistoryItem {
  id?: string
  title: string
  [x: string]: any
}

export interface HistoryGroup<T extends HistoryItem> {
  group: string | symbol
  items: T[]
}

export type HistoryData<T extends HistoryItem> = T[] | HistoryGroup<T>[]

export interface HistoryMenuItem {
  id: string
  text: string
  icon?: Component | VNode
}

export type HistoryProps<T extends HistoryItem = HistoryItem> = {
  data: HistoryData<T>
  selected?: string
  showRenameControls?: boolean
  renameControlOnClickOutside?: 'confirm' | 'cancel' | 'none'
  menuItems?: HistoryMenuItem[]
  menuListGap?: number
}
