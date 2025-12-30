/**
 * Badge 相关常量配置
 */

/**
 * Badge 类型定义
 */
export type BadgeType = 'new' | 'deprecated' | 'beta' | 'alpha'

/**
 * Badge 值类型（包含固定类型和版本号字符串）
 */
export type BadgeValue = BadgeType | string

/**
 * Badge 类型到中文文本的映射
 */
export const BADGE_TEXT_MAP: Record<BadgeType, string> = {
  new: '新增',
  deprecated: '已废弃',
  beta: 'Beta',
  alpha: 'Alpha',
}

/**
 * Badge CSS 类名映射
 */
export const BADGE_CLASS_MAP: Record<BadgeType, string> = {
  new: 'version-badge version-badge--new',
  deprecated: 'version-badge version-badge--deprecated',
  beta: 'version-badge version-badge--beta',
  alpha: 'version-badge version-badge--alpha',
}

/**
 * 版本号正则表达式（支持 v0.4.0 或 0.4.0 格式）
 * 格式：\d+ - 至少一个数字开头
 *       (?:\.\d+)* - 零或多个 .数字 组合
 *       (?:[-+][a-zA-Z0-9.]+)? - 可选的预发布版本或构建元数据
 * 有效：1, 1.2, 1.2.3, v1.2.3-beta.1
 * 无效：..., 1.., .1., 1.
 */
export const VERSION_NUMBER_REGEX = /^v?\d+(?:\.\d+)*(?:[-+][a-zA-Z0-9.]+)?$/

/**
 * Markdown 中的版本标记正则表达式（用于 @new、@1.2.0 等）
 */
export const MARKDOWN_BADGE_REGEX = /@(new|deprecated|beta|alpha|\d+(?:\.\d+)*(?:[-+][a-zA-Z0-9.]+)?)/g
