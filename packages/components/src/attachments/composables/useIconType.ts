import { computed, Component, ComputedRef } from 'vue'
import { FileType } from '../index.type'

export interface DefaultIconOptions {
  size?: number
  color?: string
}

// 默认图标组件（简单SVG示例）
const DefaultIcons: Record<FileType, (options?: DefaultIconOptions) => string> = {
  image: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || 'currentColor'}">
      <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z"/>
      <path d="M8.5,13.5l2.5,3l3.5-4.5l4.5,6H5L8.5,13.5z"/>
      <circle cx="6.5" cy="8.5" r="1.5"/>
    </svg>`,
  pdf: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || '#ff5252'}">
      <path d="M20,2H8C6.9,2,6,2.9,6,4v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M20,16H8V4h12V16z"/>
      <path d="M4,6H2v14c0,1.1,0.9,2,2,2h14v-2H4V6z"/>
      <path d="M10,9h2v4h2V9h2V7h-6V9z"/>
    </svg>`,
  word: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || '#4285f4'}">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h8v4h4V20z"/>
      <path d="M9.5,10l-1.5,8h2l0.5-2h1l0.5,2h2l-1.5-8H9.5z M10.5,14l0.25-1.5h0.5L11.5,14H10.5z"/>
    </svg>`,
  excel: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || '#00a650'}">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h8v4h4V20z"/>
      <path d="M10,11v2h4v-2H10z M10,15v2h4v-2H10z M7,11h2v2H7V11z M7,15h2v2H7V15z M15,11h2v2h-2V11z M15,15h2v2h-2V15z"/>
    </svg>`,
  ppt: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || '#ff6d01'}">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h8v4h4V20z"/>
      <path d="M10,10H9v6h1v-2h1c1.1,0,2-0.9,2-2v0c0-1.1-0.9-2-2-2H10z M11,12h-1v-1h1c0.28,0,0.5,0.22,0.5,0.5S11.28,12,11,12z"/>
      <path d="M14,10h2c1.1,0,2,0.9,2,2v2c0,1.1-0.9,2-2,2h-2V10z M16,14v-2h-1v2H16z"/>
    </svg>`,
  folder: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || '#ffc107'}">
      <path d="M10,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8c0-1.1-0.9-2-2-2h-8L10,4z"/>
    </svg>`,
  text: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || 'currentColor'}">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h7v5h5V20z"/>
      <path d="M8,12h8v2H8V12z M8,15h5v2H8V15z M8,9h2v2H8V9z"/>
    </svg>`,
  zip: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || '#795548'}">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h8v4h4V20z"/>
      <path d="M12,9h-2V8h2V9z M12,11h-2v1h2V11z M12,13h-2v1h2V13z M12,15h-2v1h2V15z M14,8h-2v1h2V8z M14,10h-2v1h2V10z M14,12h-2v1h2V12z M14,14h-2v1h2V14z"/>
    </svg>`,
  other: (options = {}) => `
    <svg width="${options.size || 24}" height="${options.size || 24}" viewBox="0 0 24 24" fill="${options.color || 'currentColor'}">
      <path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M18,20H6V4h7v5h5V20z"/>
      <circle cx="12" cy="14" r="2"/>
    </svg>`,
}

export function useIconType(customIcons?: Record<FileType, Component>, iconSize?: number) {
  /**
   * 获取指定文件类型的图标组件
   */
  const getIconComponent = (fileType: FileType = 'other'): ComputedRef<Component | string> => {
    return computed(() => {
      // 优先使用自定义图标
      if (customIcons?.[fileType]) {
        console.log(123)
        return customIcons[fileType]
      }

      // 否则使用默认图标
      return DefaultIcons?.[fileType]({ size: iconSize })
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
      text: '#607d8b',
      zip: '#795548',
      other: '#9e9e9e',
    }

    return colorMap[fileType] || colorMap.other
  }

  return {
    getIconComponent,
    getIconColor,
  }
}
