/**
 * 侧边栏版本徽章辅助函数
 * 用于在 VitePress 侧边栏配置中添加版本标记
 */

type BadgeType = 'new' | 'deprecated' | 'beta' | 'alpha'

/**
 * 为侧边栏项添加版本徽章
 * @param text 侧边栏项的文本
 * @param badge 徽章类型或版本号
 * @returns 带有 HTML 徽章的文本
 *
 * @example
 * // 添加"新增"徽章
 * withBadge('Sender 消息输入框', 'new')
 *
 * @example
 * // 添加版本号徽章
 * withBadge('某功能', '1.2.0')
 *
 * @example
 * // 在侧边栏配置中使用
 * { text: withBadge('Sender 消息输入框', 'new'), link: 'sender' }
 */
export function withBadge(text: string, badge: BadgeType | string): string {
  const badgeTypeMap: Record<BadgeType, string> = {
    new: '新增',
    deprecated: '已废弃',
    beta: 'Beta',
    alpha: 'Alpha',
  }

  const isVersionNumber = /^[\d.]+/.test(badge)
  const badgeType = isVersionNumber ? 'new' : (badge as BadgeType)
  const badgeText = isVersionNumber ? badge : badgeTypeMap[badgeType]

  return `${text} <span class="version-badge version-badge--${badgeType}">${badgeText}</span>`
}

/**
 * 批量创建侧边栏项
 * @param items 侧边栏项数组
 * @returns 带有版本徽章的侧边栏项
 *
 * @example
 * createSidebarItems([
 *   { text: 'Sender', badge: 'new', link: 'sender' },
 *   { text: 'OldApi', badge: 'deprecated', link: 'old-api' }
 * ])
 */
export function createSidebarItems(
  items: Array<{
    text: string
    link: string
    badge?: BadgeType | string
  }>,
) {
  return items.map(({ text, link, badge }) => ({
    text: badge ? withBadge(text, badge) : text,
    link,
  }))
}
