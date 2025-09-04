<template>
  <div class="demo-controls">
    <h3>MCP Server Picker 演示</h3>
  </div>

  <!-- 插件面板，默认在页面右侧以抽屉的形式展示，可以点击按钮控制抽屉的显示和隐藏 -->
  <div class="demo-controls">
    <TinyButton
      :class="['plugin-common', { 'plugin-active': activeCount > 0 }]"
      circle
      size="small"
      @click="handleVisibleToggle"
    >
      <!-- 按钮的内容分为两种：激活状态和未激活状态 -->
      <IconPlugin class="plugin-common_icon" />
      <span class="plugin-common_text">扩展</span>
      <span class="plugin-active_count" v-if="activeCount">{{ activeCount }}</span>
    </TinyButton>
  </div>
  <McpServerPicker
    v-model:visible="visible"
    v-model:activeCount="activeCount"
    :popup-config="{
      type: 'drawer',
    }"
    :installed-plugins="installedPlugins"
    :market-plugins="marketPlugins"
    :market-category-options="marketCategoryOptions"
    :installed-search-fn="handleInstalledSearchFn"
    :market-search-fn="handleMarketSearchFn"
    :loading="loading"
    :market-loading="marketLoading"
    @plugin-toggle="handlePluginToggle"
    @plugin-add="handlePluginAdd"
    @plugin-create="handlePluginCreate"
    @plugin-delete="handlePluginDelete"
    @tool-toggle="handleToolToggle"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  McpServerPicker,
  type PluginInfo,
  type PluginTool,
  type MarketCategoryOption,
  type PluginFormData,
  type PluginCreationData,
} from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import { TinyButton } from '@opentiny/vue'

// 模拟加载状态
const loading = ref(false)
const marketLoading = ref(false)

// 激活数量 - 通过 v-model:activeCount 自动同步
const activeCount = ref(0)

// 已安装插件数据
const installedPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'GitHub 集成',
    icon: 'https://github.com/favicon.ico',
    description: '与 GitHub 仓库集成，提供代码搜索、PR 管理等功能',
    enabled: true,
    expanded: true,
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
    enabled: false,
    expanded: true,
    tools: [
      {
        id: 'tool-4',
        name: '发送消息',
        description: '发送消息到指定频道',
        enabled: false,
      },
      {
        id: 'tool-5',
        name: '文件上传',
        description: '上传文件到 Slack',
        enabled: false,
      },
    ],
  },
])

// 市场插件数据 - 演示三种不同的添加状态
const marketPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'Jira 集成',
    icon: 'https://ts3.tc.mm.bing.net/th/id/ODLS.2a97aa8b-50c6-4e00-af97-3b563dfa07f4',
    description: 'Jira 任务管理',
    enabled: true,
    addState: 'idle', // 未添加状态，显示"添加"按钮
    tools: [
      { id: 'tool-5', name: '创建任务', description: '创建 Jira 任务', enabled: false },
      { id: 'tool-6', name: '查询任务', description: '查询 Jira 任务', enabled: false },
    ],
  },
  {
    id: 'plugin-2',
    name: 'Notion 集成',
    icon: 'https://www.notion.so/front-static/favicon.ico',
    description: 'Notion 文档管理和协作',
    enabled: false,
    addState: 'loading', // 添加中状态，显示"添加中"按钮
    tools: [
      { id: 'tool-7', name: '创建页面', description: '创建 Notion 页面', enabled: false },
      { id: 'tool-8', name: '查询数据库', description: '查询 Notion 数据库', enabled: false },
    ],
  },
  {
    id: 'plugin-3',
    name: 'Telegram 机器人',
    icon: 'https://telegram.org/favicon.ico',
    description: 'Telegram 消息推送和自动化',
    enabled: false,
    addState: 'added', // 已添加状态，显示"已添加"按钮
    tools: [{ id: 'tool-9', name: '发送消息', description: '发送 Telegram 消息', enabled: false }],
    category: 'ai',
  },
])

// 市场分类选项
const marketCategoryOptions = ref<MarketCategoryOption[]>([
  { value: '', label: '全部分类' },
  { value: 'productivity', label: '生产力工具' },
  { value: 'communication', label: '沟通协作' },
  { value: 'development', label: '开发工具' },
  { value: 'ai', label: 'AI 助手' },
])

const visible = ref(false)

const handleVisibleToggle = () => {
  visible.value = true
}

// 事件处理
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  plugin.enabled = enabled
}

const handlePluginAdd = (plugin: PluginInfo) => {
  const targetPlugin = marketPlugins.value.find((p) => p.id === plugin.id)!

  // 设置为加载状态
  targetPlugin.addState = 'loading'

  // 模拟异步添加过程
  setTimeout(() => {
    // 添加成功后设置为已添加状态
    targetPlugin.addState = 'added'

    const newPlugin: PluginInfo = {
      ...plugin,
      id: `${plugin.id}-installed-${Date.now()}`, // 生成新的ID避免冲突
      enabled: false, // 新添加的插件默认不启用
      addState: 'added',
    }
    installedPlugins.value.push(newPlugin)
  }, 2000) // 模拟2秒的网络延迟
}

const handlePluginDelete = (plugin: PluginInfo) => {
  const index = installedPlugins.value.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    installedPlugins.value.splice(index, 1)
  }

  const marketPlugin = marketPlugins.value.find((p) => p.name === plugin.name)
  if (marketPlugin) {
    marketPlugin.addState = 'idle'
  }
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  const tool = plugin.tools?.find((t: PluginTool) => t.id === toolId)
  if (tool) {
    tool.enabled = enabled
  }
}

const createPluginByForm = (data: PluginFormData) => {
  // 可以在这里处理表单数据，例如发送到服务器
  const newPlugin: PluginInfo = {
    id: `custom-${Date.now()}`,
    name: data.name,
    icon: '', // 如果有缩略图可以处理 data.thumbnail
    description: data.description,
    enabled: false,
    tools: [],
  }
  installedPlugins.value.push(newPlugin)
}

// 新的插件创建事件处理
const handlePluginCreate = (type: 'form' | 'code', data: PluginCreationData) => {
  if (type === 'form') {
    // 表单 创建插件逻辑
    createPluginByForm(data)
  } else {
    // 代码 创建插件逻辑
  }
}

const handleInstalledSearchFn = (query: string, item: PluginInfo) => {
  return item.name.toLowerCase().includes(query.toLowerCase())
}

const handleMarketSearchFn = (query: string, item: PluginInfo) => {
  return item.name.toLowerCase().includes(query.toLowerCase())
}
</script>

<style lang="less" scoped>
.demo-controls {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.plugin-common {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  height: 20px;
  min-width: 44px;
  box-sizing: content-box;

  &_text {
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
    text-align: left;
  }

  &_icon {
    font-size: 16px;
  }
}

.plugin-active {
  color: #1476ff;
  background-color: #eaf0f8;
  border: 1px solid #1476ff;

  &_count {
    width: 12px;
    height: 12px;
    background: #1476ff;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 9px;
    font-weight: 500;
    line-height: 12px;
    color: #fff;
  }

  &:hover {
    color: #1476ff;
    background-color: #eaf0f8;
    border: 1px solid #1476ff;
  }
}
</style>
