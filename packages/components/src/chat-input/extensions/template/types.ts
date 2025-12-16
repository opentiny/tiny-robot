/**
 * Template 扩展类型定义
 */

import type { Ref } from 'vue'
import type { TemplateItem } from '../../index.type'
import '@tiptap/core'

// 重新导出 TemplateItem 以便外部使用
export type { TemplateItem }

/**
 * 选择器选项
 */
export interface SelectOption {
  /**
   * 显示文本
   */
  label: string

  /**
   * 选择后的值
   */
  value: string

  /**
   * 自定义数据（可选）
   */
  data?: string
}

/**
 * TemplateSelect 节点属性
 */
export interface TemplateSelectAttrs {
  /**
   * 唯一标识
   */
  id: string

  /**
   * 占位文字（未选择时显示）
   */
  placeholder: string

  /**
   * 选项列表
   */
  options: SelectOption[]

  /**
   * 当前选中的值（可选）
   */
  value?: string
}

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

// ===== 模块扩展声明 =====

/**
 * 扩展 Tiptap Commands 接口
 *
 * 使 TypeScript 能够识别自定义命令
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    template: {
      /**
       * 设置模板数据（批量）
       */
      setTemplateData: (items: TemplateItem[]) => ReturnType

      /**
       * 插入模板块
       */
      insertTemplate: (attrs: Partial<TemplateAttrs>) => ReturnType

      /**
       * 聚焦到第一个模板块
       */
      focusFirstTemplate: () => ReturnType

      /**
       * 插入选择器
       */
      insertTemplateSelect: (attrs: Partial<TemplateSelectAttrs>) => ReturnType
    }
  }
}
