import { afterNextRender, Component, ElementRef, inject, NgZone, OnDestroy, signal, ViewChild } from '@angular/core'
import {
  defineTrChatElements,
  whenTrChatReady,
  type CreateChatRuntimeOptions,
  type TrChatHTMLElement,
  type TrChatUIHTMLElement,
  type TrChatRenderers,
  type TrChatCommonElementEventMap,
  type ChatSenderRendererContext,
  type ChatEmptyStateRendererContext,
  type ExperimentalRenderer,
} from '@opentiny/tiny-robot-chat/experimental'

/** Add <app-scoped-host ngSkipHydration /> to any Angular 20 host and visit ?scoped. */
@Component({
  selector: 'app-scoped-host',
  standalone: true,
  template: `
    <span hidden data-scoped-placeholder>Composer demo activates after browser render.</span>
    <section class="scoped-demo" [hidden]="!active()" aria-label="Composer integration demo">
      <header>
        <p>Angular 20 · Native public API scoped · 1.0.1 local candidate</p>
        <h1>Custom welcome, native composer</h1>
        <p>
          Scoped buttons edit the native composer. The custom welcome is DOM-rendered; Angular owns the accepted UI
          draft.
        </p>
        <output id="scoped-ready">{{ ready() ? 'Both elements ready' : 'Waiting for browser' }}</output>
      </header>
      <div class="panels">
        <article>
          <h2>Runtime chat</h2>
          <nav aria-label="Runtime composer controls">
            <button id="runtime-replace-welcome" (click)="replaceWelcome('runtime')">Replace welcome</button>
            <button id="runtime-default" (click)="showDefault('runtime')">Default placement</button>
            <button id="runtime-custom" (click)="showCustom('runtime')">Custom welcome</button>
            <button id="runtime-retired" (click)="tryRetired('runtime')">Try retired action</button>
          </nav>
          <div #runtimeMount class="chat-mount"></div>
        </article>
        <article>
          <h2>Presentation chat · Angular controlled draft</h2>
          <nav aria-label="Controlled composer controls">
            <button id="ui-replace-welcome" (click)="replaceWelcome('ui')">Replace welcome</button>
            <button id="ui-default" (click)="showDefault('ui')">Default placement</button>
            <button id="ui-custom" (click)="showCustom('ui')">Custom welcome</button>
            <button id="ui-retired" (click)="tryRetired('ui')">Try retired action</button>
          </nav>
          <div #uiMount class="chat-mount"></div>
        </article>
      </div>
      <footer aria-label="Angular host observations">
        <p>
          Controlled draft: <output id="scoped-draft">{{ draft() }}</output>
        </p>
        <p>
          Last native action: <output id="scoped-action">{{ lastAction() }}</output>
        </p>
        <p>
          Retired scope: <output id="scoped-retired">{{ retiredResult() }}</output>
        </p>
        <p>
          Tool calls: <output id="scoped-tools">{{ toolClicks() }}</output>
        </p>
        <p>
          Scope contract: <output id="scoped-contract">{{ contract() }}</output>
        </p>
        <p>
          Focus result: <output id="scoped-focus">{{ focused() }}</output>
        </p>
        <p>
          DOM property identity: <output id="scoped-identity">{{ identity() }}</output>
        </p>
        <p>
          Sender events: <output id="scoped-events">{{ events().join(' | ') }}</output>
        </p>
        <p>
          Local files received: <output id="scoped-files">{{ files().join(', ') }}</output>
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
      .scoped-demo {
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
        .scoped-demo {
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
          height: 520px;
        }
      }
    `,
  ],
})
export class ScopedComposerHost implements OnDestroy {
  @ViewChild('runtimeMount', { static: true }) runtimeMount!: ElementRef<HTMLDivElement>
  @ViewChild('uiMount', { static: true }) uiMount!: ElementRef<HTMLDivElement>
  readonly active = signal(false)
  readonly ready = signal(false)
  readonly draft = signal('Initial Angular draft')
  readonly focused = signal('Not requested')
  readonly lastAction = signal('No action yet')
  readonly retiredResult = signal('Not requested')
  readonly toolClicks = signal(0)
  readonly contract = signal('DOM-only')
  private readonly scopeByButton = new WeakMap<Element, { context: ChatSenderRendererContext; signal: AbortSignal }>()
  private readonly retired: Partial<
    Record<'runtime' | 'ui', { context: ChatSenderRendererContext; signal: AbortSignal }>
  > = {}
  readonly attachments = [
    { id: 'local-note', name: 'local-note.txt', status: 'success' as const, url: 'data:text/plain,local-note' },
  ]
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
    initialMessages: [],
    storage: {
      loadConversations: () => [],
      loadMessages: () => [],
      saveConversation() {},
      saveMessages() {},
      deleteConversation() {},
    },
    responseProvider: async () => ({
      id: 'angular-scoped-local',
      object: 'chat.completion',
      created: 1,
      model: 'local',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'Local scoped response' },
          delta: undefined,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
    }),
  }
  readonly data: NonNullable<TrChatUIHTMLElement['data']> = {
    bubble: { messages: [] },
    sender: { attachments: this.attachments },
  }
  readonly options: NonNullable<TrChatHTMLElement['ui']> = {
    layout: { leftAside: false, rightAside: false, contentMaxWidth: '100%', panelPadding: 12 },
    prompts: false,
    sender: {
      mode: 'multiple',
      showWordLimit: false,
      toolbar: [
        {
          type: 'custom',
          id: 'tool',
          label: 'Tool',
          onClick: () => this.zone.run(() => this.toolClicks.update((count) => count + 1)),
        },
      ],
    },
  }
  readonly renderers: TrChatRenderers = {
    'sender-actions-inline': this.actionRenderer('insert', 'Insert', 'Inserted'),
    'sender-footer': this.actionRenderer('replace', 'Template', 'Template from DOM renderer'),
    'sender-footer-right': this.actionRenderer('append', 'Append', ' + note'),
    'layout-empty-state': this.welcomeRenderer('Workspace welcome'),
    'layout-header': (context) => {
      const header = document.createElement('strong')
      header.dataset['scopedEmpty'] = String(context.isEmpty)
      header.textContent = context.isEmpty ? 'Welcome selected by Angular' : 'Existing conversation'
      return header
    },
  }

  constructor() {
    afterNextRender(() => {
      if (!new URLSearchParams(location.search).has('scoped') || this.destroyed) return
      defineTrChatElements()
      this.active.set(true)
      const runtime = document.createElement('tr-chat') as TrChatHTMLElement
      const ui = document.createElement('tr-chat-ui') as TrChatUIHTMLElement
      this.runtime = runtime
      this.ui = ui
      runtime.runtimeOptions = this.runtimeOptions
      runtime.attachments = this.attachments
      ui.data = this.data
      ui.inputValue = this.draft()
      for (const [kind, element] of [
        ['runtime', runtime],
        ['ui', ui],
      ] as const) {
        element.id = `scoped-${kind}`
        element.style.cssText = 'display:block;width:100%;height:100%;min-height:0;--tr-layout-height:100%'
        element.ui = this.options
        element.renderers = this.renderers
        const prefix = document.createElement('span')
        prefix.slot = 'input-prefix'
        prefix.textContent = 'Local context'
        prefix.dataset['scopedPrefix'] = kind
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

  private actionRenderer(
    action: 'insert' | 'append' | 'replace',
    label: string,
    value: string,
  ): ExperimentalRenderer<ChatSenderRendererContext> {
    return (context, { signal }) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = label
      button.dataset['scopeAction'] = action
      button.style.cssText =
        'font:inherit;font-size:12px;padding:4px 7px;border:1px solid #a8b9d2;border-radius:6px;background:#eef4ff;color:#244b87;white-space:nowrap'
      button.disabled = context.disabled
      this.scopeByButton.set(button, { context, signal })
      if ('editor' in context) this.zone.run(() => this.contract.set('Unexpected editor'))
      button.addEventListener('mousedown', (event) => event.preventDefault(), { signal })
      button.addEventListener(
        'click',
        () => {
          context[action](value)
          this.zone.run(() => this.lastAction.set(action))
        },
        { signal },
      )
      return button
    }
  }

  private welcomeRenderer(title: string): ExperimentalRenderer<ChatEmptyStateRendererContext> {
    return (context) => {
      const section = document.createElement('section')
      section.dataset['scopedWelcome'] = title
      section.style.cssText =
        'padding:12px;border:1px solid #d8e3f3;border-radius:12px;background:#f8fbff;display:grid;gap:12px'
      const heading = document.createElement('h3')
      heading.textContent = title
      const description = document.createElement('p')
      description.textContent = 'DOM welcome content with the original native composer, attachments and actions.'
      description.style.cssText = 'margin:0;color:#5d6b80;font:13px/1.5 system-ui'
      section.append(heading, description)
      const target = context.renderComposer()
      if (target) section.append(target)
      return section
    }
  }

  replaceWelcome(kind: 'runtime' | 'ui') {
    const element = this[kind]
    if (!element) return
    const button = element.querySelector('[data-scope-action="replace"]')
    if (button) this.retired[kind] = this.scopeByButton.get(button)
    element.renderers = { ...this.renderers, 'layout-empty-state': this.welcomeRenderer('Updated welcome') }
  }
  showDefault(kind: 'runtime' | 'ui') {
    const element = this[kind]
    if (!element) return
    const { ['layout-empty-state']: _welcome, ...renderers } = this.renderers
    element.renderers = renderers
  }
  showCustom(kind: 'runtime' | 'ui') {
    const element = this[kind]
    if (element) element.renderers = this.renderers
  }
  async tryRetired(kind: 'runtime' | 'ui') {
    const scope = this.retired[kind]
    if (!scope) return
    scope.context.replace('Wrong retired draft')
    const focused = await scope.context.focus()
    this.zone.run(() => this.retiredResult.set(`${kind}:aborted=${scope.signal.aborted},focus=${focused}`))
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
