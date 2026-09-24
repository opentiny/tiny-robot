<script setup lang="ts">
import { computed, ref } from 'vue'
import McpExtensionDetail from '../../../components/src/mcp-extension-detail/index.vue'

const tools = ref([
  { id: 'understand', name: 'imgUnderstand', description: '回答用户关于代表 URL 的图片的问题。', enabled: true },
  { id: 'search', name: 'webSearch', description: '搜索公开网页。', enabled: false },
  { id: 'restricted', name: 'restrictedTool', description: '由宿主策略禁用。', enabled: true, disabled: true },
])
const componentTools = computed(() => JSON.parse(JSON.stringify(tools.value)))
const lastToggle = ref<unknown>()

const handleToolToggle = (event: unknown) => {
  lastToggle.value = event
}
</script>

<template>
  <McpExtensionDetail
    data-testid="detail"
    id="mcp-genui"
    name="GenUI MCP"
    description="生成 OpenTiny GenUI schema.json 时使用的 MCP。"
    updated-at="2026-07-10"
    :tools="componentTools"
    @tool-toggle="handleToolToggle"
  />
  <McpExtensionDetail data-testid="second-detail" id="mcp-genui-copy" name="GenUI MCP Copy" :tools="componentTools" />
  <McpExtensionDetail data-testid="empty-detail" id="mcp-empty" name="Empty MCP" :tools="[]" />
  <output data-testid="toggle-output">{{ JSON.stringify(lastToggle) }}</output>
</template>
