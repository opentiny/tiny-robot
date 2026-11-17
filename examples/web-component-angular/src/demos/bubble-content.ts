import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  NgZone,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import type {
  ChatBubbleContentRendererContext,
  ChatBubbleContentRendererMatch,
  ChatBubbleRenderers,
  ChatUIData,
  ChatUIOptions,
} from '@opentiny/tiny-robot-chat/experimental'
import { BUBBLE_UI, bubbleMessages } from '../../../web-component-shared/bubble-content.js'
import { fromTemplate } from '../shared/template-renderer'

@Component({
  selector: 'demo-bubble-content-page',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bubble-content.html',
})
export class BubbleContentDemoComponent {
  @ViewChild('product', { static: true }) product!: TemplateRef<{ $implicit: ChatBubbleContentRendererContext }>
  @ViewChild('quote', { static: true }) quote!: TemplateRef<{ $implicit: ChatBubbleContentRendererContext }>
  @ViewChild('fallback', { static: true }) fallback!: TemplateRef<{ $implicit: ChatBubbleContentRendererContext }>
  title = '智能助手'
  revision = 0
  mounted = true
  productEnabled = true
  quoteEnabled = false
  fallbackEnabled = false
  split = false
  fail = false
  lastEvent = '尚未选择产品'
  lastState = ''
  error = ''
  ui: ChatUIOptions = BUBBLE_UI
  data: ChatUIData = { conversation: { title: '产品建议' }, bubble: { messages: bubbleMessages() } }
  renderers: ChatBubbleRenderers = {}
  private productState: Record<string, unknown> = {}
  private productRenderer?: NonNullable<ChatBubbleRenderers['fallbackContentRenderer']>
  private quoteRenderer?: NonNullable<ChatBubbleRenderers['fallbackContentRenderer']>
  private fallbackRenderer?: NonNullable<ChatBubbleRenderers['fallbackContentRenderer']>
  private failedRenderer = () => {
    throw new Error('产品卡片渲染失败')
  }
  constructor() {
    const owner = { application: inject(ApplicationRef), zone: inject(NgZone) }
    const detector = inject(ChangeDetectorRef)
    afterNextRender(() =>
      owner.zone.run(() => {
        this.productRenderer = fromTemplate(this.product, owner)
        this.quoteRenderer = fromTemplate(this.quote, owner)
        this.fallbackRenderer = fromTemplate(this.fallback, owner)
        this.configure()
        detector.detectChanges()
      }),
    )
  }
  configure() {
    this.ui = {
      ...BUBBLE_UI,
      bubble: { bubbleList: { ...BUBBLE_UI.bubble.bubbleList, contentRenderMode: this.split ? 'split' : 'single' } },
    }
    const contentRendererMatches: ChatBubbleContentRendererMatch[] = []
    if (this.productEnabled && this.productRenderer)
      contentRendererMatches.push({
        find: (_message, content) => content.type === 'product-card',
        renderer: this.fail ? this.failedRenderer : this.productRenderer,
      })
    if (this.quoteEnabled && this.quoteRenderer)
      contentRendererMatches.push({
        find: (_message, content) => content.type === 'business-quote',
        renderer: this.quoteRenderer,
      })
    this.renderers = {
      contentRendererMatches,
      fallbackContentRenderer: this.fallbackEnabled ? this.fallbackRenderer : undefined,
    }
  }
  updateData() {
    this.data = {
      conversation: { title: '产品建议' },
      bubble: {
        messages: bubbleMessages(this.title, this.revision).map((message) =>
          message.id === 'product' ? { ...message, state: this.productState } : message,
        ),
      },
    }
  }
  append() {
    this.revision++
    this.updateData()
  }
  select(scope: ChatBubbleContentRendererContext) {
    scope.emit({ name: 'product-select', payload: { title: scope.content.title } })
    scope.setState('selected', true)
  }
  onEvent(event: Event) {
    const [detail] = (event as CustomEvent).detail
    if (detail.name === 'product-select') this.lastEvent = JSON.stringify(detail)
  }
  onState(event: Event) {
    const [detail] = (event as CustomEvent).detail
    this.lastState = JSON.stringify(detail)
    this.productState = { ...this.productState, [detail.key]: detail.value }
    this.updateData()
  }
  onError(event: Event) {
    this.error = (event as CustomEvent).detail[0].name
  }
}
