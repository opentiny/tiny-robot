<script setup lang="ts">
import { computed, watch, toRefs } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useSenderContext } from '../../sender/context'
import type { UploadButtonProps, UploadButtonEmits } from './index.type'
import ActionButton from '../action-button/index.vue'
import { IconImageUpload } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<UploadButtonProps>(), {
  accept: '*',
  multiple: true,
  reset: true,
  tooltipPlacement: 'top',
})

const emit = defineEmits<UploadButtonEmits>()

const { accept, multiple, reset } = toRefs(props)

// 从 context 获取 disabled 状态
const { disabled: contextDisabled } = useSenderContext()

const isDisabled = computed(() => props.disabled || contextDisabled.value)

// 使用 vueuse 的 useFileDialog
const { open: openFileDialog, files } = useFileDialog()

const open = (options?: Parameters<typeof openFileDialog>[0]) => {
  openFileDialog({
    accept: accept.value,
    multiple: multiple.value,
    reset: reset.value,
    ...options,
  })
}

// 处理文件选择
watch(files, (selectedFiles) => {
  if (!selectedFiles || selectedFiles.length === 0) return

  const fileList = Array.from(selectedFiles)

  // 文件数量验证
  if (props.maxCount && fileList.length > props.maxCount) {
    const error = new Error(`最多只能选择 ${props.maxCount} 个文件`)
    emit('error', error)
    return
  }

  // 文件大小验证
  if (props.maxSize) {
    const maxBytes = props.maxSize * 1024 * 1024
    const oversized = fileList.filter((f) => f.size > maxBytes)

    if (oversized.length > 0) {
      const error = new Error(`以下文件超过 ${props.maxSize}MB 限制: ${oversized.map((f) => f.name).join(', ')}`)
      emit('error', error, oversized) // 传递所有超限文件
      return
    }
  }

  // 触发选择事件
  emit('select', fileList)
})

// 处理按钮点击
const handleClick = () => {
  if (isDisabled.value) return
  open()
}

// 暴露方法
defineExpose({
  open,
})
</script>

<template>
  <ActionButton
    :icon="icon ?? IconImageUpload"
    :disabled="isDisabled"
    :size="size"
    :tooltip="tooltip"
    :tooltip-placement="tooltipPlacement"
    @click="handleClick"
  />
</template>
