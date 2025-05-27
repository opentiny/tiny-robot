<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import SuggestionCapsule from './components/SuggestionCapsule.vue'
import SuggestionPanel from './components/SuggestionPanel.vue'
import { useTriggerDetection } from './composables/useTriggerDetection'
import type {
  SuggestionItem,
  SuggestionProps,
  SuggestionEmits,
  TriggerHandler,
  TriggerInfo,
  TriggerContext,
  Category,
} from './index.type'
import { IconSparkles, IconArrowUp, IconArrowDown } from '@opentiny/tiny-robot-svgs'

import './index.less'

const props = withDefaults(defineProps<SuggestionProps>(), {
  open: undefined,
  theme: 'light',
  loading: false,
  title: '快捷指令',
  items: () => [],
  categories: () => [],
  triggerKeys: () => ['/'],
  maxVisibleItems: 5,
  defaultExpanded: false,
  closeOnOutsideClick: true,
})

const emit = defineEmits<SuggestionEmits>()

// 状态管理
const internalOpen = ref(false)
const currentItems = ref<SuggestionItem[]>([])
const triggerInfo = ref<TriggerContext>({
  text: '',
  position: 0,
})

// 是否展开完整指令列表
const isExpanded = ref(props.defaultExpanded)

// 是否显示展开按钮
const showExpandButton = ref(false)

// 切换指令列表的展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  emit('update:expanded', isExpanded.value)
}

// 处理显示展开按钮
const handleShowExpandButton = (value: boolean) => {
  showExpandButton.value = value
}

// 当前激活的分类
const activeCategory = ref<string>('')

// 当前选中的项目索引
const activeItemIndex = ref(-1)

// 元素引用
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof SuggestionPanel> | null>(null)

// 计算实际打开状态
const panelOpen = computed(() => (props.open !== undefined ? props.open : internalOpen.value))

// 计算当前激活分类的项目列表
const activeItems = computed(() => {
  // 如果没有分类或没有选中分类，直接显示 items
  if (props.categories.length === 0 || !activeCategory.value) {
    return currentItems.value
  }

  // 查找当前激活的分类
  const category = props.categories.find((cat) => cat.id === activeCategory.value)
  return category ? category.items : []
})

// 监听打开状态变化，重置选中项
watch(panelOpen, (isOpen) => {
  if (isOpen) {
    // 初始化选中项
    activeItemIndex.value = activeItems.value.length > 0 ? 0 : -1
  } else {
    // 重置选中项
    activeItemIndex.value = -1
  }
})

// 监听项目列表变化，更新选中项
watch(activeItems, (items) => {
  if (items.length > 0 && activeItemIndex.value === -1) {
    activeItemIndex.value = 0
  } else if (items.length === 0) {
    activeItemIndex.value = -1
  } else if (activeItemIndex.value >= items.length) {
    activeItemIndex.value = items.length - 1
  }
})

// 初始化激活的分类
watch(
  () => props.categories,
  (categories) => {
    if (categories.length > 0 && !activeCategory.value) {
      activeCategory.value = categories[0].id
    }
  },
  { immediate: true },
)

// 处理 items 数据
const processItems = () => {
  currentItems.value = [...props.items]
}

// 初始化hooks
const { detectTrigger } = useTriggerDetection(props)

// 处理胶囊式指令点击
const handleSuggestionClick = (item: SuggestionItem) => {
  // 发出事件，便于父组件处理回填
  emit('suggestion-select', item)

  // 如果存在触发信息，可以利用它进行回填
  // 否则直接将值传递给父组件
  emit('select', item.value, {
    text: '',
    position: 0,
  })

  // 如果指令包含模板，在选择后填充模板
  if (item.template) {
    emit('fill-template', item.template)
  }
}

// 触发事件处理
const handleTrigger: TriggerHandler = (info: TriggerInfo) => {
  if (info === false) {
    closePanel()
  } else {
    // 保存触发信息，用于回填
    if (typeof info === 'object' && info !== null) {
      triggerInfo.value = {
        text: info.text || '',
        position: info.position || 0,
      }
    }
    processItems()
    internalOpen.value = true
    emit('update:open', true)
  }
}

