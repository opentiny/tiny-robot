<script setup lang="ts">
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'
import FallbackContentRenderer from './FallbackContentRenderer.vue'

const content: BubbleMessage['content'] = [{ type: 'ask_user' }]
</script>

<template>
  <Bubble role="assistant" :content="content" :fallback-content-renderer="FallbackContentRenderer" />
</template>
