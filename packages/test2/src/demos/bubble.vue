<template>
  <div class="basic-demos">
    <TextMessage />
    <Divider />
    <LoadingMessage />
    <Divider />
    <PolymorphicMessage />
    <Divider />
    <ReasoningMessage />
    <Divider />
    <ToolCallMessage />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import LoadingMessage from './bubble/LoadingMessage.vue.vue'
import PolymorphicMessage from './bubble/PolymorphicMessage.vue'
import ReasoningMessage from './bubble/ReasoningMessage.vue'
import TextMessage from './bubble/TextMessage.vue'
import ToolCallMessage from './bubble/ToolCallMessage.vue'

const Divider = h('hr', { style: { width: '100%', border: 'none', borderTop: '1px solid #ddd', marginBlock: '16px' } })
</script>

<style>
:root {
  --tr-bubble-box-bg: #f0f0f0;
}
</style>

<style scoped>
.basic-demos {
  display: flex;
  flex-direction: column;
}
</style>
