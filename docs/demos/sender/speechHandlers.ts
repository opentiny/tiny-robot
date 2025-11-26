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

  start(callbacks: SpeechCallbacks): void {
    // 立即触发开始
    callbacks.onStart()

    // 模拟识别过程
    let step = 0
    const steps = ['正在', '正在识别', '正在识别语音', '正在识别语音内容']

    this.timer = setInterval(() => {
      if (step < steps.length) {
        callbacks.onInterim(steps[step])
        step++
      } else {
        // 完成识别
        const finalResult = '这是一个模拟的语音识别结果'
        callbacks.onFinal(finalResult)

        callbacks.onEnd()

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
  private appKey: string = 'your_app_key'
  private token: string = 'your_token'

  private closeRecorder(): void {
    if (this.recorder) {
      this.recorder.close()
      this.recorder = undefined
    }
  }

  private async processWithAliyunAPI(audioBlob: Blob): Promise<void> {
    if (!this.callbacks) return

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

      if (result.status === 20000000 && result.result) {
        const transcript = result.result
        this.callbacks.onFinal(transcript)
        this.callbacks.onEnd(transcript)
      } else {
        throw new Error(result.message || `识别失败，状态码: ${result.status}`)
      }
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error : new Error('阿里云语音识别失败'))
    }
  }

  async start(callbacks: SpeechCallbacks): Promise<void> {
    this.callbacks = callbacks

    try {
      this.recorder = TypedRecorder({
        type: 'pcm',
        sampleRate: 16000,
        bitRate: 16,
      })

      this.recorder.open(
        () => {
          this.recorder?.start()
          callbacks.onStart()
        },
        (msg: string, isUserNotAllow: boolean) => {
          const errorMsg = isUserNotAllow ? `用户拒绝了麦克风权限: ${msg}` : `无法打开麦克风: ${msg}`
          callbacks.onError(new Error(errorMsg))
        },
      )
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('阿里云语音服务启动失败'))
    }
  }

  async stop(): Promise<void> {
    if (!this.recorder) {
      return
    }

    this.recorder.stop(
      (blob: Blob, duration: number) => {
        console.log(`录音成功，格式: ${blob.type}，时长: ${duration}ms`, blob)
        this.processWithAliyunAPI(blob)
        this.closeRecorder()
      },
      (msg: string) => {
        this.callbacks?.onError(new Error(`录音失败: ${msg}`))
        this.closeRecorder()
      },
    )
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
    if (!this.isSupported()) {
      callbacks.onError(new Error('当前浏览器不支持实时语音识别所需的功能'))
      return
    }

    this.callbacks = callbacks
    this.setupWebSocket()
  }

  private setupWebSocket(): void {
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
    // 实际请求中，需要配置代理转发到： wss://nls-gateway-cn-shanghai.aliyuncs.com
    const socketUrl = `${scheme}://${window.location.host}/api/aliyun/ws?token=${this.token}`

    this.ws = new WebSocket(socketUrl)

    this.ws.onopen = () => {
      // 连接成功后，发送开始识别指令
      const startMessage = {
        header: {
          appkey: this.appKey,
          namespace: 'SpeechTranscriber',
          name: 'StartTranscription',
          task_id: this.generateUUID(),
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

      this.ws?.send(JSON.stringify(startMessage))
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.header.name) {
        case 'TranscriptionStarted':
          // 服务端准备就绪，开始捕捉和发送音频
          this.callbacks?.onStart()
          this.startAudioProcessing()
          break
        case 'TranscriptionResultChanged':
          // 中间识别结果
          if (message.payload.result) {
            this.callbacks?.onInterim(message.payload.result)
          }
          break
        case 'SentenceEnd':
          // 句子结束，最终结果
          if (message.payload.result) {
            this.callbacks?.onFinal(message.payload.result)
          }
          break
        case 'TranscriptionCompleted':
          // 识别完成
          this.callbacks?.onEnd()
          break
        case 'TaskFailed':
          // 任务失败
          this.callbacks?.onError(new Error(`任务失败: ${message.payload.status_text || '未知错误'}`))
          this.cleanup()
          break
      }
    }

    this.ws.onerror = () => {
      this.callbacks?.onError(new Error('WebSocket 连接发生错误'))
      this.cleanup()
    }

    this.ws.onclose = () => {
      this.cleanup()
    }
  }

  private async startAudioProcessing(): Promise<void> {
    try {
      // 获取音频流
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

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
    } catch (error) {
      this.callbacks?.onError(error instanceof Error ? error : new Error('无法启动麦克风或音频处理'))
      this.cleanup()
    }
  }

  stop(): void {
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
      this.audioContext.close()
      this.audioContext = undefined
    }

    // 关闭 WebSocket 连接
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close()
    }
    this.ws = undefined
  }
}
