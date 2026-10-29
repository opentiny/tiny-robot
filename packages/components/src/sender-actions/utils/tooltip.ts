import { h, isVNode, type VNode } from 'vue'
import type { TooltipContent } from '../types/tooltip'

const TOOLTIP_INNER_CLASS = 'tr-sender-tooltip-inner'

function hasTooltipInnerClass(value: unknown): boolean {
  if (!value) return false

  if (typeof value === 'string') {
    return value.split(/\s+/).includes(TOOLTIP_INNER_CLASS)
  }

  if (Array.isArray(value)) {
    return value.some(hasTooltipInnerClass)
  }

  if (typeof value === 'object') {
    return Boolean((value as Record<string, unknown>)[TOOLTIP_INNER_CLASS])
  }

  return false
}

function renderTooltipInner(content: string | VNode) {
  if (isVNode(content) && hasTooltipInnerClass(content.props?.class)) {
    return content
  }

  return h('div', { class: TOOLTIP_INNER_CLASS }, content)
}

/**
 * 将 TooltipContent 转换为 TinyTooltip 的 render-content 函数
 */
export function normalizeTooltipContent(tooltip: TooltipContent | undefined) {
  if (!tooltip) return undefined

  if (typeof tooltip === 'string') {
    return () => renderTooltipInner(tooltip)
  }

  return () => renderTooltipInner(tooltip())
}
