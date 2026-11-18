import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  NgZone,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import type {
  ChatRenderers,
  ChatRuntime,
  ChatUIData,
  TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'
import { SCOPED_MESSAGES, SCOPED_UI } from '../../../web-component-shared/scoped-slots.js'
import { LOCAL_REPLY } from '../../../web-component-shared/data.js'
import { createLocalRuntime } from '../runtime'
import { fromTemplate } from '../shared/template-renderer'
import { ComposerContainerDirective } from '../shared/composer-container.directive'

type Scope<K extends keyof ChatRenderers> = Parameters<NonNullable<ChatRenderers[K]>>[0]

@Component({
  selector: 'demo-scoped-slots-page',
  standalone: true,
  imports: [FormsModule, ComposerContainerDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './scoped-slots.html',
})
export class ScopedSlotsDemoComponent {
  @ViewChild('header', { static: true }) header!: TemplateRef<{ $implicit: Scope<'layout-header'> }>
  @ViewChild('message', { static: true }) message!: TemplateRef<{ $implicit: Scope<'bubble-prefix'> }>
  @ViewChild('actions', { static: true }) actions!: TemplateRef<{ $implicit: Scope<'sender-footer'> }>
  @ViewChild('input', { static: true }) input!: TemplateRef<{ $implicit: Scope<'sender-content'> }>
  @ViewChild('welcome', { static: true }) welcome!: TemplateRef<{ $implicit: { composer: HTMLElement | null } }>
  @ViewChild('status', { static: true }) status!: TemplateRef<{ $implicit: Scope<'bubble-suffix'> }>
  @ViewChild('source', { static: true }) source!: TemplateRef<{ $implicit: Scope<'bubble-content-footer'> }>
  @ViewChild('before', { static: true }) before!: TemplateRef<{ $implicit: Scope<'composer-before'> }>
  @ViewChild('focus', { static: true }) focus!: TemplateRef<{ $implicit: Scope<'sender-footer-right'> }>
  kind = 'chat'
  title = '产品咨询'
  slots = {
    header: true,
    welcome: false,
    prefix: false,
    suffix: false,
    source: false,
    before: false,
    input: false,
    footer: false,
    footerRight: false,
  }
  followup = '请详细说明'
  welcomeTitle = '开始你的产品咨询'
  sourceText = '产品知识库'
  empty = true
  mounted = true
  ui = SCOPED_UI
  data: ChatUIData = { conversation: { title: this.title }, bubble: { messages: SCOPED_MESSAGES } }
  runtime?: ChatRuntime
  renderers: ChatRenderers = {}
  private baseRenderers: ChatRenderers = {}
  private inputRenderer?: ChatRenderers['sender-content']
  private owned?: ReturnType<typeof createLocalRuntime>

  constructor() {
    const owner = { application: inject(ApplicationRef), zone: inject(NgZone) }
    const detector = inject(ChangeDetectorRef)
    afterNextRender(() =>
      owner.zone.run(() => {
        const welcome = fromTemplate(this.welcome, owner)
        this.baseRenderers = {
          'layout-header': fromTemplate(this.header, owner),
          'bubble-prefix': fromTemplate(this.message, owner),
          'bubble-suffix': fromTemplate(this.status, owner),
          'bubble-content-footer': fromTemplate(this.source, owner),
          'composer-before': fromTemplate(this.before, owner),
          'sender-footer-right': fromTemplate(this.focus, owner),
          'sender-footer': fromTemplate(this.actions, owner),
          'layout-empty-state': (scope, lifecycle) => welcome({ composer: scope.renderComposer() }, lifecycle),
        }
        this.inputRenderer = fromTemplate(this.input, owner, (scope, update) => scope.subscribe(update))
        this.updateRenderers()
        detector.detectChanges()
      }),
    )
    this.updateRuntime()
    inject(DestroyRef).onDestroy(() => this.owned?.dispose())
  }
  updateRenderers() {
    this.renderers = {
      'layout-header': this.slots.header ? this.baseRenderers['layout-header'] : undefined,
      'layout-empty-state': this.slots.welcome ? this.baseRenderers['layout-empty-state'] : undefined,
      'bubble-prefix': this.slots.prefix ? this.baseRenderers['bubble-prefix'] : undefined,
      'bubble-suffix': this.slots.suffix ? this.baseRenderers['bubble-suffix'] : undefined,
      'bubble-content-footer': this.slots.source ? this.baseRenderers['bubble-content-footer'] : undefined,
      'composer-before': this.slots.before ? this.baseRenderers['composer-before'] : undefined,
      'sender-content': this.slots.input ? this.inputRenderer : undefined,
      'sender-footer': this.slots.footer ? this.baseRenderers['sender-footer'] : undefined,
      'sender-footer-right': this.slots.footerRight ? this.baseRenderers['sender-footer-right'] : undefined,
    }
  }
  changeTitle(title: string) {
    this.title = title
    this.data = { ...this.data, conversation: { title } }
  }
  changeKind(kind: string) {
    this.kind = kind
    this.updateRuntime()
  }
  toggleMounted() {
    this.mounted = !this.mounted
    this.updateRuntime()
  }
  createConversation(scope: Scope<'layout-header'>) {
    scope.createConversation()
    this.empty = true
  }
  onCreate(event: Event) {
    this.data = { conversation: { title: this.title }, bubble: { messages: [] } }
    ;(event.currentTarget as TrChatUIHTMLElement).clearInput()
    this.empty = true
  }
  onSubmit(event: Event) {
    const [{ text }] = (event as CustomEvent).detail
    const messages = this.data.bubble?.messages ?? []
    this.data = {
      conversation: { title: this.title },
      bubble: {
        messages: [
          ...messages,
          { id: `question-${messages.length}`, role: 'user', content: text },
          { id: `answer-${messages.length}`, role: 'assistant', content: LOCAL_REPLY },
        ],
      },
    }
    ;(event.currentTarget as TrChatUIHTMLElement).clearInput()
    this.empty = false
  }
  private updateRuntime() {
    this.owned?.dispose()
    this.owned = undefined
    this.runtime = undefined
    if (this.mounted && this.kind === 'chat') {
      this.owned = createLocalRuntime()
      this.runtime = this.owned.runtime
      void this.runtime.actions.send({ text: '如何接入聊天组件？' })
    }
  }
}
