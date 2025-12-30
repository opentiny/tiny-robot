/* eslint-disable */
/**
 * Sidebar Badge 插件
 *
 * 功能：从 markdown 文件的 frontmatter 中读取 badge，自动添加到 sidebar
 *
 * @example
 * ```ts
 * // config.mts
 * import { SidebarBadgePlugin } from './plugins/badge'
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [SidebarBadgePlugin({ debug: true })]
 *   }
 * })
 * ```
 */

import fs from 'fs'
import path from 'path'
import { withBadge } from './utils'

export interface SidebarBadgeOptions {
  /**
   * 源文件目录，默认为 'src'
   */
  srcDir?: string
  /**
   * 是否启用调试日志
   */
  debug?: boolean
}

export function SidebarBadgePlugin(options?: SidebarBadgeOptions): any {
  let vpConfig: any = null
  const { srcDir = 'src', debug = false } = options || {}
  let badgeCount = 0

  return {
    name: 'vitepress-sidebar-badge',

    async configResolved(config: any) {
      if (vpConfig) return

      vpConfig = config.vitepress
      if (!vpConfig) {
        console.warn('[SidebarBadge] VitePress config not found')
        return
      }

      try {
        const { default: matter } = await import('gray-matter')

        const sidebar = vpConfig.site.themeConfig.sidebar
        if (!sidebar) {
          console.warn('[SidebarBadge] No sidebar config found')
          return
        }

        badgeCount = processSidebar(sidebar, vpConfig.root || process.cwd(), srcDir, matter, debug)

        if (badgeCount > 0) {
          console.log(`✅ SidebarBadge: ${badgeCount} badge(s) applied`)
        } else if (debug) {
          console.log('ℹ️ SidebarBadge: No badges found')
        }
      } catch (error) {
        console.error('[SidebarBadge] Error:', error)
      }
    },
  }
}

/**
 * 处理 sidebar 配置
 */
function processSidebar(sidebar: any, rootDir: string, srcDir: string, matter: any, debug: boolean): number {
  let count = 0
  const processedItems = new Set<any>()

  if (Array.isArray(sidebar)) {
    count = processSidebarArray(sidebar, rootDir, srcDir, matter, debug, processedItems)
  } else if (typeof sidebar === 'object') {
    Object.keys(sidebar).forEach((key) => {
      const sidebarConfig = sidebar[key]
      if (Array.isArray(sidebarConfig)) {
        const dirName = key.replace(/^\//, '').replace(/\/$/, '')
        count += processSidebarArray(sidebarConfig, rootDir, srcDir, matter, debug, processedItems, dirName)
      }
    })
  }

  return count
}

/**
 * 处理 sidebar 数组
 */
function processSidebarArray(
  sidebarArray: any[],
  rootDir: string,
  srcDir: string,
  matter: any,
  debug: boolean,
  processedItems: Set<any>,
  dirName?: string,
): number {
  let count = 0

  sidebarArray.forEach((group) => {
    if (group.items && Array.isArray(group.items)) {
      const baseDir = group.base ? group.base.replace(/^\//, '').replace(/\/$/, '') : dirName

      group.items.forEach((item: any) => {
        if (item.link) {
          const badge = readBadgeFromFrontmatter(item.link, rootDir, srcDir, baseDir || '', matter, debug)
          if (badge && !processedItems.has(item)) {
            item.text = withBadge(item.text, badge)
            processedItems.add(item)
            count++
            if (debug) {
              console.log(`[SidebarBadge] ✓ ${item.link}: ${badge}`)
            }
          }
        }
      })
    }
  })

  return count
}

/**
 * 从 markdown frontmatter 读取 badge
 */
function readBadgeFromFrontmatter(
  link: string,
  rootDir: string,
  srcDir: string,
  baseDir: string,
  matter: any,
  debug: boolean,
): string | undefined {
  try {
    const filePath = path.join(rootDir, srcDir, baseDir, `${link}.md`)

    if (!fs.existsSync(filePath)) {
      return undefined
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(content)

    return data.badge as string | undefined
  } catch (error) {
    if (debug) {
      console.warn(`[SidebarBadge] ✗ ${link}: ${error}`)
    }
    return undefined
  }
}
