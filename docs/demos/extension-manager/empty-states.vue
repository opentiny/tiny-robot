<script setup lang="ts">
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const tabs: ExtensionManagerTab[] = [{ id: 'empty-section', label: '空分区', items: [] }]
</script>

<template>
  <tr-extension-manager :tabs="tabs">
    <template #empty="{ title }">{{ title }}中没有匹配的扩展。</template>
  </tr-extension-manager>

  <tr-extension-manager :tabs="[]" empty-text="当前没有可用的扩展分类。" />
</template>
