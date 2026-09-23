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
        <template #after="{ messageIndexes }">
          <div v-if="showAsyncContent && messageIndexes.at(-1) === messages.length - 1" class="async-content">
            <img
              v-if="imageStatus !== 'error'"
              class="async-image"
              :src="earthriseImageUrl"
              alt="从月球地平线上升起的地球"
              @load="imageStatus = 'loaded'"
              @error="imageStatus = 'error'"
            />
            <div v-if="imageStatus === 'loading'" class="async-status">正在加载图片资源…</div>
            <div v-else-if="imageStatus === 'error'" class="async-status">图片加载失败，请重试</div>
            <div v-else-if="imageStatus === 'loaded'" class="async-caption">
              <strong>Earthrise · Apollo 8</strong>
              <span>NASA / Bill Anders，1968</span>
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
const imageStatus = ref<'idle' | 'waiting' | 'loading' | 'loaded' | 'error'>('idle')
const earthriseImageUrl =
  'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/climate/2023/12/August-2013_1920x1200.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1200&w=1920'
const isImageLoading = computed(() => imageStatus.value === 'waiting' || imageStatus.value === 'loading')
const showAsyncContent = computed(
  () => imageStatus.value === 'loading' || imageStatus.value === 'loaded' || imageStatus.value === 'error',
)

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

let imageTimer: number | undefined

const loadAsyncImage = () => {
  imageStatus.value = 'waiting'
  imageTimer = window.setTimeout(() => {
    imageStatus.value = 'loading'
  }, 500)
}

onBeforeUnmount(() => window.clearTimeout(imageTimer))
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
