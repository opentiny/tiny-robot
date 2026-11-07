import type { SpeechCallbacks, SpeechHandler, SpeechConfig } from './speech.types'

interface ParsedSpeechResult {
  finalTranscript: string
  interimTranscript: string
}

export function parseSpeechRecognitionResult(
  event: SpeechRecognitionEvent,
  finalizedIndices = new Set<number>(),
): ParsedSpeechResult {
  let finalTranscript = ''
  let interimTranscript = ''

  for (let index = 0; index < event.results.length; index++) {
    const result = event.results[index]
    const transcript = result[0]?.transcript ?? ''

    if (result.isFinal && index >= event.resultIndex && !finalizedIndices.has(index)) {
      finalizedIndices.add(index)
      finalTranscript += transcript
    }
    interimTranscript += transcript
  }

  return {
    finalTranscript,
    interimTranscript,
  }
}

/**
 * 内置 Web Speech API 处理器
 * 基于浏览器原生 Web Speech API 实现的语音识别
 */
export class WebSpeechHandler implements SpeechHandler {
  private recognition?: SpeechRecognition
  private options: SpeechConfig
  private finalizedTranscript: string = ''
  private finalizedIndices = new Set<number>()

  private resetSessionTranscript(): void {
    this.finalizedTranscript = ''
    this.finalizedIndices.clear()
  }

  /**
   * 初始化语音识别实例
   */
  private initialize() {
    // 创建语音识别实例
    this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)()
    // 配置识别参数
    this.recognition.continuous = this.options.continuous ?? false
    this.recognition.interimResults = this.options.interimResults ?? true
    if (this.options.lang !== undefined) {
      this.recognition.lang = this.options.lang
    }
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
      const transcript = this.finalizedTranscript || undefined
      this.cleanup()
      this.resetSessionTranscript()
      callbacks.onEnd(transcript)
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const { finalTranscript, interimTranscript } = parseSpeechRecognitionResult(event, this.finalizedIndices)

      if (finalTranscript) {
        this.finalizedTranscript += finalTranscript
        callbacks.onFinal(finalTranscript)
      }

      callbacks.onInterim(interimTranscript)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.resetSessionTranscript()
      this.cleanup()
      callbacks.onError(new Error(event.error))
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

    this.resetSessionTranscript()
    this.setupEventHandlers(callbacks)

    try {
      this.recognition.start()
    } catch (error) {
      this.cleanup()
      callbacks.onError(error instanceof Error ? error : new Error('语音识别启动失败'))
    }
  }

  /**
   * 停止语音识别并清理资源
   */
  stop(): void {
    if (!this.recognition) return

    // 原生 end 前仍可能返回 final，必须保留事件监听。
    try {
      this.recognition.stop()
    } catch (error) {
      this.cleanup()
      this.resetSessionTranscript()
      throw error
    }
  }
}
