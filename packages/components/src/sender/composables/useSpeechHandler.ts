import { reactive } from 'vue'
import type { SpeechHookOptions, SpeechHandler, SpeechState } from '../types'

export function useSpeechHandler(options: SpeechHookOptions): SpeechHandler {
  // 语音识别状态
  const speechState = reactive<SpeechState>({
    isRecording: false,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    error: undefined,
  })

  // 创建语音识别实例
  const recognition = speechState.isSupported
    ? new ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)()
    : null

  // 初始化语音识别配置
  if (recognition) {
    recognition.continuous = options.continuous ?? false
    recognition.interimResults = options.interimResults ?? true
    recognition.lang = options.lang ?? navigator.language

    // 开始识别事件
    recognition.onstart = () => {
      speechState.isRecording = true
      speechState.error = undefined
      options.onStart?.()
    }

    // 结束识别事件
    recognition.onend = () => {
      speechState.isRecording = false
      options.onEnd?.()
    }

    // 中间结果事件
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')

      if (event.results[0].isFinal) {
        options.onFinal?.(transcript)
      } else {
        options.onInterim?.(transcript)
      }
    }

    // 错误处理
    recognition.onerror = (event: ErrorEvent) => {
      speechState.error = new Error(event.error)
      speechState.isRecording = false
      options.onError?.(speechState.error)
    }
  }

  // 开始录音
  const start = () => {
    if (!recognition) {
      const error = new Error('浏览器不支持语音识别')
      speechState.error = error
      options.onError?.(error)
      return
    }

    try {
      recognition.start()
    } catch (error) {
      speechState.error = error instanceof Error ? error : new Error('启动语音识别失败')
      options.onError?.(speechState.error)
    }
  }

  // 停止录音
  const stop = () => {
    if (recognition && speechState.isRecording) {
      recognition.stop()
    }
  }

  return {
    speechState,
    start,
    stop,
  }
}
