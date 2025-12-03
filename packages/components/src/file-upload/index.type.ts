/**
 * FileUpload 组件类型定义
 */

import type { Component } from 'vue'

/**
 * FileUpload 组件 Props
 */
export interface FileUploadProps {
  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 接受的文件类型
   * @default '*'
   * @example 'image/*,.pdf,.doc'
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
  tooltip?: string

  /**
   * 按钮尺寸
   */
  size?: number | string

  /**
   * 自定义图标
   */
  icon?: Component
}

/**
 * FileUpload 组件 Emits
 */
export interface FileUploadEmits {
  /**
   * 文件选择
   * @param files - 选择的文件列表
   */
  (e: 'select', files: File[]): void

  /**
   * 文件验证失败
   * @param error - 错误信息
   * @param file - 验证失败的文件
   */
  (e: 'error', error: Error, file?: File): void
}
