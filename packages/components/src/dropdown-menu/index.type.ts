export interface DropdownMenuItem {
  id: string
  text: string
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  // 下面是样式相关的属性
  minWidth?: string | number
  topOffset?: string | number
}

export interface DropdownMenuSlots {
  default?: () => unknown
}

export interface DropdownMenuEmits {
  (e: 'item-click', item: DropdownMenuItem): void
}

export interface DropdownMenuEvents {
  itemClick?: (item: DropdownMenuItem) => void
}
