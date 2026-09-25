import { reactive, onUnmounted, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type {
  SpeechHookOptions,
  SpeechHandlerResult,
  SpeechState,
  SpeechCallbacks,
  SpeechHandler,
} from './speech.types'
import { WebSpeechHandler } from './webSpeechHandler'

/**
 * 语音识别处理 Hook
 * 支持内置 Web Speech API 和自定义语音处理器
 * 通过 customHandler 参数切换实现，默认使用内置的 Web Speech API
 *
 * @param options 语音识别配置
 * @returns 语音识别控制器
 */
export function useSpeechHandler(options: MaybeRefOrGetter<SpeechHookOptions>): SpeechHandlerResult {
  const handlerRef = shallowRef<SpeechHandler | null>(null)
  const pendingRestart = shallowRef(false)
  const suppressEndCallback = shallowRef(false)

  // 语音识别状态
  const speechState = reactive<SpeechState>({
    isRecording: false,
    isSupported: false,
    error: undefined,
  })

  const resolveOptions = () => toValue(options)

  const updateSupportState = () => {
    const currentOptions = resolveOptions()
    speechState.isSupported = currentOptions.customHandler
      ? currentOptions.customHandler.isSupported()
      : WebSpeechHandler.isSupported()
  }

  const createHandler = (currentOptions: SpeechHookOptions): SpeechHandler | null => {
    if (currentOptions.customHandler) {
      return currentOptions.customHandler
    }

    if (!WebSpeechHandler.isSupported()) {
      return null
    }

    return new WebSpeechHandler(currentOptions)
  }

  // 创建回调函数集合 - 每次调用时都获取最新的 options
  const callbacks: SpeechCallbacks = {
    onStart: () => {
      speechState.isRecording = true
      speechState.error = undefined
      resolveOptions().onStart?.()
    },
    onInterim: (transcript: string) => {
      resolveOptions().onInterim?.(transcript)
    },
    onFinal: (transcript: string) => {
      resolveOptions().onFinal?.(transcript)
    },
    onEnd: (transcript?: string) => {
      const shouldEmitEnd = !suppressEndCallback.value
      const shouldRestart = pendingRestart.value

      suppressEndCallback.value = false
      pendingRestart.value = false
      handlerRef.value = null

      if (speechState.isRecording) {
        speechState.isRecording = false
      }

      if (shouldEmitEnd) {
        resolveOptions().onEnd?.(transcript)
      }

      updateSupportState()

      if (shouldRestart) {
        start()
      }
    },
    onError: (error: Error) => {
      speechState.error = error
      speechState.isRecording = false
      pendingRestart.value = false
      suppressEndCallback.value = false
      handlerRef.value = null
      resolveOptions().onError?.(error)
      updateSupportState()
    },
  }

  watch(
    () => resolveOptions().customHandler,
    () => {
      if (!speechState.isRecording) {
        handlerRef.value = null
      }
      updateSupportState()
    },
    { immediate: true },
  )

  // 开始录音
  const start = () => {
    const currentOptions = resolveOptions()

    updateSupportState()

    if (!speechState.isSupported) {
      const error = new Error('语音识别不受支持')
      speechState.error = error
      currentOptions.onError?.(error)
      return
    }

    // 如果正在录音，等待当前会话自然结束后再重启
    if (speechState.isRecording) {
      pendingRestart.value = true
      handlerRef.value?.stop()
      return
    }

    const nextHandler = createHandler(currentOptions)

    if (!nextHandler || !nextHandler.isSupported()) {
      const error = new Error('语音识别不受支持')
      speechState.error = error
      currentOptions.onError?.(error)
      updateSupportState()
      return
    }

    handlerRef.value = nextHandler
    pendingRestart.value = false
    suppressEndCallback.value = false

    try {
      nextHandler.start(callbacks)
    } catch (error) {
      speechState.error = error instanceof Error ? error : new Error('启动失败')
      handlerRef.value = null
      currentOptions.onError?.(speechState.error)
    }
  }

  // 停止录音
  const stop = () => {
    if (!speechState.isRecording || !handlerRef.value) {
      return
    }

    pendingRestart.value = false
    suppressEndCallback.value = false
    handlerRef.value.stop()
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    // 如果正在录音，先停止
    if (speechState.isRecording && handlerRef.value) {
      pendingRestart.value = false
      suppressEndCallback.value = true
      handlerRef.value.stop()
      // 卸载时不触发 onEnd 回调，避免不必要的副作用
      speechState.isRecording = false
    }

    handlerRef.value = null
  })

  return {
    speechState,
    start,
    stop,
  }
}
