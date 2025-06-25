import { VNode } from 'vue'

export interface DropdownMenuItem {
  id: string
  text: string
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  /**
   * 是否显示菜单，仅在 trigger 为 'manual' 时有效
   */
  show?: boolean
  /**
   * 触发方式。默认值为 'click'
   */
  trigger?: 'click' | 'manual'
  // 下面是样式相关的属性
  minWidth?: string | number
}

export interface DropdownMenuSlots {
  trigger?: () => VNode | VNode[]
}

export interface DropdownMenuEmits {
  (e: 'item-click', item: DropdownMenuItem): void
  (e: 'click-outside', event: MouseEvent): void
}

export interface DropdownMenuEventProps {
  onItemClick?: (item: DropdownMenuItem) => void
  onClickOutside?: (event: MouseEvent) => void
}

export interface DropdownMenuEvents {
  /**
   * @deprecated
   */
  itemClick?: (item: DropdownMenuItem) => void
  /**
   * @deprecated
   */
  clickOutside?: (event: MouseEvent) => void
}
