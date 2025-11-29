/**
 * Mention 扩展类型定义
 */

/**
 * 提及项数据结构
 */
export interface MentionItem {
  /**
   * 唯一标识（必传）
   */
  id: string

  /**
   * 显示名称，如 "小小画家"（必传）
   */
  label: string

  /**
   * 预设内容（必传）
   */
  preset: string

  /**
   * 图标（可选）
   */
  icon?: string
}

/**
 * Mention 节点属性
 */
export interface MentionAttrs {
  id: string
  label: string
  preset?: string
}

/**
 * Mention 配置选项
 */
export interface MentionOptions {
  /**
   * 提及项列表
   */
  items: MentionItem[]

  /**
   * 触发字符，默认 '@'
   */
  char: string

  /**
   * 是否允许空格
   */
  allowSpaces: boolean

  /**
   * HTML 属性
   */
  HTMLAttributes: Record<string, unknown>
}

/**
 * Mention Suggestion 插件状态
 */
export interface MentionSuggestionState {
  /**
   * 是否激活
   */
  active: boolean

  /**
   * 触发范围
   */
  range: { from: number; to: number } | null

  /**
   * 查询文本
   */
  query: string

  /**
   * 过滤后的提及项列表
   */
  filteredItems: MentionItem[]
}
