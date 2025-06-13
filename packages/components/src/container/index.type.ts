export interface ContainerProps {
  /**
   * model:show
   */
  show: boolean
  /**
   * 标题
   */
  title: string
  /**
   * model:displayMode 显示模式，默认 'docked'
   */
  displayMode?: 'fullscreen' | 'docked' | 'floating'

  width?: string | number
}

export interface ContainerSlots {
  default: () => unknown
  title: () => unknown
  'header-actions': () => unknown
  footer: () => unknown
}

export interface ContainerEmits {
  (e: 'open'): void
  (e: 'close'): void
}
