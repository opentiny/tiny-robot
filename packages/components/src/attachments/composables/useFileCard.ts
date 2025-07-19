import { ref, onUnmounted, computed } from 'vue'
import type { ActionButton, FileCardProps, FileCardEmits } from '../index.type'

/**
 * 下载本地文件
 * @param url 文件URL
 * @param fileName 文件名
 */
const downloadLocalFile = (url: string, fileName: string) => {
  // 创建一个隐藏的 iframe 来触发下载
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  // 对于图片文件，使用 fetch 来强制下载
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    // 直接使用 a 标签下载
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  document.body.removeChild(iframe)
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
    emit('preview', props.file)
  }

  /**
   * 处理文件下载
   *
   * 本地文件：rawFile 有的话，组件内部下载
   * 远程文件：触发下载事件
   */
  const downloadFile = (event: MouseEvent) => {
    if (props.file.rawFile && !props.file.url) {
      const blobUrl = createBlobUrl(props.file.rawFile)
      downloadLocalFile(blobUrl, props.file.name || '')
    }

    emit('download', { event, file: props.file })
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
      handlePreview()
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
