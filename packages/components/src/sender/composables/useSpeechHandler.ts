import { reactive, onUnmounted } from 'vue'
import type { SpeechHookOptions, SpeechHandlerResult, SpeechState, SpeechCallbacks, SpeechHandler } from '../index.type'
import { WebSpeechHandler } from './webSpeechHandler'

/**
 * 语音识别处理 Hook
 * 支持内置 Web Speech API 和自定义语音处理器
 * 通过 customHandler 参数切换实现，默认使用内置的 Web Speech API
 *
 * @param options 语音识别配置
 * @returns 语音识别控制器
 */
export function useSpeechHandler(options: SpeechHookOptions): SpeechHandlerResult {
  // 语音识别状态
  const speechState = reactive<SpeechState>({
    isRecording: false,
    isSupported: false,
    error: undefined,
  })

  // 创建回调函数集合
  const callbacks: SpeechCallbacks = {
    onStart: () => {
      speechState.isRecording = true
      speechState.error = undefined
      options.onStart?.()
    },
    onInterim: (transcript: string) => {
      options.onInterim?.(transcript)
    },
    onFinal: (transcript: string) => {
      options.onFinal?.(transcript)
    },
    onEnd: (transcript?: string) => {
      if (speechState.isRecording) {
        speechState.isRecording = false
        options.onEnd?.(transcript)
      }
    },
    onError: (error: Error) => {
      speechState.error = error
      speechState.isRecording = false
      options.onError?.(error)
    },
  }

  // 检查是否支持（对于内置 Handler，提前检查避免无效创建）
  const isBuiltinSupported = WebSpeechHandler.isSupported()
  speechState.isSupported = options.customHandler ? options.customHandler.isSupported() : isBuiltinSupported

  // 选择语音处理器：如果提供了 customHandler，直接使用；否则在支持的情况下创建 WebSpeechHandler
  const handler: SpeechHandler | null =
    options.customHandler ?? (isBuiltinSupported ? new WebSpeechHandler(options) : null)

  // 开始录音
  const start = () => {
    if (!speechState.isSupported || !handler) {
      const error = new Error('语音识别不受支持')
      speechState.error = error
      options.onError?.(error)
      return
    }

    // 如果正在录音，先停止再重新开始
    if (speechState.isRecording) {
      handler.stop()
      speechState.isRecording = false
      // 短暂延迟后重新开始
      setTimeout(() => {
        handler.start(callbacks)
      }, 200)
      return
    }

    handler.start(callbacks)
  }

  // 停止录音
  const stop = () => {
    if (!speechState.isRecording || !handler) {
      return
    }

    handler.stop()

    callbacks.onEnd()
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    // 如果正在录音，先停止
    if (speechState.isRecording && handler) {
      handler.stop()
      // 卸载时不触发 onEnd 回调，避免不必要的副作用
      speechState.isRecording = false
    }
  })

  return {
    speechState,
    start,
    stop,
  }
}
