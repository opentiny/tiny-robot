import { computed, Component, ComputedRef } from 'vue'
import { FileStatus, FileType, BaseFileType, FileTypeMatcher } from '../index.type'
import {
  IconFileImage,
  IconFilePdf,
  IconFileWord,
  IconFileExcel,
  IconFilePpt,
  IconFileFolder,
  IconFileOther,
} from '@opentiny/tiny-robot-svgs'

// 默认图标组件映射
const DefaultIcons: Record<BaseFileType, Component> = {
  image: IconFileImage,
  pdf: IconFilePdf,
  word: IconFileWord,
  excel: IconFileExcel,
  ppt: IconFilePpt,
  folder: IconFileFolder,
  other: IconFileOther,
}

// 默认文件类型匹配器
const defaultMatchers: FileTypeMatcher[] = [
  {
    type: 'image',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type?.startsWith('image/') || false
      }
      const extension = file.split('.').pop()?.toLowerCase() || ''
      return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(extension)
    },
    icon: IconFileImage,
    priority: 100,
  },
  {
    type: 'pdf',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'application/pdf'
      }
      return file.toLowerCase().endsWith('.pdf')
    },
    icon: IconFilePdf,
    priority: 100,
  },
  {
    type: 'word',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return (
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      }
      const extension = file.split('.').pop()?.toLowerCase() || ''
      return ['doc', 'docx'].includes(extension)
    },
    icon: IconFileWord,
    priority: 100,
  },
  {
    type: 'excel',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return (
          file.type === 'application/vnd.ms-excel' ||
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      }
      const extension = file.split('.').pop()?.toLowerCase() || ''
      return ['xls', 'xlsx'].includes(extension)
    },
    icon: IconFileExcel,
    priority: 100,
  },
  {
    type: 'ppt',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return (
          file.type === 'application/vnd.ms-powerpoint' ||
          file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
      }
      const extension = file.split('.').pop()?.toLowerCase() || ''
      return ['ppt', 'pptx'].includes(extension)
    },
    icon: IconFilePpt,
    priority: 100,
  },
  {
    type: 'folder',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return false
      }
      return file.toLowerCase().endsWith('folder')
    },
    icon: IconFileFolder,
    priority: 100,
  },
]

export function useFileType(customIcons?: Record<string, Component>, customMatchers?: FileTypeMatcher[]) {
  /**
   * 获取所有匹配器（合并默认和自定义）
   */
  const getAllMatchers = (): FileTypeMatcher[] => {
    const allMatchers = [...defaultMatchers]

    if (customMatchers) {
      allMatchers.push(...customMatchers)
    }

    // 按优先级排序，优先级高的在前
    return allMatchers.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 根据文件名或File对象检测文件类型
   */
  const detectFileType = (file: File | string): FileType => {
    const matchers = getAllMatchers()

    for (const matcher of matchers) {
      if (matcher.matcher(file)) {
        return matcher.type
      }
    }

    return 'other'
  }

  /**
   * 生成唯一标识符
   */
  const generateID = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return size + ' B'
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB'
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB'
    }
  }

  /**
   * 创建文件预览URL
   * @returns 预览URL
   */
  const createPreviewUrl = (file: File): string => {
    if (file.type?.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return ''
  }

  /**
   * 批量创建文件附件对象
   */
  const createAttachments = (files: File[], defaultStatus: FileStatus = 'success') => {
    return files.map((file) => ({
      id: generateID(),
      name: file.name,
      status: defaultStatus,
      fileType: detectFileType(file),
      rawFile: file,
      size: file.size,
      previewUrl: createPreviewUrl(file),
    }))
  }

  /**
   * 获取指定文件类型的图标组件
   */
  const getIconComponent = (fileType: FileType = 'other'): ComputedRef<Component> => {
    return computed(() => {
      // 优先使用自定义图标
      if (customIcons?.[fileType]) {
        return customIcons[fileType]
      }

      // 查找匹配器中的图标
      const matchers = getAllMatchers()
      const matcher = matchers.find((m) => m.type === fileType)
      if (matcher?.icon) {
        return matcher.icon
      }

      // 使用默认图标
      if (DefaultIcons[fileType as BaseFileType]) {
        return DefaultIcons[fileType as BaseFileType]
      }

      // 最后使用 other 图标
      return DefaultIcons.other
    })
  }

  return {
    detectFileType,
    generateID,
    formatFileSize,
    createPreviewUrl,
    createAttachments,
    getIconComponent,
  }
}
