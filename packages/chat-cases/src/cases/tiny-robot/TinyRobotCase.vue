<script setup lang="ts">
import TinyRobotAssistant from './TinyRobotAssistant.vue'
import { modelProviders } from './config'
import { mcpServers } from './mcp'
import { useChatCaseRuntime } from '../../shared/runtime/createChatRuntime'

const runtime = useChatCaseRuntime({ modelProviders, mcpServers })
</script>

<template>
  <TinyRobotAssistant :runtime="runtime" />
</template>
