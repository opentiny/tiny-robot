import { CSSProperties, Component } from 'vue'

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other'

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
  messageType?: 'error' | 'warning' | 'success' | 'info' // 状态消息类型
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

  // 文件卡片状态配置
  statusType?: 'info' | 'progress' | 'operate' | 'message' | 'default'
  customActions?: ActionButton[]
}

// 自定义操作按钮类型
export interface ActionButton {
  type: string
  label: string
  handler?: (file: Attachment) => void
}
