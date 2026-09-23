<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 8px; align-items: center">
      <label>
        <input type="checkbox" v-model="autoScroll" />
        启用自动滚动
      </label>
      <button @click="addMessage">添加消息</button>
      <button :disabled="isImageLoading" @click="loadAsyncImage">
        {{ isImageLoading ? '图片加载中…' : '模拟图片异步加载' }}
      </button>
    </div>

    <div
      class="scroll-container"
      style="height: 300px; border: 1px solid #ddd; border-radius: 4px; overflow-y: auto; padding: 8px"
    >
      <tr-bubble-list :messages="messages" :role-configs="roles" :auto-scroll="autoScroll" style="max-height: 100%">
        <template #after="{ messages: groupMessages }">
          <div v-for="message in getAsyncMessages(groupMessages)" :key="message.id" class="async-content">
            <template v-if="getImageStatus(message) === 'loaded'">
              <img
                class="async-image"
                :src="earthriseImageUrl"
                alt="从月球地平线上升起的地球"
                @error="setImageStatus(message, 'error')"
              />
              <div class="async-caption">
                <strong>Earthrise · Apollo 8</strong>
                <span>NASA / Bill Anders，1968</span>
              </div>
            </template>
            <div v-else class="async-status">
              {{ getImageStatus(message) === 'loading' ? '图片加载中…' : '图片加载失败' }}
            </div>
          </div>
        </template>
      </tr-bubble-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h, onBeforeUnmount, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const autoScroll = ref(true)
type ImageStatus = 'loading' | 'loaded' | 'error'
type Message = BubbleListProps['messages'][number]

const imageStatuses = ref<Record<string, ImageStatus>>({})
const earthriseImageUrl =
  'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/climate/2023/12/August-2013_1920x1200.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1200&w=1920'
const isImageLoading = computed(() => Object.values(imageStatuses.value).some((status) => status === 'loading'))

const messages = ref<BubbleListProps['messages']>([
  { id: 'message-1', role: 'user', content: '请展示一张经典的太空照片' },
  { id: 'message-2', role: 'ai', content: '当然，这是 Apollo 8 拍摄的 Earthrise：' },
])

const getImageStatus = (message: Message) => (message.id ? imageStatuses.value[message.id] : undefined)
const getAsyncMessages = (groupMessages: BubbleListProps['messages']) =>
  groupMessages.filter((message) => getImageStatus(message))
const setImageStatus = (message: Message, status: ImageStatus) => {
  if (message.id) {
    imageStatuses.value[message.id] = status
  }
}

const roles: Record<string, BubbleRoleConfig> = {
  ai: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}

let messageCount = 2

const addMessage = () => {
  messageCount++
  const role = messageCount % 2 === 0 ? 'ai' : 'user'
  messages.value.push({ id: `message-${messageCount}`, role, content: `第 ${messageCount} 条消息` })
}

const imageTimers = new Map<string, number>()

const loadAsyncImage = () => {
  const message = messages.value.at(-1)
  const messageId = message?.id
  if (!message || !messageId || getImageStatus(message)) {
    return
  }

  setImageStatus(message, 'loading')
  const timer = window.setTimeout(() => {
    setImageStatus(message, 'loaded')
    imageTimers.delete(messageId)
  }, 500)
  imageTimers.set(messageId, timer)
}

onBeforeUnmount(() => imageTimers.forEach((timer) => window.clearTimeout(timer)))
</script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

.async-content {
  width: min(240px, 100%);
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid var(--tr-color-border);
  border-radius: 8px;
  background: var(--tr-color-bg-1);
}

.async-image {
  display: block;
  width: 100%;
  height: auto;
}

.async-status,
.async-caption {
  padding: 10px 12px;
  font-size: 12px;
}

.async-status {
  color: var(--tr-color-text-secondary);
}

.async-caption {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.async-caption span {
  color: var(--tr-color-text-secondary);
}
</style>
