<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, PropType, computed } from 'vue'
import { IconClose } from '@opentiny/vue-icon'
import { TinyButton } from '@opentiny/vue'
import type { Category, Question } from '../index.type'

const TinyIconClose = IconClose()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array as PropType<Category[]>,
    default: () => [],
  },
  modalWidth: {
    type: String,
    default: '640px',
  },
  showCategoryIcons: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  wrapQuestions: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'close', 'select-category', 'question-click'])

// 当前激活的分类
const activeCategory = ref<string>('')

// 计算当前激活分类的问题列表
const activeQuestions = computed(() => {
  if (!activeCategory.value && props.categories.length > 0) {
    return props.categories[0].questions || []
  }

  const category = props.categories.find((cat) => cat.id === activeCategory.value)
  return category ? category.questions : []
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

// 关闭弹窗
const closeModal = () => {
  emit('update:visible', false)
  emit('close')
}

// 处理分类选择
const handleCategorySelect = (categoryId: string) => {
  activeCategory.value = categoryId
  emit(
    'select-category',
    props.categories.find((cat) => cat.id === categoryId),
  )
}

// 处理问题点击
const handleQuestionClick = (question: Question) => {
  emit('question-click', question)
}

// 处理点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (props.closeOnClickOutside && !event.composedPath().includes(modalRef.value!)) {
    closeModal()
  }
}

const modalRef = ref<HTMLElement | null>(null)
</script>

<template>
  <div v-if="visible" class="tr-question-modal-backdrop" @mousedown="handleClickOutside">
    <div ref="modalRef" class="tr-question-panel" :style="{ width: modalWidth }" @mousedown.stop>
      <div class="tr-question-header">
        <div class="tr-question-header-title">热门问题</div>
        <span class="tr-question-close-btn" @click="closeModal">
          <TinyButton :icon="TinyIconClose" type="text" />
        </span>
      </div>

      <div v-if="categories.length > 0" class="tr-question-categories">
        <div
          v-for="category in categories"
          :key="category.id"
          class="tr-question-categories-item"
          :class="{ active: activeCategory === category.id }"
          @click="handleCategorySelect(category.id)"
        >
          <slot name="category-label" :category="category">
            <i v-if="showCategoryIcons && category.icon" :class="['category-icon', category.icon]"></i>
            <span>{{ category.label }}</span>
          </slot>
        </div>
      </div>

      <div :class="['tr-question-content', { 'tr-question-content-wrap': wrapQuestions }]">
        <div v-if="loading" class="tr-question-loading">
          <slot name="loading-indicator">
            <div class="tr-question-loading-spinner"></div>
          </slot>
        </div>

        <ul v-else-if="activeQuestions.length > 0">
          <li
            v-for="(question, index) in activeQuestions"
            :key="question.id"
            class="tr-question-list-item"
            @click="handleQuestionClick(question)"
          >
            <slot name="question-item" :question="question" :index="index">
              <span>{{ index + 1 }}.</span> {{ question.text }}
            </slot>
          </li>
        </ul>

        <div v-else class="tr-question-empty">
          <slot name="empty-state">
            <p>暂无相关问题</p>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
