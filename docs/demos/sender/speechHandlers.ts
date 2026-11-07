import Recorder from 'recorder-core'
import 'recorder-core/src/engine/pcm'
import type { SpeechHandler, SpeechCallbacks } from '@opentiny/tiny-robot'

/**
 * recorder-core 的配置选项
 */
interface RecorderOptions {
  type: 'wav' | 'mp3' | 'pcm' | string // 期望的输出格式
  sampleRate: 16000 | 8000 | number // 采样率
  bitRate: 16 | 8 | number // 比特率
  onProcess?: (buffers: Float32Array[], powerLevel: number, duration: number, sampleRate: number) => void
}

/**
 * recorder-core 实例的接口
 */
interface IRecorder {
  open(success: () => void, fail: (msg: string, isUserNotAllow: boolean) => void): void
  start(): void
  stop(success: (blob: Blob, duration: number) => void, fail: (msg: string) => void): void
  close(): void
  support(): boolean
}

interface RecorderStatic {
  (options: RecorderOptions): IRecorder
}

const TypedRecorder = Recorder as RecorderStatic

/**
 * 简单的模拟语音处理器
 * 用于测试和演示
 */
export class MockSpeechHandler implements SpeechHandler {
  private timer?: ReturnType<typeof setInterval>
  private callbacks?: SpeechCallbacks
  private transcript = ''

  start(callbacks: SpeechCallbacks): void {
    this.stop()
    this.callbacks = callbacks
    this.transcript = ''
    // 立即触发开始
    callbacks.onStart()
    if (this.callbacks !== callbacks) return

    // 模拟识别过程
    let step = 0
    const steps = ['你好', '你好', '这是第二句话。']

    this.timer = setInterval(() => {
      const sentence = steps[Math.floor(step / 2)]
      if (step % 2 === 0) {
        callbacks.onInterim(this.transcript + sentence.slice(0, 1))
      } else {
        // 完成识别
        const finalResult = sentence
        this.transcript += finalResult
        callbacks.onFinal(finalResult)
      }
      step++
      if (step === steps.length * 2 && this.callbacks === callbacks) {
        // 清理定时器资源
        this.stop()
      }
    }, 500)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
    const callbacks = this.callbacks
    const transcript = this.transcript
    this.callbacks = undefined
    this.transcript = ''
    callbacks?.onEnd(transcript || undefined)
  }

  isSupported(): boolean {
    return true // 模拟处理器总是支持
  }
}

/**
 * 阿里云一句话识别处理器
 * 使用阿里云语音识别 REST API
 *
 * 需要填入自己的 appKey 和 token
 */
export class AliyunSpeechHandler implements SpeechHandler {
  private recorder?: IRecorder
  private callbacks?: SpeechCallbacks
  private phase: 'opening' | 'recording' | 'stopping' | 'idle' = 'idle'
  private appKey: string = 'your_app_key'
  private token: string = 'your_token'

  private closeRecorder(): void {
    const recorder = this.recorder
    this.recorder = undefined
    recorder?.close()
  }

  private finish(callbacks: SpeechCallbacks, transcript?: string, error?: Error): void {
    if (this.callbacks !== callbacks) return
    this.callbacks = undefined
    this.phase = 'idle'
    try {
      this.closeRecorder()
    } catch (reason) {
      error ??= reason instanceof Error ? reason : new Error(String(reason))
    }
    if (error) callbacks.onError(error)
    else callbacks.onEnd(transcript)
  }

