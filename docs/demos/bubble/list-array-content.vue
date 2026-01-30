<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      当 message.role === 'user' 且 content 为数组时，该消息会被单独分组（密封），后续消息不会合并到该组。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const messages: BubbleListProps['messages'] = [
  {
    role: 'user',
    // role 为 user 且 content 为数组时，会被单独分组（密封）
    content: [
      { type: 'text', text: '第一部分' },
      { type: 'text', text: '第二部分' },
    ],
  },
  {
    role: 'ai',
    // 上一条为 user+数组（密封），所以这条单独成组
    content: '第二条消息（单独成组）',
  },
  {
    role: 'ai',
    // 与上一条角色相同且上一条非密封，合并到同一组
    content: '第三条消息（与第二条合并）',
  },
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
</script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
