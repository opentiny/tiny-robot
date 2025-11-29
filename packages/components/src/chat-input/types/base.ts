import type { VNode, Component } from 'vue'

// ============================================
// 基础类型
// ============================================

/**
 * 输入模式
 * - single: 单行模式，适用于简短输入
 * - multiple: 多行模式，适用于长文本输入
 */
export type InputMode = 'single' | 'multiple'

/**
 * 提交触发方式
 * - enter: Enter 键提交
 * - ctrlEnter: Ctrl+Enter 提交
 * - shiftEnter: Shift+Enter 提交
 */
export type SubmitTrigger = 'enter' | 'ctrlEnter' | 'shiftEnter'

/**
 * Tooltip 位置
 */
export type TooltipPlacement =
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

// ============================================
// 模板相关类型
// ============================================

/**
 * 模板项（用户侧）
 *
 * 用户传入的模板数据格式
 * 组件内部会转换为 Tiptap 节点格式
 */
export interface TemplateItem {
  /**
   * 模板 ID，可选
   * 如果不提供，组件会自动生成
   */
  id?: string

  /**
   * 类型
   * - text: 普通文本
   * - template: 模板块
   */
  type: 'text' | 'template'

  /**
   * 内容
   */
  content: string
}

/**
 * 模板块属性（内部使用）
 *
 * Tiptap 节点的属性定义
 */
export interface TemplateBlockAttrs {
  /**
   * 模板块 ID
   */
  id: string

  /**
   * 模板块内容
   */
  content: string
}

// ============================================
// 内容节点相关类型
// ============================================

/**
 * 内容节点
 *
 * 编辑器内容的结构化表示
 * 用于 submit 事件返回的结构化数据
 */
export interface ContentNode {
  /**
   * 节点类型
   * - text: 普通文本
   * - mention: 提及
   * - hardBreak: 换行符
   */
  type: 'text' | 'mention' | 'hardBreak'

  /**
   * 节点内容
   */
  content: string

  /**
   * 预设内容（仅 mention 类型有效）
   */
  preset?: string
}

// ============================================
// Mention 相关类型
// ============================================

/**
 * 提及项
 *
 * 用于 @ 提及功能的数据
 */
export interface MentionItem {
  /**
   * 唯一标识（可选）
   * 如果不提供，组件会自动生成
   */
  id?: string

  /**
   * 显示名称，如 "小小画家"（必传）
   */
  label: string

  /**
   * 预设内容（必传）
   * 选择该项后会自动填充的内容
   */
  preset: string

  /**
   * 图标（可选）
   */
  icon?: string
}

/**
 * Mention 节点属性（内部使用）
 */
export interface MentionAttrs {
  /**
   * ID
   */
  id: string

  /**
   * 标签
   */
  label: string

  /**
   * 预设内容
   */
  preset?: string
}

// ============================================
// 输入联想相关类型
// ============================================

/**
 * 高亮片段
 *
 * 用于在联想列表中高亮匹配的文本
 */
export interface SuggestionTextPart {
  /**
   * 文本内容
   */
  text: string

  /**
   * 是否匹配（需要高亮）
   */
  isMatch: boolean
}

/**
 * 高亮函数类型
 *
 * 自定义高亮逻辑的函数签名
 *
 * @param suggestionText - 建议项文本
 * @param inputText - 用户输入文本
 * @returns 高亮片段数组
 */
export type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

/**
 * 建议项
 *
 * 输入联想的单个建议项
 */
export interface SuggestionItem {
  /**
   * 建议内容
   */
  content: string

  /**
   * 高亮配置
   *
   * 三种方式：
   * 1. 未定义：使用默认高亮函数（前缀匹配）
   * 2. 字符串数组：指定要高亮的文本片段
   * 3. 函数：自定义高亮逻辑
   */
  highlights?: string[] | HighlightFunction

  /**
   * 元数据
   *
   * 可以存储额外的信息，如图标、描述等
   */
  metadata?: Record<string, unknown>
}

// ============================================
// 语音输入相关类型
// ============================================

/**
 * 语音回调函数集合
 *
 * 语音识别过程中的各种回调
 */
export interface SpeechCallbacks {
  /**
   * 开始识别
   */
  onStart: () => void

  /**
   * 中间结果（实时返回）
   *
   * @param transcript - 识别的文本
   */
  onInterim: (transcript: string) => void

  /**
   * 最终结果
   *
   * @param transcript - 识别的文本
   */
  onFinal: (transcript: string) => void

  /**
   * 结束识别
   *
   * @param transcript - 最终识别的文本（可选）
   */
  onEnd: (transcript?: string) => void

  /**
   * 识别错误
   *
   * @param error - 错误对象
   */
  onError: (error: Error) => void
}

/**
 * 语音处理器接口
 *
 * 统一的语音识别接口，支持内置和自定义实现
 */
export interface SpeechHandler {
  /**
   * 启动语音识别
   *
   * @param callbacks - 回调函数集合
   */
  start: (callbacks: SpeechCallbacks) => Promise<void> | void

