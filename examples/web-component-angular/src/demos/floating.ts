import { Component, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { ChatUIOptions } from '@opentiny/tiny-robot-chat/experimental'
import type { LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import { INITIAL_FLOATING } from '../../../web-component-shared/data.js'
import { BASE_UI, ChatDemoComponent } from '../chat-demo.component'

@Component({
  selector: 'demo-floating-page',
  standalone: true,
  imports: [FormsModule, ChatDemoComponent],
  templateUrl: './floating.html',
})
export class FloatingDemoComponent {
  readonly floating = signal(true)
  readonly state = signal<LayoutFloatingState>({ ...INITIAL_FLOATING })
  placement: LayoutFloatingState['placement'] = 'bottom-right'
  width = 500
  height = 400
  offsetX = 24
  offsetY = 24
  readonly ui = computed<ChatUIOptions>(() => ({
    ...BASE_UI,
    layout: { ...BASE_UI.layout, surface: { mode: this.floating() ? 'floating' : 'normal' } },
  }))
  apply() {
    this.state.set({
      placement: this.placement,
      width: this.width,
      height: this.height,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    })
  }
}
