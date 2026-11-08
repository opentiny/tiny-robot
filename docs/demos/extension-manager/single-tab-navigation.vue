<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const hideSingleTab = ref(false)
const tabs: ExtensionManagerTab[] = [
  {
    id: 'mcp',
    label: 'MCP',
    items: [{ id: 'filesystem', name: '文件系统', description: '读取和管理本地文件。', installed: true }],
  },
]
</script>

<template>
  <label><input v-model="hideSingleTab" type="checkbox" /> 隐藏单标签导航</label>
  <tr-extension-manager title="扩展" :tabs="tabs" :hide-single-tab="hideSingleTab" />
</template>
