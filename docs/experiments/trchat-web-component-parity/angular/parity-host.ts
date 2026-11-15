import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy, signal, ViewChild } from '@angular/core'
import {
  defineTrChatElements,
  whenTrChatReady,
  type CreateChatRuntimeOptions,
  type TrChatHTMLElement,
  type TrChatUIHTMLElement,
  type TrChatRenderers,
  type TrChatCommonElementEventMap,
} from '@opentiny/tiny-robot-chat/experimental'

/** Add <app-parity-host ngSkipHydration /> to any Angular 20 host and visit ?parity. */
@Component({
  selector: 'app-parity-host',
  standalone: true,
  template: `
    <span hidden data-parity-placeholder>Composer demo activates after browser render.</span>
    <section class="parity-demo" [hidden]="!active()" aria-label="Composer integration demo">
      <header>
        <p>Angular 20 · Native public API parity · 1.0.1 local candidate</p>
        <h1>Host-owned composer integration</h1>
        <p>Prepare a draft, focus the editor, or drop/paste a local file. UI drafts are controlled by Angular.</p>
        <output id="parity-ready">{{ ready() ? 'Both elements ready' : 'Waiting for browser' }}</output>
      </header>
      <div class="panels">
        <article>
          <h2>Runtime chat</h2>
          <nav aria-label="Runtime composer controls">
            <button id="runtime-set" (click)="runtime?.setInputValue('Runtime draft from Angular')">
              Prepare draft
            </button>
            <button id="runtime-clear" (click)="runtime?.clearInput()">Clear</button>
            <button id="runtime-focus" (click)="focus('runtime')">Focus</button>
            <button id="runtime-empty" (click)="empty('runtime', true)">Welcome</button>
            <button id="runtime-auto" (click)="empty('runtime', undefined)">Auto</button>
            <button id="runtime-false" (click)="empty('runtime', false)">Conversation</button>
          </nav>
          <div #runtimeMount class="chat-mount"></div>
        </article>
        <article>
          <h2>Presentation chat · Angular controlled draft</h2>
          <nav aria-label="Controlled composer controls">
            <button id="ui-set" (click)="ui?.setInputValue('Controlled draft from Angular')">Prepare draft</button>
            <button id="ui-clear" (click)="ui?.clearInput()">Clear</button>
            <button id="ui-focus" (click)="focus('ui')">Focus</button>
            <button id="ui-empty" (click)="empty('ui', true)">Welcome</button>
            <button id="ui-auto" (click)="empty('ui', undefined)">Auto</button>
            <button id="ui-false" (click)="empty('ui', false)">Conversation</button>
          </nav>
          <div #uiMount class="chat-mount"></div>
        </article>
      </div>
      <footer aria-label="Angular host observations">
        <p>
          Controlled draft: <output id="parity-draft">{{ draft() }}</output>
        </p>
        <p>
          Focus result: <output id="parity-focus">{{ focused() }}</output>
        </p>
        <p>
          DOM property identity: <output id="parity-identity">{{ identity() }}</output>
        </p>
        <p>
          Sender events: <output id="parity-events">{{ events().join(' | ') }}</output>
        </p>
        <p>
          Local files received: <output id="parity-files">{{ files().join(', ') }}</output>
        </p>
      </footer>
    </section>
  `,
  styles: [
    `
      :host {
        font:
          14px/1.45 system-ui,
          sans-serif;
        color: #20314d;
      }
      [hidden] {
        display: none !important;
      }
      .parity-demo {
        position: fixed;
        inset: 0;
        z-index: 10000;
        overflow: auto;
        background: #eef3fa;
        padding: 24px;
        box-sizing: border-box;
      }
      header,
      footer {
        max-width: 1360px;
        margin: 0 auto 16px;
      }
      h1 {
        font-size: 28px;
        margin: 6px 0;
      }
      h2 {
        font-size: 17px;
        margin: 0 0 12px;
      }
      .panels {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        max-width: 1360px;
        margin: 0 auto 16px;
      }
      article {
        min-width: 0;
        padding: 16px;
        border: 1px solid #cbd7e7;
        border-radius: 14px;
        background: white;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-bottom: 12px;
      }
      button {
        font: inherit;
        padding: 7px 10px;
        background: #244b87;
        color: white;
        border: 0;
        border-radius: 7px;
        cursor: pointer;
      }
      .chat-mount {
        height: 480px;
        border: 1px solid #e0e7ef;
        border-radius: 9px;
        overflow: hidden;
      }
      footer {
        padding: 12px;
        box-sizing: border-box;
        background: white;
        border: 1px solid #cbd7e7;
        border-radius: 12px;
      }
      footer p {
        margin: 5px 0;
        overflow-wrap: anywhere;
      }
      output {
        font-weight: 600;
      }
      @media (max-width: 700px) {
        .parity-demo {
          padding: 12px;
        }
        .panels {
          grid-template-columns: 1fr;
        }
        h1 {
          font-size: 23px;
        }
        article {
          padding: 12px;
        }
        .chat-mount {
          height: 380px;
        }
      }
    `,
  ],
})
export class ParityHost implements OnDestroy {
  @ViewChild('runtimeMount', { static: true }) runtimeMount!: ElementRef<HTMLDivElement>
  @ViewChild('uiMount', { static: true }) uiMount!: ElementRef<HTMLDivElement>
  readonly active = signal(false)
  readonly ready = signal(false)
  readonly draft = signal('Initial Angular draft')
  readonly focused = signal('Not requested')
  readonly identity = signal('Waiting')
  readonly events = signal<string[]>([])
  readonly files = signal<string[]>([])
  runtime?: TrChatHTMLElement
  ui?: TrChatUIHTMLElement
  private readonly zone = inject(NgZone)
  private readonly listeners = new AbortController()
  private destroyed = false
  readonly runtimeOptions: CreateChatRuntimeOptions = {
    autoSaveMessages: false,
    initialMessages: [{ role: 'assistant', content: 'Existing runtime conversation' }],
    storage: {
      loadConversations: () => [],
      loadMessages: () => [],
      saveConversation() {},
      saveMessages() {},
      deleteConversation() {},
    },
    responseProvider: async () => ({
      id: 'angular-parity-local',
      object: 'chat.completion',
      created: 1,
      model: 'local',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'Local parity response' },
          delta: undefined,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
    }),
  }
  readonly data: NonNullable<TrChatUIHTMLElement['data']> = {
    bubble: { messages: [{ role: 'assistant', content: 'Existing presentation conversation' }] },
  }
  readonly options: NonNullable<TrChatHTMLElement['ui']> = {
    layout: { leftAside: false, rightAside: false, contentMaxWidth: '100%', panelPadding: 12 },
    prompts: false,
  }
  readonly renderers: TrChatRenderers = {
    'layout-header': (context) => {
      const header = document.createElement('strong')
      header.dataset['parityEmpty'] = String(context.isEmpty)
      header.textContent = context.isEmpty ? 'Welcome selected by Angular' : 'Existing conversation'
      return header
    },
  }

  constructor() {
    afterNextRender(() => {
      if (!new URLSearchParams(location.search).has('parity') || this.destroyed) return
      defineTrChatElements()
      this.active.set(true)
      const runtime = document.createElement('tr-chat') as TrChatHTMLElement
      const ui = document.createElement('tr-chat-ui') as TrChatUIHTMLElement
      this.runtime = runtime
      this.ui = ui
      runtime.runtimeOptions = this.runtimeOptions
      ui.data = this.data
      ui.inputValue = this.draft()
      for (const [kind, element] of [
        ['runtime', runtime],
        ['ui', ui],
      ] as const) {
        element.id = `parity-${kind}`
        element.style.cssText = 'display:block;width:100%;height:100%;min-height:0;--tr-layout-height:100%'
        element.ui = this.options
        element.renderers = this.renderers
        const prefix = document.createElement('span')
        prefix.slot = 'input-prefix'
        prefix.textContent = 'Local context'
        prefix.dataset['parityPrefix'] = kind
        element.append(prefix)
        this.bindSender(kind, element)
      }
      ui.addEventListener(
        'input-value-update',
        (event) =>
          this.zone.run(() => {
            this.draft.set(event.detail)
            ui.inputValue = this.draft()
          }),
        { signal: this.listeners.signal },
      )
      this.runtimeMount.nativeElement.append(runtime)
      this.uiMount.nativeElement.append(ui)
      this.identity.set(
        String(
          runtime.runtimeOptions === this.runtimeOptions &&
            ui.data === this.data &&
            runtime.renderers === this.renderers &&
            ui.ui === this.options,
        ),
      )
      void Promise.all([whenTrChatReady(runtime), whenTrChatReady(ui)]).then(async () => {
        if (this.destroyed) return
        await runtime.getRuntime()?.actions.createConversation()
        this.zone.run(() => this.ready.set(true))
      })
    })
  }

  async focus(kind: 'runtime' | 'ui') {
    const focused = await this[kind]?.focusInput()
    this.zone.run(() => this.focused.set(`${kind}:${focused}`))
  }
  empty(kind: 'runtime' | 'ui', value: boolean | undefined) {
    const element = this[kind]
    if (element) element.isEmpty = value
  }

  private bindSender(kind: string, element: HTMLElement) {
    const record = (name: string, event: DragEvent | ClipboardEvent) =>
      this.zone.run(() => {
        event.preventDefault()
        this.events.update((events) => [...events, `${kind}:${name}`])
        const data = event instanceof DragEvent ? event.dataTransfer : event.clipboardData
        if (data?.files.length) this.files.update((files) => [...files, ...Array.from(data.files, (file) => file.name)])
      })
    for (const name of ['sender-drag-enter', 'sender-drag-over', 'sender-drag-leave', 'sender-drop'] as const) {
      element.addEventListener(
        name,
        (event) => record(name, (event as TrChatCommonElementEventMap[typeof name]).detail.event),
        { signal: this.listeners.signal },
      )
    }
    element.addEventListener(
      'sender-paste',
      (event) => record('sender-paste', (event as TrChatCommonElementEventMap['sender-paste']).detail),
      {
        signal: this.listeners.signal,
      },
    )
  }
  ngOnDestroy() {
    this.destroyed = true
    this.listeners.abort()
    this.runtime?.remove()
    this.ui?.remove()
  }
}
