export interface ActionGroupProps {
  maxNum?: number
}

export interface ActionGroupEvents {
  (e: 'click', name: string): void
}

export interface ActionGroupItemProps {
  name: string
  label: string
}
