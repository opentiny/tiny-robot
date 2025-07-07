import { Component } from 'vue'

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other'

export type FileStatus = 'uploading' | 'done' | 'error' | 'success'

export type MessageType = 'error' | 'warning' | 'success' | 'info' | 'retry' | 'uploading'

export type StatusType = 'info' | 'operate' | 'message' | 'default'

export type ListType = 'picture' | 'card' | 'auto'

export interface Attachment {
  uid: string
  name: string
  status: FileStatus
  previewUrl?: string
  fileType?: FileType
  size?: number
  isUploading?: boolean
  messageType?: MessageType
  rawFile?: File // 原始文件对象，用于下载和预览
}

export interface ActionButton {
  type: string
  label: string
  handler?: (file: Attachment) => void
}

export interface AttachmentsProps {
  // 核心属性
  items?: Attachment[]
  disabled?: boolean
  overflow?: 'wrap' | 'no-wrap'

  // 图标配置
  fileIcons?: Record<FileType, Component>

  // 文件卡片状态配置
  statusType?: StatusType
  customActions?: ActionButton[]

  // 展示模式：'auto' 表示自动检测，'picture' 强制图片模式，'card' 强制卡片模式
  listType?: ListType
}

export interface AttachmentsEmits {
  (e: 'update:items', items: Attachment[]): void
  (e: 'file-remove', file: Attachment): void
  (e: 'file-download', file: Attachment): void
  (e: 'file-retry', file: Attachment): void
  (e: 'file-preview', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}

// 从AttachmentsProps中提取FileCard需要的属性
type BaseCardProps = Pick<AttachmentsProps, 'fileIcons' | 'disabled' | 'statusType' | 'customActions'>

// FileCard 组件属性
export interface FileCardProps extends BaseCardProps {
  file: Attachment
  listType: 'picture' | 'card' // FileCard组件中listType不支持auto，必须是具体的类型
  showPreview?: boolean
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
