/**
 * Chat-Input 组件类型定义
 *
 * 本文件包含 Chat-Input 组件的所有类型定义
 * 遵循"组合优于配置"的设计哲学
 */

import type { Editor } from '@tiptap/vue-3'
import type { Ref, VNode, Component } from 'vue'

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
 * 主题类型
 */
export type ThemeType = 'light' | 'dark'

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
// 技能 Mention 相关类型
// ============================================

/**
 * 技能项
 *
 * 用于 @ 提及功能的技能数据
 */
export interface SkillItem {
  /**
   * 唯一标识（必传）
   */
  id: string

  /**
   * 显示名称，如 "小小画家"（必传）
   */
  label: string

  /**
   * 预设内容（必传）
   * 选择该技能后会自动填充的内容
   */
  preset: string

  /**
   * 图标（可选）
   */
  icon?: string
}

/**
 * 技能 Mention 节点属性（内部使用）
 */
export interface SkillMentionAttrs {
  /**
   * 技能 ID
   */
  id: string

  /**
   * 技能标签
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
// 主组件 Props
// ============================================

/**
 * Chat-Input 组件 Props
 *
 * 遵循最小化 Props 原则
 * 大部分功能通过插槽实现
 */
export interface ChatInputProps {
  // ===== 核心数据 =====

  /**
   * 输入内容（双向绑定）
   *
   * 支持 v-model
   */
  modelValue?: string

  /**
   * 默认值
   *
   * 仅在初始化时使用
   */
  defaultValue?: string

  /**
   * 模板数据（双向绑定）
   *
   * 支持 v-model:templateData
   */
  templateData?: TemplateItem[]

  /**
   * 技能列表
   *
   * 用于 @ 提及功能
   */
  skills?: SkillItem[]

  // ===== 基础配置 =====

  /**
   * 占位符文本
   *
   * @default '请输入内容...'
   */
  placeholder?: string

  /**
   * 是否禁用
   *
   * @default false
   */
  disabled?: boolean

  /**
   * 是否加载中
   *
   * 加载状态下显示停止按钮
   *
   * @default false
   */
  loading?: boolean

  /**
   * 是否自动聚焦
   *
   * @default false
   */
  autofocus?: boolean

  // ===== 模式控制 =====

  /**
   * 输入模式
   *
   * - single: 单行模式
   * - multiple: 多行模式
   *
   * @default 'single'
   */
  mode?: InputMode

  /**
   * 自动调整高度
   *
   * - false: 不自动调整
   * - true: 自动调整（默认 1-3 行）
   * - { minRows, maxRows }: 自定义行数范围
   *
   * 仅在 mode === 'multiple' 时有效
   *
   * @default { minRows: 1, maxRows: 3 }
   */
  autoSize?: boolean | { minRows: number; maxRows: number }

  // ===== 内容控制 =====

  /**
   * 最大字符数
   *
   * @default Infinity
   */
  maxLength?: number

  /**
   * 是否显示字数限制
   *
   * 仅在 maxLength 有值时有效
   *
   * @default false
   */
  showWordLimit?: boolean

  /**
   * 是否显示清空按钮
   *
   * @default false
   */
  clearable?: boolean

  // ===== 功能开关 =====

  /**
   * 是否允许语音输入
   *
   * @default false
   */
  allowSpeech?: boolean

  /**
   * 是否允许文件上传
   *
   * @default false
   */
  allowFiles?: boolean

  // ===== 输入联想 =====

  /**
   * 建议列表
   *
   * 提供输入联想功能
   */
  suggestions?: SuggestionItem[]

  /**
   * 联想弹窗宽度
   *
   * 可以是字符串（如 '300px'）或数字（单位 px）
   *
   * @default 400
   */
  suggestionPopupWidth?: string | number

  // ===== 语音配置 =====

  /**
   * 语音识别配置
   *
   * - false: 禁用语音（同 allowSpeech: false）
   * - true: 启用语音，使用默认配置
   * - SpeechConfig: 自定义配置
   *
   * @default false
   */
  speech?: boolean | SpeechConfig

  // ===== 按钮配置 =====

  /**
   * 按钮组配置
   *
   * 用于细粒度控制各个按钮
   */
  buttonGroup?: ButtonGroupConfig

  /**
   * 提交触发方式
   *
   * @default 'enter'
   */
  submitType?: SubmitTrigger

  /**
   * 停止按钮文字
   *
   * 加载状态下显示的文字
   * 如果不提供，只显示图标
   */
  stopText?: string

  // ===== 样式 =====

  /**
   * 主题
   *
   * @default 'light'
   */
  theme?: ThemeType

