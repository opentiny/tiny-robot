<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" type="markdown"></tr-bubble>
</template>

<script setup lang="ts">
// import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'
import { mdContent } from './markdown-data'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
</script>
