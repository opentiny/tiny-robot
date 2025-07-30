// 添加插件表单数据类型
export interface PluginFormData {
  /** 插件名称 */
  name: string
  /** 插件描述 */
  description: string
  /** 插件类型 */
  type: 'sse' | 'streamableHttp'
  /** 插件URL */
  url: string
  /** 插件请求头 */
  headers: string
  /** 插件缩略图 */
  thumbnail?: File | null
}

export type PluginCreationData = PluginFormData | string

export interface PluginModalProps {
  /** 是否显示 */
  show: boolean
  /** 弹窗标题 */
  title: string
  /** 添加方式 */
  defaultMode: 'form' | 'code'
}

// 添加插件弹窗 Emits
export interface PluginModalEmits {
  (e: 'confirm', type: 'form' | 'code', data: PluginCreationData): void
}
