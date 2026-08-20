<script setup lang="ts">
import TinyRobotAssistant from './TinyRobotAssistant.vue'
import { mcpServers } from './mcp'
import { useChatCaseRuntime } from '../../shared/runtime/createChatRuntime'

const runtime = useChatCaseRuntime({ mcpServers })
</script>

<template>
  <TinyRobotAssistant :runtime="runtime" />
</template>
