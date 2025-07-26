<script setup lang="ts">
import TinyTabs from '@opentiny/vue-tabs'
import TinyTabItem from '@opentiny/vue-tab-item'
import TinyInput from '@opentiny/vue-input'
import TinySelect from '@opentiny/vue-select'
import TinyOption from '@opentiny/vue-option'
import { ref, computed, watch } from 'vue'
import { PluginCard, PluginModal } from './components'
import { IconClose, IconSearch, IconPlus } from '@opentiny/tiny-robot-svgs'
import type {
  PluginInfo,
  McpServerPickerProps,
  McpServerPickerEmits,
  PluginCreationData,
  PopupConfig,
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
  popupConfig: () => ({
    type: 'fixed',
    position: {},
    drawer: { direction: 'right' },
  }),
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
const marketCategory = ref('')

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

  emit('plugin-toggle', plugin, enabled)

  // 父子级联动
  if (plugin.tools?.length) {
    if (!enabled) {
      // 父级被禁用时，禁用所有子级工具
      plugin.tools.forEach((tool) => {
        if (tool.enabled) {
          emit('tool-toggle', plugin, tool.id, false)
        }
      })
    } else {
      // 父级被激活时，如果所有工具都是禁用的，则激活所有工具
      const enabledTools = plugin.tools.filter((t) => t.enabled)
      if (enabledTools.length === 0) {
        plugin.tools.forEach((tool) => {
          emit('tool-toggle', plugin, tool.id, true)
        })
      }
    }
  }
}

const handleToolToggle = (plugin: PluginInfo, toolId: string, enabled: boolean) => {
  if (!props.allowToolToggle) return

  emit('tool-toggle', plugin, toolId, enabled)

  // 父子级联动：根据子级工具的激活状态更新父级插件的激活状态
  if (plugin.tools?.length) {
    // 模拟本次切换后的工具状态，以计算父插件是否应该被激活
    const otherToolsEnabled = plugin.tools.filter((t) => t.id !== toolId).some((t) => t.enabled)
    const shouldPluginBeEnabled = enabled || otherToolsEnabled

    if (plugin.enabled !== shouldPluginBeEnabled) {
      emit('plugin-toggle', plugin, shouldPluginBeEnabled)
    }
  }
}

const handleDeletePlugin = (plugin: PluginInfo) => {
  if (!props.allowPluginDelete) return
  emit('plugin-delete', plugin)
}

const handleAddPlugin = (plugin: PluginInfo, added: boolean) => {
  if (!props.allowPluginAdd) return

  emit('plugin-add', plugin, added)
}

const showModal = ref(false)

// 事件处理函数
const handleCustomAdd = () => {
  showModal.value = true
}

const handleCustomAddPlugin = (type: 'form' | 'code', data: PluginCreationData) => {
  emit('plugin-create', type, data)
  showModal.value = false
}

const visible = defineModel<boolean>('visible', {
  required: true,
})

const handleClose = () => {
  emit('update:visible', false)
}

const pickerStyle = computed(() => {
  const { type, position, drawer } = props.popupConfig || {}

  const baseStyle: Record<string, string> = {
    'z-index': '1000',
    position: 'fixed',
  }

  if (type === 'fixed') {
    return {
      ...baseStyle,
      ...getFixedPositionStyles(position),
    }
  }

  if (type === 'drawer') {
    return {
      ...baseStyle,
      ...getDrawerPositionStyles(drawer),
    }
  }

  return baseStyle
})

// 获取固定位置样式
const getFixedPositionStyles = (position: PopupConfig['position'] = {}) => {
  const styles: Record<string, string> = {}

  // 处理位置属性
  Object.entries(position).forEach(([key, value]) => {
    if (value !== undefined) {
      styles[key] = typeof value === 'number' ? `${value}px` : value
    }
  })

  // 如果没有设置任何位置，使用默认居中
  if (Object.keys(styles).length === 0) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  return styles
}

// 获取抽屉位置样式
const getDrawerPositionStyles = (drawer: PopupConfig['drawer'] = { direction: 'right' }) => {
  const { direction } = drawer

  const baseDrawerStyles = {
    top: '0',
    bottom: '0',
    height: '100%',
  }

  if (direction === 'left') {
    return {
      ...baseDrawerStyles,
      left: '0',
      'border-right': '1px solid rgb(219, 219, 219)',
    }
  }

  return {
    ...baseDrawerStyles,
    right: '0',
    'border-left': '1px solid rgb(219, 219, 219)',
  }
}

// 计算抽屉动画类名
const drawerAnimationClass = computed(() => {
  const { type, drawer } = props.popupConfig || {}
  if (type !== 'drawer') return ''

  const direction = drawer?.direction || 'right'
  return `drawer-${direction}`
})

// 计算过渡名称
const transitionName = computed(() => {
  const { type } = props.popupConfig || {}
  return type === 'drawer' ? drawerAnimationClass.value : 'fade'
})
</script>

<template>
  <Transition :name="transitionName">
    <div
      v-if="visible"
      class="mcp-server-picker"
      :class="[`popup-type-${props.popupConfig?.type || 'fixed'}`, drawerAnimationClass]"
      :style="pickerStyle"
    >
      <div class="mcp-server-picker__header">
        <div class="mcp-server-picker__header-left">{{ props.title }}</div>
        <div class="mcp-server-picker__header-right">
          <div v-if="props.showCustomAddButton" class="mcp-server-picker__header-right-item" @click="handleCustomAdd">
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
                    @toggle-plugin="(enabled) => handlePluginToggle(plugin, enabled)"
                    @toggle-tool="(toolId, enabled) => handleToolToggle(plugin, toolId, enabled)"
                    @delete-plugin="() => handleDeletePlugin(plugin)"
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

      <!-- 插件表单添加弹窗 -->
      <PluginModal v-model:visible="showModal" @confirm="handleCustomAddPlugin" />
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.mcp-server-picker {
  box-sizing: border-box;
  background: rgb(255, 255, 255);
  border: 1px solid rgb(219, 219, 219);
  padding: 20px;

  // 默认样式(fixed模式)
  &.popup-type-fixed {
    width: 482px;
    height: auto;
    max-height: 100vh;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  // 抽屉模式样式
  &.popup-type-drawer {
    width: 482px;
    padding-top: 20px;
    height: 100vh;
    overflow-y: auto;
  }

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

      &-close {
        font-size: 24px;
        cursor: pointer;
      }
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

// 抽屉动画 - 使用less嵌套写法
.drawer-left,
.drawer-right {
  &-enter-active,
  &-leave-active {
    transition: transform 0.3s ease;
  }
}

.drawer-left {
  &-enter-from,
  &-leave-to {
    transform: translateX(-100%);
  }
}

.drawer-right {
  &-enter-from,
  &-leave-to {
    transform: translateX(100%);
  }
}

// 淡入淡出动画
.fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.3s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}

// 深度选择器样式
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
