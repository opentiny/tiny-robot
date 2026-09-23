<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="autoScroll" />
        启用自动滚动
      </label>
      <button @click="addMessage">添加消息</button>
      <button @click="growAsyncContent">模拟异步增高</button>
    </div>

    <div
      ref="containerRef"
      style="height: 300px; border: 1px solid #ddd; border-radius: 4px; overflow-y: auto; padding: 8px"
    >
      <tr-bubble-list :messages="messages" :role-configs="roles" :auto-scroll="autoScroll" style="max-height: 100%">
        <template #after="{ messageIndexes }">
          <div v-if="asyncContentVisible && messageIndexes.at(-1) === messages.length - 1" class="async-content">
            异步内容已渲染（高度 336px）
          </div>
        </template>
      </tr-bubble-list>
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
const asyncContentVisible = ref(false)

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

const growAsyncContent = () => {
  asyncContentVisible.value = false
  window.setTimeout(() => {
    asyncContentVisible.value = true
  }, 300)
}
</script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

.async-content {
  box-sizing: border-box;
  height: 336px;
  margin-top: 8px;
  padding: 16px;
  border: 1px dashed var(--tr-color-primary);
  border-radius: 4px;
  background: var(--tr-color-primary-light);
}
</style>
