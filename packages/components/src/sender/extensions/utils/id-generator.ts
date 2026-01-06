/**
 * 生成唯一 ID
 *
 * 用于所有扩展生成唯一标识符
 */

/**
 * 生成唯一 ID
 *
 * @param prefix - ID 前缀
 * @returns 唯一 ID 字符串
 *
 * @example
 * generateId('mention') // mention_1701234567890_abc123def
 * generateId('template') // template_1701234567890_xyz789uvw
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
