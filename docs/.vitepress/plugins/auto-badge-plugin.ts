/* eslint-disable */
import fs from 'fs'
import path from 'path'

interface AutoBadgeOptions {
  /**
   * 源文件目录，默认为 'src'
   */
  srcDir?: string
  /**
   * 是否启用调试日志
   */
  debug?: boolean
}

/**
 * VitePress 自动 Badge 插件
 *
 * 功能：
 * 1. 遍历现有的 sidebar 配置
 * 2. 从对应的 markdown 文件的 frontmatter 中读取 badge
 * 3. 自动为 sidebar 项添加徽章
 *
 * 优势：
 * - 保留手动配置的 sidebar 结构（顺序、分组）
 * - 只自动处理 badge，单一数据源
 * - 代码简单，易于理解和维护
 *
 * @example
 * ```ts
 * // config.mts
 * export default defineConfig({
 *   vite: {
 *     plugins: [AutoBadgePlugin({ debug: true })]
 *   },
 *   themeConfig: {
 *     sidebar: {
 *       '/components/': [{
 *         text: '组件',
 *         items: [
 *           { text: 'Container 容器', link: 'container' },  // 会自动读取 badge
 *           { text: 'Bubble 气泡', link: 'bubble' }
 *         ]
 *       }]
 *     }
 *   }
 * })
 * ```
 */
export function AutoBadgePlugin(options?: AutoBadgeOptions): any {
  let vpConfig: any = null
  const { srcDir = 'src', debug = false } = options || {}

  return {
    name: 'vitepress-auto-badge',

    async configResolved(config: any) {
      // 避免多次执行
      if (vpConfig) return

      vpConfig = config.vitepress
      if (!vpConfig) {
        console.warn('[AutoBadge] VitePress config not found')
        return
      }

      try {
        // 动态导入依赖
        const { default: matter } = await import('gray-matter')

        const sidebar = vpConfig.site.themeConfig.sidebar
        if (!sidebar) {
          console.warn('[AutoBadge] No sidebar config found')
          return
        }

        // 处理 sidebar 配置
        processSidebar(sidebar, vpConfig.root || process.cwd(), srcDir, matter, debug)

        console.log('✅ Auto Badge 已应用')
      } catch (error) {
        console.error('[AutoBadge] Error applying badges:', error)
      }
    },
  }
}

/**
 * 处理 sidebar 配置，为每个 item 添加 badge
 */
function processSidebar(sidebar: any, rootDir: string, srcDir: string, matter: any, debug: boolean): void {
  // sidebar 可能是对象或数组
  if (Array.isArray(sidebar)) {
    processSidebarArray(sidebar, rootDir, srcDir, matter, debug)
  } else if (typeof sidebar === 'object') {
    // 遍历每个路径的 sidebar 配置
    Object.keys(sidebar).forEach((key) => {
      const sidebarConfig = sidebar[key]
      if (Array.isArray(sidebarConfig)) {
        // 从 key 中提取目录名，如 '/components/' -> 'components'
        const dirName = key.replace(/^\//, '').replace(/\/$/, '')
        processSidebarArray(sidebarConfig, rootDir, srcDir, matter, debug, dirName)
      }
    })
  }
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
  dirName?: string,
): void {
  sidebarArray.forEach((group) => {
    if (group.items && Array.isArray(group.items)) {
      // 使用 group.base 或传入的 dirName 来确定目录
      const baseDir = group.base ? group.base.replace(/^\//, '').replace(/\/$/, '') : dirName

      group.items.forEach((item: any) => {
        if (item.link) {
          const badge = readBadgeFromMarkdown(item.link, rootDir, srcDir, baseDir || '', matter, debug)
          if (badge && !item.text.includes('version-badge')) {
            item.text = withBadge(item.text, badge)
            if (debug) {
              console.log(`[AutoBadge] ✓ ${item.link}: ${badge}`)
            }
          }
        }
      })
    }
  })
}

/**
 * 从 markdown 文件读取 badge
 */
function readBadgeFromMarkdown(
  link: string,
  rootDir: string,
  srcDir: string,
  baseDir: string,
  matter: any,
  debug: boolean,
): string | undefined {
  try {
    // 构建文件路径
    const filePath = path.join(rootDir, srcDir, baseDir, `${link}.md`)

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return undefined
    }

    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf-8')

    // 解析 frontmatter
    const { data } = matter(content)

    // 返回 badge 字段
    return data.badge as string | undefined
  } catch (error) {
    if (debug) {
      console.warn(`[AutoBadge] ✗ ${link}: ${error}`)
    }
    return undefined
  }
}

/**
 * 为文本添加版本徽章
 */
function withBadge(text: string, badge: string): string {
  const badgeTypeMap: Record<string, string> = {
    new: '新增',
    deprecated: '已废弃',
    beta: 'Beta',
    alpha: 'Alpha',
  }

  // 支持 v0.4.0 或 0.4.0 格式
  const isVersionNumber = /^v?[\d.]+/.test(badge)
  const badgeType = isVersionNumber ? 'new' : badge
  const badgeText = isVersionNumber ? badge : badgeTypeMap[badgeType] || badge

  return `${text} <span class="version-badge version-badge--${badgeType}">${badgeText}</span>`
}
