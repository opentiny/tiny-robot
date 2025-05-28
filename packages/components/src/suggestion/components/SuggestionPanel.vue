<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { SuggestionItem, Category } from '../index.type'
import CategoryNav from './CategoryNav.vue'
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation'
import { IconSparkles, IconClose } from '@opentiny/tiny-robot-svgs'

const props = defineProps({
  items: {
    type: Array as PropType<SuggestionItem[]>,
    required: true,
  },
  categories: {
    type: Array as PropType<Category[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '指令',
  },
  maxVisibleItems: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['close', 'select', 'category-select', 'item-hover'])

const items = ref(props.items)

const { handleKeyDown, activeIndex } = useKeyboardNavigation(items, {
  initialIndex: 0,
  onClose: () => emit('close'),
  onSelect: (item) => emit('select', item),
})

// 当前激活的分类
const activeCategory = ref<string>(props.categories.length > 0 ? props.categories[0].id : '')

// 计算当前激活分类的项目列表
const filteredItems = computed(() => {
  // 如果没有分类或没有选中分类，直接显示 items
  if (props.categories.length === 0 || !activeCategory.value) {
    return props.items
  }

  // 查找当前激活的分类
  const category = props.categories.find((cat) => cat.id === activeCategory.value)
  return category ? category.items : []
})

// 处理分类选择
const handleCategorySelect = (categoryId: string) => {
  activeCategory.value = categoryId

  const category = props.categories.find((cat) => cat.id === categoryId)
  if (category) {
    emit('category-select', category)
  }
}

// 处理选择指令项
const handleSelect = (item: SuggestionItem) => {
  emit('select', item)
}

// 处理关闭面板
const handleClose = () => {
  emit('close')
}

// 处理鼠标悬停
const handleItemHover = (index: number) => {
  emit('item-hover', index)
}

defineExpose({
  handleKeyDown,
})
</script>

<template>
  <div class="tr-suggestion-panel">
    <!-- 面板标题 -->
    <div class="tr-suggestion-header">
      <div class="tr-suggestion-header-left">
        <div class="tr-suggestion-header-icon">
          <slot name="title-icon">
            <IconSparkles style="color: #1476ff; font-size: 24px" />
          </slot>
        </div>
        <div class="tr-suggestion-header-title">{{ title }}</div>
      </div>
      <span class="tr-suggestion-close-btn" @click="handleClose">
        <span class="close-icon"><IconClose /></span>
      </span>
    </div>

    <!-- 分类导航 -->
    <CategoryNav
      v-if="categories.length > 0"
      :categories="categories"
      :active-category="activeCategory"
      @category-select="handleCategorySelect"
    />

    <!-- 内容区域 -->
    <div
      class="tr-suggestion-content"
      :style="{ 'max-height': filteredItems.length > maxVisibleItems ? `${maxVisibleItems * 56}px` : 'auto' }"
    >
      <div v-if="loading" class="tr-suggestion-loading">
        <slot name="loading-indicator">
          <div class="tr-suggestion-loading-spinner"></div>
        </slot>
      </div>

      <ul v-else-if="filteredItems.length > 0">
        <li
          v-for="(item, index) in filteredItems"
          :key="item.id"
          class="tr-suggestion-list-item"
          :class="{ 'tr-suggestion-item-active': index === activeIndex }"
          @click="handleSelect(item)"
          @mouseenter="handleItemHover(index)"
        >
          <slot name="item" :item="item" :active="index === activeIndex">
            <div class="item-content">
              <div class="item-label">{{ item.text }}</div>
              <div v-if="item.description" class="item-description">{{ item.description }}</div>
            </div>
          </slot>
        </li>
      </ul>

      <div v-else class="tr-suggestion-empty">
        <slot name="empty">
          <p>无匹配结果</p>
        </slot>
      </div>
    </div>
  </div>
</template>
