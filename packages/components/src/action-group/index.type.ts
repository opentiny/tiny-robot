import { VNode } from 'vue'

export interface ActionGroupProps {
  maxNum?: number
  showTooltip?: boolean
  dropDownShowLabelOnly?: boolean
}

export interface ActionGroupEvents {
  (e: 'item-click', name: string): void
}

export interface ActionGroupSlots {
  default: () => VNode | VNode[]
  moreBtn: () => VNode
}

export interface ActionGroupItemProps {
  name: string
  label: string
}
