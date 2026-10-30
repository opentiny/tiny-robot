import type { BubbleListProps, BubbleMessage, BubbleMessageGroup, BubbleRoleConfig } from './index.type'

/**
 * 判断一个 role 是否是 hidden
 */
const isRoleHidden = (role: string | undefined, roleConfigs?: Record<string, BubbleRoleConfig>): boolean => {
  if (!role) {
    return false
  }
  return Boolean(roleConfigs?.[role]?.hidden)
}

/**
 * 按角色分组
 * - 连续相同角色的消息会被合并到一组
 * - hidden 的消息需要单独分组，连续的 hidden 可以同一组
 */
const groupByRole = (
  messages: BubbleMessage[],
  roleConfigs?: Record<string, BubbleRoleConfig>,
): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let isLastGroupHidden = false

  for (const [index, message] of messages.entries()) {
    const lastGroup = groups[groups.length - 1]
    const messageRole = message.role || ''
    const isMessageHidden = isRoleHidden(message.role, roleConfigs)

    // 满足以下条件之一则添加到上一组：
    // 1. 连续的 hidden 消息（不管角色是否相同）
    // 2. 角色相同且 hidden 状态相同
    if (
      lastGroup &&
      ((isLastGroupHidden && isMessageHidden) ||
        (lastGroup.role === messageRole && isLastGroupHidden === isMessageHidden))
    ) {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    } else {
      // 创建新的分组
      groups.push({
        role: messageRole,
        messages: [message],
        messageIndexes: [index],
      })
    }
    // 创建新组后统一更新 hidden 状态
    isLastGroupHidden = isMessageHidden
  }

  return groups
}

/**
 * 按分割角色分组
 * - 分割角色消息每条单独分组
 * - 非分割角色消息会被分到一组，直到遇到下一个分割角色消息
 * - hidden 的消息需要单独分组，连续的 hidden 可以同一组
 */
const groupByDivider = (
  messages: BubbleMessage[],
  dividerRole: string,
  roleConfigs?: Record<string, BubbleRoleConfig>,
): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let isLastGroupHidden = false

  for (const [index, message] of messages.entries()) {
    const lastGroup = groups[groups.length - 1]
    const isDivider = message.role === dividerRole
    const messageRole = message.role || ''
    const isMessageHidden = isRoleHidden(message.role, roleConfigs)

    // 满足以下条件之一则添加到上一组：
    // 1. 连续的 hidden 消息（不管分割/非分割类型是否相同）
    // 2. 分割/非分割类型相同且 hidden 状态相同
    if (
      lastGroup &&
      // divider 消息（分割角色）永远不与任何组进行合并
      !isDivider &&
      // divider 组（分割角色）不允许被追加消息，确保 divider 组永远只有 1 条 message
      lastGroup.role !== dividerRole &&
      // hidden / 非 hidden 分组隔离
      isLastGroupHidden === isMessageHidden
    ) {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    } else {
      // 创建新的分组
      groups.push({
        role: isDivider ? dividerRole : messageRole,
        messages: [message],
        messageIndexes: [index],
      })
    }
    // 创建新组后统一更新 hidden 状态
    isLastGroupHidden = isMessageHidden
  }

  return groups
}

/**
 * 根据分组策略计算消息分组
 */
export function getBubbleMessageGroups(
  messages: BubbleMessage[],
  groupStrategy: BubbleListProps['groupStrategy'] = 'divider',
  dividerRole = 'user',
  roleConfigs?: Record<string, BubbleRoleConfig>,
): BubbleMessageGroup[] {
  if (messages.length === 0) {
    return []
  }

  // 如果是自定义函数，直接调用
  if (typeof groupStrategy === 'function') {
    return groupStrategy(messages, dividerRole)
  }

  // 使用预定义策略
  if (groupStrategy === 'consecutive') {
    return groupByRole(messages, roleConfigs)
  }

  return groupByDivider(messages, dividerRole, roleConfigs)
}
