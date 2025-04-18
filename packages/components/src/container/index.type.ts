export interface ContainerProps {
  /**
   * model:show
   */
  show: boolean
  /**
   * model:fullscreen
   */
  fullscreen?: boolean
}

export interface ContainerSlots {
  default: () => unknown
  title: () => unknown
  operations: () => unknown
  footer: () => unknown
}
