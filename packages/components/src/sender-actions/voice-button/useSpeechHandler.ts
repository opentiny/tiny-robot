import { reactive, onUnmounted, toValue, watch } from 'vue'
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
  type Session = { id: number; handler: SpeechHandler; phase: 'starting' | 'recording' | 'stopping' }
  let session: Session | undefined
  let sessionId = 0
  let pendingRestart = false
  let disposed = false

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

  watch(() => resolveOptions().customHandler, updateSupportState, { immediate: true })

  const fail = (current: Session, reason: unknown) => {
    if (disposed || session !== current) return
    const error = reason instanceof Error ? reason : new Error(String(reason))
    session = undefined
    pendingRestart = false
    speechState.isRecording = false
    speechState.error = error
    // 先使旧回调失效，再清理，避免同步结束或延迟拒绝影响新会话。
    if (current.phase !== 'stopping') {
      try {
        Promise.resolve(current.handler.stop()).catch(() => {})
      } catch {
        // 保留本轮最先报告的错误，清理异常不重复通知。
      }
    }
    resolveOptions().onError?.(error)
  }

  const requestStop = (current: Session) => {
    if (current.phase === 'stopping') return
    current.phase = 'stopping'
    try {
      Promise.resolve(current.handler.stop()).catch((error) => fail(current, error))
    } catch (error) {
      fail(current, error)
    }
  }

  // 开始录音
  const start = () => {
    if (disposed) return
    // 如果正在录音，等待当前会话自然结束后再重启
    if (session) {
      if (session.phase === 'recording') {
        pendingRestart = true
        requestStop(session)
      }
      return
    }

    try {
      const currentOptions = { ...resolveOptions() }
      updateSupportState()
      const handler = createHandler(currentOptions)
      if (!handler || !handler.isSupported()) throw new Error('语音识别不受支持')

      const current: Session = { id: ++sessionId, handler, phase: 'starting' }
      session = current
      pendingRestart = false
      speechState.error = undefined
      const isCurrent = () => !disposed && session === current

      // 创建回调函数集合 - 每次调用时都获取最新的 options
      const callbacks: SpeechCallbacks = {
        onStart: () => {
          if (!isCurrent() || current.phase !== 'starting') return
          current.phase = 'recording'
          speechState.isRecording = true
          resolveOptions().onStart?.()
        },
        onInterim: (transcript) => {
          if (isCurrent()) resolveOptions().onInterim?.(transcript)
        },
        onFinal: (transcript) => {
          if (isCurrent()) resolveOptions().onFinal?.(transcript)
        },
        onEnd: (transcript) => {
          if (!isCurrent()) return
          const shouldRestart = pendingRestart
          session = undefined
          pendingRestart = false
          speechState.isRecording = false
          resolveOptions().onEnd?.(transcript)
          if (shouldRestart && !session && sessionId === current.id) start()
        },
        onError: (error) => fail(current, error),
      }
      try {
        Promise.resolve(handler.start(callbacks)).catch((error) => fail(current, error))
      } catch (error) {
        fail(current, error)
      }
    } catch (error) {
      speechState.error = error instanceof Error ? error : new Error(String(error))
      resolveOptions().onError?.(speechState.error)
    }
  }

  // 停止录音
  const stop = () => {
    pendingRestart = false
    if (session) requestStop(session)
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    const current = session
    disposed = true
    session = undefined
    pendingRestart = false
    // 如果正在录音，先停止
    if (current && current.phase !== 'stopping') {
      try {
        Promise.resolve(current.handler.stop()).catch(() => {})
      } catch {
        // 卸载后不再通知外部错误。
      }
      // 卸载时不触发 onEnd 回调，避免不必要的副作用
    }
    speechState.isRecording = false
  })

  return {
    speechState,
    start,
    stop,
  }
}
