<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionCardAction, ExtensionManagerActionEvent, ExtensionManagerTab } from '@opentiny/tiny-robot'

const createMcpActions = (name: string, checked = true): ExtensionCardAction[] => [
  { id: 'enabled', type: 'switch', label: `启用${name}`, checked },
  { id: 'uninstall', type: 'button', label: '卸载', danger: true },
]

const tabs = ref<ExtensionManagerTab[]>([
  {
    id: 'mcp',
    label: 'MCP',
    items: [
      {
        id: 'filesystem',
        name: '文件系统',
        description: '读取和管理本地文件。',
        installed: true,
        actions: createMcpActions('文件系统'),
      },
      {
        id: 'github',
        name: 'GitHub',
        description: '访问仓库、议题和拉取请求。',
        installed: true,
        actions: createMcpActions('GitHub', false),
      },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    items: [
      {
        id: 'document-summary',
        name: '文档总结',
        description: '将长文档整理为简明要点。',
        actions: [{ id: 'install', type: 'button', label: '安装' }],
      },
      {
        id: 'code-review',
        name: '代码评审',
        description: '检查代码改动并给出改进建议。',
        actions: [{ id: 'install', type: 'button', label: '安装' }],
      },
    ],
  },
])

const handleAction = (event: ExtensionManagerActionEvent) => {
  const tab = tabs.value.find((candidate) => candidate.id === event.tabId)
  const item = tab?.items.find((candidate) => candidate.id === event.itemId)
  if (!item) return

  if (event.action.type === 'switch' && typeof event.action.checked === 'boolean') {
    const action = item.actions?.find((candidate) => candidate.id === event.action.id)
    if (action?.type === 'switch') action.checked = event.action.checked
    return
  }

  if (event.action.type === 'button' && event.action.id === 'install') {
    item.installed = true
    item.actions = event.tabId === 'mcp' ? createMcpActions(item.name) : []
    return
  }

  if (event.action.type === 'button' && event.action.id === 'uninstall') {
    item.installed = false
    item.actions = [{ id: 'install', type: 'button', label: '安装' }]
  }
}
</script>

<template>
  <tr-extension-manager title="扩展管理" :tabs="tabs" @action="handleAction" />
</template>
