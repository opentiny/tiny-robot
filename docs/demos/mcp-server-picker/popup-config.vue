<template>
  <div class="demo-container">
    <h3>弹窗配置示例 - 单实例模式</h3>
    <p class="description">此示例展示了如何确保同时最多只弹出一个弹窗，提供更好的用户体验。</p>

    <div class="button-group">
      <!-- 固定位置-->
      <button class="demo-button" :class="{ active: activeModal === 'fixed' }" @click="openModal('fixed')">
        固定位置
      </button>
      <button class="demo-button" :class="{ active: activeModal === 'leftDrawer' }" @click="openModal('leftDrawer')">
        左侧抽屉
      </button>
      <button class="demo-button" :class="{ active: activeModal === 'rightDrawer' }" @click="openModal('rightDrawer')">
        右侧抽屉
      </button>
      <button class="demo-button close-button" :disabled="!activeModal" @click="closeModal">关闭弹窗</button>
    </div>

    <div v-if="activeModal" class="status-info">当前激活弹窗：{{ getModalDisplayName(activeModal) }}</div>

    <!-- 固定位置 -->
    <McpServerPicker
      v-model:visible="showFixedModal"
      :popup-config="fixedModalConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      title="固定位置"
    />

    <!-- 左侧抽屉 -->
    <McpServerPicker
      v-model:visible="showLeftDrawer"
      :popup-config="leftDrawerConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      title="左侧抽屉"
    />

    <!-- 右侧抽屉 -->
    <McpServerPicker
      v-model:visible="showRightDrawer"
      :popup-config="rightDrawerConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :market-category-options="marketCategoryOptions"
      title="右侧抽屉"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { McpServerPicker, PluginInfo, MarketCategoryOption } from '@opentiny/tiny-robot'

// 弹窗类型枚举
type ModalType = 'fixed' | 'leftDrawer' | 'rightDrawer' | null

// 示例插件数据
const installedPlugins = ref<PluginInfo[]>([
  {
    id: 'plugin-1',
    name: 'GitHub 集成',
    icon: 'https://github.com/favicon.ico',
    description: '与 GitHub 仓库集成，提供代码搜索、PR 管理等功能',
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
// 统一的弹窗状态管理
const activeModal = ref<ModalType>(null)

// 计算属性：基于活动弹窗类型控制各个弹窗的显示状态
const showFixedModal = computed({
  get: () => activeModal.value === 'fixed',
  set: (value: boolean) => {
    activeModal.value = value ? 'fixed' : null
  },
})

const showLeftDrawer = computed({
  get: () => activeModal.value === 'leftDrawer',
  set: (value: boolean) => {
    activeModal.value = value ? 'leftDrawer' : null
  },
})

const showRightDrawer = computed({
  get: () => activeModal.value === 'rightDrawer',
  set: (value: boolean) => {
    activeModal.value = value ? 'rightDrawer' : null
  },
})

// 弹窗操作方法
const openModal = (type: ModalType) => {
  activeModal.value = type
}

const closeModal = () => {
  activeModal.value = null
}

// 获取弹窗显示名称
const getModalDisplayName = (type: ModalType): string => {
  const nameMap = {
    leftDrawer: '左侧抽屉',
    rightDrawer: '右侧抽屉',
    fixed: '固定位置',
  }
  return type ? nameMap[type] : ''
}

// 不同的弹出配置
const fixedModalConfig = {
  type: 'fixed',
  position: { top: 0, bottom: 0, right: '20%' },
}

const leftDrawerConfig = {
  type: 'drawer',
  drawer: { direction: 'left' },
}

const rightDrawerConfig = {
  type: 'drawer',
  drawer: { direction: 'right' },
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.demo-button {
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
}

.demo-button:hover:not(:disabled) {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.demo-button:active:not(:disabled) {
  background-color: #096dd9;
  transform: translateY(0);
}

.demo-button.active {
  background-color: #52c41a;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.4);
}

.demo-button.active:hover {
  background-color: #73d13d;
}

.demo-button.close-button {
  background-color: #ff4d4f;
}

.demo-button.close-button:hover:not(:disabled) {
  background-color: #ff7875;
}

.demo-button:disabled {
  background-color: #d9d9d9;
  color: #00000040;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.status-info {
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  color: #52c41a;
  font-size: 14px;
  font-weight: 500;
}

.description {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style>
