import { ref, onUnmounted, computed } from 'vue'
import type { ActionButton, FileCardProps, FileCardEmits } from '../index.type'

/**
 * 触发下载的辅助函数
 * @param url 文件URL
 * @param fileName 文件名
 */
const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 管理文件卡片交互逻辑
 * @param props 组件属性
 * @param emit 组件事件触发器
 * @returns 交互处理器
 */
export function useFileCard(props: FileCardProps, emit: FileCardEmits) {
  const createdBlobUrls = ref<string[]>([])

  const isImage = computed(() => props.file.fileType === 'image')

  /**
   * 为原生 File 对象创建临时 Blob URL
   * @param file 原生 File 对象
   * @returns Blob URL
   */
  const createBlobUrl = (file: File) => {
    const blobUrl = URL.createObjectURL(file)
    createdBlobUrls.value.push(blobUrl)
    return blobUrl
  }

  /**
   * 处理文件预览
   */
  const handlePreview = () => {
    if (isImage.value && !props.file.previewUrl && props.file.rawFile) {
      const blobUrl = createBlobUrl(props.file.rawFile)
      emit('preview', { ...props.file, previewUrl: blobUrl })
    } else {
      emit('preview', props.file)
    }
  }

  /**
   * 处理文件下载
   */
  const downloadFile = () => {
    if (props.file.previewUrl) {
      triggerDownload(props.file.previewUrl, props.file.name)
    } else if (props.file.rawFile) {
      const url = createBlobUrl(props.file.rawFile)
      triggerDownload(url, props.file.name)
    }
    emit('download', props.file)
  }

  /**
   * 处理文件移除
   */
  const handleRemove = () => {
    emit('remove', props.file)
  }

  /**
   * 处理上传重试
   */
  const handleRetry = () => {
    emit('retry', props.file)
  }

  /**
   * 处理自定义操作
   * @param action 自定义操作按钮配置
   */
  const handleCustomAction = (action: ActionButton) => {
    if (action.handler) {
      action.handler(props.file)
    }

    if (action.type === 'preview' && isImage.value) {
      handlePreview()
    } else if (action.type === 'download' && isImage.value) {
      downloadFile()
    } else {
      emit('action', { action, file: props.file })
    }
  }

  // 组件卸载时，自动清理所有创建的 Blob URL
  onUnmounted(() => {
    createdBlobUrls.value.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    createdBlobUrls.value = []
  })

  return {
    isImage,
    handlePreview,
    downloadFile,
    handleRemove,
    handleRetry,
    handleCustomAction,
  }
}
