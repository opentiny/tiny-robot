import type { ComputedRef } from 'vue'

/**
 * 语音识别相关类型定义
 */
// 语音回调函数集合
export interface SpeechCallbacks {
  onStart: () => void
  /** 当前会话的完整预览，包含已确定文本；空字符串表示预览撤回。 */
  onInterim: (transcript: string) => void
  /** 本次新增的确定文本；不同结果位置的相同文本也必须逐次发送。 */
  onFinal: (transcript: string) => void
  /** 当前会话累计确定文本，没有结果时可省略。 */
  onEnd: (transcript?: string) => void
  onError: (error: Error) => void
}

// 语音处理器接口（统一接口，支持内置和自定义实现）
// 职责说明：
// - start: 启动语音识别，接收 callbacks 用于通知识别过程中的各种事件
// - stop: 清理资源
// stop 请求停止，完成后必须调用一次 onEnd，失败调用 onError；Promise 不代替结束回调。
// - isSupported: 检查当前环境是否支持该语音识别方式
export interface SpeechHandler {
  start: (callbacks: SpeechCallbacks) => Promise<void> | void
  stop: () => Promise<void> | void
  isSupported: () => boolean
}

// 语音识别配置
export interface SpeechConfig {
  customHandler?: SpeechHandler // 自定义语音处理器（传入则使用自定义，否则使用内置）
  lang?: string // 识别语言，默认浏览器语言
  // 未显式配置 lang 时保留原生默认值：页面 <html lang>，再回退浏览器语言。
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否在录音期间用识别结果替换整个输入框内容
  /** @deprecated 点击拦截请使用 VoiceButton 的 on-button-click，仅保留类型兼容。 */
  onVoiceButtonClick?: (isRecording: boolean, preventDefault: () => void) => void | Promise<void>
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

// 语音识别Hook返回类型
export interface SpeechHandlerResult {
  speechState: SpeechState
  /** 会话存在时为 true，包含启动、录音和等待停止完成阶段。 */
  isActive: ComputedRef<boolean>
  start: () => void
  stop: () => void
}
