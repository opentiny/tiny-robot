/* eslint-disable */
/**
 * Markdown Badge 插件
 *
 * 功能：在 markdown 内容中支持 @new、@deprecated、@1.2.0 等版本标记语法
 *
 * @example
 * ```markdown
 * | 属性名 | 说明 | 类型 |
 * | ------ | ---- | ---- |
 * | count @new | 数量 | number |
 * | oldProp @deprecated | 旧属性 | string |
 * | version @1.2.0 | 版本 | string |
 * ```
 *
 * @example
 * ```ts
 * // config.mts
 * import { MarkdownBadgePlugin } from './plugins/badge'
 *
 * export default defineConfig({
 *   markdown: {
 *     config: (md) => {
 *       md.use(MarkdownBadgePlugin)
 *     }
 *   }
 * })
 * ```
 */

import { MARKDOWN_BADGE_REGEX } from './constants'
import { createBadgeHTML } from './utils'

export function MarkdownBadgePlugin(md: any): void {
  const defaultRender = md.renderer.rules.text

  md.renderer.rules.text = (tokens: any, idx: any, options: any, env: any, self: any) => {
    const token = tokens[idx]
    let content = token.content

    // 检查是否包含版本标记
    if (MARKDOWN_BADGE_REGEX.test(content)) {
      MARKDOWN_BADGE_REGEX.lastIndex = 0
      content = content.replace(MARKDOWN_BADGE_REGEX, (_: any, badge: any) => {
        return createBadgeHTML(badge)
      })

      return content
    }

    return defaultRender ? defaultRender(tokens, idx, options, env, self) : content
  }
}
