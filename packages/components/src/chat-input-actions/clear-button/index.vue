<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../chat-input/context'
import { IconClear } from '@opentiny/tiny-robot-svgs'
import ActionButton from '../action-button/index.vue'
import type { TooltipPlacement } from '../../chat-input/types/base'

/**
 * ClearButton Props
 *
 * 支持通过 props 覆盖 actionsConfig 的配置
 */
const props = defineProps<{
  disabled?: boolean
  tooltip?: string
  tooltipPlacement?: TooltipPlacement
}>()

// 从 Context 读取状态和配置
const { hasContent, clearable, clear, loading, actionsConfig } = useChatInputContext()

/**
 * 是否禁用
 */
const isDisabled = computed(() => {
  if (props.disabled !== undefined) return props.disabled
  if (actionsConfig.value?.clear?.disabled !== undefined) {
    return actionsConfig.value.clear.disabled
  }
  return false
})

const tooltip = computed(() => props.tooltip ?? actionsConfig.value?.clear?.tooltip)

const tooltipPlacement = computed(() => props.tooltipPlacement ?? actionsConfig.value?.clear?.tooltipPlacement ?? 'top')

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
