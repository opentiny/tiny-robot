import type { SpeechCallbacks, SpeechHandler } from '@opentiny/tiny-robot'

export class MockSpeechHandler implements SpeechHandler {
  private timer?: ReturnType<typeof setInterval>
  private callbacks?: SpeechCallbacks
  private transcript = ''

  start(callbacks: SpeechCallbacks): void {
    this.stop()
    this.callbacks = callbacks
    this.transcript = ''
    callbacks.onStart()
    if (this.callbacks !== callbacks) return

    let step = 0
    const sentences = ['你好', '你好', '这是第二句话。']

    this.timer = setInterval(() => {
      const sentence = sentences[Math.floor(step / 2)]
      if (step % 2 === 0) {
        callbacks.onInterim(this.transcript + sentence.slice(0, 1))
      } else {
        this.transcript += sentence
        callbacks.onFinal(sentence)
      }
      step += 1
      if (step === sentences.length * 2 && this.callbacks === callbacks) this.stop()
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
    return true
  }
}
