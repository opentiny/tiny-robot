import { VNode } from 'vue'

/**
 * 分类定义
 */
export interface Category {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  label: string
  /** 可选图标 */
  icon?: VNode
  /** 该分类下的指令项 */
  items: SuggestionItem[]
}

/**
 * 指令项定义
 */
export interface SuggestionItem {
  /** 唯一标识 */
  id: string
  /** 显示文本 */
  text: string
  /** 指令值 */
  value: string
  /** 图标 */
  icon?: VNode
  /** 关键词，用于搜索和过滤 */
  keywords?: string[]
  /** 描述文本 */
  description?: string
  /** 指令模板，用于在输入框中显示可编辑的模板 */
  template?: string
}

/**
 * 触发位置信息
 */
export interface TriggerContext {
  /** 触发的文本 */
  text: string
  /** 触发的位置 */
  position: number
}

/**
 * 组件属性
 */
export interface SuggestionProps {
  /** 触发快捷键列表 */
  triggerKeys?: string[]
  /** 指令项列表 */
  items: SuggestionItem[]
  /** 分类列表 */
  categories?: Category[]
  /** 是否显示面板 (支持v-model) */
  open?: boolean
  /** 自定义类名 */
  className?: string
  /** 主题，light或dark */
  theme?: 'light' | 'dark'
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否点击外部关闭面板 */
  closeOnOutsideClick?: boolean
  /** 面板标题 */
  title?: string
  /** 最大显示条目数 */
  maxVisibleItems?: number
  /** 默认是否展开完整指令列表 */
  defaultExpanded?: boolean
}

/** 触发信息类型 */
export type TriggerInfo = TriggerContext | false

/** 触发处理函数类型 */
export type TriggerHandler = (info: TriggerInfo) => void

/**
 * 组件事件
 */
export interface SuggestionEmits {
  /** 双向绑定打开状态 (v-model) */
  (e: 'update:open', value: boolean): void
  /** 选中指令项 */
  (e: 'select', value: string, context?: TriggerContext): void
  /** 关闭面板 */
  (e: 'close'): void
  /** 触发回调 */
  (e: 'trigger', handler: TriggerHandler): void
  /** 选择分类 */
  (e: 'category-select', category: Category): void
  /** 点击胶囊指令 */
  (e: 'suggestion-select', item: SuggestionItem): void
  /** 展开/收起状态变化 */
  (e: 'update:expanded', expanded: boolean): void
  /** 填充模板到输入框 */
  (e: 'fill-template', template: string): void
}
