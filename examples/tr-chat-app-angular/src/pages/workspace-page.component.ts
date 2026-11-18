import { Component, Input } from '@angular/core'
import type { ChatRuntime, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { FloatingAssistantComponent } from '../chat/floating-assistant.component'

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [FloatingAssistantComponent],
  templateUrl: './workspace-page.component.html',
  host: { class: 'page-host' },
})
export class WorkspacePageComponent {
  @Input({ required: true }) runtime!: ChatRuntime
  @Input({ required: true }) ui!: ChatUIOptions
}
