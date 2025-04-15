interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
  emma?: Document
}

interface SpeechRecognitionErrorEvent extends Event {
  error:
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported'
  message: string
}

interface SpeechRecognition extends EventTarget {
  // 属性
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  serviceURI: string

  // 事件处理器
  onend: (this: SpeechRecognition, ev: Event) => void
  onerror: (ev: SpeechRecognitionErrorEvent) => void
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => void
  onstart: (this: SpeechRecognition, ev: Event) => void

  // 方法
  start(): void
  stop(): void
  abort(): void
}

// 声明全局变量
declare let SpeechRecognition: {
  new (): SpeechRecognition
  prototype: SpeechRecognition
}
