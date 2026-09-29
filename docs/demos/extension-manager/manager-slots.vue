<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const headerActionCount = ref(0)

const tabs: ExtensionManagerTab[] = [
  { id: 'library', label: '资料库', items: [{ id: 'reader', name: '文档阅读', installed: true }] },
  { id: 'empty', label: '空分组', items: [] },
]
</script>

<template>
  <tr-extension-manager title="扩展" :tabs="tabs">
    <template #header-actions>
      <button type="button" @click="headerActionCount += 1">添加扩展</button>
    </template>
    <template #tab="{ tab, active, select }">
      <span @click="select">{{ tab.label }}{{ active ? '（当前）' : '' }}</span>
    </template>
    <template #item="{ item, index }">
      <article>{{ index + 1 }}. {{ item.name }}</article>
    </template>
    <template #empty="{ title }">{{ title }}暂时没有扩展。</template>
  </tr-extension-manager>
  <p aria-live="polite">添加扩展操作触发次数：{{ headerActionCount }}</p>
</template>
