<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, PropType, computed } from 'vue'
import type { Question } from '../index.type'
import { IconEdit } from '@opentiny/tiny-robot-svgs'

const props = defineProps({
  questions: {
    type: Array as PropType<Question[]>,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['question-click', 'toggle-expand', 'hover-change'])

const commonQuestionsRef = ref<HTMLElement | null>(null)
const containerHovered = ref(false)
const showExpandButton = ref(false)
const isExpandedRef = ref(false)
const visibleQuestions = ref<Question[]>([])
const hiddenQuestions = ref<Question[]>([])
const maxItemsPerRow = ref(0)
const hoverDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// 计算是否有更多问题需要展开显示
const hasMoreQuestions = computed(() => hiddenQuestions.value.length > 0)

// 计算每行的胶囊排列，实现从下到上、从左往右的排序
const arrangedHiddenQuestions = computed(() => {
  if (maxItemsPerRow.value <= 0 || hiddenQuestions.value.length === 0) return []

  // 创建行数组
  const rows = []
  const totalQuestions = [...hiddenQuestions.value]

  // 按照每行最大容量分组
  while (totalQuestions.length > 0) {
    rows.push(totalQuestions.splice(0, maxItemsPerRow.value))
  }

  // 返回行的数组，以便从下到上显示
  return rows.reverse()
})

// 计算一行最多容纳的胶囊数量
const calculateMaxCapsulesPerRow = (container: HTMLElement, questions: Question[], reservedSpace: number = 40) => {
  if (questions.length === 0) return 0

  const containerWidth = container.clientWidth
  const margin = 8 // 胶囊之间的间距

  // 创建临时元素测量宽度
  const tempItem = document.createElement('div')
  tempItem.className = 'tr-common-questions_item'
  tempItem.style.visibility = 'hidden'
  tempItem.style.position = 'absolute'
  container.appendChild(tempItem)

  // 测量样本平均宽度
  let totalWidth = 0
  const sampleSize = Math.min(3, questions.length)
  for (let i = 0; i < sampleSize; i++) {
    tempItem.innerHTML = `<span class="icon-placeholder"></span>${questions[i].text}`
    const iconWidth = 24 // 图标宽度 + 间距
    const itemWidth = tempItem.offsetWidth + margin + iconWidth
    totalWidth += itemWidth
  }

  // 计算平均宽度
  const avgItemWidth = totalWidth / sampleSize

  // 移除临时元素
  container.removeChild(tempItem)

  return {
    maxItemsCount: Math.max(1, Math.floor((containerWidth - reservedSpace) / avgItemWidth)),
  }
}

// 计算每个胶囊的实际宽度并分组
const groupQuestionsByWidth = (
  container: HTMLElement,
  questions: Question[],
  containerWidth: number,
  reservedSpace: number = 40,
) => {
  const margin = 8 // 胶囊之间的间距
  const visible: Question[] = []
  const hidden: Question[] = []
  let accumulatedWidth = 0

  // 无问题时直接返回
  if (questions.length === 0) {
    return { visible, hidden }
  }

  // 创建临时元素测量宽度
  const tempItem = document.createElement('div')
  tempItem.className = 'tr-common-questions_item'
  tempItem.style.visibility = 'hidden'
  tempItem.style.position = 'absolute'
  container.appendChild(tempItem)

  // 计算每个胶囊的宽度并确定一行能容纳多少个
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]

    // 设置临时元素内容来测量其宽度
    tempItem.innerHTML = `<span class="icon-placeholder"></span>${question.text}`
    const iconWidth = 24 // 图标宽度 + 间距
    const itemWidth = tempItem.offsetWidth + margin + iconWidth

    // 检查是否还能容纳下一个胶囊
    const availableWidth = containerWidth - reservedSpace
    if (accumulatedWidth + itemWidth <= availableWidth) {
      accumulatedWidth += itemWidth
      visible.push(question)
    } else {
      hidden.push(question)
    }
  }

  // 移除临时元素
  container.removeChild(tempItem)

  return { visible, hidden }
}

