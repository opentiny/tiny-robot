import { VNode } from 'vue'

export interface DropdownMenuItem {
  id: string
  text: string
}

export interface DropdownMenuProps {
  appendTo?: string | HTMLElement
  items: DropdownMenuItem[]
  /**
   * 当 trigger 为 'click' 或 'hover' 时，是一个双向绑定的 model(v-model:show)，可在组件外部控制显示状态。
   * 否则当 trigger 为 'manual' 时，是一个单向绑定的 prop，组件内部无法修改 show 的值
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
