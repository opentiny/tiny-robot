import { FileType } from '../index.type'

interface FileTypeMap {
  [key: string]: FileType
}

// 文件扩展名与类型映射
const extensionTypeMap: FileTypeMap = {
  // 图片类型
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  bmp: 'image',
  svg: 'image',

  // 文档类型
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'ppt',
  pptx: 'ppt',
  txt: 'text',

  // 压缩文件
  zip: 'zip',
  rar: 'zip',
  '7z': 'zip',
  tar: 'zip',
  gz: 'zip',

  // 文件夹
  folder: 'folder',
}

// MIME类型与文件类型映射
const mimeTypeMap: FileTypeMap = {
  'image/': 'image',
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
  'text/plain': 'text',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'zip',
  'application/x-7z-compressed': 'zip',
}

export function useFileType() {
  /**
   * 根据文件名或File对象检测文件类型
   */
  const detectFileType = (file: File | string): FileType => {
    // 处理文件对象
    if (typeof file !== 'string') {
      // 先尝试根据MIME类型判断
      for (const [mimePrefix, fileType] of Object.entries(mimeTypeMap)) {
        if (file.type.startsWith(mimePrefix)) {
          return fileType
        }
      }
      // 如果MIME类型不匹配，尝试根据文件名判断
      file = file.name
    }

    // 处理文件名
    const extension = file.split('.').pop()?.toLowerCase() || ''
    return extensionTypeMap[extension] || 'other'
  }

  /**
   * 生成唯一标识符
   */
  const generateUID = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  return {
    detectFileType,
    generateUID,
  }
}
