<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

// 类型定义
interface TabItem {
  key: string
  name: string
  link?: string
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  activeTab?: string
}

interface TabsEmits {
  'tab-change': [value: string]
  'tab-click': [tab: TabItem]
}

const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  activeTab: '',
})

const emit = defineEmits<TabsEmits>()

// 内部激活状态
const internalActiveTab = ref(props.activeTab)
// 下划线元素引用
const underlineRef = ref<HTMLDivElement | null>(null)
// 导航容器引用
const navRef = ref<HTMLDivElement | null>(null)

// 计算当前激活的标签页
const currentActiveTab = computed({
  get: () => internalActiveTab.value || getDefaultActiveTab(),
  set: (value: string) => {
    internalActiveTab.value = value
    emit('tab-change', value)
    // 当激活标签改变时更新下划线位置
    updateUnderlinePosition()
  },
})

// 获取默认激活的标签页（第一个非禁用的标签页）
const getDefaultActiveTab = (): string => {
  const firstEnabledTab = props.tabs.find((tab) => !tab.disabled)
  return firstEnabledTab?.key || ''
}

// 监听外部 activeTab 变化
watch(
  () => props.activeTab,
  (newActiveTab) => {
    if (newActiveTab && newActiveTab !== internalActiveTab.value) {
      internalActiveTab.value = newActiveTab
      // 外部激活标签改变时更新下划线位置
      updateUnderlinePosition()
    }
  },
)

// 处理标签页点击
const handleTabClick = (tab: TabItem) => {
  if (tab.disabled) return
  currentActiveTab.value = tab.key
  emit('tab-click', tab)
}

// 检查标签页是否激活
const isTabActive = (tabKey: string): boolean => {
  return currentActiveTab.value === tabKey
}

// 获取标签页类名
const getTabClasses = (tab: TabItem) => ({
  'custom-tabs__item': true,
  'custom-tabs__item--active': isTabActive(tab.key),
  'custom-tabs__item--disabled': tab.disabled,
})

// 更新下划线位置和宽度
const updateUnderlinePosition = () => {
  nextTick(() => {
    if (!navRef.value || !underlineRef.value) return

    // 在当前组件范围内查找激活的标签元素
    const activeTabEl = navRef.value.querySelector('.custom-tabs__item--active')
    if (activeTabEl) {
      // 获取激活标签的位置信息
      const rect = activeTabEl.getBoundingClientRect()
      // 获取导航容器的位置信息
      const navRect = navRef.value.getBoundingClientRect()

      // 设置下划线样式
      underlineRef.value.style.width = `${rect.width}px`
      underlineRef.value.style.left = `${rect.left - navRect.left}px`
    }
  })
}

// 初始化和监听窗口大小变化时更新下划线
watch(
  () => props.tabs,
  () => {
    // 当标签数据变化时更新下划线
    nextTick(updateUnderlinePosition)
  },
  { deep: true },
)

// 组件生命周期管理
let resizeHandler: (() => void) | null = null

onMounted(() => {
  // 初始化下划线位置
  updateUnderlinePosition()

  // 添加窗口大小改变监听器
  resizeHandler = () => updateUnderlinePosition()
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  // 清理事件监听器
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
})
</script>

<template>
  <div class="custom-tabs">
    <!-- 标签页头部 -->
    <div class="custom-tabs__header">
      <!-- 导航容器添加ref -->
      <div class="custom-tabs__nav" ref="navRef">
        <div v-for="tab in tabs" :key="tab.key" :class="getTabClasses(tab)" @click="handleTabClick(tab)">
          <span class="custom-tabs__item-title">{{ tab.name }}</span>
        </div>

        <!-- 下划线元素 -->
        <div ref="underlineRef" class="custom-tabs__item-underline custom-tabs__item-underline--active" />
      </div>
    </div>

    <!-- 标签页内容区域 -->
    <div class="custom-tabs__body">
      <slot :activeTab="currentActiveTab" :isTabActive="isTabActive" :tabs="tabs" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.custom-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    position: relative;
    flex-shrink: 0;
    height: var(--vp-nav-bottom-height, 48px);
  }

  &__nav {
    height: 100%;
    display: flex;
    gap: 1.5rem;
  }

  &__item {
    font-weight: 500;
    color: var(--vp-c-text-2);
    gap: 0.5rem;
    align-items: center;
    height: 100%;
    position: relative;
    font-size: 0.875rem;
    line-height: 48px;

    &-title {
      transition: color 0.2s ease;
      user-select: none;
    }

    &-underline {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 2px;
      background: #191919;
      border-radius: 1px;
      transition: all 0.3s ease;
      transform: translateX(0);

      &--active {
        background: #191919;
      }
    }

    &:hover:not(&--disabled) {
      color: var(--vp-c-text-1);
      transform: translateY(-1px);
    }

    &--active {
      color: #191919;
      font-weight: 600;

      .custom-tabs__item-title {
        color: #191919;
        font-weight: 600;
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;

      .custom-tabs__item-title {
        color: var(--vp-c-text-3);
      }
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__content {
    height: 100%;
    display: none;

    &--active {
      display: block;
    }
  }
}

/* 暗色模式适配 */
.dark .custom-tabs {
  &__header {
    border-bottom-color: var(--vp-c-divider);
  }

  &__item {
    color: var(--vp-c-text-2);

    &:hover:not(&--disabled) {
      color: var(--vp-c-text-1);
    }

    &--active {
      color: #191919;
    }

    &--disabled {
      .custom-tabs__item-title {
        color: var(--vp-c-text-3);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-tabs {
    &__header {
      padding: 0 12px;
    }

    &__nav {
      gap: 2px;
    }

    &__item {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
}
</style>