  private async processWithAliyunAPI(audioBlob: Blob, callbacks: SpeechCallbacks): Promise<void> {
    if (this.callbacks !== callbacks) return

    try {
      // 实际请求中，需要配置代理转发到： https://nls-gateway-cn-shanghai.aliyuncs.com
      const baseUrl = '/api/aliyun/asr'

      const params = new URLSearchParams({
        appkey: this.appKey,
        format: 'pcm',
        sample_rate: '16000',
        enable_punctuation_prediction: 'true',
        enable_inverse_text_normalization: 'true',
      })

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-NLS-Token': this.token,
        },
        body: audioBlob,
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`HTTP 错误! 状态码: ${response.status}, 响应: ${errorBody}`)
      }

      const result = await response.json()
      if (this.callbacks !== callbacks) return

      if (result.status === 20000000 && result.result) {
        const transcript = result.result
        callbacks.onFinal(transcript)
        this.finish(callbacks, transcript)
      } else {
        throw new Error(result.message || `识别失败，状态码: ${result.status}`)
      }
    } catch (error) {
      this.finish(callbacks, undefined, error instanceof Error ? error : new Error('阿里云语音识别失败'))
    }
  }

  async start(callbacks: SpeechCallbacks): Promise<void> {
    if (this.callbacks) return
    this.callbacks = callbacks
    this.phase = 'opening'

    try {
      const recorder = TypedRecorder({
        type: 'pcm',
        sampleRate: 16000,
        bitRate: 16,
      })
      this.recorder = recorder

      recorder.open(
        () => {
          if (this.callbacks !== callbacks || this.phase !== 'opening') {
            recorder.close()
            return
          }
          try {
            recorder.start()
            this.phase = 'recording'
            callbacks.onStart()
          } catch (error) {
            this.finish(callbacks, undefined, error instanceof Error ? error : new Error(String(error)))
          }
        },
        (msg: string, isUserNotAllow: boolean) => {
          const errorMsg = isUserNotAllow ? `用户拒绝了麦克风权限: ${msg}` : `无法打开麦克风: ${msg}`
          this.finish(callbacks, undefined, new Error(errorMsg))
        },
      )
    } catch (error) {
      this.finish(callbacks, undefined, error instanceof Error ? error : new Error('阿里云语音服务启动失败'))
    }
  }

  async stop(): Promise<void> {
    const callbacks = this.callbacks
    if (!callbacks || this.phase === 'stopping') return
    if (this.phase === 'opening' || !this.recorder) {
      this.finish(callbacks)
      return
    }
    this.phase = 'stopping'
    try {
      this.recorder.stop(
        (blob: Blob) => {
          if (this.callbacks !== callbacks) return
          this.closeRecorder()
          void this.processWithAliyunAPI(blob, callbacks)
        },
        (msg: string) => {
          this.finish(callbacks, undefined, new Error(`录音失败: ${msg}`))
        },
      )
    } catch (error) {
      this.finish(callbacks, undefined, error instanceof Error ? error : new Error(String(error)))
    }
  }

  isSupported(): boolean {
    return true
  }
}

/**
 * 阿里云实时语音识别处理器
 * 使用 WebSocket 进行流式识别
 *
 * 需要填入自己的 appKey 和 token
 */
export class AliyunRealtimeSpeechHandler implements SpeechHandler {
  private ws?: WebSocket
  private audioContext?: AudioContext
  private scriptProcessor?: ScriptProcessorNode
  private audioStream?: MediaStream
  private callbacks?: SpeechCallbacks
  private phase: 'starting' | 'recording' | 'stopping' | 'idle' = 'idle'
  private transcript = ''
  private finalizedSentences = new Set<number>()
  private taskId = ''
  private appKey: string = 'your_app_key'
  private token: string = 'your_token'

  private generateUUID(): string {
    // 使用 crypto.randomUUID() 生成标准 UUID，然后移除连字符得到32位字符串
    return crypto.randomUUID().replace(/-/g, '')
  }

  isSupported(): boolean {
    return true
  }

