import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  Input,
  NgZone,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  computed,
  signal,
} from '@angular/core'
import type {
  ChatBubbleSlotProps,
  ChatHeaderSlotProps,
  ChatRuntime,
  ChatUIOptions,
  LayoutFloatingState,
} from '@opentiny/tiny-robot-chat'
import type { ChatRenderers } from '@opentiny/tiny-robot-chat/experimental'
import { bubbleRenderers } from './markdown'
import { copyReply, replyText } from './reply-actions'
import { fromTemplate } from './template-renderer'

@Component({
  selector: 'app-floating-assistant',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./floating-assistant.css', './markdown.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './floating-assistant.component.html',
})
export class FloatingAssistantComponent {
  @Input({ required: true }) runtime!: ChatRuntime
  @Input({ required: true }) ui!: ChatUIOptions
  @ViewChild('windowHeader', { static: true }) windowHeader!: TemplateRef<{ $implicit: ChatHeaderSlotProps }>
  @ViewChild('replyActions', { static: true }) replyActions!: TemplateRef<{ $implicit: ChatBubbleSlotProps }>
  @ViewChild('historyPanel', { static: true }) historyPanel!: TemplateRef<object>
  @ViewChild('launcher', { static: true }) launcher!: ElementRef<HTMLButtonElement>
  readonly bubbleRenderers = bubbleRenderers
  readonly replyText = replyText
  readonly copyReply = copyReply
  readonly open = signal(false)
  readonly fullscreen = signal(false)
  readonly historyOpen = signal(false)
  readonly viewport = signal({ width: innerWidth, height: innerHeight })
  query = ''
  editingId?: string
  editTitle = ''
  historyError = ''
  renderers: ChatRenderers = {}
  floatingState: LayoutFloatingState = {
    placement: 'center',
    offsetX: 24,
    offsetY: 24,
    width: Math.min(640, innerWidth - 32),
    height: Math.min(760, innerHeight - 32),
  }
  private savedState?: LayoutFloatingState
  private historyFrame?: number
  headerScope?: ChatHeaderSlotProps
  readonly historyPosition = signal({ left: 0, top: 0, width: 320, maxHeight: 560, zIndex: 1001 })
  readonly chatUI = computed<ChatUIOptions>(() => ({
    ...this.ui,
    history: false,
    welcome: {
      ...this.ui.welcome,
      title: 'TinyRobot',
      description: '你好，我是你的 AI 助手，随时为你解答问题。',
    },
    prompts: { ...this.ui.prompts, wrap: true },
    layout: {
      ...this.ui.layout,
      heightMode: 'parent',
      leftAside: false,
      rightAside: { mode: 'drawer', width: 400 },
      emptyState: 'center',
      composer: { welcome: 'footer' },
      panelPadding: 0,
      panelGap: 0,
      surface: {
        mode: this.open() ? 'floating' : 'normal',
        floatingOptions: {
          draggable: !this.fullscreen(),
          resizable: !this.fullscreen(),
          minWidth: this.fullscreen() ? undefined : Math.min(360, this.viewport().width - 32),
          minHeight: this.fullscreen() ? undefined : Math.min(480, this.viewport().height - 32),
        },
      },
    },
  }))
  constructor() {
    const owner = { application: inject(ApplicationRef), zone: inject(NgZone) }
    const detector = inject(ChangeDetectorRef)
    const destroy = inject(DestroyRef)
    afterNextRender(() =>
      owner.zone.run(() => {
        const actions = fromTemplate(this.replyActions, owner)
        const header = fromTemplate(this.windowHeader, owner)
        const historyView = this.historyPanel.createEmbeddedView({})
        const portal = document.createElement('div')
        portal.style.display = 'contents'
        owner.application.attachView(historyView)
        historyView.detectChanges()
        portal.append(...historyView.rootNodes)
        document.body.append(portal)
        destroy.onDestroy(() => {
          if (this.historyFrame !== undefined) cancelAnimationFrame(this.historyFrame)
          if (!historyView.destroyed) {
            owner.application.detachView(historyView)
            historyView.destroy()
          }
          portal.remove()
        })
        this.renderers = {
          'layout-header': (scope, lifecycle) => {
            if (destroy.destroyed) return null
            this.headerScope = scope
            historyView.detectChanges()
            this.placeHistory()
            return header(scope, lifecycle)
          },
          'bubble-after': (scope, lifecycle) => (replyText(scope) ? actions(scope, lifecycle) : null),
        }
        detector.detectChanges()
      }),
    )
  }
  updateFloatingState(event: Event) {
    this.floatingState = (event as CustomEvent<[LayoutFloatingState]>).detail[0]
    this.placeHistory()
  }
  close() {
    this.historyOpen.set(false)
    this.open.set(false)
    requestAnimationFrame(() => this.launcher.nativeElement.focus())
  }
  toggleMode() {
    if (!this.fullscreen()) {
      this.savedState = { ...this.floatingState }
      this.floatingState = { placement: 'top-left', offsetX: 0, offsetY: 0, width: innerWidth, height: innerHeight }
    } else if (this.savedState) {
      this.floatingState = {
        ...this.savedState,
        width: Math.min(this.savedState.width ?? 640, innerWidth - 32),
        height: Math.min(this.savedState.height ?? 760, innerHeight - 32),
      }
    }
    this.fullscreen.set(!this.fullscreen())
    this.placeHistory()
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.assistant-mode-toggle')?.focus())
  }
  toggleHistory() {
    this.placeHistory()
    this.historyOpen.set(!this.historyOpen())
    this.query = ''
    this.editingId = undefined
    this.historyError = ''
    if (this.historyOpen())
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>('.assistant-history input[type=search]')?.focus(),
      )
  }
  closeHistory() {
    this.historyOpen.set(false)
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.assistant-history-trigger')?.focus())
  }
  historyItems(scope: ChatHeaderSlotProps) {
    return (scope.conversation.items ?? []).filter((item) => (item.title || '未命名会话').includes(this.query.trim()))
  }
  startRename(id: string, title: string) {
    this.editingId = id
    this.editTitle = title
    requestAnimationFrame(() =>
      document.querySelector<HTMLInputElement>('.assistant-history input[aria-label="会话标题"]')?.focus(),
    )
  }
  async historyAction(action: 'switch' | 'rename' | 'delete', id: string) {
    this.historyError = ''
    try {
      if (action === 'switch') {
        await this.runtime.actions.switchConversation(id)
        this.closeHistory()
      }
      if (action === 'rename') {
        if (!this.editTitle.trim()) return
        await this.runtime.actions.renameConversation(id, this.editTitle.trim())
        this.editingId = undefined
      }
      if (action === 'delete') await this.runtime.actions.deleteConversation(id)
    } catch {
      this.historyError = '会话操作失败，请重试。'
    }
  }
  private placeHistory() {
    if (this.historyFrame !== undefined) cancelAnimationFrame(this.historyFrame)
    this.historyFrame = requestAnimationFrame(() => {
      const header = document.querySelector<HTMLElement>('.assistant-window-header')
      const surface = header?.closest<HTMLElement>('.tr-layout--floating')
      if (!header || !surface) return
      const rect = header.getBoundingClientRect()
      const bottom = Math.min(innerHeight, surface.getBoundingClientRect().bottom)
      const width = Math.min(320, rect.width - 24)
      this.historyPosition.set({
        left: rect.right - width - 12,
        top: rect.bottom + 8,
        width,
        maxHeight: Math.max(0, Math.min(560, bottom - rect.bottom - 24)),
        zIndex: (Number.parseInt(getComputedStyle(surface).zIndex) || 1000) + 1,
      })
    })
  }
  @HostListener('window:resize') resize() {
    this.placeHistory()
    this.viewport.set({ width: innerWidth, height: innerHeight })
    if (this.fullscreen())
      this.floatingState = { placement: 'top-left', offsetX: 0, offsetY: 0, width: innerWidth, height: innerHeight }
  }
  @HostListener('window:keydown', ['$event']) keydown(event: KeyboardEvent) {
    if (!this.open() || event.key !== 'Escape') return
    if (this.historyOpen()) this.closeHistory()
    else if (this.fullscreen()) this.toggleMode()
  }
  @HostListener('window:pointerdown', ['$event']) outside(event: PointerEvent) {
    if (
      this.historyOpen() &&
      event.target instanceof Element &&
      !event.target.closest('.assistant-window-header, .assistant-history')
    )
      this.historyOpen.set(false)
  }
}
