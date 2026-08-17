<script setup lang="ts">
import { shallowRef } from 'vue'
import RightPanelChat from '../../shared/layouts/RightPanelChat.vue'
import { useTinyRobotRuntime } from '../../shared/runtime/createChatRuntime'

const runtime = useTinyRobotRuntime()
const open = shallowRef(true)
</script>

<template>
  <RightPanelChat v-model:open="open" :runtime="runtime" />
</template>
