/**
 * Template 扩展类型定义
 */

import type { Ref } from 'vue'
import type { TemplateItem } from '../../index.type'

/**
 * Template 节点属性
 */
export interface TemplateAttrs {
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
 * Template 配置选项
 */
export interface TemplateOptions {
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
   * Template.configure({ items })  // 传入 ref，自动双向绑定
   * ```
   *
   * @example 静态配置
   * ```typescript
   * Template.configure({
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
