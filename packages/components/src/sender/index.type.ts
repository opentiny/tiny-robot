import type { Ref, VNode } from 'vue'
import type { TemplateItem, TextItem } from './types/editor.type'

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

export type TooltipRender = () => VNode | string

export interface ControlState {
  tooltips?: string | TooltipRender // 工具提示
  disabled?: boolean // 是否禁用
}

interface fileUploadConfig {
  accept?: string // 接受的文件类型
  multiple?: boolean // 是否支持多选文件
  reset?: boolean // 选择文件后是否重置输入，默认为 true
}

export interface ButtonGroupConfig {
  file?: ControlState & fileUploadConfig // 文件上传按钮
  submit?: ControlState // 提交按钮
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
  // 三种可能的高亮方式：
  // 1. 未定义：使用默认高亮函数
  // 2. 字符串数组：指定要高亮的文本片段
  // 3. 函数：自定义高亮逻辑
  highlights?: string[] | HighlightFunction
}

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
  buttonGroup?: ButtonGroupConfig // 按钮组配置
  submitType?: SubmitTrigger // 提交触发方式
  speech?: boolean | SpeechConfig // 语音识别配置
  placeholder?: string // 占位文本
  showWordLimit?: boolean // 显示字数统计
  suggestions?: ISuggestionItem[] // 输入建议
  suggestionPopupWidth?: string | number // 联想建议弹窗宽度，如 '300px' 或 300
  activeSuggestionKeys?: string[] // 激活建议项的按键，默认 ['Enter', 'Tab']
  theme?: ThemeType // 主题
  templateData?: UserItem[] // 模板数据
  stopText?: string // 停止按钮文字，不传则只显示图标
}

export interface ActionButtonsProps {
  loading?: boolean // 加载状态
  disabled?: boolean // 是否禁用
  showClear?: boolean // 是否可以清除
  hasContent?: boolean // 是否有文本内容
  buttonGroup?: ButtonGroupConfig
  allowSpeech?: boolean // 是否允许语音识别
  speechStatus?: {
    isRecording: boolean // 是否正在录制
    isSupported: boolean // 是否支持语音识别
  }
  allowFiles?: boolean // 是否允许上传附件
  submitType?: SubmitTrigger // 提交触发方式
  showShortcuts?: boolean // 是否显示快捷键提示
  isOverLimit?: boolean // 是否超出字数限制
  stopText?: string // 停止按钮文字，不传则只显示图标
}

// 组件事件定义
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
  (e: 'escape-press'): void // 按下Esc键时触发
  (e: 'cancel'): void // 取消发送状态时触发
  (e: 'reset-template'): void // 重置模板状态，退出模板编辑模式
  (e: 'files-selected', files: File[]): void // 文件选择事件
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

export type UserTextItem = Omit<TextItem, 'id'> & { id?: TextItem['id'] }

export type UserTemplateItem = Omit<Pick<TemplateItem, 'type' | 'content'>, 'id'> & { id?: TemplateItem['id'] }

export type UserItem = UserTextItem | UserTemplateItem
