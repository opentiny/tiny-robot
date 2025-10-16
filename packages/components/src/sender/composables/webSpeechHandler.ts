import type { SpeechCallbacks, SpeechHandler, SpeechConfig } from '../index.type'

/**
 * 内置 Web Speech API 处理器
 * 基于浏览器原生 Web Speech API 实现的语音识别
 */
export class WebSpeechHandler implements SpeechHandler {
  private recognition?: SpeechRecognition
  private options: SpeechConfig

  /**
   * 初始化语音识别实例
   */
  private initialize() {
    // 创建语音识别实例
    this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)()

    // 配置识别参数
    this.recognition.continuous = this.options.continuous ?? false
    this.recognition.interimResults = this.options.interimResults ?? true
    this.recognition.lang = this.options.lang ?? navigator.language
  }

  constructor(options: SpeechConfig) {
    this.options = options
    this.initialize()
  }

  /**
   * 检查浏览器是否支持 Web Speech API
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }

  /**
   * 检查浏览器是否支持 Web Speech API（实例方法）
   */
  isSupported(): boolean {
    return WebSpeechHandler.isSupported()
  }

  /**
   * 设置语音识别事件处理器
   * @param callbacks 语音识别回调函数集合
   */
  private setupEventHandlers(callbacks: SpeechCallbacks): void {
    if (!this.recognition || !callbacks) return

    this.recognition.onstart = () => {
      callbacks.onStart()
    }

    this.recognition.onend = () => {
      callbacks.onEnd()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')

      const current = event.results[event.resultIndex]

      if (current?.isFinal) {
        callbacks.onFinal(transcript)
      } else {
        callbacks.onInterim(transcript)
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      callbacks.onError(new Error(event.error))
      this.cleanup()
    }
  }

  /**
   * 清理事件监听器
   */
  private cleanup(): void {
    if (!this.recognition) return

    this.recognition.onstart = null
    this.recognition.onend = null
    this.recognition.onresult = null
    this.recognition.onerror = null
  }

  /**
   * 开始语音识别
   * @param callbacks 语音识别回调函数集合
   */
  start(callbacks: SpeechCallbacks): void {
    if (!this.recognition) {
      callbacks.onError(new Error('浏览器不支持语音识别'))
      return
    }

    // 绑定事件处理器
    this.setupEventHandlers(callbacks)

    try {
      this.recognition.start()
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('语音识别启动失败'))
    }
  }

  /**
   * 停止语音识别并清理资源
   */
  stop(): void {
    if (!this.recognition) return

    this.cleanup()

    try {
      this.recognition.stop()
    } catch (error) {
      console.warn('停止语音识别时发生错误:', error)
    }
  }
}
