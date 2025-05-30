import { computed, Component, ComputedRef } from 'vue'
import { FileType } from '../index.type'
import {
  IconFileImage,
  IconFilePdf,
  IconFileWord,
  IconFileExcel,
  IconFilePpt,
  IconFileFolder,
  IconFileOther,
} from '@opentiny/tiny-robot-svgs'

export interface DefaultIconOptions {
  size?: number
  color?: string
}

// 默认图标组件映射
const DefaultIcons: Record<FileType, Component> = {
  image: IconFileImage,
  pdf: IconFilePdf,
  word: IconFileWord,
  excel: IconFileExcel,
  ppt: IconFilePpt,
  folder: IconFileFolder,
  other: IconFileOther,
}

export function useIconType(customIcons?: Record<FileType, Component>) {
  /**
   * 获取指定文件类型的图标组件
   */
  const getIconComponent = (fileType: FileType = 'other'): ComputedRef<Component> => {
    return computed(() => {
      // 优先使用自定义图标
      if (customIcons?.[fileType]) {
        return customIcons[fileType]
      }

      // 否则使用默认图标
      return DefaultIcons?.[fileType]
    })
  }

  /**
   * 获取文件类型对应的颜色
   */
  const getIconColor = (fileType: FileType = 'other'): string => {
    const colorMap: Record<FileType, string> = {
      image: '#42a5f5',
      pdf: '#ff5252',
      word: '#4285f4',
      excel: '#00a650',
      ppt: '#ff6d01',
      folder: '#ffc107',
      other: '#9e9e9e',
    }

    return colorMap[fileType] || colorMap.other
  }

  return {
    getIconComponent,
    getIconColor,
  }
}
