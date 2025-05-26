<script setup lang="ts">
import { computed, ref, defineProps, defineEmits, defineExpose, watch, onMounted, withDefaults } from 'vue'
import { useQuestions } from './composables/useQuestions'
import CommonQuestions from './components/CommonQuestions.vue'
import HotQuestions from './components/HotQuestions.vue'
import type { Category, Question, QuestionProps, QuestionEmits } from './index.type'

import { IconSparkles, IconTypeAll, IconArrowUp, IconArrowDown } from '@opentiny/tiny-robot-svgs'
import './index.less'

const props = withDefaults(defineProps<QuestionProps>(), {
  categories: () => [] as Category[],
  commonQuestions: () => [] as Question[],
  initialExpanded: false,
  modalWidth: '640px',
  theme: 'light',
  closeOnClickOutside: true,
  loading: false,
})

// 切换问题展示
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const emit = defineEmits<QuestionEmits>()

const categories = computed(() => props.categories)
const isExpanded = ref(props.initialExpanded)
const showExpandButton = ref(false)

const { modalVisible, currentTheme, setActiveCategory, openModal, closeModal, setTheme, refreshData } =
  useQuestions(categories)

// 同步 props 到内部状态
watch(
  () => props.theme,
  (value) => {
    setTheme(value)
  },
)

// 处理问题点击
const handleQuestionClick = (question: Question) => {
  closeModal()
  emit('question-click', question)
}

// 处理鼠标悬停
const handleHoverChange = (val: boolean) => {
  showExpandButton.value = val
}

// 处理分类选择
const handleCategorySelect = (category: Category) => {
  if (category) {
    setActiveCategory(category.id)
    emit('select-category', category)
  }
}

// 组件挂载时初始化主题
onMounted(() => {
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})

// 暴露实例方法
defineExpose({
  openModal,
  closeModal,
  toggleFloating: toggleExpand,
  setActiveCategory,
  refreshData,
})
</script>

<template>
  <div class="tr-question-container" :class="[`theme-${theme}`]" :data-theme="theme">
    <div class="tr-question__header">
      <!-- 热门问题弹窗触发按钮 -->
      <div class="tr-question__trigger" @click="openModal">
        <IconSparkles style="color: #1476ff" />
      </div>

      <!-- 胶囊式问题 -->
      <CommonQuestions
        :questions="commonQuestions"
        :isExpanded="isExpanded"
        @question-click="handleQuestionClick"
        @hover-change="handleHoverChange"
      >
      </CommonQuestions>

      <!-- 常规问题完整内容触发按钮 -->
      <div v-if="showExpandButton" class="tr-question__expand-button" @click="toggleExpand">
        <IconArrowUp v-if="!isExpanded" />
        <IconArrowDown v-else />
      </div>
    </div>

    <!-- 热门问题弹窗 -->
    <HotQuestions
      :visible="modalVisible"
      :categories="categories"
      :modal-width="modalWidth"
      :loading="loading"
      :close-on-click-outside="closeOnClickOutside"
      @update:visible="modalVisible = $event"
      @close="modalVisible = false"
      @question-click="handleQuestionClick"
      @select-category="handleCategorySelect"
    >
      <!-- 传递插槽内容 -->
      <template #category-label="{ category }">
        <slot name="category-label" :category="category">
          <div class="category-icon">
            <IconTypeAll />
          </div>
          <span>{{ category.label }}</span>
        </slot>
      </template>

      <template #question-item="{ question, index }">
        <slot name="question-item" :question="question" :index="index">
          <span>{{ index + 1 }}.</span> {{ question.text }}
        </slot>
      </template>

      <template #loading-indicator>
        <slot name="loading-indicator">
          <div class="tr-question-loading-spinner"></div>
        </slot>
      </template>

      <template #empty-state>
        <slot name="empty-state">
          <p>暂无相关问题</p>
        </slot>
      </template>
    </HotQuestions>
  </div>
</template>
