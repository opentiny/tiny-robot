/**
 * 语音识别相关类型定义
 */
// 语音回调函数集合
export interface SpeechCallbacks {
  onStart: () => void
  onInterim: (transcript: string) => void
  onFinal: (transcript: string) => void
  onEnd: (transcript?: string) => void
  onError: (error: Error) => void
}

// 语音处理器接口（统一接口，支持内置和自定义实现）
// 职责说明：
// - start: 启动语音识别，接收 callbacks 用于通知识别过程中的各种事件
// - stop: 清理资源
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
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否在本次录音期间仅替换语音写入的内容区间
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
  start: () => void
  stop: () => void
}
