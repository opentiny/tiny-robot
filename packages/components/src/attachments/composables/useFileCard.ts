import { ref, onUnmounted, computed } from 'vue'
import type { ActionButton, FileCardProps, FileCardEmits } from '../index.type'

/**
 * 下载本地文件
 * @param url 文件URL或Blob URL
 * @param fileName 文件名
 */
const downloadLocalFile = (url: string, fileName: string) => {
  // 处理blob和data协议的URL
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    // 添加到文档并触发点击
    document.body.appendChild(link)
    // 使用requestAnimationFrame确保DOM已更新
    requestAnimationFrame(() => {
      link.click()
      // 移除元素
      document.body.removeChild(link)
      // 清理可能的引用
      URL.revokeObjectURL(url)
    })
  }
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
  const handlePreview = (event: MouseEvent) => {
    emit('preview', event, props.file)
  }

  /**
   * 处理文件下载
   *
   * 策略：
   * 1. 总是先触发 download 事件
   * 2. 如果外部使用了 @download.prevent，则不执行默认行为
   * 3. 否则，对于本地文件执行内部下载逻辑
   */
  const downloadFile = (event: MouseEvent) => {
    // 总是触发 download 事件，让外部有机会处理
    emit('download', event, props.file)

    if (event.defaultPrevented) {
      return
    }

    // 对于本地文件，执行内部下载逻辑（除非外部使用了 .prevent）
    if (props.file.rawFile && !props.file.url) {
      const blobUrl = createBlobUrl(props.file.rawFile)
      downloadLocalFile(blobUrl, props.file.name || props.file.rawFile.name)
    }
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
  const handleCustomAction = (action: ActionButton, event: MouseEvent) => {
    event.stopPropagation()

    if (action.handler) {
      action.handler(props.file)
    }

    if (action.type === 'preview') {
      handlePreview(event)
    } else if (action.type === 'download') {
      downloadFile(event)
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
