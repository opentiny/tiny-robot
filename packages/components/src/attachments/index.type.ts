import { Component } from 'vue'

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other'

export type FileStatus = 'uploading' | 'success' | 'error' | 'warning' | 'info'

export type StatusDisplayMode = 'info' | 'actions' | 'message' | 'default'

export type DisplayVariant = 'picture' | 'card' | 'auto'

export type LayoutMode = 'wrap' | 'no-wrap'

export interface Attachment {
  uid: string
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
  layout?: LayoutMode

  // 图标配置
  fileIcons?: Record<FileType, Component>

  // 文件卡片内容显示模式配置
  statusMode?: StatusDisplayMode
  actions?: ActionButton[]

  // 展示模式：'auto' 表示自动检测，'picture' 强制图片模式，'card' 强制卡片模式
  variant?: DisplayVariant
}

export interface AttachmentListEmits {
  (e: 'update:items', items: Attachment[]): void
  (e: 'file-remove', file: Attachment): void
  (e: 'file-download', file: Attachment): void
  (e: 'file-retry', file: Attachment): void
  (e: 'file-preview', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}

type BaseCardProps = Pick<AttachmentListProps, 'fileIcons' | 'disabled' | 'statusMode' | 'actions'>

// FileCard 组件属性
export interface FileCardProps extends BaseCardProps {
  file: Attachment
  variant: 'picture' | 'card' // FileCard组件中variant不支持auto，必须是具体的类型
  preview?: boolean
  status?: boolean
}

// FileCard 组件事件
export interface FileCardEmits {
  (e: 'remove', file: Attachment): void
  (e: 'preview', file: Attachment): void
  (e: 'download', file: Attachment): void
  (e: 'retry', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}
