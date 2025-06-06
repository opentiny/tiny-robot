<script setup lang="ts">
import TinyButton from '@opentiny/vue-button'
import TinyTabs from '@opentiny/vue-tabs'
import TinyTabItem from '@opentiny/vue-tab-item'
import TinyInput from '@opentiny/vue-input'
import { ref, reactive, computed, watch } from 'vue'
import { IconPlus } from '@opentiny/vue-icon'
import PluginCard from './components/PluginCard.vue'
import type { PluginInfo, McpServerPickerProps, McpServerPickerEmits } from './index.type'

const TinyIconPlus = IconPlus()

const props = withDefaults(defineProps<McpServerPickerProps>(), {
  installedPlugins: () => [],
  marketPlugins: () => [],
  searchPlaceholder: '搜索插件',
  enableSearch: true,
  defaultActiveTab: 'installed',
  showInstalledTab: true,
  showMarketTab: true,
  installedTabTitle: '已安装插件',
  marketTabTitle: '市场',
  title: '插件',
  showCustomAddButton: true,
  customAddButtonText: '自定义添加',
  allowPluginToggle: true,
  allowToolToggle: true,
  allowPluginDelete: true,
  allowPluginAdd: true,
  loading: false,
  marketLoading: false,
})

const emit = defineEmits<McpServerPickerEmits>()

const activeTab = ref(props.defaultActiveTab)
const installedSearch = ref('')
const marketSearch = ref('')

const currentSearchPlaceholder = computed(() =>
  activeTab.value === 'installed' ? props.searchPlaceholder : '搜索市场插件',
)

// 已添加插件数据（模拟数据）
const pluginData = reactive<PluginInfo>({
  id: 'deepseek',
  name: 'DeepSeek',
  icon: 'https://cdn.deepseek.com/chat/icon.png',
  description: 'DeepSeek 的官方扩展',
  toolCount: 3,
  enabled: true,
  expanded: false,
  tools: [
    {
      id: 'tool1',
      name: '代码生成工具',
      description: '智能代码生成和优化工具',
      enabled: true,
    },
    {
      id: 'tool2',
      name: '文档分析工具',
      description: '自动分析和总结文档内容',
      enabled: false,
    },
    {
      id: 'tool3',
      name: 'API 调用工具',
      description: '自动化API接口调用和测试',
      enabled: true,
    },
  ],
})

// 插件市场数据（模拟数据）
const marketPluginData = reactive<PluginInfo>({
  id: 'deepseek-market',
  name: 'DeepSeek',
  icon: 'https://cdn.deepseek.com/chat/icon.png',
  description: 'DeepSeek 的官方扩展',
  enabled: false,
})

// 合并数据：优先使用props数据，没有则使用模拟数据
const installedPluginsList = computed(() => (props.installedPlugins.length > 0 ? props.installedPlugins : [pluginData]))

const marketPluginsList = computed(() => (props.marketPlugins.length > 0 ? props.marketPlugins : [marketPluginData]))

// 监听Tab变化
watch(activeTab, (newTab, oldTab) => {
  if (newTab !== oldTab) {
    emit('tab-change', newTab)
  }
})

// 监听搜索变化
watch(installedSearch, (query) => {
  emit('search', query, 'installed')
})

watch(marketSearch, (query) => {
  emit('search', query, 'market')
})

// 事件处理函数
const handlePluginToggle = (plugin: PluginInfo, enabled: boolean) => {
  if (!props.allowPluginToggle) return

  // 更新本地数据（如果是模拟数据）
  if (plugin.id === pluginData.id) {
    pluginData.enabled = enabled
  }

  emit('plugin-toggle', plugin, enabled)
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  if (!props.allowToolToggle) return

  // 更新本地数据（如果是模拟数据）
  if (plugin.id === pluginData.id) {
    const tool = pluginData.tools?.find((t) => t.id === toolId)
    if (tool) {
      tool.enabled = enabled
    }
  }

  emit('tool-toggle', plugin, toolId, enabled)
}

const handleDeletePlugin = (plugin: PluginInfo) => {
  if (!props.allowPluginDelete) return
  emit('plugin-delete', plugin)
}

const handleAddPlugin = (plugin: PluginInfo) => {
  if (!props.allowPluginAdd) return
  emit('plugin-add', plugin)
}

