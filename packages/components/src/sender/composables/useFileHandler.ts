import { ref } from 'vue'
import type { SenderProps, SenderEmits } from '../types'

export function useFileHandler(props: SenderProps, emit: SenderEmits) {
  const fileInput = ref<HTMLInputElement | null>(null)

  const triggerFileUpload = () => {
    fileInput.value?.click()
  }

  const validateFiles = (files: File[]) => {
    if (!props.allowFiles) return false

    for (const file of files) {
      if (props.maxFileSize && file.size > props.maxFileSize * 1024 * 1024) {
        emit('file-error', new Error(`文件大小不能超过 ${props.maxFileSize}MB`))
        return false
      }

      if (props.acceptFiles) {
        const types = props.acceptFiles.split(',')
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!types.some((type) => type.includes(ext!))) {
          emit('file-error', new Error('不支持的文件类型'))
          return false
        }
      }
    }

    return true
  }

  const handleFileSelect = (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    if (validateFiles(files)) {
      emit('file-select', files)
    }
    // 重置 input 以支持选择相同文件
    if (fileInput.value) fileInput.value.value = ''
  }

  const handleFileDrop = (e: DragEvent) => {
    const files = Array.from(e.dataTransfer?.files || [])
    if (validateFiles(files)) {
      emit('file-select', files)
    }
  }

  const handleFilePaste = (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData?.files || [])
    if (files.length && validateFiles(files)) {
      emit('file-select', files)
    }
  }

  return {
    fileInput,
    triggerFileUpload,
    handleFileSelect,
    handleFileDrop,
    handleFilePaste,
  }
}
