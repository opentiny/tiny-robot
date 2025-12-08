/**
 * Mention 扩展
 *
 * 提及功能，用于提及某项的场景（如 @用户、#标签 等）
 */

import type { Ref } from 'vue'
import { Mention } from './extension'
import type { MentionItem, MentionOptions } from './types'

// ===== 导出扩展类和工具 =====
export { Mention } from './extension'
export { MentionPluginKey } from './plugin'
export { mentionCommands } from './commands'
export * from './types'
export * from './utils'

// ===== 便捷函数 =====

/**
 * 创建 Mention 扩展的便捷函数
 *
 * @param items - 提及项列表
 * @param char - 触发字符，默认 '@'
 * @param options - 其他配置项
 *
 * @example
 * ```typescript
 * const extensions = [mention(items)]
 * const extensions = [mention(items, '#')]
 * const extensions = [mention(items, '@', { allowSpaces: true })]
 * ```
 */
export function mention(
  items: MentionItem[] | Ref<MentionItem[]>,
  char: string = '@',
  options?: Partial<Omit<MentionOptions, 'items' | 'char'>>,
) {
  return Mention.configure({
    items,
    char,
    ...options,
  })
}
