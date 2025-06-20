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
      title="固定位置"
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

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { McpServerPicker } from '@opentiny/tiny-robot'

// 弹窗类型枚举
type ModalType = 'fixed' | 'leftDrawer' | 'rightDrawer' | null

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
