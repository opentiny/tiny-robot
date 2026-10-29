import type { SpeechCallbacks, SpeechHandler } from '@opentiny/tiny-robot'

export class MockSpeechHandler implements SpeechHandler {
  private timer?: ReturnType<typeof setInterval>

  start(callbacks: SpeechCallbacks): void {
    this.stop()
    callbacks.onStart()

    let step = 0
    const interimResults = ['正在', '正在识别', '正在识别语音', '正在识别语音内容']

    this.timer = setInterval(() => {
      const interimResult = interimResults[step]
      if (interimResult) {
        callbacks.onInterim(interimResult)
        step += 1
        return
      }

      callbacks.onFinal('这是一个模拟的语音识别结果')
      callbacks.onEnd()
      this.stop()
    }, 500)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  isSupported(): boolean {
    return true
  }
}