  /**
   * 停止语音识别
   */
  stop: () => Promise<void> | void

  /**
   * 检查是否支持
   *
   * @returns 是否支持语音识别
   */
  isSupported: () => boolean
}

/**
 * 语音识别配置
 */
export interface SpeechConfig {
  /**
   * 自定义语音处理器
   *
   * 如果提供，则使用自定义实现
   * 否则使用内置的 Web Speech API
   */
  customHandler?: SpeechHandler

  /**
   * 识别语言
   *
   * @default 浏览器默认语言
   * @example 'zh-CN', 'en-US'
   */
  lang?: string

  /**
   * 是否持续识别
   *
   * @default false
   */
  continuous?: boolean

  /**
   * 是否返回中间结果
   *
   * @default false
   */
  interimResults?: boolean

  /**
   * 是否自动替换当前输入内容
   *
   * - true: 替换模式，识别结果覆盖现有内容
   * - false: 追加模式，识别结果追加到现有内容
   *
   * @default false
   */
  autoReplace?: boolean

  /**
   * 录音按钮点击拦截器
   *
   * 可以在按钮点击时执行自定义逻辑
   * 调用 preventDefault() 可以阻止默认行为
   *
   * @param isRecording - 当前是否正在录音
   * @param preventDefault - 阻止默认行为的函数
   */
  onVoiceButtonClick?: (isRecording: boolean, preventDefault: () => void) => void | Promise<void>
}

/**
 * 语音识别状态
 */
export interface SpeechState {
  /**
   * 是否正在录音
   */
  isRecording: boolean

  /**
   * 是否支持语音识别
   */
  isSupported: boolean

  /**
   * 错误信息
   */
  error?: Error
}

// ============================================
// 按钮配置相关类型
// ============================================

/**
 * Tooltip 渲染函数
 */
export type TooltipRender = () => VNode | string

/**
 * 控制状态
 *
 * 按钮的通用配置
 */
export interface ControlState {
  /**
   * 工具提示
   *
   * 可以是字符串或渲染函数
   */
  tooltips?: string | TooltipRender

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * Tooltip 位置
   *
   * @default 'top'
   */
  tooltipPlacement?: TooltipPlacement
}

/**
 * 文件上传配置
 */
export interface FileUploadConfig {
  /**
   * 接受的文件类型
   *
   * 与原生 input 的 accept 属性一致
   *
   * @example '.jpg,.png,image/*'
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
   */
  accept?: string

  /**
   * 是否支持多选文件
   *
   * @default true
   */
  multiple?: boolean

  /**
   * 选择文件后是否重置输入
   *
   * @default true
   */
  reset?: boolean
}

/**
 * 语音按钮配置
 */
export interface VoiceButtonConfig {
  /**
   * 自定义语音图标（未录音状态）
   *
   * 可以是 VNode 或 Component
   */
  icon?: VNode | Component
}

/**
 * 按钮组配置
 *
 * 用于细粒度控制各个按钮的行为
 */
export interface ButtonGroupConfig {
  /**
   * 文件上传按钮配置
   */
  file?: ControlState & FileUploadConfig

  /**
   * 提交按钮配置
   */
  submit?: ControlState

  /**
   * 语音按钮配置
   */
  voice?: VoiceButtonConfig
}

// ============================================
// 工具类型
// ============================================

/**
 * 自动高度配置
 */
export type AutoSize = boolean | { minRows: number; maxRows: number }

/**
 * 深度只读
 *
 * 递归地将所有属性设置为只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可选的深度部分
 *
 * 递归地将所有属性设置为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ============================================
// 常量类型
// ============================================

/**
 * 默认配置
 */
export interface DefaultConfig {
  /**
   * 默认占位符
   */
  placeholder: string

  /**
   * 默认模式
   */
  mode: InputMode

  /**
   * 默认提交触发方式
   */
  submitType: SubmitTrigger

  /**
   * 默认自动高度配置
   */
  autoSize: { minRows: number; maxRows: number }

  /**
   * 默认联想弹窗宽度
   */
  suggestionPopupWidth: number
}

/**
 * 错误代码
 */
export enum ErrorCode {
  /**
   * 编辑器初始化失败
   */
  EDITOR_INIT_FAILED = 'EDITOR_INIT_FAILED',

  /**
   * Context 未找到
   */
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',

  /**
   * 语音识别不支持
   */
  SPEECH_NOT_SUPPORTED = 'SPEECH_NOT_SUPPORTED',

  /**
   * 语音识别失败
   */
  SPEECH_RECOGNITION_FAILED = 'SPEECH_RECOGNITION_FAILED',

  /**
   * 文件上传失败
   */
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',

  /**
   * 模板插入失败
   */
  TEMPLATE_INSERT_FAILED = 'TEMPLATE_INSERT_FAILED',
}

/**
 * 错误类
 */
export class ChatInputError extends Error {
  /**
   * 错误代码
   */
  code: ErrorCode

  /**
   * 构造函数
   *
   * @param code - 错误代码
   * @param message - 错误信息
   */
  constructor(code: ErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'ChatInputError'
  }
}
