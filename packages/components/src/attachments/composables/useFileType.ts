import { computed, Component, ComputedRef } from 'vue'
import { FileType, BaseFileType, FileTypeMatcher, Attachment, RawFileAttachment, UrlAttachment } from '../index.type'
import { getStringDetectionCandidates, getUrlDisplayName } from '../utils'
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
  },
]

interface UseFileTypeOptions {
  /**
   * 自定义图标
   */
  customIcons?: Record<string, Component>

  /**
   * 自定义文件类型匹配器
   */
  fileMatchers?: FileTypeMatcher[]
}

export function useFileType(options: UseFileTypeOptions = {}) {
  const { customIcons, fileMatchers } = options

  /**
   * 获取所有匹配器（合并默认和自定义）
   *
   * 自定义匹配器优先级高于默认匹配器
   */
  const getAllMatchers = (): FileTypeMatcher[] => {
    let allMatchers: FileTypeMatcher[] = []

    if (fileMatchers) {
      allMatchers = fileMatchers.concat(defaultMatchers)
    } else {
      allMatchers = defaultMatchers
    }

    return allMatchers
  }

  // 获取指定文件类型的图标组件
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

  /**
   * 根据文件名或File对象检测文件类型
   */
  const detectFileType = (file: File | string): FileType => {
    const matchers = getAllMatchers()
    const stringCandidates = typeof file === 'string' ? getStringDetectionCandidates(file) : []

    for (const matcher of matchers) {
      if (typeof file !== 'string' && matcher.matcher(file)) {
        return matcher.type
      }

      if (typeof file === 'string' && stringCandidates.some((candidate) => matcher.matcher(candidate))) {
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

  type RawFileItem = RawFileAttachment
  type UrlItem = UrlAttachment
  type InputItem = Attachment | Partial<Attachment>

  const isUrlItem = (item: InputItem): item is UrlItem => {
    return typeof item.url === 'string' && !!item.url
  }

  const isRawFileItem = (item: InputItem): item is RawFileItem => {
    return item.rawFile instanceof File
  }

  /**
   * 更新文件附件对象列表
   * @param items 输入的文件附件原始数据列表
   * @returns 标准化的文件附件对象列表
   */
  const normalizeAttachments = (items: InputItem[]): Attachment[] => {
    return items.reduce<Attachment[]>((normalizedItems, item) => {
      if (isRawFileItem(item)) {
        normalizedItems.push(transformRawFileItem(item))
      } else if (isUrlItem(item)) {
        normalizedItems.push(transformUrlItem(item))
      }

      return normalizedItems
    }, [])
  }

  type CommonProps = Pick<Attachment, 'id' | 'name' | 'status' | 'message'>

  const getCommonProps = (item: Partial<Attachment>): CommonProps => ({
    id: item.id || generateID(),
    name: item.name || '',
    status: item.status || 'success',
    message: item.message || '',
  })

  /**
   * 根据文件URL更新文件附件对象
   * @param item 含url的原始数据
   * @returns 标准化的UrlAttachment对象
   */
  const transformUrlItem = (item: UrlItem): UrlAttachment => {
    const common = getCommonProps(item)
    const url = item.url!
    const urlDisplayName = getUrlDisplayName(url)
    const resolvedName = common.name || urlDisplayName
    const fileTypeFromName = detectFileType(resolvedName)
    const inferredFileType = fileTypeFromName === 'other' ? detectFileType(url) : fileTypeFromName

    return {
      ...common,
      name: resolvedName,
      fileType: item.fileType ?? inferredFileType,
      size: item.size,
      url,
    }
  }

  /**
   * 根据rawFile文件更新文件附件对象
   * @param item 含rawFile的原始数据
   * @returns 标准化的RawFileAttachment对象
   */
  const transformRawFileItem = (item: RawFileItem): RawFileAttachment => {
    const common = getCommonProps(item)
    const rawFile = item.rawFile!
    return {
      ...common,
      name: common.name || rawFile.name,
      fileType: item.fileType ?? detectFileType(rawFile),
      rawFile,
      size: item.size ?? rawFile.size,
      url: item.url,
    }
  }

  return {
    detectFileType,
    generateID,
    formatFileSize,
    normalizeAttachments,
    getIconComponent,
  }
}
