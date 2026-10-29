<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <p><strong>纯图片</strong></p>
      <tr-bubble :content="images" :avatar="aiAvatar"></tr-bubble>
    </div>

    <div>
      <p><strong>图片在前、文本在后</strong></p>
      <tr-bubble :content="imageFirst" :avatar="aiAvatar" content-render-mode="single"></tr-bubble>
    </div>

    <div>
      <p><strong>文本在前、图片在后</strong></p>
      <tr-bubble :content="textFirst" :avatar="aiAvatar" content-render-mode="single"></tr-bubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const images = [
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-1/400/300' } },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-2/400/300' } },
]

const imageFirst = [
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-3/400/300' } },
  { type: 'text', text: '图片后的文本与图片显示在同一个气泡中。' },
]

const textFirst = [
  { type: 'text', text: '文本后的图片也显示在同一个气泡中。' },
  { type: 'image_url', image_url: { url: 'https://picsum.photos/seed/tiny-robot-bubble-4/400/300' } },
]
</script>
