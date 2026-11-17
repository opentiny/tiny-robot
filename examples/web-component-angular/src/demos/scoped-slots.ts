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
  kind = 'chat'
  title = '产品咨询'
  custom = true
  customInput = false
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
          'sender-footer': fromTemplate(this.actions, owner),
          'layout-empty-state': (scope, lifecycle) => welcome({ composer: scope.renderComposer() }, lifecycle),
        }
        this.inputRenderer = fromTemplate(this.input, owner, (scope, update) => scope.subscribe(update))
        this.updateRenderers()
        detector.detectChanges()
      }),
    )
    this.updateRuntime()
    inject(DestroyRef).onDestroy(() => this.owned?.release())
  }
  updateRenderers() {
    this.renderers = { ...this.baseRenderers, 'sender-content': this.customInput ? this.inputRenderer : undefined }
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
    this.owned?.release()
    this.owned = undefined
    this.runtime = undefined
    if (this.mounted && this.kind === 'chat') {
      this.owned = createLocalRuntime()
      this.runtime = this.owned.runtime
      void this.runtime.actions.send({ text: '如何接入聊天组件？' })
    }
  }
}
