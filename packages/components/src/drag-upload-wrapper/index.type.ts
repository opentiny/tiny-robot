export interface DragUploadWrapperProps {
  /**
   * 是否禁用拖拽功能
   * @default false
   */
  disabled?: boolean

  /**
   * 是否支持多选文件
   * @default true
   */
  multiple?: boolean

  /**
   * 接受的文件类型，格式同 HTML input accept 属性
   * 支持 MIME 类型、扩展名、通配符等
   * 例如: 'image/*', '.pdf,.doc', 'image/jpeg,image/png'
   * @default ''
   */
  accept?: string

  /**
   * 是否启用拖拽覆盖层
   * @default true
   */
  enableDragOverlay?: boolean

  /**
   * 覆盖层标题
   * @default '将附件拖到此处完成上传'
   */
  overlayTitle?: string

  /**
   * 覆盖层描述文本数组
   * @default []
   */
  overlayDescription?: string[]
}

export interface DragUploadWrapperSlots {
  /**
   * 默认插槽，接收拖拽状态
   */
  default: (props: { isDragging: boolean; disabled?: boolean }) => unknown

  /**
   * 覆盖层插槽，用于自定义拖拽时的覆盖层内容
   */
  overlay?: (props: { isDragging: boolean }) => unknown
}

export interface FileRejection {
  files: File[]
  reason: 'invalid-file-type' | 'too-many-files' | 'file-too-large' | 'custom'
  message?: string
}

export interface DragUploadWrapperEmits {
  /**
   * 文件被拖拽放下时触发
   * @param files 文件列表
   */
  (e: 'files-dropped', files: File[]): void

  /**
   * 文件被拒绝时触发（不符合条件）
   * @param rejection 拒绝信息
   */
  (e: 'files-rejected', rejection: FileRejection): void

  /**
   * 拖拽进入时触发
   * @param event 拖拽事件
   */
  (e: 'drag-enter', event: DragEvent): void

  /**
   * 拖拽经过时触发
   * @param event 拖拽事件
   */
  (e: 'drag-over', event: DragEvent): void

  /**
   * 拖拽离开时触发
   * @param event 拖拽事件
   */
  (e: 'drag-leave', event: DragEvent): void

  /**
   * 拖拽放下时触发（在文件处理之前）
   * @param event 拖拽事件
   */
  (e: 'drop', event: DragEvent): void
}

export interface DragUploadWrapperInstance {
  /**
   * 当前拖拽状态
   */
  isDragging: boolean

  /**
   * 重置拖拽状态
   */
  resetDragState: () => void
}
