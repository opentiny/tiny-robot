<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <p><strong>单张图片</strong></p>
      <tr-bubble
        :content="[{ type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=1' } }]"
        :avatar="aiAvatar"
      ></tr-bubble>
    </div>

    <div>
      <p><strong>多张图片</strong></p>
      <tr-bubble :content="multipleImages" :avatar="aiAvatar"></tr-bubble>
    </div>

    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
        <p style="margin: 0"><strong>图片与文本混合</strong></p>
        <label style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666">
          <input type="checkbox" v-model="useSplitMode" />
          split 模式
        </label>
      </div>
      <tr-bubble
        :content="mixedContent"
        :avatar="aiAvatar"
        :content-render-mode="useSplitMode ? 'split' : 'single'"
      ></tr-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const multipleImages = [
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=2' } },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=3' } },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=4' } },
]

const mixedContent = [
  { type: 'text', text: '这是一张示例图片：' },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/400/300?random=5' } },
  { type: 'text', text: '图片下方可以继续显示文本内容。' },
]

const useSplitMode = ref(false)
</script>
