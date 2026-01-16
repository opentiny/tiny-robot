<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      自定义分组函数：按时间间隔分组，时间间隔超过 5 秒的消息分为不同组。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles" :group-strategy="customGroupStrategy"></tr-bubble-list>
  </div>
</template>

<script setup lang="ts">
import {
  BubbleListProps,
  BubbleMessage,
  BubbleMessageGroup,
  BubbleRoleConfig,
  TrBubbleList,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

// 示例消息，包含时间戳
const messages: (BubbleListProps['messages'][0] & { timestamp?: number })[] = [
  { role: 'user', content: '第一条消息', timestamp: 1000 },
  { role: 'user', content: '第二条消息（1秒后，同一组）', timestamp: 2000 },
  { role: 'ai', content: 'AI 回复', timestamp: 3000 },
  { role: 'user', content: '第三条消息（10秒后，新组）', timestamp: 14000 },
  { role: 'user', content: '第四条消息（1秒后，同一组）', timestamp: 15000 },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}

// 自定义分组函数：按时间间隔分组（超过 5 秒分为不同组）
const customGroupStrategy = (msgs: BubbleMessage[], _dividerRole?: string): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  const TIME_THRESHOLD = 5000

  for (const [index, message] of msgs.entries()) {
    const msgWithTimestamp = message as (typeof messages)[0]
    const lastGroup = groups[groups.length - 1]

    if (
      !lastGroup ||
      (msgWithTimestamp.timestamp &&
        lastGroup.messages.length > 0 &&
        (lastGroup.messages[lastGroup.messages.length - 1] as (typeof messages)[0]).timestamp &&
        msgWithTimestamp.timestamp -
          ((lastGroup.messages[lastGroup.messages.length - 1] as (typeof messages)[0]).timestamp || 0) >
          TIME_THRESHOLD)
    ) {
      groups.push({
        role: message.role || 'assistant',
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
    } else {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    }
  }

  return groups
}
</script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
