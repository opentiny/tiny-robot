import type {
  SpeechCallbacks,
  SpeechConfig,
  SpeechHandler,
} from '../../../components/src/sender-actions/voice-button/speech.types'

export type Failure = '' | 'throw' | 'reject'
export type Result = { text: string; final: boolean }
export type Event = { name: string; text?: string }

export class ControlledHandler implements SpeechHandler {
  callbacks: SpeechCallbacks[] = []
  stops = 0
  startFailure: Failure = ''
  stopFailure: Failure = ''
  deferred = false
  pendingStarts: { reject: (error: Error) => void }[] = []

  isSupported() {
    return true
  }

  start(callbacks: SpeechCallbacks) {
    this.callbacks.push(callbacks)
    if (this.startFailure === 'throw') throw new Error('start throw')
    if (this.startFailure === 'reject') return Promise.reject(new Error('start reject'))
    if (!this.deferred) callbacks.onStart()
    if (this.deferred) return new Promise<void>((_, reject) => this.pendingStarts.push({ reject }))
  }

  stop() {
    this.stops++
    if (this.stopFailure === 'throw') throw new Error('stop throw')
    if (this.stopFailure === 'reject') return Promise.reject(new Error('stop reject'))
    return Promise.resolve()
  }
}

export class NativeRecognition {
  static instances: NativeRecognition[] = []
  continuous = false
  interimResults = false
  assignments: string[] = []
  stops = 0
  stopFailure: Failure = ''
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null
  private language = 'native-default'

  constructor() {
    NativeRecognition.instances.push(this)
  }
  get lang() {
    return this.language
  }
  set lang(value: string) {
    this.assignments.push(value)
    this.language = value
  }
  start() {
    this.onstart?.()
  }
  stop() {
    this.stops++
    if (this.stopFailure) throw new Error('native stop throw')
  }
  result(results: Result[], resultIndex = 0) {
    this.onresult?.({
      resultIndex,
      results: results.map(({ text, final }) => Object.assign([{ transcript: text }], { isFinal: final })),
    } as unknown as SpeechRecognitionEvent)
  }
}

export interface VoiceFixture {
  start: () => void
  stop: () => void
  emit: (
    name: 'start' | 'interim' | 'final' | 'end' | 'error',
    text?: string,
    session?: number,
    handler?: number,
  ) => void
  result: (results: Result[], resultIndex?: number) => void
  configure: (config: SpeechConfig & { autoInsert?: boolean }) => void
  select: (handler: number | null) => void
  failure: (start: Failure, stop?: Failure) => void
  rejectStart: (session: number) => void
  restartOnEnd: () => void
  hide: () => void
  snapshot: () => {
    content: string
    events: Event[]
    recording: boolean
    starts: number[]
    stops: number[]
    native: {
      lang: string
      assignments: string[]
      continuous: boolean
      interimResults: boolean
      stops: number
      listening: boolean
    }[]
  }
}

declare global {
  interface Window {
    voiceFixture: VoiceFixture
  }
}
