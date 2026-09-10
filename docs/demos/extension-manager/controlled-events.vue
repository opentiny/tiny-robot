<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const activeTab = ref<string | undefined>('writing')
const tabs: ExtensionManagerTab[] = [
  {
    id: 'writing',
    label: '写作',
    items: [
      {
        id: 'summarizer',
        name: '内容总结',
        description: '提炼长文档的关键信息。',
        installed: true,
      },
    ],
  },
  {
    id: 'development',
    label: '开发',
    items: [
      {
        id: 'repository-search',
        name: '仓库搜索',
        description: '检索代码和文档。',
        installed: true,
      },
    ],
  },
]

const activeLabel = computed(() => tabs.find((tab) => tab.id === activeTab.value)?.label ?? '无')
</script>

<template>
  <tr-extension-manager v-model:active-tab="activeTab" :tabs="tabs" />
  <p aria-live="polite">父组件保存的当前标签页：{{ activeLabel }}</p>
</template>
