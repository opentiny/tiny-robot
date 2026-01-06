/**
 * SenderCompat 类型定义（v0.3.0 兼容层）
 * 这些是旧版 Sender 的类型定义
 */

import type { VNode, Component } from 'vue'

// 主题类型
export type ThemeType = 'light' | 'dark'

// 输入模式类型
export type InputMode = 'single' | 'multiple'

// 提交触发方式
export type SubmitTrigger = 'enter' | 'ctrlEnter' | 'shiftEnter'

// 语音回调函数集合
export interface SpeechCallbacks {
  onStart: () => void
  onInterim: (transcript: string) => void
  onFinal: (transcript: string) => void
  onEnd: (transcript?: string) => void
  onError: (error: Error) => void
}

// 语音处理器接口
export interface SpeechHandler {
  start: (callbacks: SpeechCallbacks) => Promise<void> | void
  stop: () => Promise<void> | void
  isSupported: () => boolean
}

// 语音识别配置
export interface SpeechConfig {
  customHandler?: SpeechHandler
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  autoReplace?: boolean
  onVoiceButtonClick?: (isRecording: boolean, preventDefault: () => void) => void | Promise<void>
}

export type AutoSize = boolean | { minRows: number; maxRows: number }

export type TooltipRender = () => VNode | string

export interface ControlState {
  tooltips?: string | TooltipRender
  disabled?: boolean
  tooltipPlacement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
}

interface fileUploadConfig {
  accept?: string
  multiple?: boolean
  reset?: boolean
}

interface VoiceButtonConfig {
  icon?: VNode | Component
}

export interface ButtonGroupConfig {
  file?: ControlState & fileUploadConfig
  submit?: ControlState
  voice?: VoiceButtonConfig
}

// 高亮片段类型
export interface SuggestionTextPart {
  text: string
  isMatch: boolean
}

// 高亮函数类型
type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

// 建议项类型
export interface ISuggestionItem {
  content: string
  highlights?: string[] | HighlightFunction
}

// Sender组件属性（旧版）
export interface SenderProps {
  autofocus?: boolean
  autoSize?: AutoSize
  allowSpeech?: boolean
  allowFiles?: boolean
  clearable?: boolean
  disabled?: boolean
  defaultValue?: string | null
  loading?: boolean
  modelValue?: string
  mode?: InputMode
  maxLength?: number
  buttonGroup?: ButtonGroupConfig
  submitType?: SubmitTrigger
  speech?: boolean | SpeechConfig
  placeholder?: string
  showWordLimit?: boolean
  suggestions?: ISuggestionItem[]
  suggestionPopupWidth?: string | number
  activeSuggestionKeys?: string[]
  theme?: ThemeType
  templateData?: UserItem[]
  stopText?: string
}

// 组件事件定义（旧版）
export type SenderEmits = {
  (e: 'update:modelValue', value: string): void
  (e: 'update:templateData', value: UserItem[]): void
  (e: 'submit', value: string): void
  (e: 'clear'): void
  (e: 'speech-start'): void
  (e: 'speech-end', transcript?: string): void
  (e: 'speech-interim', transcript: string): void
  (e: 'speech-error', error: Error): void
  (e: 'suggestion-select', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'escape-press'): void
  (e: 'cancel'): void
  (e: 'reset-template'): void
  (e: 'files-selected', files: File[]): void
}

// UserItem 相关类型
export interface TextItem {
  id: string
  type: 'text'
  content: string
}

export interface TemplateItem {
  id: string
  type: 'template' | 'block'
  content: string
}

export type UserTextItem = Omit<TextItem, 'id'> & { id?: TextItem['id'] }

export type UserTemplateItem = Omit<Pick<TemplateItem, 'type' | 'content'>, 'id'> & { id?: TemplateItem['id'] }

export type UserItem = UserTextItem | UserTemplateItem
