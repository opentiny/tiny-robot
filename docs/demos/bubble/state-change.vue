<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <label>
        <input type="checkbox" v-model="messageState.expanded" />
        展开消息
      </label>
    </div>

    <tr-bubble
      content="这是一条可以交互的消息"
      :avatar="aiAvatar"
      :state="messageState"
      @state-change="handleStateChange"
    >
      <template #content-footer>
        <div v-if="messageState.expanded" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee">
          <button @click="toggleLike" style="padding: 4px 8px; font-size: 12px">
            {{ messageState.liked ? '取消点赞' : '点赞' }}
          </button>
        </div>
      </template>
    </tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const messageState = ref<Record<string, unknown>>({
  expanded: false,
  liked: false,
})

const handleStateChange = (payload: { key: string; value: unknown }) => {
  messageState.value[payload.key] = payload.value
}

const toggleLike = () => {
  messageState.value.liked = !messageState.value.liked
  handleStateChange({ key: 'liked', value: messageState.value.liked })
}
</script>
