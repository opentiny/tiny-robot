<template>
  <action-button
    :icon="icon ?? IconUpload"
    :disabled="disabled"
    :size="size"
    :tooltip="computedTooltip"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import type { FileUploadProps, FileUploadEmits } from './index.type'
import ActionButton from '../chat-input/components/action-button/index.vue'
import { IconUpload } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<FileUploadProps>(), {
  accept: '*',
  multiple: false,
  reset: true,
})

const emit = defineEmits<FileUploadEmits>()

// 使用 vueuse 的 useFileDialog
const { open, files } = useFileDialog({
  accept: props.accept,
  multiple: props.multiple,
  reset: props.reset,
})

// 计算提示文本
const computedTooltip = computed(() => {
  if (props.disabled) return '文件上传已禁用'
  return props.tooltip ?? '上传文件'
})

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
      emit('error', error, oversized[0])
      return
    }
  }

  // 触发选择事件
  emit('select', fileList)
})

// 处理按钮点击
const handleClick = () => {
  if (props.disabled) return
  open()
}

// 暴露方法
defineExpose({
  open,
})
</script>
