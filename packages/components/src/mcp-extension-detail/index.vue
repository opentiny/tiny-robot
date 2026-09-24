<script setup lang="ts">
import { computed } from 'vue'
import Switch from '../shared/components/Switch.vue'
import ExtensionDetailSummary from '../shared/components/ExtensionDetailSummary.vue'
import type { McpExtensionDetailEmits, McpExtensionDetailProps, McpExtensionTool } from './index.type'

defineOptions({ name: 'McpExtensionDetail' })

const props = defineProps<McpExtensionDetailProps>()
const emit = defineEmits<McpExtensionDetailEmits>()

const summaryBadges = computed(() => [
  props.tools.length + ' 个工具',
  ...(props.updatedAt ? ['更新于 ' + props.updatedAt] : []),
])

const handleToolToggle = (tool: McpExtensionTool, enabled: boolean) => {
  if (tool.disabled) return
  emit('tool-toggle', { toolId: tool.id, enabled })
}
</script>

<template>
  <div class="mcp-extension-detail">
    <ExtensionDetailSummary :name="props.name" :description="props.description" :badges="summaryBadges" />

    <ul v-if="props.tools.length" class="mcp-extension-detail__tools">
      <li v-for="tool in props.tools" :key="tool.id" class="mcp-extension-detail__tool">
        <div class="mcp-extension-detail__tool-content">
          <strong class="mcp-extension-detail__tool-name">{{ tool.name }}</strong>
          <p v-if="tool.description" class="mcp-extension-detail__tool-description">{{ tool.description }}</p>
        </div>

        <Switch
          :model-value="tool.enabled"
          :label="`启用 ${tool.name}`"
          :disabled="tool.disabled"
          @update:model-value="handleToolToggle(tool, $event)"
        />
      </li>
    </ul>

    <p v-else class="mcp-extension-detail__empty">暂无可用工具</p>
  </div>
</template>

<style lang="less" scoped>
@detail-divider-color: color-mix(in srgb, var(--tr-border-color-default) 42%, transparent);

.mcp-extension-detail {
  color: var(--tr-text-primary);
}

.mcp-extension-detail__tools {
  margin: 0;
  padding: 0;
  border-top: 1px solid @detail-divider-color;
  list-style: none;
}

.mcp-extension-detail__tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 68px;
  padding: 0 16px;
  border-bottom: 1px solid @detail-divider-color;
}

.mcp-extension-detail__tool-content {
  min-width: 0;
}

.mcp-extension-detail__tool-name {
  display: block;
  overflow: hidden;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mcp-extension-detail__tool-description {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mcp-extension-detail__empty {
  margin: 0;
  padding: 32px 0;
  border-top: 1px solid @detail-divider-color;
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
