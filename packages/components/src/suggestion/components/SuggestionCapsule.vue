<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, PropType, computed, watchEffect } from 'vue'
import type { SuggestionItem } from '../index.type'
import { IconEdit } from '@opentiny/tiny-robot-svgs'
import { getCachedTextWidth } from '../utils/dom'

const props = defineProps({
  suggestions: {
    type: Array as PropType<SuggestionItem[]>,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['suggestion-click', 'show-expand-button'])

// eslint-disable-next-line
const capsuleRef = ref<any>(null)
const showExpandButton = ref(false)
const isExpandedRef = ref(false)
const visibleSuggestions = ref<SuggestionItem[]>([])
const hiddenSuggestions = ref<SuggestionItem[]>([])
const maxItemsPerRow = ref(0)
const resizeObserver = ref<ResizeObserver | null>(null)

// 计算每行的胶囊排列，实现从下到上、从左往右的排序
const arrangedHiddenSuggestions = computed(() => {
  if (maxItemsPerRow.value <= 0 || hiddenSuggestions.value.length === 0) return []

  // 创建行数组
  const rows = []
  const totalSuggestions = [...hiddenSuggestions.value]

  // 按照每行最大容量分组
  while (totalSuggestions.length > 0) {
    rows.push(totalSuggestions.splice(0, maxItemsPerRow.value))
  }

  // 返回行的数组，以便从下到上显示
  return rows.reverse()
})

// 检查是否需要显示展开/收起按钮并计算能够容纳的最大胶囊数
const calculateLayout = async () => {
  await nextTick()
  if (!capsuleRef.value || props.suggestions.length === 0) {
    showExpandButton.value = false
    emit('show-expand-button', false)
    return
  }

  const container = capsuleRef.value
  const containerWidth = container.clientWidth

  // 重置胶囊分组
  visibleSuggestions.value = []
  hiddenSuggestions.value = []

  // 计算一行可以容纳多少个胶囊
  let accumulatedWidth = 0
  const margin = 8 // 胶囊之间的间距

  // 先测量一个平均宽度来估算每行可容纳的胶囊数
  let totalWidth = 0
  const sampleSize = Math.min(3, props.suggestions.length)
  for (let i = 0; i < sampleSize; i++) {
    // 使用缓存测量宽度
    const itemWidth = getCachedTextWidth(props.suggestions[i].text, 'tr-common-suggestions_item') + margin
    totalWidth += itemWidth
  }
  const avgItemWidth = totalWidth / sampleSize
  maxItemsPerRow.value = Math.max(1, Math.floor(containerWidth / avgItemWidth))

  // 计算每个胶囊的宽度并确定一行能容纳多少个
  for (let i = 0; i < props.suggestions.length; i++) {
    const suggestion = props.suggestions[i]
    // 使用缓存测量宽度
    const itemWidth = getCachedTextWidth(suggestion.text, 'tr-common-suggestions_item') + margin

    // 检查是否还能容纳下一个胶囊
    if (accumulatedWidth + itemWidth <= containerWidth) {
      accumulatedWidth += itemWidth
      visibleSuggestions.value.push(suggestion)
    } else {
      hiddenSuggestions.value.push(suggestion)
    }
  }

  // 如果有隐藏的胶囊，显示展开按钮
  showExpandButton.value = hiddenSuggestions.value.length > 0

  // 通知父组件是否需要显示展开按钮
  emit('show-expand-button', showExpandButton.value)
}

// 处理指令点击
const handleSuggestionClick = (suggestion: SuggestionItem) => {
  emit('suggestion-click', suggestion)
}

// 同步外部展开状态
watch(
  () => props.isExpanded,
  (val) => {
    isExpandedRef.value = val
  },
)

watchEffect(() => {
  if (capsuleRef.value && props.suggestions.length) {
    calculateLayout()
  }
})

// 组件挂载时使用ResizeObserver监听大小变化
onMounted(() => {
  if (capsuleRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      calculateLayout()
    })
    resizeObserver.value.observe(capsuleRef.value)
  }
})

// 组件卸载时移除监听器
onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})
</script>

<template>
  <!-- 胶囊式指令 -->
  <div class="tr-common-suggestions" ref="capsuleRef" :class="{ expanded: isExpandedRef }">
    <div class="tr-common-suggestions_content">
      <!-- 向上展开的隐藏胶囊 -->
      <div class="tr-common-suggestions_expanded-wrapper">
        <div v-show="isExpandedRef && hiddenSuggestions.length > 0" class="tr-common-suggestions_expanded-area">
          <div
            v-for="(row, rowIndex) in arrangedHiddenSuggestions"
            :key="`row-${rowIndex}`"
            class="tr-common-suggestions_row"
          >
            <div
              v-for="(suggestion, index) in row"
              :key="`hidden-${suggestion.id}-${index}`"
              class="tr-common-suggestions_item"
              @click="handleSuggestionClick(suggestion)"
            >
              <div class="tr-common-suggestions_item_icon">
                <IconEdit />
              </div>
              <div class="tr-common-suggestions_item_text">
                {{ suggestion.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定在底部的可见胶囊 -->
      <div class="tr-common-suggestions_container">
        <div
          v-for="(suggestion, index) in visibleSuggestions"
          :key="`visible-${suggestion.id}-${index}`"
          class="tr-common-suggestions_item"
          @click="handleSuggestionClick(suggestion)"
        >
          <div class="tr-common-suggestions_item_icon">
            <IconEdit />
          </div>
          <div class="tr-common-suggestions_item_text">
            {{ suggestion.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
