/**
 * 位置查找工具函数
 *
 * 用于 mention 和 suggestion 扩展查找触发字符位置
 */

import type { Selection } from '@tiptap/pm/state'

/**
 * 查找触发字符的位置和查询文本
 *
 * 用于 mention 和 suggestion 扩展
 *
 * @param selection - 当前光标位置
 * @param char - 触发字符
 * @param allowSpaces - 是否允许空格
 * @returns 触发范围和查询文本，未找到返回 null
 *
 * @example
 * const result = findTextRange(selection, '@', false)
 * if (result) {
 *   console.log(result.range) // { from: 10, to: 20 }
 *   console.log(result.query) // 'user'
 * }
 */
export function findTextRange(
  selection: Selection,
  char: string,
  allowSpaces: boolean = false,
): { range: { from: number; to: number }; query: string } | null {
  const { $from } = selection

  // 光标不在文本节点或选区不为空时，不触发
  if (!selection.empty || !$from.parent.isTextblock) {
    return null
  }

  // 获取光标前的文本内容（从当前文本块开始到光标位置）
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')

  // 查找最后一个触发字符的位置
  const lastCharIndex = textBefore.lastIndexOf(char)

  // 未找到触发字符
  if (lastCharIndex === -1) {
    return null
  }

  // 提取查询文本（触发字符之后的内容）
  const query = textBefore.slice(lastCharIndex + char.length)

  // 如果不允许空格且查询包含空格，则不触发
  if (!allowSpaces && query.includes(' ')) {
    return null
  }

  // 计算绝对位置范围
  const from = $from.start() + lastCharIndex
  const to = $from.pos

  return {
    range: { from, to },
    query,
  }
}
