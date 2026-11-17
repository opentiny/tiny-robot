import { Component, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { ChatUIOptions } from '@opentiny/tiny-robot-chat/experimental'
import { BASE_UI, ChatDemoComponent } from '../chat-demo.component'

@Component({
  selector: 'demo-props-page',
  standalone: true,
  imports: [FormsModule, ChatDemoComponent],
  templateUrl: './props.html',
})
export class PropsDemoComponent {
  readonly title = signal('我的助手')
  draftTitle = '我的助手'
  readonly header = signal(true)
  readonly empty = signal(false)
  readonly ui = computed<ChatUIOptions>(() => ({ ...BASE_UI, header: this.header() ? undefined : false }))
}
