<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, PropType } from 'vue'
import type { Question } from '../index.type'

const props = defineProps({
  questions: {
    type: Array as PropType<Question[]>,
    required: true,
  },
  maxVisible: {
    type: Number,
    default: 5,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['question-click', 'show-expand-button'])

const commonQuestionsRef = ref<HTMLElement | null>(null)
const showExpandButton = ref(false)
const isExpandedRef = ref(false)
const visibleQuestions = ref<Question[]>([])
const hiddenQuestions = ref<Question[]>([])

watch(
  () => props.isExpanded,
  (val) => {
    isExpandedRef.value = val
  },
)

// 检查是否需要显示展开/收起按钮并计算能够容纳的最大胶囊数
const checkOverflow = async () => {
  await nextTick()
  if (commonQuestionsRef.value) {
    const container = commonQuestionsRef.value
    const containerWidth = container.clientWidth

    // 重置胶囊分组
    visibleQuestions.value = []
    hiddenQuestions.value = []

    if (props.questions.length === 0) {
      showExpandButton.value = false
      return
    }

    // 计算一行可以容纳多少个胶囊
    let accumulatedWidth = 0
    const margin = 8 // 胶囊之间的间距

    // 克隆一个胶囊元素来测量其基本尺寸
    const tempItem = document.createElement('div')
    tempItem.className = 'tr-common-questions_item'
    tempItem.style.visibility = 'hidden'
    tempItem.style.position = 'absolute'
    container.appendChild(tempItem)

    // 计算每个胶囊的宽度并确定一行能容纳多少个
    for (let i = 0; i < props.questions.length; i++) {
      const question = props.questions[i]

      // 设置临时元素内容来测量其宽度
      tempItem.textContent = question.text
      const itemWidth = tempItem.offsetWidth + margin

      // 检查是否还能容纳下一个胶囊
      if (accumulatedWidth + itemWidth <= containerWidth) {
        accumulatedWidth += itemWidth
        visibleQuestions.value.push(question)
      } else {
        hiddenQuestions.value.push(question)
      }
    }

    // 移除临时元素
    container.removeChild(tempItem)

    // 如果有隐藏的胶囊，显示展开按钮
    showExpandButton.value = hiddenQuestions.value.length > 0
    // 初始状态设为未展开
    isExpandedRef.value = false

    emit('show-expand-button', showExpandButton.value)
  }
}

// 处理问题点击
const handleQuestionClick = (question: Question) => {
  emit('question-click', question)
}

// 监听 props 变化
watch(
  () => props.questions,
  () => {
    // 当问题列表变化时重新计算
    checkOverflow()
  },
  { deep: true },
)

// 处理窗口大小变化
const handleResize = () => {
  checkOverflow()
}

// 组件挂载时添加窗口大小变化监听
onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="tr-common-questions" ref="commonQuestionsRef" :class="{ expanded: isExpandedRef }">
    <!-- 渲染可见的胶囊 -->
    <div
      v-for="(question, index) in visibleQuestions"
      :key="`visible-${question.id}-${index}`"
      class="tr-common-questions_item"
      @click="handleQuestionClick(question)"
    >
      {{ question.text }}
    </div>

    <!-- 渲染被隐藏的胶囊（展开时显示） -->
    <div v-if="isExpandedRef">
      <div
        v-for="(question, index) in hiddenQuestions"
        :key="`hidden-${question.id}-${index}`"
        class="tr-common-questions_item"
        @click="handleQuestionClick(question)"
      >
        {{ question.text }}
      </div>
    </div>
  </div>
</template>
