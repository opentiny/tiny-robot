import { Component, input, output, signal } from '@angular/core'
import type { ChatUIOptions, TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import type { LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import { ChatHostComponent } from './chat-host.component'

export const BASE_UI: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false, surface: { mode: 'normal' } },
  welcome: { title: '你好，欢迎使用', description: '发送一条消息，体验本地回复。' },
  prompts: false,
  model: false,
  mcp: false,
  sender: { mode: 'multiple', placeholder: '输入消息，点击发送', submitType: 'ctrlEnter' },
}

@Component({
  selector: 'demo-chat',
  standalone: true,
  imports: [ChatHostComponent],
  host: { class: 'demo-preview' },
  template: `<div class="demo-preview-bar">
      <strong>真实包 · tr-chat</strong
      ><span class="demo-status" data-testid="ready-state" role="status">{{
        !mounted() ? '已卸载' : ready() ? '已就绪' : '等待 Runtime'
      }}</span>
    </div>
    <div class="demo-chat">
      @if (mounted()) {
        <demo-chat-host
          [title]="title()"
          [ui]="ui()"
          [floatingState]="floatingState()"
          [isEmpty]="isEmpty()"
          [enabled]="enabled()"
          (elementEvent)="onEvent($event)"
        />
      } @else {
        <p class="demo-empty">组件已卸载，可重新挂载。</p>
      }
    </div>
    <section class="demo-card demo-events">
      <h2>DOM 事件</h2>
      <ol data-testid="event-log" aria-live="polite">
        @for (entry of events(); track $index) {
          <li>{{ entry }}</li>
        }
      </ol>
    </section>`,
})
export class ChatDemoComponent {
  readonly elementReady = output<TrChatHTMLElement>()
  readonly title = input('我的助手')
  readonly ui = input<ChatUIOptions>(BASE_UI)
  readonly floatingState = input<LayoutFloatingState | undefined>(undefined)
  readonly isEmpty = input<boolean | undefined>(undefined)
  readonly enabled = input(true)
  readonly mounted = input(true)
  readonly floatingStateChange = output<LayoutFloatingState>()
  readonly ready = signal(false)
  readonly events = signal<string[]>([])
  onEvent(event: Event) {
    const detail = (event as CustomEvent).detail
    this.events.update((previous) => [...previous, `${event.type} ${JSON.stringify(detail)}`])
    if (event.type === 'ready') {
      this.ready.set(true)
      this.elementReady.emit(event.target as TrChatHTMLElement)
    }
    if (event.type === 'floating-state-update') this.floatingStateChange.emit(detail[0])
  }
}
