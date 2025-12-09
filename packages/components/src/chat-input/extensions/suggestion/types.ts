/**
 * Suggestion 插件类型定义
 *
 * 包含建议项、高亮、插件配置和状态等类型定义
 */

/**
 * 高亮文本片段
 */
export interface SuggestionTextPart {
  text: string
  isMatch: boolean
}

/**
 * 高亮函数类型
 *
 * @param suggestionText - 建议项文本
 * @param inputText - 用户输入文本
 * @returns 包含文本片段和匹配状态的数组
 */
export type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

/**
 * 建议项类型
 *
 * @example
 * ```typescript
 * // 自动匹配
 * { content: 'ECS-云服务器' }
 *
 * // 精确指定高亮
 * {
 *   content: 'ECS-云服务器',
 *   highlights: ['ECS', '云服务器']
 * }
 *
 * // 自定义高亮函数
 * {
 *   content: 'ECS-云服务器',
 *   highlights: (text, query) => [
 *     { text: 'ECS', isMatch: true },
 *     { text: '-云服务器', isMatch: false }
 *   ]
 * }
 * ```
 */
export interface SuggestionItem {
  /**
   * 建议项内容（必填）
   */
  content: string

  /**
   * 显示标签（可选）
   *
   * 默认使用 content
   */
  label?: string

  /**
   * 高亮方式（可选）
   *
   * - undefined: 自动匹配（默认）
   * - string[]: 精确指定高亮片段
   * - function: 自定义高亮逻辑
   */
  highlights?: string[] | HighlightFunction

  /**
   * 自定义数据（可选）
   *
   * 用于扩展功能
   */
  data?: Record<string, unknown>
}

/**
 * 插件状态
 *
 * 管理建议列表的显示、过滤、选中等状态
 */
export interface SuggestionState {
  /**
   * 是否激活（有匹配的建议项）
   */
  active: boolean

  /**
   * 匹配范围
   *
   * 全局模式：整个文档范围
   * 字符模式：触发字符到光标的范围
   */
  range: { from: number; to: number } | null

  /**
   * 查询文本
   *
   * 全局模式：整个输入内容
   * 字符模式：触发字符后的文本
   */
  query: string

  /**
   * 过滤后的建议项
   */
  filteredSuggestions: SuggestionItem[]

  /**
   * 当前选中的建议项索引
   *
   * -1 表示未选中
   */
  selectedIndex: number

  /**
   * 自动补全文本
   *
   * 选中项的剩余部分
   */
  autoCompleteText: string

  /**
   * 是否显示 Tab 提示
   */
  showTabIndicator: boolean
}

import type { Ref } from 'vue'

/**
 * 插件配置选项
 */
export interface SuggestionOptions {
  /**
   * 建议项列表（必填）
   *
   * @example
   * ```typescript
   * const items = ref([
   *   { content: 'ECS-云服务器' },
   *   { content: 'RDS-数据库' }
   * ])
   * ```
   */
  items?: SuggestionItem[] | Ref<SuggestionItem[]>

  /**
   * 自定义过滤函数（可选）
   *
   * - 不传：不过滤，直接显示所有项
   * - 传入：使用自定义过滤逻辑
   *
   * @default undefined（不过滤）
   *
   * @example 模糊匹配过滤
   * ```typescript
   * filterFn: (items, query) => {
   *   return items.filter(item =>
   *     item.content.toLowerCase().includes(query.toLowerCase())
   *   )
   * }
   * ```
   *
   * @example 前缀匹配过滤
   * ```typescript
   * filterFn: (items, query) => {
   *   return items.filter(item =>
   *     item.content.toLowerCase().startsWith(query.toLowerCase())
   *   )
   * }
   * ```
   */
  filterFn?: (suggestions: SuggestionItem[], query: string) => SuggestionItem[]

  /**
   * 激活建议项的按键
   *
   * @default ['Enter', 'Tab']
   */
  activeSuggestionKeys?: string[]

  /**
   * 弹窗宽度
   *
   * @default 400
   */
  popupWidth?: number | string

  /**
   * 是否显示自动补全提示
   *
   * @default true
   */
  showAutoComplete?: boolean

  /**
   * 选中建议项的回调
   */
  onSelect?: (item: SuggestionItem) => void | Promise<void>
}

/**
 * 插件 Key 类型
 *
 * 用于访问插件状态
 */
export interface SuggestionPluginKeyType {
  getState: (state: EditorState) => SuggestionState | undefined
}

/**
 * EditorState 类型（来自 @tiptap/pm/state）
 */
export interface EditorState {
  doc: unknown
  selection: unknown
  storedMarks: unknown
  schema: unknown
  [key: string]: unknown
}
