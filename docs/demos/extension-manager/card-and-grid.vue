<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionCard, TrExtensionCardGrid } from '@opentiny/tiny-robot'
import type { ExtensionCardAction, ExtensionCardActionEvent, ExtensionCardGridItem } from '@opentiny/tiny-robot'

const result = ref('尚未触发')
const actions: ExtensionCardAction[] = [
  { id: 'inspect', type: 'custom', label: '查看' },
  { id: 'remove', type: 'button', label: '移除' },
]
const items: ExtensionCardGridItem[] = [
  { id: 'search', name: '全文搜索', description: '在已接入内容中搜索。' },
  { id: 'archive', name: '归档助手', description: '自动归档完成的内容。' },
]

const handleAction = (event: ExtensionCardActionEvent) => {
  const payload = event.payload === undefined ? '无' : JSON.stringify(event.payload)
  result.value = `${event.id}：${payload}`
}
</script>

<template>
  <tr-extension-card name="自定义操作" :actions="actions" :primary-actions-limit="1" @action="handleAction">
    <template #primary-action="{ action, trigger }">
      <button type="button" :disabled="action.disabled" @click="trigger({ source: 'card-demo' })">
        {{ action.label }}
      </button>
    </template>
  </tr-extension-card>

  <tr-extension-card-grid :items="items">
    <template #item="{ item, index }">
      <article>{{ index + 1 }}. {{ item.name }}</article>
    </template>
  </tr-extension-card-grid>
  <p aria-live="polite">{{ result }}</p>
</template>
