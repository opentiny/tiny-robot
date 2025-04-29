import { CSSProperties, Component } from 'vue'

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'text' | 'zip' | 'other'

export interface UploadFile {
  uid: string
  name: string
  status?: string
  rawFile?: File
}

export interface Attachment extends UploadFile {
  previewUrl?: string
  fileType?: FileType
  id?: string
  size?: number
  progress?: number
  isUploading?: boolean
}

export interface DragConfig {
  mode?: 'fullscreen' | 'container'
  target?: string | HTMLElement
  overlay?: {
    zIndex?: number
    enterDelay?: number
    leaveDelay?: number
    className?: string
  }
}

export interface AttachmentsProps {
  // 核心属性
  items?: Attachment[]
  disabled?: boolean
  overflow?: 'wrap' | 'scrollX' | 'scrollY'

  // 拖拽配置
  drag?: boolean | DragConfig

  // 图标配置
  fileIcons?: Record<FileType, Component>
  iconSize?: number

  // 样式配置
  rootClass?: string
  styles?: {
    root?: CSSProperties
    card?: CSSProperties
    overlay?: CSSProperties
  }
}

// 自定义操作按钮类型
export interface ActionButton {
  type: string
  label: string
  handler?: (file: Attachment) => void
}
