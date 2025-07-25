import { ref, Ref, h } from 'vue'
import type { Attachment, AttachmentListEmits } from '../index.type'
import ImagePreview from '../components/ImagePreview.vue'

export interface ImagePreviewOptions {
  /**
   * 是否启用下载功能
   */
  enableDownload?: boolean

  /**
   * 自定义下载处理函数
   */
  onDownload?: (event: MouseEvent, file: Attachment) => void
}

export function useImagePreview(
  fileList: Ref<Attachment[]>,
  emit: AttachmentListEmits,
  options: ImagePreviewOptions = {},
) {
  // 状态管理
  const isPreviewVisible = ref(false)
  const previewImages = ref<Attachment[]>([])
  const previewCurrentIndex = ref(0)

  // 更新当前索引
  const updateCurrentIndex = (index: number) => {
    previewCurrentIndex.value = index
  }

  const defaultShowImagePreviews = (file: Attachment) => {
    // 更新文件列表中的文件信息（主要针对新创建的 blob url）
    const fileIndex = fileList.value.findIndex((item) => item.id === file.id)
    if (fileIndex !== -1 && file.url) {
      fileList.value.splice(fileIndex, 1, file)
    }

    // 如果是图片，则打开图片预览器
    if (file.fileType === 'image') {
      // 过滤出所有图片类型且非错误状态的文件
      previewImages.value = fileList.value.filter(
        (item) => item.fileType === 'image' && item.status !== 'error' && item.status !== 'uploading',
      )
      const currentIndex = previewImages.value.findIndex((item) => item.id === file.id)

      if (currentIndex !== -1) {
        previewCurrentIndex.value = currentIndex
        isPreviewVisible.value = true
      }
    }
  }

  // 显示预览
  const show = (event: MouseEvent, file: Attachment) => {
    emit('preview', event, file)

    if (event.defaultPrevented) return

    defaultShowImagePreviews(file)
  }

  // 关闭预览
  const close = () => {
    isPreviewVisible.value = false
  }

  // 处理下载
  const handleDownload = (event: MouseEvent, file: Attachment) => {
    if (options.onDownload) {
      options.onDownload(event, file)
    } else {
      emit('download', event, file)
    }
  }

  // 渲染预览组件
  const renderPreview = () => {
    return isPreviewVisible.value
      ? h(ImagePreview, {
          images: previewImages.value,
          currentIndex: previewCurrentIndex.value,
          'onUpdate:currentIndex': updateCurrentIndex,
          onClose: close,
          onDownload: handleDownload,
        })
      : null
  }

  return {
    // 显示预览
    handlePreview: show,

    // 渲染预览组件
    renderPreview,
  }
}