  /**
   * 最大宽度
   *
   * 可以是字符串（如 '800px'）或数字（单位 px）
   */
  maxWidth?: string | number
}

// ============================================
// 主组件 Emits
// ============================================

/**
 * Chat-Input 组件 Emits
 *
 * 所有对外暴露的事件
 */
export interface ChatInputEmits {
  /**
   * 内容变化
   *
   * v-model 的 update 事件
   *
   * @param value - 新的内容
   */
  (e: 'update:modelValue', value: string): void

  /**
   * 模板数据变化
   *
   * v-model:templateData 的 update 事件
   *
   * @param value - 新的模板数据
   */
  (e: 'update:templateData', value: TemplateItem[]): void

  /**
   * 提交内容
   *
   * 用户触发提交时（按下提交按钮或快捷键）
   *
   * @param value - 提交的内容
   */
  (e: 'submit', value: string): void

  /**
   * 清空内容
   *
   * 用户点击清空按钮时
   */
  (e: 'clear'): void

  /**
   * 获得焦点
   *
   * @param event - 焦点事件
   */
  (e: 'focus', event: FocusEvent): void

  /**
   * 失去焦点
   *
   * @param event - 焦点事件
   */
  (e: 'blur', event: FocusEvent): void

  /**
   * 取消操作
   *
   * 加载状态下点击停止按钮时
   */
  (e: 'cancel'): void

  /**
   * 文件选择
   *
   * 用户选择文件后
   *
   * @param files - 选择的文件列表
   */
  (e: 'files-selected', files: File[]): void

  /**
   * 选择建议
   *
   * 用户选择输入联想时
   *
   * @param value - 选择的建议内容
   */
  (e: 'suggestion-select', value: string): void

  /**
   * 语音识别开始
   */
  (e: 'speech-start'): void

  /**
   * 语音识别结束
   *
   * @param transcript - 识别的文本（可选）
   */
  (e: 'speech-end', transcript?: string): void

  /**
   * 语音识别中间结果
   *
   * @param transcript - 识别的文本
   */
  (e: 'speech-interim', transcript: string): void

  /**
   * 语音识别错误
   *
   * @param error - 错误对象
   */
  (e: 'speech-error', error: Error): void

  /**
   * 选择技能
   *
   * 用户选择技能 mention 时
   *
   * @param skill - 选择的技能
   */
  (e: 'skill-select', skill: SkillItem): void
}

// ============================================
// 主组件 Slots
// ============================================

/**
 * Chat-Input 组件 Slots
 *
 * 所有插槽定义
 */
export interface ChatInputSlots {
  /**
   * 头部插槽
   *
   * 位置：组件顶部
   * 用途：自定义头部区域
   *
   * 使用场景：
   * - 显示对话标题
   * - 显示提示信息
   * - 显示状态指示器
   */
  header?: () => unknown

  /**
   * 前缀插槽
   *
   * 位置：输入框左侧
   * 用途：输入框前缀内容
   *
   * 使用场景：
   * - 显示图标
   * - 显示标签
   * - 显示用户头像
   */
  prefix?: () => unknown

  /**
   * 内容插槽
   *
   * 位置：输入框主体区域
   * 用途：完全自定义编辑器内容
   *
   * 作用域插槽参数：
   * - editor: Tiptap 编辑器实例
   *
   * 使用场景：
   * - 替换默认的 EditorContent
   * - 使用自定义编辑器
   * - 特殊的输入场景
   *
   * 注意：很少使用，大部分场景使用默认即可
   */
  content?: (props: { editor: Editor | null }) => unknown

  /**
   * 单行模式操作按钮插槽
   *
   * 位置：输入框右侧（仅单行模式）
   * 用途：自定义单行模式的操作按钮
   *
   * 使用场景：
   * - 自定义按钮布局
   * - 添加额外的操作按钮
   *
   * 默认内容：
   * [ClearButton] [FileButton] [VoiceButton] [SubmitButton]
   */
  'actions-inline'?: () => unknown

  /**
   * 底部左侧插槽
   *
   * 位置：底部左侧（仅多行模式）
   * 用途：添加自定义内容到底部左侧
   *
   * 使用场景：
   * - 添加自定义按钮（深度思考、表情等）
   * - 显示提示信息
   * - 显示快捷键说明
   *
   * 注意：这是最常用的插槽（90% 的使用场景）
   */
  footer?: () => unknown

  /**
   * 底部右侧插槽
   *
   * 位置：底部右侧（仅多行模式）
   * 用途：完全自定义右侧区域
   *
   * 使用场景：
   * - 完全自定义右侧布局
   * - 替换默认的字数限制和按钮组
   * - 特殊的业务需求
   *
   * 默认内容：
   * [WordCounter] [ClearButton] [FileButton] [VoiceButton] [SubmitButton]
   *
   * 注意：使用此插槽会完全替换右侧所有默认内容
   */
  'footer-right'?: () => unknown
}

// ============================================
// Context 相关类型
// ============================================

/**
 * Chat-Input Context
 *
 * 通过 provide/inject 在组件树中共享的状态和方法
 * 所有子组件都可以通过 inject 获取
 */
export interface ChatInputContext {
  // ===== 编辑器相关 =====