const handlePluginExpand = (plugin: PluginInfo, expanded: boolean) => {
  // 更新本地数据（如果是模拟数据）
  if (plugin.id === pluginData.id) {
    pluginData.expanded = expanded
  }

  emit('plugin-expand', plugin, expanded)
}

const handleCustomAdd = () => {
  emit('custom-add')
}
</script>

<template>
  <div class="mcp-server-picker">
    <div class="mcp-server-picker__header">
      <div class="mcp-server-picker__header-left">{{ props.title }}</div>
      <div v-if="props.showCustomAddButton" class="mcp-server-picker__header-right">
        <TinyButton :icon="TinyIconPlus" circle @click="handleCustomAdd">
          {{ props.customAddButtonText }}
        </TinyButton>
      </div>
    </div>
    <div class="mcp-server-picker__content">
      <TinyTabs v-model="activeTab">
        <TinyTabItem v-if="props.showInstalledTab" :title="props.installedTabTitle" name="installed">
          <div class="mcp-server-picker__content-item">
            <div v-if="props.enableSearch" class="mcp-server-picker__content-installed-search">
              <TinyInput v-model="installedSearch" :placeholder="props.searchPlaceholder" />
            </div>

            <div class="mcp-server-picker__content-installed-list">
              <div v-if="props.loading" class="mcp-server-picker__loading">加载中...</div>
              <template v-else>
                <!-- 已安装插件列表 -->
                <PluginCard
                  v-for="plugin in installedPluginsList"
                  :key="plugin.id"
                  :plugin="plugin"
                  mode="installed"
                  :expandable="!!plugin.tools?.length"
                  v-model:expanded="plugin.expanded"
                  @toggle-plugin="(enabled) => handlePluginToggle(plugin, enabled)"
                  @toggle-tool="(toolId, enabled) => handleToolToggle(plugin, toolId, enabled)"
                  @delete-plugin="() => handleDeletePlugin(plugin)"
                  @update:expanded="(expanded) => handlePluginExpand(plugin, expanded)"
                />
              </template>
            </div>
          </div>
        </TinyTabItem>

        <TinyTabItem v-if="props.showMarketTab" :title="props.marketTabTitle" name="market">
          <div class="mcp-server-picker__content-market-header" v-if="props.enableSearch">
            <div style="width: 168px">
              <TinyInput v-model="marketSearch" placeholder="按照分类筛选" />
            </div>
            <div style="width: 264px; flex-shrink: 0">
              <TinyInput v-model="marketSearch" :placeholder="currentSearchPlaceholder" />
            </div>
          </div>

          <div class="mcp-server-picker__content-market-list">
            <div v-if="props.marketLoading" class="mcp-server-picker__loading">加载中...</div>
            <template v-else>
              <!-- 插件市场列表 -->
              <PluginCard
                v-for="plugin in marketPluginsList"
                :key="plugin.id"
                :plugin="plugin"
                mode="market"
                :expandable="false"
                :show-tool-count="false"
                @add-plugin="() => handleAddPlugin(plugin)"
              />
            </template>
          </div>
        </TinyTabItem>
      </TinyTabs>
    </div>
  </div>
</template>

<style lang="less" scoped>
.mcp-server-picker {
  width: 482px;
  height: calc(100vh - 20px);
  box-sizing: border-box;
  background: rgb(248, 248, 248);
  border-left: 1px solid rgb(219, 219, 219);
  border-right: 1px solid rgb(219, 219, 219);
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;

    &-left {
      font-size: 16px;
      font-weight: 600;
    }

    &-right {
      font-size: 14px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;

    :deep(.tiny-tabs__content) {
      margin: 0;
      overflow: visible;
    }

    &-market-header {
      display: flex;
      padding: 16px 0;
      justify-content: space-between;
    }

    &-market-list {
      display: flex;
      flex-direction: column;
      overflow: visible;
      gap: 16px;
    }

    &-installed-search {
      margin: 16px 0;
    }

    &-installed-list {
      display: flex;
      flex-direction: column;
      overflow: visible;
      gap: 16px;
    }
  }

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
    color: rgb(89, 89, 89);
    font-size: 14px;
  }
}

:deep(.tiny-tabs__nav-wrap) {
  width: 100%;
}

:deep(.tiny-tabs__item) {
  height: 32px;
}

:deep(.tiny-tabs__item__title) {
  font-size: 14px;
  font-weight: 600;
  color: rgb(25, 25, 25);
  line-height: 22px;
}
</style>
