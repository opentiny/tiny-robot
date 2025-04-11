import { reactive } from 'vue'
import type { SpeechHookOptions, SpeechHandler, SpeechState } from '../types'

declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition
    SpeechRecognition: typeof SpeechRecognition
  }
}

export function useSpeechHandler(options: SpeechHookOptions): SpeechHandler {
  // 语音识别状态
  const speechState = reactive<SpeechState>({
    isRecording: false,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    error: undefined,
  })

  // 创建语音识别实例
  const recognition = speechState.isSupported
    ? new (window.webkitSpeechRecognition || window.SpeechRecognition)()
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
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')

      if (event.results[0].isFinal) {
        options.onFinal?.(transcript)
      } else {
        options.onInterim?.(transcript)
      }
    }

    // 错误处理
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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

    // 已经在录音中则先停止当前会话
    if (speechState.isRecording) {
      try {
        recognition.stop()
        // 短暂延迟后再开始新的录音会话
        setTimeout(() => {
          try {
            recognition.start()
          } catch (err) {
            handleError(err)
          }
        }, 100)
      } catch (err) {
        handleError(err)
      }
      return
    }

    try {
      recognition.start()
    } catch (error) {
      handleError(error)
    }
  }

  // 停止录音
  const stop = () => {
    if (recognition && speechState.isRecording) {
      try {
        recognition.stop()
      } catch (error) {
        handleError(error)
      }
    }
  }

  // 处理错误
  const handleError = (error: unknown) => {
    speechState.error = error instanceof Error ? error : new Error('语音识别操作失败')
    speechState.isRecording = false
    options.onError?.(speechState.error)
  }

  return {
    speechState,
    start,
    stop,
  }
}
