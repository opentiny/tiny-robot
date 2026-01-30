<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div>
      <p><strong>consecutive 分组策略</strong></p>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px">连续相同角色的消息会被合并为一组</p>
      <tr-bubble-list :messages="messages" :role-configs="roles" group-strategy="consecutive"></tr-bubble-list>
    </div>

    <div>
      <p><strong>divider 分组策略（对比）</strong></p>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px">
        按分割角色分组，连续的分割角色在一组，其他消息在另一组
      </p>
      <tr-bubble-list :messages="messages" :role-configs="roles" group-strategy="divider"></tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
// 系统消息使用简单的圆形作为头像
const systemAvatar = h(
  'div',
  {
    style: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: '#666',
    },
  },
  'S',
)

const messages: BubbleListProps['messages'] = [
  {
    role: 'user',
    content: '第一条用户消息',
  },
  {
    role: 'user',
    content: '第二条用户消息（连续，会被合并）',
  },
  {
    role: 'ai',
    content: 'AI 回复第一条',
  },
  {
    role: 'ai',
    content: 'AI 回复第二条（连续，会被合并）',
  },
  {
    role: 'system',
    content: '系统通知：这是一条系统消息',
  },
  {
    role: 'system',
    content: '系统通知：这是另一条系统消息（连续，会被合并）',
  },
  {
    role: 'user',
    content: '第三条用户消息',
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
  system: {
    placement: 'start',
    avatar: systemAvatar,
  },
}
</script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
