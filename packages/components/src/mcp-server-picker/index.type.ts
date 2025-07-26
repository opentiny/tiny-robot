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
  enabled: boolean
  tools: PluginTool[]
  added?: boolean
  category?: string
}

export type PluginCardMode = 'installed' | 'market'

export interface PluginCardProps {
  plugin: PluginInfo
  mode?: PluginCardMode
  showToolCount?: boolean
}

export interface PluginCardEmits {
  (e: 'toggle-plugin', enabled: boolean): void
  (e: 'toggle-tool', toolId: string, enabled: boolean): void
  (e: 'add-plugin', added: boolean): void
  (e: 'delete-plugin'): void
}

// 市场分类选项类型
export interface MarketCategoryOption {
  value: string
  label: string
}

// 弹出配置类型
export interface PopupConfig {
  type: 'fixed' | 'drawer'
  // fixed模式配置
  position?: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
  }
  // drawer模式配置
  drawer?: {
    direction: 'left' | 'right'
  }
}

// 添加插件表单数据类型
export interface PluginFormData {
  name: string
  description: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers: string
  thumbnail?: File | null
}

export type PluginCreationData = PluginFormData | string

// 添加插件弹窗 Emits
export interface PluginModalEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', type: 'form' | 'code', data: PluginCreationData): void
}

// MCP Server Picker 组件的Props
export interface McpServerPickerProps {
  // 数据源
  installedPlugins?: PluginInfo[]
  marketPlugins?: PluginInfo[]

  // 搜索相关
  searchPlaceholder?: string
  enableSearch?: boolean

  // 市场分类筛选
  marketCategoryOptions?: MarketCategoryOption[]
  marketCategoryPlaceholder?: string
  enableMarketCategoryFilter?: boolean

  // 面板控制
  defaultActiveTab?: 'installed' | 'market'
  showInstalledTab?: boolean
  showMarketTab?: boolean
  // 整体面板显示控制
  visible?: boolean

  // 弹出配置 - 统一配置对象
  popupConfig?: PopupConfig

  // 激活数量控制（支持 v-model:activeCount）
  activeCount?: number

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

  // 加载状态
  loading?: boolean
  marketLoading?: boolean
}

// MCP Server Picker 组件的Emits
export interface McpServerPickerEmits {
  // 搜索事件
  (e: 'search', query: string, tab: 'installed' | 'market'): void

  // 市场分类筛选事件
  (e: 'market-category-change', category: string): void

  // Tab切换事件
  (e: 'tab-change', activeTab: 'installed' | 'market'): void

  // 插件操作事件
  (e: 'plugin-toggle', plugin: PluginInfo, enabled: boolean): void
  (e: 'plugin-delete', plugin: PluginInfo): void
  (e: 'plugin-add', plugin: PluginInfo, added: boolean): void
  (e: 'plugin-create', type: 'form' | 'code', data: PluginCreationData): void

  // 工具操作事件
  (e: 'tool-toggle', plugin: PluginInfo, toolId: string, enabled: boolean): void

  // 刷新事件
  (e: 'refresh', tab: 'installed' | 'market'): void

  // 激活插件数量变化事件
  (e: 'update:activeCount', count: number): void

  // 面板显示控制
  (e: 'update:visible', visible: boolean): void
}
