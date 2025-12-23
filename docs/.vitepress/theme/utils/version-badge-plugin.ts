/* eslint-disable */
/*
 * markdown-it 插件：支持版本标记语法
 *
 * 语法示例：
 * - `@new` - 新增标记
 * - `@deprecated` - 废弃标记
 * - `@beta` - Beta 标记
 * - `@alpha` - Alpha 标记
 * - `@1.2.0` - 自定义版本号标记
 *
 * 使用示例：
 * | 属性名 | 说明 | 类型 |
 * | ------ | ---- | ---- |
 * | count @new | 数量 | number |
 * | oldProp @deprecated | 旧属性 | string |
 */

const VERSION_BADGE_RE = /@(new|deprecated|beta|alpha|[\d.]+(?:[-+][a-zA-Z0-9.]+)?)/g

const BADGE_CLASSES: Record<string, string> = {
  new: 'version-badge version-badge--new',
  deprecated: 'version-badge version-badge--deprecated',
  beta: 'version-badge version-badge--beta',
  alpha: 'version-badge version-badge--alpha',
}

const BADGE_TEXT: Record<string, string> = {
  new: 'Added',
  deprecated: 'Deprecated',
  beta: 'Beta',
  alpha: 'Alpha',
}

function createBadgeHTML(version: string): string {
  const isVersionNumber = /^[\d.]+/.test(version)
  const badgeType = isVersionNumber ? 'new' : version
  const badgeText = isVersionNumber ? version : BADGE_TEXT[badgeType] || badgeType
  const badgeClass = BADGE_CLASSES[badgeType] || BADGE_CLASSES.new

  return `<span class="${badgeClass}">${badgeText}</span>`
}

export function versionBadgePlugin(md: any) {
  // 保存原始渲染规则
  const defaultRender = md.renderer.rules.text

  // 重写 text 渲染规则
  md.renderer.rules.text = (tokens: any, idx: any, options: any, env: any, self: any) => {
    const token = tokens[idx]
    let content = token.content

    // 如果包含版本标记，进行替换
    if (VERSION_BADGE_RE.test(content)) {
      VERSION_BADGE_RE.lastIndex = 0
      content = content.replace(VERSION_BADGE_RE, (_: any, version: any) => {
        return createBadgeHTML(version)
      })

      // 返回替换后的 HTML
      return content
    }

    // 否则使用默认渲染
    return defaultRender ? defaultRender(tokens, idx, options, env, self) : content
  }
}
