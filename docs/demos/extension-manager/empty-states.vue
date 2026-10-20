<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const hideSingleTab = ref(false)
const tabs: ExtensionManagerTab[] = [{ id: 'empty-section', label: '空分区', items: [] }]
</script>

<template>
  <label><input v-model="hideSingleTab" type="checkbox" /> 单标签时隐藏标签栏</label>

  <tr-extension-manager :tabs="tabs" :hide-single-tab="hideSingleTab">
    <template #empty="{ title }">{{ title }}中没有匹配的扩展。</template>
  </tr-extension-manager>

  <tr-extension-manager :tabs="[]" empty-text="当前没有可用的扩展分类。" />
</template>
