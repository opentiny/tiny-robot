import type { Ref } from 'vue'
/**
 * 组件核心类型定义
 */

// 主题类型
export type ThemeType = 'light' | 'dark'

// 输入模式类型
export type InputMode = 'single' | 'multiple'

// 提交触发方式
export type SubmitTrigger = 'enter' | 'shiftEnter' | 'ctrlEnter'

// 语音识别配置
export interface SpeechConfig {
  lang?: string // 识别语言，默认浏览器语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换当前输入内容
}

// 按钮配置类型
export interface ButtonConfig {
  key: string
  icon?: string
  text?: string
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}

export type AutoSize = boolean | { minRows: number; maxRows: number }

// Sender组件属性
export interface SenderProps {
  defaultValue?: string // 默认值
  autoSize?: AutoSize // 自适应内容高度
  modelValue?: string // 双向绑定值
  submitType?: SubmitTrigger // 提交触发方式
  speech?: boolean | SpeechConfig // 语音识别配置
  debounceSubmit?: number // 提交防抖时间(ms)
  disabled?: boolean // 禁用状态
  loading?: boolean // 加载状态
  clearable?: boolean // 是否显示清除按钮
  placeholder?: string // 占位文本
  maxLength?: number // 最大输入长度
  minHeight?: number | string // 最小高度
  maxHeight?: number | string // 最大高度
  autofocus?: boolean // 自动聚焦
  showWordLimit?: boolean // 显示字数统计
  suggestions?: string[] // 输入建议
  theme?: ThemeType // 主题
  allowFiles?: boolean // 是否允许文件上传
  acceptFiles?: string // 允许的文件类型
  maxFileSize?: number // 最大文件大小(MB)
  mode?: InputMode // 输入框模式：单行/多行
}

// 组件事件定义
export type SenderEmits = {
  (e: 'update:modelValue', value: string): void
  (e: 'submit', value: string, files?: File[]): void
  (e: 'clear'): void
  (e: 'speech-start'): void
  (e: 'speech-end', transcript?: string): void
  (e: 'speech-interim', transcript: string): void
  (e: 'speech-error', error: Error): void
  (e: 'suggestion-select', value: string): void
  (e: 'file-select', files: any): void
  (e: 'file-error', error: Error): void
  (e: 'exceed-length'): void
  (e: 'focus'): void
  (e: 'blur'): void
}

// 语音识别状态
export interface SpeechState {
  isRecording: boolean // 是否正在录音
  isSupported: boolean // 是否支持语音识别
  error?: Error // 错误信息
}

// 语音识别Hook配置
export interface SpeechHookOptions extends SpeechConfig {
  onStart?: () => void
  onEnd?: (transcript?: string) => void
  onInterim?: (transcript: string) => void
  onFinal?: (transcript: string) => void
  onError?: (error: Error) => void
}

// 输入处理器返回类型
export interface InputHandler {
  inputValue: Ref<string>
  isComposing: Ref<boolean>
  clearInput: () => void
}

// 提交处理器返回类型
export interface SubmitHandler {
  handleKeyPress: (e: KeyboardEvent) => void
  triggerSubmit: () => void
}

// 文件处理器返回类型
export interface FileHandler {
  fileInput: Ref<HTMLInputElement | null>
  triggerFileUpload: () => void
  handleFileSelect: (e: Event) => void
  handleFileDrop: (e: DragEvent) => void
  handleFilePaste: (e: ClipboardEvent) => void
}

// 语音识别Hook返回类型
export interface SpeechHandler {
  speechState: SpeechState
  start: () => void
  stop: () => void
}