  async start(callbacks: SpeechCallbacks): Promise<void> {
    if (this.callbacks) return
    if (!this.isSupported()) {
      callbacks.onError(new Error('当前浏览器不支持实时语音识别所需的功能'))
      return
    }

    this.callbacks = callbacks
    this.phase = 'starting'
    this.transcript = ''
    this.finalizedSentences.clear()
    this.taskId = this.generateUUID()
    try {
      this.setupWebSocket(callbacks)
    } catch (error) {
      this.finish(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private setupWebSocket(callbacks: SpeechCallbacks): void {
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    // 实际请求中，需要配置代理转发到： wss://nls-gateway-cn-shanghai.aliyuncs.com
    const socketUrl = `${scheme}://${window.location.host}/api/aliyun/ws?token=${this.token}`

    const ws = new WebSocket(socketUrl)
    this.ws = ws

    ws.onopen = () => {
      if (this.ws !== ws || this.phase !== 'starting') return
      // 连接成功后，发送开始识别指令
      const startMessage = {
        header: {
          appkey: this.appKey,
          namespace: 'SpeechTranscriber',
          name: 'StartTranscription',
          task_id: this.taskId,
          message_id: this.generateUUID(),
        },
        payload: {
          format: 'pcm',
          sample_rate: 16000,
          enable_intermediate_result: true,
          enable_punctuation_prediction: true,
          enable_inverse_text_normalization: true,
        },
      }

      try {
        ws.send(JSON.stringify(startMessage))
      } catch (error) {
        this.finish(error instanceof Error ? error : new Error(String(error)))
      }
    }

    ws.onmessage = (event) => {
      if (this.ws !== ws) return
      try {
        const message = JSON.parse(event.data)

        switch (message.header.name) {
          case 'TranscriptionStarted':
            // 服务端准备就绪，开始捕捉和发送音频
            if (this.phase === 'starting') void this.startAudioProcessing(ws, callbacks)
            break
          case 'TranscriptionResultChanged':
            // 中间识别结果
            callbacks.onInterim(this.transcript + (message.payload.result ?? ''))
            break
          case 'SentenceEnd':
            // 句子结束，最终结果
            if (message.payload.result && !this.finalizedSentences.has(message.payload.index)) {
              if (message.payload.index !== undefined) this.finalizedSentences.add(message.payload.index)
              this.transcript += message.payload.result
              callbacks.onFinal(message.payload.result)
            }
            break
          case 'TranscriptionCompleted':
            // 识别完成
            this.finish()
            break
          case 'TaskFailed':
            // 任务失败
            this.finish(new Error(`任务失败: ${message.payload.status_text || '未知错误'}`))
            break
        }
      } catch (error) {
        if (this.ws === ws) this.finish(error instanceof Error ? error : new Error(String(error)))
      }
    }

    ws.onerror = () => {
      if (this.ws === ws) this.finish(new Error('WebSocket 连接发生错误'))
    }

    ws.onclose = () => {
      if (this.ws === ws) this.finish(new Error('WebSocket 在识别完成前关闭'))
    }
  }

  private async startAudioProcessing(ws: WebSocket, callbacks: SpeechCallbacks): Promise<void> {
    try {
      // 获取音频流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (this.ws !== ws || this.phase !== 'starting') {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      this.audioStream = stream

      // 创建音频上下文
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported')
      }
      this.audioContext = new AudioContextClass({ sampleRate: 16000 })

      // 创建脚本处理器
      this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1)

      this.scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0)
        // 转换为16-bit PCM格式
        const pcmData = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(pcmData.buffer)
        }
      }

      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      source.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)
      this.phase = 'recording'
      callbacks.onStart()
    } catch (error) {
      if (this.ws === ws) this.finish(error instanceof Error ? error : new Error('无法启动麦克风或音频处理'))
    }
  }

  private cleanupAudio(): void {
    // 停止音频流
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop())
      this.audioStream = undefined
    }

    // 断开音频处理器
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
      this.scriptProcessor = undefined
    }

    // 关闭音频上下文
    if (this.audioContext) {
      void this.audioContext.close().catch(() => {})
      this.audioContext = undefined
    }
  }

  private finish(error?: Error): void {
    const callbacks = this.callbacks
    if (!callbacks) return
    const transcript = this.transcript
    this.callbacks = undefined
    this.phase = 'idle'
    const ws = this.ws
    this.ws = undefined
    try {
      this.cleanupAudio()
      // 关闭 WebSocket 连接
      if (ws) {
        ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null
        ws.close()
      }
    } catch (reason) {
      error ??= reason instanceof Error ? reason : new Error(String(reason))
    }
    if (error) callbacks.onError(error)
    else callbacks.onEnd(transcript || undefined)
  }

  stop(): void {
    if (!this.callbacks || this.phase === 'stopping') return
    if (this.phase === 'starting') {
      this.finish()
      return
    }
    this.phase = 'stopping'
    try {
      this.cleanupAudio()
      this.ws?.send(
        JSON.stringify({
          header: {
            appkey: this.appKey,
            namespace: 'SpeechTranscriber',
            name: 'StopTranscription',
            task_id: this.taskId,
            message_id: this.generateUUID(),
          },
          payload: {},
        }),
      )
    } catch (error) {
      this.finish(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
