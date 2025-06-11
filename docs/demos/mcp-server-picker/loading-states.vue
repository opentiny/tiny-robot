<template>
  <div>
    <div style="margin-bottom: 16px">
      <p style="color: #666; margin-bottom: 8px">可以独立控制两个面板的加载状态</p>
      <div style="display: flex; gap: 16px; align-items: center">
        <label style="display: flex; align-items: center; gap: 8px">
          <input type="checkbox" v-model="loading" />
          已安装插件加载中
        </label>
        <label style="display: flex; align-items: center; gap: 8px">
          <input type="checkbox" v-model="marketLoading" />
          市场插件加载中
        </label>
        <button
          @click="simulateRefresh"
          style="padding: 4px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white"
        >
          模拟刷新
        </button>
      </div>
    </div>

    <McpServerPicker
      :installed-plugins="installedPlugins"
      :market-plugins="marketPlugins"
      :loading="loading"
      :market-loading="marketLoading"
      @refresh="handleRefresh"
      @plugin-toggle="handlePluginToggle"
      @plugin-add="handlePluginAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { McpServerPicker, PluginInfo } from '@opentiny/tiny-robot'

const loading = ref(false)
const marketLoading = ref(false)

const installedPlugins = ref([
  {
    id: 'plugin-1',
    name: '代码格式化',
    icon: 'https://via.placeholder.com/32/6366F1/white?text=FMT',
    description: '自动格式化代码，支持多种编程语言',
    toolCount: 6,
    enabled: true,
    expanded: false,
    tools: [
      {
        id: 'tool-1',
        name: 'JavaScript 格式化',
        description: '格式化 JavaScript 代码',
        enabled: true,
      },
      {
        id: 'tool-2',
        name: 'CSS 格式化',
        description: '格式化 CSS 样式',
        enabled: true,
      },
      {
        id: 'tool-3',
        name: 'HTML 格式化',
        description: '格式化 HTML 标记',
        enabled: false,
      },
    ],
  },
  {
    id: 'plugin-2',
    name: '版本控制',
    icon: 'https://via.placeholder.com/32/DC2626/white?text=GIT',
    description: 'Git 版本控制集成工具',
    toolCount: 8,
    enabled: false,
    expanded: false,
    tools: [],
  },
])

const marketPlugins = ref([
  {
    id: 'market-1',
    name: '性能优化',
    icon: 'https://via.placeholder.com/32/059669/white?text=OPT',
    description: '代码性能分析和优化建议',
    toolCount: 4,
  },
  {
    id: 'market-2',
    name: '安全检查',
    icon: 'https://via.placeholder.com/32/DC2626/white?text=SEC',
    description: '代码安全漏洞检测工具',
    toolCount: 7,
  },
  {
    id: 'market-3',
    name: '文档生成',
    icon: 'https://via.placeholder.com/32/7C3AED/white?text=DOC',
    description: '自动生成项目文档',
    toolCount: 3,
  },
])

const handleRefresh = (tab: string) => {
  console.log('刷新面板:', tab)

  if (tab === 'installed') {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      console.log('已安装插件刷新完成')
    }, 2000)
  } else if (tab === 'market') {
    marketLoading.value = true
    setTimeout(() => {
      marketLoading.value = false
      console.log('市场插件刷新完成')
    }, 1500)
  }
}

const simulateRefresh = () => {
  loading.value = true
  marketLoading.value = true

  setTimeout(() => {
    loading.value = false
  }, 2000)

  setTimeout(() => {
    marketLoading.value = false
  }, 3000)
}

const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  console.log('插件状态切换:', plugin.name, enabled)
  plugin.enabled = enabled
}

const handlePluginAdd = (plugin: PluginInfo) => {
  console.log('添加插件:', plugin.name)

  // 模拟添加过程
  const addingPlugin = { ...plugin, enabled: true, expanded: false, tools: [] }
  installedPlugins.value.push(addingPlugin)

  const index = marketPlugins.value.findIndex((p) => p.id === plugin.id)
  if (index > -1) {
    marketPlugins.value.splice(index, 1)
  }
}
</script>

<style scoped>
input[type='checkbox'] {
  margin: 0;
}

button:hover {
  background-color: #f9fafb;
}

label {
  cursor: pointer;
  user-select: none;
}
</style>
