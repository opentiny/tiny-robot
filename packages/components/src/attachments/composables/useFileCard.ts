import { ref, onUnmounted, computed } from 'vue'
import type { ActionButton, FileCardProps, FileCardEmits } from '../index.type'

/**
 * 强制下载文件的辅助函数
 * @param url 文件URL
 * @param fileName 文件名
 */
const forceDownload = (url: string, fileName: string) => {
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
  } else {
    // 对于远程文件，使用 fetch 来处理
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = fileName
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      })
      .catch((error) => {
        console.error('下载失败:', error)
        // 如果 fetch 失败，回退到打开新窗口
        window.open(url, '_blank')
      })
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
  const downloadFile = async () => {
    // 如果有自定义下载处理器，优先使用
    if (props.downloadHandler) {
      try {
        await props.downloadHandler(props.file)
        emit('download', props.file)
        return
      } catch (error) {
        console.error('自定义下载处理器执行失败:', error)
      }
    }

    // 使用默认下载逻辑
    if (props.file.previewUrl) {
      forceDownload(props.file.previewUrl, props.file.name)
    } else if (props.file.rawFile) {
      const url = createBlobUrl(props.file.rawFile)
      forceDownload(url, props.file.name)
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

    if (action.type === 'preview') {
      handlePreview()
    } else if (action.type === 'download') {
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
