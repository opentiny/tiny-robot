<script setup lang="ts">
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import IconButton from '../../icon-button'
import McpServerPicker from '../../mcp-server-picker'
import type { PluginInfo } from '../../mcp-server-picker/index.type'

defineProps<{
  compact?: boolean
  activePluginCount: number
  installedPlugins: PluginInfo[]
  marketPlugins: PluginInfo[]
  title: string
  installedTabTitle: string
  marketTabTitle: string
  searchPlaceholder: string
  marketCategoryPlaceholder: string
}>()

const pickerVisible = defineModel<boolean>('pickerVisible', { required: true })

const emit = defineEmits<{
  (e: 'plugin-toggle', plugin: PluginInfo, enabled: boolean): void
  (e: 'plugin-add', plugin: PluginInfo): void
  (e: 'plugin-delete', plugin: PluginInfo): void
  (e: 'tool-toggle', plugin: PluginInfo, toolId: string, enabled: boolean): void
}>()

const pickerPopupConfig = {
  type: 'drawer' as const,
  drawer: {
    direction: 'right' as const,
  },
}

function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
  emit('plugin-toggle', plugin, enabled)
}

function handlePluginAdd(plugin: PluginInfo) {
  emit('plugin-add', plugin)
}

function handlePluginDelete(plugin: PluginInfo) {
  emit('plugin-delete', plugin)
}

function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
  emit('tool-toggle', plugin, toolId, enabled)
}
</script>

<template>
  <div>
    <div
      class="tr-chat-mcp-trigger"
      :class="{ 'is-active': pickerVisible || activePluginCount > 0, 'tr-chat-mcp-trigger--compact': compact }"
      @click="pickerVisible = true"
    >
      <IconButton :icon="IconPlugin" size="28" svg-size="20" :title="title" :aria-label="title" />
      <span v-if="!compact" class="tr-chat-mcp-trigger__text">{{ title }}</span>
      <span v-if="activePluginCount > 0" class="tr-chat-mcp-trigger__badge">{{ activePluginCount }}</span>
    </div>

    <McpServerPicker
      v-model:visible="pickerVisible"
      :active-count="activePluginCount"
      :popup-config="pickerPopupConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :title="title"
      :installed-tab-title="installedTabTitle"
      :market-tab-title="marketTabTitle"
      :search-placeholder="searchPlaceholder"
      :market-category-placeholder="marketCategoryPlaceholder"
      :enable-market-category-filter="false"
      :show-custom-add-button="false"
      :allow-plugin-delete="true"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
    />
  </div>
</template>

<style scoped lang="less">
.tr-chat-mcp-trigger {
  min-width: 88px;
  height: 32px;
  padding: 0 10px 0 2px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.tr-chat-mcp-trigger--compact {
  min-width: 0;
  padding: 0 8px 0 2px;
}

.tr-chat-mcp-trigger:hover {
  color: var(--tr-text-primary);
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-mcp-trigger.is-active {
  color: var(--tr-color-primary);
  border-color: var(--tr-color-primary);
  background: color-mix(in srgb, var(--tr-color-primary) 8%, var(--tr-container-bg-default));
}

.tr-chat-mcp-trigger__text {
  font-size: 12px;
  font-weight: var(--tr-font-weight-medium);
}

.tr-chat-mcp-trigger__badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--tr-radius-full);
  background: var(--tr-color-primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
}

:deep(.tr-icon-button) {
  background: transparent;
}

.tr-chat-mcp-trigger.is-active :deep(.tr-icon-button) {
  color: var(--tr-color-primary);
}

:deep(.mcp-server-picker.popup-type-drawer) {
  width: min(420px, 100vw);
  max-width: none;
  z-index: var(--tr-z-index-modal);
}
</style>
