<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="autoScroll" />
        启用自动滚动
      </label>
      <button @click="addMessage">添加消息</button>
    </div>

    <div
      ref="containerRef"
      style="height: 300px; border: 1px solid #ddd; border-radius: 4px; overflow-y: auto; padding: 8px"
    >
      <tr-bubble-list
        :messages="messages"
        :role-configs="roles"
        :auto-scroll="autoScroll"
        style="max-height: 100%"
      ></tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const autoScroll = ref(true)

const messages = ref<BubbleListProps['messages']>([
  { role: 'user', content: '第一条消息' },
  { role: 'ai', content: 'AI 回复' },
])

const roles: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}

let messageCount = 2

const addMessage = () => {
  messageCount++
  const role = messageCount % 2 === 0 ? 'ai' : 'user'
  messages.value.push({ role, content: `第 ${messageCount} 条消息` })
}
</script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}
</style>
