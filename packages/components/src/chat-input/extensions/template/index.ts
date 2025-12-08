/**
 * Template 扩展
 *
 * 模板块节点，用于模板填充功能
 */

import type { Ref } from 'vue'
import { Template } from './extension'
import type { TemplateItem, TemplateOptions } from './types'

// ===== 导出扩展类和工具 =====
export { Template } from './extension'
export { templateCommands } from './commands'
export * from './types'
export { getTextWithTemplates, getTemplateStructuredData } from './utils'

// ===== 便捷函数 =====

/**
 * 创建 Template 扩展的便捷函数
 *
 * @param items - 模板项列表
 * @param options - 其他配置项
 *
 * @example
 * ```typescript
 * const extensions = [template(templates)]
 * const extensions = [template(templates, { HTMLAttributes: { class: 'custom' } })]
 * ```
 */
export function template(
  items: TemplateItem[] | Ref<TemplateItem[]>,
  options?: Partial<Omit<TemplateOptions, 'items'>>,
) {
  return Template.configure({
    items,
    ...options,
  })
}
