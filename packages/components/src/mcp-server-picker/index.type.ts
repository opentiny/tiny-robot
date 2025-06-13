export interface PluginTool {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface PluginInfo {
  id: string
  name: string
  icon: string
  description: string
  toolCount?: number
  enabled?: boolean
  expanded?: boolean
  tools?: PluginTool[]
  added?: boolean
}

export type PluginCardMode = 'installed' | 'market'

export interface PluginCardProps {
  plugin: PluginInfo
  mode?: PluginCardMode
  expandable?: boolean
  expanded?: boolean
  showToolCount?: boolean
  enableParentChildSync?: boolean
}

export interface PluginCardEmits {
  (e: 'update:expanded', value: boolean): void
  (e: 'toggle-expand'): void
  (e: 'toggle-plugin', enabled: boolean): void
  (e: 'toggle-tool', toolId: string, enabled: boolean): void
  (e: 'add-plugin', added: boolean): void
  (e: 'delete-plugin'): void
}

// 组件的Props
export interface McpServerPickerProps {
  // 数据源
  installedPlugins?: PluginInfo[]
  marketPlugins?: PluginInfo[]

  // 搜索相关
  searchPlaceholder?: string
  enableSearch?: boolean

  // 面板控制
  defaultActiveTab?: 'installed' | 'market'
  showInstalledTab?: boolean
  showMarketTab?: boolean
  // 整体面板显示控制
  visible?: boolean

  // 标签名称
  installedTabTitle?: string
  marketTabTitle?: string

  // 头部配置
  title?: string
  showCustomAddButton?: boolean
  customAddButtonText?: string

  // 行为控制
  allowPluginToggle?: boolean
  allowToolToggle?: boolean
  allowPluginDelete?: boolean
  allowPluginAdd?: boolean
  // 是否启用父子级联动
  enableParentChildSync?: boolean

  // 加载状态
  loading?: boolean
  marketLoading?: boolean
}

// 创建插件弹窗数据类型
export interface CreatePluginData {
  aiPlugin: string
  openapi: string
}

// 创建插件弹窗 Props
export interface CreatePluginDialogProps {
  visible: boolean
  title?: string
}

// 创建插件弹窗 Emits
export interface CreatePluginDialogEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: CreatePluginData): void
  (e: 'cancel'): void
}

// MCP Server Picker 组件的Emits
export interface McpServerPickerEmits {
  // 搜索事件
  (e: 'search', query: string, tab: 'installed' | 'market'): void

  // Tab切换事件
  (e: 'tab-change', activeTab: 'installed' | 'market'): void

  // 插件操作事件
  (e: 'plugin-toggle', plugin: PluginInfo, enabled: boolean): void
  (e: 'plugin-delete', plugin: PluginInfo): void
  (e: 'plugin-add', plugin: PluginInfo, added: boolean): void
  (e: 'plugin-expand', plugin: PluginInfo, expanded: boolean): void

  // 工具操作事件
  (e: 'tool-toggle', plugin: PluginInfo, toolId: string, enabled: boolean): void

  // 自定义添加按钮事件
  (e: 'custom-add'): void

  // 创建插件事件
  (e: 'plugin-create', data: CreatePluginData): void

  // 刷新事件
  (e: 'refresh', tab: 'installed' | 'market'): void

  // 激活插件数量变化事件
  (e: 'active-count-change', count: number): void
}
