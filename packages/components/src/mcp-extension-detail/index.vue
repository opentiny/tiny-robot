<script setup lang="ts">
import Switch from '../shared/components/Switch.vue'
import type { McpExtensionDetailEmits, McpExtensionDetailProps, McpExtensionTool } from './index.type'

defineOptions({ name: 'McpExtensionDetail' })

defineProps<McpExtensionDetailProps>()
const emit = defineEmits<McpExtensionDetailEmits>()

const handleToolToggle = (tool: McpExtensionTool, enabled: boolean) => {
  if (tool.disabled) return
  emit('tool-toggle', { toolId: tool.id, enabled })
}
</script>

<template>
  <div class="mcp-extension-detail">
    <dl class="mcp-extension-detail__summary">
      <div class="mcp-extension-detail__summary-row">
        <dt>名称：</dt>
        <dd>{{ name }}</dd>
      </div>
      <div class="mcp-extension-detail__summary-row">
        <dt>描述：</dt>
        <dd>{{ description || '暂无描述' }}</dd>
      </div>
    </dl>

    <div class="mcp-extension-detail__metadata" aria-label="MCP 元数据">
      <span class="mcp-extension-detail__badge">{{ tools.length }} 个工具</span>
      <span v-if="updatedAt" class="mcp-extension-detail__badge">更新于 {{ updatedAt }}</span>
    </div>

    <ul v-if="tools.length" class="mcp-extension-detail__tools">
      <li v-for="tool in tools" :key="tool.id" class="mcp-extension-detail__tool">
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
.mcp-extension-detail {
  color: var(--tr-text-primary);
}

.mcp-extension-detail__summary {
  margin: 0 0 8px;
  color: var(--tr-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.mcp-extension-detail__summary-row {
  display: flex;
  gap: 4px;
}

.mcp-extension-detail__summary-row dt {
  flex: none;
}

.mcp-extension-detail__summary-row dd {
  min-width: 0;
  margin: 0;
}

.mcp-extension-detail__metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.mcp-extension-detail__badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--tr-container-bg-hover);
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
}

.mcp-extension-detail__tools {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--tr-border-color-default);
  list-style: none;
}

.mcp-extension-detail__tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 68px;
  padding: 0 16px;
  border-bottom: 1px solid var(--tr-border-color-default);
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
  border-top: 1px solid var(--tr-border-color-default);
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
