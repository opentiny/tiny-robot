<script setup lang="ts">
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'
import FallbackContentRenderer from './FallbackContentRenderer.vue'

const props = defineProps<{ malformed?: boolean; malformedOptions?: boolean }>()
const invalidContent: BubbleMessage['content'] = [{ type: 'ask_user' }]
const malformedContent: BubbleMessage['content'] = [{ type: 'ask_user', id: 'malformed-ask-user', steps: [null] }]
const malformedOptionsContent: BubbleMessage['content'] = [
  {
    type: 'ask_user',
    id: 'malformed-options-ask-user',
    steps: [{ id: 'framework', title: '框架', type: 'single', options: {} }],
  },
]
</script>

<template>
  <Bubble
    role="assistant"
    :content="props.malformed ? malformedContent : props.malformedOptions ? malformedOptionsContent : invalidContent"
    :fallback-content-renderer="FallbackContentRenderer"
  />
</template>
