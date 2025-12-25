/**
 * Badge 工具函数
 */

import type { BadgeType, BadgeValue } from './constants'
import { BADGE_TEXT_MAP, BADGE_CLASS_MAP, VERSION_NUMBER_REGEX } from './constants'

/**
 * 转义 HTML 特殊字符以防止 XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char])
}

/**
 * 判断是否为版本号
 */
export function isVersionNumber(badge: string): boolean {
  return VERSION_NUMBER_REGEX.test(badge)
}

/**
 * 获取 Badge 类型
 */
export function getBadgeType(badge: BadgeValue): BadgeType {
  return isVersionNumber(badge) ? 'new' : (badge as BadgeType)
}

/**
 * 获取 Badge 显示文本
 */
export function getBadgeText(badge: BadgeValue): string {
  if (isVersionNumber(badge)) {
    return badge
  }
  return BADGE_TEXT_MAP[badge as BadgeType] || badge
}

/**
 * 获取 Badge CSS 类名
 */
export function getBadgeClass(badge: BadgeValue): string {
  const badgeType = getBadgeType(badge)
  return BADGE_CLASS_MAP[badgeType] || BADGE_CLASS_MAP.new
}

/**
 * 创建 Badge HTML
 */
export function createBadgeHTML(badge: BadgeValue): string {
  const badgeText = escapeHtml(getBadgeText(badge))
  const badgeClass = getBadgeClass(badge)
  return `<span class="${badgeClass}">${badgeText}</span>`
}

/**
 * 为文本添加 Badge
 */
export function withBadge(text: string, badge: BadgeValue): string {
  const badgeHTML = createBadgeHTML(badge)
  return `${text} ${badgeHTML}`
}
