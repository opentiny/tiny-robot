/**
 * Chat-Input Actions 组件导出
 *
 * 包含所有操作按钮组件：
 * - ActionButton: 基础按钮
 * - SubmitButton: 提交按钮
 * - ClearButton: 清空按钮
 * - UploadButton: 上传按钮
 * - WordCounter: 字数统计
 * - DefaultActionButtons: 默认按钮组合
 */

export { default as ActionButton } from './action-button/index.vue'
export { default as SubmitButton } from './submit-button/index.vue'
export { default as ClearButton } from './clear-button/index.vue'
export { default as UploadButton } from './upload-button/index.vue'
export { default as WordCounter } from './word-counter/index.vue'
export { default as DefaultActionButtons } from './default-actions/index.vue'

export type { ActionButtonProps, TooltipPlacement } from './action-button/index.type.js'
export type { UploadButtonProps, UploadButtonEmits } from './upload-button/index.type.js'
