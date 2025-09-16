/**
 * 路由工具函数
 * 用于处理 VitePress 在不同部署环境下的路由问题
 */

/**
 * 标准化链接，确保包含正确的 base 路径
 * @param link 原始链接
 * @param base 基础路径
 * @returns 标准化后的链接
 */
export function normalizeLink(link: string, base: string = '/'): string {
  // 如果链接已经是完整路径，直接返回
  if (link.startsWith('http') || link.startsWith('//')) {
    return link
  }

  // 如果 base 是根路径，直接返回原链接
  if (base === '/') {
    return link
  }

  // 确保链接以 / 开头
  const normalizedLink = link.startsWith('/') ? link : `/${link}`

  // 如果链接已经包含 base 路径，直接返回
  if (normalizedLink.startsWith(base)) {
    return normalizedLink
  }

  // 组合 base 路径和链接
  const cleanBase = base.replace(/\/$/, '')
  return `${cleanBase}${normalizedLink}`
}

/**
 * 检查当前路径是否匹配给定的路由规则
 * @param currentPath 当前路径
 * @param targetPath 目标路径
 * @param activeMatch 激活匹配规则（正则表达式字符串）
 * @param base 基础路径
 * @returns 是否匹配
 */
export function isActiveRoute(
  currentPath: string,
  targetPath: string,
  activeMatch?: string,
  base: string = '/',
): boolean {
  // 移除 base 路径进行比较
  const cleanCurrentPath = base !== '/' ? currentPath.replace(base.replace(/\/$/, ''), '') : currentPath
  const cleanTargetPath = base !== '/' ? targetPath.replace(base.replace(/\/$/, ''), '') : targetPath

  if (activeMatch) {
    return new RegExp(activeMatch).test(cleanCurrentPath)
  }

  return cleanCurrentPath.startsWith(cleanTargetPath)
}
/**
 * 检查当前路径是否为首页
 * @param currentPath 当前路径
 * @param base 基础路径
 * @returns 是否为首页
 */
export function isHomePage(currentPath: string, base: string = '/'): boolean {
  // 标准化 base 路径
  const normalizedBase = base === '/' ? '/' : base.replace(/\/$/, '') + '/'

  // 可能的首页路径
  const homePaths = [
    '/', // 根路径
    normalizedBase, // 带 base 的完整路径 (如 /tiny-robot/alpha/)
    normalizedBase.replace(/\/$/, ''), // 不带尾部斜杠的路径 (如 /tiny-robot/alpha)
  ]

  return homePaths.includes(currentPath)
}
