<script setup lang="ts">
import { computed } from 'vue'
import { useSenderContext } from '../../sender/context'
import { IconClear } from '@opentiny/tiny-robot-svgs'
import ActionButton from '../action-button/index.vue'

// 从 Context 读取状态和配置
const { hasContent, clearable, clear, loading, defaultActions } = useSenderContext()

/**
 * 是否禁用
 */
const isDisabled = computed(() => {
  if (defaultActions.value?.clear?.disabled !== undefined) {
    return defaultActions.value.clear.disabled
  }
  return false
})

const tooltip = computed(() => defaultActions.value?.clear?.tooltip)

const tooltipPlacement = computed(() => defaultActions.value?.clear?.tooltipPlacement ?? 'top')

/**
 * 显示条件
 * - clearable: 允许清空
 * - hasContent: 有内容
 * - !loading: 非加载中
 * - !isDisabled: 非禁用
 */
const show = computed(() => clearable.value && hasContent.value && !loading.value && !isDisabled.value)

/**
 * 点击处理
 */
const handleClick = () => {
  if (!isDisabled.value) {
    clear()
  }
}
</script>

<template>
  <ActionButton
    v-if="show"
    :icon="IconClear"
    :disabled="isDisabled"
    :tooltip="tooltip"
    :tooltip-placement="tooltipPlacement"
    @click="handleClick"
  />
</template>
