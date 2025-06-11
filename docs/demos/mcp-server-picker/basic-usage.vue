<template>
  <McpServerPicker
    :installed-plugins="installedPlugins"
    :market-plugins="marketPlugins"
    :loading="loading"
    :market-loading="marketLoading"
    @plugin-toggle="handlePluginToggle"
    @plugin-add="handlePluginAdd"
    @plugin-delete="handlePluginDelete"
    @tool-toggle="handleToolToggle"
    @search="handleSearch"
    @tab-change="handleTabChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { McpServerPicker, PluginInfo, PluginTool } from '@opentiny/tiny-robot'

// 模拟加载状态
const loading = ref(false)
const marketLoading = ref(false)

// 已安装插件数据
const installedPlugins = ref([
  {
    id: 'plugin-1',
    name: 'GitHub 集成',
    icon: 'https://github.com/favicon.ico',
    description: '与 GitHub 仓库集成，提供代码搜索、PR 管理等功能',
    toolCount: 5,
    enabled: true,
    expanded: false,
    tools: [
      {
        id: 'tool-1',
        name: '搜索代码',
        description: '在 GitHub 仓库中搜索代码',
        enabled: true,
      },
      {
        id: 'tool-2',
        name: '创建 PR',
        description: '创建新的 Pull Request',
        enabled: true,
      },
      {
        id: 'tool-3',
        name: '查看 Issues',
        description: '查看和管理仓库 Issues',
        enabled: false,
      },
    ],
  },
  {
    id: 'plugin-2',
    name: 'Slack 通知',
    icon: 'https://slack.com/favicon.ico',
    description: '发送消息到 Slack 频道',
    toolCount: 2,
    enabled: false,
    expanded: false,
    tools: [
      {
        id: 'tool-4',
        name: '发送消息',
        description: '发送消息到指定频道',
        enabled: true,
      },
      {
        id: 'tool-5',
        name: '文件上传',
        description: '上传文件到 Slack',
        enabled: true,
      },
    ],
  },
])

// 市场插件数据
const marketPlugins = ref([
  {
    id: 'market-1',
    name: 'Jira 集成',
    icon: 'https://jira.atlassian.com/favicon.ico',
    description: '与 Jira 集成，管理任务和问题跟踪',
    toolCount: 8,
  },
  {
    id: 'market-2',
    name: 'Trello 看板',
    icon: 'https://trello.com/favicon.ico',
    description: 'Trello 看板管理工具',
    toolCount: 4,
  },
  {
    id: 'market-3',
    name: 'Notion 笔记',
    icon: 'https://notion.so/favicon.ico',
    description: 'Notion 笔记和文档管理',
    toolCount: 6,
  },
])

// 事件处理
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  console.log('插件状态切换:', plugin.name, enabled)
  plugin.enabled = enabled
}

const handlePluginAdd = (plugin: PluginInfo) => {
  console.log('添加插件:', plugin.name)
  // 模拟添加到已安装列表
  installedPlugins.value.push({
    ...plugin,
    enabled: true,
    expanded: false,
    tools: [],
  })

  // 从市场列表中移除
  const index = marketPlugins.value.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    marketPlugins.value.splice(index, 1)
  }
}

const handlePluginDelete = (plugin: PluginInfo) => {
  console.log('删除插件:', plugin.name)
  const index = installedPlugins.value.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    installedPlugins.value.splice(index, 1)
  }
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  console.log('工具状态切换:', plugin.name, toolId, enabled)
  const tool = plugin.tools?.find((t: PluginTool) => t.id === toolId)
  if (tool) {
    tool.enabled = enabled
  }
}

const handleSearch = (query: string, tab: string) => {
  console.log('搜索:', query, '在', tab)
}

const handleTabChange = (activeTab: string) => {
  console.log('标签页切换:', activeTab)
}
</script>
