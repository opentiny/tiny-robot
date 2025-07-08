export interface FileRejection {
  files: File[]
  reason: 'invalid-file-type'
}

export interface DragUploadWrapperProps {
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
  /**
   * 拖拽上传组件的变体
   * @default false
   */
  fullScreen?: boolean
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

export interface DragUploadWrapperSlots {
  /**
   * 覆盖层插槽，用于自定义拖拽时的覆盖层内容
   */
  overlay?: (props: { isDragging: boolean }) => unknown
}
