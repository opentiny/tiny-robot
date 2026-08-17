<script setup lang="ts">
import FullscreenChat from '../../shared/layouts/FullscreenChat.vue'
import { useTinyRobotRuntime } from '../../shared/runtime/createChatRuntime'

const runtime = useTinyRobotRuntime()
</script>

<template>
  <FullscreenChat :runtime="runtime" />
</template>
