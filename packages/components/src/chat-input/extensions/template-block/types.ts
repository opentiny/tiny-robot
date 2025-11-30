/**
 * TemplateBlock 扩展类型定义
 */

import type { Ref } from 'vue'
import type { TemplateItem } from '../../index.type'

/**
 * TemplateBlock 节点属性
 */
export interface TemplateBlockAttrs {
  /**
   * 模板块 ID
   */
  id: string

  /**
   * 模板块内容
   */
  content: string
}

/**
 * TemplateBlock 配置选项
 */
export interface TemplateBlockOptions {
  /**
   * 模板数据列表（推荐使用 ref 实现响应式）
   *
   * 支持两种配置方式：
   * 1. 传入 ref（推荐）：自动双向绑定，解决时序问题
   * 2. 传入数组：仅用于静态初始化
   *
   * @example 响应式配置（推荐）
   * ```typescript
   * const items = ref<TemplateItem[]>([
   *   { type: 'text', content: '帮我分析' },
   *   { type: 'template', content: '' }
   * ])
   * TemplateBlock.configure({ items })  // 传入 ref，自动双向绑定
   * ```
   *
   * @example 静态配置
   * ```typescript
   * TemplateBlock.configure({
   *   items: [
   *     { type: 'text', content: '帮我分析' },
   *     { type: 'template', content: '' }
   *   ]
   * })
   * ```
   */
  items?: TemplateItem[] | Ref<TemplateItem[], TemplateItem[]>

  /**
   * HTML 属性
   */
  HTMLAttributes?: Record<string, unknown>
}
