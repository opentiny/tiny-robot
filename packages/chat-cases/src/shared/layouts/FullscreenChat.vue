<script setup lang="ts">
import { TrChat, type ChatRuntime } from '@opentiny/tiny-robot-chat'

defineProps<{
  runtime: ChatRuntime
}>()
</script>

<template>
  <div class="fullscreen-chat">
    <TrChat :runtime="runtime" />
  </div>
</template>

<style scoped>
.fullscreen-chat {
  height: 100%;
  min-height: 100vh;
  min-width: 0;
  overflow: hidden;
}
</style>
