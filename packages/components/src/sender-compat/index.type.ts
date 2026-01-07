/**
 * SenderCompat 类型定义（v0.3.0 兼容层）
 * 这些是旧版 Sender 的类型定义
 */

import type { VNode, Component } from 'vue'
import type { InputMode, SubmitTrigger, AutoSize } from '../sender/types/base'
import type { SpeechConfig } from '../sender-actions/voice-button/speech.types'

// 主题类型
export type ThemeType = 'light' | 'dark'

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

// ============================================
// 建议项相关类型（旧版兼容层专用）
// 注意：这些类型与新版 sender 的 SuggestionItem 不同，仅用于兼容旧版 API
// ============================================

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

// ============================================
// UserItem 相关类型（旧版兼容层专用）
// 注意：这些类型与新版 sender 的 TemplateItem 不同，仅用于兼容旧版 API
// ============================================

export interface CompatTextItem {
  id: string
  type: 'text'
  content: string
}

export interface CompatTemplateItem {
  id: string
  type: 'template' | 'block'
  content: string
}

export type UserTextItem = Omit<CompatTextItem, 'id'> & { id?: CompatTextItem['id'] }

export type UserTemplateItem = Omit<Pick<CompatTemplateItem, 'type' | 'content'>, 'id'> & {
  id?: CompatTemplateItem['id']
}

export type UserItem = UserTextItem | UserTemplateItem
