export interface ContainerProps {
  /**
   * model:show
   */
  show: boolean
  /**
   * 显示模式，默认 'docked'
   */
  displayMode?: 'fullscreen' | 'docked' | 'floating'
  /**
   * 是否持久化显示模式到 localStorage，默认 false
   */
  persistDisplayMode?: boolean
}

export interface ContainerSlots {
  default: () => unknown
  title: () => unknown
  'header-actions': () => unknown
  footer: () => unknown
}

export interface ContainerEvents {
  (e: 'open'): void
  (e: 'close'): void
}
