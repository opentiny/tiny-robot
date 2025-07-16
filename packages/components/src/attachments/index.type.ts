import { Component } from 'vue'

// 基础文件类型
export type BaseFileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other'

export type FileType = BaseFileType | string

export type FileStatus = 'uploading' | 'success' | 'error'

export type DisplayVariant = 'picture' | 'card' | 'auto'

// 文件类型匹配器
export interface FileTypeMatcher {
  type: string
  matcher: (file: File | string) => boolean
  icon?: Component
  priority?: number // 优先级，数字越大优先级越高
}

// 下载处理器
export interface DownloadHandler {
  (file: Attachment): Promise<void> | void
}

export interface Attachment {
  id: string
  name: string
  status: FileStatus
  previewUrl?: string
  fileType?: FileType
  size?: number
  uploadTimeoutText?: string
  rawFile?: File // 原始文件对象，用于下载和预览
}

export interface ActionButton {
  type: string
  label: string
  handler?: (file: Attachment) => void
}

export interface AttachmentListProps {
  // 核心属性
  items?: Attachment[]
  disabled?: boolean
  wrap?: boolean

  // 图标配置
  fileIcons?: Record<string, Component>

  // 操作按钮配置
  actions?: ActionButton[]

  // 展示模式：'auto' 表示自动检测，'picture' 强制图片模式，'card' 强制卡片模式
  variant?: DisplayVariant

  // 自定义文件类型匹配器
  customMatchers?: FileTypeMatcher[]

  // 自定义下载处理器
  downloadHandler?: DownloadHandler
}

export interface AttachmentListEmits {
  (e: 'update:items', items: Attachment[]): void
  (e: 'remove', file: Attachment): void
  (e: 'download', file: Attachment): void
  (e: 'retry', file: Attachment): void
  (e: 'preview', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}

type BaseCardProps = Pick<
  AttachmentListProps,
  'fileIcons' | 'disabled' | 'actions' | 'customMatchers' | 'downloadHandler'
>

// FileCard 组件属性
export interface FileCardProps extends BaseCardProps {
  file: Attachment
  variant: 'picture' | 'card' // FileCard组件中variant不支持auto，必须是具体的类型
  showStatus?: boolean
}

// FileCard 组件事件
export interface FileCardEmits {
  (e: 'remove', file: Attachment): void
  (e: 'preview', file: Attachment): void
  (e: 'download', file: Attachment): void
  (e: 'retry', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}
