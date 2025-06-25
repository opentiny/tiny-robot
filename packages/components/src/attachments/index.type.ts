import { CSSProperties, Component } from 'vue'

export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'ppt' | 'folder' | 'other'

export interface UploadFile {
  uid: string
  name: string
  status?: string
  rawFile?: File
}

export interface CustomRequestOptions {
  file: File
  onProgress: (e: { percent: number }) => void
  onSuccess: (response: unknown) => void
  onError: (err: Error) => void
}

export interface OnChangeInfo {
  file: UploadFile
  fileList: UploadFile[]
  event?: unknown
}

export interface Attachment extends UploadFile {
  previewUrl?: string
  fileType?: FileType
  size?: number
  progress?: number
  isUploading?: boolean
  messageType?: 'error' | 'warning' | 'success' | 'info' | 'retry' | 'uploading' // 状态消息类型
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

export interface TinyUploadProps {
  // 基础属性
  action?: string // 上传地址
  accept?: string // 接受的文件类型
  multiple?: boolean // 是否支持多选
  disabled?: boolean // 是否禁用
  // 上传参数
  headers?: Record<string, unknown> // 设置上传的请求头部
  data?: Record<string, unknown> // 上传时附带的额外参数
  withCredentials?: boolean // 支持发送 cookie 凭证信息

  // 文件列表
  fileList?: UploadFile[] // 文件列表
  showFileList?: boolean // 是否显示文件列表

  // 上传控制
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  customRequest?: (options: CustomRequestOptions) => void

  // 事件
  onChange?: (info: OnChangeInfo) => void
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>
  onPreview?: (file: UploadFile) => void

  // 样式
  listType?: 'text' | 'picture' | 'picture-card'
}

// 占位符配置
export interface PlaceholderConfig {
  icon?: Component | string
  title?: string
  description?: string
  className?: string
}

export interface AttachmentsProps extends TinyUploadProps {
  // 核心属性
  items?: Attachment[]
  disabled?: boolean
  overflow?: 'wrap' | 'scrollX' | 'scrollY'

  // 拖拽配置
  drag?: boolean | DragConfig

  // 图标配置
  fileIcons?: Record<FileType, Component>

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

  // 上传触发器 - 用于外部触发上传
  triggerUpload?: number

  // 新增属性
  placeholder?: PlaceholderConfig | ((type: 'inline' | 'drop') => PlaceholderConfig)
  showUploadList?: boolean // 是否显示内置文件列表（默认 false）
  autoUpload?: boolean // 是否自动上传（默认 true）
  uploadMode?: 'auto' | 'manual' // 上传模式
  variant?: 'card' | 'picture' // 卡片展示模式
}

export interface AttachmentsEmits {
  (e: 'update:items', items: Attachment[]): void
  (e: 'files-dropped', files: Attachment[]): void
  (e: 'file-remove', file: Attachment): void
  (e: 'file-download', file: Attachment): void
  (e: 'file-preview', file: Attachment): void
  (e: 'file-retry', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}

// 文件卡片属性
export type FileCardProps = Pick<
  AttachmentsProps,
  'variant' | 'fileIcons' | 'disabled' | 'styles' | 'statusType' | 'customActions'
> & {
  file: Attachment
  showPreview?: boolean
  showStatus?: boolean
}

// AttachmentList 组件属性
export type AttachmentListProps = Pick<
  AttachmentsProps,
  'variant' | 'fileIcons' | 'disabled' | 'styles' | 'statusType' | 'customActions' | 'overflow'
> & {
  files: Attachment[]
}

// AttachmentList 组件事件
export interface AttachmentListEmits {
  (e: 'remove', file: Attachment): void
  (e: 'preview', file: Attachment): void
  (e: 'download', file: Attachment): void
  (e: 'retry', file: Attachment): void
  (e: 'action', payload: { action: ActionButton; file: Attachment }): void
}

// 自定义操作按钮类型
export interface ActionButton {
  type: string
  label: string
  handler?: (file: Attachment) => void
}
