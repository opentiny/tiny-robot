/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component, VNode } from 'vue'

export interface HistoryItem {
  id?: string
  title: string
  icon?: Component | VNode
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

export interface HistorySlots<T extends HistoryItem = HistoryItem> {
  'item-prefix'?: (slotProps: { item: T }) => VNode | VNode[]
  'item-title'?: (slotProps: { item: T }) => VNode | VNode[]
}
