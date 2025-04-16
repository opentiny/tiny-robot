import type { Ref } from 'vue'
/**
 * 组件核心类型定义
 */

// 主题类型
export type ThemeType = 'light' | 'dark'

// 输入模式类型
export type InputMode = 'single' | 'multiple'

// 提交触发方式
export type SubmitTrigger = 'enter' | 'ctrlEnter' | 'shiftEnter'

// 语音识别配置
export interface SpeechConfig {
  lang?: string // 识别语言，默认浏览器语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换当前输入内容
}

export type AutoSize = boolean | { minRows: number; maxRows: number }

// Sender组件属性
export interface SenderProps {
  autofocus?: boolean // 自动聚焦
  autoSize?: AutoSize // 自适应内容高度
  allowSpeech?: boolean // 是否允许语音识别
  allowFiles?: boolean // 是否允许上传附件
  clearable?: boolean // 是否显示清除按钮
  disabled?: boolean // 禁用状态
  defaultValue?: string | null // 默认值
  loading?: boolean // 加载状态
  modelValue?: string // 双向绑定值
  mode?: InputMode // 输入框模式：单行/多行
  maxLength?: number // 最大输入长度
  submitType?: SubmitTrigger // 提交触发方式
  speech?: boolean | SpeechConfig // 语音识别配置
  placeholder?: string // 占位文本
  showWordLimit?: boolean // 显示字数统计
  suggestions?: string[] // 输入建议
  theme?: ThemeType // 主题
}

export interface ActionButtonsProps {
  loading?: boolean // 加载状态
  disabled?: boolean // 是否禁用
  showClear?: boolean // 是否可以清除
  hasContent?: boolean // 是否有文本内容
  allowSpeech?: boolean // 是否允许语音识别
  speechStatus?: {
    isRecording: boolean // 是否正在录制
    isSupported: boolean // 是否支持语音识别
  }
  allowFiles?: boolean // 是否允许上传附件
  submitType?: SubmitTrigger // 提交触发方式
  showShortcuts?: boolean // 是否显示快捷键提示
}

// 组件事件定义
export type SenderEmits = {
  (e: 'update:modelValue', value: string): void
  (e: 'submit', value: string): void
  (e: 'clear'): void
  (e: 'speech-start'): void
  (e: 'speech-end', transcript?: string): void
  (e: 'speech-interim', transcript: string): void
  (e: 'speech-error', error: Error): void
  (e: 'suggestion-select', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'escape-press'): void // 按下Esc键时触发
  (e: 'cancel'): void // 取消发送状态时触发
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

// 键盘处理器返回类型
export interface KeyboardHandler {
  handleKeyPress: (e: KeyboardEvent) => void
  triggerSubmit: () => void
}

// 语音识别Hook返回类型
export interface SpeechHandler {
  speechState: SpeechState
  start: () => void
  stop: () => void
}