  /**
   * Tiptap 编辑器实例
   * 注意：Tiptap 的 useEditor 返回 ShallowRef<Editor | undefined>
   */
  editor: Ref<Editor | undefined>

  /**
   * 编辑器 DOM 引用
   */
  editorRef: Ref<HTMLElement | null>

  // ===== 状态相关 =====

  /**
   * 当前输入模式
   */
  mode: Ref<InputMode>

  /**
   * 是否加载中
   */
  loading: Ref<boolean>

  /**
   * 是否禁用
   */
  disabled: Ref<boolean>

  /**
   * 是否有内容
   */
  hasContent: Ref<boolean>

  /**
   * 是否可以提交
   *
   * 综合判断：
   * - !disabled
   * - !loading
   * - hasContent
   * - !isOverLimit
   * - !buttonGroup.submit?.disabled
   */
  canSubmit: Ref<boolean>

  /**
   * 是否超出字数限制
   */
  isOverLimit: Ref<boolean>

  // ===== 字数统计 =====

  /**
   * 当前字符数
   */
  characterCount: Ref<number>

  /**
   * 最大字符数限制
   */
  maxLength: Ref<number | undefined>

  // ===== 语音状态 =====

  /**
   * 语音识别状态
   */
  speechState: Ref<SpeechState>

  // ===== 配置相关 =====

  /**
   * 是否显示字数限制
   */
  showWordLimit: Ref<boolean>

  /**
   * 是否显示清空按钮
   */
  clearable: Ref<boolean>

  /**
   * 是否允许语音输入
   */
  allowSpeech: Ref<boolean>

  /**
   * 是否允许文件上传
   */
  allowFiles: Ref<boolean>

  /**
   * 按钮组配置
   */
  buttonGroup: Ref<ButtonGroupConfig | undefined>

  /**
   * 提交触发方式
   */
  submitType: Ref<SubmitTrigger>

  /**
   * 停止按钮文字
   */
  stopText: Ref<string | undefined>

  // ===== 方法相关 =====

  /**
   * 提交内容
   */
  submit: () => void

  /**
   * 清空内容
   */
  clear: () => void

  /**
   * 聚焦编辑器
   */
  focus: () => void

  /**
   * 失焦编辑器
   */
  blur: () => void

  /**
   * 设置编辑器内容
   *
   * @param content - 内容（HTML 或 JSON）
   */
  setContent: (content: string) => void

  /**
   * 获取编辑器内容
   *
   * @returns 内容（HTML）
   */
  getContent: () => string

  /**
   * 开始语音识别
   */
  startSpeech: () => void

  /**
   * 停止语音识别
   */
  stopSpeech: () => void

  /**
   * 打开文件选择对话框
   */
  openFileDialog: () => void

  /**
   * 设置模板数据
   *
   * @param items - 模板数据
   */
  setTemplateData: (items: TemplateItem[]) => void

  /**
   * 清空模板数据
   */
  clearTemplateData: () => void

  /**
   * 聚焦第一个模板块
   */
  focusFirstTemplateBlock: () => void

  /**
   * 获取模板数据
   *
   * @returns 模板数据
   */
  getTemplateData: () => TemplateItem[]

  /**
   * 设置输入模式
   *
   * @param mode - 输入模式
   */
  setMode: (mode: InputMode) => void
}

/**
 * Context Key
 *
 * 用于 provide/inject 的 key
 */
export const CHAT_INPUT_CONTEXT_KEY = Symbol('chat-input-context')

// ============================================
// Composables 返回类型
// ============================================

/**
 * useChatInputContext 返回类型
 */
export type UseChatInputContextReturn = ChatInputContext

/**
 * useEditor 返回类型
 */
export interface UseEditorReturn {
  /**
   * 编辑器实例
   * 注意:Tiptap 的 useEditor 返回 ShallowRef<Editor | undefined>
   */
  editor: Ref<Editor | undefined>

  /**
   * 编辑器 DOM 引用
   */
  editorRef: Ref<HTMLElement | null>
}

/**
 * useModeSwitch 返回类型
 */
export interface UseModeSwitchReturn {
  /**
   * 当前模式
   */
  currentMode: Ref<InputMode>

  /**
   * 是否正在自动切换
   */
  isAutoSwitching: Ref<boolean>

