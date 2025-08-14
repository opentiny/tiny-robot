export interface ContainerProps {
  /**
   * model:show
   */
  show: boolean
  /**
   * model:fullscreen
   */
  fullscreen?: boolean
  title?: string
}

export interface ContainerSlots {
  default: () => unknown
  title: () => unknown
  operations: () => unknown
  footer: () => unknown
}

export interface ContainerEmits {
  (e: 'close'): void
}
