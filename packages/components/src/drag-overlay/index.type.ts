import type { DragZoneErrorCode } from './constants'

export interface Handlers {
  handleDragEnter: (e: DragEvent) => void
  handleDragOver: (e: DragEvent) => void
  handleDragLeave: (e: DragEvent) => void
  handleDrop: (e: DragEvent) => void
}

/**
 * 文件拒绝原因
 */
export interface RejectionReason {
  code: DragZoneErrorCode
  message: string
}

/**
 * 文件拒绝信息
 */
export interface FileRejection extends RejectionReason {
  files: File[]
}

/**
 * 拖拽上传组件的属性
 */
export interface DropzoneBinding {
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
  /**
   * 是否禁用拖拽
   * @default false
   */
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
  /**
   * 拖拽完成后的回调
   * @param files 上传的文件
   */
  onDrop: (files: File[]) => void
  /**
   * 拖拽失败后的回调
   * @param rejection 拒绝信息
   */
  onError: (rejection: FileRejection) => void
  /**
   * 拖拽开始时的回调
   * @param dragging 是否正在拖拽
   * @param element 拖拽目标元素
   */
  onDraggingChange: (dragging: boolean, element: HTMLElement | null) => void
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
   * 控制拖拽覆盖层是否可见。这旨在与 v-dropzone 指令结合使用，由父组件控制。
   * @default false
   */
  isDragging?: boolean
  /**
   * @description 拖拽目标元素，用于定位覆盖层
   * @default null
   */
  dragTarget?: HTMLElement | null
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
