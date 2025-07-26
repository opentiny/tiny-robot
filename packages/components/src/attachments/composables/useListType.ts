import { computed, Ref } from 'vue'
import type { Attachment, DisplayVariant } from '../index.type'

/**
 * 处理listType自动检测的组合函数
 * @param fileList 文件列表的响应式引用
 * @param specifiedListType 用户指定的listType
 * @returns 实际使用的listType
 */
export function useListType(fileList: Ref<Attachment[]>, specifiedListType?: DisplayVariant) {
  const actualListType = computed(() => {
    // 如果明确指定了listType且不是auto，直接使用
    if (specifiedListType && specifiedListType !== 'auto') {
      return specifiedListType
    }

    // 自动检测逻辑
    if (fileList.value.length === 0) {
      return 'card' // 默认卡片模式
    }

    // 检查是否所有文件都是图片
    const allImages = fileList.value.every((file) => file.fileType === 'image')

    // 只有当所有文件都是图片时，才使用picture模式
    // 如果有任何非图片文件，使用card模式
    return allImages ? 'picture' : 'card'
  })

  return {
    actualListType,
  }
}
