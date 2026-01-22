import { Component } from 'vue'
import { TooltipContent, TooltipPlacement } from '../types/common'

export interface UploadButtonProps {
  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 接受的文件类型
   * @default '*'
   */
  accept?: string

  /**
   * 是否支持多选
   * @default false
   */
  multiple?: boolean

  /**
   * 是否在选择文件后重置 input
   * @default true
   */
  reset?: boolean

  /**
   * 文件大小限制（MB）
   */
  maxSize?: number

  /**
   * 最大文件数量
   */
  maxCount?: number

  /**
   * 按钮提示文本
   */
  tooltip?: TooltipContent

  /**
   * 按钮尺寸
   */
  size?: number | string

  /**
   * 自定义图标
   */
  icon?: Component

  /**
   * Tooltip 位置
   */
  tooltipPlacement?: TooltipPlacement
}

export interface UploadButtonEmits {
  /**
   * 文件选择
   */
  (e: 'select', files: File[]): void

  /**
   * 文件验证失败
   */
  (e: 'error', error: Error, files?: File[]): void
}