// 核心功能：处理输入事件，用于检测触发字符
const handleInputEvent = (event: Event, text: string) => {
  // 检测触发条件
  const newTriggerInfo = detectTrigger(event, text)

  if (newTriggerInfo) {
    // 设置触发信息
    triggerInfo.value = newTriggerInfo

    // 触发指令面板
    handleTrigger(newTriggerInfo)
    return true
  }

  // 如果指令面板已打开，关闭面板
  if (panelOpen.value && text === '') {
    handleTrigger(false)
    return true
  }

  return false
}

// 键盘事件处理，委托给面板组件
const handleKeyDown = (e: KeyboardEvent) => {
  if (panelOpen.value && panelRef.value) {
    panelRef.value.handleKeyDown(e)
    return
  }
}

// 关闭面板
const closePanel = () => {
  if (props.open === undefined) {
    internalOpen.value = false
  }
  emit('update:open', false)
  emit('close')
}

// 处理分类选择
const handleCategorySelect = (category: Category) => {
  activeCategory.value = category.id
  // 重置选中项索引
  activeItemIndex.value = 0

  emit('category-select', category)
}

// 处理指令选择
const handleSelect = (value: SuggestionItem, context: TriggerContext) => {
  emit('select', value.text, context)

  // 如果指令包含模板，在选择后填充模板
  if (value.template) {
    emit('fill-template', value.template)
  }

  closePanel()
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (props.closeOnOutsideClick && panelOpen.value && rootRef.value && !rootRef.value.contains(event.target as Node)) {
    closePanel()
  }
}

// 按钮切换面板是否可见
const handleOpenPanel = () => {
  if (panelOpen.value) {
    closePanel()
  } else {
    processItems()
    internalOpen.value = true
    emit('update:open', true)
  }
}

// 监听点击外部事件
onMounted(() => {
  if (props.closeOnOutsideClick) {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  if (props.closeOnOutsideClick) {
    document.removeEventListener('click', handleClickOutside)
  }
})

// 暴露给父组件的方法
defineExpose({
  trigger: handleTrigger,
  keyDown: handleKeyDown,
  input: handleInputEvent,
  toggleExpand,
})
</script>

<template>
  <div ref="rootRef" :class="['tr-suggestion', className, { 'tr-suggestion--dark': theme === 'dark' }]">
    <div class="tr-suggestion__header">
      <div class="tr-suggestion__trigger" @click="handleOpenPanel">
        <IconSparkles style="color: #1476ff" />
      </div>

      <!-- 胶囊式指令 -->
      <SuggestionCapsule
        :suggestions="items"
        :isExpanded="isExpanded"
        @suggestion-click="handleSuggestionClick"
        @show-expand-button="handleShowExpandButton"
      >
        <template #suggestion-icon="slotProps">
          <slot name="capsule-icon" :suggestion="slotProps.suggestion">
            <IconEdit />
          </slot>
        </template>
      </SuggestionCapsule>

      <!-- 常规指令完整内容触发按钮 -->
      <div v-if="showExpandButton" class="tr-suggestion__expand-button" @click="toggleExpand">
        <IconArrowUp v-if="!isExpanded" />
        <IconArrowDown v-else />
      </div>
    </div>

    <!-- 自定义输入区域 -->
    <slot name="trigger" :onTrigger="handleTrigger" :onKeyDown="handleKeyDown" :onInput="handleInputEvent">
      <!-- 默认输入框实现 -->
    </slot>

    <!-- 指令面板（弹窗显示在输入框上方） -->
    <SuggestionPanel
      v-if="panelOpen"
      ref="panelRef"
      class="tr-suggestion-panel placement-top"
      :items="currentItems"
      :categories="categories"
      :loading="loading"
      :title="title"
      :maxVisibleItems="maxVisibleItems"
      :triggerContext="triggerInfo"
      @close="closePanel"
      @select="handleSelect"
      @category-select="handleCategorySelect"
    >
      <!-- 转发所有插槽到面板组件 -->
      <template #title-icon>
        <slot name="title-icon">
          <IconSparkles style="font-size: 36px; color: #1476ff" />
        </slot>
      </template>

      <template #category-label="slotProps">
        <slot name="category-label" :category="slotProps.category"></slot>
      </template>

      <template #item="slotProps">
        <slot name="item" :item="slotProps.item" :active="slotProps.active"></slot>
      </template>

      <template #loading-indicator>
        <slot name="loading-indicator">
          <div class="tr-suggestion__loading-spinner"></div>
        </slot>
      </template>

      <template #empty>
        <slot name="empty">
          <p>无匹配结果</p>
        </slot>
      </template>
    </SuggestionPanel>
  </div>
</template>