  /**
   * 设置模式
   *
   * @param mode - 输入模式
   */
  setMode: (mode: InputMode) => void

  /**
   * 检查内容溢出
   *
   * 用于自动切换模式
   */
  checkOverflow: () => void
}

/**
 * useSuggestion 返回类型
 */
export interface UseSuggestionReturn {
  /**
   * 弹窗是否可见
   */
  isPopupVisible: Ref<boolean>

  /**
   * 当前激活的建议
   */
  activeSuggestion: Ref<string>

  /**
   * 键盘导航的激活索引
   */
  activeKeyboardIndex: Ref<number>

  /**
   * 鼠标悬停的激活索引
   */
  activeMouseIndex: Ref<number>

  /**
   * 自动补全文本
   */
  autoCompleteText: Ref<string>

  /**
   * 是否显示 Tab 提示器
   */
  showTabIndicator: Ref<boolean>

  /**
   * 应用建议
   *
   * @param suggestion - 建议内容
   */
  applySuggestion: (suggestion: string) => void

  /**
   * 键盘导航
   *
   * @param direction - 方向（上/下）
   */
  navigateWithKeyboard: (direction: 'up' | 'down') => void

  /**
   * 鼠标进入
   *
   * @param index - 建议项索引
   */
  handleMouseEnter: (index: number) => void

  /**
   * 鼠标离开
   */
  handleMouseLeave: () => void

  /**
   * 关闭弹窗
   */
  closePopup: () => void
}

/**
 * useSpeech 返回类型
 */
export interface UseSpeechReturn {
  /**
   * 语音状态
   */
  speechState: Ref<SpeechState>

  /**
   * 开始语音识别
   */
  start: () => void

  /**
   * 停止语音识别
   */
  stop: () => void
}

/**
 * useFileUpload 返回类型
 */
export interface UseFileUploadReturn {
  /**
   * 打开文件选择对话框
   */
  openFileDialog: () => void

  /**
   * 选择的文件列表
   */
  files: Ref<File[]>
}

/**
 * useTemplateData 返回类型
 */
export interface UseTemplateDataReturn {
  /**
   * 设置模板数据
   *
   * @param items - 模板数据
   */
  setTemplateData: (items: TemplateItem[]) => void

  /**
   * 清空模板数据
   */
  clearTemplateData: () => void

  /**
   * 聚焦第一个模板块
   */
  focusFirstTemplateBlock: () => void

  /**
   * 获取模板数据
   *
   * @returns 模板数据
   */
  getTemplateData: () => TemplateItem[]
}

/**
 * useKeyboardShortcuts 返回类型
 */
export interface UseKeyboardShortcutsReturn {
  /**
   * 处理键盘按下事件
   *
   * @param event - 键盘事件
   */
  handleKeyDown: (event: KeyboardEvent) => void
}

// ============================================
// 组件 Props 类型
// ============================================

/**
 * ActionButton Props
 *
 * 基础操作按钮的 Props
 */
export interface ActionButtonProps {
  /**
   * 按钮图标
   */
  icon: VNode | Component

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 是否激活状态
   */
  active?: boolean

  /**
   * 工具提示
   */
  tooltip?: string

  /**
   * Tooltip 位置
   */
  tooltipPlacement?: TooltipPlacement

  /**
   * 按钮大小
   */
  size?: string | number
}

/**
 * WordCounter Props
 */
export interface WordCounterProps {
  /**
   * 当前字符数
   */
  current: number

  /**
   * 最大字符数
   */
  max: number

  /**
   * 是否超出限制
   */
  isOverLimit: boolean
}

/**
 * SuggestionList Props
 */
export interface SuggestionListProps {
  /**
   * 是否显示
   */
  show: boolean

  /**
   * 建议列表
   */
  suggestions: SuggestionItem[]

  /**
   * 键盘激活索引
   */
  activeKeyboardIndex: number

  /**
   * 鼠标激活索引
   */
  activeMouseIndex: number

  /**
   * 输入值
   */
  inputValue: string

  /**
   * 弹窗样式
   */
  popupStyle?: Record<string, string | number>
}

/**
 * SuggestionList Emits
 */
export interface SuggestionListEmits {
  /**
   * 选择建议
   *
   * @param suggestion - 建议内容
   */
  (e: 'select', suggestion: string): void

  /**
   * 鼠标进入
   *
   * @param index - 索引
   */
  (e: 'mouse-enter', index: number): void

  /**
   * 鼠标离开
   */
  (e: 'mouse-leave'): void
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
   * 默认主题
   */
  theme: ThemeType

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
   * @param message - 错误消息
   */
  constructor(code: ErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'ChatInputError'
  }
}

// ============================================
// 导出所有类型
// ============================================

export // 基础类型已在上面定义
 type {}
