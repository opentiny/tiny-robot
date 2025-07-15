export interface Handlers {
  handleDragEnter: (e: DragEvent) => void
  handleDragOver: (e: DragEvent) => void
  handleDragLeave: (e: DragEvent) => void
  handleDrop: (e: DragEvent) => void
}

/**
 * 文件拒绝信息
 */
export interface FileRejection {
  files: File[]
  reason: 'file-type-not-allowed' | 'file-size-exceeded' | 'file-count-exceeded'
}

/**
 * 拖拽上传组件的属性
 */
export interface DragAwareBinding {
  onStateChange: (visible: boolean, rect: DOMRect | null) => void
  onFilesDropped: (files: File[]) => void
  onFilesRejected: (rejection: FileRejection) => void
  /**
   * 允许上传的文件类型, 与原生 input 的 accept 属性一致
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
   * @example '.jpg,.png,image/*'
   */
  accept?: string
  /**
   * 是否允许多选
   * @default true
   */
  multiple?: boolean
  disabled?: boolean
  /**
   * 单个文件的最大大小（单位：字节）
   * @default 10 * 1024 * 1024 (10MB)
   */
  maxSize?: number
  /**
   * 允许上传的最大文件数量
   * @default 3
   */
  maxFiles?: number
}

/**
 * 拖拽上传组件的属性
 */
export interface DragOverlayProps {
  /**
   * 覆盖层标题
   * @default ''
   */
  overlayTitle?: string

  /**
   * 覆盖层描述文本数组
   * @default []
   */
  overlayDescription?: string[]
  /**
   * 控制拖拽覆盖层是否可见。这旨在与 v-drag-aware 指令结合使用，由父组件控制。
   * @default false
   */
  isDragging?: boolean
  /**
   * @description 目标元素的 DOMRect，用于定位覆盖层
   * @default null
   */
  targetRect?: DOMRect | null
  /**
   * @description 是否全屏模式，控制覆盖层的边框显示
   * @default false
   */
  fullscreen?: boolean
}

export interface DragOverlaySlots {
  /**
   * 覆盖层插槽，用于自定义拖拽时的覆盖层内容
   */
  overlay?: (props: { isDragging: boolean }) => unknown
}
