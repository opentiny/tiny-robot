import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  NgZone,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import type { ChatBubbleSlotProps, ChatRuntime, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import type { ChatRenderers } from '@opentiny/tiny-robot-chat/experimental'
import { bubbleRenderers } from '../chat/markdown'
import { copyReply, replyText } from '../chat/reply-actions'
import { fromTemplate } from '../chat/template-renderer'

@Component({
  selector: 'app-chat-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../chat/markdown.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './chat-page.component.html',
  host: { class: 'page-host' },
})
export class ChatPageComponent {
  @Input({ required: true }) runtime!: ChatRuntime
  @Input({ required: true }) ui!: ChatUIOptions
  @ViewChild('replyActions', { static: true }) replyActions!: TemplateRef<{ $implicit: ChatBubbleSlotProps }>
  readonly bubbleRenderers = bubbleRenderers
  readonly replyText = replyText
  readonly copyReply = copyReply
  renderers: ChatRenderers = {}
  constructor() {
    const owner = { application: inject(ApplicationRef), zone: inject(NgZone) }
    const detector = inject(ChangeDetectorRef)
    afterNextRender(() =>
      owner.zone.run(() => {
        const actions = fromTemplate(this.replyActions, owner)
        this.renderers = { 'bubble-after': (scope, lifecycle) => (replyText(scope) ? actions(scope, lifecycle) : null) }
        detector.detectChanges()
      }),
    )
  }
}
