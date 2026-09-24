<script setup lang="ts">
import { ref } from 'vue'
import { TrMcpExtensionDetail } from '@opentiny/tiny-robot'
import type { McpExtensionTool, McpExtensionToolToggleEvent } from '@opentiny/tiny-robot'

const initialTools = (): McpExtensionTool[] => [
  { id: 'forecast', name: '天气预报', description: '查询未来三天的天气。', enabled: true },
  { id: 'alerts', name: '天气预警', description: '查询当前预警。', enabled: false },
  { id: 'admin', name: '管理设置', description: '由应用策略禁用。', enabled: false, disabled: true },
]

const tools = ref<McpExtensionTool[]>(initialTools())
const result = ref('尚未切换工具')

const handleToggle = ({ toolId, enabled }: McpExtensionToolToggleEvent) => {
  tools.value = tools.value.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool))
  result.value = `应用已将 ${toolId} 更新为${enabled ? '启用' : '停用'}`
}

const reset = () => {
  tools.value = initialTools()
  result.value = '尚未切换工具'
}
</script>

<template>
  <section>
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">恢复工具状态</button>
    </div>
    <tr-mcp-extension-detail
      id="weather"
      name="天气 MCP"
      description="提供天气预报与预警查询。"
      updated-at="2026-07-10"
      :tools="tools"
      @tool-toggle="handleToggle"
    />
    <p aria-live="polite">{{ result }}</p>
  </section>
</template>
