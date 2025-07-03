import { VNode } from 'vue'

export interface DropdownMenuItem {
  id: string
  text: string
}

export interface DropdownMenuProps {
  appendTo?: string | HTMLElement
  items: DropdownMenuItem[]
  /**
   * 是否显示菜单，仅在 trigger 为 'manual' 时有效
   */
  show?: boolean
  /**
   * 触发方式。默认值为 'click'
   */
  trigger?: 'click' | 'hover' | 'manual'
}

export interface DropdownMenuSlots {
  trigger?: () => VNode | VNode[]
}

export interface DropdownMenuEmits {
  (e: 'item-click', item: DropdownMenuItem): void
  /**
   * 点击外部区域时触发, 仅在 trigger 为 'click' 或 'manual' 时有效
   */
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
