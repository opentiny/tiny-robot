import type { VNode } from 'vue'

/**
 * Tooltip 内容类型
 * - string: 简单文本
 * - () => string | VNode: 渲染函数，支持复杂内容
 */
export type TooltipContent = string | (() => string | VNode)