watch(
  () => props.isExpanded,
  (val) => {
    isExpandedRef.value = val
    // 处理边缘隐藏问题
    if (!val) {
      visibleQuestions.value.push(hiddenQuestions.value[0])
    } else {
      visibleQuestions.value.pop()
    }
  },
)

// 检查是否需要显示展开/收起按钮并计算能够容纳的最大胶囊数
const checkOverflow = async () => {
  await nextTick()
  if (commonQuestionsRef.value) {
    const container = commonQuestionsRef.value
    const containerWidth = container.clientWidth
    const gradientSpace = 40 // 预留的空间以显示按钮

    // 重置胶囊分组
    visibleQuestions.value = []
    hiddenQuestions.value = []

    if (props.questions.length === 0) {
      showExpandButton.value = false
      return
    }

    const { maxItemsCount } = calculateMaxCapsulesPerRow(container, props.questions, gradientSpace) as {
      maxItemsCount: number
    }
    maxItemsPerRow.value = maxItemsCount

    // 计算胶囊分组
    const { visible, hidden } = groupQuestionsByWidth(container, props.questions, containerWidth, gradientSpace)

    // 更新可见和隐藏问题列表
    visibleQuestions.value = visible
    hiddenQuestions.value = hidden

    // 将第一个隐藏的问题移到可见列表中
    if (hiddenQuestions.value.length > 0) {
      visibleQuestions.value.push(hiddenQuestions.value[0])
    }

    // 如果有隐藏的胶囊，显示展开按钮
    showExpandButton.value = hiddenQuestions.value.length > 0

    // 初始状态设为未展开
    if (!props.isExpanded) {
      isExpandedRef.value = false
    }
  }
}

// 处理鼠标悬停
const handleMouseEnter = () => {
  if (hoverDebounceTimer.value) {
    clearTimeout(hoverDebounceTimer.value)
    hoverDebounceTimer.value = null
  }

  containerHovered.value = true
  emit('hover-change', true)
}

// 处理鼠标离开
const handleMouseLeave = () => {
  // 添加短暂延迟，防止鼠标在胶囊之间快速移动时触发不必要的状态切换
  hoverDebounceTimer.value = setTimeout(() => {
    containerHovered.value = false
    emit('hover-change', false)
    hoverDebounceTimer.value = null
  }, 500)
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

  if (hoverDebounceTimer.value) {
    window.clearTimeout(hoverDebounceTimer.value)
    hoverDebounceTimer.value = null
  }
})
</script>

<template>
  <div
    class="tr-common-questions"
    ref="commonQuestionsRef"
    :class="{ expanded: isExpandedRef }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="tr-common-questions_content">
      <!-- 向上展开的隐藏胶囊区域 -->
      <div class="tr-common-questions_expanded-wrapper">
        <div v-show="isExpandedRef && hiddenQuestions.length > 0" class="tr-common-questions_expanded-area">
          <div
            v-for="(row, rowIndex) in arrangedHiddenQuestions"
            :key="`row-${rowIndex}`"
            class="tr-common-questions_row"
          >
            <div
              v-for="(question, index) in row"
              :key="`hidden-${question.id}-${index}`"
              class="tr-common-questions_item"
              @click="handleQuestionClick(question)"
            >
              <div class="tr-common-questions_item_icon">
                <IconEdit />
              </div>
              <div class="tr-common-questions_item_text">
                {{ question.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定在底部的可见胶囊 -->
      <div class="tr-common-questions_container">
        <div
          v-for="(question, index) in visibleQuestions"
          :key="`visible-${question.id}-${index}`"
          class="tr-common-questions_item"
          @click="handleQuestionClick(question)"
          :class="{ 'last-item': !isExpandedRef && index === visibleQuestions.length - 1 && hasMoreQuestions }"
        >
          <div class="tr-common-questions_item_icon">
            <IconEdit />
          </div>
          <div class="tr-common-questions_item_text">
            {{ question.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
