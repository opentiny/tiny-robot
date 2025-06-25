import { ref, computed, Ref } from 'vue'
import type { Attachment, AttachmentsEmits } from '../index.type'

export function useImagePreview(fileList: Ref<Attachment[]>, emit: AttachmentsEmits) {
  const isPreviewVisible = ref(false)
  const previewImages = ref<Attachment[]>([])
  const previewCurrentIndex = ref(0)

  const show = (file: Attachment) => {
    // 更新文件列表中的文件信息（主要针对新创建的 blob url）
    const fileIndex = fileList.value.findIndex((item) => item.uid === file.uid)
    if (fileIndex !== -1 && file.previewUrl) {
      fileList.value.splice(fileIndex, 1, file)
    }

    // 如果是图片，则打开图片预览器
    if (file.fileType === 'image') {
      previewImages.value = fileList.value.filter((item) => item.fileType === 'image' && item.status !== 'error')
      const currentIndex = previewImages.value.findIndex((item) => item.uid === file.uid)

      if (currentIndex !== -1) {
        previewCurrentIndex.value = currentIndex
        isPreviewVisible.value = true
      }
    } else {
      // 否则，触发外部预览事件
      emit('file-preview', file)
    }
  }

  const close = () => {
    isPreviewVisible.value = false
  }

  const currentImage = computed(() => previewImages.value[previewCurrentIndex.value])

  return {
    isPreviewVisible,
    previewImages,
    previewCurrentIndex,
    currentImage,
    showImagePreview: show,
    closeImagePreview: close,
  }
}
