<script lang="ts" setup>
import { ref } from 'vue'
import { McpServerPicker } from '@opentiny/vue-tiny-robot'

// 示例插件数据
const installedPlugins = [
  {
    id: '1',
    name: '翻译助手',
    icon: 'https://example.com/icon1.png',
    description: '提供多语言翻译功能',
    enabled: true,
    tools: [
      { id: '1-1', name: '中英互译', description: '中英文互相翻译', enabled: true },
      { id: '1-2', name: '多语种翻译', description: '支持多种语言翻译', enabled: false },
    ],
  },
  {
    id: '2',
    name: '图像处理',
    icon: 'https://example.com/icon2.png',
    description: '提供图像处理功能',
    enabled: false,
  },
]

const marketPlugins = [
  {
    id: '3',
    name: '代码助手',
    icon: 'https://example.com/icon3.png',
    description: '代码补全和优化建议',
    category: 'dev',
    added: false,
  },
  {
    id: '4',
    name: '数据分析',
    icon: 'https://example.com/icon4.png',
    description: '数据可视化和分析工具',
    category: 'data',
    added: true,
  },
]

// 控制面板显示
const showCenterModal = ref(false)
const showTopRightModal = ref(false)
const showLeftDrawer = ref(false)
const showRightDrawer = ref(false)

// 不同的弹出配置
const centerModalConfig = {
  type: 'fixed',
  position: {}, // 默认居中
  zIndex: 1000,
}

const topRightModalConfig = {
  type: 'fixed',
  position: { top: '50px', right: '50px' },
  zIndex: 1000,
}

const leftDrawerConfig = {
  type: 'drawer',
  drawer: { direction: 'left', width: 400 },
  zIndex: 1000,
}

const rightDrawerConfig = {
  type: 'drawer',
  drawer: { direction: 'right', width: 500 },
  zIndex: 1000,
}
</script>

<template>
  <div class="demo-container">
    <h3>不同弹出配置示例</h3>

    <div class="button-group">
      <button class="demo-button" @click="showCenterModal = true">居中弹窗</button>
      <button class="demo-button" @click="showTopRightModal = true">右上角弹窗</button>
      <button class="demo-button" @click="showLeftDrawer = true">左侧抽屉</button>
      <button class="demo-button" @click="showRightDrawer = true">右侧抽屉</button>
    </div>

    <!-- 居中弹窗 -->
    <McpServerPicker
      v-model:visible="showCenterModal"
      :popup-config="centerModalConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      title="居中弹窗"
    />

    <!-- 右上角弹窗 -->
    <McpServerPicker
      v-model:visible="showTopRightModal"
      :popup-config="topRightModalConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      title="右上角弹窗"
    />

    <!-- 左侧抽屉 -->
    <McpServerPicker
      v-model:visible="showLeftDrawer"
      :popup-config="leftDrawerConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      title="左侧抽屉"
    />

    <!-- 右侧抽屉 -->
    <McpServerPicker
      v-model:visible="showRightDrawer"
      :popup-config="rightDrawerConfig"
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      title="右侧抽屉"
    />
  </div>
</template>

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
  transition: background-color 0.2s;
}

.demo-button:hover {
  background-color: #40a9ff;
}

.demo-button:active {
  background-color: #096dd9;
}
</style>
