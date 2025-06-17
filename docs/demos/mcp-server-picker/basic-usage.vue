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
  <tiny-drawer title="标题" :show-header="false" width="482px" :visible="visible" @update:visible="visible = $event">
    <McpServerPicker
      v-model:visible="visible"
      v-model:activeCount="activeCount"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      :loading="loading"
      :market-loading="marketLoading"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
      @plugin-form-add="handlePluginFormAdd"
      @plugin-code-add="handlePluginCodeAdd"
      @plugin-delete="handlePluginDelete"
      @tool-toggle="handleToolToggle"
      @search="handleSearch"
      @tab-change="handleTabChange"
      @market-category-change="handleMarketCategoryChange"
      @custom-add="handleCustomAdd"
    />
  </tiny-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  McpServerPicker,
  PluginInfo,
  PluginTool,
  AddPluginCodeData,
  AddPluginFormData,
  MarketCategoryOption,
} from '@opentiny/tiny-robot'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'

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
    toolCount: 5,
    enabled: true,
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

// 市场插件数据
const marketPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'Jira 集成',
    icon: 'https://ts3.tc.mm.bing.net/th/id/ODLS.2a97aa8b-50c6-4e00-af97-3b563dfa07f4',
    description: 'Jira 任务管理',
    enabled: true,
    added: false,
    category: 'productivity', // 添加分类标识
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
    added: false,
    category: 'productivity',
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
    added: false,
    category: 'communication',
    tools: [{ id: 'tool-9', name: '发送消息', description: '发送 Telegram 消息', enabled: false }],
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

// 事件处理
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  console.log('插件状态切换:', plugin.name, enabled)
  plugin.enabled = enabled
}

const handlePluginAdd = (plugin: PluginInfo, added: boolean) => {
  console.log('插件添加状态变化:', plugin.name, added)

  if (added) {
    // 如果是添加操作，创建新的插件副本并添加到已安装列表
    const newPlugin: PluginInfo = {
      ...plugin,
      id: `${plugin.id}-installed-${Date.now()}`, // 生成新的ID避免冲突
      enabled: false, // 新添加的插件默认不启用
      added: true,
    }
    installedPlugins.value.push(newPlugin)
  } else {
    // 如果是取消添加操作，从已安装列表中移除
    const index = installedPlugins.value.findIndex((p) => p.name === plugin.name)
    if (index > -1) {
      installedPlugins.value.splice(index, 1)
    }
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

// 新的插件创建事件处理
const handlePluginFormAdd = (data: AddPluginFormData) => {
  console.log('表单方式添加插件:', data)
  // 可以在这里处理表单数据，例如发送到服务器
  const newPlugin: PluginInfo = {
    id: `custom-${Date.now()}`,
    name: data.name,
    icon: '', // 如果有缩略图可以处理 data.thumbnail
    description: data.description,
    toolCount: 0,
    enabled: false,
    tools: [],
  }
  installedPlugins.value.push(newPlugin)
}

const handlePluginCodeAdd = (data: AddPluginCodeData) => {
  console.log('代码方式添加插件:', data)
  // 可以在这里处理代码数据，例如解析 aiPlugin 和 openAPI 配置
  // 这里简化为直接创建一个插件
  const newPlugin: PluginInfo = {
    id: `code-${Date.now()}`,
    name: '代码创建的插件',
    icon: '',
    description: '通过代码编辑器创建的插件',
    toolCount: 0,
    enabled: false,
    tools: [],
  }
  installedPlugins.value.push(newPlugin)
}

const handleCustomAdd = () => {
  console.log('用户点击了自定义添加按钮')
}

const handleSearch = (query: string, tab: string) => {
  console.log('搜索:', query, '在', tab)
}

const handleTabChange = (activeTab: string) => {
  console.log('标签页切换:', activeTab)
}

const handleMarketCategoryChange = (category: string) => {
  console.log('市场分类筛选:', category)
  // 这里可以根据分类过滤市场插件
}

const visible = ref(false)

const handleVisibleToggle = () => {
  visible.value = true
}
</script>

<style lang="less" scoped>
:deep(.tiny-drawer__body) {
  padding: 0 !important;
}

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
