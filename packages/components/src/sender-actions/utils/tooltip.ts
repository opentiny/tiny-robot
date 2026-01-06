import type { TooltipContent } from '../types/tooltip'

/**
 * 将 TooltipContent 转换为 TinyTooltip 的 render-content 函数
 */
export function normalizeTooltipContent(tooltip: TooltipContent | undefined) {
  if (!tooltip) return undefined

  if (typeof tooltip === 'string') {
    return () => tooltip
  }

  return tooltip
}
