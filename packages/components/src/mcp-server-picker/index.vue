<script setup lang="ts">
import TinyTabs from '@opentiny/vue-tabs'
import TinyTabItem from '@opentiny/vue-tab-item'
import TinyInput from '@opentiny/vue-input'
import TinySelect from '@opentiny/vue-select'
import TinyOption from '@opentiny/vue-option'
import { ref, reactive, computed, watch } from 'vue'
import { PluginCard, PluginCodeDialog, PluginFormDialog } from './components'
import { IconClose, IconSearch, IconPlus } from '@opentiny/tiny-robot-svgs'
import type {
  PluginInfo,
  McpServerPickerProps,
  McpServerPickerEmits,
  AddPluginCodeData,
  AddPluginFormData,
  PluginDialogState,
} from './index.type'

const props = withDefaults(defineProps<McpServerPickerProps>(), {
  installedPlugins: () => [],
  marketPlugins: () => [],
  searchPlaceholder: '搜索插件',
  enableSearch: true,
  marketCategoryOptions: () => [],
  marketCategoryPlaceholder: '按照分类筛选',
  enableMarketCategoryFilter: true,
  defaultActiveTab: 'installed',
  showInstalledTab: true,
  showMarketTab: true,
  visible: false,
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
const marketCategory = ref('')

// 插件弹窗状态管理
const pluginDialogState = reactive<PluginDialogState>({
  codeEditor: false,
  formEditor: false,
})

const showCodeEditorDialog = computed({
  get: () => pluginDialogState.codeEditor,
  set: (value) => (pluginDialogState.codeEditor = value),
})

const showFormEditorDialog = computed({
  get: () => pluginDialogState.formEditor,
  set: (value) => (pluginDialogState.formEditor = value),
})

const currentSearchPlaceholder = computed(() =>
  activeTab.value === 'installed' ? props.searchPlaceholder : '搜索市场插件',
)

const installedPluginsList = computed(() => props.installedPlugins)
const marketPluginsList = computed(() => props.marketPlugins)

// 计算激活的插件数量
const activePluginCount = computed(() => {
  return installedPluginsList.value.filter((plugin) => plugin.enabled).length
})

watch(
  activePluginCount,
  (newCount) => {
    emit('update:activeCount', newCount)
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

watch(marketCategory, (category) => {
  emit('market-category-change', category)
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

const closeAllPluginDialogs = () => {
  pluginDialogState.codeEditor = false
  pluginDialogState.formEditor = false
}

// 统一的弹窗控制方法
const openPluginDialog = (type: 'codeEditor' | 'formEditor') => {
  // 关闭所有弹窗
  closeAllPluginDialogs()

  // 打开指定弹窗
  pluginDialogState[type] = true
}

// 事件处理函数
const handleCustomAdd = () => {
  openPluginDialog('formEditor')
  emit('custom-add')
}

const handleCodePluginConfirm = (data: AddPluginCodeData) => {
  emit('plugin-code-add', data)
  closeAllPluginDialogs()
}

const handleCodePluginCancel = () => {
  closeAllPluginDialogs()
}

const handleFormPluginConfirm = (data: AddPluginFormData) => {
  emit('plugin-form-add', data)
  closeAllPluginDialogs()
}

const handleFormPluginCancel = () => {
  closeAllPluginDialogs()
}

const handleSwitchToCodeEditor = () => {
  openPluginDialog('codeEditor')
}

const McpPanelVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <div v-if="McpPanelVisible" class="mcp-server-picker">
    <div class="mcp-server-picker__header">
      <div class="mcp-server-picker__header-left">{{ props.title }}</div>
      <div v-if="props.showCustomAddButton" class="mcp-server-picker__header-right">
        <div class="mcp-server-picker__header-right-item" @click="handleCustomAdd">
          <IconPlus style="font-size: 16px; cursor: pointer" />
          <span>{{ props.customAddButtonText }}</span>
        </div>
        <IconClose class="mcp-server-picker__header-right-close" @click="handleClose" />
      </div>
    </div>
    <div class="mcp-server-picker__content">
      <TinyTabs v-model="activeTab">
        <TinyTabItem v-if="props.showInstalledTab" :title="props.installedTabTitle" name="installed">
          <div class="mcp-server-picker__content-item">
            <div v-if="props.enableSearch" class="mcp-server-picker__content-installed-search">
              <TinyInput v-model="installedSearch" :placeholder="props.searchPlaceholder">
                <template #suffix>
                  <IconSearch style="font-size: 16px; cursor: pointer" />
                </template>
              </TinyInput>
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
          <div
            class="mcp-server-picker__content-market-header"
            v-if="props.enableSearch || props.enableMarketCategoryFilter"
          >
            <div v-if="props.enableMarketCategoryFilter" style="width: 168px">
              <TinySelect v-model="marketCategory" :placeholder="props.marketCategoryPlaceholder">
                <TinyOption
                  v-for="option in props.marketCategoryOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                >
                  {{ option.label }}
                </TinyOption>
              </TinySelect>
            </div>
            <div v-if="props.enableSearch" style="width: 264px; flex-shrink: 0">
              <TinyInput v-model="marketSearch" :placeholder="currentSearchPlaceholder">
                <template #suffix>
                  <IconSearch style="font-size: 16px; cursor: pointer" />
                </template>
              </TinyInput>
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

    <!-- 代码编辑器添加插件弹窗 -->
    <PluginCodeDialog
      v-model:visible="showCodeEditorDialog"
      title="创建插件"
      @confirm="handleCodePluginConfirm"
      @cancel="handleCodePluginCancel"
    />

    <!-- 可视化编辑器添加插件弹窗 -->
    <PluginFormDialog
      v-model:visible="showFormEditorDialog"
      title="添加插件"
      @confirm="handleFormPluginConfirm"
      @cancel="handleFormPluginCancel"
      @open-code-editor="handleSwitchToCodeEditor"
    />
  </div>
</template>

<style lang="less" scoped>
.mcp-server-picker {
  width: 482px;
  height: 100%;
  box-sizing: border-box;
  background: rgb(255, 255, 255);
  border: 1px solid rgb(219, 219, 219);
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

      display: flex;
      align-items: center;
      gap: 20px;

      &-item {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        color: rgb(25, 25, 25);
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        border: 1px solid rgb(89, 89, 89);
        box-sizing: border-box;
        border-radius: 999px;
        padding: 5px 16px;

        &:hover {
          background-color: rgb(245, 245, 245);
          border-color: rgb(25, 25, 25);
        }
      }
    }

    &-right-close {
      font-size: 24px;
      cursor: pointer;
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
