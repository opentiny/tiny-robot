<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <p style="font-size: 12px; color: #666; margin: 0">
      当消息的 content 为数组时，该消息会被单独分组（密封），后续消息不会合并到该组。
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
    role: 'ai',
    // content 为数组，会被单独分组（密封）
    content: [
      { type: 'text', text: '第一部分' },
      { type: 'text', text: '第二部分' },
    ],
  },
  {
    role: 'ai',
    // 虽然角色相同，但因为上一条是数组（密封），所以这条会单独成组
    content: '第二条消息（单独成组）',
  },
  {
    role: 'ai',
    // 这条会与上一条合并（因为上一条不是密封的）
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
