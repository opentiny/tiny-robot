<script setup lang="ts">
import TinyButton from '@opentiny/vue-button'
import TinyTabs from '@opentiny/vue-tabs'
import TinyTabItem from '@opentiny/vue-tab-item'
import TinyInput from '@opentiny/vue-input'
import { ref, computed, watch } from 'vue'
import { IconPlus } from '@opentiny/vue-icon'
import PluginCard from './components/PluginCard.vue'
import CreatePluginDialog from './components/CreatePluginDialog.vue'
import type { PluginInfo, McpServerPickerProps, McpServerPickerEmits, CreatePluginData } from './index.type'

const TinyIconPlus = IconPlus()

const props = withDefaults(defineProps<McpServerPickerProps>(), {
  installedPlugins: () => [],
  marketPlugins: () => [],
  searchPlaceholder: '搜索插件',
  enableSearch: true,
  defaultActiveTab: 'installed',
  showInstalledTab: true,
  showMarketTab: true,
  visible: true,
  installedTabTitle: '已安装插件',
  marketTabTitle: '市场',
  title: '插件',
  showCustomAddButton: true,
  customAddButtonText: '自定义添加',
  allowPluginToggle: true,
  allowToolToggle: true,
  allowPluginDelete: true,
  allowPluginAdd: true,
  enableParentChildSync: true,
  loading: false,
  marketLoading: false,
})

const emit = defineEmits<McpServerPickerEmits>()

const activeTab = ref(props.defaultActiveTab)
const installedSearch = ref('')
const marketSearch = ref('')
const showCreatePluginDialog = ref(false)

const currentSearchPlaceholder = computed(() =>
  activeTab.value === 'installed' ? props.searchPlaceholder : '搜索市场插件',
)

// 直接使用 props 传入的数据
const installedPluginsList = computed(() => props.installedPlugins)
const marketPluginsList = computed(() => props.marketPlugins)

// 计算激活的插件数量
const activePluginCount = computed(() => {
  return installedPluginsList.value.filter((plugin) => plugin.enabled).length
})

// 监听激活插件数量变化
watch(
  activePluginCount,
  (newCount) => {
    emit('active-count-change', newCount)
  },
  { immediate: true },
)

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

  // 直接更新插件数据
  plugin.enabled = enabled

  // 父子级联动
  if (props.enableParentChildSync && plugin.tools?.length) {
    if (!enabled) {
      // 父级被禁用时，禁用所有子级工具
      plugin.tools.forEach((tool) => {
        if (tool.enabled) {
          tool.enabled = false
          emit('tool-toggle', plugin, tool.id, false)
        }
      })
    } else {
      // 父级被激活时，如果所有工具都是禁用的，则激活所有工具
      const enabledTools = plugin.tools.filter((t) => t.enabled)
      if (enabledTools.length === 0) {
        plugin.tools.forEach((tool) => {
          tool.enabled = true
          emit('tool-toggle', plugin, tool.id, true)
        })
      }
    }
  }

  emit('plugin-toggle', plugin, enabled)
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  if (!props.allowToolToggle) return

  // 直接更新工具数据
  const tool = plugin.tools?.find((t) => t.id === toolId)
  if (tool) {
    tool.enabled = enabled
  }

  // 父子级联动：根据子级工具的激活状态更新父级插件的激活状态
  if (props.enableParentChildSync && plugin.tools?.length) {
    const enabledTools = plugin.tools.filter((t) => t.enabled)
    const shouldPluginBeEnabled = enabledTools.length > 0

    if (plugin.enabled !== shouldPluginBeEnabled) {
      plugin.enabled = shouldPluginBeEnabled
      emit('plugin-toggle', plugin, shouldPluginBeEnabled)
    }
  }

  emit('tool-toggle', plugin, toolId, enabled)
}

const handleDeletePlugin = (plugin: PluginInfo) => {
  if (!props.allowPluginDelete) return
  emit('plugin-delete', plugin)
}

const handleAddPlugin = (plugin: PluginInfo, added: boolean) => {
  if (!props.allowPluginAdd) return

  // 直接更新插件对象的added状态
  plugin.added = added

  emit('plugin-add', plugin, added)
}

const handlePluginExpand = (plugin: PluginInfo, expanded: boolean) => {
  // 直接更新插件数据
  plugin.expanded = expanded

  emit('plugin-expand', plugin, expanded)
}

const handleCustomAdd = () => {
  showCreatePluginDialog.value = true
  emit('custom-add')
}

const handleCreatePluginConfirm = (data: CreatePluginData) => {
  emit('plugin-create', data)
  showCreatePluginDialog.value = false
}

const handleCreatePluginCancel = () => {
  showCreatePluginDialog.value = false
}
</script>

<template>
  <div v-if="props.visible" class="mcp-server-picker">
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
                  :enable-parent-child-sync="props.enableParentChildSync"
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
                @add-plugin="(added: boolean) => handleAddPlugin(plugin, added)"
              />
            </template>
          </div>
        </TinyTabItem>
      </TinyTabs>
    </div>

    <!-- 创建插件弹窗 -->
    <CreatePluginDialog
      v-model:visible="showCreatePluginDialog"
      title="创建插件"
      @confirm="handleCreatePluginConfirm"
      @cancel="handleCreatePluginCancel"
    />
  </div>
</template>

<style lang="less" scoped>
.mcp-server-picker {
  width: 482px;
  height: 100%;
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
